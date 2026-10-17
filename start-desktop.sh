#!/usr/bin/env bash
# Dawamu OS - Instant Native Desktop Launcher

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "========================================================="
echo "  Launching Dawamu OS (High-Performance Desktop)...     "
echo "========================================================="

# Launch Electron with native GPU acceleration
exec npx electron . "$@"
