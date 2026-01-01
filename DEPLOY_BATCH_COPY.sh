#!/bin/bash
# Deployment script that copies files in batches to avoid tar errors

set -e

echo "🔧 Starting deployment with batch copy..."

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

# 4. Copy files in batches using tar (more reliable)
echo ""
echo "📦 Copying files using tar (more reliable method)..."

# Method 1: Use tar to copy everything at once (more reliable than docker cp)
cd dist
tar -czf - . | docker exec -i frontend sh -c 'cd /usr/share/nginx/html && tar -xzf -'
cd ..

# 5. Verify files were copied
echo ""
echo "✅ Verifying copied files:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -20
docker exec frontend du -sh /usr/share/nginx/html/

# Verify index.html
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html copied successfully"
    docker exec frontend ls -lh /usr/share/nginx/html/index.html
else
    echo "❌ ERROR: index.html was NOT copied!"
    echo "🔧 Trying alternative copy method..."
    docker cp dist/index.html frontend:/usr/share/nginx/html/index.html
fi

# 6. Copy assets folder separately if needed
if [ -d "dist/assets" ]; then
    echo ""
    echo "📦 Copying assets folder..."
    docker exec frontend mkdir -p /usr/share/nginx/html/assets
    cd dist/assets
    tar -czf - . | docker exec -i frontend sh -c 'cd /usr/share/nginx/html/assets && tar -xzf -'
    cd ../..
fi

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

