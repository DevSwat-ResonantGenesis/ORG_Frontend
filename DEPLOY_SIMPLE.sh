#!/bin/bash
# Simple, reliable deployment script

set -e

echo "🔧 Simple deployment..."

cd /root/frontend

# 1. Build
echo "🏗️ Building..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# 2. Verify build
if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - no index.html"
    exit 1
fi

echo "✅ Build complete: $(du -sh dist/ | cut -f1)"

# 3. Clear nginx
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'

# 4. Copy files - simple method: copy index.html first, then assets
echo "📦 Copying files..."
docker cp dist/index.html frontend:/usr/share/nginx/html/index.html

# Copy assets folder if it exists
if [ -d "dist/assets" ]; then
    docker exec frontend mkdir -p /usr/share/nginx/html/assets
    docker cp dist/assets/. frontend:/usr/share/nginx/html/assets/
fi

# Copy any other files in dist root (like hero-graph.svg)
for file in dist/*; do
    if [ -f "$file" ] && [ "$(basename "$file")" != "index.html" ]; then
        filename=$(basename "$file")
        docker cp "$file" "frontend:/usr/share/nginx/html/$filename"
    fi
done

# 5. Fix permissions
echo "🔐 Fixing permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
docker exec frontend chmod -R 755 /usr/share/nginx/html/

# 6. Verify
docker exec frontend test -f /usr/share/nginx/html/index.html && echo "✅ index.html exists" || echo "❌ Missing!"

# 7. Reload nginx
docker exec frontend nginx -s reload

echo "✅ Done! Check https://dev-swat.com"

