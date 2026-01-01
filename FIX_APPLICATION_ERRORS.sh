#!/bin/bash

# Fix Application-Level Errors (500, 404, 429)
# Infrastructure is working, so these are backend application issues

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING APPLICATION ERRORS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1 2>/dev/null || {
    echo "❌ Backend directory not found!"
    exit 1
}

# Step 1: Check backend logs for errors
echo "📋 Step 1: Checking backend logs for errors..."
echo ""
RECENT_ERRORS=$(docker compose logs api --tail 100 2>/dev/null | grep -i "error\|exception\|traceback\|500\|failed" | tail -20 || echo "")

if [ -n "$RECENT_ERRORS" ]; then
    echo "   Recent errors found:"
    echo "$RECENT_ERRORS" | sed 's/^/     /'
    echo ""
else
    echo "   ✅ No recent errors in logs"
    echo ""
fi

# Step 2: Check for rate limiting
echo "🔍 Step 2: Checking rate limiting configuration..."
RATE_LIMIT_CONFIG=$(docker compose exec api env 2>/dev/null | grep -i "rate\|limit\|throttle" || echo "No rate limiting env vars found")
echo "   Rate limiting config:"
echo "$RATE_LIMIT_CONFIG" | sed 's/^/     /'
echo ""

# Step 3: Test specific failing endpoints
echo "🧪 Step 3: Testing specific endpoints..."
echo ""

# Test /auth/me (404 error)
echo "   Testing /auth/me (was 404)..."
AUTH_ME=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://137.184.234.252:8001/auth/me \
    -H "Content-Type: application/json" 2>/dev/null || echo "000")
echo "     Direct: $AUTH_ME"
AUTH_ME_PROXY=$(curl -s -o /dev/null -w "%{http_code}" -X GET https://dev-swat.com/api/auth/me \
    -H "Content-Type: application/json" 2>/dev/null || echo "000")
echo "     Proxy: $AUTH_ME_PROXY"
echo ""

# Test /predictions (500 error)
echo "   Testing /predictions (was 500)..."
PREDICTIONS=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://137.184.234.252:8001/predictions \
    -H "Content-Type: application/json" 2>/dev/null || echo "000")
echo "     Direct: $PREDICTIONS"
PREDICTIONS_PROXY=$(curl -s -o /dev/null -w "%{http_code}" -X GET https://dev-swat.com/api/predictions \
    -H "Content-Type: application/json" 2>/dev/null || echo "000")
echo "     Proxy: $PREDICTIONS_PROXY"
echo ""

# Test /billing/overview (429 error)
echo "   Testing /billing/overview (was 429)..."
BILLING=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://137.184.234.252:8001/billing/overview \
    -H "Content-Type: application/json" 2>/dev/null || echo "000")
echo "     Direct: $BILLING"
BILLING_PROXY=$(curl -s -o /dev/null -w "%{http_code}" -X GET https://dev-swat.com/api/billing/overview \
    -H "Content-Type: application/json" 2>/dev/null || echo "000")
echo "     Proxy: $BILLING_PROXY"
echo ""

# Step 4: Check database connection
echo "🔍 Step 4: Checking database connection..."
DB_CONTAINER=$(docker compose ps db 2>/dev/null | grep -q "Up" && echo "running" || echo "stopped")
echo "   Database container: $DB_CONTAINER"

if [ "$DB_CONTAINER" = "running" ]; then
    DB_TEST=$(docker compose exec -T db psql -U postgres -d resonant -c "SELECT 1;" 2>/dev/null | grep -q "1" && echo "connected" || echo "failed")
    echo "   Database connection: $DB_TEST"
else
    echo "   ⚠️  Database container is not running"
fi
echo ""

# Step 5: Restart backend to clear errors
echo "🔄 Step 5: Restarting backend to clear errors..."
docker compose restart api
echo "   Waiting for API to start..."
sleep 8

# Verify API is up
if curl -s http://137.184.234.252:8001/health | grep -q "ok"; then
    echo "   ✅ API restarted successfully"
else
    echo "   ⚠️  API may not be fully started yet"
fi
echo ""

# Step 6: Check for stuck processes or memory issues
echo "🔍 Step 6: Checking API container health..."
API_CPU=$(docker stats frontend --no-stream --format "{{.CPUPerc}}" 2>/dev/null || echo "N/A")
API_MEM=$(docker stats frontend --no-stream --format "{{.MemUsage}}" 2>/dev/null || echo "N/A")
echo "   API CPU: $API_CPU"
echo "   API Memory: $API_MEM"
echo ""

# Step 7: Recommendations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 FIX RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$AUTH_ME" = "401" ] || [ "$AUTH_ME_PROXY" = "401" ]; then
    echo "✅ /auth/me: Requires authentication (401 = normal)"
elif [ "$AUTH_ME" = "404" ] || [ "$AUTH_ME_PROXY" = "404" ]; then
    echo "❌ /auth/me: Route not found (404)"
    echo "   Fix: Check backend routes - /auth/me might not exist"
    echo "   Or: This endpoint requires authentication token"
fi

if [ "$PREDICTIONS" = "500" ] || [ "$PREDICTIONS_PROXY" = "500" ]; then
    echo "❌ /predictions: Server error (500)"
    echo "   Fix: Check backend logs for database/application errors"
    echo "   Run: docker compose logs api --tail 50 | grep -i error"
elif [ "$PREDICTIONS" = "401" ] || [ "$PREDICTIONS_PROXY" = "401" ]; then
    echo "✅ /predictions: Requires authentication (401 = normal)"
fi

if [ "$BILLING" = "429" ] || [ "$BILLING_PROXY" = "429" ]; then
    echo "⚠️  /billing/overview: Rate limited (429)"
    echo "   Fix: Wait 1 minute, or check rate limiting config"
    echo "   Or: Reduce request frequency from frontend"
elif [ "$BILLING" = "401" ] || [ "$BILLING_PROXY" = "401" ]; then
    echo "✅ /billing/overview: Requires authentication (401 = normal)"
fi

echo ""
echo "🔧 GENERAL FIXES:"
echo ""
echo "1. Clear browser cache and hard refresh:"
echo "   Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo ""
echo "2. Wait 1 minute for rate limiting to reset"
echo ""
echo "3. Check if you're logged in:"
echo "   The 401/404 errors might be because you're not authenticated"
echo ""
echo "4. Check backend logs for specific errors:"
echo "   cd /root/ResonantGraphAIV0.1 && docker compose logs api --tail 100"
echo ""
echo "5. Restart all services:"
echo "   cd /root/ResonantGraphAIV0.1 && docker compose restart"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

