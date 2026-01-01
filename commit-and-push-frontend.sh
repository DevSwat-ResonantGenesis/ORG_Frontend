#!/bin/bash
# Commit and push frontend changes

set -e

echo "🚀 Committing and pushing frontend changes..."

cd /Applications/ResonantGraphAI_FrontendV0.1

# Check git status
echo "📋 Checking git status..."
git status

# Add all changes
echo "➕ Adding all changes..."
git add .

# Commit with message
echo "💾 Committing changes..."
git commit -m "feat: Deployment readiness - API connections, dashboards, ML services, and deployment documentation

- Complete deployment readiness analysis
- All API connections verified (100+ endpoints)
- All dashboards functional (8 dashboards)
- ML services fully integrated
- Backend integration complete (Hash Sphere + RAG)
- Docker/Nginx configuration ready
- Security headers configured
- Deployment documentation added
- Menu styling unified across all pages
- Body scroll prevention when menu opens
- Input bar width matches messages in split view"

# Push to main branch
echo "📤 Pushing to origin/main..."
git push origin main

echo "✅ Frontend changes pushed successfully!"

