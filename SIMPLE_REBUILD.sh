#!/bin/bash
# Simple Rebuild - Just build and copy dist/ to existing container
# No Docker image rebuild needed

set -e

echo "🚀 Simple Frontend Rebuild"
echo "=========================="
echo ""

# Make sure we're in frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from ~/frontend directory"
    echo "   Run: cd ~/frontend && bash SIMPLE_REBUILD.sh"
    exit 1
fi

echo "📍 Building in: $(pwd)"
echo ""

# Step 1: Pull latest code
echo "📋 Step 1: Pulling latest code..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 2: Rebuild frontend
echo "📋 Step 2: Rebuilding frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ Build failed! dist directory is empty"
    exit 1
fi

echo "✅ Build complete"
echo "   Bundle sizes:"
ls -lh dist/assets/ | grep -E "vendor|chart" | awk '{printf "   %-40s %6s\n", $9, $5}' | head -5
echo ""

# Step 3: Check container exists
echo "📋 Step 3: Checking frontend container..."
if ! docker ps | grep -q frontend; then
    echo "❌ Frontend container is not running!"
    echo "   Start it first or use CLEAN_REBUILD_FRONTEND.sh"
    exit 1
fi
echo "✅ Container is running"
echo ""

# Step 4: Copy dist/ to container
echo "📋 Step 4: Copying dist/ to container..."
docker exec frontend rm -rf /usr/share/nginx/html/*
docker cp dist/. frontend:/usr/share/nginx/html/

FILE_COUNT=$(docker exec frontend sh -c 'ls -1 /usr/share/nginx/html/ 2>/dev/null | wc -l')
if [ "$FILE_COUNT" -gt "0" ]; then
    echo "✅ Files copied ($FILE_COUNT files)"
else
    echo "❌ No files copied!"
    exit 1
fi
echo ""

# Step 5: Reload nginx
echo "📋 Step 5: Reloading nginx..."
docker exec frontend nginx -s reload
echo "✅ Nginx reloaded"
echo ""

# Step 6: Verify
echo "📋 Step 6: Verifying..."
sleep 2

HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
if [ "$HTTP_TEST" = "200" ]; then
    echo "✅ Frontend: Working (HTTP $HTTP_TEST)"
else
    echo "⚠️  Frontend: HTTP $HTTP_TEST"
fi

API_TEST=$(curl -s http://localhost/api/health 2>/dev/null || echo "ERROR")
if echo "$API_TEST" | grep -q "status\|ok"; then
    echo "✅ API: Working"
else
    echo "⚠️  API: Not responding"
fi
echo ""

echo "=========================================="
echo "✅✅✅ REBUILD COMPLETE! ✅✅✅"
echo "=========================================="
echo ""
echo "🌐 Website: http://dev-swat.com"
echo "🔌 API: http://dev-swat.com/api/health"
echo ""
echo "💡 This only updates files, doesn't rebuild Docker image"
echo "   For full rebuild: bash CLEAN_REBUILD_FRONTEND.sh"
echo ""

