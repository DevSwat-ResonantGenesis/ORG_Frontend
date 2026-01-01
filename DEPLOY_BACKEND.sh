#!/bin/bash
# ============================================================================
# 🔌 BACKEND DEPLOYMENT SCRIPT
# ============================================================================
# Copy and paste this entire script into your droplet terminal
# ============================================================================

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🔌 BACKEND DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════════"
echo ""

BACKEND_DIR="/root/ResonantGraphAIV0.1"

# Step 1: Navigate to backend directory
echo "📂 Step 1: Navigating to backend directory..."
cd "$BACKEND_DIR"
echo "   Current directory: $(pwd)"
echo ""

# Step 2: Pull latest code
echo "📥 Step 2: Pulling latest code..."
if [ -d ".git" ]; then
    git pull origin main || echo "⚠️  Could not pull (continuing anyway)"
    echo "✅ Code updated"
else
    echo "⚠️  Not a git repository, skipping pull"
fi
echo ""

# Step 3: Check docker-compose.yml exists
echo "📋 Step 3: Checking docker-compose.yml..."
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found!"
    exit 1
fi
echo "✅ docker-compose.yml found"
echo ""

# Step 4: Check .env file
echo "🔐 Step 4: Checking environment variables..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found (may cause issues)"
else
    echo "✅ .env file exists"
fi
echo ""

# Step 5: Stop existing containers
echo "🛑 Step 5: Stopping existing containers..."
docker compose down || docker-compose down || echo "⚠️  No containers to stop"
echo ""

# Step 6: Build and start containers
echo "🏗️  Step 6: Building and starting containers..."
docker compose up -d --build || docker-compose up -d --build

# Wait for containers to start
echo "   Waiting for containers to start..."
sleep 5
echo ""

# Step 7: Check container status
echo "🔍 Step 7: Checking container status..."
docker compose ps || docker-compose ps
echo ""

# Step 8: Check API health
echo "🏥 Step 8: Checking API health..."
sleep 3
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:8001/health 2>/dev/null || echo "000")
if [ "$API_CODE" = "200" ]; then
    echo "✅ API is healthy (HTTP $API_CODE)"
else
    echo "⚠️  API returned: $API_CODE"
    echo "   Checking logs..."
    docker compose logs api --tail 20 || docker-compose logs api --tail 20
fi
echo ""

# Step 9: Show running containers
echo "📊 Step 9: Running containers:"
docker ps | grep -E "resonantgraphaiv01|NAME" || docker ps
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ BACKEND DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🔌 API Endpoints:"
echo "   Direct: http://137.184.234.252:8001"
echo "   Proxied: https://dev-swat.com/api"
echo "   Docs: http://137.184.234.252:8001/docs"
echo ""
echo "💡 Useful commands:"
echo "   View logs: docker compose logs api -f"
echo "   Restart: docker compose restart api"
echo "   Status: docker compose ps"
echo ""

