import time
import logging
from typing import Optional, Dict, Any
from app.ai.client import gemini_client
from app.ai.config import ai_config
from app.ai.schemas import (
    TutorRequest, TutorResponse, TutorMode,
    HintRequest, HintResponse
)
from app.ai.prompts.tutor import TutorPromptBuilder
from app.ai.services.context_builder import context_builder
from app.ai.services.rate_limiter import ai_rate_limiter
from app.ai.services.cache_service import ai_cache
from app.ai.services.usage_service import ai_usage_service
from app.services.question_repository import question_repository
from app.curriculum.registry import curriculum_registry

logger = logging.getLogger(__name__)

class TutorService:
    """
    Orchestrates the context-aware EduGuard AI Tutor and Progressive Hint system.
    Guarantees that pedagogical output is grounded in deterministic metrics
    and gracefully falls back if the AI model is offline or rate-limited.
    """

    def get_tutor_response(self, student_id: str, req: TutorRequest) -> TutorResponse:
        start_time = time.time()
        task_type = "multistep_tutoring" if req.mode in (TutorMode.STEP_BY_STEP, TutorMode.CHALLENGE) else "simple_explanation"
        model = ai_config.get_model_for_task(task_type)

        # 1. Rate Limiting Check
        allowed, reason = ai_rate_limiter.check_and_increment(student_id, req.session_id)
        if not allowed:
            ai_usage_service.log_request(student_id, f"tutor_{req.mode.value}", model, 0, False, reason)
            return self._build_deterministic_tutor_fallback(student_id, req, reason=reason)

        # 2. Build Minimized Context
        topic_context = context_builder.build_topic_context(student_id, req.topic_id)
        q_context = context_builder.build_question_context(req.current_question_id) if req.current_question_id else None

        # 3. Check Cache for Non-personalized/General queries
        cache_key = {
            "topic_id": req.topic_id,
            "mode": req.mode.value,
            "user_message": req.user_message or "",
            "stage": topic_context.get("learning_stage")
        }
        cached_res = ai_cache.get("tutor", cache_key, student_id)
        if cached_res:
            return TutorResponse(**cached_res)

        # 4. Construct Prompt
        prompt = TutorPromptBuilder.build_tutor_prompt(
            context=topic_context,
            mode=req.mode.value,
            user_message=req.user_message,
            question_context=q_context
        )

        # 5. Call Gemini
        structured = gemini_client.generate_structured(
            prompt=prompt,
            task_type=task_type,
            schema_class=TutorResponse,
            model_override=model
        )

        latency = int((time.time() - start_time) * 1000)

        if structured:
            structured.mode = req.mode.value
            structured.model_used = model
            structured.is_fallback = False
            ai_usage_service.log_request(student_id, f"tutor_{req.mode.value}", model, latency, True)
            ai_cache.set("tutor", cache_key, structured.model_dump(), student_id)
            return structured

        # Graceful Fallback if Gemini returned malformed or unavailable
        ai_usage_service.log_request(student_id, f"tutor_{req.mode.value}", model, latency, False, "Model unavailable or output malformed")
        return self._build_deterministic_tutor_fallback(student_id, req, topic_context=topic_context)

    def get_progressive_hint(self, student_id: str, req: HintRequest) -> HintResponse:
        start_time = time.time()
        model = ai_config.get_model_for_task("hint")

        # 1. Rate Limiting Check
        allowed, reason = ai_rate_limiter.check_and_increment(student_id, req.session_id)
        if not allowed:
            ai_usage_service.log_request(student_id, f"hint_lvl_{req.hint_level}", model, 0, False, reason)
            return self._build_deterministic_hint_fallback(req, reason=reason)

        # 2. Retrieve Question Details
        q = question_repository.get_question(req.question_id)
        if not q:
            return self._build_deterministic_hint_fallback(req, reason="Question not found in repository.")

        topic_context = context_builder.build_topic_context(student_id, req.topic_id)

        # 3. Check Cache
        cache_key = {"question_id": req.question_id, "hint_level": req.hint_level}
        cached = ai_cache.get("hint", cache_key)
        if cached:
            return HintResponse(**cached)

        # 4. Construct Prompt
        prompt = TutorPromptBuilder.build_progressive_hint_prompt(
            context=topic_context,
            question_text=q.question_text,
            hint_level=req.hint_level,
            correct_answer=q.correct_answer,
            explanation=q.explanation
        )

        # 5. Call Gemini
        structured = gemini_client.generate_structured(
            prompt=prompt,
            task_type="hint",
            schema_class=HintResponse,
            model_override=model
        )

        latency = int((time.time() - start_time) * 1000)

        if structured:
            structured.hint_level = req.hint_level
            structured.model_used = model
            structured.is_fallback = False
            ai_usage_service.log_request(student_id, f"hint_lvl_{req.hint_level}", model, latency, True)
            ai_cache.set("hint", cache_key, structured.model_dump())
            return structured

        # Fallback to deterministic curriculum hint
        ai_usage_service.log_request(student_id, f"hint_lvl_{req.hint_level}", model, latency, False, "Model unavailable")
        return self._build_deterministic_hint_fallback(req, q=q)

    def _build_deterministic_tutor_fallback(
        self,
        student_id: str,
        req: TutorRequest,
        topic_context: Optional[Dict[str, Any]] = None,
        reason: Optional[str] = None
    ) -> TutorResponse:
        curric_t = curriculum_registry.get_topic(req.topic_id)
        topic_name = curric_t.name if curric_t else req.topic_id.replace("_", " ").title()
        obj = curric_t.learning_objectives[0] if curric_t and curric_t.learning_objectives else "core concepts"

        steps = [
            f"Review the fundamental definition of {topic_name}.",
            f"Identify the relevant formulas and prerequisites ({', '.join(curric_t.prerequisites) if curric_t else 'algebra'}).",
            "Work through each step systematically and verify intermediate units."
        ]

        explanation = (
            f"Currently focusing on {topic_name}. Key objective: {obj}. "
            f"Keep practicing foundational examples to build mastery."
        )
        if reason:
            explanation = f"[{reason}] " + explanation

        return TutorResponse(
            explanation=explanation,
            key_concept=f"Core principle: Master {topic_name} step-by-step.",
            steps=steps,
            example=f"Consider a standard problem in {topic_name}: Apply the fundamental rule before simplifying.",
            check_question=f"What is the first step in solving a standard {topic_name} problem?",
            encouragement="You are making steady progress! Continue with the next question.",
            mode=req.mode.value,
            model_used="deterministic_fallback",
            is_fallback=True
        )

    def _build_deterministic_hint_fallback(
        self,
        req: HintRequest,
        q: Optional[Any] = None,
        reason: Optional[str] = None
    ) -> HintResponse:
        if q and q.hint:
            hint_text = q.hint
        else:
            hint_text = "Focus on the primary mathematical rule governing this topic."

        is_final = req.hint_level >= 4
        if is_final and q:
            hint_text = f"Full Solution: {q.explanation}"

        if reason:
            hint_text = f"[{reason}] {hint_text}"

        return HintResponse(
            hint_level=req.hint_level,
            hint_text=hint_text,
            guidance="Review your steps and apply the foundational rule.",
            is_final_solution=is_final,
            model_used="deterministic_fallback",
            is_fallback=True
        )

tutor_service = TutorService()
