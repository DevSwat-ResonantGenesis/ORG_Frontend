#!/bin/bash

# Disable or Adjust Rate Limiting in Backend - Run on Droplet

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING RATE LIMITING (429 ERRORS)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /root/ResonantGraphAIV0.1

# Step 1: Find rate limiting code
echo ""
echo "📋 Step 1: Finding rate limiting configuration..."
RATE_LIMIT_FILES=$(grep -r "RateLimiter\|slowapi\|@limiter" backend/fastapi_app/ --include="*.py" -l 2>/dev/null)

if [ -z "$RATE_LIMIT_FILES" ]; then
    echo "✅ No rate limiting middleware found in Python files"
    echo ""
    echo "📋 Checking for rate limiting in middleware..."
    grep -r "rate\|limit" backend/fastapi_app/middleware/ --include="*.py" 2>/dev/null || echo "No rate limiting in middleware"
else
    echo "⚠️  Found rate limiting in:"
    echo "$RATE_LIMIT_FILES"
    echo ""
    echo "📋 Showing rate limiting code:"
    for file in $RATE_LIMIT_FILES; do
        echo "=== $file ==="
        grep -A 5 -B 5 "RateLimiter\|slowapi\|@limiter" "$file" | head -20
        echo ""
    done
fi

# Step 2: Check main.py for rate limiting
echo ""
echo "📋 Step 2: Checking main.py for rate limiting..."
grep -A 10 -B 5 "RateLimiter\|slowapi\|limiter" backend/fastapi_app/main.py 2>/dev/null || echo "No rate limiting in main.py"

# Step 3: Check if there's a way to disable via environment variable
echo ""
echo "📋 Step 3: Checking for rate limit environment variables..."
grep -i "rate\|limit" .env 2>/dev/null || echo "No rate limit env vars in .env"

# Step 4: Test current rate limiting
echo ""
echo "📋 Step 4: Testing rate limiting..."
echo "Making 10 rapid requests to /health:"
for i in {1..10}; do
    STATUS=$(curl -s -w "%{http_code}" -o /dev/null http://137.184.234.252:8001/health)
    echo "Request $i: $STATUS"
    if [ "$STATUS" = "429" ]; then
        echo "⚠️  Rate limiting is ACTIVE!"
        break
    fi
    sleep 0.2
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If rate limiting is found, you can:"
echo "1. Comment out the rate limiter middleware in the code"
echo "2. Set rate limits to very high values (e.g., 1000/min)"
echo "3. Add environment variable to disable rate limiting"
echo "4. Rebuild the API container after changes"
echo ""

