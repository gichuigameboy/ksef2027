#!/usr/bin/env bash
# ChromeOS Student Edition - Standalone Desktop OS Application Launcher

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "========================================================="
echo "  Starting ChromeOS Student Edition Desktop OS Environment..."
echo "========================================================="

# Launch via npx electron
npx electron . "$@"
