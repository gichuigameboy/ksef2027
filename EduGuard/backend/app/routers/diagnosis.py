from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from app.dependencies.auth import get_current_user
from app.models.user import UserProfile
from app.services.attempt_repository import attempt_repository
from app.curriculum.registry import curriculum_registry

router = APIRouter(prefix="/diagnosis", tags=["Diagnosis & Root Causes"])

@router.get("/why-struggling/{topic_id}")
async def why_am_i_struggling(
    topic_id: str,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Examines the root causes behind a student's difficulty in a given topic using real student data:
    - Prerequisite knowledge gaps (e.g. Factorisation weak for Quadratics)
    - Difficulty cliff (mechanical computation vs conceptual transfer)
    - Systematic misconception patterns
    """
    mastery_record = attempt_repository.get_topic_mastery(current_user.id, topic_id)
    curric_t = curriculum_registry.get_topic(topic_id)
    topic_name = curric_t.name if curric_t else topic_id.replace("_", " ").title()

    if not mastery_record:
        # If student hasn't practiced, return initial guidance
        return {
            "topic_id": topic_id,
            "topic_name": topic_name,
            "topic_mastery": 0.0,
            "primary_cause": "no_data",
            "prerequisite_gaps": [],
            "difficulty_cliff": False,
            "cliff_explanation": None,
            "top_misconception": None,
            "misconception_count": 0,
            "recommended_action": f"Complete a baseline diagnostic assessment on {topic_name}."
        }

    diff_accuracies = {
        "basic": mastery_record.basic_accuracy,
        "medium": mastery_record.medium_accuracy,
        "hard": mastery_record.hard_accuracy,
        "application": mastery_record.application_accuracy
    }

    all_masteries = attempt_repository.get_all_student_masteries(current_user.id)
    mastery_map = {m.topic_id: m.mastery_score for m in all_masteries}

    # Extract student's misconception frequency from actual attempts
    attempts = attempt_repository.get_student_attempts(current_user.id)
    topic_attempts = [a for a in attempts if a.topic_id == topic_id and not a.is_correct]
    
    misconceptions: Dict[str, int] = {}
    for a in topic_attempts:
        for tag in a.misconception_tags:
            misconceptions[tag] = misconceptions.get(tag, 0) + 1

    diagnosis = attempt_repository.weakness_engine.diagnose_topic_struggle(
        topic_id=topic_id,
        topic_mastery=mastery_record.mastery_score,
        difficulty_accuracies=diff_accuracies,
        misconception_frequencies=misconceptions,
        student_mastery_map=mastery_map
    )

    diagnosis["topic_name"] = topic_name
    return diagnosis
