#!/bin/bash
# Fix nginx configuration on droplet
# Run this ON YOUR DROPLET

echo "🔍 Checking nginx configuration..."
echo ""

# Check if frontend is built
echo "📁 Checking frontend build:"
if [ -d "/root/frontend/dist" ]; then
    echo "✅ Frontend dist folder exists"
    ls -la /root/frontend/dist | head -5
else
    echo "❌ Frontend dist folder NOT found!"
    echo "   Need to build frontend first"
    exit 1
fi

# Check nginx config
echo ""
echo "📋 Checking nginx config:"
if [ -f "/root/frontend/nginx-spa.conf" ]; then
    echo "✅ nginx-spa.conf exists"
    echo ""
    echo "📋 Current nginx-spa.conf content:"
    cat /root/frontend/nginx-spa.conf
else
    echo "❌ nginx-spa.conf NOT found!"
    exit 1
fi

# Check if nginx container is running
echo ""
echo "🐳 Checking nginx container:"
docker ps | grep nginx || echo "❌ No nginx container running"

# Check how nginx is running (standalone or docker-compose)
echo ""
echo "🔍 Checking nginx setup:"
if docker ps --format '{{.Names}}' | grep -q nginx; then
    NGINX_CONTAINER=$(docker ps --format '{{.Names}}' | grep nginx | head -1)
    echo "✅ Found nginx container: $NGINX_CONTAINER"
    echo ""
    echo "📋 Container details:"
    docker inspect $NGINX_CONTAINER | grep -A 10 "Mounts\|Config"
else
    echo "⚠️  No nginx container found"
    echo "   Frontend might be served differently"
fi

echo ""
echo "💡 Next steps:"
echo "   1. Make sure nginx container is using nginx-spa.conf"
echo "   2. Check nginx container volumes are mounted correctly"
echo "   3. Restart nginx container if needed"

