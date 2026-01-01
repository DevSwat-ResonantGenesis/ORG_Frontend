#!/bin/bash

# Apply Module D Database Migration
# This script applies the agent teams migration and verifies it

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 APPLYING MODULE D DATABASE MIGRATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /Applications/ResonantGraphAIV0.1

# Check if using Docker
if command -v docker &> /dev/null && docker compose ps api &> /dev/null; then
    echo "📋 Using Docker Compose..."
    
    # Check if API container is running
    if ! docker compose ps api | grep -q "Up"; then
        echo "⚠️  API container not running. Starting it..."
        docker compose up -d api
        sleep 5
    fi
    
    echo ""
    echo "📋 Step 1: Checking current migration status..."
    docker compose exec api alembic current || echo "⚠️  Could not get current migration"
    
    echo ""
    echo "📋 Step 2: Checking migration heads..."
    docker compose exec api alembic heads
    
    echo ""
    echo "📋 Step 3: Applying migration (upgrade to head)..."
    if docker compose exec api alembic upgrade head; then
        echo "✅ Migration applied successfully!"
    else
        echo "❌ Migration failed. Trying 'heads' instead..."
        docker compose exec api alembic upgrade heads
    fi
    
    echo ""
    echo "📋 Step 4: Verifying migration..."
    docker compose exec api alembic current
    
    echo ""
    echo "📋 Step 5: Restarting API to load new router..."
    docker compose restart api
    
    echo ""
    echo "⏳ Waiting for API to start..."
    sleep 10
    
    echo ""
    echo "📋 Step 6: Testing API health..."
    if curl -s http://localhost:8001/health > /dev/null; then
        echo "✅ API is healthy!"
    else
        echo "⚠️  API health check failed (may still be starting)"
    fi
    
    echo ""
    echo "✅ Migration process complete!"
    
else
    echo "📋 Using local Python environment..."
    cd backend
    
    # Check if virtual environment exists
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    echo ""
    echo "📋 Step 1: Checking current migration status..."
    alembic current || echo "⚠️  Could not get current migration"
    
    echo ""
    echo "📋 Step 2: Checking migration heads..."
    alembic heads
    
    echo ""
    echo "📋 Step 3: Applying migration (upgrade to head)..."
    alembic upgrade head
    
    echo ""
    echo "📋 Step 4: Verifying migration..."
    alembic current
    
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "📝 Next: Restart your backend server to load the new router"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 MODULE D MIGRATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Verify backend is running"
echo "2. Test API: curl http://localhost:8001/agent-teams"
echo "3. Test frontend: Navigate to http://localhost:5175/agent-teams"
echo ""

