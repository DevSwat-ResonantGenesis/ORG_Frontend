#!/bin/bash
# Check nginx container configuration
# Run this ON YOUR DROPLET

echo "🔍 Checking nginx container configuration..."
echo ""

# Check container details
echo "📋 Container info:"
docker inspect frontend-nginx | grep -A 20 "Mounts\|Config"

echo ""
echo "📋 Current nginx config inside container:"
docker exec frontend-nginx cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "❌ Could not read config"

echo ""
echo "📋 Checking if nginx-spa.conf is mounted:"
docker exec frontend-nginx ls -la /etc/nginx/conf.d/ 2>/dev/null || echo "❌ Could not list config directory"

echo ""
echo "📋 Checking local nginx-spa.conf:"
if [ -f "/root/frontend/nginx-spa.conf" ]; then
    echo "✅ Found at /root/frontend/nginx-spa.conf"
    echo "📋 First 20 lines:"
    head -20 /root/frontend/nginx-spa.conf
else
    echo "❌ Not found at /root/frontend/nginx-spa.conf"
fi

echo ""
echo "💡 If config is not mounted, you need to:"
echo "   1. Check how the container was started"
echo "   2. Restart it with proper volume mounts"
echo "   3. Or copy config into container manually"

