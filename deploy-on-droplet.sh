#!/bin/bash
# Deployment script to run ON THE DROPLET
# This script pulls latest changes from SEPARATE frontend and backend folders
# and restarts services

set -e

echo "🚀 Deploying to DigitalOcean Droplet..."
echo ""

# ============================================
# CONFIGURATION - YOUR FOLDER PATHS
# ============================================
# Your actual folder paths on the droplet
FRONTEND_DIR="/root/frontend"
BACKEND_DIR="/root/ResonantGraphAIV0.1"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# FIND FRONTEND DIRECTORY
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 FINDING FRONTEND DIRECTORY...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -z "$FRONTEND_DIR" ]; then
    # Try common locations
    FRONTEND_CANDIDATES=(
        "/root/ResonantGraphAI_FrontendV0.1"
        "/root/frontend"
        "/var/www/frontend"
        "/opt/frontend"
        "/home/ubuntu/frontend"
    )
    
    for dir in "${FRONTEND_CANDIDATES[@]}"; do
        if [ -d "$dir" ] && [ -d "$dir/.git" ]; then
            FRONTEND_DIR="$dir"
            break
        fi
    done
    
    # If still not found, search
    if [ -z "$FRONTEND_DIR" ]; then
        echo -e "${YELLOW}⚠️  Searching for frontend directory...${NC}"
        FRONTEND_DIR=$(find /root /home /var/www /opt -maxdepth 3 -type d -name "*Frontend*" -o -name "*frontend*" 2>/dev/null | grep -v node_modules | head -1)
    fi
fi

if [ -z "$FRONTEND_DIR" ] || [ ! -d "$FRONTEND_DIR/.git" ]; then
    echo -e "${RED}❌ Frontend git repository not found!${NC}"
    echo ""
    echo "Please set FRONTEND_DIR in this script:"
    echo "  FRONTEND_DIR=\"/path/to/your/frontend\""
    echo ""
    echo "Or run manually:"
    echo "  cd /path/to/frontend"
    echo "  git pull origin main"
    echo ""
    read -p "Enter frontend directory path (or press Enter to skip): " FRONTEND_DIR
fi

# ============================================
# FIND BACKEND DIRECTORY
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 FINDING BACKEND DIRECTORY...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -z "$BACKEND_DIR" ]; then
    # Try common locations
    BACKEND_CANDIDATES=(
        "/root/ResonantGraphAIV0.1"
        "/root/backend"
        "/var/www/backend"
        "/opt/backend"
        "/home/ubuntu/backend"
    )
    
    for dir in "${BACKEND_CANDIDATES[@]}"; do
        if [ -d "$dir" ] && [ -d "$dir/.git" ]; then
            BACKEND_DIR="$dir"
            break
        fi
    done
    
    # If still not found, search
    if [ -z "$BACKEND_DIR" ]; then
        echo -e "${YELLOW}⚠️  Searching for backend directory...${NC}"
        BACKEND_DIR=$(find /root /home /var/www /opt -maxdepth 3 -type d -name "*ResonantGraph*" -o -name "*backend*" 2>/dev/null | grep -v node_modules | head -1)
    fi
fi

if [ -z "$BACKEND_DIR" ] || [ ! -d "$BACKEND_DIR/.git" ]; then
    echo -e "${RED}❌ Backend git repository not found!${NC}"
    echo ""
    echo "Please set BACKEND_DIR in this script:"
    echo "  BACKEND_DIR=\"/path/to/your/backend\""
    echo ""
    echo "Or run manually:"
    echo "  cd /path/to/backend"
    echo "  git pull origin main"
    echo ""
    read -p "Enter backend directory path (or press Enter to skip): " BACKEND_DIR
fi

echo ""

# ============================================
# FRONTEND DEPLOYMENT
# ============================================
if [ ! -z "$FRONTEND_DIR" ] && [ -d "$FRONTEND_DIR/.git" ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📦 FRONTEND: Updating...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ Frontend directory: $FRONTEND_DIR${NC}"
    
    cd "$FRONTEND_DIR"
    
    echo "📥 Pulling latest changes from GitHub..."
    git pull origin main || {
        echo -e "${YELLOW}⚠️  Git pull failed. Trying to reset...${NC}"
        git fetch origin
        git reset --hard origin/main
    }
    
    # Clean build artifacts
    echo "🧹 Cleaning build artifacts..."
    rm -rf dist/
    rm -rf node_modules/.vite
    find src -name "*.js" -type f -delete 2>/dev/null || true
    
    # Check if package.json exists and changed
    if [ -f "package.json" ]; then
        if git diff HEAD@{1} HEAD --name-only 2>/dev/null | grep -q package.json || [ ! -d "node_modules" ]; then
            echo "📦 Installing/updating dependencies..."
            npm install
        fi
        
        echo "🔨 Building frontend..."
        npm run build
    fi
    
    echo -e "${GREEN}✅ Frontend updated successfully!${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  Skipping frontend (directory not found)${NC}"
    echo ""
fi

# ============================================
# BACKEND DEPLOYMENT
# ============================================
if [ ! -z "$BACKEND_DIR" ] && [ -d "$BACKEND_DIR/.git" ]; then
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📦 BACKEND: Updating...${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ Backend directory: $BACKEND_DIR${NC}"
    
    cd "$BACKEND_DIR"
    
    echo "📥 Pulling latest changes from GitHub..."
    git pull origin main || {
        echo -e "${YELLOW}⚠️  Git pull failed. Trying to reset...${NC}"
        git fetch origin
        git reset --hard origin/main
    }
    
    echo -e "${GREEN}✅ Backend updated successfully!${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  Skipping backend (directory not found)${NC}"
    echo ""
fi

# ============================================
# RESTART SERVICES
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 RESTARTING SERVICES...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Try to restart using docker compose from backend directory
if [ ! -z "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/docker-compose.yml" ]; then
    cd "$BACKEND_DIR"
    echo "🔄 Restarting Docker services from backend directory..."
    docker compose restart api frontend 2>/dev/null || docker compose restart
    echo -e "${GREEN}✅ Services restarted!${NC}"
elif [ ! -z "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/docker-compose.yml" ]; then
    cd "$FRONTEND_DIR"
    echo "🔄 Restarting Docker services from frontend directory..."
    docker compose restart api frontend 2>/dev/null || docker compose restart
    echo -e "${GREEN}✅ Services restarted!${NC}"
elif command -v docker &> /dev/null; then
    echo "🔄 Restarting all Docker containers..."
    docker restart $(docker ps -q) 2>/dev/null || echo -e "${YELLOW}⚠️  No containers to restart${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not found. Please restart services manually.${NC}"
    echo "  - Frontend: cd $FRONTEND_DIR && docker compose restart"
    echo "  - Backend: cd $BACKEND_DIR && docker compose restart"
fi

echo ""

# ============================================
# VERIFICATION
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check services
if command -v docker &> /dev/null; then
    echo "📊 Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "No containers running"
    echo ""
fi

echo "🔍 Verification:"
echo "  - Frontend: http://dev-swat.com"
echo "  - Backend: http://dev-swat.com/api/health"
echo "  - Logs: docker compose logs -f"
echo ""
echo "📁 Directories used:"
echo "  - Frontend: ${FRONTEND_DIR:-Not found}"
echo "  - Backend: ${BACKEND_DIR:-Not found}"
echo ""
