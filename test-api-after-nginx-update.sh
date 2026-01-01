#!/bin/bash
# Test API after nginx config update
# Run this ON YOUR DROPLET

echo "🧪 Testing API endpoints..."
echo ""

echo "1️⃣  Testing backend directly from host:"
curl -s http://localhost:8001/health
echo ""
echo ""

echo "2️⃣  Testing API through nginx (/api/health):"
curl -s http://dev-swat.com/api/health
echo ""
echo ""

echo "3️⃣  Testing API through nginx (/api/health) with verbose:"
curl -v http://dev-swat.com/api/health 2>&1 | grep -E "< HTTP|502|200|404"
echo ""

echo "4️⃣  Testing from inside nginx container:"
docker exec frontend-nginx wget -qO- --timeout=2 http://172.17.0.1:8001/health 2>&1 | head -3
echo ""

echo "💡 If you see 502, nginx can't reach backend. Try:"
echo "   docker network connect resonantgraphaiv01_default frontend-nginx"
echo "   Then update nginx config to use: http://resonantgraphaiv01-api-1:8000"

