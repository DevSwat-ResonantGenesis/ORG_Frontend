#!/bin/bash
# Start backend services
# Run this ON YOUR DROPLET

cd /root/ResonantGraphAIV0.1

echo "🔍 Checking backend services status..."
docker compose ps

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
curl -s http://localhost:8001/api/health || echo "❌ Backend not responding"

echo ""
echo "✅ Backend services should now be running!"
echo "   API should be available at: http://localhost:8001"

