#!/bin/bash
# Frontend deployment with git stash (handles local changes)

set -e

echo "🚀 Deploying Frontend..."
cd /root/frontend

# Stash any local changes
echo "📦 Stashing local changes..."
git stash || echo "⚠️  No changes to stash"

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️  Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# Copy to container
echo "📋 Copying to container..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/

# Reload nginx
echo "⚙️  Reloading nginx..."
docker exec frontend nginx -s reload

echo "✅ Frontend deployed! Visit: https://dev-swat.com"

