#!/bin/bash
# Pull backend from git and start services
# Run this ON YOUR DROPLET

cd /root/ResonantGraphAIV0.1

echo "📥 Pulling latest backend code from git..."
git pull origin main

echo ""
echo "🔍 Checking for uncommitted changes..."
git status

echo ""
echo "💡 If there are local changes (like docker-compose.yml), you can:"
echo "   - Stash them: git stash"
echo "   - Or commit them first"
echo "   - Or discard: git restore <file>"

echo ""
echo "🚀 Starting backend services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "📋 Service status:"
docker compose ps

echo ""
echo "🧪 Testing backend API..."
curl -s http://localhost:8001/api/health || echo "❌ Backend not responding yet (may need more time)"

