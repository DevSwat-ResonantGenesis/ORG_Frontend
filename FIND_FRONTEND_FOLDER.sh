#!/bin/bash
# Find the exact frontend folder name

echo "🔍 Looking for frontend folder..."
echo ""

# List all directories in /root/
echo "📁 All directories in /root/:"
ls -la /root/ | grep "^d" | awk '{print "   " $9}'
echo ""

# Find folders that might be frontend
echo "🎨 Folders that might be frontend:"
ls -d /root/ResonantGraphAI*Frontend* 2>/dev/null || echo "   No matching folders found"
ls -d /root/*frontend* 2>/dev/null || echo "   No matching folders found"
echo ""

# Check if there's a package.json (indicates frontend)
echo "📦 Checking for frontend indicators (package.json):"
for dir in /root/ResonantGraphAI*Frontend* /root/*frontend*; do
    if [ -f "$dir/package.json" ]; then
        echo "   ✅ Found frontend: $dir (has package.json)"
    fi
done
echo ""

echo "💡 To navigate, use: cd [folder-name]"
echo "   Example: cd ResonantGraphAI_FrontendV0.1-"

