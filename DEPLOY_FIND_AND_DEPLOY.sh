#!/bin/bash

# Find Frontend Directory and Deploy
# Auto-detects the frontend directory and deploys

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Finding Frontend Directory..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Try to find frontend directory
FRONTEND_DIR=""
if [ -d "/root/ResonantGraphAI_FrontendV0.1-" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1-"
elif [ -d "/root/frontend" ] && [ -f "/root/frontend/package.json" ]; then
    FRONTEND_DIR="/root/frontend"
elif [ -d "/root/ResonantGraphAI_FrontendV0.1" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1"
else
    echo "❌ Frontend directory not found!"
    echo ""
    echo "Searching for frontend directories..."
    find /root -maxdepth 2 -name "package.json" -type f 2>/dev/null | head -5
    echo ""
    echo "Please specify the correct path or check the directory name."
    exit 1
fi

echo "✅ Found frontend directory: $FRONTEND_DIR"
cd "$FRONTEND_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 Pulling latest code..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git stash 2>/dev/null || true
git pull origin main

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 Building frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Deploying to Docker..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Fixed mobile hero deployed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

