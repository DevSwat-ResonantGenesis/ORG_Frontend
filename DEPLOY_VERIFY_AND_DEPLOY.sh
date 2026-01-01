#!/bin/bash

# ResonantGraph AI Frontend Deployment Script
# This script verifies the correct folder and deploys the frontend

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFYING FRONTEND FOLDER STRUCTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Find frontend source folder
FRONTEND_FOLDER=$(find /root -name "package.json" -type f 2>/dev/null | grep -E "frontend|ResonantGraph" | head -1 | xargs dirname)

if [ -z "$FRONTEND_FOLDER" ]; then
    echo "❌ ERROR: Could not find frontend folder with package.json"
    echo "Please check your folder structure manually:"
    echo "  ls -la /root/ | grep -i frontend"
    exit 1
fi

echo "✅ Found frontend folder: $FRONTEND_FOLDER"
echo ""

# Verify it's the correct folder
if [ ! -f "$FRONTEND_FOLDER/package.json" ]; then
    echo "❌ ERROR: package.json not found in $FRONTEND_FOLDER"
    exit 1
fi

if [ ! -f "$FRONTEND_FOLDER/vite.config.ts" ] && [ ! -f "$FRONTEND_FOLDER/vite.config.js" ]; then
    echo "❌ ERROR: vite.config not found in $FRONTEND_FOLDER"
    echo "This might not be the frontend source folder"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 DEPLOYING FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$FRONTEND_FOLDER"

echo "📍 Current directory: $(pwd)"
echo ""

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main || {
    echo "⚠️  Warning: git pull failed, continuing with existing code"
}

# Build frontend
echo ""
echo "🔨 Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build || {
    echo "❌ Build failed!"
    exit 1
}

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ ERROR: dist folder not found after build"
    exit 1
fi

echo ""
echo "📦 Copying files to Docker container..."

# Clean container directory
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' || {
    echo "⚠️  Warning: Could not clean container directory"
}

# Copy built files
docker cp dist/. frontend:/usr/share/nginx/html/ || {
    echo "❌ ERROR: Failed to copy files to container"
    exit 1
}

# Reload nginx
echo ""
echo "🔄 Reloading Nginx..."
docker exec frontend nginx -s reload || {
    echo "❌ ERROR: Failed to reload Nginx"
    exit 1
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your site should be live at: https://dev-swat.com"
echo ""

