#!/bin/bash
# Check 500 Error on /resonant-chat

echo "🔍 Diagnosing 500 Error on /resonant-chat..."

# 1. Check nginx error logs
echo "📋 Recent nginx error logs:"
docker exec frontend tail -30 /var/log/nginx/error.log

# 2. Check if index.html exists
echo ""
echo "📄 Checking index.html:"
docker exec frontend ls -lh /usr/share/nginx/html/index.html

# 3. Check nginx config for SPA routing
echo ""
echo "📋 Checking nginx config for SPA routing:"
docker exec frontend grep -A 5 "try_files" /etc/nginx/conf.d/default.conf

# 4. Check browser console errors (if accessible)
echo ""
echo "💡 To check browser console errors:"
echo "   - Open browser DevTools (F12)"
echo "   - Check Console tab for JavaScript errors"
echo "   - Check Network tab for failed requests"

# 5. Check if the route file exists in build
echo ""
echo "📁 Checking built files:"
docker exec frontend ls -la /usr/share/nginx/html/ | grep -E "index|assets"

echo ""
echo "✅ Diagnostic complete. Check the nginx error logs above."

