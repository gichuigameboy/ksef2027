# EduGuard Development Runner (PowerShell)
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$backendDir = Join-Path $projectRoot "backend"
$venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"

Write-Host "=== EduGuard Development Runner ===" -ForegroundColor Cyan

if (Test-Path $venvPython) {
    Write-Host "Starting EduGuard Intelligence Backend on http://localhost:8000 ..." -ForegroundColor Green
    Set-Location $backendDir
    & $venvPython -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
} else {
    Write-Warning "Backend virtual environment not found at $venvPython."
    exit 1
}
