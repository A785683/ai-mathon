@echo off
title Push RetinaVision-AI to GitHub
echo ==========================================================
echo Pushing project to https://github.com/A785683/ai-mathon.git
echo ==========================================================
echo.
cd /d "%~dp0"
git push -u origin main
echo.
echo ==========================================================
echo If prompted, please enter your GitHub credentials or
echo Personal Access Token (PAT).
echo ==========================================================
pause

