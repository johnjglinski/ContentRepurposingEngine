#!/bin/bash

# Content Repurposing Engine - Launch Script
# This script helps you set up and launch your Micro-SaaS application

echo "🚀 Content Repurposing Engine - Launch Script"
echo "============================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the application
echo "🏗️ Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Application built successfully"

# Check if environment variables are set
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Please create it with your API keys."
    echo "Required variables:"
    echo "  OPENAI_API_KEY=your_openai_key_here"
    echo "  STRIPE_PUBLISHABLE_KEY=pk_test_your_key"
    echo "  STRIPE_SECRET_KEY=sk_test_your_key"
    echo "  SENDGRID_API_KEY=your_sendgrid_key"
    exit 1
fi

echo "✅ Environment variables configured"

# Start development server
echo "🎯 Starting development server..."
echo "Open http://localhost:3000 to view your application"
npm run dev