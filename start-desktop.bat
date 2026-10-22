@echo off
title Dawamu OS - Student Edition
echo =========================================================
echo   Launching Dawamu OS (High-Performance Desktop)...     
echo =========================================================

cd /d "%~dp0"
npx electron . %*
pause
