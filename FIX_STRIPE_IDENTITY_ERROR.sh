#!/bin/bash

# Fix Identity.meta error in stripe.py
# The error is: org.meta where org is actually an Identity object

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING STRIPE.PY IDENTITY ERROR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

STRIPE_FILE="backend/fastapi_app/routers/stripe.py"

if [ ! -f "$STRIPE_FILE" ]; then
    echo "❌ File not found: $STRIPE_FILE"
    exit 1
fi

echo "📋 Step 1: Showing problematic code around line 139..."
echo ""
sed -n '130,150p' "$STRIPE_FILE" | cat -n | sed 's/^/     /'
echo ""

echo "📋 Step 2: Checking function signature..."
echo ""
# Find the function that contains line 139
grep -B 10 "def get_subscription" "$STRIPE_FILE" | head -15 | sed 's/^/     /' || true
echo ""

echo "📋 Step 3: Checking what 'org' actually is..."
echo ""
# Check the function parameters and how org is defined
sed -n '/def get_subscription/,/^def \|^async def /p' "$STRIPE_FILE" | head -50 | sed 's/^/     /'
echo ""

echo "🔧 Step 4: Creating backup..."
cp "$STRIPE_FILE" "${STRIPE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "   ✅ Backup created"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 FIX REQUIRED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The error is at line 139 in stripe.py:"
echo "   if not org.meta or not org.meta.get(\"stripe_subscription_id\"):"
echo ""
echo "The problem: 'org' is actually an Identity object, not an Organization object."
echo ""
echo "Fix:"
echo "1. The function parameter is likely named 'org' but is actually 'identity'"
echo "2. You need to get the actual Organization from the database using identity.org_id"
echo "3. Then access org.meta on the Organization object"
echo ""
echo "Example fix:"
echo "   # Instead of:"
echo "   if not org.meta or not org.meta.get(\"stripe_subscription_id\"):"
echo ""
echo "   # Use:"
echo "   # Get organization from database"
echo "   org = session.get(Organization, identity.org_id)"
echo "   if not org or not org.meta or not org.meta.get(\"stripe_subscription_id\"):"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To apply the fix:"
echo "1. Open the file: nano $STRIPE_FILE"
echo "2. Go to line 139 (or search for 'org.meta')"
echo "3. Check the function parameter - is it 'org' or 'identity'?"
echo "4. If it's 'identity', get the Organization from the database"
echo "5. Then use org.meta on the Organization object"
echo ""
echo "After fixing, restart: docker compose restart api"
echo ""

