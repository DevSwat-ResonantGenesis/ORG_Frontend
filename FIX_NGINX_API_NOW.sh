#!/bin/bash
# Quick Fix: Add API Proxy to Nginx Config
# Run this on the droplet NOW

set -e

echo "🔧 Fixing Nginx API Proxy Configuration..."
echo ""

cd ~/frontend

# Step 1: Check current nginx config
echo "📋 Step 1: Checking current nginx config..."
CURRENT_CONFIG=$(docker exec frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null || echo "")

if echo "$CURRENT_CONFIG" | grep -q "location /api/"; then
    echo "⚠️  API proxy config exists but verification script didn't detect it"
    echo "   Checking if it's correct..."
    echo "$CURRENT_CONFIG" | grep -A 10 "location /api/"
else
    echo "❌ API proxy config is missing"
    echo "   Adding it now..."
fi
echo ""

# Step 2: Get current config and add API proxy if missing
echo "📋 Step 2: Updating nginx configuration..."

# Check if SSL certificate exists
SSL_CERT="/etc/letsencrypt/live/dev-swat.com/fullchain.pem"
CERT_EXISTS=$(docker exec frontend sh -c "test -f $SSL_CERT && echo 'yes' || echo 'no'" 2>/dev/null || echo "no")

if [ "$CERT_EXISTS" = "yes" ]; then
    echo "   Using HTTPS configuration (SSL certificate found)"
    
    docker exec frontend sh -c 'cat > /etc/nginx/conf.d/default.conf << "NGINXCONF"
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name dev-swat.com www.dev-swat.com;

    # Let'\''s Encrypt verification
    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS - Main server
server {
    listen 443 ssl http2;
    server_name dev-swat.com www.dev-swat.com;

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

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://137.184.234.252:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
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
else
    echo "   Using HTTP configuration (no SSL certificate)"
    
    docker exec frontend sh -c 'cat > /etc/nginx/conf.d/default.conf << "NGINXCONF"
server {
    listen 80;
    server_name dev-swat.com www.dev-swat.com;

    root /usr/share/nginx/html;
    index index.html;

    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy API requests to backend
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
fi

echo "✅ Nginx configuration updated"
echo ""

# Step 3: Test and reload
echo "📋 Step 3: Testing nginx configuration..."
docker exec frontend nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

echo "✅ Nginx configuration is valid"
echo ""

echo "📋 Step 4: Reloading nginx..."
docker exec frontend nginx -s reload
echo "✅ Nginx reloaded"
echo ""

# Step 4: Verify API proxy
echo "📋 Step 5: Verifying API proxy..."
sleep 2

echo "Testing /api/health endpoint..."
API_RESPONSE=$(curl -s http://localhost/api/health 2>/dev/null || echo "ERROR")
if echo "$API_RESPONSE" | grep -q "status\|ok\|health"; then
    echo "✅ API proxy is working correctly!"
    echo "   Response: $API_RESPONSE" | head -1
elif echo "$API_RESPONSE" | grep -q "<!doctype html>"; then
    echo "⚠️  API proxy returning HTML instead of JSON"
    echo "   This might mean the proxy isn't matching correctly"
    echo "   Checking nginx config..."
    docker exec frontend cat /etc/nginx/conf.d/default.conf | grep -A 10 "location /api/"
else
    echo "⚠️  API response: $API_RESPONSE"
fi
echo ""

echo "Testing direct backend..."
BACKEND_RESPONSE=$(curl -s http://localhost:8001/health 2>/dev/null || echo "ERROR")
if echo "$BACKEND_RESPONSE" | grep -q "status\|ok"; then
    echo "✅ Backend is responding correctly"
    echo "   Response: $BACKEND_RESPONSE" | head -1
else
    echo "⚠️  Backend response: $BACKEND_RESPONSE"
fi
echo ""

echo "=========================================="
echo "✅✅✅ Nginx API Proxy Fixed! ✅✅✅"
echo "=========================================="
echo ""
echo "🔍 Verify:"
echo "   curl http://localhost/api/health"
echo "   curl http://localhost:8001/health"
echo ""

