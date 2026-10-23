import json
from typing import Dict, Any, Optional

class MistakeAnalysisPromptBuilder:
    @staticmethod
    def build_mistake_analysis_prompt(
        question_text: str,
        student_answer: str,
        correct_answer: str,
        topic_name: str,
        mastery_score: float,
        deterministic_error_category: Optional[str] = None,
        explanation: Optional[str] = None
    ) -> str:
        schema = {
            "likely_error": "Clear, objective description of where the student's reasoning deviated.",
            "explanation": "Supportive explanation of why this error happens and how to correct it.",
            "teaching_focus": "The specific principle or formula that needs reinforcement.",
            "confidence": "high",  # Must be 'low', 'medium', or 'high'
            "concept_to_remember": "A memorable rule or mnemonic.",
            "mini_example": "A smaller, simpler 2-step example showing the correct method.",
            "quick_check": "A rapid 1-step verification question."
        }

        return (
            "You are EduGuard AI, an expert pedagogical diagnostician analyzing a student's incorrect response.\n"
            "CRITICAL GUIDELINES:\n"
            "1. Be respectful and constructive. Frame mistakes as natural stepping stones in learning.\n"
            "2. Identify the root conceptual or procedural breakdown, not just that the answer was wrong.\n"
            "3. Assess your confidence in this diagnosis honestly as 'low', 'medium', or 'high'. "
            "If the student's answer seems like a random typo or guess, rate confidence as 'low'.\n"
            "4. Provide a mini-example and quick check question to solidify the correct concept.\n\n"
            f"=== EVIDENCE ===\n"
            f"- Topic: {topic_name} (Current student mastery: {mastery_score}%)\n"
            f"- Question: {question_text}\n"
            f"- Student's Answer: {student_answer}\n"
            f"- Correct Answer: {correct_answer}\n"
            f"- Standard Solution: {explanation or 'N/A'}\n"
            f"- Deterministic Error Hint: {deterministic_error_category or 'Unknown'}\n\n"
            "Respond ONLY with a valid JSON object matching this schema:\n"
            f"{json.dumps(schema, indent=2)}"
        )
