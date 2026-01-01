#!/bin/bash
# Deployment with verification at each step

set -e

echo "🔧 Deployment with verification..."

cd /root/frontend

# 1. Build
echo "🏗️ Building..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# 2. Verify build locally
echo ""
echo "📊 Verifying build locally:"
ls -lh dist/index.html
if [ ! -f "dist/index.html" ]; then
    echo "❌ ERROR: dist/index.html not found after build!"
    exit 1
fi
echo "✅ index.html exists locally: $(du -h dist/index.html | cut -f1)"

# 3. Clear nginx
echo ""
echo "🧹 Clearing nginx directory..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'

# 4. Verify nginx is empty
echo ""
echo "📋 Verifying nginx is empty:"
docker exec frontend ls -la /usr/share/nginx/html/

# 5. Copy index.html and verify immediately
echo ""
echo "📦 Copying index.html..."
docker cp dist/index.html frontend:/usr/share/nginx/html/index.html

echo ""
echo "✅ Verifying index.html was copied:"
docker exec frontend ls -lh /usr/share/nginx/html/index.html
docker exec frontend test -f /usr/share/nginx/html/index.html && echo "✅ index.html exists in container" || echo "❌ index.html MISSING!"

# 6. Copy assets
echo ""
echo "📦 Copying assets..."
if [ -d "dist/assets" ]; then
    docker exec frontend mkdir -p /usr/share/nginx/html/assets
    docker cp dist/assets/. frontend:/usr/share/nginx/html/assets/
    echo "✅ Assets copied"
    docker exec frontend ls -la /usr/share/nginx/html/assets/ | head -5
else
    echo "⚠️ No assets folder found"
fi

# 7. Copy other files
echo ""
echo "📦 Copying other files..."
for file in dist/*; do
    if [ -f "$file" ] && [ "$(basename "$file")" != "index.html" ]; then
        filename=$(basename "$file")
        echo "Copying $filename..."
        docker cp "$file" "frontend:/usr/share/nginx/html/$filename"
    fi
done

# 8. Final verification
echo ""
echo "✅ Final verification:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -20
docker exec frontend du -sh /usr/share/nginx/html/

# Verify index.html exists
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html exists"
    docker exec frontend head -3 /usr/share/nginx/html/index.html
else
    echo "❌ CRITICAL: index.html still missing!"
    exit 1
fi

# 9. Fix permissions
echo ""
echo "🔐 Fixing permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
docker exec frontend chmod -R 755 /usr/share/nginx/html/
docker exec frontend find /usr/share/nginx/html/ -type f -exec chmod 644 {} \;
docker exec frontend find /usr/share/nginx/html/ -type d -exec chmod 755 {} \;

# 10. Test nginx can read
echo ""
echo "🧪 Testing nginx can read:"
docker exec frontend su -s /bin/sh nginx -c "head -1 /usr/share/nginx/html/index.html" && echo "✅ Nginx can read index.html" || echo "❌ Nginx cannot read"

# 11. Reload nginx
echo ""
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Deployment complete with verification!"

