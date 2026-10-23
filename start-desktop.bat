@echo off
title Dawamu OS - Student Edition (KSEF 2027)
echo =========================================================
echo   Launching Dawamu OS Desktop with EduGuard (KSEF 2027)...
echo =========================================================

cd /d "%~dp0"

:: Detect Python executable
set "PY_EXE=%~dp0EduGuard\backend\.venv\Scripts\python.exe"
if not exist "%PY_EXE%" (
    set "PY_EXE=C:\Users\infin\Desktop\EduGuard\backend\.venv\Scripts\python.exe"
)
if not exist "%PY_EXE%" (
    set "PY_EXE=python"
)

:: 1. Launch EduGuard Backend Intelligence on Port 8000
echo [1/3] Starting EduGuard FastAPI Backend on port 8000...
if exist "%~dp0EduGuard\backend\app\main.py" (
    start "EduGuard-Backend" /B "%PY_EXE%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir "%~dp0EduGuard\backend"
)

:: 2. Check if Electron is available
where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Launching with Electron native engine...
    npx electron . %*
    goto :eof
)

:: 3. Desktop Standalone App Mode (Chrome / Edge with Python HTTP Server on port 8080)
echo [2/3] Initializing OS Local Static Engine on port 8080...
start "Dawamu-StaticServer" /B "%PY_EXE%" -m http.server 8080 --directory "%~dp0"

timeout /t 1 /nobreak >nul

echo [3/3] Opening Dawamu OS Standalone App Window...
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if exist "%CHROME%" (
    start "" "%CHROME%" --app=http://localhost:8080 --window-size=1366,768 --start-maximized
) else if exist "%EDGE%" (
    start "" "%EDGE%" --app=http://localhost:8080 --window-size=1366,768 --start-maximized
) else (
    start http://localhost:8080
)

echo Dawamu OS with EduGuard is running:
echo   - Desktop UI:        http://localhost:8080
echo   - EduGuard Backend:  http://127.0.0.1:8000
