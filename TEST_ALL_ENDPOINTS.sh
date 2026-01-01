#!/bin/bash

# Test all API endpoints systematically
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTING ALL API ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BASE_URL="https://dev-swat.com/api"
BACKEND_URL="http://137.184.234.252:8001"

# Test credentials
EMAIL="admin@test.com"
PASSWORD="Test1234!"

echo "📋 Step 1: Getting authentication token..."
echo ""

# Login to get token
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
    -c /tmp/cookies.txt || echo "{}")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4 || echo "")

if [ -z "$TOKEN" ]; then
    echo "   ⚠️  Could not get token, testing without authentication"
    AUTH_HEADER=""
else
    echo "   ✅ Token obtained"
    AUTH_HEADER="Authorization: Bearer $TOKEN"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TESTING ENDPOINTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local path=$2
    local description=$3
    local data=${4:-""}
    
    echo "🧪 Testing: $description"
    echo "   $method $path"
    
    if [ -n "$data" ]; then
        CODE=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$path" \
            -H "Content-Type: application/json" \
            ${AUTH_HEADER:+-H "$AUTH_HEADER"} \
            -d "$data" 2>/dev/null || echo "000")
    else
        CODE=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$path" \
            ${AUTH_HEADER:+-H "$AUTH_HEADER"} \
            2>/dev/null || echo "000")
    fi
    
    if [ "$CODE" = "200" ] || [ "$CODE" = "201" ]; then
        echo "   ✅ $CODE - Working"
    elif [ "$CODE" = "401" ] || [ "$CODE" = "403" ]; then
        echo "   ⚠️  $CODE - Requires authentication (normal)"
    elif [ "$CODE" = "404" ]; then
        echo "   ❌ $CODE - Not found"
    elif [ "$CODE" = "422" ]; then
        echo "   ⚠️  $CODE - Validation error (may be normal for test data)"
    elif [ "$CODE" = "429" ]; then
        echo "   ⚠️  $CODE - Rate limited"
    elif [ "$CODE" = "500" ]; then
        echo "   ❌ $CODE - Server error"
    else
        echo "   📊 $CODE"
    fi
    echo ""
}

# Test health endpoint (no auth)
test_endpoint "GET" "/health" "Health Check"

# Test auth endpoints
test_endpoint "POST" "/auth/login" "Login" "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

# Test with authentication if we have token
if [ -n "$TOKEN" ]; then
    # Test predictions
    test_endpoint "GET" "/predictions" "Get Predictions"
    test_endpoint "POST" "/predictions" "Create Prediction" "{\"text\":\"Test prediction\"}"
    
    # Test policies
    test_endpoint "GET" "/policies" "Get Policies"
    
    # Test compliance
    test_endpoint "GET" "/compliance/summary" "Get Compliance Summary"
    
    # Test settings
    test_endpoint "GET" "/settings/api-keys" "Get API Keys"
    test_endpoint "GET" "/settings/thresholds" "Get Thresholds"
    test_endpoint "GET" "/settings/models" "Get Models"
    
    # Test organizations
    test_endpoint "GET" "/orgs/current" "Get Current Organization"
    
    # Test billing
    test_endpoint "GET" "/billing/overview" "Get Billing Overview"
    
    # Test ML
    test_endpoint "GET" "/ml/models" "Get ML Models"
    test_endpoint "GET" "/ml/training-jobs" "Get Training Jobs"
    test_endpoint "GET" "/ml/workers/status" "Get Worker Status"
    
    # Test audit
    test_endpoint "GET" "/audit/logs" "Get Audit Logs"
else
    echo "⚠️  Skipping authenticated endpoints (no token)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TESTING COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  - Endpoints with 200/201: Working ✅"
echo "  - Endpoints with 401/403: Need authentication (normal) ⚠️"
echo "  - Endpoints with 404: Route not found ❌"
echo "  - Endpoints with 500: Server error ❌"
echo ""
echo "For detailed testing, see COMPLETE_TESTING_GUIDE.md"
echo ""


