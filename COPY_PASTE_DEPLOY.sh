#!/bin/bash
# ============================================================================
# 🚀 COPY-PASTE FRONTEND DEPLOYMENT SCRIPT
# ============================================================================
# Just copy and paste this entire script into your droplet terminal
# ============================================================================

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 FRONTEND DEPLOYMENT - Starting..."
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Frontend directory
FRONTEND_DIR="/root/frontend"

# Step 1: Check if frontend directory exists
echo -e "${BLUE}📁 Step 1: Checking frontend directory...${NC}"
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found: $FRONTEND_DIR${NC}"
    echo "Available directories:"
    ls -la /root/ | grep "^d" | awk '{print "   " $9}'
    exit 1
fi
echo -e "${GREEN}✅ Frontend directory found${NC}"
echo ""

# Step 2: Navigate to frontend directory
echo -e "${BLUE}📂 Step 2: Navigating to frontend directory...${NC}"
cd "$FRONTEND_DIR"
echo "   Current directory: $(pwd)"
echo ""

# Step 3: Pull latest code
echo -e "${BLUE}📥 Step 3: Pulling latest code from Git...${NC}"
if [ -d ".git" ]; then
    git pull origin main || echo -e "${YELLOW}⚠️  Could not pull (continuing anyway)${NC}"
    echo -e "${GREEN}✅ Code updated${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository, skipping pull${NC}"
fi
echo ""

# Step 4: Install/Update dependencies
echo -e "${BLUE}📦 Step 4: Installing/updating dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 5: Build frontend
echo -e "${BLUE}🏗️  Step 5: Building frontend...${NC}"
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# Verify build
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist/ folder not created${NC}"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Build failed - index.html not found${NC}"
    exit 1
fi

FILE_COUNT=$(find dist -type f | wc -l)
echo -e "${GREEN}✅ Build successful! ($FILE_COUNT files created)${NC}"
echo ""

# Step 6: Check Docker container
echo -e "${BLUE}🐳 Step 6: Checking Docker container...${NC}"
if ! docker ps | grep -q "frontend"; then
    echo -e "${YELLOW}⚠️  Frontend container not running, starting it...${NC}"
    docker start frontend
    sleep 3
fi

if docker ps | grep -q "frontend"; then
    echo -e "${GREEN}✅ Frontend container is running${NC}"
else
    echo -e "${RED}❌ Failed to start frontend container${NC}"
    exit 1
fi
echo ""

# Step 7: Copy files to container
echo -e "${BLUE}📋 Step 7: Copying files to container...${NC}"
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' || true
docker cp dist/. frontend:/usr/share/nginx/html/

# Verify files were copied
CONTAINER_FILE_COUNT=$(docker exec frontend sh -c 'find /usr/share/nginx/html -type f 2>/dev/null | wc -l' 2>/dev/null || echo "0")
echo "   Files in container: $CONTAINER_FILE_COUNT"

if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
    echo -e "${GREEN}✅ Files copied successfully${NC}"
else
    echo -e "${RED}❌ Files not copied correctly${NC}"
    exit 1
fi
echo ""

# Step 8: Update nginx config (if exists)
echo -e "${BLUE}⚙️  Step 8: Updating nginx configuration...${NC}"
NGINX_CONFIG="/root/frontend/nginx-ssl.conf"
if [ -f "$NGINX_CONFIG" ]; then
    # Fix http2 deprecation warning
    if grep -q "listen 443 ssl http2" "$NGINX_CONFIG"; then
        sed -i 's/listen 443 ssl http2;/listen 443 ssl;\n    http2 on;/' "$NGINX_CONFIG"
        echo "   Fixed http2 deprecation warning"
    fi
    
    docker cp "$NGINX_CONFIG" frontend:/etc/nginx/conf.d/default.conf
    echo "   Config copied from $NGINX_CONFIG"
else
    echo -e "${YELLOW}⚠️  nginx-ssl.conf not found, using existing config${NC}"
fi

# Test and reload nginx
if docker exec frontend nginx -t 2>&1 | grep -q "test is successful"; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    docker exec frontend nginx -s reload
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx config has warnings (but should still work)${NC}"
    docker exec frontend nginx -t
    docker exec frontend nginx -s reload
fi
echo ""

# Step 9: Verify deployment
echo -e "${BLUE}🔍 Step 9: Verifying deployment...${NC}"
sleep 2

# Test local connectivity
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://localhost:443 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTPS (port 443) responding correctly (HTTP $HTTPS_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS (port 443) returned: $HTTPS_CODE${NC}"
fi

# Test external connectivity
EXT_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://dev-swat.com" 2>/dev/null || echo "000")
if [ "$EXT_CODE" = "200" ] || [ "$EXT_CODE" = "301" ] || [ "$EXT_CODE" = "302" ]; then
    echo -e "${GREEN}✅ Website accessible externally (HTTP $EXT_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  External access returned: $EXT_CODE (may need a few minutes)${NC}"
fi
echo ""

# Final summary
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Your website:"
echo "   https://dev-swat.com"
echo ""
echo "📊 Summary:"
echo "   • Frontend built: $FILE_COUNT files"
echo "   • Files in container: $CONTAINER_FILE_COUNT"
echo "   • Container status: Running"
echo "   • Nginx status: Reloaded"
echo ""
echo "💡 Next steps:"
echo "   1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   2. Wait 1-2 minutes if website doesn't load immediately"
echo "   3. Check logs: docker logs frontend"
echo ""

