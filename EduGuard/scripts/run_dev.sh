#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

echo "=== EduGuard Development Runner ==="

# 1. Start Python FastAPI Backend
if [ -d "$DIR/backend/.venv" ]; then
    echo "Starting EduGuard Intelligence Backend on http://localhost:8000 ..."
    export PYTHONPATH="$DIR/backend"
    "$DIR/backend/.venv/bin/python" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "Backend virtualenv not found at backend/.venv. Please run setup first."
    exit 1
fi
