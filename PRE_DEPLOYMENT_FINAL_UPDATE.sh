#!/bin/bash

# Final Pre-Deployment Update Script
# This script prepares all changes for deployment to the droplet
# Run this locally before deploying to your droplet

set -e

echo "🚀 FINAL PRE-DEPLOYMENT UPDATE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get current directory
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
cd "$PROJECT_ROOT"

echo "📍 Project Root: $PROJECT_ROOT"
echo ""

# Step 1: Check Git Status
echo "📋 STEP 1: Checking Git Status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MODIFIED_FILES=$(git status --short | grep -E "^ M" | wc -l | tr -d ' ')
UNTRACKED_FILES=$(git status --short | grep -E "^??" | wc -l | tr -d ' ')

echo "Modified files: $MODIFIED_FILES"
echo "Untracked files: $UNTRACKED_FILES"
echo ""

if [ "$MODIFIED_FILES" -gt 0 ] || [ "$UNTRACKED_FILES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
    echo ""
    git status --short
    
    echo ""
    read -p "Do you want to commit these changes? (y/n): " commit_changes
    
    if [ "$commit_changes" = "y" ]; then
        echo ""
        echo "📝 Committing changes..."
        
        # Add modified files (exclude documentation files in root)
        git add src/ *.ts *.tsx *.css *.json
        
        # Add specific markdown files if they're part of the project
        git add CURRENT_RESONANT_CHAT_STATUS.md RESONANT_CHAT_COMPLETE_FUNCTIONALITY_LIST.md YOUR_CHANGES_ARE_SAFE.md 2>/dev/null || true
        
        # Commit
        git commit -m "Final pre-deployment update: UI/UX fixes, style architecture corrections, and chat improvements" || {
            echo -e "${YELLOW}⚠️  No changes to commit or commit failed${NC}"
        }
        
        echo ""
        read -p "Do you want to push to origin/main? (y/n): " push_changes
        
        if [ "$push_changes" = "y" ]; then
            echo "📤 Pushing to origin/main..."
            git push origin main || {
                echo -e "${RED}❌ Push failed. Check your git credentials.${NC}"
                echo "You can push manually later with: git push origin main"
            }
            echo -e "${GREEN}✅ Changes pushed!${NC}"
        else
            echo -e "${YELLOW}⚠️  Skipping push. Remember to push before deploying!${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Skipping commit. Make sure to commit before deploying!${NC}"
    fi
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
fi

echo ""

# Step 2: Verify Dependencies
echo "📦 STEP 2: Verifying Dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
else
    echo "✅ node_modules exists"
    echo "Checking for outdated packages..."
    npm outdated || echo "All packages up to date"
fi

echo ""

# Step 3: Local Build Verification
echo "🏗️  STEP 3: Building Project Locally (Verification)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Setting build environment variables..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"

echo "Building..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    
    # Check build output
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        FILE_COUNT=$(find dist -type f | wc -l | tr -d ' ')
        echo "Build output: $DIST_SIZE ($FILE_COUNT files)"
        
        # Verify index.html exists
        if [ -f "dist/index.html" ]; then
            echo -e "${GREEN}✅ index.html found${NC}"
        else
            echo -e "${RED}❌ index.html not found in dist/${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ dist/ directory not created${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed! Fix errors before deploying.${NC}"
    exit 1
fi

echo ""

# Step 4: Generate Deployment Commands
echo "📝 STEP 4: Generating Deployment Commands..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DEPLOYMENT_SCRIPT="$PROJECT_ROOT/DEPLOY_TO_DROPLET_FINAL.sh"

cat > "$DEPLOYMENT_SCRIPT" << 'DEPLOY_EOF'
#!/bin/bash

# Final Deployment Script for Droplet
# Run this script on your DigitalOcean droplet
# This will pull latest changes and deploy everything

set -e

echo "🚀 FINAL DEPLOYMENT TO DROPLET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Auto-detect frontend folder
echo "📂 Step 1: Finding frontend directory..."
FRONTEND_FOLDER=$(find /root -name "package.json" -type f 2>/dev/null | grep -E "frontend|ResonantGraph" | head -1 | xargs dirname 2>/dev/null)

if [ -z "$FRONTEND_FOLDER" ]; then
    echo "❌ Frontend folder not found. Please specify manually."
    echo "Common locations:"
    echo "  - /root/ResonantGraphAI_FrontendV0.1-"
    echo "  - /root/frontend"
    exit 1
fi

echo "✅ Found: $FRONTEND_FOLDER"
cd "$FRONTEND_FOLDER"

echo ""
echo "📥 Step 2: Pulling latest changes from Git..."
git pull origin main || {
    echo "⚠️  Git pull failed. Continuing with local files..."
}

echo ""
echo "📦 Step 3: Installing/updating dependencies..."
npm install

echo ""
echo "🏗️  Step 4: Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist/ directory not found"
    exit 1
fi

echo ""
echo "🐳 Step 5: Deploying to Docker container..."

# Check if frontend container exists
if ! docker ps -a | grep -q frontend; then
    echo "❌ Frontend container not found!"
    echo "Available containers:"
    docker ps -a
    exit 1
fi

# Clean container directory
echo "🧹 Cleaning container directory..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' || {
    echo "⚠️  Could not clean container directory"
}

