#!/bin/bash

# Verify and Deploy to New Container
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFYING AND DEPLOYING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/frontend

# Step 1: Check container status
echo "📋 Step 1: Checking container..."
docker ps | grep frontend
echo ""

# Step 2: Build if needed
echo "🔨 Step 2: Building frontend..."
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    export VITE_API_URL="/api"
    export VITE_FASTAPI_URL="/api"
    npm run build
    echo "✅ Built"
else
    echo "✅ Build exists"
fi
echo ""

# Step 3: Verify files are in dist (volume mount should handle it)
echo "📁 Step 3: Checking files..."
if [ -f "dist/index.html" ]; then
    echo "✅ dist/index.html exists"
    echo "   Files will be automatically available in container (volume mount)"
else
    echo "❌ dist/index.html not found"
    exit 1
fi
echo ""

# Step 4: Test nginx config
echo "🧪 Step 4: Testing nginx..."
if docker exec frontend nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx config OK"
    docker exec frontend nginx -s reload 2>/dev/null || true
else
    echo "⚠️  Nginx config issue:"
    docker exec frontend nginx -t 2>&1 | head -5
fi
echo ""

# Step 5: Test site
echo "🧪 Step 5: Testing site..."
sleep 2

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k https://dev-swat.com 2>/dev/null || echo "000")

echo "   HTTP (localhost): $HTTP_CODE"
echo "   HTTPS (dev-swat.com): $HTTPS_CODE"
echo ""

# Step 6: Check if files are accessible in container
echo "🔍 Step 6: Checking container files..."
if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo "✅ index.html found in container"
    FILE_COUNT=$(docker exec frontend find /usr/share/nginx/html -type f 2>/dev/null | wc -l)
    echo "   Found $FILE_COUNT files"
else
    echo "⚠️  index.html not found - volume mount may not be working"
    echo "   Copying files manually..."
    docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
    docker cp dist/. frontend:/usr/share/nginx/html/
    echo "✅ Files copied manually"
fi
echo ""

# Step 7: Final status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$HTTPS_CODE" = "200" ]; then
    echo "✅ SITE IS WORKING!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Site: https://dev-swat.com"
    echo "✅ HTTPS is working"
    echo ""
    echo "📋 Container status:"
    docker ps | grep frontend
elif [ "$HTTP_CODE" = "200" ]; then
    echo "⚠️  HTTP works but HTTPS doesn't"
    echo "   Check SSL certificates"
else
    echo "❌ Site not responding"
    echo ""
    echo "Container logs:"
    docker logs frontend --tail=10
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

