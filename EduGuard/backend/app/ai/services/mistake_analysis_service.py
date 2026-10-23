import time
import logging
from typing import Optional, Dict, Any
from app.ai.client import gemini_client
from app.ai.config import ai_config
from app.ai.schemas import (
    MistakeAnalysisRequest, MistakeAnalysisResponse,
    MistakeConfidence
)
from app.ai.prompts.mistake_analysis import MistakeAnalysisPromptBuilder
from app.ai.services.rate_limiter import ai_rate_limiter
from app.ai.services.cache_service import ai_cache
from app.ai.services.usage_service import ai_usage_service
from app.services.question_repository import question_repository
from app.services.attempt_repository import attempt_repository
from app.curriculum.registry import curriculum_registry

logger = logging.getLogger(__name__)

class MistakeAnalysisService:
    """
    Assists students with nuanced mistake interpretation without overriding
    authoritative deterministic error categorizations.
    Treats low-confidence diagnoses tentatively and avoids recording them
    as permanent misconceptions without corroborating evidence.
    """

    def analyze_student_mistake(
        self,
        student_id: str,
        req: MistakeAnalysisRequest
    ) -> MistakeAnalysisResponse:
        start_time = time.time()
        model = ai_config.get_model_for_task("mistake_analysis")

        # 1. Rate Limiter Check
        allowed, reason = ai_rate_limiter.check_and_increment(student_id, req.session_id)
        if not allowed:
            ai_usage_service.log_request(student_id, "mistake_analysis", model, 0, False, reason)
            return self._build_deterministic_mistake_fallback(req, reason=reason)

        # 2. Retrieve Question Record
        q = question_repository.get_question(req.question_id)
        if not q:
            return self._build_deterministic_mistake_fallback(req, reason="Question not found in repository.")

        topic_id = req.topic_id or q.topic_id
        curric_t = curriculum_registry.get_topic(topic_id)
        topic_name = curric_t.name if curric_t else topic_id.replace("_", " ").title()

        # Retrieve student mastery for grounding
        mastery_rec = attempt_repository.get_topic_mastery(student_id, topic_id)
        mastery_score = mastery_rec.mastery_score if mastery_rec else 0.0

        # Deterministic distractor hint
        distractor_hint = None
        for opt in q.options:
            if opt.id == req.student_answer or opt.text.strip().lower() == req.student_answer.strip().lower():
                distractor_hint = opt.misconception_tag or opt.distractor_explanation
                break

        # 3. Check Cache
        cache_key = {
            "question_id": req.question_id,
            "answer": req.student_answer.strip().lower()
        }
        cached = ai_cache.get("mistake_analysis", cache_key)
        if cached:
            return MistakeAnalysisResponse(**cached)

        # 4. Construct Prompt
        prompt = MistakeAnalysisPromptBuilder.build_mistake_analysis_prompt(
            question_text=q.question_text,
            student_answer=req.student_answer,
            correct_answer=q.correct_answer,
            topic_name=topic_name,
            mastery_score=mastery_score,
            deterministic_error_category=distractor_hint,
            explanation=q.explanation
        )

        # 5. Call Gemini Reasoning Model
        structured = gemini_client.generate_structured(
            prompt=prompt,
            task_type="mistake_analysis",
            schema_class=MistakeAnalysisResponse,
            model_override=model
        )

        latency = int((time.time() - start_time) * 1000)

        if structured:
            # Handle Confidence logic: low confidence must be marked tentative
            if structured.confidence == MistakeConfidence.LOW:
                structured.is_tentative = True
                logger.info(f"AI returned LOW confidence mistake diagnosis for student {student_id}; marked tentative.")
            else:
                structured.is_tentative = False

            structured.model_used = model
            structured.is_fallback = False
            ai_usage_service.log_request(student_id, "mistake_analysis", model, latency, True)
            ai_cache.set("mistake_analysis", cache_key, structured.model_dump())
            return structured

        # Fallback to deterministic diagnosis
        ai_usage_service.log_request(student_id, "mistake_analysis", model, latency, False, "Model unavailable")
        return self._build_deterministic_mistake_fallback(req, q=q, distractor_hint=distractor_hint)

    def _build_deterministic_mistake_fallback(
        self,
        req: MistakeAnalysisRequest,
        q: Optional[Any] = None,
        distractor_hint: Optional[str] = None,
        reason: Optional[str] = None
    ) -> MistakeAnalysisResponse:
        error_msg = distractor_hint or "A procedural or conceptual misapplication occurred during evaluation."
        explanation = q.explanation if q else "Review the standard solution steps carefully."
        if reason:
            explanation = f"[{reason}] {explanation}"

        return MistakeAnalysisResponse(
            likely_error=error_msg,
            explanation=explanation,
            teaching_focus="Reinforce core formula and sign management.",
            confidence=MistakeConfidence.MEDIUM,
            is_tentative=False,
            concept_to_remember="Double-check each algebraic transformation before concluding.",
            mini_example=None,
            quick_check=None,
            model_used="deterministic_fallback",
            is_fallback=True
        )

mistake_analysis_service = MistakeAnalysisService()
