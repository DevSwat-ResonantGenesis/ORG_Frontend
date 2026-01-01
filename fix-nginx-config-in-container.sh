#!/bin/bash
# Fix nginx config in running container
# Run this ON YOUR DROPLET

cd /root/frontend

echo "🔧 Copying updated nginx-spa.conf into container..."
docker cp nginx-spa.conf frontend-nginx:/etc/nginx/conf.d/default.conf

echo ""
echo "✅ Config copied"
echo ""

echo "🔍 Testing nginx config..."
docker exec frontend-nginx nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Config is valid!"
    echo ""
    echo "🔄 Reloading nginx..."
    docker exec frontend-nginx nginx -s reload
    echo ""
    echo "✅ Nginx reloaded!"
    echo ""
    echo "🧪 Testing now..."
    echo ""
    echo "API test:"
    curl -s http://dev-swat.com/api/health | head -5
    echo ""
    echo "SPA route test:"
    curl -s http://dev-swat.com/resonant-chat | head -5
else
    echo ""
    echo "❌ Config has errors! Check the output above"
fi

