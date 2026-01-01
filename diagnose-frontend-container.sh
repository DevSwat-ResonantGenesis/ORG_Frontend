#!/bin/bash
# Diagnose frontend container issues
# Run this ON YOUR DROPLET

echo "🔍 Diagnosing Frontend Container..."
echo ""

cd /root/ResonantGraphAIV0.1

# Check container status
echo "📦 Container Status:"
docker compose ps frontend
echo ""

# Check if container is actually running
echo "📦 All Containers:"
docker ps | grep frontend
echo ""

# Check container logs
echo "📋 Container Logs (last 30 lines):"
docker compose logs frontend --tail 30
echo ""

# Check port mapping
echo "🔌 Port Mapping:"
docker port resonantgraphaiv01-frontend-1 2>/dev/null || echo "❌ Container not found or no ports"
echo ""

# Check what ports are listening
echo "🔌 Listening Ports:"
ss -tulpn | grep -E ":(80|5175)" || echo "❌ Nothing listening on ports 80 or 5175"
echo ""

# Check if dist directory exists
echo "📁 Frontend Build:"
ls -la /root/frontend/dist/ 2>/dev/null | head -5 || echo "❌ dist/ directory not found"
echo ""

# Check container details
echo "📊 Container Details:"
docker inspect resonantgraphaiv01-frontend-1 --format 'Status: {{.State.Status}}' 2>/dev/null || echo "❌ Container not found"
docker inspect resonantgraphaiv01-frontend-1 --format 'Ports: {{.NetworkSettings.Ports}}' 2>/dev/null || echo ""
echo ""

echo "✅ Diagnostic complete!"

