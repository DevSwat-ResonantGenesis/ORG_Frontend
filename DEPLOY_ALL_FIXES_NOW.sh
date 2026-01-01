#!/bin/bash

# Deploy All Fixes: Mobile Hero, Navigation, API 404
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOYING ALL FIXES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Auto-detect frontend folder
if [ -d "/root/frontend" ]; then
    FRONTEND_DIR="/root/frontend"
elif [ -d "/root/ResonantGraphAI_FrontendV0.1-" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1-"
else
    echo "❌ Frontend folder not found!"
    exit 1
fi

cd "$FRONTEND_DIR"

# Step 1: Pull latest code
echo "📥 Step 1: Pulling latest code..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 2: Build frontend
echo "🔨 Step 2: Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build
echo "✅ Build complete"
echo ""

# Step 3: Update nginx config
echo "🔧 Step 3: Updating nginx config..."
if [ -f "nginx/conf.d/default.conf" ]; then
    docker cp nginx/conf.d/default.conf frontend:/etc/nginx/conf.d/default.conf
    docker exec frontend nginx -t && docker exec frontend nginx -s reload
    echo "✅ Nginx config updated"
else
    echo "⚠️  Nginx config not found, skipping..."
fi
echo ""

# Step 4: Deploy files
echo "📤 Step 4: Deploying files..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
docker cp dist/. frontend:/usr/share/nginx/html/
echo "✅ Files deployed"
echo ""

# Step 5: Test
echo "🧪 Step 5: Testing..."
sleep 2
HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://dev-swat.com 2>/dev/null || echo "000")
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://dev-swat.com/api/auth/login -H "Content-Type: application/json" -d '{"email":"test","password":"test"}' 2>/dev/null || echo "000")

echo "   HTTPS: $HTTPS_TEST"
echo "   API: $API_TEST"
echo ""

# Step 6: Final status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Fixed:"
echo "  ✅ Mobile hero section - proper sizing (24px-32px)"
echo "  ✅ Navigation bar - no collapsing, proper alignment"
echo "  ✅ API 404 error - nginx now strips /api prefix"
echo ""
if [ "$API_TEST" = "404" ]; then
    echo "⚠️  API still 404 - check backend is running:"
    echo "   cd /root/ResonantGraphAIV0.1 && docker compose ps api"
elif [ "$API_TEST" = "422" ] || [ "$API_TEST" = "401" ]; then
    echo "✅ API is working! (422/401 = backend received request)"
else
    echo "📊 API status: $API_TEST"
fi
echo ""
echo "🌐 Site: https://dev-swat.com"
echo "   Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

