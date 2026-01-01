#!/bin/bash
# Check and fix volume mount issue

echo "🔍 Checking container and volume configuration..."

# 1. Check container mounts
echo "📦 Container mounts:"
docker inspect frontend | grep -A 30 "Mounts"

# 2. Check if directory exists
echo ""
echo "📁 Checking if directory exists:"
docker exec frontend ls -ld /usr/share/nginx/html/ 2>&1

# 3. Check what's actually at that path
echo ""
echo "📋 Checking /usr/share/nginx:"
docker exec frontend ls -la /usr/share/nginx/ 2>&1

# 4. Check if we can create the directory
echo ""
echo "🧪 Testing directory creation:"
docker exec frontend mkdir -p /usr/share/nginx/html/assets 2>&1
docker exec frontend ls -ld /usr/share/nginx/html/ 2>&1

# 5. Check docker-compose or container restart might be needed
echo ""
echo "📋 Container status:"
docker ps | grep frontend

# 6. Check if there's a docker-compose file
echo ""
echo "📋 Looking for docker-compose:"
if [ -f "docker-compose.yml" ]; then
    echo "Found docker-compose.yml"
    grep -A 5 "frontend" docker-compose.yml | head -20
elif [ -f "../docker-compose.yml" ]; then
    echo "Found docker-compose.yml in parent directory"
    grep -A 5 "frontend" ../docker-compose.yml | head -20
else
    echo "No docker-compose.yml found in current or parent directory"
fi

echo ""
echo "✅ Investigation complete"

