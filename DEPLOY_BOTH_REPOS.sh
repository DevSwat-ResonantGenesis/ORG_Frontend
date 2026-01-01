#!/bin/bash
# Complete deployment script - Updates both Frontend and Backend repos
# Run this on your Droplet

echo "🚀 Starting complete deployment (Frontend + Backend)..."

# ============================================================
# FRONTEND DEPLOYMENT
# ============================================================
echo ""
echo "📦 Deploying Frontend..."
cd /root/frontend

echo "📥 Pulling latest frontend code..."
git fetch origin main
git reset --hard origin/main
git pull origin main

echo "🏗️  Building frontend with API environment variables..."
export VITE_API_URL="http://137.184.234.252:8001"
export VITE_FASTAPI_URL="http://137.184.234.252:8001"
npm run build

echo "🚀 Deploying to Docker container..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload

echo "✅ Frontend deployed!"

# ============================================================
# BACKEND DEPLOYMENT
# ============================================================
echo ""
echo "📦 Deploying Backend..."
cd /root/ResonantGraphAIV0.1

echo "📥 Pulling latest backend code..."
git fetch origin main
git reset --hard origin/main
git pull origin main

echo "🔄 Restarting backend containers..."
docker compose down
docker compose up -d --build api ml-worker

echo "⏳ Waiting for containers to start..."
sleep 5

echo "📊 Container status:"
docker compose ps

echo ""
echo "✅ Complete deployment finished!"
echo ""
echo "🌐 Frontend: https://dev-swat.com"
echo "🔌 Backend API: https://dev-swat.com/api"

