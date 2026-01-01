#!/bin/bash
# Fix container filesystem issue

set -e

echo "🔍 Investigating container filesystem..."

# 1. Check container mount points
echo "📁 Checking container mounts:"
docker inspect frontend | grep -A 10 "Mounts"

# 2. Check actual filesystem in container
echo ""
echo "📋 Checking /usr/share/nginx/html structure:"
docker exec frontend ls -la /usr/share/nginx/html/
docker exec frontend df -h /usr/share/nginx/html/

# 3. Check if it's a volume mount
echo ""
echo "📦 Checking if it's a volume:"
docker exec frontend mount | grep nginx

# 4. Try copying to a different location first
echo ""
echo "🧪 Testing copy to different location:"
docker exec frontend mkdir -p /tmp/nginx-test
docker cp dist/index.html frontend:/tmp/nginx-test/index.html
docker exec frontend ls -lh /tmp/nginx-test/index.html

# 5. If that works, try moving it
if docker exec frontend test -f /tmp/nginx-test/index.html; then
    echo "✅ Copy to /tmp worked, trying to move to html directory..."
    docker exec frontend cp /tmp/nginx-test/index.html /usr/share/nginx/html/index.html
    docker exec frontend ls -lh /usr/share/nginx/html/index.html
fi

# 6. Alternative: Use docker exec with cat
echo ""
echo "🧪 Alternative method: Using cat to write file..."
docker exec frontend sh -c 'cat > /usr/share/nginx/html/index.html' < dist/index.html
docker exec frontend ls -lh /usr/share/nginx/html/index.html

# 7. Check what's actually there
echo ""
echo "📋 Final check of html directory:"
docker exec frontend find /usr/share/nginx/html/ -type f

echo ""
echo "✅ Investigation complete"

