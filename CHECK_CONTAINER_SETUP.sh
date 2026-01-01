#!/bin/bash
# Check container setup and find the right way to deploy

echo "🔍 Checking container setup..."

# 1. Check if it's a volume mount
echo "📦 Checking Docker volumes:"
docker inspect frontend | grep -A 20 "Mounts"

# 2. Check filesystem type
echo ""
echo "📁 Checking filesystem:"
docker exec frontend df -h /usr/share/nginx/html/
docker exec frontend mount | grep nginx

# 3. Check if directory is writable
echo ""
echo "🧪 Testing write permissions:"
docker exec frontend touch /usr/share/nginx/html/test.txt 2>&1
docker exec frontend ls -la /usr/share/nginx/html/test.txt 2>&1
docker exec frontend rm -f /usr/share/nginx/html/test.txt 2>&1

# 4. Check container entrypoint/command
echo ""
echo "📋 Container command:"
docker inspect frontend | grep -A 5 "Cmd\|Entrypoint"

# 5. Check if we can write to /tmp and copy from there
echo ""
echo "🧪 Testing /tmp write:"
docker exec frontend touch /tmp/test.txt && echo "✅ Can write to /tmp" || echo "❌ Cannot write to /tmp"
docker exec frontend rm -f /tmp/test.txt

# 6. Check actual nginx root from config
echo ""
echo "📋 Nginx root from config:"
docker exec frontend grep -E "^\s*root" /etc/nginx/conf.d/default.conf

echo ""
echo "✅ Investigation complete"

