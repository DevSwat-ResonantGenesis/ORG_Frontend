#!/bin/bash
# Fix Docker Container Issues
# This script diagnoses and fixes the frontend Docker container

set -e

echo "🔍 Diagnosing Docker container issues..."
echo ""

# Check if container exists
echo "📋 Step 1: Checking container status..."
if docker ps -a | grep -q frontend; then
    echo "✅ Container 'frontend' exists"
    docker ps -a | grep frontend
else
    echo "❌ Container 'frontend' does not exist"
    echo "   Will create it in Step 3"
fi
echo ""

# Check if container is running
echo "📋 Step 2: Checking if container is running..."
if docker ps | grep -q frontend; then
    echo "✅ Container is running"
    CONTAINER_RUNNING=true
else
    echo "⚠️  Container is NOT running"
    CONTAINER_RUNNING=false
    
    # Try to start it
    if docker ps -a | grep -q frontend; then
        echo "   Attempting to start container..."
        docker start frontend
        sleep 2
        if docker ps | grep -q frontend; then
            echo "✅ Container started successfully"
            CONTAINER_RUNNING=true
        else
            echo "❌ Failed to start container. Will rebuild."
            CONTAINER_RUNNING=false
        fi
    fi
fi
echo ""

# Check container image and inspect
if docker ps -a | grep -q frontend; then
    echo "📋 Step 3: Inspecting container..."
    CONTAINER_IMAGE=$(docker inspect frontend --format='{{.Config.Image}}' 2>/dev/null || echo "unknown")
    echo "   Container image: $CONTAINER_IMAGE"
    
    # Check if it's the right image (should be nginx-based)
    if [[ "$CONTAINER_IMAGE" != *"nginx"* ]] && [[ "$CONTAINER_IMAGE" != *"frontend"* ]]; then
        echo "⚠️  Container might be using wrong image"
    fi
    echo ""
fi

# Step 4: Rebuild container if needed
echo "📋 Step 4: Ensuring container is properly set up..."
FRONTEND_DIR="$(pwd)"
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from frontend source directory"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Check if we need to rebuild
NEED_REBUILD=false
if [ "$CONTAINER_RUNNING" = false ]; then
    NEED_REBUILD=true
    echo "   Container not running, will rebuild"
fi

# Check if dist exists
if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ Error: dist directory is empty or doesn't exist"
    echo "   Please run: npm run build"
    exit 1
fi

# Stop and remove old container if it exists
if docker ps -a | grep -q frontend; then
    echo "   Stopping and removing old container..."
    docker stop frontend 2>/dev/null || true
    docker rm frontend 2>/dev/null || true
fi

# Build the Docker image
echo "📋 Step 5: Building Docker image..."
echo "   Using Dockerfile.prod..."
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

# Step 6: Run the container
echo "📋 Step 6: Starting container..."
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

# Step 7: Verify nginx is working
echo "📋 Step 7: Verifying nginx..."
docker exec frontend nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    docker logs frontend --tail 20
    exit 1
fi
echo ""

# Step 8: Test container accessibility
echo "📋 Step 8: Testing container..."
docker exec frontend sh -c 'ls -la /usr/share/nginx/html/ | head -5'
if [ $? -eq 0 ]; then
    echo "✅ Container is accessible and has files"
else
    echo "❌ Cannot access container!"
    exit 1
fi
echo ""

echo "✅✅✅ Container fixed and running! ✅✅✅"
echo ""
echo "📋 Summary:"
echo "   ✅ Container rebuilt with Dockerfile.prod"
echo "   ✅ Container is running"
echo "   ✅ Nginx is configured"
echo "   ✅ Files are accessible"
echo ""
echo "🌐 Your site should be available at:"
echo "   http://dev-swat.com"
echo "   https://dev-swat.com (if SSL is configured)"
echo ""
echo "🔍 Verify with:"
echo "   docker ps | grep frontend"
echo "   docker exec frontend nginx -t"
echo "   curl -I http://localhost"

