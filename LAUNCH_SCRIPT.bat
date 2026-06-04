@echo off
REM Content Repurposing Engine - Launch Script for Windows
REM This script helps you set up and launch your Micro-SaaS application

echo 🚀 Content Repurposing Engine - Launch Script
echo ============================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Build the application
echo 🏗️ Building application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Application built successfully

REM Check if environment variables are set
if not exist ".env.local" (
    echo ⚠️  .env.local not found. Please create it with your API keys.
    echo Required variables:
    echo   OPENAI_API_KEY=your_openai_key_here
    echo   STRIPE_PUBLISHABLE_KEY=pk_test_your_key
    echo   STRIPE_SECRET_KEY=sk_test_your_key
    echo   SENDGRID_API_KEY=your_sendgrid_key
    pause
    exit /b 1
)

echo ✅ Environment variables configured

REM Start development server
echo 🎯 Starting development server...
echo Open http://localhost:3000 to view your application
npm run dev

pause