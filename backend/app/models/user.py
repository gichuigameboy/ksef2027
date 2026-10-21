from enum import Enum
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class UserProfile(BaseModel):
    id: str
    email: str
    display_name: str
    role: UserRole = UserRole.STUDENT
    school_id: Optional[str] = None
    enrolled_class_ids: List[str] = []
    created_at: datetime = datetime.utcnow()
    last_active_at: datetime = datetime.utcnow()

class UserTokenPayload(BaseModel):
    uid: str
    email: Optional[str] = None
    role: UserRole = UserRole.STUDENT
