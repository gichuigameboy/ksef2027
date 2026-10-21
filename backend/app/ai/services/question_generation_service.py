import time
import uuid
import logging
from difflib import SequenceMatcher
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.ai.client import gemini_client
from app.ai.config import ai_config
from app.ai.schemas import (
    QuestionGenerationRequest, QuestionGenerationResponse,
    GeneratedQuestionItem, QuestionGenerationStatus
)
from app.ai.prompts.question_generator import QuestionPromptBuilder
from app.ai.services.rate_limiter import ai_rate_limiter
from app.ai.services.usage_service import ai_usage_service
from app.curriculum.registry import curriculum_registry
from app.services.question_repository import question_repository
from app.services.attempt_repository import attempt_repository
from app.models.question_db import (
    QuestionRecord, QuestionDifficulty, QuestionFormat,
    QuestionOptionDB, QuestionClientView
)

logger = logging.getLogger(__name__)

class QuestionGenerationService:
    """
    Executes deterministic-governed question generation and the strict
    multi-stage validation pipeline:
    GEMINI -> PYDANTIC VALIDATION -> DETERMINISTIC VALIDATION -> DUPLICATE CHECK -> QUALITY CHECK
    """

    def generate_targeted_questions(
        self,
        student_id: str,
        req: QuestionGenerationRequest
    ) -> QuestionGenerationResponse:
        start_time = time.time()
        model = ai_config.get_model_for_task("question_generation")

        # 1. Rate Limiting
        allowed, reason = ai_rate_limiter.check_and_increment(student_id, req.session_id)
        if not allowed:
            ai_usage_service.log_request(student_id, "question_gen", model, 0, False, reason)
            return self._build_fallback_questions(req, reason=reason)

        # 2. Verify Curriculum Topic Exists
        curric_t = curriculum_registry.get_topic(req.topic_id)
        if not curric_t:
            return self._build_fallback_questions(req, reason="Curriculum topic not found.")

        topic_name = curric_t.name
        subject = curriculum_registry.get_subject(curric_t.subject_id)
        subject_name = subject.name if subject else "General"
        obj = curric_t.learning_objectives[0] if curric_t.learning_objectives else f"Master {topic_name}"

        # 3. Construct Prompt with Deterministic Constraints
        prompt = QuestionPromptBuilder.build_question_generation_prompt(
            subject_name=subject_name,
            topic_name=topic_name,
            learning_objective=obj,
            difficulty=req.target_difficulty,
            count=req.count,
            target_misconception=req.target_misconception,
            prerequisites=curric_t.prerequisites
        )

        # 4. Generate via Gemini
        raw_res = gemini_client.generate_structured(
            prompt=prompt,
            task_type="question_generation",
            schema_class=QuestionGenerationResponse,
            model_override=model
        )

        latency = int((time.time() - start_time) * 1000)

        # 5. Multi-Stage Deterministic Validation Pipeline
        validated_questions: List[GeneratedQuestionItem] = []
        if raw_res and raw_res.questions:
            for q_item in raw_res.questions:
                is_valid, failure_reason = self.validate_generated_question(q_item, req.topic_id)
                if is_valid:
                    # Duplicate similarity check
                    if not self.is_duplicate(q_item.questionText, req.topic_id):
                        validated_questions.append(q_item)
                    else:
                        logger.info(f"Rejected generated question due to duplicate similarity: '{q_item.questionText[:40]}...'")
                else:
                    logger.warning(f"Rejected malformed question: {failure_reason}")

        if validated_questions:
            status = QuestionGenerationStatus.SESSION_GENERATED if req.session_id else QuestionGenerationStatus.AI_GENERATED_PENDING
            
            # If a session ID was provided, register them into the session repository as temporary questions
            if req.session_id:
                self.attach_to_session(req.session_id, validated_questions, req.subject_id, req.topic_id, model)

            ai_usage_service.log_request(student_id, "question_gen", model, latency, True)
            return QuestionGenerationResponse(
                questions=validated_questions,
                status=status,
                generation_context={
                    "subject_id": req.subject_id,
                    "topic_id": req.topic_id,
                    "target_difficulty": req.target_difficulty,
                    "target_misconception": req.target_misconception,
                    "generated_at": datetime.utcnow().isoformat()
                },
                model_used=model,
                count=len(validated_questions)
            )

        # Fallback if generation failed or all failed validation
        ai_usage_service.log_request(student_id, "question_gen", model, latency, False, "Generation or validation failed")
        return self._build_fallback_questions(req)

    def validate_generated_question(self, q: GeneratedQuestionItem, topic_id: str) -> tuple[bool, str]:
        """Strict deterministic quality & integrity check."""
        if not q.questionText or len(q.questionText.strip()) < 8:
            return False, "Empty or too short questionText."

        if not q.options or len(q.options) < 2:
            return False, "Must provide at least 2 options."

        correct_count = sum(1 for o in q.options if o.is_correct)
        if correct_count != 1:
            return False, f"Expected exactly 1 correct option, found {correct_count}."

        correct_ids = [o.id for o in q.options if o.is_correct]
        if q.correctAnswer not in correct_ids:
            return False, f"correctAnswer '{q.correctAnswer}' does not match correct option ID '{correct_ids}'."

        if not q.explanation or len(q.explanation.strip()) < 5:
            return False, "Missing or inadequate explanation."

        valid_difficulties = {"basic", "medium", "hard", "application"}
        if q.difficulty.lower() not in valid_difficulties:
            return False, f"Invalid difficulty: {q.difficulty}"

        return True, ""

    def is_duplicate(self, question_text: str, topic_id: str, threshold: float = 0.85) -> bool:
        """Compares text against existing curriculum repository questions."""
        existing_questions = question_repository.get_questions_by_topic(topic_id)
        norm_new = question_text.strip().lower()

        for ex in existing_questions:
            norm_ex = ex.question_text.strip().lower()
            ratio = SequenceMatcher(None, norm_new, norm_ex).ratio()
            if ratio >= threshold:
                return True
        return False

    def attach_to_session(
        self,
        session_id: str,
        items: List[GeneratedQuestionItem],
        subject_id: str,
        topic_id: str,
        model: str
    ):
        """Creates temporary QuestionRecord instances tagged with SESSION_GENERATED."""
        session = attempt_repository.get_diagnostic_session(session_id)
        if not session:
            return

        for item in items:
            q_id = f"ai_gen_{uuid.uuid4().hex[:8]}"
            diff_enum = QuestionDifficulty(item.difficulty.lower()) if item.difficulty.lower() in QuestionDifficulty._value2member_map_ else QuestionDifficulty.MEDIUM
            
            db_options = [
                QuestionOptionDB(
                    id=opt.id,
                    text=opt.text,
                    is_correct=opt.is_correct,
                    misconception_tag=opt.misconception_tag,
                    distractor_explanation=opt.distractor_explanation
                )
                for opt in item.options
            ]

            q_record = QuestionRecord(
                id=q_id,
                subject_id=subject_id,
                topic_id=topic_id,
                difficulty=diff_enum,
                question_type=QuestionFormat.MULTIPLE_CHOICE,
                learning_objective=item.learningObjective or "Targeted Practice",
                question_text=item.questionText,
                options=db_options,
                correct_answer=item.correctAnswer,
                explanation=item.explanation,
                hint=item.hint,
                misconception_tags=item.misconceptionTags,
                source="ai_generated",
                status="session_generated",
                created_at=datetime.utcnow()
            )

            # Store in question repository so it can be retrieved during the session
            question_repository._questions[q_id] = q_record
            session.question_ids.append(q_id)

    def _build_fallback_questions(
        self,
        req: QuestionGenerationRequest,
        reason: Optional[str] = None
    ) -> QuestionGenerationResponse:
        """Retrieves matching deterministic repository questions as fallback."""
        existing = question_repository.get_questions_by_topic(req.topic_id)
        filtered = [q for q in existing if q.difficulty.value == req.target_difficulty]
        chosen = filtered[:req.count] if filtered else existing[:req.count]

        fallback_items = []
        for q in chosen:
            fallback_items.append(GeneratedQuestionItem(
                questionText=q.question_text,
                difficulty=q.difficulty.value,
                questionType=q.question_type.value,
                options=[
                    {
                        "id": o.id,
                        "text": o.text,
                        "is_correct": o.is_correct,
                        "distractor_explanation": o.distractor_explanation,
                        "misconception_tag": o.misconception_tag
                    }
                    for o in q.options
                ],
                correctAnswer=q.correct_answer,
                explanation=q.explanation,
                hint=q.hint,
                misconceptionTags=q.misconception_tags,
                learningObjective=q.learning_objective
            ))

        return QuestionGenerationResponse(
            questions=fallback_items,
            status=QuestionGenerationStatus.SESSION_GENERATED,
            generation_context={
                "fallback": True,
                "reason": reason or "Deterministic repository fallback used."
            },
            model_used="deterministic_repository",
            count=len(fallback_items)
        )

question_generation_service = QuestionGenerationService()
