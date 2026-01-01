#!/bin/bash

# Pull from both Frontend and Backend Git Repositories
# This script safely pulls latest changes from both repos

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Pulling from both Git repositories...${NC}"
echo ""

# ============================================
# FRONTEND REPOSITORY
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 FRONTEND REPOSITORY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd /Applications/ResonantGraphAI_FrontendV0.1

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected in frontend${NC}"
    echo "Options:"
    echo "  1. Stash changes, pull, then reapply"
    echo "  2. Commit changes first"
    echo "  3. Discard changes and pull"
    read -p "Choose option (1/2/3): " frontend_option
    
    case $frontend_option in
        1)
            echo -e "${YELLOW}📦 Stashing changes...${NC}"
            git stash push -m "Stashed before pull - $(date +%Y-%m-%d_%H:%M:%S)"
            echo -e "${GREEN}✅ Changes stashed${NC}"
            git pull origin main
            echo -e "${YELLOW}📦 Reapplying stashed changes...${NC}"
            git stash pop || echo -e "${YELLOW}⚠️  Some conflicts may need manual resolution${NC}"
            ;;
        2)
            echo -e "${YELLOW}Please commit your changes first, then run this script again${NC}"
            exit 1
            ;;
        3)
            echo -e "${RED}⚠️  Discarding all uncommitted changes...${NC}"
            read -p "Are you sure? This will lose all uncommitted changes (y/n): " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                git reset --hard HEAD
                git clean -fd
                git pull origin main
            else
                echo "Cancelled"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
    echo -e "${BLUE}⬇️  Pulling latest changes...${NC}"
    git pull origin main
fi

echo ""
echo -e "${GREEN}✅ Frontend repository updated${NC}"
echo ""

# ============================================
# BACKEND REPOSITORY
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 BACKEND REPOSITORY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd /Applications/TEST/ResonantGenesis_Graph

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected in backend${NC}"
    echo "Options:"
    echo "  1. Stash changes, pull, then reapply"
    echo "  2. Commit changes first"
    echo "  3. Discard changes and pull"
    read -p "Choose option (1/2/3): " backend_option
    
    case $backend_option in
        1)
            echo -e "${YELLOW}📦 Stashing changes...${NC}"
            git stash push -m "Stashed before pull - $(date +%Y-%m-%d_%H:%M:%S)"
            echo -e "${GREEN}✅ Changes stashed${NC}"
            git pull origin main
            echo -e "${YELLOW}📦 Reapplying stashed changes...${NC}"
            git stash pop || echo -e "${YELLOW}⚠️  Some conflicts may need manual resolution${NC}"
            ;;
        2)
            echo -e "${YELLOW}Please commit your changes first, then run this script again${NC}"
            exit 1
            ;;
        3)
            echo -e "${RED}⚠️  Discarding all uncommitted changes...${NC}"
            read -p "Are you sure? This will lose all uncommitted changes (y/n): " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                git reset --hard HEAD
                git clean -fd
                git pull origin main
            else
                echo "Cancelled"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${GREEN}✅ No uncommitted changes${NC}"
    echo -e "${BLUE}⬇️  Pulling latest changes...${NC}"
    git pull origin main
fi

echo ""
echo -e "${GREEN}✅ Backend repository updated${NC}"
echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Both repositories updated successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show current status
echo -e "${BLUE}📊 Current Status:${NC}"
echo ""
echo -e "${BLUE}Frontend (${NC}/Applications/ResonantGraphAI_FrontendV0.1${BLUE}):${NC}"
cd /Applications/ResonantGraphAI_FrontendV0.1
git status --short | head -5
echo ""

echo -e "${BLUE}Backend (${NC}/Applications/TEST/ResonantGenesis_Graph${BLUE}):${NC}"
cd /Applications/TEST/ResonantGenesis_Graph
git status --short | head -5
echo ""

echo -e "${GREEN}✅ Done!${NC}"


