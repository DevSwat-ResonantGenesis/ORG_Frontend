#!/bin/bash

# Fix Restart Loop - Remove and recreate container
set -e

echo "🔧 Fixing restart loop..."

# Step 1: Get container info before removing
echo "📋 Getting container info..."
IMAGE=$(docker inspect frontend --format='{{.Config.Image}}' 2>/dev/null || echo "frontend:latest")
PORTS=$(docker port frontend 2>/dev/null | head -1 || echo "")

# Step 2: Force remove container
echo "🗑️  Removing broken container..."
docker stop frontend 2>/dev/null || true
docker kill frontend 2>/dev/null || true
sleep 2
docker rm -f frontend 2>/dev/null || true
sleep 2
echo "✅ Container removed"

# Step 3: Recreate container
echo "🆕 Creating new container..."
docker run -d \
  --name frontend \
  -p 80:80 \
  -p 443:443 \
  --restart unless-stopped \
  "$IMAGE" 2>/dev/null || {
    echo "⚠️  Could not create new container, trying to start existing..."
    docker start frontend
}

# Wait for container
echo "⏳ Waiting for container to start..."
sleep 5

for i in {1..20}; do
    if docker exec frontend echo "ready" 2>/dev/null; then
        echo "✅ Container is ready"
        break
    fi
    sleep 1
done

# Step 4: Remove bad configs
echo "🧹 Removing bad configs..."
docker exec frontend sh -c 'rm -f /etc/nginx/conf.d/*cache*.conf /etc/nginx/conf.d/no-cache.conf /etc/nginx/conf.d/cache-bust.conf' 2>/dev/null || true

# Step 5: Test nginx
echo "🧪 Testing nginx..."
if docker exec frontend nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx config OK"
else
    echo "⚠️  Nginx config issues:"
    docker exec frontend nginx -t 2>&1 | head -5
fi

# Step 6: Deploy files
echo "📤 Deploying files..."
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

# Step 7: Reload nginx
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload 2>/dev/null || docker restart frontend
sleep 3

# Step 8: Verify
echo "✅ Verifying..."
if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ FIXED! Container is running"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker ps | grep frontend
    echo ""
    echo "🌐 Site: https://dev-swat.com"
else
    echo "❌ Still issues. Container status:"
    docker ps -a | grep frontend
fi

