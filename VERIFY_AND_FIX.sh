#!/bin/bash
# Verify files and fix 403 error

echo "🔍 Verifying deployment..."

# 1. Check if files exist
echo "📁 Files in /usr/share/nginx/html/:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -30

# 2. Check if index.html exists
echo ""
echo "📄 Checking index.html:"
if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo "✅ index.html exists"
    docker exec frontend ls -lh /usr/share/nginx/html/index.html
    docker exec frontend head -5 /usr/share/nginx/html/index.html
else
    echo "❌ index.html is MISSING!"
    echo "🔧 Rebuilding and deploying..."
    cd /root/frontend
    export VITE_API_URL="/api"
    export VITE_FASTAPI_URL="/api"
    npm run build
    docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
    docker cp dist/. frontend:/usr/share/nginx/html/
    docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
    docker exec frontend chmod -R 755 /usr/share/nginx/html/
    docker exec frontend find /usr/share/nginx/html/ -type f -exec chmod 644 {} \;
    docker exec frontend find /usr/share/nginx/html/ -type d -exec chmod 755 {} \;
fi

# 3. Check permissions
echo ""
echo "🔐 Checking permissions:"
docker exec frontend stat /usr/share/nginx/html/index.html | grep -E "Access|Uid|Gid"

# 4. Check nginx user
echo ""
echo "👤 Nginx user info:"
docker exec frontend id nginx

# 5. Test if nginx can read the file
echo ""
echo "🧪 Testing if nginx can read index.html:"
docker exec frontend runuser -u nginx -- test -r /usr/share/nginx/html/index.html && echo "✅ Nginx can read index.html" || echo "❌ Nginx CANNOT read index.html"

# 6. Check nginx error logs
echo ""
echo "📋 Recent nginx errors:"
docker exec frontend tail -20 /var/log/nginx/error.log

# 7. Reload nginx
echo ""
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Verification complete!"

