#!/bin/bash
# Clean Docker deployment command for dev-swat.com
# Frontend + Backend

echo "🌐 Deploying frontend + backend to dev-swat.com..."

# ============================================================
# FRONTEND
# ============================================================
echo ""
echo "📦 Frontend..."
cd /root/frontend

git fetch origin main
git reset --hard origin/main
git pull origin main
npm run build

docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload

echo "✅ Frontend deployed!"

# ============================================================
# BACKEND
# ============================================================
echo ""
echo "📦 Backend..."
cd /root/ResonantGraphAIV0.1

git fetch origin main
git reset --hard origin/main
git pull origin main

docker compose down
docker compose up -d --build

sleep 5
docker compose ps

echo "✅ Backend deployed!"
echo ""
echo "🌐 Website: https://dev-swat.com"
echo "🔌 API: https://dev-swat.com/api"