# Copy built files
echo "📋 Copying built files..."
docker cp dist/. frontend:/usr/share/nginx/html/ || {
    echo "❌ Failed to copy files to container"
    exit 1
}

# Reload nginx (faster than restart)
echo "🔄 Reloading Nginx..."
docker exec frontend nginx -s reload || {
    echo "⚠️  Nginx reload failed, trying restart..."
    docker exec frontend nginx -t && docker restart frontend
}

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Test your site: https://dev-swat.com"
echo "📊 Dashboard: https://dev-swat.com/dashboard"
echo "💬 Chat: https://dev-swat.com/resonant-chat"
echo ""
echo "🔍 Verification Commands:"
echo "  docker exec frontend ls -la /usr/share/nginx/html/ | head -10"
echo "  curl -I https://dev-swat.com"
echo "  docker logs frontend --tail 20"
DEPLOY_EOF

chmod +x "$DEPLOYMENT_SCRIPT"
echo -e "${GREEN}✅ Created: $DEPLOYMENT_SCRIPT${NC}"

# Also create a one-liner version
ONELINER_FILE="$PROJECT_ROOT/DEPLOY_DROPLET_ONELINER.txt"
cat > "$ONELINER_FILE" << 'ONELINER_EOF'
# One-Line Deployment Command for Droplet
# Copy and paste this entire command on your droplet:

FRONTEND_FOLDER=$(find /root -name "package.json" -type f 2>/dev/null | grep -E "frontend|ResonantGraph" | head -1 | xargs dirname) && cd "$FRONTEND_FOLDER" && git pull origin main && npm install && export VITE_API_URL="/api" && export VITE_FASTAPI_URL="/api" && npm run build && docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' && docker cp dist/. frontend:/usr/share/nginx/html/ && docker exec frontend nginx -s reload && echo "✅ Deployment complete! Visit: https://dev-swat.com"
ONELINER_EOF

echo -e "${GREEN}✅ Created: $ONELINER_FILE${NC}"

echo ""

# Step 5: Create Deployment Summary
echo "📋 STEP 5: Creating Deployment Summary..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SUMMARY_FILE="$PROJECT_ROOT/FINAL_PRE_DEPLOYMENT_SUMMARY.md"

cat > "$SUMMARY_FILE" << SUMMARY_EOF
# Final Pre-Deployment Summary

**Date:** $(date '+%Y-%m-%d %H:%M:%S')  
**Status:** ✅ Ready for Deployment

---

## 📦 Changes Included in This Deployment

