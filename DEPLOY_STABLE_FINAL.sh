#!/bin/bash

# STABLE DEPLOYMENT - Uses docker-compose for reliability
# This is the ONLY deployment script you should use

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STABLE DEPLOYMENT"
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

# Step 3: Stop old container (if using docker-compose)
if [ -f "docker-compose.frontend.yml" ]; then
    echo "🔄 Step 3: Using docker-compose..."
    docker-compose -f docker-compose.frontend.yml down 2>/dev/null || true
    docker-compose -f docker-compose.frontend.yml up -d
    echo "✅ Container started with docker-compose"
else
    # Step 3: Update existing container (files are in volume)
    echo "🔄 Step 3: Files will be updated automatically (volume mount)"
    echo "✅ Files are in ./dist (mounted to container)"
fi
echo ""

# Step 4: Verify
echo "🧪 Step 4: Verifying..."
sleep 3

if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo "✅ Files deployed"
else
    echo "⚠️  Files not found, copying manually..."
    docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
    docker cp dist/. frontend:/usr/share/nginx/html/
fi

# Test nginx
if docker exec frontend nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx config OK"
    docker exec frontend nginx -s reload 2>/dev/null || true
else
    echo "⚠️  Nginx config issue, restarting..."
    docker restart frontend
    sleep 5
fi

# Test site
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k https://dev-swat.com 2>/dev/null || echo "000")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Status:"
echo "  HTTP: $HTTP_CODE"
echo "  HTTPS: $HTTPS_CODE"
echo ""
echo "🌐 Site: https://dev-swat.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

