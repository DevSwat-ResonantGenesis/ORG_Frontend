#!/bin/bash

# Frontend Deployment Script for DigitalOcean Droplet
# Run this on your droplet
# Supports both: nginx static deployment AND Docker deployment
#
# DIRECTORY STRUCTURE:
#   ~/frontend/                          - Nginx config files (nginx.conf, nginx-ssl.conf)
#   ~/ResonantGraphAI_FrontendV0.1-/    - Frontend source code (where you build)
#   ~/ResonantGraphAIV0.1/               - Backend repository
#
# USAGE:
#   This script should be run from ~/ResonantGraphAI_FrontendV0.1- directory
#   Or it will automatically navigate there

set -e

echo "🚀 Starting frontend deployment..."

# Verify we're in the correct directory or navigate to it
FRONTEND_SOURCE_DIR="/root/ResonantGraphAI_FrontendV0.1-"
FRONTEND_CONFIG_DIR="/root/frontend"

# Check current directory
CURRENT_DIR=$(pwd)
echo "📍 Current directory: $CURRENT_DIR"

# Navigate to frontend source directory (where we build)
if [ "$CURRENT_DIR" != "$FRONTEND_SOURCE_DIR" ]; then
    echo "📂 Navigating to frontend source directory: $FRONTEND_SOURCE_DIR"
    cd "$FRONTEND_SOURCE_DIR" || {
        echo "❌ Directory $FRONTEND_SOURCE_DIR not found. Cloning repository..."
        cd /root
        git clone git@github.com:louienemesh/ResonantGraphAI_FrontendV0.1-.git
        cd "$FRONTEND_SOURCE_DIR"
    }
    echo "✅ Now in: $(pwd)"
fi

# Verify we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the frontend source directory?"
    echo "   Expected: $FRONTEND_SOURCE_DIR"
    echo "   Current:  $(pwd)"
    exit 1
fi

FRONTEND_DIR="$FRONTEND_SOURCE_DIR"
BACKEND_URL="http://137.184.234.252:8001"
DEPLOYMENT_METHOD="${1:-docker}"  # docker (default) or nginx

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build with environment variables
echo "🏗️ Building frontend..."
echo "   📍 Building in: $(pwd)"
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

if [ "$DEPLOYMENT_METHOD" = "docker" ]; then
    # Docker deployment (recommended)
    echo "🐳 Deploying to Docker container..."
    
    # Step 1: Update nginx config from ~/frontend directory
    echo "📋 Step 1: Updating nginx config..."
    cd "$FRONTEND_CONFIG_DIR" || {
        echo "❌ Nginx config directory not found: $FRONTEND_CONFIG_DIR"
        echo "   Creating it and cloning config..."
        mkdir -p "$FRONTEND_CONFIG_DIR"
        cd "$FRONTEND_CONFIG_DIR"
        # You may need to manually copy nginx-ssl.conf here
    }
    echo "   📍 Now in: $(pwd) (nginx config directory)"
    
    # Pull latest nginx config if it's a git repo, or use existing
    if [ -d ".git" ]; then
        git pull origin main || echo "⚠️  Could not pull nginx config, using existing"
    fi
    
    # Copy nginx config to container
    if [ -f "nginx-ssl.conf" ]; then
        docker cp nginx-ssl.conf frontend:/etc/nginx/conf.d/default.conf
        docker exec frontend nginx -t
        docker exec frontend nginx -s reload
        echo "✅ Nginx config updated"
    else
        echo "⚠️  nginx-ssl.conf not found in $FRONTEND_CONFIG_DIR"
    fi
    
    # Step 2: Copy built frontend files
    echo "📋 Step 2: Copying built files to Docker container..."
    cd "$FRONTEND_DIR"
    echo "   📍 Now in: $(pwd) (frontend source directory)"
    
    docker exec frontend rm -rf /usr/share/nginx/html/*
    docker cp dist/. frontend:/usr/share/nginx/html/
    
    echo ""
    echo "✅ Frontend deployed successfully to Docker!"
    echo "🌐 Access at: https://dev-swat.com"
    echo "🔗 API Proxy: https://dev-swat.com/api/*"
    
else
    # Nginx static deployment (legacy)
    echo "📋 Deploying to nginx static directory..."
    rm -rf /var/www/html/*
    cp -r dist/* /var/www/html/
    
    # Configure nginx for SPA (if not already configured)
    if ! grep -q "try_files" /etc/nginx/sites-available/default; then
        echo "⚙️ Configuring nginx for SPA..."
        cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
    fi
    
    # Test and restart nginx
    echo "🔄 Restarting nginx..."
    nginx -t && systemctl restart nginx
    
    echo ""
    echo "✅ Frontend deployed successfully!"
    echo "🌐 Access at: http://137.184.234.252"
fi

echo ""
echo "📝 Directory Reference:"
echo "   ~/frontend                          - Nginx config files"
echo "   ~/ResonantGraphAI_FrontendV0.1-    - Frontend source (where you build)"
echo "   See DEPLOYMENT_GUIDE.md for details"

