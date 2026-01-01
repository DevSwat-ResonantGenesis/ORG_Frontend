#!/bin/bash
# Deployment using volume mount approach

set -e

echo "🔧 Deployment using volume mount method..."

cd /root/frontend

# 1. Build
echo "🏗️ Building..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# 2. Check if we can write to /tmp first, then copy
echo ""
echo "📦 Copying to /tmp first, then moving..."

# Copy to /tmp in container
docker exec frontend mkdir -p /tmp/nginx-deploy
docker cp dist/. frontend:/tmp/nginx-deploy/

# Verify files in /tmp
echo ""
echo "✅ Files in /tmp:"
docker exec frontend ls -la /tmp/nginx-deploy/ | head -10

# 3. Move files from /tmp to html directory
echo ""
echo "📦 Moving files to html directory..."
docker exec frontend sh -c 'cp -r /tmp/nginx-deploy/* /usr/share/nginx/html/ 2>&1 || cp -r /tmp/nginx-deploy/. /usr/share/nginx/html/'

# 4. Verify files were moved
echo ""
echo "✅ Verifying files:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -20
docker exec frontend test -f /usr/share/nginx/html/index.html && echo "✅ index.html exists" || echo "❌ Missing!"

# 5. Fix permissions
echo ""
echo "🔐 Fixing permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/ 2>&1 || echo "⚠️ chown failed (might be OK)"
docker exec frontend chmod -R 755 /usr/share/nginx/html/ 2>&1 || echo "⚠️ chmod failed (might be OK)"

# 6. Clean up /tmp
docker exec frontend rm -rf /tmp/nginx-deploy

# 7. Reload nginx
echo ""
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Deployment complete!"

