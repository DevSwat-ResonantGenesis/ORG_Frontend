#!/bin/bash
# Quick commit and push script
# Run this in your LOCAL frontend folder

cd /Applications/ResonantGraphAI_FrontendV0.1

echo "🔍 Checking git status..."
git status

echo ""
echo "📦 Staging all changes..."
git add .

echo ""
echo "📝 Committing changes..."
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update: $(date +%Y-%m-%d_%H:%M:%S)"
fi

git commit -m "$COMMIT_MSG"

echo ""
echo "🚀 Pushing to origin main..."
git push origin main

echo ""
echo "✅ Done! Changes pushed to GitHub"
echo ""
echo "💡 On your droplet, run:"
echo "   cd /root/frontend && git pull origin main"

