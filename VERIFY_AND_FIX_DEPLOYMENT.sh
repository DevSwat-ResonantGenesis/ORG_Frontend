#!/bin/bash

# Verify Deployment and Force Update
# This ensures the latest files are actually being served

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFYING DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check what's in the container
echo "📋 Step 1: Checking files in container..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec frontend ls -lah /usr/share/nginx/html/ | head -10
echo ""

# Step 2: Check index.html timestamp
echo "📋 Step 2: Checking index.html timestamp..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec frontend stat /usr/share/nginx/html/index.html | grep Modify
echo ""

# Step 3: Check if CSS files are there
echo "📋 Step 3: Checking CSS files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec frontend find /usr/share/nginx/html/assets -name "*.css" -type f | head -5
echo ""

# Step 4: Check what's in dist locally
echo "📋 Step 4: Checking local dist folder..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd /root/frontend
if [ -d "dist" ]; then
    echo "dist/index.html timestamp:"
    stat dist/index.html | grep Modify
    echo ""
    echo "dist/assets CSS files:"
    find dist/assets -name "*.css" -type f | head -5
else
    echo "❌ dist folder not found - need to rebuild"
fi
echo ""

# Step 5: Force redeploy
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Step 5: Force redeploying..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clear container completely
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/* /usr/share/nginx/html/.*' 2>/dev/null || true

# Copy files again
docker cp dist/. frontend:/usr/share/nginx/html/

# Add cache-busting headers to nginx
docker exec frontend sh -c 'cat > /etc/nginx/conf.d/cache-bust.conf << EOF
# Disable all caching
add_header Cache-Control "no-cache, no-store, must-revalidate" always;
add_header Pragma "no-cache" always;
add_header Expires "0" always;
EOF' 2>/dev/null || true

# Test and reload nginx
docker exec frontend nginx -t && docker exec frontend nginx -s reload

echo ""
echo "✅ Force redeploy complete"
echo ""

# Step 6: Test
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Step 6: Testing..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -I https://dev-swat.com 2>&1 | head -15
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo "  1. Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "  2. Clear browser cache completely"
echo "  3. Try incognito/private mode"
echo "  4. Check on mobile device"
echo ""
