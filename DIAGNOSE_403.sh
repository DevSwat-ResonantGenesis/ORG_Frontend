#!/bin/bash
# Comprehensive 403 diagnosis

echo "🔍 Diagnosing 403 Forbidden Error..."

# 1. Check if files exist
echo "📁 Files in nginx html directory:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -20

# 2. Check index.html specifically
echo ""
echo "📄 index.html details:"
docker exec frontend ls -lh /usr/share/nginx/html/index.html
docker exec frontend stat /usr/share/nginx/html/index.html

# 3. Check permissions
echo ""
echo "🔐 Permissions check:"
docker exec frontend ls -ld /usr/share/nginx/html/
docker exec frontend ls -ld /usr/share/nginx/html/index.html

# 4. Check nginx user
echo ""
echo "👤 Nginx user:"
docker exec frontend id nginx
docker exec frontend whoami

# 5. Test if nginx can read the file
echo ""
echo "🧪 Testing file access:"
docker exec frontend su -s /bin/sh nginx -c "test -r /usr/share/nginx/html/index.html && echo '✅ Nginx CAN read index.html' || echo '❌ Nginx CANNOT read index.html'"
docker exec frontend su -s /bin/sh nginx -c "test -x /usr/share/nginx/html && echo '✅ Nginx CAN access directory' || echo '❌ Nginx CANNOT access directory'"

# 6. Check nginx error logs
echo ""
echo "📋 Nginx error logs (last 30 lines):"
docker exec frontend tail -30 /var/log/nginx/error.log

# 7. Check nginx access logs
echo ""
echo "📋 Nginx access logs (last 10 lines):"
docker exec frontend tail -10 /var/log/nginx/access.log

# 8. Check nginx config
echo ""
echo "📋 Nginx root directory in config:"
docker exec frontend grep -E "^\s*root" /etc/nginx/conf.d/default.conf

# 9. Check directory ownership
echo ""
echo "📁 Directory ownership:"
docker exec frontend stat /usr/share/nginx/html/ | grep -E "Uid|Gid|Access"

# 10. Try to fix permissions again
echo ""
echo "🔧 Attempting to fix permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
docker exec frontend chmod -R 755 /usr/share/nginx/html/
docker exec frontend find /usr/share/nginx/html/ -type f -exec chmod 644 {} \;
docker exec frontend find /usr/share/nginx/html/ -type d -exec chmod 755 {} \;

# 11. Verify after fix
echo ""
echo "✅ Verification after fix:"
docker exec frontend ls -la /usr/share/nginx/html/index.html
docker exec frontend su -s /bin/sh nginx -c "test -r /usr/share/nginx/html/index.html && echo '✅ Nginx CAN read after fix' || echo '❌ Still cannot read'"

# 12. Reload nginx
echo ""
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Diagnosis complete. Check the output above."

