import json
from typing import Optional

class NotesAnalysisPromptBuilder:
    @staticmethod
    def build_notes_analysis_prompt(
        notes_text: str,
        topic_hint: Optional[str] = None,
        subject_hint: Optional[str] = None
    ) -> str:
        schema = {
            "summary": "Concise structured summary of the notes provided.",
            "key_concepts": [
                {
                    "name": "Concept Name",
                    "definition": "Exact definition or description according to the notes.",
                    "importance": "Why this concept matters in this subject."
                }
            ],
            "definitions": {
                "Term 1": "Definition 1",
                "Term 2": "Definition 2"
            },
            "practice_questions": [
                {
                    "questionText": "A practice question testing comprehension of these notes.",
                    "difficulty": "medium",
                    "questionType": "multiple_choice",
                    "options": [
                        {"id": "opt_a", "text": "Correct Option", "is_correct": True},
                        {"id": "opt_b", "text": "Plausible Distractor", "is_correct": False},
                        {"id": "opt_c", "text": "Another Distractor", "is_correct": False},
                        {"id": "opt_d", "text": "Third Distractor", "is_correct": False}
                    ],
                    "correctAnswer": "opt_a",
                    "explanation": "Explanation linking directly to the student's notes.",
                    "hint": "Hint referencing the notes text.",
                    "misconceptionTags": ["notes_comprehension"]
                }
            ],
            "flashcards": [
                {
                    "front": "Prompt / Question / Term",
                    "back": "Key Concept / Answer / Definition"
                }
            ],
            "suggested_prerequisites": ["Prerequisite topic 1", "Prerequisite topic 2"]
        }

        return (
            "You are EduGuard AI, an educational study material analyzer.\n"
            "Analyze the provided student study notes or textbook excerpt:\n"
            "1. Synthesize a lucid summary capturing primary relationships.\n"
            "2. Extract core concepts and definitions.\n"
            "3. Generate targeted flashcards (front/back) for active retrieval.\n"
            "4. Generate 2 rigorous multiple-choice practice questions testing these concepts.\n"
            "5. Suggest foundational prerequisite concepts necessary to understand these notes.\n\n"
            f"Context Hints: Subject='{subject_hint or 'General'}', Topic='{topic_hint or 'Unspecified'}'\n\n"
            f"=== STUDENT NOTES ===\n"
            f"{notes_text}\n\n"
            "Respond ONLY with a valid JSON object strictly matching this schema:\n"
            f"{json.dumps(schema, indent=2)}"
        )
