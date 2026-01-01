#!/bin/bash
# Fix missing dist folder and deploy frontend
# Run this on your droplet

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🔧 FIXING MISSING DIST FOLDER & DEPLOYING"
echo "═══════════════════════════════════════════════════════════════"
echo ""

FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1-"

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
    echo "Available directories:"
    ls -la /root/ | grep "^d"
    exit 1
fi

echo "📂 Step 1: Navigating to frontend directory..."
cd "$FRONTEND_DIR"
echo "   Current directory: $(pwd)"
echo ""

echo "📥 Step 2: Pulling latest code (if git repo)..."
if [ -d ".git" ]; then
    git pull origin main || echo "⚠️  Could not pull (continuing anyway)"
else
    echo "⚠️  Not a git repository"
fi
echo ""

echo "📦 Step 3: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing npm packages..."
    npm install
else
    echo "   node_modules exists, running npm install to update..."
    npm install
fi
echo ""

echo "🏗️  Step 4: Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist/ folder not created"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - index.html not found in dist/"
    exit 1
fi

echo "✅ Build successful!"
echo "   Files in dist/: $(find dist -type f | wc -l)"
echo ""

echo "📋 Step 5: Copying files to container..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' || true
docker cp dist/. frontend:/usr/share/nginx/html/

# Verify
FILE_COUNT=$(docker exec frontend sh -c 'find /usr/share/nginx/html -type f 2>/dev/null | wc -l' 2>/dev/null || echo "0")
echo "   Files copied: $FILE_COUNT"

if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html copied successfully"
else
    echo "❌ index.html not found in container"
    exit 1
fi
echo ""

echo "⚙️  Step 6: Fixing nginx deprecation warning..."
# Update nginx config to use new http2 directive
NGINX_CONFIG="/root/frontend/nginx-ssl.conf"
if [ -f "$NGINX_CONFIG" ]; then
    # Fix the http2 deprecation warning
    sed -i 's/listen 443 ssl http2;/listen 443 ssl;\n    http2 on;/' "$NGINX_CONFIG" || true
    docker cp "$NGINX_CONFIG" frontend:/etc/nginx/conf.d/default.conf
    echo "   Config updated and copied"
else
    echo "⚠️  nginx-ssl.conf not found, skipping config update"
fi

# Test and reload nginx
if docker exec frontend nginx -t; then
    echo "✅ Nginx config is valid"
    docker exec frontend nginx -s reload
    echo "✅ Nginx reloaded"
else
    echo "❌ Nginx config has errors"
    docker exec frontend nginx -t
    exit 1
fi
echo ""

echo "🔍 Step 7: Verifying deployment..."
sleep 2

HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://localhost:443 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "200" ]; then
    echo "✅ HTTPS (port 443) responding correctly"
else
    echo "⚠️  HTTPS (port 443) returned: $HTTPS_CODE"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Your website should now be available at:"
echo "   https://dev-swat.com"
echo ""
echo "💡 If the website doesn't load:"
echo "   1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   2. Wait 1-2 minutes for DNS/propagation"
echo "   3. Check: docker logs frontend"
echo ""

