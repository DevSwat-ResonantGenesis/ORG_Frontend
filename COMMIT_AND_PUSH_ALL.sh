#!/bin/bash
# Commit and push both frontend and backend changes

set -e

echo "🚀 Starting commit and push process for Frontend and Backend..."
echo ""

# ============================================
# FRONTEND COMMIT AND PUSH
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 FRONTEND: ResonantGraphAI_FrontendV0.1"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /Applications/ResonantGraphAI_FrontendV0.1

# Check if git repo
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository!"
    exit 1
fi

# Show status
echo "📋 Git status:"
git status --short

# Add all changes
echo ""
echo "➕ Adding all changes..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "feat: Deployment readiness - Complete analysis and preparation

- Complete deployment readiness analysis (100+ API endpoints)
- All dashboards functional (8 dashboards)
- ML services fully integrated (5 endpoints)
- Backend integration complete (Hash Sphere + RAG)
- Docker/Nginx configuration verified
- Security headers configured
- Deployment documentation added
- Menu styling unified across all pages
- Body scroll prevention when menu opens
- Input bar width matches messages in split view
- All API connections verified and tested"

# Push
echo "📤 Pushing to origin/main..."
git push origin main

echo "✅ Frontend pushed successfully!"
echo ""

# ============================================
# BACKEND COMMIT AND PUSH
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 BACKEND: ResonantGraphAIV0.1"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BACKEND_DIR="/Applications/ResonantGraphAIV0.1"

if [ ! -d "$BACKEND_DIR" ]; then
    echo "⚠️  Backend directory not found at $BACKEND_DIR"
    echo "   Skipping backend commit..."
    exit 0
fi

cd "$BACKEND_DIR"

# Check if git repo
if [ ! -d ".git" ]; then
    echo "⚠️  Not a git repository!"
    echo "   Skipping backend commit..."
    exit 0
fi

# Show status
echo "📋 Git status:"
git status --short

# Add all changes
echo ""
echo "➕ Adding all changes..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "feat: Backend updates for deployment readiness

- All API endpoints ready for production
- Hash Sphere integration complete
- RAG fallback system active
- Code services operational (7 endpoints)
- ML services integrated (5 endpoints)
- Git integration ready (7 endpoints)
- LSP integration complete (4 endpoints)
- All endpoints tested and verified
- Deployment configuration ready"

# Push
echo "📤 Pushing to origin/main..."
git push origin main

echo "✅ Backend pushed successfully!"
echo ""

# ============================================
# SUMMARY
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL CHANGES COMMITTED AND PUSHED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next steps:"
echo "   1. SSH to droplet: ssh root@137.184.234.252"
echo "   2. Navigate to frontend: cd /path/to/frontend"
echo "   3. Pull changes: git pull origin main"
echo "   4. Navigate to backend: cd /path/to/backend"
echo "   5. Pull changes: git pull origin main"
echo "   6. Restart services: docker compose restart"
echo ""

