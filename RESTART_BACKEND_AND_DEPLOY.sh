#!/bin/bash

# Restart Backend and Deploy Frontend
# Run this script on your Digital Ocean droplet

set -e

echo "🔧 STEP 1: Restarting Backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check backend container
echo "📋 Checking backend container status..."
docker ps -a | grep backend || echo "⚠️  Backend container not found"

# Restart backend
echo "🔄 Restarting backend container..."
docker restart backend || {
    echo "❌ Failed to restart backend. Trying docker-compose..."
    cd /root/backend 2>/dev/null || cd /root/ResonantGenesis_Graph 2>/dev/null || {
        echo "❌ Backend directory not found. Please check path."
        exit 1
    }
    docker-compose restart
}

# Wait for backend to start
echo "⏳ Waiting for backend to start (10 seconds)..."
sleep 10

# Check backend health
echo "🏥 Checking backend health..."
if curl -f http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend health check failed. Checking logs..."
    docker logs backend --tail 20
    echo "❌ Backend may not be fully started. Continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "🚀 STEP 2: Deploying Frontend Updates..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Navigate to frontend directory
cd /root/frontend || {
    echo "❌ Frontend directory not found at /root/frontend"
    exit 1
}

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# Build frontend
echo "🔨 Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# Deploy to nginx
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

