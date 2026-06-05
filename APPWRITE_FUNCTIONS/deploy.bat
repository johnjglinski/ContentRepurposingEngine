@echo off
REM Appwrite Functions Deployment Script for Windows
REM This script deploys all Appwrite functions to your project

echo ============================================
echo Content Repurposing Engine - Appwrite Deploy
echo ============================================
echo.

REM Configuration - Update these values
set APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
set PROJECT_ID=content-repurposing-engine
set API_KEY=standard_c452fafe2b01a12d274359742d8eafa51f88081bffc906a6626258d49e3ac5285bc5f632452c7c65ee28c3ac62f2cfb5f33cd7fbed2d1bea63362b02a2326571c0f8c64ec830c573c28f63250872d6bfb3f5b6b83c60aaf9812b9367e6e2abef6edcfdfdc9e2686957fa6e5fe3a2ce02d8af385f266f3454a6ea321635439e4a

REM Check if appwrite CLI is installed
where appwrite >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Appwrite CLI is not installed.
    echo Install it with: npm install -g appwrite-cli
    pause
    exit /b 1
)

echo [1/5] Logging in to Appwrite...
appwrite login
if %ERRORLEVEL% neq 0 (
    echo ERROR: Login failed.
    pause
    exit /b 1
)

echo.
echo [2/5] Setting project...
appwrite client --endpoint %APPWRITE_ENDPOINT% --projectId %PROJECT_ID% --apiKey %API_KEY%
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to set project.
    pause
    exit /b 1
)

echo.
echo [3/5] Deploying generate-posts function...
cd generate-posts
call npm install
appwrite functions createDeployment --functionId generate-posts --entrypoint src/main.js --code ./ --activate true
if %ERRORLEVEL% neq 0 (
    echo WARNING: generate-posts deployment may have issues. Check console.
)
cd ..

echo.
echo [4/5] Deploying send-email function...
cd send-email
call npm install
appwrite functions createDeployment --functionId send-email --entrypoint src/main.js --code ./ --activate true
if %ERRORLEVEL% neq 0 (
    echo WARNING: send-email deployment may have issues. Check console.
)
cd ..

echo.
echo [5/5] Deploying webhooks-stripe function...
cd webhooks-stripe
call npm install
appwrite functions createDeployment --functionId webhooks-stripe --entrypoint src/main.js --code ./ --activate true
if %ERRORLEVEL% neq 0 (
    echo WARNING: webhooks-stripe deployment may have issues. Check console.
)
cd ..

echo.
echo [6/6] Deploying create-checkout-session function...
cd create-checkout-session
call npm install
appwrite functions createDeployment --functionId create-checkout-session --entrypoint src/main.js --code ./ --activate true
if %ERRORLEVEL% neq 0 (
    echo WARNING: create-checkout-session deployment may have issues. Check console.
)
cd ..

echo.
echo ============================================
echo Deployment Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Set environment variables in Appwrite Console
echo 2. Update frontend configuration
echo 3. Test all functions
echo.
pause
