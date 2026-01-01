#!/bin/bash
# Quick one-liner droplet status check
# Run this directly on your droplet: bash quick-droplet-check.sh

echo "🔍 QUICK DROPLET STATUS CHECK"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# System info
echo "📊 SYSTEM:"
echo "   Hostname: $(hostname)"
echo "   IP: $(hostname -I | awk '{print $1}')"
echo "   Disk: $(df -h / | tail -1 | awk '{print $5 " used (" $4 " free)"}')"
echo "   Memory: $(free -h | grep Mem | awk '{print $3 " / " $2}')"
echo ""

# Folders
echo "📁 FOLDERS:"
[ -d "/root/ResonantGraphAI_FrontendV0.1-" ] && echo "   ✅ Frontend: /root/ResonantGraphAI_FrontendV0.1-" || echo "   ❌ Frontend: MISSING"
[ -d "/root/ResonantGraphAIV0.1" ] && echo "   ✅ Backend: /root/ResonantGraphAIV0.1" || echo "   ❌ Backend: MISSING"
[ -d "/root/frontend" ] && echo "   ✅ Nginx Config: /root/frontend" || echo "   ❌ Nginx Config: MISSING"
[ -d "/root/ResonantGraphAI_FrontendV0.1-/dist" ] && echo "   ✅ Frontend dist/ exists" || echo "   ❌ Frontend dist/ MISSING"
[ -f "/root/ResonantGraphAI_FrontendV0.1-/dist/index.html" ] && echo "   ✅ index.html exists" || echo "   ❌ index.html MISSING"
echo ""

# Docker
echo "🐳 DOCKER:"
if command -v docker &> /dev/null; then
    echo "   ✅ Docker installed"
    if systemctl is-active --quiet docker; then
        echo "   ✅ Docker running"
    else
        echo "   ❌ Docker NOT running"
    fi
else
    echo "   ❌ Docker NOT installed"
fi
echo ""

# Containers
echo "📦 CONTAINERS:"
if docker ps | grep -q frontend; then
    echo "   ✅ frontend: RUNNING"
    docker exec frontend ls /usr/share/nginx/html/index.html &>/dev/null && echo "   ✅ Files in container" || echo "   ❌ No files in container"
else
    echo "   ❌ frontend: NOT RUNNING"
fi

if docker ps | grep -q resonantgraphaiv01-api-1; then
    echo "   ✅ API: RUNNING"
else
    echo "   ❌ API: NOT RUNNING"
fi

if docker ps | grep -q resonantgraphaiv01-ml-worker-1; then
    echo "   ✅ ML Worker: RUNNING"
else
    echo "   ⚠️  ML Worker: NOT RUNNING (optional)"
fi
echo ""

# Ports
echo "🌐 PORTS:"
for port in 80 443 8001; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo "   ✅ Port $port: LISTENING"
    else
        echo "   ❌ Port $port: NOT LISTENING"
    fi
done
echo ""

# Connectivity
echo "🌍 CONNECTIVITY:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:80 2>/dev/null || echo "000")
[ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ] && echo "   ✅ HTTP (80): OK ($HTTP_CODE)" || echo "   ❌ HTTP (80): FAILED ($HTTP_CODE)"

HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -k https://localhost:443 2>/dev/null || echo "000")
[ "$HTTPS_CODE" = "200" ] || [ "$HTTPS_CODE" = "301" ] || [ "$HTTPS_CODE" = "302" ] && echo "   ✅ HTTPS (443): OK ($HTTPS_CODE)" || echo "   ❌ HTTPS (443): FAILED ($HTTPS_CODE)"

API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8001/health 2>/dev/null || echo "000")
[ "$API_CODE" = "200" ] && echo "   ✅ API (8001): OK ($API_CODE)" || echo "   ❌ API (8001): FAILED ($API_CODE)"
echo ""

# External
echo "🌐 EXTERNAL:"
EXT_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://dev-swat.com" 2>/dev/null || echo "000")
[ "$EXT_CODE" = "200" ] || [ "$EXT_CODE" = "301" ] || [ "$EXT_CODE" = "302" ] && echo "   ✅ Website accessible: OK ($EXT_CODE)" || echo "   ❌ Website NOT accessible: FAILED ($EXT_CODE)"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "💡 For detailed check, run: bash check-droplet-status.sh"
echo "═══════════════════════════════════════════════════════════════"

