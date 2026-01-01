#!/bin/bash
# Fix 502 Bad Gateway - Test backend connectivity from nginx container
# Run this ON YOUR DROPLET

echo "🔍 Testing backend connectivity from nginx container..."
echo ""

# Test 1: Can nginx container reach host IP?
echo "1️⃣  Testing connection to 172.17.0.1:8001 from nginx container:"
docker exec frontend-nginx wget -qO- --timeout=2 http://172.17.0.1:8001/health 2>&1 | head -3
echo ""

# Test 2: Can nginx container reach backend container directly?
echo "2️⃣  Testing connection to backend container from nginx:"
BACKEND_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' resonantgraphaiv01-api-1 2>/dev/null)
if [ -n "$BACKEND_IP" ]; then
    echo "   Backend container IP: $BACKEND_IP"
    docker exec frontend-nginx wget -qO- --timeout=2 http://$BACKEND_IP:8000/health 2>&1 | head -3
else
    echo "   Could not get backend container IP"
fi
echo ""

# Test 3: Test from host directly
echo "3️⃣  Testing backend from host:"
curl -s http://localhost:8001/health | head -3
echo ""

# Test 4: Check if nginx and backend are on same network
echo "4️⃣  Checking Docker networks:"
echo "   Backend network:"
docker inspect resonantgraphaiv01-api-1 | grep -A 5 "Networks" | head -10
echo ""
echo "   Nginx network:"
docker inspect frontend-nginx | grep -A 5 "Networks" | head -10
echo ""

echo "💡 Solution options:"
echo "   A) Connect nginx to backend network (best)"
echo "   B) Use host IP (172.17.0.1) - current approach"
echo "   C) Use host.docker.internal (if supported)"

