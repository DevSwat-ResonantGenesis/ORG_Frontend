#!/bin/bash
# Fix Backend Not Running Issue
# Run this on your Droplet when backend is down

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING BACKEND CONNECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Navigate to backend directory
echo ""
echo "📋 Step 1: Checking backend directory..."
cd /root/ResonantGraphAIV0.1 || { echo "❌ Backend directory not found at /root/ResonantGraphAIV0.1"; exit 1; }

# Step 2: Check container status
echo ""
echo "📋 Step 2: Checking container status..."
docker compose ps

# Step 3: Check recent logs
echo ""
echo "📋 Step 3: Checking recent backend logs..."
docker compose logs api --tail=30

# Step 4: Restart backend
echo ""
echo "📋 Step 4: Restarting backend..."
docker compose restart api

# Step 5: Wait for backend to start
echo ""
echo "📋 Step 5: Waiting for backend to start (10 seconds)..."
sleep 10

# Step 6: Test backend
echo ""
echo "📋 Step 6: Testing backend connection..."
if curl -s -f http://137.184.234.252:8001/health > /dev/null; then
    echo "   ✅ Backend is now responding!"
    curl -s http://137.184.234.252:8001/health
else
    echo "   ❌ Backend still not responding"
    echo ""
    echo "   Trying full restart..."
    docker compose down
    sleep 5
    docker compose up -d
    sleep 15
    echo ""
    echo "   Testing again..."
    curl -s http://137.184.234.252:8001/health && echo " ✅" || echo " ❌ Still not working - check logs above"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Fix Complete!"
echo ""
echo "📋 Next: Test nginx proxy"
echo "   curl https://dev-swat.com/api/health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

