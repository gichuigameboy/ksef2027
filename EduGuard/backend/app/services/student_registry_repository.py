import os
import csv
import io
import json
import uuid
import secrets
import hashlib
from datetime import datetime
from typing import List, Dict, Optional, Tuple, Any

from app.models.student_registry import (
    StudentRecord,
    AccountStatus,
    AuditLogEntry,
    DashboardStats,
    BulkImportResponse
)

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
STUDENTS_FILE = os.path.join(DATA_DIR, "student_registry.json")
AUDIT_FILE = os.path.join(DATA_DIR, "audit_logs.json")

def _hash_code(code: str) -> str:
    """Returns SHA-256 hash of an activation code."""
    return hashlib.sha256(code.strip().upper().encode("utf-8")).hexdigest()

def _hash_password(password: str, salt: str) -> str:
    """Returns salted SHA-256 hash for student password."""
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def _generate_activation_code() -> str:
    """Generates a secure, human-readable single-use code like DAW-7492-X8K."""
    part1 = secrets.token_hex(2).upper()
    part2 = secrets.token_hex(2).upper()
    return f"DAW-{part1}-{part2}"

class StudentRegistryRepository:
    def __init__(self):
        self._students: Dict[str, StudentRecord] = {}
        self._audit_logs: List[AuditLogEntry] = []
        self._ensure_storage()
        self._load()

    def _ensure_storage(self):
        os.makedirs(DATA_DIR, exist_ok=True)

    def _seed_defaults(self):
        """Seeds standard baseline DawamuOS student accounts if storage is empty."""
        initial = [
            ("1001", "Brian Ochieng", "Form 1 East", "brian.ochieng@dawamu.ac.ke"),
            ("1002", "Kevin Mwangi", "Form 1 East", "kevin.mwangi@dawamu.ac.ke"),
            ("1003", "Daniel Kiprop", "Form 1 West", "daniel.kiprop@dawamu.ac.ke"),
            ("1004", "Samuel Otieno", "Form 2 North", "samuel.otieno@dawamu.ac.ke"),
            ("1005", "James Kamau", "Form 2 North", "james.kamau@dawamu.ac.ke"),
            ("1006", "Peter Wanjiru", "Form 2 South", "peter.wanjiru@dawamu.ac.ke"),
            ("1007", "Victor Nyamweya", "Form 3 Science", "victor.nyamweya@dawamu.ac.ke"),
            ("1008", "Martin Kibet", "Form 3 Science", "martin.kibet@dawamu.ac.ke"),
            ("1009", "Emmanuel Odhiambo", "Form 3 Arts", "emmanuel.odhiambo@dawamu.ac.ke"),
            ("1010", "Dennis Mutua", "Form 4 KCSE", "dennis.mutua@dawamu.ac.ke"),
            ("1011", "Collins Wekesa", "Form 4 KCSE", "collins.wekesa@dawamu.ac.ke"),
            ("1012", "Patrick Njoroge", "Form 4 KCSE", "patrick.njoroge@dawamu.ac.ke"),
            ("2001", "Alex Maina", "Form 1 West", "alex.maina@dawamu.ac.ke"),
            ("2002", "Ryan Karanja", "Form 1 West", "ryan.karanja@dawamu.ac.ke"),
            ("2003", "Felix Otieno", "Form 2 South", "felix.otieno@dawamu.ac.ke"),
            ("2004", "Ian Cheruiyot", "Form 2 South", "ian.cheruiyot@dawamu.ac.ke"),
            ("2005", "Oscar Wambua", "Form 3 Arts", "oscar.wambua@dawamu.ac.ke"),
            ("2006", "Trevor Ndirangu", "Form 3 Arts", "trevor.ndirangu@dawamu.ac.ke"),
            ("2007", "Allan Simiyu", "Form 4 KCSE", "allan.simiyu@dawamu.ac.ke"),
            ("2008", "George Barasa", "Form 4 KCSE", "george.barasa@dawamu.ac.ke"),
        ]

        now = datetime.utcnow().isoformat() + "Z"
        for adm, name, grade, email in initial:
            salt = secrets.token_hex(8)
            # Default demo password 'dawamu2026' or 'student123'
            default_pass = "student123" if adm.startswith("200") else "dawamu2026"
            rec = StudentRecord(
                admission_number=adm,
                full_name=name,
                grade_class=grade,
                email=email,
                role="student",
                account_status=AccountStatus.ACTIVE,
                created_at=now,
                updated_at=now,
                last_login_at=now,
                created_by="system_seeder",
                password_salt=salt,
                password_hash=_hash_password(default_pass, salt),
                notes="Standard Dawamu baseline student account"
            )
            self._students[adm] = rec

        # Initial audit log
        self._audit_logs.append(
            AuditLogEntry(
                id=f"audit_{uuid.uuid4().hex[:12]}",
                timestamp=now,
                actor_id="system",
                actor_role="system",
                action="SYSTEM_INIT",
                target_id="ALL",
                target_name="Baseline Student Accounts",
                details="Initialized 20 baseline DawamuOS student records with active accounts.",
                outcome="SUCCESS"
            )
        )
        self._save()

    def _load(self):
        """Loads students and audit logs from disk, or seeds defaults."""
        if os.path.exists(STUDENTS_FILE):
            try:
                with open(STUDENTS_FILE, "r", encoding="utf-8") as f:
                    raw_data = json.load(f)
                    self._students = {k: StudentRecord(**v) for k, v in raw_data.items()}
            except Exception:
                self._seed_defaults()
        else:
            self._seed_defaults()

        if os.path.exists(AUDIT_FILE):
            try:
                with open(AUDIT_FILE, "r", encoding="utf-8") as f:
                    raw_logs = json.load(f)
                    self._audit_logs = [AuditLogEntry(**item) for item in raw_logs]
            except Exception:
                pass

    def _save(self):
        """Persists students and audit logs safely to disk."""
        try:
            with open(STUDENTS_FILE, "w", encoding="utf-8") as f:
                dump_data = {
                    k: (v.model_dump() if hasattr(v, "model_dump") else v.dict())
                    for k, v in self._students.items()
                }
                json.dump(dump_data, f, indent=2)
            with open(AUDIT_FILE, "w", encoding="utf-8") as f:
                dump_logs = [
                    (item.model_dump() if hasattr(item, "model_dump") else item.dict())
                    for item in self._audit_logs
                ]
                json.dump(dump_logs, f, indent=2)
        except Exception as e:
            print(f"[StudentRegistryRepository] Error saving data: {e}")

    def log_event(
        self,
        actor_id: str,
        actor_role: str,
        action: str,
        target_id: str,
        target_name: str,
        details: str,
        outcome: str = "SUCCESS"
    ):
        """Records an immutable audit event."""
        entry = AuditLogEntry(
            id=f"audit_{int(datetime.utcnow().timestamp() * 1000)}_{secrets.token_hex(3)}",
            timestamp=datetime.utcnow().isoformat() + "Z",
            actor_id=actor_id,
            actor_role=actor_role,
            action=action,
            target_id=target_id,
            target_name=target_name,
            details=details,
            outcome=outcome
        )
        self._audit_logs.insert(0, entry) # newest first
        # Keep recent 2000 logs
        if len(self._audit_logs) > 2000:
            self._audit_logs = self._audit_logs[:2000]
        self._save()

    def get_dashboard_stats(self) -> DashboardStats:
        students = list(self._students.values())
        total = len(students)
        active = sum(1 for s in students if s.account_status == AccountStatus.ACTIVE)
        pending = sum(1 for s in students if s.account_status == AccountStatus.PENDING_ACTIVATION)
        suspended = sum(1 for s in students if s.account_status == AccountStatus.SUSPENDED)

        # Sort by created_at descending for recent registrations
        sorted_recent = sorted(students, key=lambda s: s.created_at, reverse=True)[:5]

        return DashboardStats(
            total_students=total,
            active_accounts=active,
            pending_activation=pending,
            suspended_accounts=suspended,
            recent_registrations=sorted_recent
        )

    def list_students(
        self,
        search: Optional[str] = None,
        grade_class: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: str = "created_at",
        order: str = "desc"
    ) -> List[StudentRecord]:
        results = list(self._students.values())

        if search:
            q = search.lower().strip()
            results = [
                s for s in results
                if q in s.admission_number.lower()
                or q in s.full_name.lower()
                or (s.email and q in s.email.lower())
                or q in s.grade_class.lower()
            ]

        if grade_class and grade_class.lower() != "all":
            gc = grade_class.lower().strip()
            results = [s for s in results if gc in s.grade_class.lower()]

        if status and status.lower() != "all":
            st = status.lower().strip()
            results = [s for s in results if s.account_status.value == st]

        # Sorting
        reverse = (order.lower() == "desc")
        if sort_by == "name":
            results.sort(key=lambda s: s.full_name.lower(), reverse=reverse)
        elif sort_by == "admission_number":
            results.sort(key=lambda s: s.admission_number.lower(), reverse=reverse)
        elif sort_by == "grade_class":
            results.sort(key=lambda s: s.grade_class.lower(), reverse=reverse)
        else: # created_at
            results.sort(key=lambda s: s.created_at, reverse=reverse)

        return results

    def get_student(self, admission_number: str) -> Optional[StudentRecord]:
        key = admission_number.strip().upper()
        for k, v in self._students.items():
            if k.upper() == key:
                return v
        return None

    def register_student(
        self,
        admission_number: str,
        full_name: str,
        grade_class: str,
        email: Optional[str] = None,
        notes: Optional[str] = None,
        actor_id: str = "it_admin",
        actor_role: str = "it_admin"
    ) -> Tuple[StudentRecord, str]:
        """Registers a new student, provisions pending account, and generates single-use code."""
        adm = admission_number.strip().upper()
        if not adm:
            raise ValueError("Admission number cannot be empty.")
        if not full_name or not full_name.strip():
            raise ValueError("Student full name cannot be empty.")
        if not grade_class or not grade_class.strip():
            raise ValueError("Grade/Class cannot be empty.")

        if self.get_student(adm) is not None:
            self.log_event(
                actor_id=actor_id,
                actor_role=actor_role,
                action="STUDENT_REGISTRATION_FAILED",
                target_id=adm,
                target_name=full_name.strip(),
                details=f"Duplicate admission number conflict: {adm} already exists.",
                outcome="FAILED"
            )
            raise ValueError(f"Admission number '{adm}' is already registered in the system.")

        code = _generate_activation_code()
        code_hash = _hash_code(code)
        now = datetime.utcnow().isoformat() + "Z"

        record = StudentRecord(
            admission_number=adm,
            full_name=full_name.strip(),
            grade_class=grade_class.strip(),
            email=email.strip() if email else None,
            role="student",
            account_status=AccountStatus.PENDING_ACTIVATION,
            created_at=now,
            updated_at=now,
            created_by=actor_id,
            activation_code_hash=code_hash,
            notes=notes.strip() if notes else None
        )

        self._students[adm] = record
        self.log_event(
            actor_id=actor_id,
            actor_role=actor_role,
            action="STUDENT_REGISTERED",
            target_id=adm,
            target_name=record.full_name,
            details=f"Provisioned new student account. Status: PENDING_ACTIVATION. Class: {record.grade_class}.",
            outcome="SUCCESS"
        )
        self._save()
        return record, code

    def update_student(
        self,
        admission_number: str,
        full_name: Optional[str] = None,
        grade_class: Optional[str] = None,
        email: Optional[str] = None,
        notes: Optional[str] = None,
        actor_id: str = "it_admin",
        actor_role: str = "it_admin"
    ) -> StudentRecord:
        record = self.get_student(admission_number)
        if not record:
            raise KeyError(f"Student '{admission_number}' not found.")

        changes = []
        if full_name and full_name.strip() and full_name.strip() != record.full_name:
            changes.append(f"Name: '{record.full_name}' -> '{full_name.strip()}'")
            record.full_name = full_name.strip()

        if grade_class and grade_class.strip() and grade_class.strip() != record.grade_class:
            changes.append(f"Class: '{record.grade_class}' -> '{grade_class.strip()}'")
            record.grade_class = grade_class.strip()

        if email is not None and email.strip() != (record.email or ""):
            changes.append(f"Email: '{record.email}' -> '{email.strip()}'")
            record.email = email.strip() if email.strip() else None

        if notes is not None:
            record.notes = notes.strip() if notes.strip() else None

        record.updated_at = datetime.utcnow().isoformat() + "Z"
        self._students[record.admission_number] = record

        self.log_event(
            actor_id=actor_id,
            actor_role=actor_role,
            action="STUDENT_UPDATED",
            target_id=record.admission_number,
            target_name=record.full_name,
            details=", ".join(changes) if changes else "Updated metadata/notes.",
            outcome="SUCCESS"
        )
        self._save()
        return record

    def set_account_status(
        self,
        admission_number: str,
        status: AccountStatus,
        reason: Optional[str] = None,
        actor_id: str = "it_admin",
        actor_role: str = "it_admin"
    ) -> StudentRecord:
        record = self.get_student(admission_number)
        if not record:
            raise KeyError(f"Student '{admission_number}' not found.")

        old_status = record.account_status
        record.account_status = status
        record.suspension_reason = reason if status == AccountStatus.SUSPENDED else None
        record.updated_at = datetime.utcnow().isoformat() + "Z"
        self._students[record.admission_number] = record

        action_name = "ACCOUNT_SUSPENDED" if status == AccountStatus.SUSPENDED else "ACCOUNT_REACTIVATED"
        self.log_event(
            actor_id=actor_id,
            actor_role=actor_role,
            action=action_name,
            target_id=record.admission_number,
            target_name=record.full_name,
            details=f"Status changed from {old_status.value} to {status.value}. Reason: {reason or 'Administrative action.'}",
            outcome="SUCCESS"
        )
        self._save()
        return record

    def reset_activation_code(
        self,
        admission_number: str,
        actor_id: str = "it_admin",
        actor_role: str = "it_admin"
    ) -> str:
        record = self.get_student(admission_number)
        if not record:
            raise KeyError(f"Student '{admission_number}' not found.")

        code = _generate_activation_code()
        record.activation_code_hash = _hash_code(code)
        record.account_status = AccountStatus.PENDING_ACTIVATION
        record.password_hash = None
        record.password_salt = None
        record.updated_at = datetime.utcnow().isoformat() + "Z"
        self._students[record.admission_number] = record

        self.log_event(
            actor_id=actor_id,
            actor_role=actor_role,
            action="ACTIVATION_RESET",
            target_id=record.admission_number,
            target_name=record.full_name,
            details="Generated new single-use activation code. Account reset to PENDING_ACTIVATION.",
            outcome="SUCCESS"
        )
        self._save()
        return code

    def activate_account(
        self,
        admission_number: str,
        activation_code: str,
        new_password: str
    ) -> StudentRecord:
        record = self.get_student(admission_number)
        if not record:
            raise KeyError(f"Student with admission number '{admission_number}' was not found.")

        if record.account_status == AccountStatus.SUSPENDED:
            raise PermissionError("Account is currently suspended. Please contact school IT administration.")

        if not record.activation_code_hash:
            raise ValueError("No pending activation found for this account. Account may already be active.")

        input_hash = _hash_code(activation_code)
        if input_hash != record.activation_code_hash:
            self.log_event(
                actor_id=record.admission_number,
                actor_role="student",
                action="ACTIVATION_ATTEMPT_FAILED",
                target_id=record.admission_number,
                target_name=record.full_name,
                details="Invalid activation code entered during account setup.",
                outcome="FAILED"
            )
            raise ValueError("Invalid activation code. Please check the code provided by IT administration.")

        if len(new_password) < 6:
            raise ValueError("Password must be at least 6 characters in length.")

        salt = secrets.token_hex(8)
        record.password_salt = salt
        record.password_hash = _hash_password(new_password, salt)
        record.activation_code_hash = None
        record.account_status = AccountStatus.ACTIVE
        record.updated_at = datetime.utcnow().isoformat() + "Z"
        self._students[record.admission_number] = record

        self.log_event(
            actor_id=record.admission_number,
            actor_role="student",
            action="ACCOUNT_ACTIVATED",
            target_id=record.admission_number,
            target_name=record.full_name,
            details="Student successfully established private password and activated account.",
            outcome="SUCCESS"
        )
        self._save()
        return record

    def authenticate_student(self, admission_number: str, password: str) -> StudentRecord:
        record = self.get_student(admission_number)
        if not record:
            raise KeyError("Invalid Admission Number or account not found.")

        if record.account_status == AccountStatus.SUSPENDED:
            self.log_event(
                actor_id=admission_number,
                actor_role="student",
                action="LOGIN_BLOCKED_SUSPENDED",
                target_id=record.admission_number,
                target_name=record.full_name,
                details=f"Login attempt blocked: account suspended. Reason: {record.suspension_reason or 'Policy violation.'}",
                outcome="FAILED"
            )
            raise PermissionError(f"Account suspended: {record.suspension_reason or 'Access restricted by IT Admin.'}")

        if record.account_status == AccountStatus.PENDING_ACTIVATION:
            raise ValueError("Account is pending activation. Please use the 'First-Time Student Setup' to activate.")

        # Check password
        if record.password_hash and record.password_salt:
            expected = _hash_password(password, record.password_salt)
            if expected != record.password_hash:
                raise ValueError("Invalid credentials provided.")
        else:
            # Fallback backward compatibility for legacy demo password
            if password != "dawamu2026" and password != "student123":
                raise ValueError("Invalid credentials provided.")

        record.last_login_at = datetime.utcnow().isoformat() + "Z"
        self._students[record.admission_number] = record
        self._save()
        return record

    def bulk_import(
        self,
        csv_text: str,
        actor_id: str = "it_admin",
        actor_role: str = "it_admin"
    ) -> BulkImportResponse:
        f = io.StringIO(csv_text.strip())
        reader = csv.reader(f)
        rows = list(reader)

        if not rows:
            return BulkImportResponse(
                total_rows=0, imported_count=0, skipped_count=0, failed_count=0, new_students=[], errors=["CSV file is empty."]
            )

        header = [col.strip().lower() for col in rows[0]]
        # Flexible column resolution
        name_idx = next((i for i, h in enumerate(header) if "name" in h or "student" in h), -1)
        adm_idx = next((i for i, h in enumerate(header) if "adm" in h or "id" in h or "number" in h), -1)
        grade_idx = next((i for i, h in enumerate(header) if "grade" in h or "class" in h or "form" in h), -1)
        email_idx = next((i for i, h in enumerate(header) if "email" in h or "mail" in h), -1)

        if name_idx == -1 or adm_idx == -1:
            return BulkImportResponse(
                total_rows=len(rows) - 1,
                imported_count=0,
                skipped_count=0,
                failed_count=len(rows) - 1,
                new_students=[],
                errors=["CSV must include headers for 'name' and 'admission_number'."]
            )

        data_rows = rows[1:]
        imported = []
        errors = []
        seen_in_batch = set()
        skipped_count = 0
        failed_count = 0

        for r_idx, row in enumerate(data_rows, start=2):
            if not any(col.strip() for col in row):
                continue # empty line

            name = row[name_idx].strip() if name_idx < len(row) else ""
            adm = row[adm_idx].strip().upper() if adm_idx < len(row) else ""
            grade = row[grade_idx].strip() if (grade_idx != -1 and grade_idx < len(row)) else "Form 1"
            email = row[email_idx].strip() if (email_idx != -1 and email_idx < len(row)) else None

            if not name or not adm:
                errors.append(f"Row {r_idx}: Missing required name or admission number.")
                failed_count += 1
                continue

            if adm in seen_in_batch:
                errors.append(f"Row {r_idx}: Duplicate admission number '{adm}' within the CSV file.")
                skipped_count += 1
                continue

            seen_in_batch.add(adm)

            if self.get_student(adm) is not None:
                errors.append(f"Row {r_idx}: Admission number '{adm}' already exists in registry (skipped).")
                skipped_count += 1
                continue

            try:
                rec, code = self.register_student(
                    admission_number=adm,
                    full_name=name,
                    grade_class=grade,
                    email=email,
                    actor_id=actor_id,
                    actor_role=actor_role
                )
                imported.append({
                    "admission_number": rec.admission_number,
                    "full_name": rec.full_name,
                    "grade_class": rec.grade_class,
                    "email": rec.email,
                    "activation_code": code,
                    "status": rec.account_status.value
                })
            except Exception as e:
                errors.append(f"Row {r_idx}: Failed to register '{adm}' - {str(e)}")
                failed_count += 1

        self.log_event(
            actor_id=actor_id,
            actor_role=actor_role,
            action="BULK_STUDENT_IMPORT",
            target_id="CSV_BATCH",
            target_name=f"{len(imported)} Students",
            details=f"Bulk import processed {len(data_rows)} rows. Successfully imported: {len(imported)}, Skipped/Duplicate: {skipped_count}, Errors: {failed_count}.",
            outcome="SUCCESS" if imported else ("WARNING" if skipped_count else "FAILED")
        )

        return BulkImportResponse(
            total_rows=len(data_rows),
            imported_count=len(imported),
            skipped_count=skipped_count,
            failed_count=failed_count,
            new_students=imported,
            errors=errors
        )

    def get_audit_logs(
        self,
        limit: int = 100,
        action: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[AuditLogEntry]:
        logs = self._audit_logs
        if action and action.lower() != "all":
            a = action.lower()
            logs = [entry for entry in logs if a in entry.action.lower()]

        if search:
            q = search.lower().strip()
            logs = [
                entry for entry in logs
                if q in entry.target_id.lower()
                or q in entry.target_name.lower()
                or q in entry.actor_id.lower()
                or q in entry.details.lower()
                or q in entry.action.lower()
            ]

        return logs[:limit]

# Singleton instance
student_registry = StudentRegistryRepository()
