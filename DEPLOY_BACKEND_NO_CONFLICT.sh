#!/bin/bash
# Backend deployment - NO CONFLICTS VERSION
# This handles all potential conflicts automatically

set -e

cd /root/ResonantGraphAIV0.1

# Stash any local changes
echo "📦 Stashing local changes..."
git stash || true

# Fetch and pull latest code
echo "📥 Fetching and pulling latest code..."
git fetch origin main
git pull origin main

# Reset to match GitHub exactly (no conflicts)
echo "🔄 Resetting to match GitHub..."
git reset --hard origin/main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down || docker-compose down || true

# Build and start containers
echo "🏗️  Building and starting containers..."
echo "   This may take 2-5 minutes..."
docker compose up -d --build || docker-compose up -d --build

# Wait for containers to start
echo "⏳ Waiting for containers to start..."
sleep 5

# Check status
echo "🔍 Checking container status..."
docker compose ps || docker-compose ps

# Check API health
echo "🏥 Checking API health..."
sleep 3
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:8001/health 2>/dev/null || echo "000")
if [ "$API_CODE" = "200" ]; then
    echo "✅ API is healthy (HTTP $API_CODE)"
else
    echo "⚠️  API returned: $API_CODE"
    echo "   Check logs: docker compose logs api --tail 20"
fi

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

