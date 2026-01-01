#!/bin/bash
# Deploy Backend Only (API, ML Worker, DB) - Skip Frontend

set -e

cd /root/ResonantGraphAIV0.1

echo "🔌 Deploying Backend Services Only (API, ML Worker, DB)..."

# Stash and pull
git stash || true
git fetch origin main
git pull origin main
git reset --hard origin/main

# Stop only backend services (not frontend)
docker compose down api ml-worker db 2>/dev/null || docker compose down || true

# Build and start only backend services
docker compose up -d --build api ml-worker db || docker-compose up -d --build api ml-worker db

sleep 5

# Check status
docker compose ps || docker-compose ps

echo "✅ Backend services deployed!"
echo "   API: http://137.184.234.252:8001"
echo "   ML Worker: http://137.184.234.252:9000"

