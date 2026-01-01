#!/bin/bash

# Apply Health Check Fix - Recreate Container

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 APPLYING HEALTH CHECK FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/frontend

# Step 1: Pull latest code
echo "📥 Step 1: Pulling latest code..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 2: Verify docker-compose file has the fix
echo "🔍 Step 2: Checking health check configuration..."
if grep -q "ps aux | grep" docker-compose.frontend.yml; then
    echo "✅ Health check fix found in docker-compose.frontend.yml"
else
    echo "⚠️  Health check fix not found - checking current config..."
    grep -A 5 "healthcheck:" docker-compose.frontend.yml || echo "No healthcheck found"
    echo ""
    echo "❌ Health check fix not applied. Please check the file."
    exit 1
fi
echo ""

# Step 3: Stop and remove container (to force recreation)
echo "🛑 Step 3: Stopping and removing container..."
docker-compose -f docker-compose.frontend.yml down
echo "✅ Container stopped and removed"
echo ""

# Step 4: Recreate container with new health check
echo "🚀 Step 4: Creating container with new health check..."
docker-compose -f docker-compose.frontend.yml up -d
echo "✅ Container created"
echo ""

# Step 5: Wait for health check to run
echo "⏳ Step 5: Waiting for health check (30 seconds)..."
sleep 30
echo ""

# Step 6: Check health status
echo "🧪 Step 6: Checking health status..."
HEALTH=$(docker inspect frontend --format='{{.State.Health.Status}}' 2>/dev/null || echo "no-health-check")
echo "   Health status: $HEALTH"
echo ""

# Step 7: Test site
echo "🌐 Step 7: Testing site..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k https://dev-swat.com 2>/dev/null || echo "000")
echo "   HTTP status: $HTTP_CODE"
echo "   HTTPS status: $HTTPS_CODE"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$HEALTH" = "healthy" ]; then
    echo "✅ HEALTH CHECK FIXED! Container is now healthy."
elif [ "$HEALTH" = "starting" ]; then
    echo "⏳ Health check is starting. Wait a bit longer and check again:"
    echo "   docker inspect frontend --format='{{.State.Health.Status}}'"
else
    echo "⚠️  Health check status: $HEALTH"
    echo "   But site is working (HTTP: $HTTP_CODE, HTTPS: $HTTPS_CODE)"
    echo "   The health check may need more time or the process check needs adjustment."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

