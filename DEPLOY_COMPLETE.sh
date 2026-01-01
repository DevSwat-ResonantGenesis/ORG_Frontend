#!/bin/bash
# Complete deployment script that handles missing index.html

set -e

echo "🔧 Starting complete deployment..."

cd /root/frontend

# 1. Check current dist folder
echo "📁 Checking dist folder:"
if [ -d "dist" ]; then
    echo "✅ dist folder exists"
    ls -la dist/ | head -20
    echo ""
    echo "📊 Dist folder size:"
    du -sh dist/
else
    echo "❌ dist folder not found - building..."
fi

# 2. Build
echo "🏗️ Building application..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# 3. Verify build output
echo ""
echo "📊 Build output:"
ls -la dist/
echo ""
du -sh dist/

# 4. Check for index.html
if [ ! -f "dist/index.html" ]; then
    echo "⚠️ WARNING: index.html not found in dist/"
    echo "📋 Files in dist/:"
    ls -la dist/
    
    # Check if there's an index.html somewhere else
    echo ""
    echo "🔍 Searching for index.html..."
    find dist/ -name "index.html" -type f 2>/dev/null || echo "No index.html found anywhere"
    
    # This is a critical error - we need index.html
    echo ""
    echo "❌ ERROR: index.html is required but not found!"
    echo "🔍 Checking if build completed successfully..."
    exit 1
fi

echo "✅ index.html found: $(du -h dist/index.html | cut -f1)"

# 5. Clear nginx directory
echo ""
echo "🧹 Clearing nginx html directory..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'

# 6. Copy ALL files from dist
echo ""
echo "📦 Copying all files from dist to nginx..."
docker cp dist/. frontend:/usr/share/nginx/html/

# 7. Verify files were copied
echo ""
echo "✅ Verifying copied files:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -20
docker exec frontend du -sh /usr/share/nginx/html/

# Check if index.html was copied
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html copied successfully"
    docker exec frontend ls -lh /usr/share/nginx/html/index.html
else
    echo "❌ ERROR: index.html was NOT copied!"
    exit 1
fi

# 8. Fix permissions
echo ""
echo "🔐 Fixing permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
docker exec frontend chmod -R 755 /usr/share/nginx/html/
docker exec frontend find /usr/share/nginx/html/ -type f -exec chmod 644 {} \;
docker exec frontend find /usr/share/nginx/html/ -type d -exec chmod 755 {} \;

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
echo "📊 Final verification:"
docker exec frontend du -sh /usr/share/nginx/html/
docker exec frontend ls -lh /usr/share/nginx/html/index.html

