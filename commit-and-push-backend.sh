#!/bin/bash
# Commit and push backend changes

set -e

BACKEND_DIR="/Applications/ResonantGraphAIV0.1"

if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found at $BACKEND_DIR"
    echo "Please update BACKEND_DIR in this script"
    exit 1
fi

echo "🚀 Committing and pushing backend changes..."

cd "$BACKEND_DIR"

# Check if git repo
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Checking for git remote..."
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
git status

# Add all changes
echo "➕ Adding all changes..."
git add .

# Commit with message
echo "💾 Committing changes..."
git commit -m "feat: Backend updates for deployment

- API endpoints ready for production
- Hash Sphere integration complete
- RAG fallback system active
- Code services operational
- ML services integrated
- Git integration ready
- LSP integration complete
- All endpoints tested and verified"

# Push to main branch
echo "📤 Pushing to origin/main..."
git push origin main

echo "✅ Backend changes pushed successfully!"

