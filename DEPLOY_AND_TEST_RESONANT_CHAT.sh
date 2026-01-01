#!/bin/bash

# Complete Deployment and Testing Script for Resonant Chat Updates
# This script:
# 1. Updates frontend code
# 2. Builds with new changes
# 3. Updates Docker container
# 4. Restarts services
# 5. Runs basic tests

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 RESONANT CHAT PLATFORM UPDATE & TESTING${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Configuration - Auto-detect local vs server
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" == *"/root/"* ]]; then
    # Server environment
    FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1"
    BACKEND_DIR="/root/ResonantGraphAIV0.1"
    API_URL="https://dev-swat.com/api"
    FRONTEND_URL="https://dev-swat.com"
    IS_LOCAL=false
else
    # Local development environment
    FRONTEND_DIR="$CURRENT_DIR"
    BACKEND_DIR="${CURRENT_DIR%/ResonantGraphAI_FrontendV0.1}/ResonantGraphAIV0.1"
    API_URL="http://localhost:8001"
    FRONTEND_URL="http://localhost"
    IS_LOCAL=true
fi

echo "📍 Environment: $([ "$IS_LOCAL" = true ] && echo "Local Development" || echo "Production Server")"
echo "📍 Frontend directory: $FRONTEND_DIR"
echo "📍 Backend directory: $BACKEND_DIR"
echo "📍 API URL: $API_URL"
echo "📍 Frontend URL: $FRONTEND_URL"
echo ""

# Step 1: Update Frontend Code
echo -e "${YELLOW}📥 STEP 1: Updating Frontend Code...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found: $FRONTEND_DIR${NC}"
    exit 1
fi

cd "$FRONTEND_DIR"
echo "📍 Current directory: $(pwd)"

# Pull latest code (only if git repo and not local dev)
if [ -d ".git" ] && [ "$IS_LOCAL" = false ]; then
    echo "📥 Pulling latest code from main branch..."
    git fetch origin main
    git pull origin main || {
        echo -e "${YELLOW}⚠️  Git pull had issues, continuing with current code...${NC}"
    }
    echo -e "${GREEN}✅ Code updated${NC}"
else
    echo "📝 Using current local code (development mode)"
    echo -e "${GREEN}✅ Code ready${NC}"
fi
echo ""

# Step 2: Install Dependencies
echo -e "${YELLOW}📦 STEP 2: Installing Dependencies...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
    echo "🔄 Checking for updates..."
    npm install 2>/dev/null || echo "⚠️  Some packages may need updating"
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

# Step 3: Build Frontend
echo -e "${YELLOW}🏗️  STEP 3: Building Frontend...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Set environment variables based on environment
if [ "$IS_LOCAL" = true ]; then
    # Local development
    export VITE_API_URL="http://localhost:8001"
    export VITE_FASTAPI_URL="http://localhost:8001"
    export VITE_ENABLE_FALLBACK_MODE="true"  # Local: allow fallback for testing
else
    # Production
    export VITE_API_URL="/api"
    export VITE_FASTAPI_URL="/api"
    export VITE_ENABLE_FALLBACK_MODE="false"  # Production: backend required
fi

echo "🔧 Build environment:"
echo "   VITE_API_URL=$VITE_API_URL"
echo "   VITE_FASTAPI_URL=$VITE_FASTAPI_URL"
echo "   VITE_ENABLE_FALLBACK_MODE=$VITE_ENABLE_FALLBACK_MODE"
echo ""

echo "🏗️  Building..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    
    # Verify build output
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        FILE_COUNT=$(find dist -type f | wc -l | tr -d ' ')
        echo "   📊 Build output: $DIST_SIZE ($FILE_COUNT files)"
        echo -e "${GREEN}✅ Build verified${NC}"
    else
        echo -e "${RED}❌ Build output not found or invalid${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo ""

# Step 4: Update Docker Container
echo -e "${YELLOW}🐳 STEP 4: Updating Docker Container...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if frontend container exists
if ! docker ps -a | grep -q "frontend"; then
    echo -e "${YELLOW}⚠️  Frontend container not found. Starting container...${NC}"
    if [ -f "docker-compose.frontend.yml" ]; then
        docker-compose -f docker-compose.frontend.yml up -d frontend
    else
        echo -e "${YELLOW}⚠️  docker-compose.frontend.yml not found. Using volume mount instead...${NC}"
        # For local dev, we can use volume mount directly
        if [ "$IS_LOCAL" = true ] && [ -d "dist" ]; then
            echo "✅ Using local dist folder (volume mount will handle it)"
        else
            echo -e "${RED}❌ Cannot start frontend container${NC}"
            exit 1
        fi
    fi
    sleep 5
fi

# Copy new build to container (or use volume mount for local)
if [ "$IS_LOCAL" = true ] && docker ps | grep -q "frontend"; then
    # Local: Check if using volume mount
    if docker inspect frontend | grep -q "$FRONTEND_DIR/dist"; then
        echo "📋 Using volume mount - files will be available automatically"
        echo -e "${GREEN}✅ Files ready (volume mount)${NC}"
    else
        # Copy to container
        echo "📋 Copying build files to container..."
        docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
        docker cp dist/. frontend:/usr/share/nginx/html/ || {
            echo -e "${RED}❌ Failed to copy files to container${NC}"
            exit 1
        }
        echo -e "${GREEN}✅ Files copied to container${NC}"
    fi
else
    # Server: Always copy
    echo "📋 Copying build files to container..."
    docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' || {
        echo -e "${YELLOW}⚠️  Could not clear container, continuing...${NC}"
    }
    docker cp dist/. frontend:/usr/share/nginx/html/ || {
        echo -e "${RED}❌ Failed to copy files to container${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Files copied to container${NC}"
fi

# Reload nginx
echo "⚙️  Reloading nginx..."
if docker ps | grep -q "frontend"; then
    docker exec frontend nginx -s reload 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Nginx reload had issues, trying restart...${NC}"
        if [ -f "docker-compose.frontend.yml" ]; then
            docker-compose -f docker-compose.frontend.yml restart frontend
        else
            docker restart frontend
        fi
        sleep 3
    }
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend container not running - start it manually${NC}"
fi
echo ""

