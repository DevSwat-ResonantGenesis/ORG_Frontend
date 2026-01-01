#!/bin/bash
# Check bind mount is working

echo "🔍 Checking bind mount..."

# 1. Check what's in host dist
echo "📁 Files on HOST (/root/frontend/dist):"
ls -la /root/frontend/dist/ | head -10

# 2. Check what's in container
echo ""
echo "📁 Files in CONTAINER (/usr/share/nginx/html):"
docker exec frontend ls -la /usr/share/nginx/html/ 2>&1

# 3. Check if mount is active
echo ""
echo "📦 Checking mount in container:"
docker exec frontend mount | grep nginx

# 4. Try to see files directly
echo ""
echo "🧪 Testing file access:"
docker exec frontend cat /usr/share/nginx/html/index.html 2>&1 | head -3 || echo "File not accessible"

# 5. Check if directory is empty or has different content
echo ""
echo "📊 Directory comparison:"
echo "Host dist has $(ls /root/frontend/dist/ | wc -l) items"
echo "Container html has $(docker exec frontend ls /usr/share/nginx/html/ 2>&1 | wc -l) items"

# 6. If mount isn't working, we might need to restart container
echo ""
echo "📋 Container status:"
docker ps | grep frontend

echo ""
echo "✅ Check complete"

