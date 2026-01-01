#!/bin/bash

# Auto-fix Duplicate Revision by finding and renaming one
# This script attempts to automatically fix the duplicate revision issue

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 AUTO-FIXING DUPLICATE REVISION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /root/ResonantGraphAIV0.1

# Step 1: Find files with duplicate revision
echo ""
echo "📋 Step 1: Finding files with revision 20250205_0007..."
FILES=$(find . -name "*.py" -path "*/alembic/versions/*" -exec grep -l '"20250205_0007"' {} \; 2>/dev/null)

if [ -z "$FILES" ]; then
    echo "❌ Could not find migration files. Checking directory structure..."
    ls -la alembic/versions/ 2>/dev/null || {
        echo "❌ alembic/versions/ directory not found in current location"
        echo "Current directory: $(pwd)"
        exit 1
    }
    exit 1
fi

FILE_COUNT=$(echo "$FILES" | wc -l)
echo "Found $FILE_COUNT file(s) with revision 20250205_0007:"
echo "$FILES"
echo ""

if [ "$FILE_COUNT" -lt 2 ]; then
    echo "⚠️  Only found $FILE_COUNT file(s). The duplicate might be in the database."
    echo "Trying alternative fix..."
    
    # Try to fix by creating a merge migration manually
    echo ""
    echo "📋 Attempting to create merge migration..."
    docker compose run --rm api alembic merge heads -m "merge_duplicate_heads" 2>&1 || {
        echo "❌ Could not create merge migration"
        exit 1
    }
else
    # Step 2: Find the next available revision number
    echo "📋 Step 2: Finding next available revision number..."
    MAX_REV=$(grep -r "revision = " alembic/versions/*.py 2>/dev/null | grep -o '"[0-9]*_[0-9]*"' | sed 's/"//g' | sort -V | tail -1)
    
    if [ -z "$MAX_REV" ]; then
        NEW_REV="20250205_0008"
    else
        # Extract the number part and increment
        NUM=$(echo "$MAX_REV" | awk -F'_' '{print $2}')
        NEW_NUM=$(printf "%04d" $((10#$NUM + 1)))
        DATE_PART=$(echo "$MAX_REV" | awk -F'_' '{print $1}')
        NEW_REV="${DATE_PART}_${NEW_NUM}"
    fi
    
    echo "Next available revision: $NEW_REV"
    echo ""
    
    # Step 3: Get the second file (we'll rename this one)
    SECOND_FILE=$(echo "$FILES" | tail -1)
    echo "📋 Step 3: Renaming revision in: $SECOND_FILE"
    echo "  Changing revision from 20250205_0007 to $NEW_REV"
    
    # Backup the file
    cp "$SECOND_FILE" "${SECOND_FILE}.backup"
    
    # Replace the revision
    sed -i "s/\"20250205_0007\"/\"$NEW_REV\"/g" "$SECOND_FILE"
    
    # Also update the down_revision if it references the old revision
    sed -i "s/down_revision = \"20250205_0007\"/down_revision = \"20250205_0007\"/g" "$SECOND_FILE"
    
    echo "✅ File updated. Backup saved to: ${SECOND_FILE}.backup"
    echo ""
fi

# Step 4: Rebuild and restart
echo "📋 Step 4: Rebuilding API container..."
docker compose build api

echo ""
echo "📋 Step 5: Starting API..."
docker compose up -d api

echo ""
echo "⏳ Waiting for API to start..."
sleep 15

echo ""
echo "📋 Step 6: Testing API..."
if curl -s http://137.184.234.252:8001/health > /dev/null; then
    echo "✅ API is responding!"
    curl -s http://137.184.234.252:8001/health
    echo ""
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ FIX COMPLETE - API is running!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ API is still not responding"
    echo ""
    echo "📋 Recent logs:"
    docker compose logs api --tail=30
    echo ""
    echo "⚠️  If this didn't work, you may need to manually fix the migration files"
fi