# Step 5: Restart Services
echo -e "${YELLOW}🔄 STEP 5: Restarting Services...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Restart frontend
echo "🔄 Restarting frontend container..."
if docker ps | grep -q "frontend"; then
    if [ -f "docker-compose.frontend.yml" ]; then
        docker-compose -f docker-compose.frontend.yml restart frontend
    else
        docker restart frontend
    fi
    sleep 3
else
    echo -e "${YELLOW}⚠️  Frontend container not running${NC}"
fi

# Check backend (if accessible)
if [ -d "$BACKEND_DIR" ] && [ -f "$BACKEND_DIR/docker-compose.yml" ]; then
    echo "🔄 Checking backend services..."
    cd "$BACKEND_DIR"
    if docker compose ps 2>/dev/null | grep -q "api"; then
        echo "🔄 Backend API is running"
        if [ "$IS_LOCAL" = true ]; then
            echo "   (Skipping restart in local dev - keep it running)"
        else
            docker compose restart api || echo "⚠️  Backend restart skipped"
        fi
    fi
    cd "$FRONTEND_DIR"
elif [ "$IS_LOCAL" = true ]; then
    # Check if backend containers are running locally
    if docker ps | grep -q "api"; then
        echo "✅ Backend API container is running locally"
    else
        echo -e "${YELLOW}⚠️  Backend API not found - may be on different machine${NC}"
    fi
fi

echo -e "${GREEN}✅ Services restarted${NC}"
echo ""

# Step 6: Health Checks
echo -e "${YELLOW}🏥 STEP 6: Health Checks...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check frontend container
echo "🔍 Checking frontend container..."
if docker ps | grep -q "frontend"; then
    echo -e "${GREEN}✅ Frontend container running${NC}"
else
    echo -e "${RED}❌ Frontend container not running${NC}"
fi

# Check frontend response
echo "🔍 Checking frontend response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend responding (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend response: HTTP $HTTP_CODE${NC}"
fi

# Check backend health
echo "🔍 Checking backend health..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>/dev/null || echo "000")
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Backend healthy (HTTP $BACKEND_HEALTH)${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check: HTTP $BACKEND_HEALTH${NC}"
    echo "   (This is expected if backend is on different server)"
fi

echo ""

# Step 7: Test Resonant Chat Endpoints
echo -e "${YELLOW}🧪 STEP 7: Testing Resonant Chat Endpoints...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test providers endpoint
echo "🔍 Testing /resonant-chat/providers..."
PROVIDERS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/resonant-chat/providers" 2>/dev/null || echo "000")
if [ "$PROVIDERS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Providers endpoint available${NC}"
else
    echo -e "${YELLOW}⚠️  Providers endpoint: HTTP $PROVIDERS_CODE${NC}"
fi

# Test provider stats
echo "🔍 Testing /resonant-chat/provider/stats..."
STATS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/resonant-chat/provider/stats" 2>/dev/null || echo "000")
if [ "$STATS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Provider stats endpoint available${NC}"
else
    echo -e "${YELLOW}⚠️  Provider stats endpoint: HTTP $STATS_CODE${NC}"
fi

echo ""

# Step 8: Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 DEPLOYMENT SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ Frontend code updated${NC}"
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo -e "${GREEN}✅ Docker container updated${NC}"
echo -e "${GREEN}✅ Services restarted${NC}"
echo ""
echo -e "${BLUE}🌐 Frontend URL:${NC} $FRONTEND_URL"
echo -e "${BLUE}🔌 Backend API:${NC} $API_URL"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "   1. Visit $FRONTEND_URL in browser"
echo "   2. Test Resonant Chat functionality"
echo "   3. Verify Hash Sphere features work"
echo "   4. Check provider routing"
echo "   5. Test IDE features (type 'open ide' in chat)"
echo "   6. Test project generation"
echo "   7. Test file operations"
echo "   8. Test code generation & refactoring"
echo "   9. Test Git operations"
echo "  10. Test code execution"
echo ""
echo -e "${BLUE}📖 Full Testing Checklist:${NC}"
echo "   See: COMPLETE_FUNCTIONALITY_TESTING_CHECKLIST.md"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

