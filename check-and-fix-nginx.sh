#!/bin/bash
# Check and fix nginx for SPA routing and API proxy
# Run this ON YOUR DROPLET

cd /root/frontend

echo "🔍 Checking nginx configuration..."
echo ""

# Check nginx-spa.conf
if [ ! -f "nginx-spa.conf" ]; then
    echo "❌ nginx-spa.conf not found!"
    exit 1
fi

echo "📋 Current nginx-spa.conf:"
cat nginx-spa.conf
echo ""

# Check if API proxy is configured
if grep -q "location /api" nginx-spa.conf; then
    echo "✅ API proxy found in config"
else
    echo "⚠️  API proxy NOT found - need to add it"
fi

# Check if SPA fallback is configured
if grep -q "try_files" nginx-spa.conf; then
    echo "✅ SPA fallback (try_files) found"
else
    echo "⚠️  SPA fallback NOT found - need to add it"
fi

echo ""
echo "🔧 If nginx container exists, check its config:"
docker ps --format '{{.Names}}' | grep nginx | while read container; do
    echo "📋 Container: $container"
    echo "   Config location:"
    docker exec $container cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "   Could not read config"
done

