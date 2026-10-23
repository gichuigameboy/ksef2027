@echo off
title EduGuard Desktop Launcher
echo ========================================
echo        Starting EduGuard Services
echo ========================================

echo [1/2] Starting EduGuard Intelligence Backend on port 8000...
start /B "" "%~dp0backend\.venv\Scripts\python.exe" -m uvicorn app.main:app --app-dir "%~dp0backend" --host 127.0.0.1 --port 8000

echo [2/2] Starting EduGuard Desktop Frontend on port 3000...
start /B "" "%~dp0backend\.venv\Scripts\python.exe" -m http.server 3000 --directory "%~dp0frontend\build\web"

timeout /t 2 /nobreak >nul
echo Opening EduGuard Desktop App Window...
start msedge.exe --app=http://localhost:3000 --window-size=1280,800
echo EduGuard is running!
