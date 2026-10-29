from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.dependencies.auth import get_current_user, require_role
from app.models.user import UserProfile, UserRole
from app.models.student_registry import (
    StudentRecord,
    StudentRegisterRequest,
    StudentRegisterResponse,
    StudentUpdateRequest,
    StudentStatusUpdateRequest,
    BulkImportRequest,
    BulkImportResponse,
    AuditLogEntry,
    DashboardStats,
    AccountActivationRequest,
    StudentAuthRequest
)
from app.services.student_registry_repository import student_registry

router = APIRouter(prefix="/admin", tags=["Student Registry & IT Administration"])
auth_router = APIRouter(prefix="/auth", tags=["Student Authentication & Activation"])

ADMIN_ROLES = [UserRole.IT_ADMIN, UserRole.ADMIN, UserRole.SUPER_ADMIN]

# ── IT Administration Endpoints (Restricted to Admins) ──────────────────────

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_metrics(
    current_user: UserProfile = Depends(require_role(ADMIN_ROLES))
):
    """Returns overview statistics of registered students and accounts."""
    return student_registry.get_dashboard_stats()

@router.get("/students", response_model=List[StudentRecord])
async def list_registered_students(
    search: Optional[str] = Query(None, description="Search by name, admission number, or email"),
    grade_class: Optional[str] = Query(None, description="Filter by class or grade"),
    status: Optional[str] = Query(None, description="Filter by account status (active, pending_activation, suspended)"),
    sort_by: str = Query("created_at", description="Field to sort by (name, admission_number, grade_class, created_at)"),
    order: str = Query("desc", description="Sort order (asc, desc)"),
    current_user: UserProfile = Depends(require_role(ADMIN_ROLES))
):
    """Retrieves all registered students matching the query filters."""
    return student_registry.list_students(
        search=search,
        grade_class=grade_class,
        status=status,
        sort_by=sort_by,
        order=order
    )

@router.post("/students", response_model=StudentRegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_student(
    payload: StudentRegisterRequest,
    current_user: UserProfile = Depends(require_role(ADMIN_ROLES))
):
    """
    Registers a new student, provisions their account in pending status,
    and returns a single-use account activation code.
    """
    try:
        record, code = student_registry.register_student(
            admission_number=payload.admission_number,
            full_name=payload.full_name,
            grade_class=payload.grade_class,
            email=payload.email,
            notes=payload.notes,
            actor_id=current_user.id,
            actor_role=current_user.role.value
        )
        return StudentRegisterResponse(
            student=record,
            activation_code=code,
            message="Student registered successfully. Provide the single-use activation code to the student."
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT if "already registered" in str(e) else status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/students/{admission_number}", response_model=StudentRecord)
async def get_student_details(
    admission_number: str,
    current_user: UserProfile = Depends(require_role(ADMIN_ROLES))
):
    """Retrieves full profile and account details for a specific student."""
    record = student_registry.get_student(admission_number)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student '{admission_number}' not found."
        )
    return record

@router.put("/students/{admission_number}", response_model=StudentRecord)
async def update_student(
    admission_number: str,
    payload: StudentUpdateRequest,
    current_user: UserProfile = Depends(require_role(ADMIN_ROLES))
):
    """Updates an existing student's name, class, email, or notes."""
    try:
        return student_registry.update_student(
            admission_number=admission_number,
            full_name=payload.full_name,
            grade_class=payload.grade_class,
            email=payload.email,
            notes=payload.notes,
            actor_id=current_user.id,
            actor_role=current_user.role.value
        )
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/students/{admission_number}/status", response_model=StudentRecord)
async def set_student_status(
    admission_number: str,
    payload: StudentStatusUpdateRequest,
    current_user: UserProfile = Depends(require_role(ADMIN_ROLES))
):
    """Suspends or reactivates a student account with immediate enforcement."""
    try:
        return student_registry.set_account_status(
            admission_number=admission_number,
            status=payload.status,
            reason=payload.reason,
            actor_id=current_user.id,
            actor_role=current_user.role.value
        )
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/students/{admission_number}/reset-activation")
async def reset_activation_code(
    admission_number: str,
    current_user: UserProfile = Depends(require_role(ADMIN_ROLES))
):
    """Generates a fresh single-use activation code for a student account."""
    try:
        code = student_registry.reset_activation_code(
            admission_number=admission_number,
            actor_id=current_user.id,
            actor_role=current_user.role.value
        )
        return {
            "status": "success",
            "admission_number": admission_number.upper(),
            "activation_code": code,
            "message": "Activation code has been reset. The student must use this code to set their password."
        }
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.post("/students/bulk-import", response_model=BulkImportResponse)
async def bulk_import_students(
    payload: BulkImportRequest,
    current_user: UserProfile = Depends(require_role(ADMIN_ROLES))
):
    """Processes bulk CSV student registration with validation and duplicate prevention."""
    return student_registry.bulk_import(
        csv_text=payload.csv_content,
        actor_id=current_user.id,
        actor_role=current_user.role.value
    )

@router.get("/audit-logs", response_model=List[AuditLogEntry])
async def list_audit_logs(
    limit: int = Query(100, ge=1, le=1000),
    action: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: UserProfile = Depends(require_role(ADMIN_ROLES))
):
    """Retrieves immutable security and registration audit log records."""
    return student_registry.get_audit_logs(limit=limit, action=action, search=search)


# ── Student First-Time Setup & Authentication Endpoints ─────────────────────

@auth_router.post("/activate")
async def activate_student_account(payload: AccountActivationRequest):
    """
    First-time student account setup using single-use activation code.
    Student establishes their own password.
    """
    try:
        record = student_registry.activate_account(
            admission_number=payload.admission_number,
            activation_code=payload.activation_code,
            new_password=payload.new_password
        )
        return {
            "status": "success",
            "message": "Account activated successfully! You may now sign in.",
            "admission_number": record.admission_number,
            "full_name": record.full_name,
            "account_status": record.account_status.value
        }
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@auth_router.post("/student-login")
async def student_login(payload: StudentAuthRequest):
    """
    Authoritative student authentication endpoint.
    Enforces account suspension and password verification.
    """
    try:
        record = student_registry.authenticate_student(
            admission_number=payload.admission_number,
            password=payload.password
        )
        return {
            "status": "success",
            "token": f"token_student_{record.admission_number}",
            "user": {
                "admission_number": record.admission_number,
                "full_name": record.full_name,
                "grade_class": record.grade_class,
                "role": "student",
                "email": record.email
            }
        }
    except KeyError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admission number or password.")
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
