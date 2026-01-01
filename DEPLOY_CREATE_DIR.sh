#!/bin/bash
# Deployment script that creates directory first

set -e

echo "🔧 Deployment with directory creation..."

cd /root/frontend

# 1. Build
echo "🏗️ Building..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# 2. Create directory structure in container
echo ""
echo "📁 Creating directory structure..."
docker exec frontend mkdir -p /usr/share/nginx/html/assets
docker exec frontend mkdir -p /usr/share/nginx/html

# 3. Verify directory exists
echo ""
echo "✅ Verifying directory:"
docker exec frontend ls -ld /usr/share/nginx/html/

# 4. Copy index.html using cat
echo ""
echo "📦 Copying index.html..."
docker exec -i frontend sh -c 'cat > /usr/share/nginx/html/index.html' < dist/index.html

# 5. Verify index.html
echo ""
echo "✅ Verifying index.html:"
docker exec frontend ls -lh /usr/share/nginx/html/index.html
docker exec frontend test -f /usr/share/nginx/html/index.html && echo "✅ index.html exists" || echo "❌ Missing!"

# 6. Copy assets
echo ""
echo "📦 Copying assets..."
if [ -d "dist/assets" ]; then
    docker cp dist/assets/. frontend:/usr/share/nginx/html/assets/
    echo "✅ Assets copied"
    docker exec frontend ls -la /usr/share/nginx/html/assets/ | head -5
fi

# 7. Copy other files
echo ""
echo "📦 Copying other files..."
for file in dist/*; do
    if [ -f "$file" ] && [ "$(basename "$file")" != "index.html" ]; then
        filename=$(basename "$file")
        echo "Copying $filename..."
        docker exec -i frontend sh -c "cat > /usr/share/nginx/html/$filename" < "$file"
    fi
done

# 8. Fix permissions
echo ""
echo "🔐 Fixing permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
docker exec frontend chmod -R 755 /usr/share/nginx/html/
docker exec frontend find /usr/share/nginx/html/ -type f -exec chmod 644 {} \;
docker exec frontend find /usr/share/nginx/html/ -type d -exec chmod 755 {} \;

# 9. Final verification
echo ""
echo "✅ Final verification:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -20
docker exec frontend du -sh /usr/share/nginx/html/
docker exec frontend test -f /usr/share/nginx/html/index.html && echo "✅ index.html exists" || echo "❌ Missing!"

# 10. Test nginx can read
echo ""
echo "🧪 Testing nginx can read:"
docker exec frontend su -s /bin/sh nginx -c "head -1 /usr/share/nginx/html/index.html" && echo "✅ Nginx can read" || echo "❌ Cannot read"

# 11. Reload nginx
echo ""
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Deployment complete!"

