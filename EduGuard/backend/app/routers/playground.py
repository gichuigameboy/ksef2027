"""
Dawamu OS & EduGuard - Sandboxed Python Playground Execution Router
Provides safe, restricted execution of student Python code with stdout/stderr capture and timeouts.
"""

import sys
import subprocess
import time
import tempfile
import os
import ast
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/playground", tags=["Python Playground"])

class RunCodeRequest(BaseModel):
    code: str = Field(..., max_length=50000, description="Python source code to execute")
    timeout: float = Field(default=4.0, ge=0.5, le=10.0, description="Execution timeout in seconds")

class RunCodeResponse(BaseModel):
    success: bool
    stdout: str
    stderr: str
    execution_time_ms: int
    exit_code: int

# Security: Block sensitive operations that shouldn't run in a student educational sandbox
FORBIDDEN_MODULES = {
    'ctypes', 'socket', 'urllib', 'http', 'requests', 'ftplib',
    'smtplib', 'telnetlib', 'subprocess', 'multiprocessing', 'pty',
    'winreg', 'msvcrt'
}

def validate_code_safety(code: str):
    """
    Statically analyzes code AST to prevent obvious security escapes.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return f"SyntaxError on line {e.lineno}: {e.msg}"

    for node in ast.walk(tree):
        # Prevent dangerous imports
        if isinstance(node, ast.Import):
            for alias in node.names:
                mod_name = alias.name.split('.')[0]
                if mod_name in FORBIDDEN_MODULES:
                    return f"SecurityRestriction: Importing '{alias.name}' is restricted in the student sandbox."
        elif isinstance(node, ast.ImportFrom):
            mod_name = (node.module or '').split('.')[0]
            if mod_name in FORBIDDEN_MODULES:
                return f"SecurityRestriction: Importing from '{node.module}' is restricted in the student sandbox."

        # Prevent access to __subclasses__, __builtins__ manipulation
        if isinstance(node, ast.Attribute):
            if node.attr in ('__subclasses__', '__builtins__', '__globals__'):
                return f"SecurityRestriction: Access to '{node.attr}' is restricted."

    return None

@router.post("/run", response_model=RunCodeResponse)
def execute_python_code(request: RunCodeRequest):
    code = request.code.strip()
    if not code:
        return RunCodeResponse(
            success=True,
            stdout="[No code provided]",
            stderr="",
            execution_time_ms=0,
            exit_code=0
        )

    # 1. AST Validation
    safety_error = validate_code_safety(code)
    if safety_error:
        return RunCodeResponse(
            success=False,
            stdout="",
            stderr=f"[Security Sandbox Alert] {safety_error}",
            execution_time_ms=0,
            exit_code=1
        )

    # 2. Execute in isolated subprocess with stripped environment
    clean_env = {
        'PYTHONIOENCODING': 'utf-8',
        'SYSTEMROOT': os.environ.get('SYSTEMROOT', 'C:\\Windows'),
        'PATH': os.environ.get('PATH', '')
    }

    start_time = time.perf_counter()
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False, encoding='utf-8') as f:
        f.write(code)
        temp_path = f.name

    try:
        proc = subprocess.run(
            [sys.executable, "-I", temp_path], # -I isolates Python from user site-packages & environment variables
            capture_output=True,
            text=True,
            timeout=request.timeout,
            env=clean_env,
            cwd=tempfile.gettempdir()
        )
        elapsed_ms = int((time.perf_counter() - start_time) * 1000)

        return RunCodeResponse(
            success=proc.returncode == 0,
            stdout=proc.stdout,
            stderr=proc.stderr,
            execution_time_ms=elapsed_ms,
            exit_code=proc.returncode
        )
    except subprocess.TimeoutExpired:
        elapsed_ms = int(request.timeout * 1000)
        return RunCodeResponse(
            success=False,
            stdout="",
            stderr=f"ExecutionTimeout: Script exceeded max allowed execution limit of {request.timeout}s.\nCheck for infinite loops (e.g. while True without break).",
            execution_time_ms=elapsed_ms,
            exit_code=124
        )
    except Exception as e:
        elapsed_ms = int((time.perf_counter() - start_time) * 1000)
        return RunCodeResponse(
            success=False,
            stdout="",
            stderr=f"ExecutionError: {str(e)}",
            execution_time_ms=elapsed_ms,
            exit_code=1
        )
    finally:
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass
