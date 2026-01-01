#!/bin/bash
# Clean Rebuild Frontend Container
# This will completely remove and rebuild the frontend container

set -e

echo "🧹 Cleaning and Rebuilding Frontend Container"
echo "=============================================="
echo ""

# Make sure we're in the frontend directory on droplet
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from frontend directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: ~/frontend"
    echo "   Run: cd ~/frontend && bash CLEAN_REBUILD_FRONTEND.sh"
    exit 1
fi

FRONTEND_DIR=$(pwd)
echo "📍 Building in: $FRONTEND_DIR"
echo "   This is the source code directory (where we build)"
echo "   We will copy dist/ to container (not source code)"
echo ""

# Step 1: Stop and remove container
echo "📋 Step 1: Stopping and removing frontend container..."
docker stop frontend 2>/dev/null || echo "   Container not running"
docker rm frontend 2>/dev/null || echo "   Container doesn't exist"
echo "✅ Old container removed"
echo ""

# Step 2: Remove old image (optional - comment out if you want to keep it)
echo "📋 Step 2: Removing old frontend image..."
docker rmi frontend:latest 2>/dev/null || echo "   Image doesn't exist or is in use"
echo "✅ Old image removed"
echo ""

# Step 3: Pull latest code
echo "📋 Step 3: Pulling latest code..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 4: Rebuild frontend
echo "📋 Step 4: Rebuilding frontend..."
echo "   Location: $FRONTEND_DIR"
echo "   This builds dist/ folder (which we copy to container)"
echo ""
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ ! -d "dist" ] || [ -z "$(ls -A dist 2>/dev/null)" ]; then
    echo "❌ Build failed! dist directory is empty"
    exit 1
fi

echo "✅ Frontend built successfully"
echo "   Build output: dist/ folder (this is what goes to container)"
echo "   Bundle sizes:"
ls -lh dist/assets/ | grep -E "vendor|chart" | awk '{printf "   %-40s %6s\n", $9, $5}' | head -5
echo ""
echo "   Note: Only dist/ folder is copied to container, not source code"
echo ""

# Step 5: Build Docker image
echo "📋 Step 5: Building Docker image..."
if [ ! -f "Dockerfile.prod" ]; then
    echo "❌ Dockerfile.prod not found!"
    exit 1
fi

docker build -f Dockerfile.prod -t frontend:latest \
    --build-arg VITE_API_URL="/api" \
    --build-arg VITE_FASTAPI_URL="/api" \
    .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker image built successfully"
echo ""

# Step 6: Check for SSL certificate
echo "📋 Step 6: Checking for SSL certificate..."
SSL_CERT="/etc/letsencrypt/live/dev-swat.com/fullchain.pem"
CERT_ON_HOST=$(test -f "$SSL_CERT" && echo "yes" || echo "no")

if [ "$CERT_ON_HOST" = "yes" ]; then
    echo "✅ SSL certificate found on host"
    CERT_EXISTS="yes"
else
    echo "⚠️  SSL certificate not found (will use HTTP or self-signed)"
    CERT_EXISTS="no"
fi
echo ""

# Step 7: Run container
echo "📋 Step 7: Starting new container..."
docker run -d \
    --name frontend \
    -p 80:80 \
    -p 443:443 \
    --restart unless-stopped \
    frontend:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container!"
    exit 1
fi

# Wait for container to start
sleep 3

# Verify container is running
if docker ps | grep -q frontend; then
    echo "✅ Container is running"
else
    echo "❌ Container failed to start!"
    docker logs frontend --tail 50
    exit 1
fi
echo ""

# Step 8: Copy SSL certificate if it exists
if [ "$CERT_EXISTS" = "yes" ]; then
    echo "📋 Step 8: Copying SSL certificate to container..."
    docker exec frontend sh -c "mkdir -p /etc/letsencrypt/live/dev-swat.com" 2>/dev/null || true
    docker cp "$SSL_CERT" frontend:/etc/letsencrypt/live/dev-swat.com/fullchain.pem
    docker cp "/etc/letsencrypt/live/dev-swat.com/privkey.pem" frontend:/etc/letsencrypt/live/dev-swat.com/privkey.pem
    echo "✅ SSL certificate copied"
    echo ""
fi

# Step 9: Configure nginx
echo "📋 Step 9: Configuring nginx..."

# Run the HTTPS fix script to set up nginx properly
if [ -f "FIX_HTTPS_FINAL.sh" ]; then
    echo "   Using FIX_HTTPS_FINAL.sh to configure nginx..."
    bash FIX_HTTPS_FINAL.sh
else
    echo "   Creating basic nginx config..."
    docker exec frontend sh -c 'cat > /etc/nginx/conf.d/default.conf << "NGINXCONF"
server {
    listen 80;
    server_name dev-swat.com www.dev-swat.com;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # API proxy
    location /api/ {
        proxy_pass http://137.184.234.252:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXCONF'
    docker exec frontend nginx -t
    docker exec frontend nginx -s reload
fi
echo ""

# Step 10: Verify everything
echo "📋 Step 10: Verifying deployment..."
sleep 2

echo "Testing HTTP:"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
if [ "$HTTP_RESPONSE" = "200" ]; then
    echo "   ✅ HTTP: Working (HTTP $HTTP_RESPONSE)"
else
    echo "   ⚠️  HTTP: HTTP $HTTP_RESPONSE"
fi

echo "Testing HTTPS:"
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -k https://localhost 2>/dev/null || echo "000")
if [ "$HTTPS_RESPONSE" = "200" ] || [ "$HTTPS_RESPONSE" = "301" ] || [ "$HTTPS_RESPONSE" = "302" ]; then
    echo "   ✅ HTTPS: Working (HTTP $HTTPS_RESPONSE)"
else
    echo "   ⚠️  HTTPS: HTTP $HTTPS_RESPONSE"
fi

echo "Testing API:"
API_RESPONSE=$(curl -s http://localhost/api/health 2>/dev/null || echo "ERROR")
if echo "$API_RESPONSE" | grep -q "status\|ok"; then
    echo "   ✅ API: Working"
    echo "   Response: $API_RESPONSE" | head -1
else
    echo "   ⚠️  API: $API_RESPONSE"
fi
echo ""

echo "=========================================="
echo "✅✅✅ CLEAN REBUILD COMPLETE! ✅✅✅"
echo "=========================================="
echo ""
echo "🌐 Website:"
echo "   HTTP:  http://dev-swat.com"
if [ "$CERT_EXISTS" = "yes" ]; then
    echo "   HTTPS: https://dev-swat.com ✅"
else
    echo "   HTTPS: https://dev-swat.com (may redirect or show warning)"
fi
echo ""
echo "🔌 API:"
echo "   http://dev-swat.com/api/health"
echo ""
echo "📊 Container Status:"
docker ps | grep frontend
echo ""
echo "💡 If HTTPS doesn't work, run:"
echo "   bash FIX_HTTPS_FINAL.sh"
echo ""

