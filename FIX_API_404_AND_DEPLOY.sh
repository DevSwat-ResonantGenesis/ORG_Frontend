#!/bin/bash

# Fix API 404 and Deploy All Fixes
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING API 404 AND DEPLOYING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/frontend

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

# Step 3: Update nginx config in container
echo "🔧 Step 3: Updating nginx config..."
docker cp nginx/conf.d/default.conf frontend:/etc/nginx/conf.d/default.conf
docker exec frontend nginx -t && docker exec frontend nginx -s reload
echo "✅ Nginx config updated"
echo ""

# Step 4: Deploy files
echo "📤 Step 4: Deploying files..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
docker cp dist/. frontend:/usr/share/nginx/html/
echo "✅ Files deployed"
echo ""

# Step 5: Test API endpoint
echo "🧪 Step 5: Testing API endpoint..."
echo "   Testing backend directly..."
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://137.184.234.252:8001/auth/login -H "Content-Type: application/json" -d '{"email":"test","password":"test"}' 2>/dev/null || echo "000")
echo "   Backend response: $BACKEND_TEST"

echo "   Testing through proxy..."
PROXY_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://dev-swat.com/api/auth/login -H "Content-Type: application/json" -d '{"email":"test","password":"test"}' 2>/dev/null || echo "000")
echo "   Proxy response: $PROXY_TEST"
echo ""

# Step 6: Check backend routes
echo "🔍 Step 6: Checking backend routes..."
cd /root/ResonantGraphAIV0.1
if docker compose ps api | grep -q "Up"; then
    echo "✅ Backend API is running"
    echo "   Backend health:"
    curl -s http://137.184.234.252:8001/health | head -3 || echo "   Backend not responding"
else
    echo "⚠️  Backend API is not running"
    echo "   Starting backend..."
    docker compose up -d api
    sleep 5
fi
echo ""

# Step 7: Final status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Fixed:"
echo "  ✅ Mobile hero section - proper sizing and layout"
echo "  ✅ Navigation bar - no collapsing"
echo "  ✅ Nginx API proxy - CORS headers added"
echo ""
if [ "$PROXY_TEST" = "404" ]; then
    echo "⚠️  API still returning 404"
    echo "   Check backend route: /auth/login (not /api/auth/login)"
    echo "   Backend expects: http://137.184.234.252:8001/auth/login"
    echo "   Frontend calls: https://dev-swat.com/api/auth/login"
    echo "   Nginx should proxy /api/auth/login → http://137.184.234.252:8001/auth/login"
elif [ "$PROXY_TEST" = "422" ] || [ "$PROXY_TEST" = "401" ]; then
    echo "✅ API is working! (422/401 is expected for invalid credentials)"
else
    echo "📊 API status: $PROXY_TEST"
fi
echo ""
echo "🌐 Site: https://dev-swat.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

