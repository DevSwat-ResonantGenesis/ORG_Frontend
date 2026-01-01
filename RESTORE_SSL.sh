#!/bin/bash
# Restore SSL Certificate and HTTPS Configuration
# Run this on the droplet

set -e

echo "🔒 Checking for existing SSL certificates..."
echo ""

# Check if SSL certificate exists
SSL_CERT_PATH="/etc/letsencrypt/live/dev-swat.com/fullchain.pem"
SSL_KEY_PATH="/etc/letsencrypt/live/dev-swat.com/privkey.pem"

echo "📋 Step 1: Checking SSL certificate in container..."
CERT_EXISTS=$(docker exec frontend sh -c "test -f $SSL_CERT_PATH && echo 'yes' || echo 'no'" 2>/dev/null || echo "no")
KEY_EXISTS=$(docker exec frontend sh -c "test -f $SSL_KEY_PATH && echo 'yes' || echo 'no'" 2>/dev/null || echo "no")

if [ "$CERT_EXISTS" = "yes" ] && [ "$KEY_EXISTS" = "yes" ]; then
    echo "✅ SSL certificate found in container!"
    echo "   Certificate: $SSL_CERT_PATH"
    echo "   Key: $SSL_KEY_PATH"
    
    # Check certificate expiry
    echo ""
    echo "📋 Checking certificate expiry..."
    EXPIRY=$(docker exec frontend sh -c "openssl x509 -enddate -noout -in $SSL_CERT_PATH 2>/dev/null | cut -d= -f2" || echo "unknown")
    echo "   Expires: $EXPIRY"
    
    # Check if certificate is valid
    VALID=$(docker exec frontend sh -c "openssl x509 -checkend 0 -noout -in $SSL_CERT_PATH 2>/dev/null && echo 'yes' || echo 'no'" || echo "no")
    if [ "$VALID" = "yes" ]; then
        echo "   Status: ✅ Valid"
    else
        echo "   Status: ❌ Expired or invalid"
    fi
else
    echo "❌ SSL certificate NOT found in container"
    echo "   Checking on host system..."
    
    # Check if cert exists on host
    if [ -f "/etc/letsencrypt/live/dev-swat.com/fullchain.pem" ]; then
        echo "✅ SSL certificate found on host system!"
        echo "   Copying to container..."
        
        # Create directory in container
        docker exec frontend sh -c "mkdir -p /etc/letsencrypt/live/dev-swat.com" 2>/dev/null || true
        
        # Copy certificate files
        docker cp /etc/letsencrypt/live/dev-swat.com/fullchain.pem frontend:/etc/letsencrypt/live/dev-swat.com/fullchain.pem
        docker cp /etc/letsencrypt/live/dev-swat.com/privkey.pem frontend:/etc/letsencrypt/live/dev-swat.com/privkey.pem
        
        echo "✅ Certificate copied to container"
    else
        echo "❌ SSL certificate not found on host either"
        echo "   You may need to set up SSL certificate again"
    fi
fi

echo ""
echo "📋 Step 2: Updating nginx configuration for HTTPS..."
echo ""

# Create nginx config with HTTPS
cd ~/frontend

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

echo "✅ Nginx configuration updated"

echo ""
echo "📋 Step 3: Testing nginx configuration..."
docker exec frontend nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    echo "   This might mean SSL certificate is missing or invalid"
    echo "   Falling back to HTTP-only configuration..."
    
    # Use HTTP-only config as fallback
    docker cp nginx.conf frontend:/etc/nginx/conf.d/default.conf
    docker exec frontend nginx -t
    echo "✅ Using HTTP-only configuration"
else
    echo "✅ Nginx configuration is valid"
fi

echo ""
echo "📋 Step 4: Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "📋 Step 5: Verifying HTTPS..."
sleep 2

# Test HTTPS
HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" -k https://localhost 2>/dev/null || echo "000")
if [ "$HTTPS_TEST" = "200" ] || [ "$HTTPS_TEST" = "301" ] || [ "$HTTPS_TEST" = "302" ]; then
    echo "✅ HTTPS is working (HTTP $HTTPS_TEST)"
else
    echo "⚠️  HTTPS test returned HTTP $HTTPS_TEST"
    echo "   This might be normal if certificate is missing"
fi

# Test HTTP redirect
HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" -L http://localhost 2>/dev/null || echo "000")
if [ "$HTTP_TEST" = "200" ] || [ "$HTTP_TEST" = "301" ] || [ "$HTTP_TEST" = "302" ]; then
    echo "✅ HTTP redirect is working (HTTP $HTTP_TEST)"
else
    echo "⚠️  HTTP test returned HTTP $HTTP_TEST"
fi

echo ""
echo "=========================================="
echo "✅✅✅ SSL Configuration Complete! ✅✅✅"
echo "=========================================="
echo ""
echo "🌐 Website URLs:"
echo "   HTTP:  http://dev-swat.com (redirects to HTTPS)"
echo "   HTTPS: https://dev-swat.com"
echo ""
echo "🔍 Verify SSL certificate:"
echo "   docker exec frontend openssl x509 -in /etc/letsencrypt/live/dev-swat.com/fullchain.pem -text -noout | grep -A 2 'Validity'"
echo ""
echo "📝 If SSL certificate is missing or expired:"
echo "   1. Make sure domain DNS points to: 137.184.234.252"
echo "   2. Run: docker exec frontend certbot --nginx -d dev-swat.com -d www.dev-swat.com"
echo ""

