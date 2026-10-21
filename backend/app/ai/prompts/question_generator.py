import json
from typing import Dict, Any, Optional

class QuestionPromptBuilder:
    @staticmethod
    def build_question_generation_prompt(
        subject_name: str,
        topic_name: str,
        learning_objective: str,
        difficulty: str,
        count: int = 3,
        target_misconception: Optional[str] = None,
        prerequisites: Optional[list] = None
    ) -> str:
        misconception_instruction = (
            f"- TARGET MISCONCEPTION: Specifically target '{target_misconception}'. "
            "Design at least one plausible distractor option that directly catches this specific error."
            if target_misconception
            else "- Ensure distractor options represent authentic, commonly observed conceptual misunderstandings."
        )

        schema = {
            "questions": [
                {
                    "questionText": "Clear, unambiguous question prompt.",
                    "difficulty": difficulty,
                    "questionType": "multiple_choice",
                    "options": [
                        {
                            "id": "opt_a",
                            "text": "First option text",
                            "is_correct": True,
                            "distractor_explanation": None,
                            "misconception_tag": None
                        },
                        {
                            "id": "opt_b",
                            "text": "Second option text (distractor)",
                            "is_correct": False,
                            "distractor_explanation": "Why this distractor happens",
                            "misconception_tag": target_misconception or "sign_error"
                        },
                        {
                            "id": "opt_c",
                            "text": "Third option text",
                            "is_correct": False,
                            "distractor_explanation": "Why this distractor happens",
                            "misconception_tag": "calculation_error"
                        },
                        {
                            "id": "opt_d",
                            "text": "Fourth option text",
                            "is_correct": False,
                            "distractor_explanation": "Why this distractor happens",
                            "misconception_tag": "concept_misunderstanding"
                        }
                    ],
                    "correctAnswer": "opt_a",
                    "explanation": "Clear step-by-step mathematical/conceptual solution explaining why the answer is correct.",
                    "hint": "Scaffolding hint for students who need a nudge.",
                    "misconceptionTags": [target_misconception] if target_misconception else ["concept_misunderstanding"],
                    "learningObjective": learning_objective
                }
            ]
        }

        return (
            "You are EduGuard AI, an authoritative question generation engine for rigorous secondary and collegiate curricula.\n"
            "Generate practice questions strictly adhering to the deterministic constraints below.\n\n"
            f"=== CURRICULUM CONSTRAINTS ===\n"
            f"- Subject: {subject_name}\n"
            f"- Topic: {topic_name}\n"
            f"- Learning Objective: {learning_objective}\n"
            f"- Target Difficulty: {difficulty}\n"
            f"- Quantity: Exactly {count} distinct question(s)\n"
            f"- Prerequisites to connect: {prerequisites or []}\n"
            f"{misconception_instruction}\n\n"
            "=== QUALITY REQUIREMENTS ===\n"
            "1. Every question must have exactly ONE unambiguously correct option.\n"
            "2. Distractors must be mathematically or scientifically authentic, not random nonsense.\n"
            "3. Explanations must be thorough and educational.\n"
            "4. Match the requested difficulty level accurately.\n"
            "5. Respond ONLY with valid JSON strictly conforming to this schema:\n"
            f"{json.dumps(schema, indent=2)}"
        )
