@echo off
title GetSkills - Push to GitHub
echo ===================================================
echo   GETSKILLS AUTOMATED DEPLOYMENT & PUSH TO GITHUB  
echo ===================================================
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your system PATH.
    echo.
    echo Please download and install Git from: https://git-scm.com/download/win
    echo After installing, restart this script to push your changes!
    echo.
    pause
    exit /b
)

echo [1/4] Initializing Git repository...
if not exist ".git" (
    git init
    echo Git repository initialized.
) else (
    echo Git repository already initialized.
)
echo.

:: Ask for remote URL
set /p REPO_URL="[2/4] Paste your GitHub Repository URL (e.g., https://github.com/your-username/getskill.git): "
if "%REPO_URL%"=="" (
    echo [ERROR] Repository URL cannot be empty.
    pause
    exit /b
)

:: Check if origin exists
git remote get-url origin >nul 2>nul
if %errorlevel% equ 0 (
    echo Remote 'origin' already exists. Updating URL to: %REPO_URL%
    git remote set-url origin %REPO_URL%
) else (
    git remote add origin %REPO_URL%
    echo Remote 'origin' added.
)
echo.

echo [3/4] Staging and committing changes...
git add .
git commit -m "feat: complete styling, routing, real-time chat, search, and profile editing"
echo.

echo [4/4] Pushing to GitHub...
set /p BRANCH="Enter branch name (default is 'main'): "
if "%BRANCH%"=="" set BRANCH=main

echo Pushing changes to origin %BRANCH%...
git push -u origin %BRANCH%

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo   SUCCESS! Changes pushed successfully to GitHub!  
    echo ===================================================
    echo.
    echo Vercel and Render will now automatically detect the
    echo push and deploy the updated application!
    echo.
    echo Frontend Link: https://getskill-phi.vercel.app
    echo Backend Link: https://skillswap-backend.onrender.com
) else (
    echo.
    echo [ERROR] Push failed. Please check your credentials or SSH keys.
)
echo.
pause
