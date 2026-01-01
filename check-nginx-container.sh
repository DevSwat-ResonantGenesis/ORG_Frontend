#!/bin/bash
# Check nginx container status
# Run this ON YOUR DROPLET

echo "🔍 Checking Nginx Container..."
echo ""

# Check if container exists
echo "📦 Container Status:"
docker ps -a | grep frontend-nginx || docker ps -a | grep nginx
echo ""

# Check container logs
echo "📋 Container Logs:"
docker logs frontend-nginx 2>&1 | tail -20
echo ""

# Check if port 80 is bound
echo "🔌 Port 80 Status:"
ss -tulpn | grep :80 || echo "❌ Nothing listening on port 80"
echo ""

# Check container ports
echo "🔌 Container Ports:"
docker port frontend-nginx 2>/dev/null || echo "❌ Container not running or no ports exposed"
echo ""

# Check if container is running
CONTAINER_ID=$(docker ps -a | grep frontend-nginx | awk '{print $1}' | head -1)
if [ ! -z "$CONTAINER_ID" ]; then
    echo "📊 Container Details:"
    docker inspect frontend-nginx --format '{{.State.Status}}' 2>/dev/null || echo "Container not found"
    echo ""
    
    # Try to start if stopped
    STATUS=$(docker inspect frontend-nginx --format '{{.State.Status}}' 2>/dev/null)
    if [ "$STATUS" = "exited" ] || [ "$STATUS" = "stopped" ]; then
        echo "🔄 Container is stopped. Starting..."
        docker start frontend-nginx
        sleep 2
        docker ps | grep frontend-nginx
    fi
fi

echo ""
echo "✅ Check complete!"

