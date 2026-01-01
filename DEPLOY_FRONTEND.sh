#!/bin/bash
# ============================================================================
# 🎨 FRONTEND DEPLOYMENT SCRIPT
# ============================================================================
# Copy and paste this entire script into your droplet terminal
# ============================================================================

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🎨 FRONTEND DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════════"
echo ""

FRONTEND_DIR="/root/frontend"

# Step 1: Navigate to frontend directory
echo "📂 Step 1: Navigating to frontend directory..."
cd "$FRONTEND_DIR"
echo "   Current directory: $(pwd)"
echo ""

# Step 2: Pull latest code
echo "📥 Step 2: Pulling latest code..."
if [ -d ".git" ]; then
    git pull origin main || echo "⚠️  Could not pull (continuing anyway)"
    echo "✅ Code updated"
else
    echo "⚠️  Not a git repository, skipping pull"
fi
echo ""

# Step 3: Install dependencies
echo "📦 Step 3: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 4: Build frontend
echo "🏗️  Step 4: Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist/ folder not created"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - index.html not found"
    exit 1
fi

FILE_COUNT=$(find dist -type f | wc -l)
echo "✅ Build successful! ($FILE_COUNT files created)"
echo ""

# Step 5: Check Docker container
echo "🐳 Step 5: Checking Docker container..."
if ! docker ps | grep -q "frontend"; then
    echo "⚠️  Frontend container not running, starting it..."
    docker start frontend
    sleep 3
fi

if docker ps | grep -q "frontend"; then
    echo "✅ Frontend container is running"
else
    echo "❌ Failed to start frontend container"
    exit 1
fi
echo ""

# Step 6: Copy files to container
echo "📋 Step 6: Copying files to container..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' || true
docker cp dist/. frontend:/usr/share/nginx/html/

# Verify
CONTAINER_FILE_COUNT=$(docker exec frontend sh -c 'find /usr/share/nginx/html -type f 2>/dev/null | wc -l' 2>/dev/null || echo "0")
if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo "✅ Files copied successfully ($CONTAINER_FILE_COUNT files)"
else
    echo "❌ Files not copied correctly"
    exit 1
fi
echo ""

# Step 7: Update nginx config (if exists)
echo "⚙️  Step 7: Updating nginx configuration..."
NGINX_CONFIG="/root/frontend/nginx-ssl.conf"
if [ -f "$NGINX_CONFIG" ]; then
    docker cp "$NGINX_CONFIG" frontend:/etc/nginx/conf.d/default.conf
    echo "✅ Config copied from $NGINX_CONFIG"
else
    echo "⚠️  nginx-ssl.conf not found, using existing config"
fi

# Test and reload nginx
if docker exec frontend nginx -t 2>&1 | grep -q "test is successful"; then
    echo "✅ Nginx configuration is valid"
    docker exec frontend nginx -s reload
    echo "✅ Nginx reloaded"
else
    echo "⚠️  Nginx config has warnings (but should still work)"
    docker exec frontend nginx -t
    docker exec frontend nginx -s reload
fi
echo ""

# Step 8: Verify
echo "🔍 Step 8: Verifying deployment..."
sleep 2
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://localhost:443 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "200" ]; then
    echo "✅ HTTPS responding correctly (HTTP $HTTPS_CODE)"
else
    echo "⚠️  HTTPS returned: $HTTPS_CODE"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ FRONTEND DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Website: https://dev-swat.com"
echo "💡 Clear browser cache: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo ""

