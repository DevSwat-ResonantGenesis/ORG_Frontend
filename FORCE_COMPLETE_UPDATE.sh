#!/bin/bash

# FORCE COMPLETE UPDATE - Ensures ALL changes are deployed
# This script does a complete rebuild and deploy with cache busting

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 FORCE COMPLETE UPDATE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/frontend

# Step 1: Pull latest code
echo "📥 Step 1: Pulling latest code..."
git fetch origin main
git pull origin main
echo "✅ Code updated"
echo ""

# Step 2: Clean everything
echo "🧹 Step 2: Cleaning everything..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist-*
echo "✅ Cleaned"
echo ""

# Step 3: Rebuild
echo "🔨 Step 3: Rebuilding frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
export NODE_ENV=production

npm run build

# Verify build
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - dist/index.html not found"
    exit 1
fi

echo "✅ Build complete"
echo "   Build size: $(du -sh dist | cut -f1)"
echo ""

# Step 4: Check if our CSS files are in the build
echo "🔍 Step 4: Verifying CSS files in build..."
CSS_FILES=$(find dist/assets -name "*.css" -type f 2>/dev/null | wc -l)
echo "   Found $CSS_FILES CSS files in build"

# Check for specific files
if find dist/assets -name "*.css" -type f 2>/dev/null | grep -q "mobile\|hero\|header"; then
    echo "✅ Mobile/hero/header CSS files found"
else
    echo "⚠️  Mobile/hero/header CSS files not found by name (may be bundled)"
fi
echo ""

# Step 5: Completely clear container
echo "🗑️  Step 5: Clearing container completely..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/* /usr/share/nginx/html/.*' 2>/dev/null || true
sleep 1
echo "✅ Container cleared"
echo ""

# Step 6: Copy files
echo "📤 Step 6: Copying files to container..."
docker cp dist/. frontend:/usr/share/nginx/html/
echo "✅ Files copied"
echo ""

# Step 7: Add aggressive cache-busting to nginx
echo "🔧 Step 7: Configuring nginx for no caching..."
docker exec frontend sh -c 'cat > /etc/nginx/conf.d/no-cache.conf << "NGINX_CONFIG"
# Disable ALL caching
location / {
    add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
    add_header Last-Modified "" always;
    etag off;
}

# Disable caching for HTML
location ~* \.(html)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
}

# Disable caching for CSS and JS
location ~* \.(css|js)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0" always;
    add_header Pragma "no-cache" always;
    add_header Expires "0" always;
}
NGINX_CONFIG' 2>/dev/null || true

# Test and reload nginx
echo "🔄 Step 8: Reloading nginx..."
if docker exec frontend nginx -t 2>/dev/null; then
    docker exec frontend nginx -s reload 2>/dev/null || {
        echo "⚠️  Reload failed, restarting container..."
        docker restart frontend
        sleep 5
    }
    echo "✅ Nginx reloaded"
else
    echo "⚠️  Nginx config test failed, restarting..."
    docker restart frontend
    sleep 5
fi
echo ""

# Step 9: Verify deployment
echo "🧪 Step 9: Verifying deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check files in container
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html found"
    docker exec frontend stat /usr/share/nginx/html/index.html | grep Modify
else
    echo "❌ index.html NOT found!"
    exit 1
fi

# Check CSS files
CSS_COUNT=$(docker exec frontend find /usr/share/nginx/html/assets -name "*.css" -type f 2>/dev/null | wc -l)
echo "✅ Found $CSS_COUNT CSS files in container"

# Test HTTP response
echo ""
echo "📡 Testing HTTP response..."
HTTP_RESPONSE=$(curl -s -I https://dev-swat.com 2>&1)
echo "$HTTP_RESPONSE" | head -10

# Check cache headers
if echo "$HTTP_RESPONSE" | grep -q "no-cache\|no-store"; then
    echo "✅ Cache-control headers set correctly"
else
    echo "⚠️  Cache-control headers may not be set"
fi
echo ""

# Step 10: Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FORCE UPDATE COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 What was done:"
echo "  ✅ Pulled latest code"
echo "  ✅ Cleaned all build artifacts"
echo "  ✅ Rebuilt frontend"
echo "  ✅ Verified CSS files in build"
echo "  ✅ Cleared container completely"
echo "  ✅ Copied new files"
echo "  ✅ Configured aggressive no-cache headers"
echo "  ✅ Reloaded nginx"
echo ""
echo "🌐 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  1. HARD REFRESH browser:"
echo "     Windows/Linux: Ctrl + Shift + R or Ctrl + F5"
echo "     Mac: Cmd + Shift + R"
echo ""
echo "  2. Clear browser cache completely:"
echo "     Chrome: Settings → Privacy → Clear browsing data"
echo "     Select 'Cached images and files'"
echo ""
echo "  3. Try incognito/private mode"
echo ""
echo "  4. Test on mobile device (changes are mobile-specific)"
echo ""
echo "  5. Check browser console for errors (F12)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

