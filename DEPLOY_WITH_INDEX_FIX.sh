#!/bin/bash
# Deployment script that ensures index.html is present

set -e

echo "🔧 Starting deployment with index.html fix..."

cd /root/frontend

# 1. Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# 2. Build
echo "🏗️ Building application..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# 3. Check if index.html exists in dist
echo ""
echo "📋 Checking dist folder contents:"
ls -la dist/ | head -20

if [ ! -f "dist/index.html" ]; then
    echo ""
    echo "⚠️ WARNING: index.html not found in dist/ after build"
    echo "🔧 Copying index.html manually..."
    
    if [ -f "index.html" ]; then
        cp index.html dist/index.html
        echo "✅ Copied index.html to dist/"
    else
        echo "❌ ERROR: index.html not found in root either!"
        exit 1
    fi
else
    echo "✅ index.html found in dist/"
fi

# 4. Verify dist folder
echo ""
echo "📊 Dist folder contents:"
ls -la dist/
echo ""
du -sh dist/
echo ""
echo "📄 index.html size:"
ls -lh dist/index.html

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

# Verify index.html was copied
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html copied successfully"
    docker exec frontend ls -lh /usr/share/nginx/html/index.html
    docker exec frontend head -5 /usr/share/nginx/html/index.html
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

echo ""
echo "🌐 Site should now be accessible at https://dev-swat.com"

