#!/bin/bash
# Restart Backend Server to Load New Endpoints
# Run this script to restart the backend and load the new DELETE and archive endpoints

set -e

echo "🔄 Restarting Backend Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if we're in the backend directory or need to navigate
if [ -f "docker-compose.yml" ]; then
    BACKEND_DIR="."
elif [ -d "/Applications/ResonantGraphAIV0.1" ]; then
    BACKEND_DIR="/Applications/ResonantGraphAIV0.1"
    cd "$BACKEND_DIR"
else
    echo "❌ Backend directory not found. Please run this from the backend directory."
    exit 1
fi

echo "📋 Current directory: $(pwd)"
echo ""

# Check if docker compose is available
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

echo "🔍 Checking backend container status..."
$DOCKER_COMPOSE_CMD ps api backend 2>/dev/null || echo "⚠️  Backend container not found in compose"

echo ""
echo "🔄 Restarting backend container..."
if $DOCKER_COMPOSE_CMD restart api 2>/dev/null; then
    echo "✅ Backend restarted via docker-compose (api service)"
elif $DOCKER_COMPOSE_CMD restart backend 2>/dev/null; then
    echo "✅ Backend restarted via docker-compose (backend service)"
else
    # Try to find and restart backend container directly
    BACKEND_CONTAINER=$(docker ps -a --format "{{.Names}}" | grep -iE "backend|api|fastapi" | head -1)
    if [ ! -z "$BACKEND_CONTAINER" ]; then
        echo "📦 Found backend container: $BACKEND_CONTAINER"
        docker restart "$BACKEND_CONTAINER"
        echo "✅ Backend container restarted"
    else
        echo "⚠️  Could not find backend container. Trying to start services..."
        $DOCKER_COMPOSE_CMD up -d api backend 2>/dev/null || $DOCKER_COMPOSE_CMD up -d
    fi
fi

echo ""
echo "⏳ Waiting for backend to start (5 seconds)..."
sleep 5

echo ""
echo "🏥 Checking backend health..."
if curl -f http://localhost:8001/api/health > /dev/null 2>&1 || \
   curl -f http://localhost:8001/health > /dev/null 2>&1 || \
   curl -f http://localhost:8001/docs > /dev/null 2>&1; then
    echo "✅ Backend is healthy and responding!"
else
    echo "⚠️  Backend health check failed. Checking logs..."
    docker logs $(docker ps --format "{{.Names}}" | grep -iE "backend|api|fastapi" | head -1) --tail 20 2>/dev/null || echo "Could not retrieve logs"
    echo ""
    echo "❌ Backend may not be fully started. Please check logs manually."
    echo "   Try: docker logs <container-name>"
fi

echo ""
echo "📋 New endpoints available:"
echo "   ✅ DELETE /agent-teams/{team_id} - Delete team permanently"
echo "   ✅ PATCH /agent-teams/{team_id}/archive - Archive team"
echo "   ✅ PATCH /agent-teams/{team_id}/unarchive - Restore archived team"
echo ""
echo "✅ Backend restart complete!"
echo "   API should be available at: http://localhost:8001"
echo "   Docs: http://localhost:8001/docs"

