#!/bin/bash
# Complete Testing Script for Droplet
# Copy and paste this entire script on your Droplet

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTING EVERYTHING ON DROPLET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Backend Direct Connection
echo "📋 Test 1: Backend Direct Connection..."
if curl -s -f http://137.184.234.252:8001/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running and responding!"
    curl -s http://137.184.234.252:8001/health | head -1
else
    echo "   ❌ Backend not responding at http://137.184.234.252:8001/health"
fi
echo ""

# Test 2: Nginx Proxy
echo "📋 Test 2: Nginx Proxy (/api → backend)..."
if curl -s -f -k https://dev-swat.com/api/health > /dev/null 2>&1; then
    echo "   ✅ Nginx proxy is working!"
    curl -s -k https://dev-swat.com/api/health | head -1
else
    echo "   ❌ Nginx proxy not working (https://dev-swat.com/api/health)"
    echo "   → Check nginx configuration"
fi
echo ""

# Test 3: Frontend Files
echo "📋 Test 3: Frontend Files in Docker..."
if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo "   ✅ Frontend files exist!"
    docker exec frontend ls -1 /usr/share/nginx/html/ | head -5
else
    echo "   ❌ Frontend files missing!"
    echo "   → Run: cd /root/frontend && npm run build && docker cp dist/. frontend:/usr/share/nginx/html/"
fi
echo ""

# Test 4: Nginx Configuration
echo "📋 Test 4: Nginx Configuration..."
if docker exec frontend nginx -t 2>/dev/null; then
    echo "   ✅ Nginx configuration is valid!"
else
    echo "   ❌ Nginx configuration has errors!"
    docker exec frontend nginx -t
fi
echo ""

# Test 5: Check /api Proxy Configuration
echo "📋 Test 5: Nginx /api Proxy Configuration..."
if docker exec frontend grep -q "location /api" /etc/nginx/conf.d/default.conf 2>/dev/null; then
    echo "   ✅ /api location found in nginx config!"
    echo "   Configuration:"
    docker exec frontend grep -A 5 "location /api" /etc/nginx/conf.d/default.conf | head -6
else
    echo "   ❌ /api location NOT found in nginx config!"
    echo "   → You need to add /api proxy configuration"
fi
echo ""

# Test 6: Backend Container Status
echo "📋 Test 6: Backend Container Status..."
cd /root/ResonantGraphAIV0.1 2>/dev/null || echo "   ⚠️  Backend directory not found at /root/ResonantGraphAIV0.1"
if [ -d "/root/ResonantGraphAIV0.1" ]; then
    cd /root/ResonantGraphAIV0.1
    echo "   Containers:"
    docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null || echo "   ⚠️  docker compose not available"
fi
echo ""

# Test 7: Frontend Container Status
echo "📋 Test 7: Frontend Container Status..."
if docker ps | grep -q frontend; then
    echo "   ✅ Frontend container is running!"
    docker ps | grep frontend
else
    echo "   ❌ Frontend container not running!"
fi
echo ""

# Test 8: Frontend Build Check
echo "📋 Test 8: Frontend Build Files..."
if [ -d "/root/frontend/dist" ]; then
    echo "   ✅ Frontend dist/ directory exists!"
    echo "   Files:"
    ls -1 /root/frontend/dist/ | head -5
    if [ -f "/root/frontend/dist/index.html" ]; then
        echo "   ✅ index.html exists!"
    else
        echo "   ❌ index.html missing!"
    fi
else
    echo "   ❌ Frontend dist/ directory not found!"
    echo "   → Run: cd /root/frontend && npm run build"
fi
echo ""

# Test 9: Test Login Endpoint (Connection Only)
echo "📋 Test 9: Login Endpoint Connection..."
LOGIN_RESPONSE=$(curl -s -X POST https://dev-swat.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' 2>&1)
if echo "$LOGIN_RESPONSE" | grep -q "Invalid credentials\|Unauthorized\|detail"; then
    echo "   ✅ Login endpoint is accessible (got expected error response)"
elif echo "$LOGIN_RESPONSE" | grep -q "Connection refused\|Failed to connect"; then
    echo "   ❌ Cannot connect to login endpoint"
else
    echo "   ⚠️  Unexpected response (might be OK):"
    echo "$LOGIN_RESPONSE" | head -3
fi
echo ""

# Test 10: Check Recent Backend Logs
echo "📋 Test 10: Recent Backend Logs (last 5 lines)..."
if [ -d "/root/ResonantGraphAIV0.1" ]; then
    cd /root/ResonantGraphAIV0.1
    echo "   API logs:"
    docker compose logs api --tail=5 2>/dev/null || docker-compose logs api --tail=5 2>/dev/null || echo "   ⚠️  Could not fetch logs"
else
    echo "   ⚠️  Backend directory not found"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ If all tests passed, your setup is working!"
echo ""
echo "📋 Next Steps:"
echo "1. Open https://dev-swat.com/login in browser"
echo "2. Press F12 → Console"
echo "3. Look for: [FastAPI Client] Base URL: /api"
echo "4. Press F12 → Network tab"
echo "5. Try logging in"
echo "6. Check /api/auth/login request status"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

