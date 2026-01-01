#!/bin/bash
# Full Frontend Redeploy Script
# Run this on your droplet: bash FULL_REDEPLOY.sh

set -e

echo "🚀 Starting FULL frontend redeploy..."
echo ""

# Step 1: Navigate to frontend directory
echo "📁 Step 1: Navigating to frontend directory..."
cd ~/frontend || {
    echo "❌ ~/frontend directory not found!"
    exit 1
}
echo "✅ In directory: $(pwd)"
echo ""

# Step 2: Stash any local changes
echo "📦 Step 2: Stashing local changes..."
git stash || echo "⚠️  No changes to stash"
echo ""

# Step 3: Pull latest code
echo "📥 Step 3: Pulling latest code from GitHub..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 4: Clean install dependencies
echo "🧹 Step 4: Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install
echo "✅ Dependencies installed"
echo ""

# Step 5: Build frontend
echo "🔨 Step 5: Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Build failed! dist directory is empty"
    exit 1
fi

echo "✅ Build complete"
echo "   Build size: $(du -sh dist | cut -f1)"
echo ""

# Step 6: Update nginx config
echo "⚙️  Step 6: Updating nginx configuration..."
if [ -f "nginx-ssl.conf" ]; then
    docker cp nginx-ssl.conf frontend:/etc/nginx/conf.d/default.conf
    docker exec frontend nginx -t
    echo "✅ Nginx config updated"
else
    echo "⚠️  nginx-ssl.conf not found, using existing config"
fi
echo ""

# Step 7: Deploy to Docker container
echo "🐳 Step 7: Deploying to Docker container..."
echo "   Clearing old files..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'

echo "   Copying new build..."
docker cp dist/. frontend:/usr/share/nginx/html/

echo "   Verifying files..."
FILE_COUNT=$(docker exec frontend sh -c 'ls -1 /usr/share/nginx/html/ | wc -l')
echo "   Files in container: $FILE_COUNT"

if [ "$FILE_COUNT" -eq "0" ]; then
    echo "❌ No files copied! Deployment failed"
    exit 1
fi

echo "✅ Files deployed"
echo ""

# Step 8: Restart container
echo "🔄 Step 8: Restarting Docker container..."
docker restart frontend

# Wait for container to start
echo "   Waiting for container to start..."
sleep 3

# Check if container is running
if docker ps | grep -q frontend; then
    echo "✅ Container is running"
else
    echo "❌ Container failed to start!"
    docker ps -a | grep frontend
    exit 1
fi
echo ""

# Step 9: Test nginx
echo "🧪 Step 9: Testing nginx configuration..."
docker exec frontend nginx -t
echo "✅ Nginx config is valid"
echo ""

# Step 10: Final verification
echo "✅✅✅ FULL REDEPLOY COMPLETE! ✅✅✅"
echo ""
echo "📋 Summary:"
echo "   ✅ Code pulled from GitHub"
echo "   ✅ Dependencies reinstalled"
echo "   ✅ Frontend built"
echo "   ✅ Files deployed to container"
echo "   ✅ Nginx config updated"
echo "   ✅ Container restarted"
echo ""
echo "🌐 Your site: https://dev-swat.com"
echo "💡 IMPORTANT: Clear browser cache!"
echo "   Windows: Ctrl+Shift+R"
echo "   Mac: Cmd+Shift+R"
echo ""
echo "🔍 Verify deployment:"
echo "   docker exec frontend ls -la /usr/share/nginx/html/ | head -10"
echo "   curl -I https://dev-swat.com"

