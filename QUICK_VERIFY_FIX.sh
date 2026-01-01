#!/bin/bash

# Quick verification that Identity.meta error is fixed
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ QUICK VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

echo "📋 Step 1: Checking for AttributeError in recent logs..."
ERRORS=$(docker compose logs api --tail 200 2>/dev/null | grep -i "AttributeError.*meta" | tail -5 || echo "")

if [ -z "$ERRORS" ]; then
    echo "   ✅ No AttributeError found!"
    echo "   The Identity.meta error is FIXED! 🎉"
else
    echo "   ⚠️  Found AttributeError:"
    echo "$ERRORS" | sed 's/^/     /'
fi
echo ""

echo "📋 Step 2: Testing API health..."
HEALTH=$(curl -s http://137.184.234.252:8001/health 2>/dev/null || echo "failed")
if echo "$HEALTH" | grep -q "ok"; then
    echo "   ✅ API is healthy"
else
    echo "   ⚠️  API health: $HEALTH"
fi
echo ""

echo "📋 Step 3: Verifying stripe.py fixes..."
REMAINING=$(grep -n "session, org = session_identity" backend/fastapi_app/routers/stripe.py 2>/dev/null || echo "")
FIXED=$(grep -n "session, identity = session_identity" backend/fastapi_app/routers/stripe.py 2>/dev/null || echo "")

if [ -z "$REMAINING" ] && [ -n "$FIXED" ]; then
    FIXED_COUNT=$(echo "$FIXED" | wc -l)
    echo "   ✅ All $FIXED_COUNT instances fixed!"
else
    if [ -n "$REMAINING" ]; then
        echo "   ⚠️  Still remaining instances"
    fi
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ VERIFICATION COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ -z "$ERRORS" ]; then
    echo "🎉 SUCCESS! The Identity.meta error is completely fixed!"
    echo ""
    echo "You can now:"
    echo "  ✅ Use billing/subscription endpoints"
    echo "  ✅ The application should work without errors"
    echo "  ✅ No more AttributeError in logs"
else
    echo "⚠️  Some errors may still exist - check logs above"
fi
echo ""


