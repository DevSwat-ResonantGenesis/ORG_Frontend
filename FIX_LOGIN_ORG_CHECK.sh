#!/bin/bash

# Fix login endpoint to use default_org_id
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING LOGIN ENDPOINT TO USE default_org_id"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

echo "📋 Step 1: Finding login endpoint..."
LOGIN_FILE=$(find backend/fastapi_app -name "*.py" -type f -exec grep -l "No active organizations\|def.*login" {} \; | head -1)

if [ -z "$LOGIN_FILE" ]; then
    echo "   ⚠️  Login file not found, searching in routers..."
    LOGIN_FILE=$(find backend/fastapi_app/routers -name "*auth*.py" -o -name "*login*.py" | head -1)
fi

if [ -z "$LOGIN_FILE" ]; then
    echo "   ❌ Could not find login endpoint file"
    exit 1
fi

echo "   ✅ Found: $LOGIN_FILE"

echo ""
echo "📋 Step 2: Checking current login code..."
echo "   Searching for 'No active organizations' message..."
grep -n "No active organizations" "$LOGIN_FILE" || echo "   ⚠️  Message not found in file"

echo ""
echo "📋 Step 3: Creating backup..."
cp "$LOGIN_FILE" "${LOGIN_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "   ✅ Backup created"

echo ""
echo "📋 Step 4: Showing relevant code section..."
grep -A 10 -B 10 "No active organizations\|active.*organization" "$LOGIN_FILE" || echo "   Showing login function:"
grep -A 20 "def.*login" "$LOGIN_FILE" | head -30

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 MANUAL FIX REQUIRED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The login endpoint needs to be updated to:"
echo "  1. Check for 'default_org_id' instead of 'org_id'"
echo "  2. Use 'default_org_id' when querying organizations"
echo "  3. Return the organization ID in the login response"
echo ""
echo "File to edit: $LOGIN_FILE"
echo ""
echo "Look for code that checks organizations and update it to use:"
echo "  - user.default_org_id (instead of user.org_id)"
echo "  - Query organizations using default_org_id"
echo ""
echo "After fixing, restart the API:"
echo "  docker compose restart api"
echo ""

