#!/bin/bash
# Fix frontend connection issues on droplet
# Run this ON YOUR DROPLET

set -e

echo "🔧 Fixing Frontend Connection Issues..."
echo ""

# Check what's using port 80
echo "🔍 Checking what's using port 80..."
if command -v lsof &> /dev/null; then
    lsof -i :80 || echo "Nothing found with lsof"
elif command -v ss &> /dev/null; then
    ss -tulpn | grep :80 || echo "Nothing found with ss"
else
    echo "⚠️  Need to install net-tools: apt install net-tools"
fi
echo ""

# Check docker-compose.yml for frontend
echo "📋 Checking docker-compose.yml for frontend service..."
cd /root/ResonantGraphAIV0.1
if grep -q "frontend:" docker-compose.yml; then
    echo "✅ Frontend service found in docker-compose.yml"
    echo ""
    echo "🚀 Starting frontend service..."
    docker compose up -d frontend
    sleep 2
    docker compose ps frontend
else
    echo "❌ Frontend service NOT found in docker-compose.yml"
    echo ""
    echo "📋 Available services:"
    docker compose config --services
    echo ""
    echo "⚠️  Frontend might need to be added to docker-compose.yml"
    echo "   OR nginx needs to be configured to serve /root/frontend/dist"
fi
echo ""

# Check if nginx container exists
echo "🔍 Checking for nginx container..."
if docker ps -a | grep -qi nginx; then
    echo "✅ Nginx container found"
    docker ps -a | grep -i nginx
    echo ""
    echo "🚀 Starting nginx container..."
    docker start $(docker ps -a | grep -i nginx | awk '{print $1}')
else
    echo "❌ No nginx container found"
fi
echo ""

# Check system nginx
echo "🔍 Checking system nginx..."
if systemctl list-units | grep -q nginx; then
    echo "⚠️  System nginx is failing (port conflict)"
    echo "   Need to either:"
    echo "   1. Stop whatever is using port 80"
    echo "   2. Or use docker nginx instead"
fi
echo ""

# Final status
echo "📊 Final Status:"
docker compose ps
echo ""
echo "🔍 Check port 80:"
if command -v ss &> /dev/null; then
    ss -tulpn | grep :80
fi

