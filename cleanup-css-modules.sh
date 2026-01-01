#!/bin/bash
# CSS Module Cleanup Script
# Finds duplicates and issues in all CSS modules

echo "🔍 Analyzing CSS Modules..."
echo ""

# Find all CSS modules
MODULES=$(find src/components/IDE -name "*.module.css" -type f | sort)

echo "Found $(echo "$MODULES" | wc -l | tr -d ' ') CSS modules"
echo ""

# Check for duplicates
echo "📋 Checking for duplicate rules..."
for file in $MODULES; do
    echo "Checking: $file"
    # Find duplicate class names
    duplicates=$(grep -E "^\.|^\[data-theme" "$file" | sort | uniq -d)
    if [ ! -z "$duplicates" ]; then
        echo "  ⚠️  Duplicates found:"
        echo "$duplicates" | sed 's/^/    /'
    fi
done

echo ""
echo "✅ Analysis complete"

