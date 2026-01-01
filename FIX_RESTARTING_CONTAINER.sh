#!/bin/bash

# Fix Restarting Container - Remove bad nginx config and restart properly

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING RESTARTING CONTAINER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Stop the container
echo "🛑 Step 1: Stopping container..."
docker stop frontend 2>/dev/null || true
sleep 2
echo "✅ Container stopped"
echo ""

# Step 2: Start container (will use original config)
echo "▶️  Step 2: Starting container with original config..."
docker start frontend
sleep 5

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
for i in {1..30}; do
    if docker exec frontend echo "ready" 2>/dev/null; then
        echo "✅ Container is ready"
        break
    fi
    sleep 1
done
echo ""

# Step 3: Remove bad nginx configs
echo "🧹 Step 3: Removing problematic nginx configs..."
docker exec frontend sh -c 'rm -f /etc/nginx/conf.d/no-cache.conf /etc/nginx/conf.d/cache-bust.conf' 2>/dev/null || true
echo "✅ Removed bad configs"
echo ""

# Step 4: Test nginx config
echo "🧪 Step 4: Testing nginx config..."
if docker exec frontend nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx config is valid"
else
    echo "⚠️  Nginx config still has issues"
    docker exec frontend nginx -t
    echo ""
    echo "Restarting container to reset config..."
    docker restart frontend
    sleep 5
fi
echo ""

# Step 5: Deploy files
echo "📤 Step 5: Deploying files..."
cd /root/frontend

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "⚠️  dist folder not found, rebuilding..."
    export VITE_API_URL="/api"
    export VITE_FASTAPI_URL="/api"
    npm run build
fi

docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
docker cp dist/. frontend:/usr/share/nginx/html/
echo "✅ Files deployed"
echo ""

# Step 6: Reload nginx
echo "🔄 Step 6: Reloading nginx..."
docker exec frontend nginx -s reload 2>/dev/null || {
    echo "⚠️  Reload failed, restarting container..."
    docker restart frontend
    sleep 5
}
echo "✅ Nginx reloaded"
echo ""

# Step 7: Verify
echo "🧪 Step 7: Verifying deployment..."
sleep 2

if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo "✅ index.html found"
    echo "✅ Deployment successful!"
else
    echo "❌ index.html not found - trying again..."
    docker cp dist/. frontend:/usr/share/nginx/html/
    sleep 2
    if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
        echo "✅ index.html now found"
    else
        echo "❌ Still having issues - check container logs:"
        docker logs frontend --tail=20
        exit 1
    fi
fi

# Check container status
echo ""
echo "📊 Container status:"
docker ps | grep frontend

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONTAINER FIXED AND DEPLOYED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your site should be working at: https://dev-swat.com"
echo ""
echo "📋 To see changes:"
echo "  - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "  - Or clear browser cache"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

