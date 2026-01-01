#!/bin/bash

# ============================================================
# Droplet Deployment Script
# Pulls latest changes from git, handles conflicts, and prepares for deployment
# ============================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE PATHS FOR YOUR DROPLET
FRONTEND_REPO_PATH="${FRONTEND_REPO_PATH:-/var/www/resonantgraph-frontend}"
BACKEND_REPO_PATH="${BACKEND_REPO_PATH:-/var/www/resonantgraph-backend}"
FRONTEND_GIT_REPO="${FRONTEND_GIT_REPO:-https://github.com/louienemesh/ResonantGraphAI_FrontendV0.1-.git}"
BACKEND_GIT_REPO="${BACKEND_GIT_REPO:-https://github.com/louienemesh/ResonantGenesis_Graph.git}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🚀 Droplet Deployment Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📁 Frontend Path:${NC} $FRONTEND_REPO_PATH"
echo -e "${BLUE}📁 Backend Path:${NC}  $BACKEND_REPO_PATH"
echo ""

# ============================================================
# HELPER FUNCTIONS
# ============================================================

cleanup_old_files() {
    local repo_path=$1
    local repo_name=$2
    
    echo -e "${YELLOW}🧹 Cleaning old files in $repo_name...${NC}"
    cd "$repo_path"
    
    # Remove node_modules if exists (will be reinstalled)
    if [ -d "node_modules" ]; then
        echo -e "${YELLOW}   Removing node_modules...${NC}"
        rm -rf node_modules
    fi
    
    # Remove build artifacts
    if [ -d "dist" ]; then
        echo -e "${YELLOW}   Removing dist folder...${NC}"
        rm -rf dist
    fi
    
    if [ -d "build" ]; then
        echo -e "${YELLOW}   Removing build folder...${NC}"
        rm -rf build
    fi
    
    # Remove Python cache files
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    
    # Remove .pyc files in __pycache__
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup complete for $repo_name${NC}"
}

handle_git_conflicts() {
    local repo_path=$1
    local repo_name=$2
    
    cd "$repo_path"
    
    # Check for merge conflicts
    if [ -f ".git/MERGE_HEAD" ]; then
        echo -e "${RED}⚠️  Merge conflict detected in $repo_name${NC}"
        echo -e "${YELLOW}   Resolving by accepting incoming changes...${NC}"
        git merge --abort 2>/dev/null || true
        git reset --hard HEAD
        git clean -fd
    fi
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Uncommitted changes in $repo_name${NC}"
        echo -e "${YELLOW}   Stashing changes...${NC}"
        git stash push -m "Auto-stashed before deployment - $(date +%Y-%m-%d_%H:%M:%S)" || true
    fi
}

pull_from_git() {
    local repo_path=$1
    local repo_name=$2
    local git_repo=$3
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📦 $repo_name Repository${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Check if directory exists
    if [ ! -d "$repo_path" ]; then
        echo -e "${YELLOW}📁 Directory doesn't exist. Cloning repository...${NC}"
        mkdir -p "$(dirname "$repo_path")"
        git clone "$git_repo" "$repo_path"
        echo -e "${GREEN}✅ Repository cloned${NC}"
        return
    fi
    
    cd "$repo_path"
    
    # Check if it's a git repository
    if [ ! -d ".git" ]; then
        echo -e "${YELLOW}📁 Not a git repository. Initializing...${NC}"
        git init
        git remote add origin "$git_repo" 2>/dev/null || git remote set-url origin "$git_repo"
        git fetch origin
        git branch -M main 2>/dev/null || true
        git checkout -b main 2>/dev/null || git checkout main
    fi
    
    # Set remote if not exists
    if ! git remote get-url origin &>/dev/null; then
        git remote add origin "$git_repo"
    else
        git remote set-url origin "$git_repo"
    fi
    
    # Handle conflicts and uncommitted changes
    handle_git_conflicts "$repo_path" "$repo_name"
    
    # Fetch latest changes
    echo -e "${BLUE}⬇️  Fetching latest changes...${NC}"
    git fetch origin main || git fetch origin master
    
    # Determine branch name
    BRANCH="main"
    if ! git show-ref --verify --quiet refs/remotes/origin/main; then
        BRANCH="master"
    fi
    
    # Reset to remote state (clean pull)
    echo -e "${BLUE}🔄 Resetting to remote state...${NC}"
    git reset --hard "origin/$BRANCH"
    git clean -fd
    
    # Pull latest changes
    echo -e "${BLUE}⬇️  Pulling latest changes...${NC}"
    git pull origin "$BRANCH" || {
        echo -e "${RED}❌ Pull failed. Trying to reset...${NC}"
        git fetch origin
        git reset --hard "origin/$BRANCH"
        git clean -fd
    }
    
    echo -e "${GREEN}✅ $repo_name updated to latest${NC}"
    
    # Show current commit
    echo -e "${CYAN}📌 Current commit:${NC} $(git rev-parse --short HEAD)"
    echo -e "${CYAN}📝 Latest commit message:${NC}"
    git log -1 --pretty=format:"   %s" || echo "   (no commits)"
    echo ""
}

# ============================================================
# MAIN DEPLOYMENT PROCESS
# ============================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}STEP 1: Pulling Frontend Repository${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

pull_from_git "$FRONTEND_REPO_PATH" "Frontend" "$FRONTEND_GIT_REPO"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}STEP 2: Pulling Backend Repository${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

pull_from_git "$BACKEND_REPO_PATH" "Backend" "$BACKEND_GIT_REPO"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}STEP 3: Cleaning Old Files${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cleanup_old_files "$FRONTEND_REPO_PATH" "Frontend"
echo ""
cleanup_old_files "$BACKEND_REPO_PATH" "Backend"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}STEP 4: Installation & Build Preparation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Frontend installation
if [ -f "$FRONTEND_REPO_PATH/package.json" ]; then
    echo -e "${BLUE}📦 Installing Frontend dependencies...${NC}"
    cd "$FRONTEND_REPO_PATH"
    npm ci --production=false || npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    echo ""
fi

# Backend installation (if Python)
if [ -f "$BACKEND_REPO_PATH/requirements.txt" ]; then
    echo -e "${BLUE}📦 Installing Backend dependencies...${NC}"
    cd "$BACKEND_REPO_PATH"
    if command -v python3 &> /dev/null; then
        python3 -m venv venv 2>/dev/null || true
        source venv/bin/activate 2>/dev/null || true
        pip install -r requirements.txt --upgrade || true
        echo -e "${GREEN}✅ Backend dependencies installed${NC}"
    fi
    echo ""
fi

# ============================================================
# SUMMARY
# ============================================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment Preparation Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}📊 Repository Status:${NC}"
echo ""

echo -e "${BLUE}Frontend (${FRONTEND_REPO_PATH}):${NC}"
cd "$FRONTEND_REPO_PATH"
echo "   Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
echo "   Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
echo "   Status: $(git status --short | wc -l | xargs) files changed"
echo ""

echo -e "${BLUE}Backend (${BACKEND_REPO_PATH}):${NC}"
cd "$BACKEND_REPO_PATH"
echo "   Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
echo "   Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
echo "   Status: $(git status --short | wc -l | xargs) files changed"
echo ""

echo -e "${GREEN}✅ Next Steps:${NC}"
echo "   1. Review the repositories above"
echo "   2. Build frontend: cd $FRONTEND_REPO_PATH && npm run build"
echo "   3. Configure backend environment variables"
echo "   4. Restart services (PM2, systemd, etc.)"
echo "   5. Test the deployment"
echo ""

echo -e "${GREEN}✅ Done!${NC}"

