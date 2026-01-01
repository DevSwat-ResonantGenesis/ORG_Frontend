#!/bin/bash

# Fix HTTPS - Mount SSL certificates and configure nginx
set -e

echo "🔧 Fixing HTTPS..."

# Step 1: Check SSL certs
echo "📋 Step 1: Checking SSL certificates..."
if [ -f "/etc/letsencrypt/live/dev-swat.com/fullchain.pem" ]; then
    echo "✅ SSL certificates found"
    CERT_PATH="/etc/letsencrypt/live/dev-swat.com"
else
    echo "❌ SSL certificates not found"
    exit 1
fi

# Step 2: Check current container setup
echo ""
echo "📋 Step 2: Checking container..."
CONTAINER_ID=$(docker ps | grep frontend | grep "443" | awk '{print $1}' | head -1)
if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Container not found"
    exit 1
fi
echo "✅ Container: $CONTAINER_ID"

# Step 3: Check if certs are already mounted
echo ""
echo "🔍 Step 3: Checking SSL mounts..."
docker inspect frontend --format='{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}' | grep -i letsencrypt && {
    echo "✅ SSL already mounted"
    exit 0
} || echo "⚠️  SSL not mounted"

# Step 4: Stop container and recreate with SSL mount
echo ""
echo "🔄 Step 4: Recreating container with SSL certificates..."
docker stop frontend
docker rm frontend

# Get the image
IMAGE=$(docker images | grep frontend | head -1 | awk '{print $1":"$2}' || echo "frontend:latest")
echo "   Using image: $IMAGE"

# Recreate with SSL mount
docker run -d \
  --name frontend \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v /usr/share/nginx/html:/usr/share/nginx/html \
  --restart unless-stopped \
  "$IMAGE"

sleep 5

# Step 5: Deploy files
echo ""
echo "📤 Step 5: Deploying files..."
cd /root/frontend
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' 2>/dev/null || true
docker cp dist/. frontend:/usr/share/nginx/html/

# Step 6: Add HTTPS config to nginx
echo ""
echo "🔧 Step 6: Configuring HTTPS in nginx..."
docker exec frontend sh -c 'cat > /etc/nginx/conf.d/ssl.conf << "NGINX_SSL"
# HTTPS server
server {
    listen 443 ssl http2;
    server_name dev-swat.com www.dev-swat.com;

    ssl_certificate /etc/letsencrypt/live/dev-swat.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev-swat.com/privkey.pem;

    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files $uri /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://137.184.234.252:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name dev-swat.com www.dev-swat.com;
    return 301 https://$server_name$request_uri;
}
NGINX_SSL' 2>/dev/null || echo "⚠️  Could not create SSL config"

# Step 7: Test and reload
echo ""
echo "🧪 Step 7: Testing nginx config..."
if docker exec frontend nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx config OK"
    docker exec frontend nginx -s reload
    sleep 2
else
    echo "❌ Nginx config error:"
    docker exec frontend nginx -t 2>&1
    echo "Restarting container..."
    docker restart frontend
    sleep 5
fi

# Step 8: Test HTTPS
echo ""
echo "🧪 Step 8: Testing HTTPS..."
sleep 2
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://dev-swat.com 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "200" ]; then
    echo "✅ HTTPS IS WORKING!"
    echo "🌐 Site: https://dev-swat.com"
else
    echo "⚠️  HTTPS returned: $HTTPS_CODE"
    echo "   Check: docker logs frontend --tail=20"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DONE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

