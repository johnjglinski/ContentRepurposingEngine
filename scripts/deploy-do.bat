@echo off
REM ============================================
REM DigitalOcean App Platform Deployment Script (Windows)
REM Content Repurposing Engine - Frontend
REM ============================================

echo [1/5] Checking prerequisites...

REM Check if doctl is installed
where doctl >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: doctl not found. Install from https://docs.digitalocean.com/reference/doctl/install/
    pause
    exit /b 1
)

REM Check if git is configured
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Git user.name not set. Run: git config user.name "Your Name"
)

echo [2/5] Validating build locally...
call npm run build
if %errorlocal% neq 0 (
    echo ERROR: Build failed. Fix errors before deploying.
    pause
    exit /b 1
)
echo Build successful!

echo [3/5] Checking for uncommitted changes...
git status --porcelain | findstr . >nul
if %errorlevel% equ 0 (
    echo No uncommitted changes. Proceeding with deployment.
) else (
    echo WARNING: You have uncommitted changes. Commit them first.
    pause
)

echo [4/5] Deploying to DigitalOcean App Platform...
doctl apps create --spec app.yaml --project content-repurposing-engine
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed. Check doctl output above.
    pause
    exit /b 1
)

echo [5/5] Deployment initiated!
echo Monitor progress at: https://cloud.digitalocean.com/apps
echo Or run: doctl apps logs ^<app-id^> --follow

pause
