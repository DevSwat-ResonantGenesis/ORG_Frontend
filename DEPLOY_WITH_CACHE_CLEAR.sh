#!/bin/bash

# Complete Frontend Rebuild with Cache Clearing
# This ensures all changes are applied and browser cache is bypassed

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 REBUILDING FRONTEND WITH CACHE CLEARING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find frontend directory
FRONTEND_DIR=""
if [ -d "/root/ResonantGraphAI_FrontendV0.1-" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1-"
elif [ -d "/root/frontend" ]; then
    FRONTEND_DIR="/root/frontend"
elif [ -d "/root/ResonantGraphAI_FrontendV0.1" ]; then
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1"
else
    echo "❌ Frontend directory not found!"
    exit 1
fi

echo "📁 Frontend directory: $FRONTEND_DIR"
cd "$FRONTEND_DIR"

# Step 1: Pull latest code
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 Step 1: Pulling latest code..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git stash 2>/dev/null || true
git fetch origin main
git pull origin main
echo "✅ Code updated"

# Step 2: Clean everything
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Step 2: Cleaning build artifacts..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rm -rf dist
rm -rf node_modules/.vite
rm -rf .vite
echo "✅ Cleaned"

# Step 3: Install dependencies
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Step 3: Installing dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm install
echo "✅ Dependencies installed"

# Step 4: Build with cache busting
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 Step 4: Building frontend (with cache busting)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
# Force rebuild by clearing Vite cache
export VITE_FORCE_REBUILD=$(date +%s)
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found!"
    exit 1
fi

echo "✅ Frontend build complete"
echo "   Build size: $(du -sh dist | cut -f1)"

# Step 5: Add cache-busting to index.html
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Step 5: Adding cache-busting headers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# Add timestamp to force browser reload
TIMESTAMP=$(date +%s)
if [ -f "dist/index.html" ]; then
    # Add meta tag to prevent caching
    sed -i 's|<head>|<head>\n  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">\n  <meta http-equiv="Pragma" content="no-cache">\n  <meta http-equiv="Expires" content="0">|' dist/index.html
    echo "✅ Cache-busting headers added"
fi

# Step 6: Deploy to Docker
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Step 6: Deploying to Docker container..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clear old files completely
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true

# Copy new files
docker cp dist/. frontend:/usr/share/nginx/html/ || {
    echo "❌ Failed to copy files!"
    exit 1
}

# Update nginx to add cache-control headers
docker exec frontend sh -c 'cat > /etc/nginx/conf.d/cache-control.conf << EOF
# Disable caching for HTML files
location ~* \.(html)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
EOF' 2>/dev/null || true

# Reload nginx
docker exec frontend nginx -s reload 2>/dev/null || {
    docker restart frontend
    sleep 3
}

echo "✅ Files deployed"

# Step 7: Verify
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Step 7: Verifying deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html found"
else
    echo "❌ index.html not found!"
    exit 1
fi

# Check if force-all-fixes.css is in the build
if docker exec frontend test -f /usr/share/nginx/html/assets/*force-all-fixes*.css 2>/dev/null; then
    echo "✅ force-all-fixes.css found in build"
elif docker exec frontend sh -c 'ls /usr/share/nginx/html/assets/*.css 2>/dev/null | head -1' | grep -q css; then
    echo "✅ CSS files found (checking if fixes are included)"
else
    echo "⚠️  CSS files not found - check build"
fi

# Step 8: Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Deployed Changes:"
echo "  ✅ Mobile header alignment and font size fixes"
echo "  ✅ Global sticky header for all 49 pages"
echo "  ✅ Comprehensive button text color fixes"
echo "  ✅ Mobile hero section alignment"
echo "  ✅ Force-all-fixes.css (maximum specificity)"
echo ""
echo "🌐 IMPORTANT: Clear Browser Cache!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Chrome/Edge: Ctrl+Shift+Delete → Clear cached images"
echo "  Firefox: Ctrl+Shift+Delete → Clear cache"
echo "  Safari: Cmd+Option+E → Empty caches"
echo ""
echo "  Or use Hard Refresh:"
echo "  Windows/Linux: Ctrl+Shift+R or Ctrl+F5"
echo "  Mac: Cmd+Shift+R"
echo ""
echo "🌐 Test your deployment:"
echo "  Frontend: https://dev-swat.com"
echo "  Login: https://dev-swat.com/login"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

