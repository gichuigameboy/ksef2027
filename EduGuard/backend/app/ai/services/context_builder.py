from typing import Dict, Any, Optional, List
from datetime import datetime
from app.services.attempt_repository import attempt_repository
from app.curriculum.registry import curriculum_registry

class AIContextBuilder:
    """
    Constructs strictly minimized, sanitized educational context payloads
    for Gemini AI prompts. Enforces strict privacy boundaries:
    - Excludes student IDs, emails, passwords, tokens, and school metadata.
    - Excludes irrelevant long-term history; includes only current topic evidence.
    """

    @staticmethod
    def build_topic_context(student_id: str, topic_id: str) -> Dict[str, Any]:
        """
        Extracts only current topic mastery, prerequisite gaps, common error tags,
        and recommended action from EduGuard's authoritative deterministic store.
        """
        deterministic_payload = attempt_repository.get_ai_context(student_id, topic_id)
        curric_t = curriculum_registry.get_topic(topic_id)
        topic_name = curric_t.name if curric_t else topic_id.replace("_", " ").title()
        learning_objectives = curric_t.learning_objectives if curric_t else []
        primary_objective = learning_objectives[0] if learning_objectives else f"Master {topic_name}"

        # Categorize student learning stage
        mastery = deterministic_payload.mastery
        if mastery < 40.0:
            stage = "introductory"
        elif mastery < 70.0:
            stage = "developing"
        elif mastery < 85.0:
            stage = "proficient"
        else:
            stage = "mastered"

        return {
            "topic_id": topic_id,
            "topic_name": topic_name,
            "learning_stage": stage,
            "learning_objective": primary_objective,
            "mastery": round(mastery, 1),
            "confidence": round(deterministic_payload.confidence, 2),
            "retention": round(deterministic_payload.retention, 2),
            "retention_status": deterministic_payload.retention_status,
            "learning_trend": deterministic_payload.learning_trend,
            "difficulty_profile": deterministic_payload.difficulty_profile,
            "common_errors": deterministic_payload.common_errors[:4], # Top 4 at most
            "prerequisite_gaps": deterministic_payload.prerequisite_gaps[:3],
            "recommended_action": deterministic_payload.recommended_action
        }

    @staticmethod
    def build_question_context(question_id: str) -> Optional[Dict[str, Any]]:
        """
        Builds sanitized pedagogical context for a specific question.
        Includes prompt, topic, learning objective, difficulty.
        """
        from app.services.question_repository import question_repository
        q = question_repository.get_question(question_id)
        if not q:
            return None

        curric_t = curriculum_registry.get_topic(q.topic_id)
        topic_name = curric_t.name if curric_t else q.topic_id.replace("_", " ").title()

        return {
            "question_id": q.id,
            "topic_id": q.topic_id,
            "topic_name": topic_name,
            "difficulty": q.difficulty.value,
            "learning_objective": q.learning_objective,
            "question_text": q.question_text,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "misconception_tags": q.misconception_tags
        }

context_builder = AIContextBuilder()
