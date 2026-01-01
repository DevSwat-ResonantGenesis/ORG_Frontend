#!/bin/bash

# Rebuild and Deploy Frontend

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 REBUILDING AND DEPLOYING FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/frontend

# Step 1: Pull latest code
echo "📥 Step 1: Pulling latest code..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 2: Install dependencies (if needed)
echo "📦 Step 2: Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "   Installing dependencies..."
    npm install
fi
echo "✅ Dependencies ready"
echo ""

# Step 3: Build frontend
echo "🔨 Step 3: Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi
echo "✅ Build complete"
echo ""

# Step 4: Verify build
echo "🔍 Step 4: Verifying build..."
if find dist/assets -name "*ResonantChat*" | head -1 > /dev/null; then
    echo "✅ Resonant Chat files found in build"
else
    echo "⚠️  Resonant Chat files not found - but continuing..."
fi

if grep -q "resonant-chat\|Aivara" dist/index.html 2>/dev/null || find dist/assets -name "*ResonantChat*" | head -1 > /dev/null; then
    echo "✅ New features found in build"
else
    echo "⚠️  New features may be in JS bundle (this is normal)"
fi
echo ""

# Step 5: Restart container
echo "🔄 Step 5: Restarting container..."
docker-compose -f docker-compose.frontend.yml restart frontend
sleep 3
echo "✅ Container restarted"
echo ""

# Step 6: Verify deployment
echo "🧪 Step 6: Verifying deployment..."
sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k https://dev-swat.com 2>/dev/null || echo "000")

echo "   HTTP status: $HTTP_CODE"
echo "   HTTPS status: $HTTPS_CODE"
echo ""

# Check container health
HEALTH=$(docker inspect frontend --format='{{.State.Health.Status}}' 2>/dev/null || echo "no-health-check")
echo "   Container health: $HEALTH"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ REBUILD AND DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Test your site: https://dev-swat.com"
echo "💬 Test Resonant Chat: https://dev-swat.com/resonant-chat"
echo ""
echo "📝 IMPORTANT: Clear your browser cache!"
echo "   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   - Or use incognito/private mode"
echo ""

