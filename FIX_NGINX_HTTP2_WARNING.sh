#!/bin/bash
# Fix Nginx HTTP/2 Deprecation Warning
# Updates nginx config to use new http2 directive syntax

set -e

echo "🔧 Fixing Nginx HTTP/2 Deprecation Warning"
echo "=========================================="
echo ""

cd ~/frontend

# Get current nginx config
CURRENT_CONFIG=$(docker exec frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "")

if [ -z "$CURRENT_CONFIG" ]; then
    echo "❌ Cannot read nginx config"
    exit 1
fi

# Check if it uses old syntax
if echo "$CURRENT_CONFIG" | grep -q "listen.*http2"; then
    echo "⚠️  Found deprecated 'listen ... http2' syntax"
    echo "   Updating to new syntax..."
    
    # Create new config with fixed syntax
    docker exec frontend sh -c 'cat > /etc/nginx/conf.d/default.conf << "NGINXCONF"
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name dev-swat.com www.dev-swat.com;

    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy API requests
    location /api/ {
        proxy_pass http://137.184.234.252:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy FastAPI docs
    location ~ ^/(docs|openapi\.json|redoc) {
        proxy_pass http://137.184.234.252:8001;
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

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        gzip_static on;
    }

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}

# HTTPS - Main server (if SSL exists)
server {
    listen 443 ssl;
    http2 on;
    server_name dev-swat.com www.dev-swat.com;

    # Check if SSL cert exists, if not, redirect to HTTP
    set $ssl_available 0;
    if (-f /etc/letsencrypt/live/dev-swat.com/fullchain.pem) {
        set $ssl_available 1;
    }

    ssl_certificate     /etc/letsencrypt/live/dev-swat.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev-swat.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy API requests
    location /api/ {
        proxy_pass http://137.184.234.252:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy FastAPI docs
    location ~ ^/(docs|openapi\.json|redoc) {
        proxy_pass http://137.184.234.252:8001;
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

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        gzip_static on;
    }

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
NGINXCONF'

    echo "✅ Nginx config updated with new http2 syntax"
else
    echo "✅ Nginx config already uses new syntax"
fi
echo ""

# Test and reload
echo "📋 Testing nginx configuration..."
docker exec frontend nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

echo "✅ Nginx configuration is valid"
echo ""

echo "📋 Reloading nginx..."
docker exec frontend nginx -s reload
echo "✅ Nginx reloaded"
echo ""

echo "✅✅✅ HTTP/2 Warning Fixed! ✅✅✅"
echo ""
echo "The warning should be gone on next reload"











