#!/bin/bash
# Start Local Docker and Frontend
# This script builds the frontend and starts Docker Compose

set -e

echo "🚀 Starting Local Docker and Frontend..."
echo ""

# Step 1: Clean up old containers
echo "🧹 Cleaning up old containers..."
docker ps -a | grep -E "frontend|nginx" | grep -v "CONTAINER" | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
echo "✅ Old containers cleaned up"
echo ""

# Step 2: Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Step 3: Build the frontend
echo "🔨 Building frontend..."
npm run build
echo "✅ Frontend built successfully"
echo ""

# Step 4: Verify dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found after build!"
    exit 1
fi

# Step 5: Check if dist has files
if [ -z "$(ls -A dist)" ]; then
    echo "⚠️  Warning: dist directory is empty!"
    exit 1
fi

echo "✅ dist directory is ready"
echo ""

# Step 6: Start Docker Compose
echo "🐳 Starting Docker Compose..."
docker compose -f docker-compose.frontend.yml up -d
echo ""

# Step 7: Wait a moment for containers to start
echo "⏳ Waiting for containers to start..."
sleep 3

# Step 8: Check status
echo "📊 Container Status:"
docker compose -f docker-compose.frontend.yml ps
echo ""

# Step 9: Check if nginx is responding
echo "🔍 Testing frontend..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/ | grep -q "200\|301\|302"; then
    echo "✅ Frontend is running at http://localhost/"
else
    echo "⚠️  Frontend might still be starting. Check logs with:"
    echo "   docker compose -f docker-compose.frontend.yml logs frontend"
fi
echo ""

echo "🎉 Done! Frontend should be available at:"
echo "   - http://localhost/"
echo "   - http://localhost:80/"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker compose -f docker-compose.frontend.yml logs -f frontend"
echo "   - Stop: docker compose -f docker-compose.frontend.yml down"
echo "   - Restart: docker compose -f docker-compose.frontend.yml restart frontend"




