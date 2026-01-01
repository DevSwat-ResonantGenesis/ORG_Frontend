#!/bin/bash
# Restart frontend on droplet
# Run this ON YOUR DROPLET

set -e

echo "🔄 Restarting frontend..."
echo ""

# Method 1: Try docker compose from backend directory
BACKEND_DIR="/root/ResonantGraphAIV0.1"
if [ -f "$BACKEND_DIR/docker-compose.yml" ]; then
    echo "📦 Found docker-compose.yml in backend directory"
    cd "$BACKEND_DIR"
    docker compose restart frontend
    exit 0
fi

# Method 2: Find docker-compose.yml
DOCKER_COMPOSE=$(find /root /home /var/www /opt -name "docker-compose.yml" -type f 2>/dev/null | head -1)
if [ ! -z "$DOCKER_COMPOSE" ]; then
    echo "📦 Found docker-compose.yml at: $DOCKER_COMPOSE"
    cd $(dirname "$DOCKER_COMPOSE")
    docker compose restart frontend
    exit 0
fi

# Method 3: Find frontend container by name
FRONTEND_CONTAINER=$(docker ps -a --format "{{.Names}}" | grep -iE "frontend|nginx|web" | head -1)
if [ ! -z "$FRONTEND_CONTAINER" ]; then
    echo "📦 Found frontend container: $FRONTEND_CONTAINER"
    docker restart "$FRONTEND_CONTAINER"
    exit 0
fi

# Method 4: Restart all containers
echo "⚠️  Could not find specific frontend container. Restarting all containers..."
docker restart $(docker ps -q)

echo ""
echo "✅ Done!"
echo ""
echo "🔍 Verify frontend:"
echo "  - http://dev-swat.com"
echo "  - http://dev-swat.com/api/health"

