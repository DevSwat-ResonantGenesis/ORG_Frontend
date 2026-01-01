#!/bin/bash
# Auto commit and push - for nginx-spa.conf updates
# Run this in your LOCAL frontend folder

cd /Applications/ResonantGraphAI_FrontendV0.1

# Check if nginx-spa.conf has changes
if git diff --quiet nginx-spa.conf; then
    echo "✅ nginx-spa.conf has no changes"
else
    echo "📦 Staging nginx-spa.conf..."
    git add nginx-spa.conf
    
    echo "📝 Committing..."
    git commit -m "Update nginx config: API proxy and routing fixes"
    
    echo "🚀 Pushing to origin main..."
    git push origin main
    
    echo "✅ Done! nginx-spa.conf pushed to GitHub"
    echo ""
    echo "💡 On your droplet, run:"
    echo "   cd /root/frontend && git pull origin main"
fi

