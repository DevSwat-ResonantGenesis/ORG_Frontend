#!/bin/bash

# Fix Backend Database Migration and Start API
# This script fixes the "Multiple head revisions" error and starts the API

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING BACKEND DATABASE MIGRATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /root/ResonantGraphAIV0.1

# Check if API container exists
if ! docker compose ps api | grep -q "resonantgraphaiv01-api"; then
    echo "⚠️  API container not found. Starting containers..."
    docker compose up -d api
    sleep 5
fi

# Check if API container is running
if ! docker compose ps api | grep -q "Up"; then
    echo "⚠️  API container not running. Starting it..."
    docker compose start api
    sleep 5
fi

echo ""
echo "📋 Step 1: Checking current migration status..."
docker compose exec api alembic current || echo "⚠️  Could not get current migration (container may be starting)"

echo ""
echo "📋 Step 2: Listing all migration heads..."
docker compose exec api alembic heads

echo ""
echo "📋 Step 3: Merging migration heads..."
docker compose exec api alembic merge heads || {
    echo "❌ Failed to merge heads. Trying to continue anyway..."
}

echo ""
echo "📋 Step 4: Upgrading database to head..."
docker compose exec api alembic upgrade head || {
    echo "❌ Failed to upgrade. Trying 'heads' instead..."
    docker compose exec api alembic upgrade heads
}

echo ""
echo "📋 Step 5: Restarting API container..."
docker compose restart api

echo ""
echo "⏳ Waiting for API to start..."
sleep 10

echo ""
echo "📋 Step 6: Checking API status..."
docker compose ps api

echo ""
echo "🧪 Testing API health endpoint..."
if curl -s http://137.184.234.252:8001/health > /dev/null; then
    echo "✅ API is responding!"
    curl -s http://137.184.234.252:8001/health
    echo ""
else
    echo "❌ API is still not responding. Checking logs..."
    echo ""
    echo "--- Last 30 lines of API logs ---"
    docker compose logs api --tail=30
    echo ""
    echo "⚠️  Please check the logs above for errors"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Migration fix complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

