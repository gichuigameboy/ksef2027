from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from app.dependencies.auth import get_current_user, _IN_MEMORY_USERS
from app.models.user import UserProfile, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])

class OnboardingRequest(BaseModel):
    display_name: str
    selected_subjects: List[str] = ["mathematics"]
    learning_level: Optional[str] = "Grade 10"

class AuthMeResponse(BaseModel):
    uid: str
    email: str
    display_name: str
    role: str
    onboarding_complete: bool
    enrolled_subjects: List[str]

@router.get("/me", response_model=AuthMeResponse)
async def get_my_profile(current_user: UserProfile = Depends(get_current_user)):
    """
    Returns the authenticated user's verified identity, role, and profile.
    Source of truth is the verified authentication token.
    """
    onboarding_done = len(current_user.enrolled_class_ids) > 0 or current_user.display_name != "Student"
    return AuthMeResponse(
        uid=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        role=current_user.role.value,
        onboarding_complete=onboarding_done,
        enrolled_subjects=current_user.enrolled_class_ids
    )

@router.post("/onboarding")
async def complete_onboarding(
    payload: OnboardingRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """
    Completes initial student onboarding: saves display name and initial subjects.
    """
    current_user.display_name = payload.display_name
    current_user.enrolled_class_ids = payload.selected_subjects
    _IN_MEMORY_USERS[current_user.id] = current_user
    
    return {
        "status": "success",
        "message": "Onboarding completed successfully.",
        "uid": current_user.id,
        "display_name": current_user.display_name,
        "enrolled_subjects": current_user.enrolled_class_ids
    }
