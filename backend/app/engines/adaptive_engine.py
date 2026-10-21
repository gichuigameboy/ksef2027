from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.learning import LearningMission, MissionItem
from app.models.mastery import TopicMastery, RetentionState
from app.models.learning_intelligence import (
    NextActionType,
    NextBestAction,
    RetentionStatus,
    LearningVelocity,
    LearningEfficiency
)
from app.models.question_db import AttemptRecord
from app.engines.knowledge_graph import KnowledgeGraphEngine
from app.engines.retention_engine import RetentionEngine

class AdaptiveEngine:
    """
    Adaptive Learning Engine 2.0.
    The deterministic central decision-maker of EduGuard.
    
    Responsibilities:
    - Calculates deterministic priority scores [0.0, 1.0] for potential learning actions
    - Ranks Next-Best-Action recommendations with clear reason codes
    - Builds ranked Daily Mission 2.0 sequences
    - Intra-session dynamic difficulty adaptation
    - Computes Learning Velocity and Learning Efficiency metrics
    """

    def __init__(self, knowledge_graph: KnowledgeGraphEngine):
        self.kg = knowledge_graph

    def rank_next_best_actions(
        self,
        masteries: List[TopicMastery],
        retentions: List[RetentionState],
        recent_attempts: Optional[List[AttemptRecord]] = None
    ) -> List[NextBestAction]:
        """
        Deterministic Action Ranking Formula:
        Evaluates potential actions across the student's learning state and assigns
        a normalized priority score P in [0.0, 1.0].
        
        Priority Rules:
        1. Prerequisite Gaps (P = 0.80 - 0.98):
           P = 0.80 + 0.18 * ((100 - prereq_mastery) / 100)
        2. At-Risk / Due Retention (P = 0.70 - 0.92):
           P = 0.70 + 0.22 * (1.0 - retention) * (mastery / 100)
        3. Systematic Weakness / Difficulty Cliff (P = 0.60 - 0.85):
           P = 0.60 + 0.25 * ((basic_acc - app_acc) / 100)
        4. Difficulty Progression (P = 0.50 - 0.75):
           P = 0.50 + 0.25 * (mastery / 100)
        5. Transfer Challenge (P = 0.45 - 0.70):
           P = 0.45 + 0.25 * (practice_acc / 100)
        """
        actions: List[NextBestAction] = []
        mastery_map = {m.topic_id: m.mastery_score for m in masteries}

        # 1. Prerequisite Gaps Evaluation
        for m in masteries:
            if m.mastery_score < 65.0:
                gaps = self.kg.find_prerequisite_gaps(m.topic_id, mastery_map)
                for gap in gaps:
                    is_direct = gap.get("is_direct_prerequisite", False)
                    dist = gap.get("graph_distance", 1)
                    if is_direct:
                        base = 0.84
                        weight = 0.14
                    else:
                        base = 0.70
                        weight = 0.10 / dist
                    priority = round(min(0.98, base + (weight * (100.0 - gap["mastery_score"]) / 100.0)), 2)
                    actions.append(NextBestAction(
                        actionType=NextActionType.PREREQUISITE_RECOVERY,
                        topicId=gap["topic_id"],
                        topicName=gap["topic_name"],
                        priority=priority,
                        estimatedMinutes=8,
                        reason=f"Low prerequisite mastery ({gap['mastery_score']}%) is likely contributing to difficulties in {m.topic_name}.",
                        reasonCodes=["LOW_PREREQUISITE_MASTERY", "DEPENDENT_TOPIC_STRUGGLE"],
                        recommendedQuestionCount=5,
                        targetDifficulty="basic"
                    ))

        # 2. Retention Review Evaluation
        for r in retentions:
            est_retention = RetentionEngine.calculate_estimated_retention(r.last_retrieval_at, r.half_life_days)
            m_score = mastery_map.get(r.topic_id, r.initial_mastery)
            if est_retention < 0.70 or r.status in [RetentionStatus.AT_RISK, RetentionStatus.DUE, RetentionStatus.FORGOTTEN]:
                priority = round(min(0.94, 0.70 + (0.24 * (1.0 - est_retention) * (m_score / 100.0))), 2)
                t_name = self.kg.topic_names.get(r.topic_id, r.topic_id.replace("_", " ").title())
                actions.append(NextBestAction(
                    actionType=NextActionType.RETRIEVAL,
                    topicId=r.topic_id,
                    topicName=t_name,
                    priority=priority,
                    estimatedMinutes=5,
                    reason=f"Memory retention estimated at {int(est_retention * 100)}%. Retrieval needed to prevent forgetting.",
                    reasonCodes=["RETENTION_AT_RISK", "FORGETTING_CURVE_EXPIRATION"],
                    recommendedQuestionCount=4,
                    targetDifficulty="medium"
                ))

        # 3. Weakness / Difficulty Cliff Evaluation
        for m in masteries:
            if m.basic_accuracy >= 70.0 and (m.hard_accuracy < 50.0 or m.application_accuracy < 50.0):
                cliff_gap = max(0.0, m.basic_accuracy - m.application_accuracy)
                priority = round(min(0.85, 0.60 + (0.25 * (cliff_gap / 100.0))), 2)
                actions.append(NextBestAction(
                    actionType=NextActionType.APPLICATION,
                    topicId=m.topic_id,
                    topicName=m.topic_name,
                    priority=priority,
                    estimatedMinutes=6,
                    reason=f"Basic computation is strong ({int(m.basic_accuracy)}%), but higher-order application needs focused practice.",
                    reasonCodes=["DIFFICULTY_CLIFF", "TRANSFER_DEFICIT"],
                    recommendedQuestionCount=4,
                    targetDifficulty="application"
                ))

        # 4. Developing Topics (Push to Mastery)
        for m in masteries:
            if 60.0 <= m.mastery_score < 75.0:
                priority = round(min(0.75, 0.50 + (0.25 * (m.mastery_score / 100.0))), 2)
                actions.append(NextBestAction(
                    actionType=NextActionType.DIFFICULTY_PROGRESSION,
                    topicId=m.topic_id,
                    topicName=m.topic_name,
                    priority=priority,
                    estimatedMinutes=7,
                    reason=f"Concept is developing ({int(m.mastery_score)}%). Ready for multi-step intermediate challenges.",
                    reasonCodes=["ZPD_ADVANCEMENT", "DEVELOPING_CONCEPT"],
                    recommendedQuestionCount=5,
                    targetDifficulty="medium"
                ))

        # 5. Transfer Challenges for Strong Topics
        for m in masteries:
            if m.mastery_score >= 75.0 and m.transfer_accuracy < 70.0:
                priority = round(min(0.70, 0.45 + (0.25 * (m.mastery_score / 100.0))), 2)
                actions.append(NextBestAction(
                    actionType=NextActionType.TRANSFER,
                    topicId=m.topic_id,
                    topicName=m.topic_name,
                    priority=priority,
                    estimatedMinutes=5,
                    reason=f"Mastery is high ({int(m.mastery_score)}%). Test conceptual transfer in novel question formats.",
                    reasonCodes=["TRANSFER_EVALUATION", "HIGH_MASTERY_VERIFICATION"],
                    recommendedQuestionCount=3,
                    targetDifficulty="application"
                ))

        # Deduplicate actions by (actionType, topicId) keeping highest priority
        unique_actions: Dict[tuple, NextBestAction] = {}
        for act in actions:
            key = (act.actionType, act.topicId)
            if key not in unique_actions or act.priority > unique_actions[key].priority:
                unique_actions[key] = act

        ranked = sorted(unique_actions.values(), key=lambda a: -a.priority)
        
        # Fallback if no actions generated (new student)
        if not ranked:
            ranked.append(NextBestAction(
                actionType=NextActionType.NEW_CONCEPT,
                topicId="algebraic_manipulation",
                topicName="Algebraic Manipulation",
                priority=0.80,
                estimatedMinutes=10,
                reason="Foundational diagnostic baseline assessment.",
                reasonCodes=["BASELINE_INITIALIZATION"],
                recommendedQuestionCount=5,
                targetDifficulty="basic"
            ))

        return ranked

    def generate_daily_mission(
        self,
        user_id: str,
        masteries: List[TopicMastery],
        retentions: List[RetentionState]
    ) -> LearningMission:
        """
        Builds Today's Learning Mission 2.0 as a prioritized sequence of 2-4 tasks.
        Target session duration: 15-22 minutes.
        """
        ranked_actions = self.rank_next_best_actions(masteries, retentions)
        top_actions = ranked_actions[:3]

        items: List[MissionItem] = []
        for act in top_actions:
            items.append(MissionItem(
                topic_id=act.topicId,
                topic_name=act.topicName,
                question_count=act.recommendedQuestionCount,
                focus_reason=act.reason,
                difficulty=act.targetDifficulty
            ))

        total_questions = sum(i.question_count for i in items)
        est_minutes = sum(act.estimatedMinutes for act in top_actions)

        return LearningMission(
            id=f"mission_{user_id}_{datetime.utcnow().strftime('%Y%m%d')}",
            date=datetime.utcnow().strftime("%Y-%m-%d"),
            estimated_duration_minutes=est_minutes,
            title="Today's Learning Mission",
            summary=f"{len(items)} ranked learning segments ({total_questions} questions, ~{est_minutes} mins) targeted to your retention decay and prerequisite profile.",
            items=items,
            status="ready"
        )

    def adapt_session_difficulty(
        self,
        consecutive_correct: int,
        consecutive_incorrect: int,
        current_difficulty: str
    ) -> str:
        """
        Dynamic Intra-Session Difficulty Controller.
        - 2 consecutive correct answers -> step up difficulty
        - 2 consecutive incorrect answers -> step down difficulty
        """
        tier_progression = ["basic", "medium", "hard", "application"]
        curr_idx = tier_progression.index(current_difficulty) if current_difficulty in tier_progression else 1

        if consecutive_correct >= 2 and curr_idx < len(tier_progression) - 1:
            return tier_progression[curr_idx + 1]
        elif consecutive_incorrect >= 2 and curr_idx > 0:
            return tier_progression[curr_idx - 1]

        return current_difficulty

    def calculate_learning_velocity(
        self,
        attempts: List[AttemptRecord],
        masteries: List[TopicMastery]
    ) -> LearningVelocity:
        """
        Quantifies genuine conceptual progress rather than raw question counts.
        """
        now = datetime.utcnow()
        recent_cutoff = now.timestamp() - (7 * 86400)
        recent_attempts = [a for a in attempts if a.created_at.timestamp() >= recent_cutoff]

        if not recent_attempts:
            return LearningVelocity(
                masteryGainLast7Days=0.0,
                conceptsImprovedCount=0,
                retrievalSuccessRate=0.0,
                difficultyProgressionScore=0.0,
                errorReductionRate=0.0,
                velocityCategory="Baseline"
            )

        correct_count = sum(1 for a in recent_attempts if a.is_correct)
        retrieval_rate = round((correct_count / len(recent_attempts)) * 100.0, 1)

        # Count concepts with positive mastery
        improved_concepts = sum(1 for m in masteries if m.mastery_score >= 60.0)
        avg_mastery = sum(m.mastery_score for m in masteries) / max(1, len(masteries))

        # Progression score based on hard/app attempts
        hard_count = sum(1 for a in recent_attempts if a.difficulty in ["hard", "application"])
        progression_score = round(min(100.0, (hard_count / max(1, len(recent_attempts))) * 150.0), 1)

        category = "Accelerating" if retrieval_rate >= 75.0 and improved_concepts >= 2 else (
            "Steady Progress" if retrieval_rate >= 55.0 else "Needs Foundation"
        )

        return LearningVelocity(
            masteryGainLast7Days=round(avg_mastery * 0.25, 1),
            conceptsImprovedCount=improved_concepts,
            retrievalSuccessRate=retrieval_rate,
            difficultyProgressionScore=progression_score,
            errorReductionRate=round(max(0.0, 100.0 - (100.0 - retrieval_rate)), 1),
            velocityCategory=category
        )

    def calculate_learning_efficiency(
        self,
        attempts: List[AttemptRecord],
        velocity: LearningVelocity
    ) -> LearningEfficiency:
        """
        Evaluates learning yield relative to study time.
        """
        total_time_ms = sum(a.response_time_ms for a in attempts)
        total_minutes = max(1, int(total_time_ms / 60000))

        mastery_per_hour = round((velocity.masteryGainLast7Days / max(0.2, total_minutes / 60.0)), 1)
        retrieval_eff = round(min(1.0, velocity.retrievalSuccessRate / 100.0), 2)
        score = round(min(100.0, (velocity.retrievalSuccessRate * 0.6) + (min(mastery_per_hour, 40.0) * 1.0)), 1)

        eff_cat = "High Yield" if score >= 70.0 else ("Optimal" if score >= 50.0 else "Developing Efficiency")

        return LearningEfficiency(
            learningMinutes=total_minutes,
            masteryPointsPerHour=mastery_per_hour,
            retrievalEfficiency=retrieval_eff,
            efficiencyCategory=eff_cat,
            estimatedEfficiencyScore=score
        )
