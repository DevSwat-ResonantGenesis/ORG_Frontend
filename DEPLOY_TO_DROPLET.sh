#!/bin/bash

# Deploy Frontend to Droplet
# This script pulls latest code, builds, and deploys

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 DEPLOYING TO DROPLET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're on the server
if [ ! -d "/root/frontend" ]; then
    echo "❌ This script must be run on the server at /root/frontend"
    echo "   Or SSH to the server and run:"
    echo "   cd /root/frontend && git pull origin main && npm run build"
    exit 1
fi

cd /root/frontend

# Step 1: Pull latest code
echo "📥 Step 1: Pulling latest code from GitHub..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 2: Install dependencies (if needed)
echo "📦 Step 2: Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "   Installing dependencies..."
    npm install
fi
echo "✅ Dependencies ready"
echo ""

# Step 3: Build frontend
echo "🔨 Step 3: Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi
echo "✅ Build complete"
echo ""

# Step 4: Deploy using docker-compose (if available)
if [ -f "docker-compose.frontend.yml" ]; then
    echo "🐳 Step 4: Deploying with docker-compose..."
    docker-compose -f docker-compose.frontend.yml down 2>/dev/null || true
    docker-compose -f docker-compose.frontend.yml up -d
    echo "✅ Container restarted"
else
    echo "🔄 Step 4: Restarting frontend container..."
    # Try to restart the frontend container
    docker ps | grep -i frontend | awk '{print $1}' | xargs -r docker restart 2>/dev/null || {
        echo "⚠️  Could not find frontend container to restart"
        echo "   Files are in ./dist (should be mounted to container)"
    }
fi
echo ""

# Step 5: Verify deployment
echo "🧪 Step 5: Verifying deployment..."
sleep 3

if curl -s -k https://dev-swat.com > /dev/null; then
    echo "✅ Site is accessible at https://dev-swat.com"
else
    echo "⚠️  Site may not be accessible yet (check nginx/container status)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Check your site: https://dev-swat.com"
echo "💬 Check Resonant Chat: https://dev-swat.com/resonant-chat"
echo "🤖 Check Aivara AI button: https://dev-swat.com (hero section)"
echo ""

