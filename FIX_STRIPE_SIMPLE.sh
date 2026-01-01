#!/bin/bash

# Simple fix for stripe.py Identity error
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING STRIPE.PY - SIMPLE VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

STRIPE_FILE="backend/fastapi_app/routers/stripe.py"

if [ ! -f "$STRIPE_FILE" ]; then
    echo "❌ File not found: $STRIPE_FILE"
    exit 1
fi

echo "📋 Step 1: Creating backup..."
cp "$STRIPE_FILE" "${STRIPE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "   ✅ Backup created"
echo ""

echo "📋 Step 2: Finding problematic line..."
SESSION_ORG_LINE=$(grep -n "session, org = session_identity" "$STRIPE_FILE" | cut -d: -f1 | head -1)

if [ -z "$SESSION_ORG_LINE" ]; then
    echo "   ❌ Could not find 'session, org = session_identity'"
    echo "   Showing lines around 139:"
    sed -n '135,145p' "$STRIPE_FILE" | cat -n
    exit 1
fi

echo "   Found at line: $SESSION_ORG_LINE"
echo ""

echo "📋 Step 3: Showing current code..."
echo ""
sed -n "$((SESSION_ORG_LINE-2)),$((SESSION_ORG_LINE+5))p" "$STRIPE_FILE" | cat -n | sed 's/^/     /'
echo ""

echo "🔧 Step 4: Applying fix..."
echo ""

# Use sed to fix the line
# Replace: session, org = session_identity
# With: session, identity = session_identity
sed -i "${SESSION_ORG_LINE}s/session, org = session_identity/session, identity = session_identity/" "$STRIPE_FILE"

# Add org = session.get(Organization, identity.org_id) after the unpacking line
sed -i "${SESSION_ORG_LINE}a\    org = session.get(Organization, identity.org_id)" "$STRIPE_FILE"

echo "   ✅ Fix applied!"
echo ""

echo "📋 Step 5: Showing updated code..."
echo ""
sed -n "$((SESSION_ORG_LINE-2)),$((SESSION_ORG_LINE+6))p" "$STRIPE_FILE" | cat -n | sed 's/^/     /'
echo ""

echo "📋 Step 6: Verifying Organization import..."
if grep -q "from ..models import Organization" "$STRIPE_FILE"; then
    echo "   ✅ Organization already imported"
else
    echo "   ⚠️  Organization not imported, checking imports..."
    # Find last import line
    LAST_IMPORT=$(grep -n "^from\|^import" "$STRIPE_FILE" | tail -1 | cut -d: -f1)
    if [ -n "$LAST_IMPORT" ]; then
        # Check if there's a models import
        if grep -q "from ..models import" "$STRIPE_FILE"; then
            # Add Organization to existing import
            sed -i '/from ..models import/s/$/, Organization/' "$STRIPE_FILE"
            echo "   ✅ Added Organization to existing import"
        else
            # Add new import line
            sed -i "${LAST_IMPORT}a from ..models import Organization" "$STRIPE_FILE"
            echo "   ✅ Added Organization import"
        fi
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Changes made:"
echo "1. Changed: session, org = session_identity"
echo "   To: session, identity = session_identity"
echo ""
echo "2. Added: org = session.get(Organization, identity.org_id)"
echo ""
echo "3. Verified Organization import"
echo ""
echo "Now restart the API:"
echo "  docker compose restart api"
echo ""

