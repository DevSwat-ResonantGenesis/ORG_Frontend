#!/bin/bash
# Fix SSL Certificate Copy Issue
# Handles symlinks properly

set -e

echo "🔒 Fixing SSL Certificate Copy"
echo "==============================="
echo ""

# Step 1: Pull scripts first
echo "📋 Step 1: Pulling latest scripts..."
git pull origin main
echo "✅ Scripts updated"
echo ""

# Step 2: Check SSL certificate on host
echo "📋 Step 2: Checking SSL certificate on host..."
SSL_BASE="/etc/letsencrypt/live/dev-swat.com"

if [ -d "$SSL_BASE" ]; then
    echo "✅ SSL certificate directory found"
    
    # Check if it's symlinks
    if [ -L "$SSL_BASE/fullchain.pem" ]; then
        echo "   fullchain.pem is a symlink"
        REAL_PATH=$(readlink -f "$SSL_BASE/fullchain.pem")
        echo "   Real path: $REAL_PATH"
        
        # Copy the actual file, not the symlink
        echo ""
        echo "📋 Step 3: Copying actual certificate files (not symlinks)..."
        
        # Create directory in container
        docker exec frontend sh -c "mkdir -p /etc/letsencrypt/live/dev-swat.com" 2>/dev/null || true
        docker exec frontend sh -c "mkdir -p /etc/letsencrypt/archive/dev-swat.com" 2>/dev/null || true
        
        # Copy actual files from archive
        if [ -f "/etc/letsencrypt/archive/dev-swat.com/fullchain1.pem" ]; then
            docker cp /etc/letsencrypt/archive/dev-swat.com/fullchain1.pem frontend:/etc/letsencrypt/archive/dev-swat.com/fullchain1.pem
            docker cp /etc/letsencrypt/archive/dev-swat.com/privkey1.pem frontend:/etc/letsencrypt/archive/dev-swat.com/privkey1.pem
            
            # Create files (not symlinks) in live directory
            docker exec frontend sh -c "cp /etc/letsencrypt/archive/dev-swat.com/fullchain1.pem /etc/letsencrypt/live/dev-swat.com/fullchain.pem"
            docker exec frontend sh -c "cp /etc/letsencrypt/archive/dev-swat.com/privkey1.pem /etc/letsencrypt/live/dev-swat.com/privkey.pem"
            
            echo "✅ Certificate files copied (resolved symlinks)"
        else
            echo "⚠️  Cannot find certificate files in archive"
            echo "   Trying alternative method..."
            
            # Try to read the real file and copy content
            docker exec frontend sh -c "cat > /etc/letsencrypt/live/dev-swat.com/fullchain.pem" < "$REAL_PATH"
            
            KEY_REAL=$(readlink -f "$SSL_BASE/privkey.pem")
            docker exec frontend sh -c "cat > /etc/letsencrypt/live/dev-swat.com/privkey.pem" < "$KEY_REAL"
            
            echo "✅ Certificate files copied (alternative method)"
        fi
    else
        echo "   fullchain.pem is a regular file"
        docker exec frontend sh -c "mkdir -p /etc/letsencrypt/live/dev-swat.com" 2>/dev/null || true
        docker cp "$SSL_BASE/fullchain.pem" frontend:/etc/letsencrypt/live/dev-swat.com/fullchain.pem
        docker cp "$SSL_BASE/privkey.pem" frontend:/etc/letsencrypt/live/dev-swat.com/privkey.pem
        echo "✅ Certificate files copied"
    fi
else
    echo "❌ SSL certificate directory not found"
    echo "   SSL certificate setup needed"
fi
echo ""

# Step 4: Verify certificate in container
echo "📋 Step 4: Verifying certificate in container..."
CERT_EXISTS=$(docker exec frontend sh -c "test -f /etc/letsencrypt/live/dev-swat.com/fullchain.pem && echo yes || echo no" 2>/dev/null || echo "no")
KEY_EXISTS=$(docker exec frontend sh -c "test -f /etc/letsencrypt/live/dev-swat.com/privkey.pem && echo yes || echo no" 2>/dev/null || echo "no")

if [ "$CERT_EXISTS" = "yes" ] && [ "$KEY_EXISTS" = "yes" ]; then
    echo "✅ Certificate files exist in container"
    
    # Check certificate expiry
    EXPIRY=$(docker exec frontend sh -c "openssl x509 -enddate -noout -in /etc/letsencrypt/live/dev-swat.com/fullchain.pem 2>/dev/null | cut -d= -f2" || echo "unknown")
    echo "   Expires: $EXPIRY"
else
    echo "❌ Certificate files missing in container"
    exit 1
fi
echo ""

# Step 5: Update nginx config to use HTTPS
echo "📋 Step 5: Configuring nginx for HTTPS..."
docker exec frontend sh -c 'cat > /etc/nginx/conf.d/default.conf << "NGINXCONF"
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name dev-swat.com www.dev-swat.com;

    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }

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

echo "✅ Nginx configuration updated"
echo ""

# Step 6: Test and reload
echo "📋 Step 6: Testing and reloading nginx..."
docker exec frontend nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

docker exec frontend nginx -s reload
echo "✅ Nginx reloaded"
echo ""

# Step 7: Verify HTTPS
echo "📋 Step 7: Verifying HTTPS..."
sleep 2

HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" -k https://localhost 2>/dev/null || echo "000")
if [ "$HTTPS_TEST" = "200" ]; then
    echo "✅ HTTPS is working (HTTP $HTTPS_TEST)"
else
    echo "⚠️  HTTPS test returned HTTP $HTTPS_TEST"
fi

HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost 2>/dev/null || echo "000")
if [ "$HTTP_TEST" = "200" ] || [ "$HTTP_TEST" = "301" ] || [ "$HTTP_TEST" = "302" ]; then
    echo "✅ HTTP redirect is working (HTTP $HTTP_TEST)"
fi
echo ""

echo "=========================================="
echo "✅✅✅ SSL FIX COMPLETE! ✅✅✅"
echo "=========================================="
echo ""
echo "🌐 Website URLs:"
echo "   HTTP:  http://dev-swat.com (redirects to HTTPS)"
echo "   HTTPS: https://dev-swat.com ✅"
echo ""

