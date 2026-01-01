#!/bin/bash
# Check docker-compose.yml structure
# Run this ON YOUR DROPLET

cd /root/ResonantGraphAIV0.1

echo "🔍 Checking docker-compose.yml structure..."
echo ""

# Check if file exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml NOT FOUND in current directory!"
    echo ""
    echo "📁 Current directory: $(pwd)"
    echo ""
    echo "🔍 Searching for docker-compose.yml..."
    find /root -name "docker-compose.yml" -type f 2>/dev/null
    echo ""
    echo "💡 You might need to:"
    echo "   cd /root/ResonantGraphAIV0.1  # if backend folder"
    echo "   OR"
    echo "   cd /root/frontend  # if frontend folder"
    exit 1
fi

echo "✅ Found docker-compose.yml in: $(pwd)"
echo ""
echo "📋 Showing services structure:"
echo "---"
grep -n "^[a-z].*:" docker-compose.yml | head -10
echo "---"
echo ""
echo "📋 Lines 40-60 (showing the problem area):"
echo "---"
sed -n '40,60p' docker-compose.yml
echo "---"
echo ""
echo "🔍 Checking indentation of 'frontend:' service:"
FRONTEND_LINE=$(grep -n "^  frontend:" docker-compose.yml || grep -n "^frontend:" docker-compose.yml)
if [ -z "$FRONTEND_LINE" ]; then
    echo "❌ 'frontend:' service not found!"
else
    echo "$FRONTEND_LINE"
    echo ""
    if echo "$FRONTEND_LINE" | grep -q "^  frontend:"; then
        echo "❌ PROBLEM: 'frontend:' has 2 spaces (nested inside another service)"
        echo "   Should have 0 spaces (at root level)"
    elif echo "$FRONTEND_LINE" | grep -q "^frontend:"; then
        echo "✅ 'frontend:' is at root level (correct)"
    fi
fi

