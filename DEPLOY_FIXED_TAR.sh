#!/bin/bash
# Fixed deployment script using tar correctly

set -e

echo "🔧 Starting deployment with fixed tar method..."

cd /root/frontend

# 1. Clean and rebuild
echo "🧹 Cleaning previous build..."
rm -rf dist/

echo "🏗️ Building application..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# 2. Verify build
echo ""
echo "📊 Build output:"
ls -la dist/
du -sh dist/

if [ ! -f "dist/index.html" ]; then
    echo "⚠️ Copying index.html manually..."
    cp index.html dist/index.html
fi

# 3. Clear nginx directory
echo ""
echo "🧹 Clearing nginx html directory..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'

# 4. Copy files using tar (from current directory, not changing to dist)
echo ""
echo "📦 Copying files using tar..."

# Use tar from the root directory, specifying dist/ as the source
(cd dist && tar -czf - .) | docker exec -i frontend sh -c 'cd /usr/share/nginx/html && tar -xzf -'

# 5. Verify files were copied
echo ""
echo "✅ Verifying copied files:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -20
docker exec frontend du -sh /usr/share/nginx/html/

# Verify index.html
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html copied successfully"
    docker exec frontend ls -lh /usr/share/nginx/html/index.html
    docker exec frontend head -3 /usr/share/nginx/html/index.html
else
    echo "❌ ERROR: index.html was NOT copied!"
    echo "🔧 Trying direct copy..."
    docker cp dist/index.html frontend:/usr/share/nginx/html/index.html
    docker exec frontend ls -lh /usr/share/nginx/html/index.html
fi

# 6. Check assets folder
echo ""
echo "📦 Checking assets folder:"
docker exec frontend ls -la /usr/share/nginx/html/assets/ 2>/dev/null | head -10 || echo "⚠️ Assets folder not found"

# 7. Fix permissions
echo ""
echo "🔐 Fixing permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
docker exec frontend chmod -R 755 /usr/share/nginx/html/
docker exec frontend find /usr/share/nginx/html/ -type f -exec chmod 644 {} \;
docker exec frontend find /usr/share/nginx/html/ -type d -exec chmod 755 {} \;

# 8. Final verification
echo ""
echo "✅ Final verification:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -10
docker exec frontend test -f /usr/share/nginx/html/index.html && echo "✅ index.html exists" || echo "❌ index.html missing"
docker exec frontend du -sh /usr/share/nginx/html/
docker exec frontend ls -la /usr/share/nginx/html/assets/ 2>/dev/null | wc -l | xargs echo "Assets files count:"

# 9. Test nginx config
echo ""
echo "🧪 Testing nginx config..."
docker exec frontend nginx -t

# 10. Reload nginx
echo ""
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Deployment complete!"
echo "🌐 Site should now be accessible at https://dev-swat.com"

