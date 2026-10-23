import json
from typing import Dict, Any, Optional

class ExplanationPromptBuilder:
    @staticmethod
    def build_personalized_explanation_prompt(
        topic_name: str,
        learning_objective: str,
        mastery_score: float,
        prerequisite_gaps: list,
        common_errors: list,
        concept_detail: Optional[str] = None
    ) -> str:
        is_weak = mastery_score < 60.0
        is_strong = mastery_score >= 80.0

        if is_weak:
            pedagogical_tone = (
                "The student has developing/weak mastery. Use simple, direct language, "
                "break everything into bite-sized micro-steps, use intuitive real-world or visual analogies, "
                "and explicitly address prerequisite connections. Be encouraging and supportive: "
                "e.g., 'Let's rebuild this step from the part that seems to be causing difficulty.'"
            )
        elif is_strong:
            pedagogical_tone = (
                "The student has high mastery. Be concise, mathematically and conceptually rigorous, "
                "focus on high-level reasoning, edge cases, and practical application scenarios."
            )
        else:
            pedagogical_tone = (
                "The student has intermediate mastery. Reinforce core principles, provide a balanced "
                "step-by-step reasoning chain, and highlight common pitfalls."
            )

        schema = {
            "explanation": "Personalized explanation suited to the student's mastery level.",
            "key_concept": "Core rule or invariant.",
            "steps": ["Step 1", "Step 2", "Step 3"],
            "example": "Worked example tailored to current mastery level.",
            "check_question": "A concise question checking understanding.",
            "encouragement": "Supportive closing phrase."
        }

        return (
            "You are EduGuard AI, generating a personalized educational concept explanation.\n"
            f"Topic: {topic_name}\n"
            f"Learning Objective: {learning_objective}\n"
            f"Student Mastery Score: {mastery_score}%\n"
            f"Prerequisite Gaps: {prerequisite_gaps}\n"
            f"Common Student Errors: {common_errors}\n"
            f"Additional Detail: {concept_detail or 'None'}\n\n"
            f"Pedagogical Tone & Instructions: {pedagogical_tone}\n\n"
            "Return ONLY valid JSON matching this schema:\n"
            f"{json.dumps(schema, indent=2)}"
        )
