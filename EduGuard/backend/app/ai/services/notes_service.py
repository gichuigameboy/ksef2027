import time
import logging
from typing import Optional
from app.ai.client import gemini_client
from app.ai.config import ai_config
from app.ai.schemas import (
    NotesAnalysisRequest, NotesAnalysisResponse,
    NotesConceptItem, FlashcardItem, GeneratedQuestionItem
)
from app.ai.prompts.notes_analyzer import NotesAnalysisPromptBuilder
from app.ai.services.rate_limiter import ai_rate_limiter
from app.ai.services.usage_service import ai_usage_service
from app.curriculum.registry import curriculum_registry

logger = logging.getLogger(__name__)

class NotesService:
    """
    Parses and analyzes student study notes or educational text.
    Extracts core definitions, synthesizes flashcards, generates retrieval questions,
    and identifies foundational prerequisites.
    """

    def analyze_notes(self, student_id: str, req: NotesAnalysisRequest) -> NotesAnalysisResponse:
        start_time = time.time()
        model = ai_config.get_model_for_task("notes_analysis")

        # 1. Rate Limiting Check
        allowed, reason = ai_rate_limiter.check_and_increment(student_id)
        if not allowed:
            ai_usage_service.log_request(student_id, "notes_analysis", model, 0, False, reason)
            return self._build_deterministic_notes_fallback(req, reason=reason)

        topic_hint = None
        if req.topic_id:
            curric_t = curriculum_registry.get_topic(req.topic_id)
            topic_hint = curric_t.name if curric_t else req.topic_id

        # 2. Prompt Construction
        prompt = NotesAnalysisPromptBuilder.build_notes_analysis_prompt(
            notes_text=req.notes_text,
            topic_hint=topic_hint,
            subject_hint=req.subject_id
        )

        # 3. Call Gemini Reasoning Model
        structured = gemini_client.generate_structured(
            prompt=prompt,
            task_type="notes_analysis",
            schema_class=NotesAnalysisResponse,
            model_override=model
        )

        latency = int((time.time() - start_time) * 1000)

        if structured:
            structured.is_ai_generated = True
            structured.disclaimer = (
                "AI-generated study material. Extraction is an educational aid and may not be exhaustive; "
                "always verify against authoritative course materials."
            )
            structured.model_used = model
            structured.is_fallback = False
            ai_usage_service.log_request(student_id, "notes_analysis", model, latency, True)
            return structured

        # Fallback
        ai_usage_service.log_request(student_id, "notes_analysis", model, latency, False, "Model unavailable")
        return self._build_deterministic_notes_fallback(req)

    def _build_deterministic_notes_fallback(
        self,
        req: NotesAnalysisRequest,
        reason: Optional[str] = None
    ) -> NotesAnalysisResponse:
        words = req.notes_text.split()
        sample_words = words[:15]
        summary_text = f"Analyzed {len(words)} words from study notes. Extracted preliminary structural review."
        if reason:
            summary_text = f"[{reason}] " + summary_text

        return NotesAnalysisResponse(
            summary=summary_text,
            key_concepts=[
                NotesConceptItem(
                    name="Primary Study Concept",
                    definition="Extracted from student notes.",
                    importance="Essential foundation for subsequent assessments."
                )
            ],
            definitions={"Study Notes": "Student-provided educational text."},
            practice_questions=[],
            flashcards=[
                FlashcardItem(
                    front="What is the central focus of these study notes?",
                    back=f"Focus area: {' '.join(sample_words)}..."
                )
            ],
            suggested_prerequisites=["Core Fundamentals", "Prerequisite Terminology"],
            is_ai_generated=True,
            disclaimer="Deterministic fallback generated because AI service is currently unavailable.",
            model_used="deterministic_fallback",
            is_fallback=True
        )

notes_service = NotesService()
