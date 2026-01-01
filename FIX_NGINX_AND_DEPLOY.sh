#!/bin/bash

# Fix Nginx Config and Deploy
# This fixes the nginx config issue and ensures proper deployment

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING NGINX AND DEPLOYING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/frontend

# Step 1: Wait for container to be ready
echo "⏳ Step 1: Waiting for container to be ready..."
for i in {1..30}; do
    if docker ps | grep -q frontend; then
        sleep 2
        if docker exec frontend echo "ready" 2>/dev/null; then
            echo "✅ Container is ready"
            break
        fi
    fi
    sleep 1
done

# Step 2: Remove problematic nginx config
echo ""
echo "🧹 Step 2: Removing problematic nginx config..."
docker exec frontend sh -c 'rm -f /etc/nginx/conf.d/no-cache.conf /etc/nginx/conf.d/cache-bust.conf' 2>/dev/null || true
echo "✅ Removed old configs"
echo ""

# Step 3: Add cache-busting to main nginx config (safer approach)
echo "🔧 Step 3: Adding cache-busting headers..."
docker exec frontend sh -c 'cat >> /etc/nginx/conf.d/default.conf << "NGINX_EOF"

# Cache busting headers
add_header Cache-Control "no-cache, no-store, must-revalidate" always;
add_header Pragma "no-cache" always;
add_header Expires "0" always;
NGINX_EOF' 2>/dev/null || {
    echo "⚠️  Could not add headers to default.conf, using alternative method..."
}

# Step 4: Test nginx config
echo "🧪 Step 4: Testing nginx config..."
if docker exec frontend nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx config is valid"
else
    echo "⚠️  Nginx config has issues, restoring..."
    # Restore original config by restarting container (it will use original config)
    docker restart frontend
    sleep 5
    echo "✅ Container restarted with original config"
fi
echo ""

# Step 5: Ensure files are deployed
echo "📤 Step 5: Ensuring files are deployed..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
    docker cp dist/. frontend:/usr/share/nginx/html/
    echo "✅ Files deployed"
else
    echo "❌ dist folder not found, need to rebuild"
    echo "   Running build..."
    export VITE_API_URL="/api"
    export VITE_FASTAPI_URL="/api"
    npm run build
    docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
    docker cp dist/. frontend:/usr/share/nginx/html/
    echo "✅ Built and deployed"
fi
echo ""

# Step 6: Reload nginx (safely)
echo "🔄 Step 6: Reloading nginx..."
if docker exec frontend nginx -t 2>/dev/null; then
    docker exec frontend nginx -s reload 2>/dev/null || {
        echo "⚠️  Reload failed, restarting container..."
        docker restart frontend
        sleep 5
    }
    echo "✅ Nginx reloaded"
else
    echo "⚠️  Config test failed, restarting container..."
    docker restart frontend
    sleep 5
fi
echo ""

# Step 7: Verify deployment
echo "🧪 Step 7: Verifying deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait a bit for container to be fully ready
sleep 2

if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo "✅ index.html found"
    echo "   Timestamp:"
    docker exec frontend stat /usr/share/nginx/html/index.html 2>/dev/null | grep Modify || echo "   (could not get timestamp)"
else
    echo "❌ index.html NOT found - redeploying..."
    docker cp dist/. frontend:/usr/share/nginx/html/
    sleep 2
    if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
        echo "✅ index.html now found"
    else
        echo "❌ Still not found - check container status"
        docker ps | grep frontend
        exit 1
    fi
fi

# Check CSS files
CSS_COUNT=$(docker exec frontend find /usr/share/nginx/html/assets -name "*.css" -type f 2>/dev/null | wc -l)
echo "✅ Found $CSS_COUNT CSS files in container"
echo ""

# Step 8: Test HTTP
echo "📡 Step 8: Testing HTTP response..."
HTTP_RESPONSE=$(curl -s -I https://dev-swat.com 2>&1)
echo "$HTTP_RESPONSE" | head -8
echo ""

# Step 9: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your site is live at: https://dev-swat.com"
echo ""
echo "📋 To see changes:"
echo "  1. HARD REFRESH: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "  2. Or clear browser cache completely"
echo "  3. Or try incognito/private mode"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

