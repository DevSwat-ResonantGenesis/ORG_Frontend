#!/bin/bash
# Complete Setup: SSL + API + Frontend-Backend Connection
# Run this on the droplet to restore everything

set -e

echo "🚀 Complete Setup: SSL + API + Backend Connection"
echo "=================================================="
echo ""

cd ~/frontend

# Step 1: Check for existing SSL certificate
echo "📋 Step 1: Checking for SSL certificate..."
SSL_CERT="/etc/letsencrypt/live/dev-swat.com/fullchain.pem"
SSL_KEY="/etc/letsencrypt/live/dev-swat.com/privkey.pem"

# Check in container
CERT_IN_CONTAINER=$(docker exec frontend sh -c "test -f $SSL_CERT && echo 'yes' || echo 'no'" 2>/dev/null || echo "no")

# Check on host
CERT_ON_HOST=$(test -f "$SSL_CERT" && echo "yes" || echo "no")

if [ "$CERT_IN_CONTAINER" = "yes" ]; then
    echo "✅ SSL certificate found in container"
    CERT_EXISTS="yes"
elif [ "$CERT_ON_HOST" = "yes" ]; then
    echo "✅ SSL certificate found on host, copying to container..."
    docker exec frontend sh -c "mkdir -p /etc/letsencrypt/live/dev-swat.com" 2>/dev/null || true
    docker cp "$SSL_CERT" frontend:/etc/letsencrypt/live/dev-swat.com/fullchain.pem
    docker cp "$SSL_KEY" frontend:/etc/letsencrypt/live/dev-swat.com/privkey.pem
    echo "✅ Certificate copied to container"
    CERT_EXISTS="yes"
else
    echo "⚠️  SSL certificate not found"
    echo "   Will set up HTTPS redirect configuration"
    echo "   You can get SSL certificate later with: certbot"
    CERT_EXISTS="no"
fi
echo ""

# Step 2: Check backend API
echo "📋 Step 2: Checking backend API..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health 2>/dev/null || echo "000")

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo "✅ Backend API is running and healthy"
    BACKEND_IP="137.184.234.252"
    BACKEND_PORT="8001"
else
    echo "⚠️  Backend API not responding on port 8001"
    echo "   Checking docker containers..."
    if docker ps | grep -q "api\|resonantgraphaiv01-api"; then
        echo "   Backend container is running, but API not responding"
        echo "   Check logs: cd ~/ResonantGraphAIV0.1 && docker compose logs api"
    else
        echo "   Backend container is not running"
        echo "   Start it: cd ~/ResonantGraphAIV0.1 && docker compose up -d"
    fi
    BACKEND_IP="137.184.234.252"
    BACKEND_PORT="8001"
fi
echo ""

# Step 3: Create complete nginx configuration
echo "📋 Step 3: Creating complete nginx configuration..."
echo ""

if [ "$CERT_EXISTS" = "yes" ]; then
    echo "   Using HTTPS configuration with SSL certificate"
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
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
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
        add_header X-Content-Type-Options "nosniff";
        gzip_static on;
        add_header Vary "Accept-Encoding";
    }

    # Don'\''t cache index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
NGINXCONF'
else
    echo "   Using HTTP configuration (SSL certificate not found)"
    docker exec frontend sh -c 'cat > /etc/nginx/conf.d/default.conf << "NGINXCONF"
server {
    listen 80;
    server_name dev-swat.com www.dev-swat.com;

    root /usr/share/nginx/html;
    index index.html;

    # Let'\''s Encrypt verification
    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
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
        add_header X-Content-Type-Options "nosniff";
        gzip_static on;
        add_header Vary "Accept-Encoding";
    }

    # Don'\''t cache index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
}
NGINXCONF'
fi

echo "✅ Nginx configuration created"
echo ""

# Step 4: Test nginx configuration
echo "📋 Step 4: Testing nginx configuration..."
docker exec frontend nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi
echo "✅ Nginx configuration is valid"
echo ""

# Step 5: Reload nginx
echo "📋 Step 5: Reloading nginx..."
docker exec frontend nginx -s reload
echo "✅ Nginx reloaded"
echo ""

# Step 6: Verify everything
echo "📋 Step 6: Verifying setup..."
sleep 2

echo "Testing HTTP:"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
echo "   HTTP response: $HTTP_RESPONSE"

if [ "$CERT_EXISTS" = "yes" ]; then
    echo "Testing HTTPS:"
    HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -k https://localhost 2>/dev/null || echo "000")
    echo "   HTTPS response: $HTTPS_RESPONSE"
fi

echo "Testing API proxy:"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "000")
echo "   API /api/health response: $API_RESPONSE"

if [ "$API_RESPONSE" = "200" ]; then
    echo "   API response body:"
    curl -s http://localhost/api/health | head -3
fi

echo ""
echo "=========================================="
echo "✅✅✅ COMPLETE SETUP FINISHED! ✅✅✅"
echo "=========================================="
echo ""
echo "🌐 Website URLs:"
if [ "$CERT_EXISTS" = "yes" ]; then
    echo "   HTTP:  http://dev-swat.com (redirects to HTTPS)"
    echo "   HTTPS: https://dev-swat.com ✅"
else
    echo "   HTTP:  http://dev-swat.com ✅"
    echo "   HTTPS: https://dev-swat.com (SSL certificate needed)"
fi
echo ""
echo "🔌 API Endpoints:"
echo "   - Health: http://dev-swat.com/api/health"
echo "   - Docs:   http://dev-swat.com/api/docs"
echo "   - Direct: http://137.184.234.252:8001"
echo ""
echo "🔍 Verify everything:"
echo "   bash VERIFY_API_CONNECTION.sh"
echo ""

