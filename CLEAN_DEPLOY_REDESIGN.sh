#!/bin/bash
# Clean deployment for total frontend redesign
# This removes old files and deploys fresh from git

set -e

cd /root/frontend

echo "🧹 Cleaning old files..."
# Remove node_modules and dist to avoid conflicts
rm -rf node_modules dist .next .cache 2>/dev/null || true

# Stash any local changes
echo "📦 Stashing local changes..."
git stash || true

# Remove any untracked files that might conflict
echo "🗑️  Removing untracked files..."
git clean -fd || true

# Fetch and reset to match GitHub exactly
echo "📥 Pulling fresh code from GitHub..."
git fetch origin main
git reset --hard origin/main
git clean -fd

# Install fresh dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️  Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# Deploy to container
echo "📋 Deploying to container..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/

# Reload nginx
echo "⚙️  Reloading nginx..."
docker exec frontend nginx -s reload

echo "✅ Frontend redesign deployed! Visit: https://dev-swat.com"
echo "💡 Clear browser cache: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"

