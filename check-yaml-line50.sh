#!/bin/bash
# Check and fix YAML error on line 50
# Run this ON YOUR DROPLET

set -e

cd /root/ResonantGraphAIV0.1

echo "🔍 Checking YAML error on line 50..."
echo ""

# Show line 50 and context
echo "📋 Line 50 and surrounding context:"
echo "---"
sed -n '45,55p' docker-compose.yml
echo "---"
echo ""

# Check what's on line 50
echo "📋 Line 50 specifically:"
sed -n '50p' docker-compose.yml | cat -A
echo ""

# Check for common issues
echo "🔍 Checking for common issues:"
echo ""

# Check for tabs
if sed -n '50p' docker-compose.yml | grep -q $'\t'; then
    echo "❌ Found TAB character on line 50 (should use spaces)"
fi

# Check for missing colon
if sed -n '50p' docker-compose.yml | grep -q '^[^:]*$' && ! sed -n '50p' docker-compose.yml | grep -q '^[[:space:]]*-'; then
    echo "⚠️  Line 50 might be missing a colon"
fi

# Check indentation
INDENT=$(sed -n '50p' docker-compose.yml | sed 's/[^ ].*//' | wc -c)
echo "📏 Indentation on line 50: $((INDENT-1)) spaces"

# Show previous line for context
echo ""
echo "📋 Previous line (49):"
sed -n '49p' docker-compose.yml | cat -A
echo ""

echo "✅ Check complete!"
echo ""
echo "💡 To fix:"
echo "  1. Edit: nano docker-compose.yml"
echo "  2. Go to line 50: Ctrl+_ then type 50"
echo "  3. Fix the syntax error"
echo "  4. Save: Ctrl+X, Y, Enter"

