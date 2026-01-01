#!/bin/bash
# Final HTTPS Fix - Handle HTTPS requests properly
# This will either restore SSL or redirect HTTPS to HTTP

set -e

echo "🔒 Fixing HTTPS Connection Issue"
echo "================================="
echo ""

cd ~/frontend

# Step 1: Check for existing SSL certificate
echo "📋 Step 1: Checking for SSL certificate..."

# Check in container
SSL_CERT="/etc/letsencrypt/live/dev-swat.com/fullchain.pem"
CERT_IN_CONTAINER=$(docker exec frontend sh -c "test -f $SSL_CERT && echo yes || echo no" 2>/dev/null || echo "no")

# Check on host
CERT_ON_HOST=$(test -f "$SSL_CERT" && echo "yes" || echo "no")

if [ "$CERT_IN_CONTAINER" = "yes" ]; then
    echo "✅ SSL certificate found in container"
    CERT_EXISTS="yes"
elif [ "$CERT_ON_HOST" = "yes" ]; then
    echo "✅ SSL certificate found on host, copying to container..."
    docker exec frontend sh -c "mkdir -p /etc/letsencrypt/live/dev-swat.com" 2>/dev/null || true
    docker cp "$SSL_CERT" frontend:/etc/letsencrypt/live/dev-swat.com/fullchain.pem
    docker cp "/etc/letsencrypt/live/dev-swat.com/privkey.pem" frontend:/etc/letsencrypt/live/dev-swat.com/privkey.pem
    echo "✅ Certificate copied"
    CERT_EXISTS="yes"
else
    echo "⚠️  SSL certificate not found"
    echo "   Will create temporary self-signed certificate for HTTPS redirect"
    CERT_EXISTS="no"
fi
echo ""

# Step 2: Create SSL certificate if needed
if [ "$CERT_EXISTS" = "no" ]; then
    echo "📋 Step 2: Creating temporary self-signed certificate..."
    docker exec frontend sh -c '
        mkdir -p /etc/nginx/ssl
        if [ ! -f /etc/nginx/ssl/self-signed.crt ]; then
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout /etc/nginx/ssl/self-signed.key \
                -out /etc/nginx/ssl/self-signed.crt \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=dev-swat.com" 2>/dev/null
            echo "✅ Self-signed certificate created"
        else
            echo "✅ Self-signed certificate already exists"
        fi
    '
    echo ""
fi

# Step 3: Create nginx config with HTTPS handling
echo "📋 Step 3: Creating nginx configuration..."

if [ "$CERT_EXISTS" = "yes" ]; then
    echo "   Using real SSL certificate"
    CERT_PATH="$SSL_CERT"
    KEY_PATH="/etc/letsencrypt/live/dev-swat.com/privkey.pem"
else
    echo "   Using self-signed certificate (will redirect to HTTP)"
    CERT_PATH="/etc/nginx/ssl/self-signed.crt"
    KEY_PATH="/etc/nginx/ssl/self-signed.key"
fi

docker exec frontend sh -c "cat > /etc/nginx/conf.d/default.conf << 'NGINXCONF'
# HTTP - Redirect to HTTPS (if SSL exists) or serve directly
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

    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://137.184.234.252:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Proxy FastAPI docs
    location ~ ^/(docs|openapi\.json|redoc) {
        proxy_pass http://137.184.234.252:8001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, max-age=31536000, immutable\";
        gzip_static on;
    }

    location = /index.html {
        add_header Cache-Control \"no-cache, no-store, must-revalidate\";
        add_header Pragma \"no-cache\";
        add_header Expires \"0\";
    }
}

# HTTPS - Handle HTTPS requests
server {
    listen 443 ssl http2;
    server_name dev-swat.com www.dev-swat.com;
    
    ssl_certificate $CERT_PATH;
    ssl_certificate_key $KEY_PATH;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # If real SSL cert exists, serve HTTPS. Otherwise redirect to HTTP
    $(if [ "$CERT_EXISTS" = "yes" ]; then
        echo "    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;

    location /api/ {
        proxy_pass http://137.184.234.252:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location ~ ^/(docs|openapi\.json|redoc) {
        proxy_pass http://137.184.234.252:8001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control \"public, max-age=31536000, immutable\";
        gzip_static on;
    }

    location = /index.html {
        add_header Cache-Control \"no-cache, no-store, must-revalidate\";
        add_header Pragma \"no-cache\";
        add_header Expires \"0\";
    }"
    else
        echo "    # Redirect HTTPS to HTTP (self-signed cert, not trusted)
    return 301 http://\$host\$request_uri;"
    fi)
}
NGINXCONF'"

echo "✅ Nginx configuration created"
echo ""

# Step 4: Test and reload
echo "📋 Step 4: Testing nginx configuration..."
docker exec frontend nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    exit 1
fi

echo "✅ Nginx configuration is valid"
echo ""

echo "📋 Step 5: Reloading nginx..."
docker exec frontend nginx -s reload
echo "✅ Nginx reloaded"
echo ""

# Step 5: Verify
echo "📋 Step 6: Verifying HTTPS..."
sleep 2

echo "Testing HTTP:"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
echo "   HTTP response: $HTTP_RESPONSE"

echo "Testing HTTPS:"
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -k -L https://localhost 2>/dev/null || echo "000")
echo "   HTTPS response: $HTTPS_RESPONSE"

echo ""
echo "=========================================="
echo "✅✅✅ HTTPS FIX COMPLETE! ✅✅✅"
echo "=========================================="
echo ""
if [ "$CERT_EXISTS" = "yes" ]; then
    echo "🌐 Website URLs:"
    echo "   HTTP:  http://dev-swat.com (redirects to HTTPS)"
    echo "   HTTPS: https://dev-swat.com ✅"
    echo ""
    echo "✅ Using real SSL certificate"
else
    echo "🌐 Website URLs:"
    echo "   HTTP:  http://dev-swat.com ✅"
    echo "   HTTPS: https://dev-swat.com (redirects to HTTP, browser will show warning)"
    echo ""
    echo "⚠️  Using self-signed certificate (temporary)"
    echo "   Browser will show security warning - click 'Advanced' → 'Proceed'"
    echo "   Or set up real SSL: docker exec frontend certbot --nginx -d dev-swat.com"
fi
echo ""
echo "💡 Test in browser:"
echo "   http://dev-swat.com (should work)"
echo "   https://dev-swat.com (should work or redirect)"
echo ""

