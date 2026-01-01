#!/bin/bash

# Fix 429 Rate Limiting Errors - Run on Droplet

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 DIAGNOSING RATE LIMITING ISSUES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /root/ResonantGraphAIV0.1

# Step 1: Check API logs for rate limiting
echo ""
echo "📋 Step 1: Checking API logs for rate limiting..."
docker compose logs api --tail=50 | grep -i "rate\|limit\|429" || echo "No rate limiting messages in recent logs"

# Step 2: Check for rate limiting middleware
echo ""
echo "📋 Step 2: Checking for rate limiting configuration..."
RATE_LIMIT_FOUND=$(grep -r "RateLimiter\|slowapi\|@limiter\|rate.*limit" backend/fastapi_app/ 2>/dev/null | head -5)
if [ -z "$RATE_LIMIT_FOUND" ]; then
    echo "✅ No rate limiting middleware found in code"
else
    echo "⚠️  Rate limiting found:"
    echo "$RATE_LIMIT_FOUND"
fi

# Step 3: Check environment variables
echo ""
echo "📋 Step 3: Checking environment variables..."
grep -i "rate\|limit" .env 2>/dev/null || echo "No rate limit config in .env"

# Step 4: Test API endpoints
echo ""
echo "📋 Step 4: Testing API endpoints..."
echo "Testing /health:"
curl -s -w "\nStatus: %{http_code}\n" http://137.184.234.252:8001/health || echo "❌ Failed"

echo ""
echo "Testing /api/health through Nginx:"
curl -s -k -w "\nStatus: %{http_code}\n" https://dev-swat.com/api/health || echo "❌ Failed"

# Step 5: Check if there are too many requests being made
echo ""
echo "📋 Step 5: Testing rapid requests (to see if rate limiting kicks in)..."
for i in {1..5}; do
    STATUS=$(curl -s -w "%{http_code}" -o /dev/null http://137.184.234.252:8001/health)
    echo "Request $i: Status $STATUS"
    if [ "$STATUS" = "429" ]; then
        echo "⚠️  Rate limiting detected!"
        break
    fi
    sleep 0.5
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DIAGNOSIS COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If rate limiting is found, you may need to:"
echo "1. Disable rate limiting middleware"
echo "2. Increase rate limits"
echo "3. Check frontend for too many concurrent requests"

