from fastapi import APIRouter, HTTPException
from typing import List
from app.curriculum.base import CurriculumSubject, CurriculumTopic
from app.curriculum.registry import curriculum_registry

router = APIRouter(prefix="/subjects", tags=["Curriculum & Subjects"])

@router.get("", response_model=List[CurriculumSubject])
async def list_subjects():
    """Returns all active curriculum subjects."""
    return curriculum_registry.get_all_subjects()

@router.get("/{subject_id}/topics", response_model=List[CurriculumTopic])
async def list_subject_topics(subject_id: str):
    """Returns topics and prerequisite dependencies for a specific subject."""
    topics = curriculum_registry.get_topics_for_subject(subject_id)
    if not topics:
        raise HTTPException(status_code=404, detail=f"Subject '{subject_id}' not found.")
    return topics
