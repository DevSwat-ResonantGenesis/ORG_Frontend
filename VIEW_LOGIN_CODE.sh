#!/bin/bash

# View the login endpoint code to understand the issue
set -e

cd /root/ResonantGraphAIV0.1

AUTH_FILE="backend/fastapi_app/routers/auth.py"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 VIEWING LOGIN ENDPOINT CODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find login function and show it
echo "📋 Login function (lines around 113):"
sed -n '100,200p' "$AUTH_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Searching for 'No active organizations':"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -n "No active organizations\|no active organization" "$AUTH_FILE" -A 5 -B 10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Searching for org_id usage in login:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -n "org_id\|organization" "$AUTH_FILE" | grep -A 2 -B 2 "def.*login\|login.*:" | head -30

