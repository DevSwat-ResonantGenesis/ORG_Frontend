#!/bin/bash

# Complete Site Restoration - Fixes Everything
set -e

echo "🔧 Restoring site completely..."

# Step 1: Check current state
echo "📋 Step 1: Checking current state..."
CONTAINER_ID=$(docker ps | grep frontend | grep "80->80" | awk '{print $1}' | head -1)

if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Frontend container not found on port 80"
    docker ps | grep frontend
    exit 1
fi

echo "✅ Found container: $CONTAINER_ID"

# Step 2: Check if SSL certs exist
echo ""
echo "🔍 Step 2: Checking SSL certificates..."
if [ -d "/root/frontend/ssl" ] || [ -d "/etc/letsencrypt" ]; then
    echo "✅ SSL certificates found"
    SSL_PATH="/etc/letsencrypt"
else
    echo "⚠️  SSL certificates location unknown"
    SSL_PATH=""
fi

# Step 3: Check nginx config
echo ""
echo "🔍 Step 3: Checking nginx config..."
docker exec frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null | head -20 || echo "⚠️  Can't read nginx config"

# Step 4: Deploy files to container
echo ""
echo "📤 Step 4: Deploying files..."
cd /root/frontend

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "⚠️  Building..."
    export VITE_API_URL="/api"
    export VITE_FASTAPI_URL="/api"
    npm run build
fi

docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
docker cp dist/. frontend:/usr/share/nginx/html/
echo "✅ Files deployed"

# Step 5: Check if nginx is running
echo ""
echo "🔄 Step 5: Checking nginx..."
if docker exec frontend nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx config OK"
    docker exec frontend nginx -s reload 2>/dev/null || docker restart frontend
else
    echo "⚠️  Nginx config issue, restarting container..."
    docker restart frontend
    sleep 5
fi

# Step 6: Test site
echo ""
echo "🧪 Step 6: Testing site..."
sleep 2

# Test HTTP
HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
echo "   HTTP (localhost): $HTTP_TEST"

# Test HTTPS
HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" -k https://dev-swat.com 2>/dev/null || echo "000")
echo "   HTTPS (dev-swat.com): $HTTPS_TEST"

# Step 7: Final status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$HTTP_TEST" = "200" ] || [ "$HTTPS_TEST" = "200" ]; then
    echo "✅ SITE IS BACK UP!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Test: https://dev-swat.com"
    docker ps | grep frontend
else
    echo "⚠️  Site may still have issues"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Container status:"
    docker ps -a | grep frontend
    echo ""
    echo "Container logs:"
    docker logs frontend --tail=20
    echo ""
    echo "Check nginx config:"
    docker exec frontend nginx -t 2>&1
fi

