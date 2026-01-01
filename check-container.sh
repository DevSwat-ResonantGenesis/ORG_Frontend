#!/bin/bash
# Quick container status check

echo "🔍 Checking Docker container status..."
echo ""

# Check if container exists
if docker ps -a | grep -q frontend; then
    echo "✅ Container 'frontend' exists"
    echo ""
    echo "Container details:"
    docker ps -a | grep frontend
    echo ""
    
    # Check if running
    if docker ps | grep -q frontend; then
        echo "✅ Container is RUNNING"
        echo ""
        echo "Testing container access..."
        if docker exec frontend sh -c 'echo "Container accessible"' 2>/dev/null; then
            echo "✅ Container is accessible"
        else
            echo "❌ Cannot access container (exec failed)"
            echo "   This might mean the container is using wrong base image"
        fi
        
        echo ""
        echo "Testing nginx..."
        if docker exec frontend nginx -t 2>/dev/null; then
            echo "✅ Nginx is available"
        else
            echo "❌ Nginx not found in container"
            echo "   Container might be using wrong Dockerfile"
        fi
        
        echo ""
        echo "Container image:"
        docker inspect frontend --format='{{.Config.Image}}' 2>/dev/null || echo "Could not inspect"
        
    else
        echo "⚠️  Container is NOT running"
        echo ""
        echo "Attempting to start..."
        docker start frontend
        sleep 2
        if docker ps | grep -q frontend; then
            echo "✅ Container started"
        else
            echo "❌ Failed to start container"
            echo "   Checking logs..."
            docker logs frontend --tail 20
        fi
    fi
else
    echo "❌ Container 'frontend' does NOT exist"
    echo ""
    echo "You need to create it. Options:"
    echo "  1. Run: bash fix-docker-container.sh"
    echo "  2. Or manually:"
    echo "     cd ~/frontend"
    echo "     docker build -f Dockerfile.prod -t frontend:latest ."
    echo "     docker run -d --name frontend -p 80:80 -p 443:443 --restart unless-stopped frontend:latest"
fi

echo ""
echo "📋 Quick fix commands:"
echo "  bash fix-docker-container.sh  # Rebuild and fix container"
echo "  docker ps -a | grep frontend  # Check all containers"
echo "  docker logs frontend          # View container logs"

