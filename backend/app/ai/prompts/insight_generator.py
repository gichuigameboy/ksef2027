import json
from typing import Dict, Any, List

class InsightPromptBuilder:
    @staticmethod
    def build_insight_prompt(metrics: Dict[str, Any]) -> str:
        schema = {
            "what_noticed": "Supportive observation of actual student trajectory grounded directly in the numbers.",
            "focus_next": "The specific bottleneck or highest-leverage area to address next.",
            "suggested_strategy": "Concrete, actionable habit or practice routine to apply."
        }

        return (
            "You are EduGuard AI, translating authoritative deterministic learning metrics into natural, encouraging student insights.\n"
            "CRITICAL RULES:\n"
            "1. Ground every statement STRICTLY in the provided numbers and facts.\n"
            "2. DO NOT invent, hallucinate, or alter any numbers, percentages, or topics.\n"
            "3. Frame progress constructively. Highlight real gains while identifying the next frontier.\n\n"
            f"=== DETERMINISTIC METRICS ===\n"
            f"{json.dumps(metrics, indent=2)}\n\n"
            "Respond ONLY with a valid JSON object strictly conforming to this schema:\n"
            f"{json.dumps(schema, indent=2)}"
        )

    @staticmethod
    def build_study_plan_prompt(
        recommended_actions: List[Dict[str, Any]],
        retention_risks: List[Dict[str, Any]],
        prerequisite_gaps: List[Dict[str, Any]],
        total_time_minutes: int
    ) -> str:
        schema = {
            "overview": "A clear, motivating summary of today's optimized learning roadmap.",
            "total_minutes": total_time_minutes,
            "steps": [
                {
                    "step_number": 1,
                    "topic_id": "topic_id",
                    "topic_name": "Topic Name",
                    "action_type": "PREREQUISITE_RECOVERY",
                    "allocated_minutes": 10,
                    "pedagogical_reason": "Why this comes first"
                }
            ],
            "encouragement": "Positive motivating statement."
        }

        return (
            "You are EduGuard AI, formulating a clear, personalized study plan for a student.\n"
            "CRITICAL RULES:\n"
            "1. You MUST preserve the exact priority order of the deterministic recommended actions provided.\n"
            "2. Explain WHY each topic is placed in its specific order using the pedagogical rationale provided.\n"
            "3. Do not add arbitrary topics that are not in the provided evidence.\n\n"
            f"=== DETERMINISTIC RECOMMENDATIONS (IN PRIORITY ORDER) ===\n"
            f"{json.dumps(recommended_actions, indent=2)}\n\n"
            f"=== RETENTION RISKS ===\n"
            f"{json.dumps(retention_risks, indent=2)}\n\n"
            f"=== PREREQUISITE GAPS ===\n"
            f"{json.dumps(prerequisite_gaps, indent=2)}\n\n"
            "Respond ONLY with a valid JSON object strictly matching this schema:\n"
            f"{json.dumps(schema, indent=2)}"
        )
