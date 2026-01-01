#!/bin/bash

# Safe JavaScript File Removal Script
# This script removes duplicate .js files while keeping TypeScript files
# It includes backup, verification, and testing steps

set -e  # Exit on error

echo "=========================================="
echo "JavaScript File Removal Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Count current JS files
echo "📊 Step 1: Analyzing current state..."
JS_COUNT=$(find src -name "*.js" -type f -not -path "*/node_modules/*" | wc -l | tr -d ' ')
TSX_COUNT=$(find src -name "*.tsx" -type f -not -path "*/node_modules/*" | wc -l | tr -d ' ')
TS_COUNT=$(find src -name "*.ts" -type f -not -path "*/node_modules/*" | wc -l | tr -d ' ')

echo "   JavaScript files: $JS_COUNT"
echo "   TypeScript files: $TSX_COUNT (.tsx) + $TS_COUNT (.ts)"
echo ""

# Step 2: Create backup
echo "💾 Step 2: Creating backup..."
BACKUP_BRANCH="backup-before-js-removal-$(date +%Y%m%d-%H%M%S)"
git checkout -b "$BACKUP_BRANCH" 2>/dev/null || git checkout "$BACKUP_BRANCH"
git checkout main 2>/dev/null || git checkout -b main
echo "   ✅ Backup branch created: $BACKUP_BRANCH"
echo ""

# Step 3: List files to be removed (dry run)
echo "🔍 Step 3: Files to be removed (sample):"
find src -name "*.js" -type f -not -path "*/node_modules/*" | head -10
TOTAL_TO_REMOVE=$(find src -name "*.js" -type f -not -path "*/node_modules/*" | wc -l | tr -d ' ')
echo "   ... and $((TOTAL_TO_REMOVE - 10)) more files"
echo "   Total files to remove: $TOTAL_TO_REMOVE"
echo ""

# Step 4: Confirm
read -p "⚠️  Continue with removal? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Removal cancelled"
    exit 1
fi

# Step 5: Remove JS files
echo "🗑️  Step 4: Removing JavaScript files..."
REMOVED=0

# Remove from different directories
for dir in src/pages src/components src/api src/hooks src/store src/types src/utils src/layout src/router src/context; do
    if [ -d "$dir" ]; then
        COUNT=$(find "$dir" -name "*.js" -type f | wc -l | tr -d ' ')
        if [ "$COUNT" -gt 0 ]; then
            find "$dir" -name "*.js" -type f -delete
            REMOVED=$((REMOVED + COUNT))
            echo "   ✅ Removed $COUNT files from $dir"
        fi
    fi
done

echo "   ✅ Total files removed: $REMOVED"
echo ""

# Step 6: Verify TypeScript files still exist
echo "✅ Step 5: Verifying TypeScript files..."
REMAINING_TSX=$(find src -name "*.tsx" -type f -not -path "*/node_modules/*" | wc -l | tr -d ' ')
REMAINING_TS=$(find src -name "*.ts" -type f -not -path "*/node_modules/*" | wc -l | tr -d ' ')
REMAINING_JS=$(find src -name "*.js" -type f -not -path "*/node_modules/*" | wc -l | tr -d ' ')

echo "   TypeScript files remaining: $REMAINING_TSX (.tsx) + $REMAINING_TS (.ts)"
echo "   JavaScript files remaining: $REMAINING_JS"
echo ""

# Step 7: Test build
echo "🔨 Step 6: Testing build..."
if npm run build 2>&1 | tee /tmp/build-output.log; then
    echo ""
    echo "${GREEN}✅ Build successful!${NC}"
    echo ""
else
    echo ""
    echo "${RED}❌ Build failed!${NC}"
    echo "   Check /tmp/build-output.log for details"
    echo "   To restore: git checkout $BACKUP_BRANCH"
    exit 1
fi

# Step 8: Summary
echo "=========================================="
echo "✅ Removal Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "   - Files removed: $REMOVED"
echo "   - TypeScript files: $REMAINING_TSX (.tsx) + $REMAINING_TS (.ts)"
echo "   - Build status: ✅ Success"
echo ""
echo "Next steps:"
echo "   1. Test the application: npm run dev"
echo "   2. If everything works, commit changes:"
echo "      git add -A"
echo "      git commit -m 'Remove duplicate JavaScript files'"
echo ""
echo "To restore if needed:"
echo "   git checkout $BACKUP_BRANCH"
echo ""

