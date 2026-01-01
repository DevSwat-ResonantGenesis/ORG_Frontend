#!/bin/bash

# Diagnose Frontend Container Issues

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 DIAGNOSING FRONTEND CONTAINER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check container logs
echo "📋 Container logs (last 30 lines):"
docker logs frontend --tail=30 2>&1
echo ""

# Check nginx error logs
echo "❌ Nginx error logs:"
docker exec frontend cat /var/log/nginx/error.log 2>/dev/null | tail -20 || echo "No error log found"
echo ""

# Check nginx access logs
echo "📊 Nginx access logs (last 10 lines):"
docker exec frontend cat /var/log/nginx/access.log 2>/dev/null | tail -10 || echo "No access log found"
echo ""

# Test nginx config
echo "🔧 Testing nginx config:"
docker exec frontend nginx -t 2>&1
echo ""

# Check if nginx is running
echo "🔄 Checking nginx process:"
docker exec frontend ps aux | grep nginx || echo "Nginx not running"
echo ""

# Check health endpoint
echo "🏥 Health check:"
docker inspect frontend --format='{{json .State.Health}}' 2>/dev/null | python3 -m json.tool 2>/dev/null || docker inspect frontend --format='{{.State.Health.Status}}' 2>/dev/null || echo "No health check configured"
echo ""

# Test HTTP from inside container
echo "🌐 Testing HTTP from inside container:"
docker exec frontend curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost || echo "HTTP test failed"
echo ""

# Check port bindings
echo "🔌 Port bindings:"
docker port frontend
echo ""

# Check container status
echo "📊 Container status:"
docker inspect frontend --format='Status: {{.State.Status}}
Health: {{.State.Health.Status}}
Started: {{.State.StartedAt}}
Finished: {{.State.FinishedAt}}' 2>/dev/null || echo "Could not get status"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

