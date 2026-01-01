#!/bin/bash
# Commit and push nginx-spa.conf fix
# Run this in your LOCAL frontend folder

cd /Applications/ResonantGraphAI_FrontendV0.1

echo "🔍 Checking git status..."
git status

echo ""
echo "📦 Staging nginx-spa.conf..."
git add nginx-spa.conf

echo ""
echo "📝 Committing changes..."
git commit -m "Fix nginx config: Add API proxy for /api routes to backend on port 8001"

echo ""
echo "🚀 Pushing to origin main..."
git push origin main

echo ""
echo "✅ Done! Now on your droplet, run:"
echo "   cd /root/frontend && git pull origin main"

