#!/bin/bash
# Simple Frontend Deployment Script
# Run this DIRECTLY on your droplet (no SSH needed)

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🚀 SIMPLE FRONTEND DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're on the droplet
if [ ! -d "/root" ]; then
    echo -e "${RED}❌ This script must be run on the droplet as root${NC}"
    exit 1
fi

FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1-"

# Step 1: Check if frontend directory exists
echo "📁 Step 1: Checking frontend directory..."
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found: $FRONTEND_DIR${NC}"
    echo "   Available directories in /root/:"
    ls -la /root/ | grep "^d"
    exit 1
fi
echo -e "${GREEN}✅ Frontend directory found${NC}"
echo ""

# Step 2: Navigate to frontend directory
echo "📂 Step 2: Navigating to frontend directory..."
cd "$FRONTEND_DIR"
echo "   Current directory: $(pwd)"
echo ""

# Step 3: Pull latest code (if git repo)
echo "📥 Step 3: Pulling latest code..."
if [ -d ".git" ]; then
    git pull origin main || echo -e "${YELLOW}⚠️  Could not pull (may not be connected to git)${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository, skipping pull${NC}"
fi
echo ""

# Step 4: Install dependencies
echo "📦 Step 4: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing npm packages..."
    npm install
else
    echo "   node_modules exists, skipping install (use 'npm install' if needed)"
fi
echo ""

# Step 5: Build frontend
echo "🏗️  Step 5: Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist/ folder not created${NC}"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Build failed - index.html not found in dist/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 6: Check if frontend container exists
echo "🐳 Step 6: Checking Docker container..."
if ! docker ps -a | grep -q "frontend"; then
    echo -e "${RED}❌ Frontend container does not exist${NC}"
    echo "   Creating container..."
    docker run -d --name frontend -p 80:80 -p 443:443 \
        -v /etc/letsencrypt:/etc/letsencrypt:ro \
        --restart unless-stopped \
        nginx:alpine
    sleep 2
fi

if ! docker ps | grep -q "frontend"; then
    echo "   Starting container..."
    docker start frontend
    sleep 2
fi

if docker ps | grep -q "frontend"; then
    echo -e "${GREEN}✅ Frontend container is running${NC}"
else
    echo -e "${RED}❌ Failed to start container${NC}"
    docker logs frontend --tail 20
    exit 1
fi
echo ""

# Step 7: Copy files to container
echo "📋 Step 7: Copying files to container..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' || true
docker cp dist/. frontend:/usr/share/nginx/html/

# Verify files were copied
FILE_COUNT=$(docker exec frontend sh -c 'find /usr/share/nginx/html -type f 2>/dev/null | wc -l' 2>/dev/null || echo "0")
if [ "$FILE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Files copied successfully ($FILE_COUNT files)${NC}"
else
    echo -e "${RED}❌ No files found in container${NC}"
    exit 1
fi

if docker exec frontend test -f /usr/share/nginx/html/index.html; then
    echo -e "${GREEN}✅ index.html exists in container${NC}"
else
    echo -e "${RED}❌ index.html MISSING in container${NC}"
    exit 1
fi
echo ""

# Step 8: Update nginx config
echo "⚙️  Step 8: Updating nginx configuration..."
NGINX_CONFIG_DIR="/root/frontend"

if [ -f "$NGINX_CONFIG_DIR/nginx-ssl.conf" ]; then
    docker cp "$NGINX_CONFIG_DIR/nginx-ssl.conf" frontend:/etc/nginx/conf.d/default.conf
    echo "   Config copied from $NGINX_CONFIG_DIR/nginx-ssl.conf"
elif [ -f "nginx-ssl.conf" ]; then
    docker cp nginx-ssl.conf frontend:/etc/nginx/conf.d/default.conf
    echo "   Config copied from current directory"
else
    echo -e "${YELLOW}⚠️  nginx-ssl.conf not found, creating basic config...${NC}"
    docker exec frontend sh -c 'cat > /etc/nginx/conf.d/default.conf << "EOF"
server {
    listen 80;
    server_name dev-swat.com www.dev-swat.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dev-swat.com www.dev-swat.com;

    ssl_certificate /etc/letsencrypt/live/dev-swat.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev-swat.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location /api {
        proxy_pass http://137.184.234.252:8001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF'
fi

# Test nginx config
if docker exec frontend nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    docker exec frontend nginx -s reload
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    docker exec frontend nginx -t
    exit 1
fi
echo ""

# Step 9: Verify deployment
echo "🔍 Step 9: Verifying deployment..."
sleep 2

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:80 2>/dev/null || echo "000")
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://localhost:443 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ HTTP (port 80) redirecting correctly${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP (port 80) returned: $HTTP_CODE${NC}"
fi

if [ "$HTTPS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ HTTPS (port 443) responding correctly${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS (port 443) returned: $HTTPS_CODE${NC}"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Your website should be available at:"
echo "   https://dev-swat.com"
echo ""
echo "💡 If the website doesn't load:"
echo "   1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   2. Check: docker logs frontend"
echo "   3. Check: docker exec frontend nginx -t"
echo ""

