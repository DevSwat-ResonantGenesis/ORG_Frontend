#!/bin/bash

# Frontend Deployment Script for DigitalOcean Droplet
# Run this on your droplet: /root/deploy-frontend.sh

set -e

FRONTEND_DIR="/root/frontend"
REPO_URL="https://github.com/louienemesh/ResonantGraphAI_FrontendV0.1.git"
BRANCH="main"
BACKEND_URL="http://137.184.234.252:8001"

echo "🚀 Starting frontend deployment..."

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Clone or update repository
if [ -d "$FRONTEND_DIR" ]; then
    echo "📥 Updating existing repository..."
    cd "$FRONTEND_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
    git clean -fd
else
    echo "📥 Cloning repository..."
    git clone -b $BRANCH $REPO_URL "$FRONTEND_DIR"
    cd "$FRONTEND_DIR"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build with environment variables
echo "🏗️ Building frontend..."
export VITE_API_URL="$BACKEND_URL"
export VITE_FASTAPI_URL="$BACKEND_URL"
npm run build

# Copy built files to nginx directory
echo "📋 Copying files to nginx..."
rm -rf /var/www/html/*
cp -r dist/* /var/www/html/

# Create nginx configuration
echo "⚙️ Configuring nginx..."
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name _;

    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Test nginx configuration
nginx -t

# Restart nginx
echo "🔄 Restarting nginx..."
systemctl restart nginx
systemctl enable nginx

echo "✅ Frontend deployed successfully!"
echo "🌐 Frontend should be accessible at: http://$(curl -s ifconfig.me):80"
echo "📝 Or your configured domain if DNS is set up"

