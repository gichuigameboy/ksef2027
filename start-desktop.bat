@echo off
title Dawamu OS - Student Edition (KSEF 2027)
echo =========================================================
echo   Launching Dawamu OS Desktop with EduGuard (KSEF 2027)...
echo =========================================================

cd /d "%~dp0"
set "ROOT_DIR=%CD%"

:: 1. Detect Python executable
set "PY_EXE=%ROOT_DIR%\EduGuard\backend\.venv\Scripts\python.exe"
if not exist "%PY_EXE%" (
    set "PY_EXE=C:\Users\infin\Desktop\EduGuard\backend\.venv\Scripts\python.exe"
)
if not exist "%PY_EXE%" (
    set "PY_EXE=python"
)

:: 2. Check if Electron native engine is installed locally
if exist "%ROOT_DIR%\node_modules\.bin\electron.cmd" (
    echo [1/2] Starting EduGuard FastAPI Backend on port 8000...
    if exist "%ROOT_DIR%\EduGuard\backend\app\main.py" (
        start "EduGuard-Backend" /MIN "%PY_EXE%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir "%ROOT_DIR%\EduGuard\backend"
    )
    echo [2/2] Launching with Electron native engine...
    call "%ROOT_DIR%\node_modules\.bin\electron.cmd" . %*
    goto :eof
)

:: 3. Desktop Standalone Mode (Python HTTP Server on 127.0.0.1:8080 + Chrome/Edge App Mode)
:: Clean up any lingering port 8080 or 8000 processes to avoid conflicts
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /PID %%a /F >nul 2>nul

echo [1/3] Starting EduGuard FastAPI Backend on port 8000...
if exist "%ROOT_DIR%\EduGuard\backend\app\main.py" (
    start "EduGuard-Backend" /MIN "%PY_EXE%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir "%ROOT_DIR%\EduGuard\backend"
)

echo [2/3] Initializing OS Local Static Engine on port 8080...
start "Dawamu-StaticServer" /MIN "%PY_EXE%" -m http.server 8080 --bind 127.0.0.1 --directory "%ROOT_DIR%"

:: Allow background servers 2 seconds to initialize (using ping for reliable non-blocking wait)
ping 127.0.0.1 -n 3 >nul


:: 4. Locate Browser (Chrome or Edge)
set "BROWSER_EXE="
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=C:\Program Files\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "BROWSER_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
) else if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=C:\Program Files\Microsoft\Edge\Application\msedge.exe"
) else if exist "%LocalAppData%\Microsoft\Edge\Application\msedge.exe" (
    set "BROWSER_EXE=%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
)

echo [3/3] Opening Dawamu OS Desktop App Window...
if defined BROWSER_EXE (
    start "" "%BROWSER_EXE%" --app=http://127.0.0.1:8080/index.html --window-size=1366,768 --start-maximized
) else (
    start http://127.0.0.1:8080/index.html
)

echo.
echo =========================================================
echo   Dawamu OS with EduGuard is now RUNNING!
echo.
echo   - Desktop OS UI:      http://127.0.0.1:8080
echo   - EduGuard Backend:   http://127.0.0.1:8000
echo   - EduGuard API Docs:  http://127.0.0.1:8000/docs
echo =========================================================
echo.
echo Keep this terminal window open while using Dawamu OS.
echo Press any key when you are finished to stop the servers.
pause >nul

echo Stopping servers...
taskkill /FI "WINDOWTITLE eq Dawamu-StaticServer*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq EduGuard-Backend*" /F >nul 2>nul
