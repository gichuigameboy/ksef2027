import os
import subprocess
import sys
import threading
import time
from fastapi import APIRouter, Request
from app.core.config import settings

router = APIRouter(tags=["System"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }

def _terminate_os_processes():
    time.sleep(0.25)
    try:
        if sys.platform == "win32":
            # Stop Dawamu static server window & standalone app window if launched via start-desktop.bat
            subprocess.run(
                ["taskkill", "/FI", "WINDOWTITLE eq Dawamu-StaticServer*", "/F"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            subprocess.run(
                ["taskkill", "/FI", "WINDOWTITLE eq EduGuard-Backend*", "/F"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
    except Exception:
        pass
    os._exit(0)

@router.post("/api/v1/system/shutdown")
@router.post("/system/shutdown")
async def system_shutdown(request: Request):
    client_host = request.client.host if request.client else ""
    # Do not kill the test runner if invoked from FastAPI TestClient
    if client_host in ("127.0.0.1", "::1", "localhost"):
        threading.Thread(target=_terminate_os_processes, daemon=True).start()
    return {
        "status": "shutting_down",
        "message": "Dawamu OS and EduGuard background processes are terminating."
    }
