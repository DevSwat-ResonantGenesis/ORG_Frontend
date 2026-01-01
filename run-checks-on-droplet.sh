#!/bin/bash
# Run these commands directly on the droplet (no SSH needed)

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 DROPLET STATUS CHECK - Running Directly on Droplet"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# 1. Check folders
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 1. CHECKING FOLDERS IN /root/"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -la /root/
echo ""

# 2. Check Docker containers
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 2. CHECKING DOCKER CONTAINERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker ps -a
echo ""

# 3. Check if frontend files exist
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📄 3. CHECKING FRONTEND FILES IN CONTAINER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker ps | grep -q frontend; then
    docker exec frontend ls -la /usr/share/nginx/html/ | head -10
    echo ""
    echo "File count: $(docker exec frontend sh -c 'find /usr/share/nginx/html -type f 2>/dev/null | wc -l' 2>/dev/null || echo '0')"
    if docker exec frontend test -f /usr/share/nginx/html/index.html 2>/dev/null; then
        echo "✅ index.html exists"
    else
        echo "❌ index.html MISSING"
    fi
else
    echo "❌ Frontend container is not running"
fi
echo ""

# 4. Check nginx config
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  4. CHECKING NGINX CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if docker ps | grep -q frontend; then
    docker exec frontend nginx -t
    echo ""
    echo "Current nginx config (first 40 lines):"
    docker exec frontend cat /etc/nginx/conf.d/default.conf 2>/dev/null | head -40
else
    echo "❌ Frontend container is not running"
fi
echo ""

# 5. Check ports
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 5. CHECKING PORTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
netstat -tuln | grep -E ':(80|443|8001|9000)'
echo ""

# 6. Additional checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 6. ADDITIONAL CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check frontend directory
echo "Frontend directory status:"
if [ -d "/root/ResonantGraphAI_FrontendV0.1-" ]; then
    echo "✅ Frontend directory exists"
    echo "   Size: $(du -sh /root/ResonantGraphAI_FrontendV0.1- 2>/dev/null | cut -f1)"
    if [ -d "/root/ResonantGraphAI_FrontendV0.1-/dist" ]; then
        echo "✅ dist/ folder exists"
        echo "   Files in dist/: $(find /root/ResonantGraphAI_FrontendV0.1-/dist -type f 2>/dev/null | wc -l)"
        if [ -f "/root/ResonantGraphAI_FrontendV0.1-/dist/index.html" ]; then
            echo "✅ index.html exists in dist/"
        else
            echo "❌ index.html MISSING in dist/"
        fi
    else
        echo "❌ dist/ folder MISSING"
    fi
else
    echo "❌ Frontend directory MISSING"
fi
echo ""

# Check backend directory
echo "Backend directory status:"
if [ -d "/root/ResonantGraphAIV0.1" ]; then
    echo "✅ Backend directory exists"
    if [ -f "/root/ResonantGraphAIV0.1/docker-compose.yml" ]; then
        echo "✅ docker-compose.yml exists"
    else
        echo "❌ docker-compose.yml MISSING"
    fi
else
    echo "❌ Backend directory MISSING"
fi
echo ""

# Test connectivity
echo "Testing local connectivity:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:80 2>/dev/null || echo "000")
echo "   HTTP (port 80): $HTTP_CODE"

HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://localhost:443 2>/dev/null || echo "000")
echo "   HTTPS (port 443): $HTTPS_CODE"

API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8001/health 2>/dev/null || echo "000")
echo "   API (port 8001): $API_CODE"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ Check complete!"
echo "═══════════════════════════════════════════════════════════════"

