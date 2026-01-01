#!/bin/bash

# Find exact location of Identity.meta error
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 FINDING EXACT ERROR LOCATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

# Step 1: Show full logging.py file
echo "📋 Step 1: Full logging.py file content..."
echo ""
cat backend/fastapi_app/middleware/logging.py
echo ""

# Step 2: Check for any JSON serialization or dict conversion
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Step 2: Searching for serialization patterns..."
echo ""

# Check for json.dumps, json.loads
grep -n "json\." backend/fastapi_app/middleware/logging.py 2>/dev/null | sed 's/^/     /' || echo "     No json.* usage found"

# Check for any dict() conversion
grep -n "dict(" backend/fastapi_app/middleware/logging.py 2>/dev/null | sed 's/^/     /' || echo "     No dict() usage found"

# Check for __dict__
grep -n "__dict__" backend/fastapi_app/middleware/logging.py 2>/dev/null | sed 's/^/     /' || echo "     No __dict__ usage found"

# Check for vars()
grep -n "vars(" backend/fastapi_app/middleware/logging.py 2>/dev/null | sed 's/^/     /' || echo "     No vars() usage found"

echo ""

# Step 3: Check exception handlers
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Step 3: Checking exception handling..."
echo ""

grep -n -A 10 "except\|Exception\|Error" backend/fastapi_app/middleware/logging.py 2>/dev/null | head -30 | sed 's/^/     /' || echo "     No exception handlers found"

echo ""

# Step 4: Check if Identity is being passed to any function that might serialize it
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Step 4: Checking Identity usage patterns..."
echo ""

# Show all lines with identity
grep -n "identity" backend/fastapi_app/middleware/logging.py 2>/dev/null | sed 's/^/     /' || echo "     No identity usage found"

echo ""

# Step 5: Check observability service (from stack trace)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Step 5: Checking observability service..."
echo ""

OBSERVABILITY_FILE="backend/fastapi_app/services/observability.py"
if [ -f "$OBSERVABILITY_FILE" ]; then
    echo "   Checking observability.py for Identity serialization..."
    grep -n "identity\|Identity" "$OBSERVABILITY_FILE" 2>/dev/null | head -20 | sed 's/^/     /' || echo "     No Identity usage found"
    
    # Check for .meta access
    if grep -q "\.meta\|meta\s*=" "$OBSERVABILITY_FILE" 2>/dev/null; then
        echo ""
        echo "   ⚠️  Found .meta usage in observability.py:"
        grep -n "\.meta\|meta\s*=" "$OBSERVABILITY_FILE" 2>/dev/null | sed 's/^/     /'
    fi
    
    # Check for serialization
    if grep -q "__dict__\|vars(\|dict(\|json\." "$OBSERVABILITY_FILE" 2>/dev/null; then
        echo ""
        echo "   ⚠️  Found serialization patterns:"
        grep -n "__dict__\|vars(\|dict(\|json\." "$OBSERVABILITY_FILE" 2>/dev/null | sed 's/^/     /'
    fi
else
    echo "   ⚠️  observability.py not found"
fi

echo ""

# Step 6: Get the actual error from recent logs
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Step 6: Getting actual error stack trace..."
echo ""

docker compose logs api --tail 500 2>/dev/null | grep -B 20 -A 20 "AttributeError.*meta" | head -60 | sed 's/^/     /' || echo "     No recent AttributeError found"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

