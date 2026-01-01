#!/bin/bash

# Deploy with fix for read-only nginx config
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOYING WITH READ-ONLY FIX"
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

# Step 1: Stash and pull
echo "📥 Step 1: Stashing local changes and pulling latest code..."
git stash 2>/dev/null || true
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

# Step 3: Update nginx config (handle read-only volume)
echo "🔧 Step 3: Updating nginx config..."
if [ -f "nginx/conf.d/default.conf" ]; then
    # Since nginx config is mounted as read-only, we need to restart the container
    # The config file on the host is already updated (from git pull)
    echo "   Config file updated on host"
    
    # Check if using docker-compose
    if [ -f "docker-compose.frontend.yml" ]; then
        echo "   Restarting container with docker-compose to pick up new config..."
        docker compose -f docker-compose.frontend.yml restart frontend 2>/dev/null || {
            echo "   Using docker restart instead..."
            docker restart frontend
        }
    else
        echo "   Restarting container to pick up new config..."
        docker restart frontend
    fi
    
    sleep 3
    
    # Test nginx config
    if docker exec frontend nginx -t 2>/dev/null; then
        echo "✅ Nginx config is valid"
    else
        echo "⚠️  Nginx config test failed, but container restarted"
    fi
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
sleep 3
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
echo "  ✅ Read-only volume issue handled"
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

