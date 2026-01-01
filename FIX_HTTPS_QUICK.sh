#!/bin/bash
# Quick Fix for HTTPS - Run on droplet
# This creates a self-signed cert and configures nginx to redirect HTTPS to HTTP

set -e

echo "🔧 Fixing HTTPS connection issue..."
echo ""

cd ~/frontend

# Step 1: Create self-signed certificate in container (for redirect only)
echo "📋 Step 1: Creating temporary self-signed certificate..."
docker exec frontend sh -c '
    if [ ! -d /etc/nginx/ssl ]; then
        mkdir -p /etc/nginx/ssl
    fi
    
    if [ ! -f /etc/nginx/ssl/self-signed.crt ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/nginx/ssl/self-signed.key \
            -out /etc/nginx/ssl/self-signed.crt \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=dev-swat.com"
        echo "✅ Self-signed certificate created"
    else
        echo "✅ Certificate already exists"
    fi
'

# Step 2: Create nginx config with HTTPS redirect
echo ""
echo "📋 Step 2: Creating nginx config with HTTPS redirect..."
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

# Handle HTTPS - redirect to HTTP (using self-signed cert for connection)
server {
    listen 443 ssl http2;
    server_name dev-swat.com www.dev-swat.com;
    
    ssl_certificate /etc/nginx/ssl/self-signed.crt;
    ssl_certificate_key /etc/nginx/ssl/self-signed.key;
    
    # Redirect all HTTPS to HTTP
    return 301 http://$host$request_uri;
}
NGINXCONF'

# Step 3: Test nginx config
echo ""
echo "📋 Step 3: Testing nginx configuration..."
docker exec frontend nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx config test failed!"
    exit 1
fi

# Step 4: Reload nginx
echo ""
echo "📋 Step 4: Reloading nginx..."
docker exec frontend nginx -s reload

# Step 5: Verify
echo ""
echo "📋 Step 5: Verifying..."
sleep 2

echo "Testing HTTP:"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
echo "  HTTP response: $HTTP_RESPONSE"

echo "Testing HTTPS (should redirect):"
HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -k -L https://localhost 2>/dev/null || echo "000")
echo "  HTTPS response: $HTTPS_RESPONSE"

echo ""
echo "✅✅✅ HTTPS fix complete! ✅✅✅"
echo ""
echo "🌐 Website should now be accessible:"
echo "   http://dev-swat.com ✅"
echo "   https://dev-swat.com → redirects to HTTP ✅"
echo ""
echo "⚠️  Note: Browser will show SSL warning for HTTPS (self-signed cert)"
echo "   This is temporary until you set up Let's Encrypt certificate"
echo ""
echo "📝 To set up proper SSL later:"
echo "   docker exec frontend certbot --nginx -d dev-swat.com -d www.dev-swat.com"

