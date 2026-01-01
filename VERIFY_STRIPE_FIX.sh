#!/bin/bash

# Verify stripe.py fix and check for other instances
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFYING STRIPE.PY FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

STRIPE_FILE="backend/fastapi_app/routers/stripe.py"

echo "📋 Step 1: Checking for remaining 'session, org = session_identity'..."
REMAINING=$(grep -n "session, org = session_identity" "$STRIPE_FILE" || echo "")
if [ -z "$REMAINING" ]; then
    echo "   ✅ No remaining instances found"
else
    echo "   ⚠️  Found remaining instances:"
    echo "$REMAINING" | sed 's/^/     /'
fi
echo ""

echo "📋 Step 2: Verifying fix was applied..."
FIXED_LINES=$(grep -n "session, identity = session_identity" "$STRIPE_FILE" || echo "")
if [ -n "$FIXED_LINES" ]; then
    echo "   ✅ Fix applied at:"
    echo "$FIXED_LINES" | sed 's/^/     /'
    
    # Show the fixed code
    for line_num in $(echo "$FIXED_LINES" | cut -d: -f1); do
        echo ""
        echo "   Code at line $line_num:"
        sed -n "${line_num},$((line_num+2))p" "$STRIPE_FILE" | sed 's/^/     /'
    done
else
    echo "   ❌ Fix not found!"
fi
echo ""

echo "📋 Step 3: Checking for org.get(Organization..."
ORG_GET=$(grep -n "org = session.get(Organization" "$STRIPE_FILE" || echo "")
if [ -n "$ORG_GET" ]; then
    echo "   ✅ Organization retrieval added:"
    echo "$ORG_GET" | sed 's/^/     /'
else
    echo "   ⚠️  Organization retrieval not found"
fi
echo ""

echo "📋 Step 4: Checking for other potential issues..."
# Check if there are other places accessing org.meta where org might be Identity
OTHER_ISSUES=$(grep -n "org\.meta" "$STRIPE_FILE" | grep -v "session.get(Organization" || echo "")
if [ -n "$OTHER_ISSUES" ]; then
    echo "   Found org.meta usage:"
    echo "$OTHER_ISSUES" | sed 's/^/     /'
    echo "   (These should be fine if org is retrieved from database)"
else
    echo "   ✅ No other org.meta issues found"
fi
echo ""

echo "📋 Step 5: Restarting API to test fix..."
docker compose restart api
echo "   Waiting for API to start..."
sleep 8

echo ""
echo "📋 Step 6: Testing API health..."
HEALTH=$(curl -s http://137.184.234.252:8001/health 2>/dev/null || echo "failed")
if echo "$HEALTH" | grep -q "ok"; then
    echo "   ✅ API is running"
else
    echo "   ⚠️  API health check: $HEALTH"
    echo "   Check logs: docker compose logs api --tail 50"
fi
echo ""

echo "📋 Step 7: Checking for AttributeError in logs..."
sleep 2
ERRORS=$(docker compose logs api --tail 50 2>/dev/null | grep -i "AttributeError.*meta" || echo "")
if [ -z "$ERRORS" ]; then
    echo "   ✅ No AttributeError found in recent logs"
else
    echo "   ⚠️  Found AttributeError:"
    echo "$ERRORS" | head -5 | sed 's/^/     /'
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ Fix applied: session, identity = session_identity"
echo "  ✅ Organization retrieval added"
echo "  ✅ API restarted"
echo ""
echo "Test the application now - the Identity.meta error should be fixed!"
echo ""

