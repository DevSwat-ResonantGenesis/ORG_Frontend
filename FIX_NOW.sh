#!/bin/bash
# Direct fix - rebuild and ensure files are in place

set -e

cd /root/frontend

echo "🔧 Fixing now..."

# 1. Build
echo "Building..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# 2. Verify files exist
if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Files built"

# 3. Check what container sees
echo "Checking container..."
docker exec frontend ls -la /usr/share/nginx/html/ 2>&1

# 4. If container sees nothing, the bind mount might be broken - restart container
if ! docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo "⚠️ Bind mount not working, checking container..."
    
    # Check if we need to restart
    echo "Restarting frontend container..."
    docker restart frontend
    sleep 2
    
    # Check again
    docker exec frontend ls -la /usr/share/nginx/html/ 2>&1
fi

# 5. Make sure permissions are correct
chmod -R 755 dist/
find dist/ -type f -exec chmod 644 {} \;

# 6. Verify container can see files
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ Container can see files!"
    
    # Test nginx can read
    docker exec frontend su -s /bin/sh nginx -c "head -1 /usr/share/nginx/html/index.html" 2>&1 && echo "✅ Nginx can read" || echo "⚠️ Nginx cannot read"
    
    # Reload nginx
    docker exec frontend nginx -s reload
    echo "✅ Fixed! Check https://dev-swat.com"
else
    echo "❌ Container still can't see files"
    echo "Files on host:"
    ls -la dist/ | head -5
    echo "Files in container:"
    docker exec frontend ls -la /usr/share/nginx/html/ 2>&1
fi

