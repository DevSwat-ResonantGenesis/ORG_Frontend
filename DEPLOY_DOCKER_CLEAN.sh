#!/bin/bash
# Clean Docker deployment command for dev-swat.com
# Frontend only

echo "🌐 Deploying frontend to dev-swat.com..."

cd /root/frontend

# Pull latest code
echo "📥 Pulling latest code..."
git fetch origin main
git reset --hard origin/main
git pull origin main

# Build
echo "🏗️  Building..."
npm run build

# Deploy to Docker container
echo "🚀 Deploying to Docker..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload

echo "✅ Frontend deployed! Visit: https://dev-swat.com"

