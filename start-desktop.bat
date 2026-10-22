@echo off
title Dawamu OS - Student Edition (KSEF 2027)
echo =========================================================
echo   Launching Dawamu OS Desktop (KSEF 2027)...
echo =========================================================

cd /d "%~dp0"

:: 1. Check if Electron is available
where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Launching with Electron native engine...
    npx electron . %*
    goto :eof
)

:: 2. Desktop Standalone App Mode (Chrome / Edge with Python HTTP Server)
echo [1/2] Initializing OS Local Static Engine on port 8080...
set "PY_EXE=C:\Users\infin\Desktop\EduGuard\backend\.venv\Scripts\python.exe"

if exist "%PY_EXE%" (
    start /B "" "%PY_EXE%" -m http.server 8080 --directory "%~dp0"
) else (
    start /B "" python -m http.server 8080 --directory "%~dp0"
)

timeout /t 1 /nobreak >nul

echo [2/2] Opening Dawamu OS Standalone App Window...
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "EDGE=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

if exist "%CHROME%" (
    start "" "%CHROME%" --app=http://localhost:8080 --window-size=1366,768 --start-maximized
) else if exist "%EDGE%" (
    start "" "%EDGE%" --app=http://localhost:8080 --window-size=1366,768 --start-maximized
) else (
    start http://localhost:8080
)

echo Dawamu OS is running at http://localhost:8080
