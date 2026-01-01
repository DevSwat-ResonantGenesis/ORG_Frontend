#!/bin/bash

# Diagnose 403 Forbidden Login Error
# This script helps identify why login requests are being rejected

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 DIAGNOSING 403 FORBIDDEN LOGIN ERROR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

# Step 1: Check Backend Status
echo "📊 Step 1: Checking Backend Status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose ps api
echo ""

# Step 2: Check Backend Logs
echo "📋 Step 2: Recent Backend Logs..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose logs api --tail=30 | grep -i "error\|403\|forbidden\|cors\|auth" || {
    echo "No obvious errors in recent logs"
}
echo ""

# Step 3: Check CORS Configuration
echo "🔧 Step 3: Checking CORS Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ".env" ]; then
    echo "CORS settings in .env:"
    grep -i "CORS\|ORIGIN" .env || echo "No CORS settings found in .env"
else
    echo "⚠️  .env file not found"
fi
echo ""

# Step 4: Test Backend Directly
echo "🧪 Step 4: Testing Backend Directly..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing POST to http://137.184.234.252:8001/auth/login"
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://137.184.234.252:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Test1234!"}')

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

echo "Response Code: $HTTP_CODE"
echo "Response Body: $BODY"
echo ""

# Step 5: Test Through Nginx Proxy
echo "🧪 Step 5: Testing Through Nginx Proxy..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing POST to https://dev-swat.com/api/auth/login"
PROXY_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -k -X POST https://dev-swat.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Test1234!"}')

PROXY_HTTP_CODE=$(echo "$PROXY_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
PROXY_BODY=$(echo "$PROXY_RESPONSE" | grep -v "HTTP_CODE")

echo "Response Code: $PROXY_HTTP_CODE"
echo "Response Body: $PROXY_BODY"
echo ""

# Step 6: Check Nginx Configuration
echo "🔧 Step 6: Checking Nginx Proxy Configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker exec frontend cat /etc/nginx/conf.d/default.conf | grep -A 15 "location /api" || {
    echo "⚠️  Could not find /api location in nginx config"
}
echo ""

# Step 7: Summary and Recommendations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 DIAGNOSIS SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Backend is responding correctly (direct access)"
else
    echo "❌ Backend returned: $HTTP_CODE"
    echo "   This suggests a backend issue"
fi

if [ "$PROXY_HTTP_CODE" = "200" ] || [ "$PROXY_HTTP_CODE" = "201" ]; then
    echo "✅ Nginx proxy is working correctly"
elif [ "$PROXY_HTTP_CODE" = "403" ]; then
    echo "❌ Nginx proxy returned 403 Forbidden"
    echo "   This suggests:"
    echo "   - CORS configuration issue"
    echo "   - Backend authentication middleware blocking request"
    echo "   - Rate limiting"
else
    echo "⚠️  Nginx proxy returned: $PROXY_HTTP_CODE"
fi

echo ""
echo "🔧 RECOMMENDED FIXES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Check CORS in backend .env:"
echo "   FASTAPI_CORS_ORIGINS=https://dev-swat.com"
echo ""
echo "2. Restart backend:"
echo "   cd /root/ResonantGraphAIV0.1 && docker compose restart api"
echo ""
echo "3. Check backend logs for details:"
echo "   docker compose logs api --tail=50"
echo ""

