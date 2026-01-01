#!/bin/bash
# Check and fix docker-compose.yml structure
# Run this ON YOUR DROPLET

echo "🔍 Checking docker-compose.yml locations..."
echo ""

# Check backend folder
echo "📁 Backend folder: /root/ResonantGraphAIV0.1"
if [ -f "/root/ResonantGraphAIV0.1/docker-compose.yml" ]; then
    echo "✅ Found docker-compose.yml in backend folder"
    echo ""
    echo "📋 Services in backend docker-compose.yml:"
    grep -n "^[a-z].*:" /root/ResonantGraphAIV0.1/docker-compose.yml | head -10
    echo ""
    echo "🔍 Checking if 'frontend:' service exists:"
    if grep -q "^  frontend:" /root/ResonantGraphAIV0.1/docker-compose.yml || grep -q "^frontend:" /root/ResonantGraphAIV0.1/docker-compose.yml; then
        echo "⚠️  FOUND 'frontend:' service in BACKEND docker-compose.yml"
        echo ""
        echo "📋 Showing frontend section:"
        grep -A 10 "^  frontend:\|^frontend:" /root/ResonantGraphAIV0.1/docker-compose.yml | head -15
    else
        echo "✅ No 'frontend:' service in backend docker-compose.yml"
    fi
else
    echo "❌ docker-compose.yml NOT found in backend folder"
fi

echo ""
echo "📁 Frontend folder: /root/frontend"
if [ -f "/root/frontend/docker-compose.yml" ]; then
    echo "✅ Found docker-compose.yml in frontend folder"
    echo ""
    echo "📋 Services in frontend docker-compose.yml:"
    grep -n "^[a-z].*:" /root/frontend/docker-compose.yml | head -10
else
    echo "❌ docker-compose.yml NOT found in frontend folder"
fi

echo ""
echo "💡 RECOMMENDATION:"
echo "   Backend docker-compose.yml should have: db, ml-worker, api"
echo "   Frontend should have its own docker-compose.yml OR be in nginx config"
echo ""
echo "🔧 To fix: Remove 'frontend:' from backend docker-compose.yml"

