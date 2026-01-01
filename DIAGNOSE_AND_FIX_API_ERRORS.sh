#!/bin/bash

# Comprehensive API Error Diagnosis and Fix
# Fixes: 500, 404, 429 errors

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 DIAGNOSING API ERRORS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check backend status
echo "📊 Step 1: Checking backend status..."
cd /root/ResonantGraphAIV0.1 2>/dev/null || {
    echo "   ⚠️  Backend directory not found at /root/ResonantGraphAIV0.1"
    echo "   Searching for backend..."
    BACKEND_DIR=$(find /root -name "docker-compose.yml" -type f 2>/dev/null | head -1 | xargs dirname)
    if [ -n "$BACKEND_DIR" ]; then
        echo "   Found backend at: $BACKEND_DIR"
        cd "$BACKEND_DIR"
    else
        echo "   ❌ Backend not found!"
        exit 1
    fi
}

# Check if API container is running
if docker compose ps api 2>/dev/null | grep -q "Up"; then
    echo "   ✅ API container is running"
    API_STATUS="running"
else
    echo "   ❌ API container is NOT running"
    API_STATUS="stopped"
    
    echo "   Attempting to start API..."
    docker compose up -d api
    sleep 5
    
    if docker compose ps api 2>/dev/null | grep -q "Up"; then
        echo "   ✅ API container started"
        API_STATUS="running"
    else
        echo "   ❌ API container failed to start"
        echo "   Logs:"
        docker compose logs api --tail 20
        exit 1
    fi
fi

# Test backend directly
echo ""
echo "🧪 Step 2: Testing backend directly..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://137.184.234.252:8001/health 2>/dev/null || echo "000")
echo "   Backend health: $BACKEND_HEALTH"

if [ "$BACKEND_HEALTH" != "200" ]; then
    echo "   ⚠️  Backend not responding correctly"
    echo "   Checking API logs..."
    docker compose logs api --tail 30
fi

# Test backend auth endpoint
echo ""
echo "🧪 Step 3: Testing backend auth endpoint..."
BACKEND_AUTH=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://137.184.234.252:8001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}' 2>/dev/null || echo "000")
echo "   Backend /auth/login: $BACKEND_AUTH (expected 422/401 for invalid credentials)"

# Step 4: Check nginx proxy
echo ""
echo "🔍 Step 4: Checking nginx proxy..."
cd /root/frontend 2>/dev/null || cd /root/ResonantGraphAI_FrontendV0.1- 2>/dev/null || {
    echo "   ⚠️  Frontend directory not found"
    exit 1
}

# Test nginx proxy
PROXY_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://dev-swat.com/api/health 2>/dev/null || echo "000")
echo "   Nginx proxy /api/health: $PROXY_HEALTH"

PROXY_AUTH=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://dev-swat.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test","password":"test"}' 2>/dev/null || echo "000")
echo "   Nginx proxy /api/auth/login: $PROXY_AUTH (expected 422/401)"

# Check nginx config
echo ""
echo "🔧 Step 5: Verifying nginx config..."
if docker exec frontend nginx -t 2>/dev/null; then
    echo "   ✅ Nginx config is valid"
else
    echo "   ❌ Nginx config has errors!"
    docker exec frontend nginx -t
    exit 1
fi

# Check nginx logs for errors
echo ""
echo "📋 Step 6: Checking nginx error logs..."
NGINX_ERRORS=$(docker exec frontend sh -c 'tail -20 /var/log/nginx/error.log 2>/dev/null' | grep -i "error\|404\|500" | tail -5 || echo "No recent errors")
if [ -n "$NGINX_ERRORS" ] && [ "$NGINX_ERRORS" != "No recent errors" ]; then
    echo "   Recent nginx errors:"
    echo "$NGINX_ERRORS" | sed 's/^/     /'
else
    echo "   ✅ No recent nginx errors"
fi

# Step 7: Check for rate limiting
echo ""
echo "🔍 Step 7: Checking for rate limiting..."
if [ "$PROXY_AUTH" = "429" ] || echo "$NGINX_ERRORS" | grep -q "429"; then
    echo "   ⚠️  Rate limiting detected (429 errors)"
    echo "   This could be:"
    echo "     - Too many requests from frontend"
    echo "     - Backend rate limiting enabled"
    echo "     - Nginx rate limiting"
    echo ""
    echo "   Solution: Wait 1 minute and try again"
    echo "   Or check backend rate limiting config"
fi

# Step 8: Fix recommendations
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 DIAGNOSIS SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo "✅ Backend: Running"
else
    echo "❌ Backend: Not responding ($BACKEND_HEALTH)"
    echo "   Fix: cd /root/ResonantGraphAIV0.1 && docker compose restart api"
fi

if [ "$PROXY_HEALTH" = "200" ]; then
    echo "✅ Nginx Proxy: Working"
elif [ "$PROXY_HEALTH" = "502" ] || [ "$PROXY_HEALTH" = "503" ]; then
    echo "❌ Nginx Proxy: Backend connection failed ($PROXY_HEALTH)"
    echo "   Fix: Check backend is running and accessible"
elif [ "$PROXY_HEALTH" = "404" ]; then
    echo "❌ Nginx Proxy: Route not found ($PROXY_HEALTH)"
    echo "   Fix: Check nginx config - /api/health route"
else
    echo "⚠️  Nginx Proxy: $PROXY_HEALTH"
fi

if [ "$PROXY_AUTH" = "422" ] || [ "$PROXY_AUTH" = "401" ] || [ "$PROXY_AUTH" = "400" ]; then
    echo "✅ API Auth Route: Working ($PROXY_AUTH = backend received request)"
elif [ "$PROXY_AUTH" = "404" ]; then
    echo "❌ API Auth Route: Not found (404)"
    echo "   Fix: Check nginx config - /api/auth/login rewrite rule"
elif [ "$PROXY_AUTH" = "429" ]; then
    echo "⚠️  API Auth Route: Rate limited (429)"
    echo "   Fix: Wait 1 minute, or check rate limiting config"
else
    echo "⚠️  API Auth Route: $PROXY_AUTH"
fi

echo ""
echo "🔧 QUICK FIXES:"
echo ""
echo "1. Restart backend:"
echo "   cd /root/ResonantGraphAIV0.1 && docker compose restart api"
echo ""
echo "2. Restart nginx:"
echo "   docker restart frontend"
echo ""
echo "3. Check backend logs:"
echo "   cd /root/ResonantGraphAIV0.1 && docker compose logs api --tail 50"
echo ""
echo "4. Check nginx logs:"
echo "   docker logs frontend --tail 50"
echo ""
echo "5. Test backend directly:"
echo "   curl http://137.184.234.252:8001/health"
echo ""
echo "6. Test nginx proxy:"
echo "   curl https://dev-swat.com/api/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

