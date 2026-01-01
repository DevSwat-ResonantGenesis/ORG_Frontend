#!/bin/bash

# Verify that users can access their organizations via API
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFYING USER ORGANIZATION FIX VIA API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BASE_URL="https://dev-swat.com/api"
EMAIL="admin@test.com"
PASSWORD="Test1234!"

echo "📋 Step 1: Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
    -c /tmp/cookies.txt)

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4 || echo "")

if [ -z "$TOKEN" ]; then
    echo "   ❌ Login failed"
    echo "   Response: $LOGIN_RESPONSE"
    exit 1
else
    echo "   ✅ Login successful"
fi

echo ""
echo "📋 Step 2: Getting user info..."
USER_INFO=$(curl -s -X GET "$BASE_URL/auth/me" \
    -H "Authorization: Bearer $TOKEN" \
    -b /tmp/cookies.txt)

echo "$USER_INFO" | python3 -m json.tool 2>/dev/null || echo "$USER_INFO"

echo ""
echo "📋 Step 3: Getting organization info..."
ORG_INFO=$(curl -s -X GET "$BASE_URL/orgs/current" \
    -H "Authorization: Bearer $TOKEN" \
    -b /tmp/cookies.txt)

echo "$ORG_INFO" | python3 -m json.tool 2>/dev/null || echo "$ORG_INFO"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If you see organization data above, the fix is working!"
echo "If the frontend still shows 'no active organization':"
echo "  1. Clear browser cache (Ctrl+Shift+Delete)"
echo "  2. Log out and log back in"
echo "  3. Try incognito/private window"
echo ""

