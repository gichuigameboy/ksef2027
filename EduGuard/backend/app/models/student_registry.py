from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AccountStatus(str, Enum):
    ACTIVE = "active"
    PENDING_ACTIVATION = "pending_activation"
    SUSPENDED = "suspended"

class StudentRecord(BaseModel):
    admission_number: str
    full_name: str
    grade_class: str
    email: Optional[str] = None
    role: str = "student"
    account_status: AccountStatus = AccountStatus.PENDING_ACTIVATION
    created_at: str
    updated_at: str
    last_login_at: Optional[str] = None
    created_by: str = "it_admin"
    activation_code_hash: Optional[str] = None
    password_hash: Optional[str] = None
    password_salt: Optional[str] = None
    suspension_reason: Optional[str] = None
    notes: Optional[str] = None

class StudentRegisterRequest(BaseModel):
    admission_number: str
    full_name: str
    grade_class: str
    email: Optional[str] = None
    notes: Optional[str] = None

class StudentRegisterResponse(BaseModel):
    student: StudentRecord
    activation_code: Optional[str] = None
    message: str

class StudentUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    grade_class: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

class StudentStatusUpdateRequest(BaseModel):
    status: AccountStatus
    reason: Optional[str] = None

class BulkImportRow(BaseModel):
    row_index: int
    name: str
    admission_number: str
    grade_class: str
    email: Optional[str] = None
    status: str
    error_message: Optional[str] = None

class BulkImportRequest(BaseModel):
    csv_content: str

class BulkImportResponse(BaseModel):
    total_rows: int
    imported_count: int
    skipped_count: int
    failed_count: int
    new_students: List[Dict[str, Any]]
    errors: List[str]

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    actor_id: str
    actor_role: str
    action: str
    target_id: str
    target_name: str
    details: str
    outcome: str = "SUCCESS"

class DashboardStats(BaseModel):
    total_students: int
    active_accounts: int
    pending_activation: int
    suspended_accounts: int
    recent_registrations: List[StudentRecord]

class AccountActivationRequest(BaseModel):
    admission_number: str
    activation_code: str
    new_password: str

class StudentAuthRequest(BaseModel):
    admission_number: str
    password: str
