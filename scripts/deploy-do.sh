#!/bin/bash
# ============================================
# DigitalOcean App Platform Deployment Script (Mac/Linux)
# Content Repurposing Engine - Frontend
# ============================================

set -e

echo "[1/5] Checking prerequisites..."

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "ERROR: doctl not found. Install from https://docs.digitalocean.com/reference/doctl/install/"
    exit 1
fi

# Check if git is configured
if ! git config user.name &> /dev/null; then
    echo "WARNING: Git user.name not set. Run: git config user.name 'Your Name'"
fi

echo "[2/5] Validating build locally..."
npm run build
echo "Build successful!"

echo "[3/5] Checking for uncommitted changes..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "WARNING: You have uncommitted changes. Commit them first."
    read -p "Press Enter to continue or Ctrl+C to abort..."
fi

echo "[4/5] Deploying to DigitalOcean App Platform..."
doctl apps create --spec app.yaml --project content-repurposing-engine

echo "[5/5] Deployment initiated!"
echo "Monitor progress at: https://cloud.digitalocean.com/apps"
echo "Or run: doctl apps logs <app-id> --follow"
