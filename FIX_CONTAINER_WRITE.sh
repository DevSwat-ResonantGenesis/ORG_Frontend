#!/bin/bash
# Fix container write permissions issue

set -e

echo "🔍 Checking container setup..."

# 1. Check if /usr/share/nginx/html is a volume mount
echo "📦 Checking volume mounts:"
docker inspect frontend | grep -A 30 "Mounts"

# 2. Check directory permissions
echo ""
echo "📁 Directory details:"
docker exec frontend ls -ld /usr/share/nginx/html/
docker exec frontend stat /usr/share/nginx/html/

# 3. Check if we can write to parent directory
echo ""
echo "🧪 Testing write to parent:"
docker exec frontend touch /usr/share/nginx/test-write.txt 2>&1 && echo "✅ Can write to parent" || echo "❌ Cannot write to parent"
docker exec frontend rm -f /usr/share/nginx/test-write.txt 2>&1

# 4. Try removing and recreating the directory
echo ""
echo "🔧 Attempting to fix directory..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html && mkdir -p /usr/share/nginx/html/assets' 2>&1
docker exec frontend ls -ld /usr/share/nginx/html/

# 5. Test write after recreation
echo ""
echo "🧪 Testing write after recreation:"
docker exec frontend touch /usr/share/nginx/html/test.txt 2>&1 && echo "✅ Can write now" || echo "❌ Still cannot write"
docker exec frontend rm -f /usr/share/nginx/html/test.txt 2>&1

# 6. If still can't write, check if it's a volume
echo ""
echo "📋 If still failing, checking volume configuration..."
docker volume ls | grep nginx || echo "No nginx volumes found"

echo ""
echo "✅ Investigation complete"

