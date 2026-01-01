#!/bin/bash
# Fix 403 Forbidden Error - Run this on the server

echo "🔍 Diagnosing 403 Error..."

# 1. Check if files exist
echo "📁 Checking files in nginx html directory:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -20

# 2. Check if index.html exists
echo ""
echo "📄 Checking for index.html:"
docker exec frontend ls -la /usr/share/nginx/html/index.html

# 3. Check file permissions
echo ""
echo "🔐 Current file permissions:"
docker exec frontend stat /usr/share/nginx/html/

# 4. Check nginx error logs
echo ""
echo "📋 Recent nginx error logs:"
docker exec frontend tail -20 /var/log/nginx/error.log

# 5. Check nginx access logs
echo ""
echo "📋 Recent nginx access logs:"
docker exec frontend tail -10 /var/log/nginx/access.log

# 6. Fix permissions (if needed)
echo ""
echo "🔧 Fixing file permissions..."
docker exec frontend chown -R nginx:nginx /usr/share/nginx/html/
docker exec frontend chmod -R 755 /usr/share/nginx/html/

# 7. Verify nginx can read files
echo ""
echo "✅ Verifying nginx can read index.html:"
docker exec frontend cat /usr/share/nginx/html/index.html | head -5

# 8. Test nginx config
echo ""
echo "🧪 Testing nginx configuration:"
docker exec frontend nginx -t

# 9. Reload nginx
echo ""
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Diagnostic complete. Check the output above for issues."

