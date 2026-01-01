#!/bin/bash

# Fix Identity.meta AttributeError - Find exact location and fix it
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING IDENTITY.META ERROR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

# Step 1: Get full stack trace to find exact location
echo "📋 Step 1: Getting full error stack trace..."
echo ""
FULL_TRACE=$(docker compose logs api --tail 200 2>/dev/null | grep -A 40 "AttributeError.*meta" | head -50 || echo "")

if [ -n "$FULL_TRACE" ]; then
    echo "$FULL_TRACE"
    echo ""
    
    # Extract file path from trace
    ERROR_FILE=$(echo "$FULL_TRACE" | grep -oP 'File ".*?\.py", line \d+' | head -1 | sed 's/File "//' | sed 's/", line.*//' | sed 's|/app/||' || echo "")
    
    if [ -n "$ERROR_FILE" ]; then
        ERROR_FILE_PATH="backend/fastapi_app/$ERROR_FILE"
        echo "   🔍 Error likely in: $ERROR_FILE_PATH"
        echo ""
    fi
else
    echo "   ⚠️  No recent AttributeError in logs"
    echo ""
fi

# Step 2: Search for identity.meta (not user.meta or org.meta)
echo "🔍 Step 2: Searching for identity.meta usage..."
echo ""
IDENTITY_META_FILES=$(grep -r "identity\.meta\|identity\[.meta" backend/fastapi_app/ --include="*.py" 2>/dev/null | cut -d: -f1 | sort -u || echo "")

if [ -n "$IDENTITY_META_FILES" ]; then
    echo "   Found identity.meta in:"
    echo "$IDENTITY_META_FILES" | sed 's/^/     - /'
    echo ""
    
    for file in $IDENTITY_META_FILES; do
        echo "   File: $file"
        grep -n "identity\.meta\|identity\[.meta" "$file" 2>/dev/null | sed 's/^/     /' || true
        echo ""
    done
else
    echo "   ⚠️  No direct identity.meta found"
    echo "   Checking middleware and logging code..."
    echo ""
fi

# Step 3: Check middleware files
echo "🔍 Step 3: Checking middleware for Identity serialization..."
MIDDLEWARE_FILES=$(find backend/fastapi_app -name "*middleware*.py" -o -name "*logging*.py" -o -name "*log*.py" 2>/dev/null | head -10 || echo "")

if [ -n "$MIDDLEWARE_FILES" ]; then
    for file in $MIDDLEWARE_FILES; do
        if grep -q "Identity\|identity" "$file" 2>/dev/null; then
            echo "   Checking: $file"
            grep -n "identity\|Identity" "$file" 2>/dev/null | grep -i "meta\|dict\|json\|serialize" | head -10 | sed 's/^/     /' || true
            echo ""
        fi
    done
fi

# Step 4: Check main.py and config for logging
echo "🔍 Step 4: Checking main.py and config for Identity handling..."
if [ -f "backend/fastapi_app/main.py" ]; then
    echo "   Checking main.py for Identity usage..."
    grep -n "Identity\|identity" backend/fastapi_app/main.py 2>/dev/null | head -20 | sed 's/^/     /' || true
    echo ""
fi

# Step 5: Check if there's a __dict__ or serialization attempt
echo "🔍 Step 5: Searching for Identity serialization attempts..."
SERIALIZE_ATTEMPTS=$(grep -r "identity.*dict\|identity.*json\|identity.*meta\|Identity.*dict\|Identity.*json\|Identity.*meta" backend/fastapi_app/ --include="*.py" 2>/dev/null | grep -v "user.meta\|org.meta\|entry.meta" | head -20 || echo "")

if [ -n "$SERIALIZE_ATTEMPTS" ]; then
    echo "   Found potential serialization attempts:"
    echo "$SERIALIZE_ATTEMPTS" | sed 's/^/     /'
    echo ""
fi

# Step 6: Create fix
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 APPLYING FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Most likely location: logging/middleware trying to serialize Identity
# Check config.py or middleware files for logging that tries to access .meta

CONFIG_FILE="backend/fastapi_app/config.py"
MIDDLEWARE_DIR="backend/fastapi_app/middleware"

if [ -f "$CONFIG_FILE" ]; then
    echo "   Checking config.py for Identity logging..."
    if grep -q "identity\|Identity" "$CONFIG_FILE" 2>/dev/null; then
        echo "   ⚠️  Found Identity usage in config.py"
        echo "   Review this file for .meta access"
        echo ""
    fi
fi

if [ -d "$MIDDLEWARE_DIR" ]; then
    echo "   Checking middleware directory..."
    for file in "$MIDDLEWARE_DIR"/*.py; do
        if [ -f "$file" ]; then
            if grep -q "identity\|Identity" "$file" 2>/dev/null; then
                echo "   Checking: $file"
                grep -n "identity\|Identity" "$file" 2>/dev/null | head -10 | sed 's/^/     /' || true
                echo ""
            fi
        fi
    done
fi

echo "📝 FIX INSTRUCTIONS:"
echo ""
echo "The Identity class does NOT have a 'meta' attribute."
echo "It only has: user_id, org_id, role, scopes, api_key_id, auth_method"
echo ""
echo "Find the code that's trying to access identity.meta and either:"
echo ""
echo "1. Remove the .meta access if not needed"
echo "2. Use getattr() for safety: getattr(identity, 'meta', None)"
echo "3. If you need metadata, store it elsewhere (not on Identity)"
echo ""
echo "Most likely location: Logging/middleware code that serializes Identity"
echo ""
echo "To find the exact line, check the stack trace above or run:"
echo "  docker compose logs api --tail 200 | grep -A 40 'AttributeError'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

