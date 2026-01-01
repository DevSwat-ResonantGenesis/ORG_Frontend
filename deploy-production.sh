#!/bin/bash

# ResonantGraph AI Frontend - Production Deployment Script
# This script builds and deploys the frontend to production

set -e  # Exit on error

echo "🚀 Starting Production Deployment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from env.example...${NC}"
    if [ -f env.example ]; then
        cp env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env with your production values before continuing!${NC}"
        echo -e "${YELLOW}   Required: VITE_FASTAPI_URL, VITE_STRIPE_TEAM_PRICE_ID, VITE_STRIPE_ENTERPRISE_PRICE_ID${NC}"
        read -p "Press Enter to continue after editing .env..."
    else
        echo -e "${RED}❌ env.example not found. Cannot proceed.${NC}"
        exit 1
    fi
fi

# Load environment variables
source .env

# Check required environment variables
if [ -z "$VITE_FASTAPI_URL" ]; then
    echo -e "${RED}❌ VITE_FASTAPI_URL not set in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables loaded${NC}"
echo "   VITE_FASTAPI_URL: $VITE_FASTAPI_URL"
echo ""

# Step 1: Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
echo -e "${GREEN}✅ Clean complete${NC}"
echo ""

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm ci
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: TypeScript check
echo "🔍 Running TypeScript check..."
npm run build 2>&1 | grep -E "(error|Error)" && {
    echo -e "${RED}❌ TypeScript errors found. Please fix before deploying.${NC}"
    exit 1
} || echo -e "${GREEN}✅ TypeScript check passed${NC}"
echo ""

# Step 4: Build production bundle
echo "🏗️  Building production bundle..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 5: Check build output
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ dist directory not found. Build may have failed.${NC}"
    exit 1
fi

echo "📊 Build Summary:"
du -sh dist
echo ""

# Step 6: Docker build (optional)
read -p "Do you want to build Docker image? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🐳 Building Docker image..."
    docker build \
        --build-arg VITE_API_URL="$VITE_FASTAPI_URL" \
        --build-arg VITE_FASTAPI_URL="$VITE_FASTAPI_URL" \
        -f Dockerfile.prod \
        -t resonantgraph-frontend:latest .
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
        echo ""
        echo "To run the container:"
        echo "  docker run -d --name resonantgraph-frontend -p 80:80 -p 443:443 --restart unless-stopped resonantgraph-frontend:latest"
    else
        echo -e "${RED}❌ Docker build failed${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review DEPLOYMENT_READY_CHECKLIST.md"
echo "2. Test the build locally: npm run preview"
echo "3. Deploy to your server using Docker or static hosting"
echo "4. Configure SSL certificate"
echo "5. Verify all functionality"


