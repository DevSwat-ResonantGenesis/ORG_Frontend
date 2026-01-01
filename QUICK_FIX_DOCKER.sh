#!/bin/bash
# Quick Fix Docker Container - Copy-paste this on your droplet
# Run: cd ~/frontend && bash QUICK_FIX_DOCKER.sh

set -e

echo "🔧 Fixing Docker container..."

# Stop and remove old container
docker stop frontend 2>/dev/null || true
docker rm frontend 2>/dev/null || true

# Build with environment variables
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# Build Docker image
docker build -f Dockerfile.prod -t frontend:latest \
    --build-arg VITE_API_URL="/api" \
    --build-arg VITE_FASTAPI_URL="/api" \
    .

# Run container
docker run -d \
    --name frontend \
    -p 80:80 \
    -p 443:443 \
    --restart unless-stopped \
    frontend:latest

# Wait and verify
sleep 3
docker ps | grep frontend
docker exec frontend nginx -t

echo "✅ Done! Container should be running now."

