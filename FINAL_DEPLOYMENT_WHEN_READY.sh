#!/bin/bash

# Final Deployment Script - Run when ALL frontend work is complete
# This will restart backend and deploy frontend in one go
# Use this ONLY when you're ready to deploy everything

set -e

echo "🚀 FINAL DEPLOYMENT - Backend + Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  This will:"
echo "   1. Restart backend on droplet"
echo "   2. Deploy all frontend changes"
echo "   3. Make everything live"
echo ""
read -p "Are you sure all frontend work is complete? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled. Continue working locally."
    exit 0
fi

echo ""
echo "🔧 STEP 1: Restarting Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check backend container
echo "📋 Checking backend container..."
docker ps -a | grep backend || echo "⚠️  Backend container not found"

# Restart backend
echo "🔄 Restarting backend..."
docker restart backend || {
    echo "❌ Failed to restart backend. Trying docker-compose..."
    cd /root/backend 2>/dev/null || cd /root/ResonantGenesis_Graph 2>/dev/null || {
        echo "❌ Backend directory not found. Please check path."
        exit 1
    }
    docker-compose restart
}

# Wait for backend
echo "⏳ Waiting for backend to start..."
sleep 15

# Verify backend
echo "🏥 Verifying backend health..."
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend health check failed. Checking logs..."
    docker logs backend --tail 30
    echo ""
    echo "❌ Backend may not be fully started."
    read -p "Continue with frontend deployment anyway? (y/n): " continue_anyway
    if [ "$continue_anyway" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "🚀 STEP 2: Deploying Frontend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Navigate to frontend
cd /root/frontend || {
    echo "❌ Frontend directory not found at /root/frontend"
    exit 1
}

# Pull latest
echo "📥 Pulling latest changes from git..."
git pull origin main

# Build
echo "🔨 Building frontend (this may take a few minutes)..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# Deploy
echo "📦 Deploying to nginx..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/

# Reload nginx
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Test your site: https://dev-swat.com"
echo "📊 Test dashboards: https://dev-swat.com/dashboard"
echo "💬 Test chat: https://dev-swat.com/resonant-chat"
echo ""
echo "🎉 All changes are now live!"

