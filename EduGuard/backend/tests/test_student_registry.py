import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.student_registry import AccountStatus
from app.services.student_registry_repository import student_registry

client = TestClient(app)

ADMIN_HEADERS = {"Authorization": "Bearer token_admin_1"}
IT_ADMIN_HEADERS = {"Authorization": "Bearer token_it_admin_1"}
STUDENT_HEADERS = {"Authorization": "Bearer token_student_1"}

def test_admin_dashboard_metrics():
    resp = client.get("/api/v1/admin/dashboard", headers=ADMIN_HEADERS)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_students"] >= 20
    assert data["active_accounts"] >= 20
    assert "pending_activation" in data

def test_unauthorized_student_access_denied():
    # Student cannot access admin dashboard or registration endpoints
    resp = client.get("/api/v1/admin/dashboard", headers=STUDENT_HEADERS)
    assert resp.status_code == 403
    assert "Access denied" in resp.json()["detail"]

    resp = client.post(
        "/api/v1/admin/students",
        json={"admission_number": "9999", "full_name": "Hacker", "grade_class": "Form 1"},
        headers=STUDENT_HEADERS
    )
    assert resp.status_code == 403

def test_register_student_and_duplicate_prevention():
    test_adm = "TEST-9001"
    # Ensure fresh state
    if student_registry.get_student(test_adm):
        del student_registry._students[test_adm]

    payload = {
        "admission_number": test_adm,
        "full_name": "Amina Wanjiku",
        "grade_class": "Form 2 West",
        "email": "amina.wanjiku@dawamu.ac.ke",
        "notes": "Transfer student from Nairobi"
    }

    # 1. Successful registration by IT Admin
    resp = client.post("/api/v1/admin/students", json=payload, headers=IT_ADMIN_HEADERS)
    assert resp.status_code == 201
    res_data = resp.json()
    assert res_data["student"]["admission_number"] == test_adm
    assert res_data["student"]["account_status"] == "pending_activation"
    assert res_data["activation_code"].startswith("DAW-")
    activation_code = res_data["activation_code"]

    # 2. Duplicate registration attempt must fail with 409 Conflict
    resp_dup = client.post("/api/v1/admin/students", json=payload, headers=IT_ADMIN_HEADERS)
    assert resp_dup.status_code == 409
    assert "already registered" in resp_dup.json()["detail"]

    # 3. Student First-Time Activation
    act_resp = client.post(
        "/api/v1/auth/activate",
        json={
            "admission_number": test_adm,
            "activation_code": activation_code,
            "new_password": "MySecretPassword2026!"
        }
    )
    assert act_resp.status_code == 200
    assert act_resp.json()["account_status"] == "active"

    # 4. Student Login with new password
    login_resp = client.post(
        "/api/v1/auth/student-login",
        json={"admission_number": test_adm, "password": "MySecretPassword2026!"}
    )
    assert login_resp.status_code == 200
    assert login_resp.json()["token"] == f"token_student_{test_adm}"

    # 5. Wrong password should fail
    wrong_login = client.post(
        "/api/v1/auth/student-login",
        json={"admission_number": test_adm, "password": "WrongPassword"}
    )
    assert wrong_login.status_code == 401

def test_account_suspension_enforcement():
    test_adm = "1001" # Brian Ochieng
    # Suspend account
    susp_resp = client.post(
        f"/api/v1/admin/students/{test_adm}/status",
        json={"status": "suspended", "reason": "Exam integrity check"},
        headers=ADMIN_HEADERS
    )
    assert susp_resp.status_code == 200
    assert susp_resp.json()["account_status"] == "suspended"

    # Attempt login while suspended -> 403 Forbidden
    login_resp = client.post(
        "/api/v1/auth/student-login",
        json={"admission_number": test_adm, "password": "dawamu2026"}
    )
    assert login_resp.status_code == 403
    assert "suspended" in login_resp.json()["detail"].lower()

    # Reactivate account
    react_resp = client.post(
        f"/api/v1/admin/students/{test_adm}/status",
        json={"status": "active"},
        headers=ADMIN_HEADERS
    )
    assert react_resp.status_code == 200
    assert react_resp.json()["account_status"] == "active"

    # Login should succeed again
    login_ok = client.post(
        "/api/v1/auth/student-login",
        json={"admission_number": test_adm, "password": "dawamu2026"}
    )
    assert login_ok.status_code == 200

def test_bulk_csv_import():
    # Clean up test adms if present
    for a in ["CSV-101", "CSV-102", "CSV-DUP"]:
        if student_registry.get_student(a):
            del student_registry._students[a]

    csv_data = """name,admission_number,grade,email
Faith Muthoni,CSV-101,Form 1 East,faith@dawamu.ac.ke
Brian Kiprono,CSV-102,Form 2 West,brian.k@dawamu.ac.ke
Duplicate In File,CSV-101,Form 1 East,dup@dawamu.ac.ke
Invalid Row Missing Name,,Form 3,
1001 Already Exists,1001,Form 1 East,brian@dawamu.ac.ke
"""

    resp = client.post(
        "/api/v1/admin/students/bulk-import",
        json={"csv_content": csv_data},
        headers=IT_ADMIN_HEADERS
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["imported_count"] == 2
    assert data["skipped_count"] >= 2 # 1 duplicate in file, 1 existing 1001
    assert data["failed_count"] >= 1 # missing name/adm
    assert len(data["new_students"]) == 2
    assert data["new_students"][0]["admission_number"] == "CSV-101"

def test_audit_logs():
    resp = client.get("/api/v1/admin/audit-logs", headers=ADMIN_HEADERS)
    assert resp.status_code == 200
    logs = resp.json()
    assert len(logs) > 0
    actions = [l["action"] for l in logs]
    assert any("REGISTERED" in a or "SYSTEM" in a or "STATUS" in a for a in actions)
