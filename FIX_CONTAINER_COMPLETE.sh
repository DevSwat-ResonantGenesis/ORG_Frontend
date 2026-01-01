#!/bin/bash

# Complete Fix - Handles restarting container
set -e

echo "🔧 Fixing container completely..."

# Step 1: Force stop and remove container
echo "🛑 Step 1: Force stopping container..."
docker stop frontend 2>/dev/null || true
docker kill frontend 2>/dev/null || true
sleep 3

# Step 2: Check if we need to recreate or just start
echo "▶️  Step 2: Starting container..."
docker start frontend 2>/dev/null || {
    echo "⚠️  Container won't start, checking status..."
    docker ps -a | grep frontend
    echo "Trying to recreate container..."
    # Get the image name
    IMAGE=$(docker inspect frontend --format='{{.Config.Image}}' 2>/dev/null || echo "frontend:latest")
    # Remove and recreate
    docker rm -f frontend 2>/dev/null || true
    docker run -d --name frontend -p 80:80 -p 443:443 "$IMAGE" 2>/dev/null || {
        echo "❌ Could not recreate. Using existing container..."
        docker start frontend
    }
}

# Wait for container to be ready
echo "⏳ Waiting for container..."
for i in {1..20}; do
    sleep 1
    if docker exec frontend echo "ready" 2>/dev/null; then
        echo "✅ Container is ready"
        break
    fi
    if [ $i -eq 20 ]; then
        echo "⚠️  Container not responding, but continuing..."
    fi
done

# Step 3: Remove bad configs (try multiple methods)
echo "🧹 Step 3: Removing bad nginx configs..."
docker exec frontend sh -c 'rm -f /etc/nginx/conf.d/no-cache.conf /etc/nginx/conf.d/cache-bust.conf' 2>/dev/null || true
docker exec frontend sh -c 'rm -f /etc/nginx/conf.d/*cache*.conf' 2>/dev/null || true

# Step 4: Test nginx
echo "🧪 Step 4: Testing nginx..."
sleep 2
if docker exec frontend nginx -t 2>/dev/null | grep -q "successful"; then
    echo "✅ Nginx config is OK"
else
    echo "⚠️  Nginx config test failed, but continuing..."
    docker exec frontend nginx -t 2>&1 | head -5
fi

# Step 5: Deploy files
echo "📤 Step 5: Deploying files..."
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

# Step 6: Restart nginx
echo "🔄 Step 6: Restarting nginx..."
docker exec frontend nginx -s reload 2>/dev/null || {
    echo "⚠️  Reload failed, restarting container..."
    docker restart frontend
    sleep 5
}

# Step 7: Final verify
echo "✅ Step 7: Verifying..."
sleep 3

if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ FIXED! Container is running"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker ps | grep frontend
    echo ""
    echo "🌐 Site: https://dev-swat.com"
    echo "📋 Hard refresh: Ctrl+Shift+R"
else
    echo "❌ Files not found. Container status:"
    docker ps -a | grep frontend
    echo ""
    echo "Container logs:"
    docker logs frontend --tail=10
fi

