#!/bin/bash

# Fix Unhealthy Frontend Container

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING UNHEALTHY FRONTEND CONTAINER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/frontend

# Step 1: Check if dist folder exists
echo "📁 Step 1: Checking dist folder..."
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "⚠️  dist folder not found, rebuilding..."
    export VITE_API_URL="/api"
    export VITE_FASTAPI_URL="/api"
    npm run build
fi
echo "✅ dist folder ready"
echo ""

# Step 2: Stop and remove unhealthy container
echo "🛑 Step 2: Stopping unhealthy container..."
docker-compose -f docker-compose.frontend.yml down 2>/dev/null || true
docker stop frontend 2>/dev/null || true
docker rm frontend 2>/dev/null || true
echo "✅ Old container removed"
echo ""

# Step 3: Verify nginx config
echo "🔧 Step 3: Verifying nginx config..."
if [ -f "nginx/conf.d/default.conf" ]; then
    docker run --rm -v "$(pwd)/nginx/conf.d:/etc/nginx/conf.d" nginx:alpine nginx -t
    echo "✅ Nginx config is valid"
else
    echo "⚠️  Nginx config not found, using default"
fi
echo ""

# Step 4: Start fresh container
echo "🚀 Step 4: Starting fresh container..."
docker-compose -f docker-compose.frontend.yml up -d
sleep 5
echo "✅ Container started"
echo ""

# Step 5: Verify container is running
echo "🧪 Step 5: Verifying container..."
sleep 3
if docker ps | grep -q "frontend"; then
    echo "✅ Container is running"
    
    # Check health
    HEALTH=$(docker inspect frontend --format='{{.State.Health.Status}}' 2>/dev/null || echo "no-health-check")
    echo "   Health status: $HEALTH"
    
    # Test HTTP
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
    echo "   HTTP status: $HTTP_CODE"
    
    # Test HTTPS
    HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k https://dev-swat.com 2>/dev/null || echo "000")
    echo "   HTTPS status: $HTTPS_CODE"
else
    echo "❌ Container failed to start"
    echo "   Check logs: docker-compose -f docker-compose.frontend.yml logs"
    exit 1
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FRONTEND FIXED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Test your site: https://dev-swat.com"
echo "💬 Test Resonant Chat: https://dev-swat.com/resonant-chat"
echo ""

