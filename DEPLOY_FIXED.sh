#!/bin/bash
# Fixed deployment script

set -e  # Exit on error

echo "🔧 Starting deployment..."

cd /root/frontend

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# 2. Build
echo "🏗️ Building..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# 3. Check build output
echo "📊 Build output size:"
du -sh dist/
ls -lh dist/ | head -10

# 4. Verify index.html exists
if [ ! -f "dist/index.html" ]; then
    echo "❌ ERROR: dist/index.html not found!"
    exit 1
fi

echo "✅ dist/index.html exists ($(du -h dist/index.html | cut -f1))"

# 5. Clear nginx html directory
echo "🧹 Clearing nginx html directory..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'

# 6. Copy ALL files from dist to nginx
echo "📦 Copying files to nginx container..."
docker cp dist/. frontend:/usr/share/nginx/html/

# 7. Verify files were copied
echo "✅ Verifying copied files:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -20
docker exec frontend du -sh /usr/share/nginx/html/

# 8. Fix permissions
echo "🔐 Fixing permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
docker exec frontend chmod -R 755 /usr/share/nginx/html/
docker exec frontend find /usr/share/nginx/html/ -type f -exec chmod 644 {} \;
docker exec frontend find /usr/share/nginx/html/ -type d -exec chmod 755 {} \;

# 9. Verify nginx can access
echo "🧪 Verifying nginx can access files..."
docker exec frontend ls -l /usr/share/nginx/html/index.html

# 10. Test nginx config
echo "🧪 Testing nginx config..."
docker exec frontend nginx -t

# 11. Reload nginx
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Deployment complete!"
echo "📊 Final size check:"
docker exec frontend du -sh /usr/share/nginx/html/
docker exec frontend ls -lh /usr/share/nginx/html/index.html

