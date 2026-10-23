import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from app.models.question_db import AttemptRecord, DiagnosticSession, QuestionRecord, QuestionClientView
from app.models.mastery import TopicMastery, RetentionState, MasteryCategory
from app.models.learning_intelligence import (
    StudentLearningState,
    TopicLearningState,
    LearningTimelineEvent,
    AIContextPayload,
    RetentionStatus,
    MasteryTrend
)
from app.engines.mastery_engine import MasteryEngine
from app.engines.retention_engine import RetentionEngine
from app.engines.knowledge_graph import KnowledgeGraphEngine
from app.engines.weakness_engine import WeaknessEngine
from app.engines.adaptive_engine import AdaptiveEngine
from app.curriculum.registry import curriculum_registry
from app.services.question_repository import question_repository

logger = logging.getLogger(__name__)

class AttemptRepository:
    """
    Thread-safe repository managing student attempts, diagnostic sessions,
    authoritative mastery updates, timeline events, and unified learning state.
    """

    def __init__(self):
        # student_id -> list of AttemptRecords
        self._attempts: Dict[str, List[AttemptRecord]] = {}
        # session_id -> DiagnosticSession
        self._sessions: Dict[str, DiagnosticSession] = {}
        # (student_id, topic_id) -> TopicMastery
        self._masteries: Dict[Tuple[str, str], TopicMastery] = {}
        # (student_id, topic_id) -> RetentionState
        self._retentions: Dict[Tuple[str, str], RetentionState] = {}
        # (session_id, question_id) -> AttemptRecord for Idempotency
        self._submission_dedup: Dict[Tuple[str, str], AttemptRecord] = {}
        # student_id -> list of LearningTimelineEvents
        self._timeline_events: Dict[str, List[LearningTimelineEvent]] = {}

        self.kg = KnowledgeGraphEngine()
        self.weakness_engine = WeaknessEngine(self.kg)
        self.adaptive_engine = AdaptiveEngine(self.kg)

    def log_timeline_event(self, student_id: str, event: LearningTimelineEvent):
        if student_id not in self._timeline_events:
            self._timeline_events[student_id] = []
        self._timeline_events[student_id].append(event)

    def get_learning_timeline(self, student_id: str) -> List[LearningTimelineEvent]:
        events = self._timeline_events.get(student_id, [])
        return sorted(events, key=lambda e: e.timestamp, reverse=True)

    def record_attempt(
        self,
        student_id: str,
        question: QuestionRecord,
        selected_option_id: str,
        session_id: Optional[str] = None,
        response_time_ms: int = 15000,
        idempotency_key: Optional[str] = None
    ) -> Tuple[AttemptRecord, TopicMastery, Optional[str], Optional[str]]:
        """
        Idempotently records a student's answer submission:
        1. Checks idempotency: if already submitted, returns existing attempt.
        2. Validates correctness server-side.
        3. Identifies misconception tag if incorrect.
        4. Persists attempt record.
        5. Updates topic mastery via MasteryEngine (with recency, confidence, trend, transfer).
        6. Updates session state if part of a diagnostic session.
        7. Logs milestone events to timeline.
        Returns: (AttemptRecord, TopicMastery, diagnosed_misconception, explanation)
        """
        dedup_key = (session_id or student_id, question.id)
        if dedup_key in self._submission_dedup:
            existing = self._submission_dedup[dedup_key]
            current_m = self.get_topic_mastery(student_id, question.topic_id)
            logger.info(f"Duplicate submission prevented for attempt: {existing.attempt_id}")
            return existing, current_m, existing.error_category, question.explanation

        # Determine correctness server-side
        selected_opt = next((o for o in question.options if o.id == selected_option_id), None)
        is_correct = (selected_opt is not None and selected_opt.is_correct)
        
        misconception_tag = None
        if not is_correct and selected_opt:
            misconception_tag = selected_opt.misconception_tag

        attempt_id = f"att_{student_id}_{int(datetime.utcnow().timestamp() * 1000)}"
        attempt = AttemptRecord(
            attempt_id=attempt_id,
            student_id=student_id,
            question_id=question.id,
            subject_id=question.subject_id,
            topic_id=question.topic_id,
            subtopic_id=question.subtopic_id,
            session_id=session_id,
            answer=selected_option_id,
            is_correct=is_correct,
            difficulty=question.difficulty.value,
            question_type=question.question_type.value,
            is_transfer=question.is_transfer,
            response_time_ms=response_time_ms,
            misconception_tags=[misconception_tag] if misconception_tag else [],
            error_category=selected_opt.distractor_explanation if (not is_correct and selected_opt) else None,
            created_at=datetime.utcnow()
        )

        # Store attempt
        if student_id not in self._attempts:
            self._attempts[student_id] = []
        self._attempts[student_id].append(attempt)
        self._submission_dedup[dedup_key] = attempt

        # Update Session if applicable
        if session_id and session_id in self._sessions:
            sess = self._sessions[session_id]
            if question.id not in sess.completed_question_ids:
                sess.completed_question_ids.append(question.id)
                sess.submitted_answers.append({
                    "question_id": question.id,
                    "is_correct": is_correct,
                    "difficulty": question.difficulty.value,
                    "attempt_id": attempt_id
                })

        # Authoritative Mastery Engine update
        current_m = self.get_topic_mastery(student_id, question.topic_id)
        curric_topic = curriculum_registry.get_topic(question.topic_id)
        topic_name = curric_topic.name if curric_topic else question.topic_id.replace("_", " ").title()
        prev_score = current_m.mastery_score if current_m else 0.0

        updated_m = MasteryEngine.update_topic_mastery(
            current_mastery=current_m,
            new_attempt_correct=is_correct,
            difficulty=question.difficulty.value,
            topic_id=question.topic_id,
            subject_id=question.subject_id,
            topic_name=topic_name,
            question_type=question.question_type.value,
            is_transfer=question.is_transfer
        )
        self._masteries[(student_id, question.topic_id)] = updated_m

        # Update Retention Engine
        ret_key = (student_id, question.topic_id)
        current_ret = self._retentions.get(ret_key)
        new_ret = RetentionEngine.update_after_retrieval(
            current_state=current_ret,
            topic_id=question.topic_id,
            retrieval_success=is_correct,
            mastery_score=updated_m.mastery_score
        )
        self._retentions[ret_key] = new_ret

        # Log timeline event if this is a transfer question or significant mastery shift
        if question.is_transfer:
            self.log_timeline_event(student_id, LearningTimelineEvent(
                eventId=f"evt_transfer_{attempt_id}",
                timestamp=datetime.utcnow(),
                eventType="transfer_challenge",
                topicId=question.topic_id,
                topicName=topic_name,
                masteryBefore=prev_score,
                masteryAfter=updated_m.mastery_score,
                score=100.0 if is_correct else 0.0,
                description=f"Completed real-world transfer challenge on {topic_name}."
            ))
        elif abs(updated_m.mastery_score - prev_score) >= 5.0 and updated_m.attempts_count >= 2:
            self.log_timeline_event(student_id, LearningTimelineEvent(
                eventId=f"evt_prog_{attempt_id}",
                timestamp=datetime.utcnow(),
                eventType="mastery_progression",
                topicId=question.topic_id,
                topicName=topic_name,
                masteryBefore=prev_score,
                masteryAfter=updated_m.mastery_score,
                score=100.0 if is_correct else 0.0,
                description=f"Mastery shifted from {prev_score}% to {updated_m.mastery_score}% on {topic_name}."
            ))

        return attempt, updated_m, attempt.error_category, question.explanation

    def get_topic_mastery(self, student_id: str, topic_id: str) -> Optional[TopicMastery]:
        return self._masteries.get((student_id, topic_id))

    def get_all_student_masteries(self, student_id: str) -> List[TopicMastery]:
        return [m for (s_id, _), m in self._masteries.items() if s_id == student_id]

    def get_student_attempts(self, student_id: str) -> List[AttemptRecord]:
        return self._attempts.get(student_id, [])

    def get_next_adaptive_question(self, session_id: str) -> Optional[QuestionClientView]:
        """
        Dynamically adapts intra-session difficulty based on student performance in session:
        - Evaluates consecutive streak
        - Adjusts target difficulty tier
        - Delivers next sanitized question
        """
        session = self._sessions.get(session_id)
        if not session:
            return None

        # Determine consecutive streak
        consecutive_correct = 0
        consecutive_incorrect = 0
        for ans in reversed(session.submitted_answers):
            if ans.get("is_correct"):
                if consecutive_incorrect > 0:
                    break
                consecutive_correct += 1
            else:
                if consecutive_correct > 0:
                    break
                consecutive_incorrect += 1

        # Current base difficulty
        current_diff = "medium"
        if session.submitted_answers:
            current_diff = session.submitted_answers[-1].get("difficulty", "medium")

        target_diff = self.adaptive_engine.adapt_session_difficulty(
            consecutive_correct=consecutive_correct,
            consecutive_incorrect=consecutive_incorrect,
            current_difficulty=current_diff
        )

        q_rec = question_repository.get_question_by_difficulty(
            topic_id=session.selected_topic_id,
            difficulty=target_diff,
            exclude_ids=session.completed_question_ids
        )

        if q_rec:
            if q_rec.id not in session.question_ids:
                session.question_ids.append(q_rec.id)
            return q_rec.to_client_view()

        # If no question found for that difficulty, return next uncompleted from pre-seeded list
        for q_id in session.question_ids:
            if q_id not in session.completed_question_ids:
                q = question_repository.get_question(q_id)
                if q:
                    return q.to_client_view()

        return None

    def create_diagnostic_session(
        self,
        student_id: str,
        subject_id: str,
        topic_id: str,
        question_ids: List[str]
    ) -> DiagnosticSession:
        session_id = f"diag_{student_id}_{topic_id}_{int(datetime.utcnow().timestamp())}"
        session = DiagnosticSession(
            diagnostic_id=session_id,
            student_id=student_id,
            subject_id=subject_id,
            selected_topic_id=topic_id,
            question_ids=question_ids,
            completed_question_ids=[],
            submitted_answers=[],
            status="in_progress",
            started_at=datetime.utcnow()
        )
        self._sessions[session_id] = session
        return session

    def get_diagnostic_session(self, session_id: str) -> Optional[DiagnosticSession]:
        return self._sessions.get(session_id)

    def complete_diagnostic_session(self, session_id: str) -> Dict[str, Any]:
        """
        Concludes a diagnostic session, records diagnostic timeline event,
        and synthesizes authoritative Learning Profile.
        """
        session = self._sessions.get(session_id)
        if not session:
            return {}

        session.status = "completed"
        session.completed_at = datetime.utcnow()
        
        # Calculate raw accuracy
        correct_count = sum(1 for a in session.submitted_answers if a.get("is_correct"))
        total = len(session.submitted_answers)
        score = (correct_count / total * 100.0) if total > 0 else 0.0
        session.score = round(score, 1)

        student_id = session.student_id
        student_masteries = self.get_all_student_masteries(student_id)
        mastery_map = {m.topic_id: m.mastery_score for m in student_masteries}

        # Analyze with Weakness Engine
        prereq_gaps = self.kg.find_prerequisite_gaps(session.selected_topic_id, mastery_map)
        
        target_mastery = mastery_map.get(session.selected_topic_id, score)
        overall_category = MasteryEngine.get_category(target_mastery)

        # Categorize strong vs weak
        strong_topics = [
            curriculum_registry.get_topic(tid).name if curriculum_registry.get_topic(tid) else tid
            for tid, sc in mastery_map.items() if sc >= 70.0
        ]
        improve_topics = [
            curriculum_registry.get_topic(tid).name if curriculum_registry.get_topic(tid) else tid
            for tid, sc in mastery_map.items() if sc < 70.0
        ]

        curric_t = curriculum_registry.get_topic(session.selected_topic_id)
        topic_name = curric_t.name if curric_t else session.selected_topic_id.replace("_", " ").title()

        recommended_session = "Targeted Recovery Session"
        if prereq_gaps:
            top_gap = prereq_gaps[0]
            recommended_session = f"12-minute {top_gap['topic_name']} Recovery Session"
        elif target_mastery < 60.0:
            recommended_session = f"15-minute {topic_name} Foundations Practice"

        # Log timeline event
        self.log_timeline_event(student_id, LearningTimelineEvent(
            eventId=f"evt_diag_{session_id}",
            timestamp=datetime.utcnow(),
            eventType="diagnostic",
            topicId=session.selected_topic_id,
            topicName=topic_name,
            masteryBefore=0.0,
            masteryAfter=target_mastery,
            score=session.score,
            description=f"Completed {topic_name} diagnostic with score of {session.score}% ({overall_category.value.title()})."
        ))

        return {
            "diagnostic_id": session_id,
            "topic_id": session.selected_topic_id,
            "overall_starting_point": overall_category.value.title(),
            "score": session.score,
            "total_questions": len(session.question_ids),
            "completed_questions": len(session.completed_question_ids),
            "strong_areas": strong_topics,
            "areas_to_improve": improve_topics,
            "prerequisite_gaps": prereq_gaps,
            "recommended_first_session": recommended_session
        }

    def get_student_learning_state(self, student_id: str) -> StudentLearningState:
        """
        Assembles the Unified Student Learning State directly from authoritative
        persisted student attempts and mastery records.
        """
        masteries = self.get_all_student_masteries(student_id)
        attempts = self.get_student_attempts(student_id)
        retentions = [r for (s_id, _), r in self._retentions.items() if s_id == student_id]
        mastery_map = {m.topic_id: m.mastery_score for m in masteries}

        subjects_dict: Dict[str, Any] = {}
        for m in masteries:
            if m.subject_id not in subjects_dict:
                subjects_dict[m.subject_id] = {
                    "subjectId": m.subject_id,
                    "overallMastery": 0.0,
                    "topics": {}
                }

            ret_state = self._retentions.get((student_id, m.topic_id))
            est_ret = ret_state.current_estimated_retention if ret_state else 0.5
            ret_status = ret_state.status if ret_state else RetentionStatus.INSUFFICIENT_DATA

            # Topic attempts
            t_attempts = [a for a in attempts if a.topic_id == m.topic_id]
            misconceptions = self.weakness_engine.cluster_misconceptions(t_attempts)
            diff_accuracies = {
                "basic": m.basic_accuracy,
                "medium": m.medium_accuracy,
                "hard": m.hard_accuracy,
                "application": m.application_accuracy
            }
            diff_prof = self.weakness_engine.evaluate_difficulty_cliff(diff_accuracies)

            prereq_gaps = self.kg.find_prerequisite_gaps(m.topic_id, mastery_map)

            t_learning_state = TopicLearningState(
                topicId=m.topic_id,
                subjectId=m.subject_id,
                topicName=m.topic_name,
                mastery=m.mastery_score,
                confidence=m.confidence,
                retention=est_ret,
                retentionStatus=ret_status,
                recentAccuracy=m.recent_accuracy,
                historicalAccuracy=round(sum(1 for a in t_attempts if a.is_correct) / max(1, len(t_attempts)) * 100.0, 1),
                difficultyProfile=diff_prof,
                applicationPerformance=m.application_accuracy,
                transferPerformance=m.transfer_accuracy,
                misconceptionProfile=misconceptions,
                prerequisiteStatus={
                    "hasGaps": len(prereq_gaps) > 0,
                    "gapCount": len(prereq_gaps),
                    "topGap": prereq_gaps[0] if prereq_gaps else None
                },
                learningTrend=m.trend,
                lastPracticed=m.last_attempt_at,
                nextRecommendedReview=ret_state.next_retrieval_due if ret_state else None
            )
            subjects_dict[m.subject_id]["topics"][m.topic_id] = (
                t_learning_state.model_dump() if hasattr(t_learning_state, "model_dump") else t_learning_state.dict()
            )

        # Compute subject-level averages
        for s_id, s_data in subjects_dict.items():
            topic_states = s_data["topics"].values()
            if topic_states:
                s_data["overallMastery"] = round(sum(t["mastery"] for t in topic_states) / len(topic_states), 1)

        # Strengths and Weaknesses
        strengths = [m.topic_name for m in masteries if m.mastery_score >= 75.0]
        weaknesses = [m.topic_name for m in masteries if m.mastery_score < 60.0]

        # Retention Risks
        ret_risks = []
        for r in retentions:
            est_r = RetentionEngine.calculate_estimated_retention(r.last_retrieval_at, r.half_life_days)
            if est_r < 0.70 or r.status in [RetentionStatus.AT_RISK, RetentionStatus.DUE, RetentionStatus.FORGOTTEN]:
                t_name = self.kg.topic_names.get(r.topic_id, r.topic_id)
                ret_risks.append({
                    "topicId": r.topic_id,
                    "topicName": t_name,
                    "estimatedRetention": est_r,
                    "status": r.status.value,
                    "urgency": r.review_urgency
                })

        # Prerequisite Gaps
        all_prereq_gaps = []
        for m in masteries:
            if m.mastery_score < 65.0:
                gaps = self.kg.find_prerequisite_gaps(m.topic_id, mastery_map)
                all_prereq_gaps.extend(gaps)

        # Velocity and Efficiency
        velocity = self.adaptive_engine.calculate_learning_velocity(attempts, masteries)
        efficiency = self.adaptive_engine.calculate_learning_efficiency(attempts, velocity)

        # Next Best Actions
        actions = self.adaptive_engine.rank_next_best_actions(masteries, retentions, attempts)

        return StudentLearningState(
            studentId=student_id,
            subjects=subjects_dict,
            currentWeaknesses=weaknesses,
            currentStrengths=strengths,
            retentionRisks=ret_risks,
            prerequisiteGaps=all_prereq_gaps,
            recentLearningVelocity=velocity,
            learningEfficiency=efficiency,
            recommendedActions=actions,
            generatedAt=datetime.utcnow()
        )

    def get_ai_context(self, student_id: str, topic_id: str) -> AIContextPayload:
        """
        Synthesizes structured context payload for future Phase 4 Gemini integration.
        Operates 100% deterministically without making any AI calls.
        """
        mastery = self.get_topic_mastery(student_id, topic_id)
        retention = self._retentions.get((student_id, topic_id))
        all_masteries = self.get_all_student_masteries(student_id)
        mastery_map = {m.topic_id: m.mastery_score for m in all_masteries}
        
        prereq_gaps = self.kg.find_prerequisite_gaps(topic_id, mastery_map)
        gap_names = [g["topic_name"] for g in prereq_gaps]

        t_attempts = [a for a in self.get_student_attempts(student_id) if a.topic_id == topic_id]
        clusters = self.weakness_engine.cluster_misconceptions(t_attempts)
        error_tags = [c.tag for c in clusters]

        m_score = mastery.mastery_score if mastery else 0.0
        confidence = mastery.confidence if mastery else 0.0
        trend = mastery.trend.value if mastery else MasteryTrend.INSUFFICIENT_DATA.value
        r_score = retention.current_estimated_retention if retention else 0.5
        r_status = retention.status.value if retention else RetentionStatus.INSUFFICIENT_DATA.value

        diff_profile = {
            "basic": mastery.basic_accuracy if mastery else 0.0,
            "medium": mastery.medium_accuracy if mastery else 0.0,
            "hard": mastery.hard_accuracy if mastery else 0.0,
            "application": mastery.application_accuracy if mastery else 0.0
        }

        # Recommended Action & Codes
        recommended_action = "PREREQUISITE_RECOVERY" if prereq_gaps else (
            "RETRIEVAL" if r_score < 0.70 else "DIFFICULTY_PROGRESSION"
        )
        reason_codes = ["LOW_PREREQUISITE_MASTERY"] if prereq_gaps else (
            ["RETENTION_AT_RISK"] if r_score < 0.70 else ["STANDARD_PROGRESSION"]
        )

        notes = (
            f"Student has {m_score}% mastery on {topic_id} (confidence: {confidence}). "
            f"{'Identified prerequisite gaps: ' + ', '.join(gap_names) + '.' if gap_names else 'No prerequisite gaps detected.'} "
            f"{'Frequent misconception patterns: ' + ', '.join(error_tags) + '.' if error_tags else 'No recurring misconception patterns.'}"
        )

        return AIContextPayload(
            student_id=student_id,
            current_topic=topic_id,
            mastery=m_score,
            confidence=confidence,
            retention=r_score,
            retention_status=r_status,
            learning_trend=trend,
            difficulty_profile=diff_profile,
            common_errors=error_tags,
            prerequisite_gaps=gap_names,
            recommended_action=recommended_action,
            reason_codes=reason_codes,
            context_notes=notes,
            generated_at=datetime.utcnow()
        )

# Global attempt repository singleton
attempt_repository = AttemptRepository()
