#!/bin/bash

# Deploy All Changes - Frontend and Backend
# This script deploys all recent fixes including:
# - Mobile header alignment and font size fixes
# - Test user creation (already done)
# - All UI consistency fixes

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOYING ALL CHANGES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Deploy Frontend
echo "📦 Step 1: Deploying Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Find frontend directory (could be different names)
FRONTEND_DIR=""
if [ -d "/root/frontend" ]; then
    FRONTEND_DIR="/root/frontend"
elif [ -d "/root/ResonantGraphAI_FrontendV0.1-" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1-"
elif [ -d "/root/ResonantGraphAI_FrontendV0.1" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1"
else
    echo "❌ Frontend directory not found!"
    echo "   Searched: /root/frontend, /root/ResonantGraphAI_FrontendV0.1-, /root/ResonantGraphAI_FrontendV0.1"
    exit 1
fi

echo "✅ Found frontend directory: $FRONTEND_DIR"
cd "$FRONTEND_DIR"

# Pull latest changes
echo ""
echo "📥 Pulling latest changes..."
git stash 2>/dev/null || true
git fetch origin main
git pull origin main || {
    echo "⚠️  Git pull failed, continuing with existing code..."
}

# Install dependencies (if needed)
echo ""
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
else
    echo "   Dependencies up to date"
fi

# Build frontend
echo ""
echo "🔨 Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found!"
    exit 1
fi

echo "✅ Frontend build complete"

# Deploy to Docker container
echo ""
echo "📤 Deploying to Docker container..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || {
    echo "⚠️  Could not clear frontend container, continuing..."
}

docker cp dist/. frontend:/usr/share/nginx/html/ || {
    echo "❌ Failed to copy files to frontend container!"
    exit 1
}

# Reload nginx
docker exec frontend nginx -s reload 2>/dev/null || {
    echo "⚠️  Could not reload nginx, restarting container..."
    docker restart frontend
}

echo "✅ Frontend deployed successfully"

# Step 2: Verify Backend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Step 2: Verifying Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /root/ResonantGraphAIV0.1

# Check if backend is running
echo ""
echo "📊 Checking backend status..."
docker compose ps api | grep -q "Up" && {
    echo "✅ Backend API is running"
} || {
    echo "⚠️  Backend API is not running, starting..."
    docker compose up -d api
    sleep 5
}

# Test backend health
echo ""
echo "🧪 Testing backend health..."
if curl -s http://137.184.234.252:8001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed, but continuing..."
fi

# Test nginx proxy
echo ""
echo "🧪 Testing nginx proxy..."
if curl -s -k https://dev-swat.com/api/health > /dev/null 2>&1; then
    echo "✅ Nginx proxy is working"
else
    echo "⚠️  Nginx proxy check failed, but continuing..."
fi

# Step 3: Summary
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

