#!/bin/bash
# Check frontend status on droplet
# Run this ON YOUR DROPLET

echo "🔍 Checking Frontend Status..."
echo ""

# Check containers
echo "📦 Docker Containers:"
docker ps -a
echo ""

# Check compose services
echo "📦 Docker Compose Services:"
cd /root/ResonantGraphAIV0.1
docker compose ps
echo ""

# Check if frontend is in docker-compose.yml
echo "📋 Frontend Service in docker-compose.yml:"
grep -A 10 "frontend:" docker-compose.yml || echo "❌ Frontend service not found in docker-compose.yml"
echo ""

# Check port 80
echo "🔌 Port 80 Status:"
netstat -tulpn | grep :80 || echo "❌ Nothing listening on port 80"
echo ""

# Check nginx
echo "🌐 Nginx Status:"
systemctl status nginx --no-pager -l 2>/dev/null || echo "❌ System nginx not found"
docker ps | grep nginx || echo "❌ Docker nginx not found"
echo ""

# Check frontend build
echo "📁 Frontend Build:"
ls -la /root/frontend/dist/ 2>/dev/null | head -5 || echo "❌ dist/ directory not found"
echo ""

# Check frontend logs
echo "📋 Frontend Logs (last 20 lines):"
docker compose logs frontend --tail 20 2>/dev/null || echo "❌ No frontend logs found"
echo ""

echo "✅ Diagnostic complete!"

