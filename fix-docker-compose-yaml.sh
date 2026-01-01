#!/bin/bash
# Fix YAML syntax error in docker-compose.yml
# Run this ON YOUR DROPLET

set -e

echo "🔧 Fixing YAML syntax error in docker-compose.yml..."
echo ""

cd /root/ResonantGraphAIV0.1

# Check YAML syntax
echo "📋 Checking YAML syntax..."
if command -v docker &> /dev/null; then
    docker compose config > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ YAML syntax is valid"
    else
        echo "❌ YAML syntax error found"
        echo ""
        echo "📋 Error details:"
        docker compose config 2>&1 | head -20
    fi
fi
echo ""

# Show line 50 and surrounding lines
echo "📋 Line 50 and surrounding context:"
sed -n '45,55p' docker-compose.yml
echo ""

echo "✅ Check complete!"
echo ""
echo "💡 Common YAML errors:"
echo "  - Missing colon after key"
echo "  - Wrong indentation (must use spaces, not tabs)"
echo "  - Missing quotes around values with special characters"
echo "  - Trailing spaces or tabs"

