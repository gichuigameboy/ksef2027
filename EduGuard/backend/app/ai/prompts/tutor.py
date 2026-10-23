import json
from typing import Dict, Any, Optional

class TutorPromptBuilder:
    @staticmethod
    def build_tutor_prompt(
        context: Dict[str, Any],
        mode: str,
        user_message: Optional[str] = None,
        question_context: Optional[Dict[str, Any]] = None
    ) -> str:
        topic_name = context.get("topic_name", context.get("current_topic", "Topic"))
        mastery = context.get("mastery", 0.0)
        confidence = context.get("confidence", 0.5)
        trend = context.get("learning_trend", "stable")
        prereq_gaps = context.get("prerequisite_gaps", [])
        common_errors = context.get("common_errors", [])
        recommended_action = context.get("recommended_action", "PRACTICE")

        system_role = (
            "You are EduGuard AI, an expert, encouraging, and evidence-grounded educational tutor.\n"
            "You assist students by explaining concepts, breaking down steps, generating worked examples, "
            "and diagnosing misunderstandings.\n"
            "CRITICAL RULES:\n"
            "1. Ground all pedagogical decisions in the student's structured learning evidence.\n"
            "2. Never claim access to student personal information or information not provided in the context.\n"
            "3. If the student has low mastery, use simple language, smaller steps, and concrete examples.\n"
            "4. If the student has high mastery, use concise, rigorous, and application-focused reasoning.\n"
            "5. Never shame or criticize the student. Use supportive, constructive guidance.\n"
            "6. Output strictly valid JSON matching the specified schema with no extraneous markdown or conversational preamble.\n"
        )

        context_summary = {
            "topic": topic_name,
            "mastery_score": mastery,
            "confidence": confidence,
            "learning_trend": trend,
            "prerequisite_gaps": prereq_gaps,
            "common_errors": common_errors,
            "recommended_action": recommended_action
        }

        mode_instructions = {
            "explain": "Teach the foundational concept clearly, addressing common misconceptions and prerequisite relationships.",
            "hint": "Provide a gentle hint pointing toward the core concept without revealing the complete solution.",
            "step_by_step": "Deconstruct the problem or concept into clear, progressive, logical steps.",
            "simplify": "Explain the concept using simpler language, intuitive analogies, and elementary prerequisites.",
            "example": "Provide a fully worked concrete example demonstrating the exact reasoning process.",
            "check_understanding": "Present a short conceptual check question to assess whether the student grasped the concept.",
            "mistake_help": "Explain why common mistakes occur for this topic and how to systematically avoid them.",
            "challenge": "Present a deeper, higher-difficulty or transfer problem that extends this concept."
        }

        specific_instruction = mode_instructions.get(mode, mode_instructions["explain"])

        user_input_str = f"\nStudent Query: \"{user_message}\"" if user_message else ""
        q_context_str = f"\nCurrent Question Context: {json.dumps(question_context)}" if question_context else ""

        schema_format = {
            "explanation": "Clear pedagogical explanation tailored to the student's mastery level.",
            "key_concept": "The central principle or formula being applied.",
            "steps": ["Step 1 explanation", "Step 2 explanation"],
            "example": "A concrete worked example illustrating the concept.",
            "check_question": "A quick question to check the student's understanding.",
            "encouragement": "Supportive closing encouragement."
        }

        return (
            f"{system_role}\n"
            f"=== STRUCTURED LEARNING CONTEXT ===\n"
            f"{json.dumps(context_summary, indent=2)}\n"
            f"{q_context_str}\n"
            f"{user_input_str}\n\n"
            f"=== TUTOR MODE: {mode.upper()} ===\n"
            f"Instruction: {specific_instruction}\n\n"
            f"Respond ONLY with a valid JSON object strictly matching this schema:\n"
            f"{json.dumps(schema_format, indent=2)}"
        )

    @staticmethod
    def build_progressive_hint_prompt(
        context: Dict[str, Any],
        question_text: str,
        hint_level: int,
        correct_answer: str,
        explanation: str
    ) -> str:
        level_guidance = {
            1: "Hint 1: Point toward the relevant concept, property, or formula. DO NOT reveal the calculation or next step.",
            2: "Hint 2: Suggest the specific next operation or algebraic step to take.",
            3: "Hint 3: Provide strong guidance showing how to set up the final numbers or equations, but stop just short of final evaluation.",
            4: "Final Help: Provide the complete worked solution and explanation clearly."
        }

        guidance = level_guidance.get(hint_level, level_guidance[1])
        is_final = (hint_level >= 4)

        schema = {
            "hint_level": hint_level,
            "hint_text": "The targeted progressive hint.",
            "guidance": "Brief explanation of what the student should try next.",
            "is_final_solution": is_final
        }

        return (
            "You are EduGuard AI providing scaffolding hints for an active practice problem.\n"
            "Follow the progressive hint protocol:\n"
            f"- Current requested hint level: {hint_level} (Level 1 = conceptual pointer, Level 2 = next operation, Level 3 = strong setup, Level 4 = full solution).\n"
            f"- Constraint: {guidance}\n\n"
            f"Problem: {question_text}\n"
            f"Correct Answer: {correct_answer}\n"
            f"Full Solution: {explanation}\n\n"
            "Respond ONLY with a valid JSON object matching this schema:\n"
            f"{json.dumps(schema, indent=2)}"
        )
