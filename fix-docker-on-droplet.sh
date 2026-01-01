#!/bin/bash
# Fix Docker Container - Run this ON THE DROPLET
# This script rebuilds the frontend Docker container correctly

set -e

echo "🔍 Diagnosing Docker container issues..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from frontend directory"
    echo "   Run: cd ~/frontend"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Check if container exists
echo "📋 Step 1: Checking container status..."
if docker ps -a | grep -q frontend; then
    echo "✅ Container 'frontend' exists"
    docker ps -a | grep frontend
    echo ""
    
    # Stop and remove old container
    echo "   Stopping and removing old container..."
    docker stop frontend 2>/dev/null || true
    docker rm frontend 2>/dev/null || true
    echo "✅ Old container removed"
else
    echo "⚠️  Container 'frontend' does not exist"
fi
echo ""

# Step 2: Check if dist exists
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "📋 Step 2: Building frontend..."
    export VITE_API_URL="/api"
    export VITE_FASTAPI_URL="/api"
    npm run build
    
    if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
        echo "❌ Build failed! dist directory is empty"
        exit 1
    fi
    echo "✅ Build complete"
else
    echo "✅ Build already exists"
fi
echo ""

# Step 3: Build Docker image
echo "📋 Step 3: Building Docker image..."
if [ ! -f "Dockerfile.prod" ]; then
    echo "❌ Dockerfile.prod not found!"
    exit 1
fi

docker build -f Dockerfile.prod -t frontend:latest \
    --build-arg VITE_API_URL="/api" \
    --build-arg VITE_FASTAPI_URL="/api" \
    .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker image built successfully"
echo ""

# Step 4: Run the container
echo "📋 Step 4: Starting container..."
docker run -d \
    --name frontend \
    -p 80:80 \
    -p 443:443 \
    --restart unless-stopped \
    frontend:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container!"
    exit 1
fi

# Wait for container to start
sleep 3

# Verify container is running
if docker ps | grep -q frontend; then
    echo "✅ Container is running"
else
    echo "❌ Container failed to start!"
    echo "   Checking logs..."
    docker logs frontend --tail 50
    exit 1
fi
echo ""

# Step 5: Verify nginx
echo "📋 Step 5: Verifying nginx..."
docker exec frontend nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    docker logs frontend --tail 20
    exit 1
fi
echo ""

# Step 6: Test container
echo "📋 Step 6: Testing container..."
docker exec frontend sh -c 'ls -la /usr/share/nginx/html/ | head -5'
if [ $? -eq 0 ]; then
    echo "✅ Container is accessible"
else
    echo "❌ Cannot access container!"
    exit 1
fi
echo ""

echo "✅✅✅ Container fixed and running! ✅✅✅"
echo ""
echo "🌐 Your site should be available at:"
echo "   http://dev-swat.com"
echo "   https://dev-swat.com (if SSL is configured)"
echo ""
echo "🔍 Verify with:"
echo "   docker ps | grep frontend"
echo "   docker exec frontend nginx -t"

