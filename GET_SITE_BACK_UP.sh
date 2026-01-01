#!/bin/bash

# Get Site Back Up - Simple and Direct
set -e

echo "🔧 Getting site back up..."

# Check what's running
echo "📋 Checking containers..."
docker ps | grep -E "frontend|nginx"

# Check if nginx is responding
echo ""
echo "🧪 Testing nginx..."
curl -I http://localhost 2>&1 | head -5 || echo "⚠️  Local nginx not responding"

# Check if files are in container
echo ""
echo "📁 Checking files in container..."
docker exec frontend ls -la /usr/share/nginx/html/ | head -5 || echo "⚠️  Can't access container"

# Check nginx config
echo ""
echo "🔍 Checking nginx config..."
docker exec frontend nginx -t 2>&1 || echo "⚠️  Nginx config issue"

# Check ports
echo ""
echo "🔌 Checking ports..."
netstat -tlnp | grep -E ":80|:443" || ss -tlnp | grep -E ":80|:443" || echo "⚠️  Can't check ports"

# Simple fix: restart everything
echo ""
echo "🔄 Restarting services..."
docker restart frontend
sleep 5

# Test again
echo ""
echo "🧪 Testing site..."
curl -I https://dev-swat.com 2>&1 | head -10 || curl -I http://dev-swat.com 2>&1 | head -10 || echo "⚠️  Site not responding"

echo ""
echo "✅ Done. Check: docker ps | grep frontend"

