#!/bin/bash
# Script to check line 50 of docker-compose.yml
# Run this ON YOUR DROPLET

cd /root/ResonantGraphAIV0.1

echo "🔍 Checking line 50 of docker-compose.yml..."
echo ""
echo "=== Line 50 ==="
sed -n '50p' docker-compose.yml | cat -A
echo ""
echo "=== Context (lines 45-55) ==="
sed -n '45,55p' docker-compose.yml
echo ""
echo "=== Checking for common issues ==="
echo ""

# Check for tabs
if sed -n '50p' docker-compose.yml | grep -q $'\t'; then
    echo "❌ FOUND TAB CHARACTER on line 50!"
    echo "   YAML requires spaces, not tabs"
else
    echo "✅ No tabs found"
fi

# Check indentation
INDENT=$(sed -n '50p' docker-compose.yml | sed 's/[^ ].*//' | wc -c)
echo "📏 Indentation: $((INDENT-1)) spaces"

# Check if line is empty or has issues
LINE_CONTENT=$(sed -n '50p' docker-compose.yml)
if [ -z "$LINE_CONTENT" ]; then
    echo "⚠️  Line 50 is EMPTY - this might be the issue!"
elif [[ "$LINE_CONTENT" =~ ^[[:space:]]*$ ]]; then
    echo "⚠️  Line 50 is WHITESPACE ONLY - might cause issues"
fi

echo ""
echo "=== Full YAML validation ==="
docker compose config 2>&1 | head -20

