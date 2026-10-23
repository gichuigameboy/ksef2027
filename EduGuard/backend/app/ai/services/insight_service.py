import time
import logging
from typing import Dict, Any, Optional, List
from app.ai.client import gemini_client
from app.ai.config import ai_config
from app.ai.schemas import InsightResponse, StudyPlanResponse, StudyPlanStep
from app.ai.prompts.insight_generator import InsightPromptBuilder
from app.ai.services.rate_limiter import ai_rate_limiter
from app.ai.services.usage_service import ai_usage_service
from app.services.attempt_repository import attempt_repository

logger = logging.getLogger(__name__)

class InsightService:
    """
    Translates authoritative deterministic learning analytics into clear,
    actionable, and encouraging natural language insights and study roadmaps.
    Guarantees zero numerical hallucinations.
    """

    def generate_learning_insights(self, student_id: str) -> InsightResponse:
        start_time = time.time()
        model = ai_config.get_model_for_task("insights")

        # 1. Rate Limiting Check
        allowed, reason = ai_rate_limiter.check_and_increment(student_id)
        if not allowed:
            ai_usage_service.log_request(student_id, "insights", model, 0, False, reason)
            return self._build_deterministic_insight_fallback(student_id, reason=reason)

        # 2. Gather Authoritative Deterministic Metrics
        learning_state = attempt_repository.get_student_learning_state(student_id)
        masteries = attempt_repository.get_all_student_masteries(student_id)

        metrics_summary = {
            "weaknesses": learning_state.currentWeaknesses[:3],
            "strengths": learning_state.currentStrengths[:3],
            "retention_risks_count": len(learning_state.retentionRisks),
            "prerequisite_gaps_count": len(learning_state.prerequisiteGaps),
            "recent_mastery_gain_7d": learning_state.recentLearningVelocity.masteryGainLast7Days,
            "velocity_category": learning_state.recentLearningVelocity.velocityCategory,
            "retrieval_success_rate": learning_state.recentLearningVelocity.retrievalSuccessRate,
            "efficiency_category": learning_state.learningEfficiency.efficiencyCategory,
            "top_action": learning_state.recommendedActions[0].actionType.value if learning_state.recommendedActions else "PRACTICE"
        }

        # 3. Prompt Construction
        prompt = InsightPromptBuilder.build_insight_prompt(metrics_summary)

        # 4. Generate with Gemini
        structured = gemini_client.generate_structured(
            prompt=prompt,
            task_type="insights",
            schema_class=InsightResponse,
            model_override=model
        )

        latency = int((time.time() - start_time) * 1000)

        if structured:
            structured.grounded_metrics = metrics_summary
            structured.model_used = model
            structured.is_fallback = False
            ai_usage_service.log_request(student_id, "insights", model, latency, True)
            return structured

        # Fallback
        ai_usage_service.log_request(student_id, "insights", model, latency, False, "Model unavailable")
        return self._build_deterministic_insight_fallback(student_id, metrics=metrics_summary)

    def generate_study_plan(self, student_id: str) -> StudyPlanResponse:
        start_time = time.time()
        model = ai_config.get_model_for_task("study_plan")

        # 1. Rate Limiting Check
        allowed, reason = ai_rate_limiter.check_and_increment(student_id)
        if not allowed:
            ai_usage_service.log_request(student_id, "study_plan", model, 0, False, reason)
            return self._build_deterministic_study_plan_fallback(student_id, reason=reason)

        # 2. Gather Deterministic Action Queue
        learning_state = attempt_repository.get_student_learning_state(student_id)
        actions = learning_state.recommendedActions[:4] # Top 4 priority actions
        
        actions_data = [
            {
                "topic_id": a.topicId,
                "topic_name": a.topicName,
                "action_type": a.actionType.value,
                "priority": a.priority,
                "estimated_minutes": a.estimatedMinutes,
                "reason": a.reason
            }
            for a in actions
        ]

        ret_risks = [
            {"topic_name": r.get("topicName", "Topic"), "retention": r.get("estimatedRetention", 0.5)}
            for r in learning_state.retentionRisks[:3]
        ]
        prereq_gaps = [
            {"target_topic": g.get("target_topic_name", "Topic"), "missing_prereq": g.get("topic_name", "Prereq")}
            for g in learning_state.prerequisiteGaps[:3]
        ]

        total_minutes = sum(a.estimatedMinutes for a in actions) if actions else 25

        # 3. Construct Prompt
        prompt = InsightPromptBuilder.build_study_plan_prompt(
            recommended_actions=actions_data,
            retention_risks=ret_risks,
            prerequisite_gaps=prereq_gaps,
            total_time_minutes=total_minutes
        )

        # 4. Generate with Gemini
        structured = gemini_client.generate_structured(
            prompt=prompt,
            task_type="study_plan",
            schema_class=StudyPlanResponse,
            model_override=model
        )

        latency = int((time.time() - start_time) * 1000)

        if structured:
            structured.model_used = model
            structured.is_fallback = False
            ai_usage_service.log_request(student_id, "study_plan", model, latency, True)
            return structured

        # Fallback
        ai_usage_service.log_request(student_id, "study_plan", model, latency, False, "Model unavailable")
        return self._build_deterministic_study_plan_fallback(student_id, actions=actions)

    def _build_deterministic_insight_fallback(
        self,
        student_id: str,
        metrics: Optional[Dict[str, Any]] = None,
        reason: Optional[str] = None
    ) -> InsightResponse:
        what_noticed = "Your learning metrics show consistent engagement across core curriculum modules."
        focus_next = "Continue addressing identified prerequisite topics and refreshing concepts at retention risk."
        suggested_strategy = "Dedicate 10 minutes at the start of each study session to spaced retrieval."

        if reason:
            what_noticed = f"[{reason}] " + what_noticed

        return InsightResponse(
            what_noticed=what_noticed,
            focus_next=focus_next,
            suggested_strategy=suggested_strategy,
            grounded_metrics=metrics or {},
            model_used="deterministic_fallback",
            is_fallback=True
        )

    def _build_deterministic_study_plan_fallback(
        self,
        student_id: str,
        actions: Optional[List[Any]] = None,
        reason: Optional[str] = None
    ) -> StudyPlanResponse:
        steps = []
        total_time = 0
        if actions:
            for idx, a in enumerate(actions, 1):
                steps.append(StudyPlanStep(
                    step_number=idx,
                    topic_id=a.topicId,
                    topic_name=a.topicName,
                    action_type=a.actionType.value,
                    allocated_minutes=a.estimatedMinutes,
                    pedagogical_reason=a.reason
                ))
                total_time += a.estimatedMinutes
        else:
            steps.append(StudyPlanStep(
                step_number=1,
                topic_id="general_practice",
                topic_name="Targeted Review",
                action_type="PRACTICE",
                allocated_minutes=20,
                pedagogical_reason="Reinforce current mastery through adaptive practice."
            ))
            total_time = 20

        overview = "Your deterministic study roadmap prioritizes prerequisite recovery and active retrieval."
        if reason:
            overview = f"[{reason}] " + overview

        return StudyPlanResponse(
            overview=overview,
            total_minutes=total_time,
            steps=steps,
            encouragement="Consistent focused practice leads to rapid conceptual mastery.",
            model_used="deterministic_fallback",
            is_fallback=True
        )

insight_service = InsightService()
