#!/bin/bash
# Find correct frontend folder and deploy

echo "🔍 Finding frontend folder..."

# Check common locations
if [ -d "/root/frontend" ] && [ -f "/root/frontend/package.json" ]; then
    FRONTEND_DIR="/root/frontend"
    echo "✅ Found frontend at: $FRONTEND_DIR"
elif [ -d "/root/ResonantGraphAI_FrontendV0.1-" ] && [ -f "/root/ResonantGraphAI_FrontendV0.1-/package.json" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1-"
    echo "✅ Found frontend at: $FRONTEND_DIR"
else
    echo "❌ Frontend folder not found. Checking all folders..."
    ls -la /root/ | grep "^d"
    echo ""
    echo "Please check which folder has package.json:"
    find /root -maxdepth 2 -name "package.json" 2>/dev/null
    exit 1
fi

cd "$FRONTEND_DIR"
echo "📂 Current directory: $(pwd)"
echo ""

# Clean and deploy
echo "🧹 Cleaning old files..."
rm -rf node_modules dist .next .cache 2>/dev/null || true

echo "📦 Stashing and cleaning git..."
git stash || true
git clean -fd || true

echo "📥 Pulling fresh code..."
git fetch origin main
git reset --hard origin/main
git clean -fd

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

echo "📋 Deploying to container..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/

echo "⚙️  Reloading nginx..."
docker exec frontend nginx -s reload

echo "✅ Frontend deployed from: $FRONTEND_DIR"
echo "🌐 Visit: https://dev-swat.com"

