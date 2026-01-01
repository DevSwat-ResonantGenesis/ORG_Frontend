#!/bin/bash
# Start Backend in Docker and Frontend Locally
# This script starts the backend services in Docker and the frontend in development mode

set -e

echo "🚀 Starting Backend (Docker) and Frontend (Local)..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if Docker is running
echo "🔍 Step 1: Checking Docker status..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo ""
    echo "Please start Docker Desktop and try again."
    echo "On macOS, you can:"
    echo "  1. Open Docker Desktop application"
    echo "  2. Wait for it to fully start (whale icon in menu bar)"
    echo "  3. Run this script again"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 2: Navigate to backend directory and start Docker services
echo "🐳 Step 2: Starting backend services in Docker..."
BACKEND_DIR="/Applications/ResonantGraphAIV0.1"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found at: $BACKEND_DIR${NC}"
    echo ""
    echo "Please ensure the backend repository is located at:"
    echo "  $BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml not found in backend directory${NC}"
    exit 1
fi

# Start Docker services
echo "   Starting Docker Compose services..."
docker compose up -d

# Wait for services to start
echo "   Waiting for services to initialize..."
sleep 5

# Check service status
echo ""
echo "📊 Backend Service Status:"
docker compose ps
echo ""

# Test backend health
echo "🏥 Testing backend health..."
sleep 3
if curl -s -f http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy at http://localhost:8001${NC}"
else
    echo -e "${YELLOW}⚠️  Backend might still be starting. Check logs with:${NC}"
    echo "   cd $BACKEND_DIR && docker compose logs api"
fi
echo ""

# Step 3: Navigate to frontend directory and start development server
echo "💻 Step 3: Starting frontend in development mode..."
FRONTEND_DIR="/Applications/ResonantGraphAI_FrontendV0.1"
cd "$FRONTEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
    echo ""
fi

# Start frontend development server
echo "🚀 Starting frontend development server..."
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "📍 Services:"
echo "   - Backend API: http://localhost:8001"
echo "   - Backend Docs: http://localhost:8001/docs"
echo "   - Frontend: http://localhost:5175"
echo ""
echo "💡 Useful commands:"
echo "   - View backend logs: cd $BACKEND_DIR && docker compose logs -f api"
echo "   - Stop backend: cd $BACKEND_DIR && docker compose down"
echo "   - Restart backend: cd $BACKEND_DIR && docker compose restart"
echo ""
echo "Press Ctrl+C to stop the frontend server"
echo ""

# Start the frontend dev server (this will block)
npm run dev

