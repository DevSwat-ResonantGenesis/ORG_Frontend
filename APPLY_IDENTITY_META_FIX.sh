#!/bin/bash

# Apply fix for Identity.meta AttributeError in logging middleware
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 APPLYING IDENTITY.META FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

LOGGING_FILE="backend/fastapi_app/middleware/logging.py"

if [ ! -f "$LOGGING_FILE" ]; then
    echo "❌ Logging file not found: $LOGGING_FILE"
    exit 1
fi

echo "📝 Step 1: Checking current logging.py code..."
echo ""

# Show the relevant section
echo "   Current identity serialization code:"
grep -A 15 "identity: Optional\[dict\]" "$LOGGING_FILE" 2>/dev/null | head -20 | sed 's/^/     /' || true
echo ""

# Check if there's any .meta access
if grep -q "\.meta\|meta\s*=" "$LOGGING_FILE" 2>/dev/null; then
    echo "   ⚠️  Found .meta usage in logging.py:"
    grep -n "\.meta\|meta\s*=" "$LOGGING_FILE" 2>/dev/null | sed 's/^/     /'
    echo ""
fi

# Check if there's __dict__ or vars() usage that might access .meta
if grep -q "__dict__\|vars(\|dict(" "$LOGGING_FILE" 2>/dev/null | grep -i identity; then
    echo "   ⚠️  Found dict/vars usage with identity:"
    grep -n "__dict__\|vars(\|dict(" "$LOGGING_FILE" 2>/dev/null | grep -i identity | sed 's/^/     /'
    echo ""
fi

echo "🔧 Step 2: Creating backup..."
cp "$LOGGING_FILE" "${LOGGING_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "   ✅ Backup created"
echo ""

echo "🔧 Step 3: Checking if fix is needed..."
echo ""

# The issue is likely that somewhere the code tries to access identity.meta
# or uses __dict__ which tries to access all attributes including .meta

# Check the full file for any problematic patterns
PROBLEMATIC_LINES=$(grep -n "identity.*meta\|identity\.__dict__\|vars(identity\|dict(identity" "$LOGGING_FILE" 2>/dev/null || echo "")

if [ -n "$PROBLEMATIC_LINES" ]; then
    echo "   Found problematic lines:"
    echo "$PROBLEMATIC_LINES" | sed 's/^/     /'
    echo ""
    echo "   🔧 These lines need to be fixed manually"
    echo ""
else
    echo "   ✅ No direct .meta access found in logging.py"
    echo "   The error might be in exception handling or serialization"
    echo ""
fi

echo "📋 Step 4: Recommended fix..."
echo ""
echo "   The Identity serialization in logging.py looks correct."
echo "   However, the error might occur when:"
echo "   1. An exception happens and exception handler tries to serialize Identity"
echo "   2. Some code uses identity.__dict__ which tries to access .meta"
echo "   3. JSON serialization tries to serialize all attributes"
echo ""
echo "   Check for these patterns in the file:"
echo "   - identity.__dict__"
echo "   - vars(identity)"
echo "   - dict(identity)"
echo "   - json.dumps(identity)"
echo "   - Any code that tries to serialize Identity object directly"
echo ""

echo "🔍 Step 5: Searching for all Identity serialization..."
echo ""
grep -n "identity" "$LOGGING_FILE" 2>/dev/null | grep -E "dict|json|serialize|__dict__|vars" | sed 's/^/     /' || echo "     No obvious serialization patterns found"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 MANUAL FIX REQUIRED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The error is in: $LOGGING_FILE"
echo ""
echo "To fix:"
echo ""
echo "1. Open the file:"
echo "   nano $LOGGING_FILE"
echo ""
echo "2. Find any code that accesses identity.meta or uses:"
echo "   - identity.__dict__"
echo "   - vars(identity)"
echo "   - dict(identity)"
echo "   - json.dumps(identity)  # without custom serializer"
echo ""
echo "3. Replace with safe serialization:"
echo "   # Instead of: identity.__dict__"
echo "   # Use:"
echo "   {"
echo "       'user_id': str(identity.user_id) if identity.user_id else None,"
echo "       'org_id': str(identity.org_id),"
echo "       'role': identity.role,"
echo "       'auth_method': identity.auth_method,"
echo "       # Don't include .meta - it doesn't exist"
echo "   }"
echo ""
echo "4. Or use getattr() for safety:"
echo "   getattr(identity, 'meta', None)  # Returns None if meta doesn't exist"
echo ""
echo "5. After fixing, restart API:"
echo "   docker compose restart api"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

