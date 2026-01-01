#!/bin/bash

# Fix for read-only volume deployment issue
# The dist folder is mounted as read-only, so we need a different approach

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING READ-ONLY VOLUME DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Auto-detect frontend folder
if [ -d "/root/frontend" ]; then
    FRONTEND_DIR="/root/frontend"
elif [ -d "/root/ResonantGraphAI_FrontendV0.1-" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1-"
else
    echo "❌ Frontend folder not found!"
    exit 1
fi

cd "$FRONTEND_DIR"

echo "📁 Working directory: $(pwd)"
echo ""

# Check how container is running
echo "🔍 Checking container setup..."
CONTAINER_INFO=$(docker inspect frontend 2>/dev/null | grep -A 20 '"Mounts"' || echo "")

if echo "$CONTAINER_INFO" | grep -q '"Destination": "/usr/share/nginx/html"'; then
    echo "   Container has /usr/share/nginx/html mounted"
    
    # Check if it's read-only
    if echo "$CONTAINER_INFO" | grep -q '"Mode": "ro"'; then
        echo "   ⚠️  Volume is read-only"
        echo ""
        echo "🔧 Solution: Copy files to a temporary location, then move them"
        
        # Copy to temp location inside container
        echo "   Step 1: Copying files to temp location..."
        docker exec frontend sh -c 'rm -rf /tmp/nginx-html-new' 2>/dev/null || true
        docker cp dist/. frontend:/tmp/nginx-html-new/
        
        # Move files from temp to actual location (if container has write access)
        echo "   Step 2: Moving files to nginx directory..."
        docker exec frontend sh -c 'cp -r /tmp/nginx-html-new/* /usr/share/nginx/html/ 2>/dev/null || echo "Cannot write to read-only mount"' || {
            echo "   ⚠️  Cannot write to read-only mount"
            echo ""
            echo "🔧 Alternative: Recreate container without read-only mount"
            echo ""
            echo "   Option 1: Stop container and recreate without :ro"
            echo "   Option 2: Use docker-compose with writable volume"
            echo ""
            echo "   Quick fix: Update docker-compose.frontend.yml to remove :ro from dist mount"
            echo "   Then: docker compose -f docker-compose.frontend.yml down"
            echo "         docker compose -f docker-compose.frontend.yml up -d"
            exit 1
        }
    else
        echo "   ✅ Volume is writable, copying directly..."
        docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
        docker cp dist/. frontend:/usr/share/nginx/html/
    fi
else
    echo "   ✅ No volume mount, copying directly..."
    docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
    docker cp dist/. frontend:/usr/share/nginx/html/
fi

echo ""
echo "✅ Files deployed!"
echo ""

# Reload nginx
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload 2>/dev/null || {
    echo "   Reload failed, restarting container..."
    docker restart frontend
    sleep 3
}

echo ""
echo "✅ Complete!"
echo ""

