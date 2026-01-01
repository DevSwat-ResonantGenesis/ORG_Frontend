#!/bin/bash

# Check Frontend Container Status and Fix Issues

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHECKING FRONTEND STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check container status
echo "📊 Container Status:"
docker ps | grep frontend
echo ""

# Check if files are in container
echo "📁 Checking files in container:"
docker exec frontend ls -la /usr/share/nginx/html/ | head -10
echo ""

# Check nginx config
echo "🔧 Checking nginx config:"
docker exec frontend nginx -t 2>&1
echo ""

# Check container logs
echo "📋 Recent logs (last 20 lines):"
docker logs frontend --tail=20
echo ""

# Check health
echo "🏥 Health check:"
docker inspect frontend --format='{{.State.Health.Status}}' 2>/dev/null || echo "No health check configured"
echo ""

# Test HTTP
echo "🌐 Testing HTTP:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost || echo "HTTP test failed"
echo ""

# Test HTTPS
echo "🔒 Testing HTTPS:"
curl -s -o /dev/null -w "HTTPS Status: %{http_code}\n" -k https://dev-swat.com || echo "HTTPS test failed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

