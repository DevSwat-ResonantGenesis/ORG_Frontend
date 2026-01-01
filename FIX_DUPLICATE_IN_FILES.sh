#!/bin/bash

# Fix Duplicate Revision in Migration Files
# This script finds and fixes the duplicate revision 20250205_0007 in the backend repo

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 FINDING DUPLICATE REVISION IN FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /root/ResonantGraphAIV0.1

# Step 1: Find all files with the duplicate revision
echo ""
echo "📋 Step 1: Searching for files with revision 20250205_0007..."
DUPLICATE_FILES=$(find . -name "*.py" -path "*/alembic/versions/*" -exec grep -l "20250205_0007" {} \; 2>/dev/null || true)

if [ -z "$DUPLICATE_FILES" ]; then
    echo "⚠️  Could not find migration files. Checking if alembic directory exists..."
    ls -la alembic/versions/ 2>/dev/null || echo "❌ alembic/versions/ directory not found"
    exit 1
fi

echo "Found files with revision 20250205_0007:"
echo "$DUPLICATE_FILES"
echo ""

# Step 2: List all revisions to see the conflict
echo "📋 Step 2: Listing all revision numbers..."
grep -r "revision = " alembic/versions/*.py 2>/dev/null | sort || echo "⚠️  Could not list revisions"

echo ""
echo "📋 Step 3: Checking for duplicate revision numbers..."
DUPLICATES=$(grep -r "revision = " alembic/versions/*.py 2>/dev/null | awk -F'"' '{print $2}' | sort | uniq -d || true)

if [ -z "$DUPLICATES" ]; then
    echo "⚠️  No duplicates found in file content. The issue might be in the database."
    echo "Trying to fix via database instead..."
    
    # Try to access the database directly
    echo ""
    echo "📋 Attempting to fix via database..."
    docker compose exec -T db psql -U postgres -d resonant -c "SELECT * FROM alembic_version;" 2>/dev/null || echo "⚠️  Could not access database"
    
    exit 1
fi

echo "Duplicate revisions found: $DUPLICATES"
echo ""

# Step 3: Show the files
echo "📋 Step 4: Files with duplicate revisions:"
for rev in $DUPLICATES; do
    echo "  Revision: $rev"
    grep -r "revision = \"$rev\"" alembic/versions/*.py | while read line; do
        FILE=$(echo "$line" | cut -d: -f1)
        echo "    - $FILE"
    done
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  MANUAL FIX REQUIRED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need to manually fix the duplicate revision."
echo ""
echo "Option 1: Remove one of the duplicate files (if it's truly a duplicate)"
echo "Option 2: Rename one revision to a new number"
echo ""
echo "To view the files:"
echo "  cat alembic/versions/[filename].py"
echo ""
echo "To edit a file:"
echo "  nano alembic/versions/[filename].py"
echo "  # Change: revision = \"20250205_0007\""
echo "  # To:     revision = \"20250205_0008\""
echo ""
echo "After fixing, run:"
echo "  docker compose restart api"
echo "  sleep 10"
echo "  curl http://137.184.234.252:8001/health"
echo ""

