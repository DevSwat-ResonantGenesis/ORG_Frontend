#!/bin/bash

# Fix Backend Identity.meta AttributeError
# This script finds and fixes the backend code error

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING BACKEND IDENTITY.META ERROR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find backend directory
if [ -d "/root/ResonantGraphAIV0.1" ]; then
    BACKEND_DIR="/root/ResonantGraphAIV0.1"
elif [ -d "/root/resonant-backend" ]; then
    BACKEND_DIR="/root/resonant-backend"
else
    BACKEND_DIR=$(find /root -name "docker-compose.yml" -type f 2>/dev/null | grep -v frontend | head -1 | xargs dirname)
    if [ -z "$BACKEND_DIR" ]; then
        echo "❌ Backend directory not found!"
        exit 1
    fi
fi

cd "$BACKEND_DIR"
echo "📁 Backend directory: $BACKEND_DIR"
echo ""

# Step 1: Find files with Identity.meta
echo "🔍 Step 1: Searching for Identity.meta usage..."
echo ""

FILES_WITH_ERROR=$(grep -r "\.meta" backend/fastapi_app/ --include="*.py" 2>/dev/null | grep -i "identity\|meta" | cut -d: -f1 | sort -u || echo "")

if [ -z "$FILES_WITH_ERROR" ]; then
    # Try broader search
    FILES_WITH_ERROR=$(grep -r "identity" backend/fastapi_app/ --include="*.py" 2>/dev/null | grep -i "meta" | cut -d: -f1 | sort -u || echo "")
fi

if [ -z "$FILES_WITH_ERROR" ]; then
    echo "   ⚠️  Could not find Identity.meta in code"
    echo "   Searching in all Python files..."
    FILES_WITH_ERROR=$(find backend/fastapi_app -name "*.py" -exec grep -l "\.meta" {} \; 2>/dev/null || echo "")
fi

if [ -n "$FILES_WITH_ERROR" ]; then
    echo "   Found files with .meta:"
    echo "$FILES_WITH_ERROR" | sed 's/^/     - /'
    echo ""
    
    # Show the problematic lines
    echo "   Problematic code:"
    for file in $FILES_WITH_ERROR; do
        echo "     File: $file"
        grep -n "\.meta" "$file" 2>/dev/null | head -5 | sed 's/^/       /' || true
        echo ""
    done
else
    echo "   ⚠️  No files found with .meta"
    echo "   The error might be in a different location"
    echo ""
fi

# Step 2: Check middleware files
echo "🔍 Step 2: Checking middleware files..."
MIDDLEWARE_FILES=$(find backend/fastapi_app -name "*middleware*.py" -o -name "*auth*.py" 2>/dev/null | head -10 || echo "")

if [ -n "$MIDDLEWARE_FILES" ]; then
    echo "   Found middleware/auth files:"
    echo "$MIDDLEWARE_FILES" | sed 's/^/     - /'
    echo ""
    
    # Check these files for Identity usage
    for file in $MIDDLEWARE_FILES; do
        if grep -q "Identity\|identity" "$file" 2>/dev/null; then
            echo "     Checking: $file"
            grep -n "Identity\|identity" "$file" 2>/dev/null | head -10 | sed 's/^/       /' || true
            echo ""
        fi
    done
fi

# Step 3: Check what Identity object actually has
echo "🔍 Step 3: Checking Identity class definition..."
IDENTITY_CLASS=$(grep -r "class Identity" backend/fastapi_app/ --include="*.py" 2>/dev/null | head -1 || echo "")

if [ -n "$IDENTITY_CLASS" ]; then
    echo "   Found Identity class:"
    echo "   $IDENTITY_CLASS"
    echo ""
    
    IDENTITY_FILE=$(echo "$IDENTITY_CLASS" | cut -d: -f1)
    echo "   Showing Identity class definition:"
    grep -A 20 "class Identity" "$IDENTITY_FILE" 2>/dev/null | head -25 | sed 's/^/     /' || true
    echo ""
fi

# Step 4: Create fix
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIX RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$FILES_WITH_ERROR" ]; then
    echo "📝 Files that need fixing:"
    echo "$FILES_WITH_ERROR" | sed 's/^/   - /'
    echo ""
    echo "🔧 Fix options:"
    echo ""
    echo "   1. Remove .meta access if not needed:"
    echo "      # Find: identity.meta"
    echo "      # Replace with: # identity.meta (removed - not available)"
    echo ""
    echo "   2. Use correct attribute:"
    echo "      # Check Identity class for available attributes"
    echo "      # Replace identity.meta with correct attribute"
    echo ""
    echo "   3. Add safety check:"
    echo "      # Find: identity.meta"
    echo "      # Replace with:"
    echo "      # if hasattr(identity, 'meta'):"
    echo "      #     identity.meta"
    echo "      # else:"
    echo "      #     None  # or appropriate default"
    echo ""
else
    echo "⚠️  Could not locate the exact file with the error"
    echo ""
    echo "   The error occurs at runtime, so it might be:"
    echo "   - In imported code"
    echo "   - In a library/dependency"
    echo "   - In dynamically accessed code"
    echo ""
    echo "   Check backend logs for the full stack trace:"
    echo "   cd $BACKEND_DIR && docker compose logs api --tail 100 | grep -A 20 'AttributeError'"
    echo ""
fi

echo "📋 Manual Fix Steps:"
echo ""
echo "1. Check the full stack trace:"
echo "   cd $BACKEND_DIR"
echo "   docker compose logs api --tail 100 | grep -A 30 'AttributeError'"
echo ""
echo "2. Find the exact file and line from the stack trace"
echo ""
echo "3. Edit the file and fix the .meta access"
echo ""
echo "4. Restart the API:"
echo "   docker compose restart api"
echo ""
echo "5. Test:"
echo "   curl http://137.184.234.252:8001/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

