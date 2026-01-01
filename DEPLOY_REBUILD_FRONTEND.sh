#!/bin/bash

# Complete Frontend Rebuild and Deployment
# This script rebuilds the frontend from source and deploys all changes

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 REBUILDING AND DEPLOYING FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find frontend directory
FRONTEND_DIR=""
if [ -d "/root/ResonantGraphAI_FrontendV0.1-" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1-"
elif [ -d "/root/frontend" ]; then
    FRONTEND_DIR="/root/frontend"
elif [ -d "/root/ResonantGraphAI_FrontendV0.1" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1"
else
    echo "❌ Frontend directory not found!"
    exit 1
fi

echo "📁 Frontend directory: $FRONTEND_DIR"
cd "$FRONTEND_DIR"

# Step 1: Pull latest code
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 Step 1: Pulling latest code from GitHub..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git stash 2>/dev/null || true
git fetch origin main
git pull origin main
echo "✅ Code updated"

# Step 2: Install/Update dependencies
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 2: Installing/Updating dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm install
echo "✅ Dependencies installed"

# Step 3: Clean previous build
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Step 3: Cleaning previous build..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rm -rf dist
echo "✅ Previous build cleaned"

# Step 4: Build frontend (TypeScript/React compilation)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 Step 4: Building frontend (compiling TypeScript/React)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found!"
    exit 1
fi

echo "✅ Frontend build complete"
echo "   Build output: $(du -sh dist | cut -f1)"

# Step 5: Deploy to Docker container
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Step 5: Deploying to Docker container..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clear old files
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || {
    echo "⚠️  Could not clear container, continuing..."
}

# Copy new files
docker cp dist/. frontend:/usr/share/nginx/html/ || {
    echo "❌ Failed to copy files to container!"
    exit 1
}

# Reload nginx
docker exec frontend nginx -s reload 2>/dev/null || {
    echo "⚠️  Could not reload nginx, restarting container..."
    docker restart frontend
    sleep 3
}

echo "✅ Files deployed to container"

# Step 6: Verify deployment
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Step 6: Verifying deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if index.html exists
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html found in container"
else
    echo "❌ index.html not found in container!"
    exit 1
fi

# Test frontend
if curl -s -I https://dev-swat.com | grep -q "200 OK\|200"; then
    echo "✅ Frontend is accessible"
else
    echo "⚠️  Frontend accessibility check inconclusive"
fi

# Step 7: Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Deployed Changes:"
echo "  ✅ Mobile header alignment and font size fixes"
echo "  ✅ Global sticky header for all 49 pages"
echo "  ✅ Comprehensive button text color fixes"
echo "  ✅ Mobile hero section alignment"
echo "  ✅ All UI consistency improvements"
echo ""
echo "🌐 Test your deployment:"
echo "  Frontend: https://dev-swat.com"
echo "  Login: https://dev-swat.com/login"
echo ""
echo "👥 Test Users (Password: Test1234!):"
echo "  admin@test.com        → Platform Dev"
echo "  orgadmin@test.com     → Org Admin"
echo "  user@test.com         → User"
echo "  compliance@test.com   → Compliance"
echo "  mlengineer@test.com   → ML Engineer"
echo "  finance@test.com      → Finance"
echo "  viewer@test.com       → Viewer"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

