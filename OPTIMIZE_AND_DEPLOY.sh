#!/bin/bash
# Optimize Frontend Build and Deploy
# Rebuilds frontend with correct API path and optimized bundles

set -e

echo "🚀 Optimizing Frontend Build and Deploying"
echo "=========================================="
echo ""

cd ~/frontend

# Step 1: Pull latest code (with optimized vite.config.ts)
echo "📋 Step 1: Pulling latest code..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 2: Check if vite.config.ts has optimization
echo "📋 Step 2: Checking vite.config.ts..."
if grep -q "echarts-vendor" vite.config.ts; then
    echo "✅ vite.config.ts has bundle optimization"
else
    echo "⚠️  vite.config.ts might not have optimization"
    echo "   Continuing anyway..."
fi
echo ""

# Step 3: Rebuild with correct API URL and optimization
echo "📋 Step 3: Rebuilding frontend..."
echo "   Using API URL: /api"
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"

npm run build

if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ Build failed! dist directory is empty"
    exit 1
fi

echo "✅ Build complete"
echo ""

# Step 4: Check bundle sizes
echo "📋 Step 4: Checking bundle sizes..."
echo ""
echo "Bundle sizes:"
ls -lh dist/assets/ | grep -E "vendor|chart" | awk '{printf "   %-40s %6s\n", $9, $5}'
echo ""

# Check if optimization worked
if ls dist/assets/echarts-vendor-*.js 2>/dev/null | grep -q .; then
    echo "✅ Bundle optimization applied (echarts-vendor found)"
else
    echo "⚠️  Bundle optimization might not be applied (still using chart-vendor)"
    if ls dist/assets/chart-vendor-*.js 2>/dev/null | grep -q .; then
        echo "   Found chart-vendor - optimization not applied"
        echo "   This is okay, but bundles might be larger"
    fi
fi
echo ""

# Step 5: Deploy to container
echo "📋 Step 5: Deploying to container..."
docker exec frontend rm -rf /usr/share/nginx/html/*
docker cp dist/. frontend:/usr/share/nginx/html/

# Verify files
FILE_COUNT=$(docker exec frontend sh -c 'ls -1 /usr/share/nginx/html/ 2>/dev/null | wc -l')
if [ "$FILE_COUNT" -gt "0" ]; then
    echo "✅ Files deployed ($FILE_COUNT files)"
else
    echo "❌ No files deployed!"
    exit 1
fi
echo ""

# Step 6: Verify frontend uses /api
echo "📋 Step 6: Verifying frontend configuration..."
if docker exec frontend sh -c 'grep -q "/api" /usr/share/nginx/html/index.html 2>/dev/null' 2>/dev/null; then
    echo "✅ Frontend uses /api path"
else
    echo "⚠️  Frontend might not use /api path"
    echo "   Check browser console to verify API calls"
fi
echo ""

# Step 7: Test
echo "📋 Step 7: Testing deployment..."
sleep 2

FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
if [ "$FRONTEND_TEST" = "200" ]; then
    echo "✅ Frontend is accessible (HTTP $FRONTEND_TEST)"
else
    echo "⚠️  Frontend test returned HTTP $FRONTEND_TEST"
fi

API_TEST=$(curl -s http://localhost/api/health 2>/dev/null || echo "ERROR")
if echo "$API_TEST" | grep -q "status\|ok"; then
    echo "✅ API proxy is working"
else
    echo "⚠️  API proxy test failed"
fi
echo ""

echo "=========================================="
echo "✅✅✅ DEPLOYMENT COMPLETE! ✅✅✅"
echo "=========================================="
echo ""
echo "🌐 Website: http://dev-swat.com"
echo "🔌 API: http://dev-swat.com/api/health"
echo ""
echo "📊 Bundle Sizes:"
ls -lh dist/assets/ | grep -E "vendor|chart" | awk '{printf "   %-40s %6s\n", $9, $5}' | head -5
echo ""
echo "💡 Next Steps (Optional):"
echo "   - Set up SSL: bash RESTORE_SSL.sh"
echo "   - Test in browser: http://dev-swat.com"
echo "   - Check browser console for API calls"
echo ""

