#!/bin/bash
# Remove the wrong frontend container from docker-compose
# Run this ON YOUR DROPLET

cd /root/ResonantGraphAIV0.1

echo "🔍 Checking frontend container..."
docker compose ps | grep frontend

echo ""
echo "🛑 Stopping and removing frontend service..."
docker compose stop frontend
docker compose rm -f frontend

echo ""
echo "✅ Frontend container removed!"
echo ""
echo "📋 Remaining services:"
docker compose ps

echo ""
echo "💡 Make sure you're using the standalone 'frontend-nginx' container for frontend"

