#!/bin/bash

# SIMPLE FIX - Just makes it work
set -e

echo "🔧 Fixing container..."

# Stop the broken container
docker stop frontend 2>/dev/null || true
sleep 2

# Start it fresh
docker start frontend
sleep 5

# Remove any bad configs
docker exec frontend sh -c 'rm -f /etc/nginx/conf.d/*cache*.conf' 2>/dev/null || true

# Deploy files
cd /root/frontend
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
docker cp dist/. frontend:/usr/share/nginx/html/ 2>/dev/null || {
    echo "⚠️  No dist folder, building..."
    export VITE_API_URL="/api"
    export VITE_FASTAPI_URL="/api"
    npm run build
    docker cp dist/. frontend:/usr/share/nginx/html/
}

# Restart nginx
docker exec frontend nginx -s reload 2>/dev/null || docker restart frontend
sleep 3

# Verify
if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo "✅ FIXED! Container is running and files are deployed"
    docker ps | grep frontend
else
    echo "❌ Still issues - checking logs..."
    docker logs frontend --tail=10
fi

