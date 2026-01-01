#!/bin/bash
# Quick Fix for 403 Forbidden - Run on server

echo "🔧 Quick Fix for 403 Error..."

# Fix file permissions
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
docker exec frontend chmod -R 755 /usr/share/nginx/html/

# Check if index.html exists
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html exists"
else
    echo "❌ index.html is missing! Rebuilding..."
    cd /root/frontend
    export VITE_API_URL="/api"
    export VITE_FASTAPI_URL="/api"
    npm run build
    docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
    docker cp dist/. frontend:/usr/share/nginx/html/
    docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
    docker exec frontend chmod -R 755 /usr/share/nginx/html/
fi

# Reload nginx
docker exec frontend nginx -s reload

echo "✅ Fix applied. Check https://dev-swat.com"

