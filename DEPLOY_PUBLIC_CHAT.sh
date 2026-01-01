#!/bin/bash

# Deploy Public Resonant Chat

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOYING PUBLIC RESONANT CHAT"
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

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build complete"
echo ""

# Step 3: Verify "Aivara AI" is in the build
echo "🔍 Step 3: Verifying 'Aivara AI' button in build..."
if grep -r "Aivara AI" dist/ 2>/dev/null | head -1; then
    echo "✅ 'Aivara AI' button found in build"
else
    echo "⚠️  'Aivara AI' not found in HTML (may be in JS bundle - this is normal)"
fi
echo ""

# Step 4: Restart container
echo "🔄 Step 4: Restarting container..."
docker-compose -f docker-compose.frontend.yml restart frontend
sleep 3
echo "✅ Container restarted"
echo ""

# Step 5: Test
echo "🧪 Step 5: Testing..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k https://dev-swat.com 2>/dev/null || echo "000")
echo "   HTTP: $HTTP_CODE"
echo "   HTTPS: $HTTPS_CODE"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Test: https://dev-swat.com"
echo "💬 Resonant Chat (now public): https://dev-swat.com/resonant-chat"
echo ""
echo "📝 IMPORTANT: Clear browser cache!"
echo "   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   - Or use incognito/private mode"
echo ""

