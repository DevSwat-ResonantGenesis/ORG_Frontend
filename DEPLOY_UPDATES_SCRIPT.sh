#!/bin/bash

# 🚀 Quick Update Deployment Script
# Deploys frontend and backend updates to existing droplet
# NO REBUILD NEEDED - Just code updates!

set -e

DROPLET_IP="137.184.234.252"
DROPLET_USER="root"

echo "🚀 Deploying Updates to Droplet"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build Frontend
echo -e "${YELLOW}📦 Step 1: Building frontend...${NC}"
cd /Applications/ResonantGraphAI_FrontendV0.1
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully${NC}"

# Step 2: Create update package
echo ""
echo -e "${YELLOW}📦 Step 2: Creating update package...${NC}"
tar -czf /tmp/frontend-update.tar.gz dist/ nginx.conf
echo -e "${GREEN}✅ Package created${NC}"

# Step 3: Copy to droplet
echo ""
echo -e "${YELLOW}📤 Step 3: Copying to droplet...${NC}"
scp /tmp/frontend-update.tar.gz ${DROPLET_USER}@${DROPLET_IP}:/root/
echo -e "${GREEN}✅ Copied to droplet${NC}"

# Step 4: Deploy on droplet
echo ""
echo -e "${YELLOW}🚀 Step 4: Deploying on droplet...${NC}"
ssh ${DROPLET_USER}@${DROPLET_IP} << 'DEPLOY_EOF'
set -e

echo "📦 Extracting frontend update..."
cd /root
tar -xzf frontend-update.tar.gz

echo "📋 Copying files to container..."
docker cp dist/. frontend:/usr/share/nginx/html/

echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo "✅ Frontend updated!"

echo ""
echo "🔄 Updating backend..."
cd /root/ResonantGraphAIV0.1
git pull origin main || echo "⚠️  Git pull failed - check if repo exists"

echo "🔄 Restarting backend..."
docker compose restart backend || echo "⚠️  Backend restart failed - check service name"

echo ""
echo "📊 Checking services..."
docker ps --format "table {{.Names}}\t{{.Status}}"

echo ""
echo "✅ Deployment complete!"
DEPLOY_EOF

# Step 5: Cleanup
echo ""
echo -e "${YELLOW}🧹 Step 5: Cleaning up...${NC}"
rm -f /tmp/frontend-update.tar.gz
echo -e "${GREEN}✅ Cleanup complete${NC}"

echo ""
echo "================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "🧪 Test your deployment:"
echo "   Frontend: https://dev-swat.com"
echo "   Backend:  http://${DROPLET_IP}:8001/health"
echo ""
echo "📋 Check logs:"
echo "   ssh ${DROPLET_USER}@${DROPLET_IP}"
echo "   docker compose logs -f backend"
echo ""

