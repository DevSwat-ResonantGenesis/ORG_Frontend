#!/bin/bash

# Fix ALL remaining instances of session, org = session_identity in stripe.py
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING ALL STRIPE.PY INSTANCES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

STRIPE_FILE="backend/fastapi_app/routers/stripe.py"

if [ ! -f "$STRIPE_FILE" ]; then
    echo "❌ File not found: $STRIPE_FILE"
    exit 1
fi

echo "📋 Step 1: Finding all remaining instances..."
REMAINING=$(grep -n "session, org = session_identity" "$STRIPE_FILE" || echo "")

if [ -z "$REMAINING" ]; then
    echo "   ✅ No remaining instances found!"
    exit 0
fi

echo "   Found instances:"
echo "$REMAINING" | sed 's/^/     /'
echo ""

echo "📋 Step 2: Creating backup..."
cp "$STRIPE_FILE" "${STRIPE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "   ✅ Backup created"
echo ""

echo "🔧 Step 3: Fixing all instances..."
echo ""

# Fix each instance
echo "$REMAINING" | while IFS=: read line_num rest; do
    echo "   Fixing line $line_num..."
    
    # Replace: session, org = session_identity
    # With: session, identity = session_identity
    sed -i "${line_num}s|session, org = session_identity|session, identity = session_identity|" "$STRIPE_FILE"
    
    # Add org = session.get(Organization, identity.org_id) after the unpacking line
    # Check if it's already there
    next_line=$(sed -n "$((line_num+1))p" "$STRIPE_FILE")
    if ! echo "$next_line" | grep -q "org = session.get(Organization"; then
        sed -i "${line_num}a\    org = session.get(Organization, identity.org_id)" "$STRIPE_FILE"
        echo "     ✅ Fixed line $line_num"
    else
        echo "     ✅ Line $line_num already has org retrieval"
    fi
done

echo ""
echo "📋 Step 4: Verifying all fixes..."
echo ""
FIXED=$(grep -n "session, identity = session_identity" "$STRIPE_FILE" || echo "")
REMAINING_CHECK=$(grep -n "session, org = session_identity" "$STRIPE_FILE" || echo "")

if [ -n "$FIXED" ]; then
    echo "   ✅ Fixed instances:"
    echo "$FIXED" | sed 's/^/     /'
fi

if [ -z "$REMAINING_CHECK" ]; then
    echo ""
    echo "   ✅ No remaining instances!"
else
    echo ""
    echo "   ⚠️  Still remaining:"
    echo "$REMAINING_CHECK" | sed 's/^/     /'
fi

echo ""
echo "📋 Step 5: Showing one of the fixed sections..."
FIRST_FIXED=$(echo "$FIXED" | head -1 | cut -d: -f1)
if [ -n "$FIRST_FIXED" ]; then
    echo "   Code around line $FIRST_FIXED:"
    sed -n "$((FIRST_FIXED-2)),$((FIRST_FIXED+3))p" "$STRIPE_FILE" | cat -n | sed 's/^/     /'
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL FIXES APPLIED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now restart the API:"
echo "  docker compose restart api"
echo ""

