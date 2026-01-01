#!/bin/bash
# Check what needs to be committed and pushed
# Run this in your LOCAL frontend folder

cd /Applications/ResonantGraphAI_FrontendV0.1

echo "🔍 Checking git status..."
echo ""
git status

echo ""
echo "📋 Files that should be committed:"
echo "   ✅ nginx-spa.conf - Updated with API proxy and backend connection fix"
echo ""
echo "💡 To commit and push:"
echo "   git add nginx-spa.conf"
echo "   git commit -m 'Fix nginx: Add API proxy with /api prefix stripping and backend connection'"
echo "   git push origin main"

