#!/bin/bash
# Script to find frontend folder on Droplet
# Run this on your Droplet to find the correct path

echo "🔍 Searching for frontend folder..."
echo ""

# Common locations to check
PATHS=(
    "/var/www"
    "/home"
    "/opt"
    "/usr/share/nginx/html"
    "/root"
    "$HOME"
)

for base_path in "${PATHS[@]}"; do
    if [ -d "$base_path" ]; then
        echo "Checking: $base_path"
        find "$base_path" -maxdepth 3 -type d -name "*frontend*" -o -name "*ResonantGraph*" -o -name "*resonantgraph*" 2>/dev/null | head -10
        echo ""
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Or check these common locations manually:"
echo ""
echo "  ls -la /var/www/"
echo "  ls -la /home/"
echo "  ls -la /opt/"
echo "  ls -la ~/"
echo "  pwd  # (if you're already in the folder)"
echo ""
echo "💡 Tip: Look for a folder containing:"
echo "   • package.json"
echo "   • src/ folder"
echo "   • dist/ folder (after build)"
echo "   • .git/ folder"
echo ""

