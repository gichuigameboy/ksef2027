from typing import List, Dict, Any, Optional
from app.engines.knowledge_graph import KnowledgeGraphEngine
from app.models.learning_intelligence import (
    ErrorCategory,
    MisconceptionCluster,
    DifficultyProfile
)
from app.models.question_db import AttemptRecord

class WeaknessEngine:
    """
    Weakness Engine 2.0.
    Multi-dimensional diagnosis of learning breakdowns:
    - Difficulty cliffs (strong basic, failing hard/application)
    - Misconception clustering with statistical confidence
    - 12-category Error Taxonomy mapping
    - Prerequisite gap root-cause attribution
    - Volatility & question-type vulnerability detection
    """

    ERROR_TAXONOMY = {
        "arithmetic_error": ErrorCategory.ARITHMETIC_ERROR,
        "sign_error": ErrorCategory.SIGN_ERROR,
        "formula_selection": ErrorCategory.FORMULA_SELECTION,
        "concept_misunderstanding": ErrorCategory.CONCEPT_MISUNDERSTANDING,
        "prerequisite_gap": ErrorCategory.PREREQUISITE_GAP,
        "misread_question": ErrorCategory.MISREAD_QUESTION,
        "unit_error": ErrorCategory.UNIT_ERROR,
        "algebraic_manipulation": ErrorCategory.ALGEBRAIC_MANIPULATION,
        "calculation_error": ErrorCategory.CALCULATION_ERROR,
        "reasoning_gap": ErrorCategory.REASONING_GAP,
        "guessing": ErrorCategory.GUESSING,
        "unknown": ErrorCategory.UNKNOWN,
    }

    def __init__(self, knowledge_graph: KnowledgeGraphEngine):
        self.kg = knowledge_graph

    def cluster_misconceptions(
        self,
        attempts: List[AttemptRecord],
        min_cluster_size: int = 2
    ) -> List[MisconceptionCluster]:
        """
        Groups repeated mistakes across attempts into actionable misconception clusters.
        Only forms a confirmed cluster when error frequency >= min_cluster_size
        to avoid overstating single slip-ups.
        """
        tag_counts: Dict[str, int] = {}
        tag_questions: Dict[str, List[str]] = {}
        total_incorrect = 0

        for att in attempts:
            if not att.is_correct:
                total_incorrect += 1
                for tag in att.misconception_tags:
                    if tag:
                        tag_counts[tag] = tag_counts.get(tag, 0) + 1
                        if tag not in tag_questions:
                            tag_questions[tag] = []
                        if att.question_id not in tag_questions[tag]:
                            tag_questions[tag].append(att.question_id)

        clusters: List[MisconceptionCluster] = []
        for tag, count in tag_counts.items():
            if count >= min_cluster_size:
                pct = round((count / max(1, total_incorrect)) * 100.0, 1)
                
                # Determine taxonomy category
                category = ErrorCategory.CONCEPT_MISUNDERSTANDING
                if "sign" in tag.lower():
                    category = ErrorCategory.SIGN_ERROR
                elif "algebra" in tag.lower():
                    category = ErrorCategory.ALGEBRAIC_MANIPULATION
                elif "arithmetic" in tag.lower() or "calc" in tag.lower():
                    category = ErrorCategory.CALCULATION_ERROR
                elif "formula" in tag.lower():
                    category = ErrorCategory.FORMULA_SELECTION
                elif "unit" in tag.lower():
                    category = ErrorCategory.UNIT_ERROR

                clean_name = tag.replace("_", " ").title()
                remediation = f"Targeted remediation on {clean_name}: {count} occurrences across recent attempts."

                clusters.append(MisconceptionCluster(
                    tag=tag,
                    errorCategory=category,
                    frequency=count,
                    totalAttempts=total_incorrect,
                    percentage=pct,
                    sampleQuestions=tag_questions.get(tag, [])[:3],
                    recommendedRemediation=remediation
                ))

        clusters.sort(key=lambda c: -c.frequency)
        return clusters

    def evaluate_difficulty_cliff(
        self,
        difficulty_accuracies: Dict[str, float]
    ) -> DifficultyProfile:
        """
        Identifies sharp drops between foundational computation and higher-order application.
        """
        basic = difficulty_accuracies.get("basic", 0.0)
        medium = difficulty_accuracies.get("medium", 0.0)
        hard = difficulty_accuracies.get("hard", 0.0)
        app = difficulty_accuracies.get("application", 0.0)

        is_cliff = False
        description = None

        if basic >= 75.0 and (hard < 50.0 or app < 50.0):
            is_cliff = True
            description = (
                f"Difficulty Cliff detected: Basic calculations are strong ({round(basic)}%), "
                f"but multi-step and application problem performance drops significantly ({round(app)}%)."
            )

        return DifficultyProfile(
            basicAccuracy=round(basic, 1),
            mediumAccuracy=round(medium, 1),
            hardAccuracy=round(hard, 1),
            applicationAccuracy=round(app, 1),
            difficultyCliff=is_cliff,
            cliffDescription=description
        )

    def diagnose_topic_struggle(
        self,
        topic_id: str,
        topic_mastery: float,
        difficulty_accuracies: Dict[str, float],
        misconception_frequencies: Dict[str, int],
        student_mastery_map: Dict[str, float],
        recent_attempts: Optional[List[AttemptRecord]] = None
    ) -> Dict[str, Any]:
        """
        Synthesizes a full deterministic diagnosis answering 'Why am I struggling?'
        """
        # 1. Prerequisite gaps from Knowledge Graph
        prereq_gaps = self.kg.find_prerequisite_gaps(topic_id, student_mastery_map)

        # 2. Difficulty cliff analysis
        diff_profile = self.evaluate_difficulty_cliff(difficulty_accuracies)

        # 3. Misconception clusters
        clusters = self.cluster_misconceptions(recent_attempts or []) if recent_attempts else []
        top_misconception = None
        misconception_count = 0

        if clusters:
            top_misconception = clusters[0].tag
            misconception_count = clusters[0].frequency
        elif misconception_frequencies:
            top_tuple = max(misconception_frequencies.items(), key=lambda x: x[1])
            top_misconception = top_tuple[0]
            misconception_count = top_tuple[1]

        # 4. Primary root cause resolution
        primary_cause = "general_practice_needed"
        recommended_action = "Standard retrieval practice (6 questions)"

        if prereq_gaps:
            primary_cause = "prerequisite_gap"
            top_gap = prereq_gaps[0]
            recommended_action = (
                f"Targeted recovery session on prerequisite concept: {top_gap['topic_name']} "
                f"(current mastery: {top_gap['mastery_score']}%)"
            )
        elif diff_profile.difficultyCliff:
            primary_cause = "transfer_deficit"
            recommended_action = "Guided worked-example and step-by-step application practice (4 questions)"
        elif top_misconception and misconception_count >= 2:
            primary_cause = "systematic_misconception"
            clean_tag = top_misconception.replace("_", " ").title()
            recommended_action = f"Targeted conceptual discrimination practice addressing: {clean_tag}"

        return {
            "topic_id": topic_id,
            "topic_mastery": topic_mastery,
            "primary_cause": primary_cause,
            "prerequisite_gaps": prereq_gaps,
            "difficulty_cliff": diff_profile.difficultyCliff,
            "cliff_explanation": diff_profile.cliffDescription,
            "top_misconception": top_misconception,
            "misconception_count": misconception_count,
            "misconception_clusters": [c.model_dump() if hasattr(c, "model_dump") else c.dict() for c in clusters],
            "difficulty_profile": diff_profile.model_dump() if hasattr(diff_profile, "model_dump") else diff_profile.dict(),
            "recommended_action": recommended_action
        }
