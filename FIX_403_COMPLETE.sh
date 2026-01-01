#!/bin/bash
# Complete Fix for 403 Forbidden Error

echo "🔧 Complete Fix for 403 Error..."

# 1. Check current file structure
echo "📁 Checking file structure:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -20

# 2. Check nginx user
echo ""
echo "👤 Checking nginx user:"
docker exec frontend id nginx

# 3. Fix ownership and permissions
echo ""
echo "🔐 Fixing ownership and permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
docker exec frontend chmod -R 755 /usr/share/nginx/html/
docker exec frontend find /usr/share/nginx/html/ -type f -exec chmod 644 {} \;
docker exec frontend find /usr/share/nginx/html/ -type d -exec chmod 755 {} \;

# 4. Check nginx config
echo ""
echo "📋 Checking nginx root directory:"
docker exec frontend grep -E "root|index" /etc/nginx/conf.d/default.conf | head -10

# 5. Check if index.html exists and is readable
echo ""
echo "📄 Verifying index.html:"
docker exec frontend test -f /usr/share/nginx/html/index.html && echo "✅ index.html exists" || echo "❌ index.html missing!"
docker exec frontend test -r /usr/share/nginx/html/index.html && echo "✅ index.html is readable" || echo "❌ index.html not readable!"

# 6. Check nginx error logs
echo ""
echo "📋 Recent nginx errors:"
docker exec frontend tail -20 /var/log/nginx/error.log

# 7. Test nginx config
echo ""
echo "🧪 Testing nginx configuration:"
docker exec frontend nginx -t

# 8. Reload nginx
echo ""
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Fix complete. Check https://dev-swat.com"

