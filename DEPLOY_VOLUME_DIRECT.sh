#!/bin/bash
# Deploy directly to volume mount

set -e

echo "🔧 Deploying to volume mount..."

cd /root/frontend

# 1. Build
echo "🏗️ Building..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# 2. Find the volume mount point on host
echo ""
echo "📦 Finding volume mount..."
VOLUME_PATH=$(docker inspect frontend | grep -A 10 "Mounts" | grep "Source" | head -1 | cut -d'"' -f4)
if [ -z "$VOLUME_PATH" ]; then
    # Try alternative method
    VOLUME_NAME=$(docker inspect frontend | grep -A 10 "Mounts" | grep "Name" | head -1 | cut -d'"' -f4)
    if [ -n "$VOLUME_NAME" ]; then
        VOLUME_PATH="/var/lib/docker/volumes/$VOLUME_NAME/_data"
        echo "Found volume name: $VOLUME_NAME"
    fi
fi

echo "Volume path: $VOLUME_PATH"

# 3. If we found a volume path, copy directly
if [ -n "$VOLUME_PATH" ] && [ -d "$VOLUME_PATH" ]; then
    echo ""
    echo "📦 Copying directly to volume..."
    rm -rf "$VOLUME_PATH"/*
    cp -r dist/* "$VOLUME_PATH/"
    echo "✅ Files copied to volume"
    ls -la "$VOLUME_PATH" | head -10
else
    echo ""
    echo "⚠️ Could not find volume path, trying container method..."
    
    # Alternative: Use docker exec with sh -c and redirect
    docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' || echo "Could not clear (might be OK)"
    
    # Copy files one by one using cat
    echo "Copying index.html..."
    docker exec -i frontend sh -c 'cat > /usr/share/nginx/html/index.html' < dist/index.html
    
    # Copy assets folder file by file
    echo "Copying assets..."
    docker exec frontend mkdir -p /usr/share/nginx/html/assets
    for file in dist/assets/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            echo "Copying $filename..."
            docker exec -i frontend sh -c "cat > /usr/share/nginx/html/assets/$filename" < "$file"
        fi
    done
    
    # Copy other files
    for file in dist/*; do
        if [ -f "$file" ] && [ "$(basename "$file")" != "index.html" ]; then
            filename=$(basename "$file")
            echo "Copying $filename..."
            docker exec -i frontend sh -c "cat > /usr/share/nginx/html/$filename" < "$file"
        fi
    done
fi

# 4. Fix permissions (if needed)
echo ""
echo "🔐 Fixing permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/ 2>&1 || echo "chown failed (might be OK)"
docker exec frontend chmod -R 755 /usr/share/nginx/html/ 2>&1 || echo "chmod failed (might be OK)"

# 5. Verify
echo ""
echo "✅ Verifying..."
docker exec frontend ls -la /usr/share/nginx/html/ | head -20
docker exec frontend test -f /usr/share/nginx/html/index.html && echo "✅ index.html exists" || echo "❌ Missing!"

# 6. Reload nginx
echo ""
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Deployment complete!"

