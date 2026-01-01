#!/bin/bash

# Fix Nginx SSL Configuration
set -e

echo "🔧 Fixing nginx SSL configuration..."

# Step 1: Check current nginx config
echo "📋 Step 1: Checking current nginx config..."
docker exec frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null | head -30

# Step 2: Check if SSL certs exist
echo ""
echo "🔍 Step 2: Checking SSL certificates..."
if [ -d "/etc/letsencrypt/live/dev-swat.com" ]; then
    echo "✅ SSL certificates found at /etc/letsencrypt/live/dev-swat.com"
    SSL_CERT="/etc/letsencrypt/live/dev-swat.com/fullchain.pem"
    SSL_KEY="/etc/letsencrypt/live/dev-swat.com/privkey.pem"
elif [ -d "/root/frontend/ssl" ]; then
    echo "✅ SSL certificates found at /root/frontend/ssl"
    SSL_CERT="/root/frontend/ssl/fullchain.pem"
    SSL_KEY="/root/frontend/ssl/privkey.pem"
else
    echo "⚠️  SSL certificates not found - site will work on HTTP only"
    SSL_CERT=""
    SSL_KEY=""
fi

# Step 3: Check if container has SSL certs mounted
echo ""
echo "🔍 Step 3: Checking container SSL setup..."
docker inspect frontend --format='{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}' | grep -i ssl || echo "No SSL mounts found"

# Step 4: Test nginx
echo ""
echo "🧪 Step 4: Testing nginx..."
if docker exec frontend nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Nginx config is valid"
else
    echo "❌ Nginx config has errors:"
    docker exec frontend nginx -t 2>&1
    echo ""
    echo "Restarting container to reset config..."
    docker restart frontend
    sleep 5
fi

# Step 5: Test site access
echo ""
echo "🧪 Step 5: Testing site access..."
echo "   Testing HTTP..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
echo "   HTTP response: $HTTP_CODE"

echo "   Testing HTTPS..."
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k https://dev-swat.com 2>/dev/null || echo "000")
echo "   HTTPS response: $HTTPS_CODE"

# Step 6: Check container logs
echo ""
echo "📋 Step 6: Recent container logs..."
docker logs frontend --tail=10 2>&1 | tail -5

# Step 7: Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTP is working!"
    echo "🌐 Site accessible at: http://dev-swat.com"
fi

if [ "$HTTPS_CODE" = "200" ]; then
    echo "✅ HTTPS is working!"
    echo "🌐 Site accessible at: https://dev-swat.com"
elif [ "$HTTPS_CODE" != "000" ]; then
    echo "⚠️  HTTPS returned: $HTTPS_CODE"
    echo "   This might be an SSL certificate issue"
fi

if [ "$HTTP_CODE" != "200" ] && [ "$HTTPS_CODE" != "200" ]; then
    echo "❌ Site is not responding"
    echo ""
    echo "Container status:"
    docker ps | grep frontend
    echo ""
    echo "Try: docker restart frontend"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