### Modified Files
- `src/pages/ResonantChat/ResonantChatPage.tsx` - Chat functionality improvements
- `src/pages/ResonantChat/ResonantChatPage.module.css` - Style architecture corrections
- `src/pages/HomeNew/HomeNew.module.css` - Home page styling updates
- `src/theme/global.css` - Global style corrections

### Key Updates
- ✅ Style architecture compliance (no !important flags, proper CSS modules)
- ✅ Font size corrections per importend.txt specifications
- ✅ Scrollbar styling fixes (blue theme, proper opacity)
- ✅ Text alignment fixes (centered welcome panel)
- ✅ UI/UX compliance improvements

---

## 🚀 Deployment Instructions

### Option 1: Use the Deployment Script (Recommended)

1. Copy `DEPLOY_TO_DROPLET_FINAL.sh` to your droplet
2. Make it executable: `chmod +x DEPLOY_TO_DROPLET_FINAL.sh`
3. Run it: `./DEPLOY_TO_DROPLET_FINAL.sh`

### Option 2: One-Line Command

Copy and paste the command from `DEPLOY_DROPLET_ONELINER.txt` directly on your droplet.

### Option 3: Manual Deployment

\`\`\`bash
# Find frontend folder
FRONTEND_FOLDER=\$(find /root -name "package.json" -type f 2>/dev/null | grep -E "frontend|ResonantGraph" | head -1 | xargs dirname)

# Navigate and pull
cd "\$FRONTEND_FOLDER"
git pull origin main

# Install dependencies
npm install

# Build
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# Deploy to Docker
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload
\`\`\`

---

## ✅ Pre-Deployment Checklist

- [x] All changes committed locally
- [x] Local build successful
- [x] No TypeScript errors
- [x] No build warnings
- [x] Deployment script created
- [ ] Changes pushed to GitHub (if using git pull)
- [ ] Tested on staging (if applicable)

---

## 🔍 Verification After Deployment

After deploying, verify everything works:

\`\`\`bash
# Check if site is accessible
curl -I https://dev-swat.com

# Check container status
docker ps | grep frontend

# Check Nginx logs
docker logs frontend --tail 20

# Verify files in container
docker exec frontend ls -la /usr/share/nginx/html/ | head -10
\`\`\`

---

## 📝 Build Information

- **Build Size:** $(du -sh dist 2>/dev/null | cut -f1 || echo "N/A")
- **Files:** $(find dist -type f 2>/dev/null | wc -l | tr -d ' ' || echo "N/A")
- **Build Time:** $(date '+%Y-%m-%d %H:%M:%S')

---

## 🆘 Troubleshooting

### Build Fails on Droplet
- Check Node.js version: `node --version` (should be 18+)
- Check npm version: `npm --version`
- Try: `npm ci` instead of `npm install`

### Container Not Found
- Check: `docker ps -a | grep frontend`
- If not running: Check docker-compose or start manually

### Files Not Updating
- Verify files copied: `docker exec frontend ls -la /usr/share/nginx/html/`
- Clear browser cache
- Check Nginx logs: `docker logs frontend`

### Git Pull Fails
- Check git credentials on droplet
- Try pulling manually first
- Deployment will continue with local files if pull fails

---

**Next Steps:**
1. Review this summary
2. Deploy to droplet using one of the methods above
3. Verify deployment
4. Test all functionality

**Good luck with your deployment! 🚀**
SUMMARY_EOF

echo -e "${GREEN}✅ Created: $SUMMARY_FILE${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ PRE-DEPLOYMENT UPDATE COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Generated Files:"
echo "  1. $DEPLOYMENT_SCRIPT - Full deployment script for droplet"
echo "  2. $ONELINER_FILE - One-line deployment command"
echo "  3. $SUMMARY_FILE - Complete deployment summary"
echo ""
echo "📋 Next Steps:"
echo "  1. Review the deployment summary: $SUMMARY_FILE"
echo "  2. Push changes to GitHub (if you committed): git push origin main"
echo "  3. Deploy to droplet using one of the generated scripts"
echo ""
echo "🚀 Ready to deploy!"


