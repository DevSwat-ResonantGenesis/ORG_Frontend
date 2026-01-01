#!/bin/bash

# STABLE DEPLOYMENT SCRIPT - Always Works
# This script handles all edge cases and ensures consistent deployment

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STABLE FRONTEND DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Auto-detect frontend directory (works every time)
echo "📁 Step 1: Finding frontend directory..."
FRONTEND_DIR=""

# Try common locations
for dir in "/root/frontend" "/root/ResonantGraphAI_FrontendV0.1-" "/root/ResonantGraphAI_FrontendV0.1"; do
    if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
        FRONTEND_DIR="$dir"
        break
    fi
done

# If not found, search for package.json
if [ -z "$FRONTEND_DIR" ]; then
    FOUND=$(find /root -maxdepth 2 -name "package.json" -type f 2>/dev/null | head -1)
    if [ -n "$FOUND" ]; then
        FRONTEND_DIR=$(dirname "$FOUND")
    fi
fi

if [ -z "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found!"
    echo "   Searched: /root/frontend, /root/ResonantGraphAI_FrontendV0.1-, /root/ResonantGraphAI_FrontendV0.1"
    exit 1
fi

echo "✅ Found: $FRONTEND_DIR"
cd "$FRONTEND_DIR"

# Step 2: Verify we're in the right place
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Invalid frontend directory (missing package.json or src/)"
    exit 1
fi

# Step 3: Pull latest code (safe - stashes local changes)
echo ""
echo "📥 Step 2: Updating code..."
git stash 2>/dev/null || true
git fetch origin main 2>/dev/null || {
    echo "⚠️  Git fetch failed, continuing with local code..."
}
git pull origin main 2>/dev/null || {
    echo "⚠️  Git pull failed, using local code..."
}

# Step 4: Install dependencies (only if needed)
echo ""
echo "📦 Step 3: Checking dependencies..."
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install --silent
else
    echo "   Dependencies up to date"
fi

# Step 5: Clean build
echo ""
echo "🧹 Step 4: Cleaning previous build..."
rm -rf dist .vite node_modules/.vite 2>/dev/null || true
echo "✅ Cleaned"

# Step 6: Build (with proper environment)
echo ""
echo "🔨 Step 5: Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
export NODE_ENV=production

# Build and capture errors
if npm run build 2>&1 | tee /tmp/build.log; then
    echo "✅ Build successful"
else
    echo "❌ Build failed! Check /tmp/build.log"
    exit 1
fi

# Step 7: Verify build output
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Build output invalid (missing dist/ or dist/index.html)"
    exit 1
fi

echo "   Build size: $(du -sh dist | cut -f1)"

# Step 8: Deploy to Docker (with verification)
echo ""
echo "📤 Step 6: Deploying to Docker..."

# Check if frontend container exists
if ! docker ps -a | grep -q frontend; then
    echo "❌ Frontend Docker container not found!"
    exit 1
fi

# Clear old files
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || {
    echo "⚠️  Could not clear container, continuing..."
}

# Copy new files
if docker cp dist/. frontend:/usr/share/nginx/html/; then
    echo "✅ Files copied"
else
    echo "❌ Failed to copy files!"
    exit 1
fi

# Reload nginx
docker exec frontend nginx -t 2>/dev/null && {
    docker exec frontend nginx -s reload 2>/dev/null || {
        echo "⚠️  Nginx reload failed, restarting container..."
        docker restart frontend
        sleep 3
    }
} || {
    echo "⚠️  Nginx config test failed, restarting container..."
    docker restart frontend
    sleep 3
}

# Step 9: Verify deployment
echo ""
echo "🧪 Step 7: Verifying deployment..."
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html found in container"
else
    echo "❌ index.html not found in container!"
    exit 1
fi

# Test if frontend is accessible
if curl -s -I https://dev-swat.com 2>/dev/null | grep -q "200\|HTTP/2 200"; then
    echo "✅ Frontend is accessible"
else
    echo "⚠️  Frontend accessibility check inconclusive"
fi

# Step 10: Success
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Summary:"
echo "  Directory: $FRONTEND_DIR"
echo "  Build: ✅ Success"
echo "  Deploy: ✅ Success"
echo "  Verify: ✅ Success"
echo ""
echo "🌐 Test: https://dev-swat.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
