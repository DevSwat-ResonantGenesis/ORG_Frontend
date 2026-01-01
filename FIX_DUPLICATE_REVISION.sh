#!/bin/bash

# Fix Duplicate Revision 20250205_0007 Error
# This script handles the specific case where a revision appears twice

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING DUPLICATE REVISION ERROR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /root/ResonantGraphAIV0.1

# Ensure API container is running
echo ""
echo "📋 Step 1: Starting API container..."
docker compose up -d api
sleep 5

# Check if container is actually running
if ! docker compose ps api | grep -q "Up"; then
    echo "⚠️  API container failed to start. Checking logs..."
    docker compose logs api --tail=20
    exit 1
fi

echo ""
echo "📋 Step 2: Checking current migration heads..."
docker compose exec api alembic heads

echo ""
echo "📋 Step 3: Checking current database revision..."
docker compose exec api alembic current || echo "⚠️  Could not get current revision"

echo ""
echo "📋 Step 4: Merging all heads..."
docker compose exec api alembic merge heads -m "merge duplicate heads" || {
    echo "⚠️  Merge command had issues, but continuing..."
}

echo ""
echo "📋 Step 5: Upgrading database..."
# Try 'head' first, if that fails try 'heads'
if ! docker compose exec api alembic upgrade head; then
    echo "⚠️  'upgrade head' failed, trying 'upgrade heads'..."
    docker compose exec api alembic upgrade heads
fi

echo ""
echo "📋 Step 6: Verifying migration status..."
docker compose exec api alembic current

echo ""
echo "📋 Step 7: Restarting API..."
docker compose restart api

echo ""
echo "⏳ Waiting for API to start..."
sleep 15

echo ""
echo "📋 Step 8: Checking API status..."
docker compose ps api

echo ""
echo "🧪 Testing API health endpoint..."
if curl -s http://137.184.234.252:8001/health > /dev/null; then
    echo "✅ API is responding!"
    curl -s http://137.184.234.252:8001/health
    echo ""
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ FIX COMPLETE - API is running!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    echo "❌ API is still not responding"
    echo ""
    echo "📋 Recent API logs:"
    docker compose logs api --tail=30
    echo ""
    echo "⚠️  Please check the logs above for errors"
fi

