#!/bin/bash
# Quick Pull Script for DigitalOcean Droplet
# Copy-paste this entire script or run individual commands

# ============================================================
# CONFIGURATION - Adjust these paths if needed
# ============================================================
FRONTEND_PATH="${FRONTEND_PATH:-/var/www/resonantgraph-frontend}"
BACKEND_PATH="${BACKEND_PATH:-/var/www/resonantgraph-backend}"

echo "🚀 Starting deployment pull..."
echo ""

# ============================================================
# FRONTEND UPDATE
# ============================================================
echo "📦 Updating Frontend..."
cd "$FRONTEND_PATH" || exit 1

git fetch origin main
git reset --hard origin/main
git clean -fd
git pull origin main

echo "🧹 Cleaning old files..."
rm -rf node_modules dist build

echo "📥 Installing dependencies..."
npm ci

echo "🏗️  Building for production..."
npm run build

echo "✅ Frontend updated!"
echo ""

# ============================================================
# BACKEND UPDATE (if needed)
# ============================================================
if [ -d "$BACKEND_PATH" ]; then
    echo "📦 Updating Backend..."
    cd "$BACKEND_PATH" || exit 1
    
    git fetch origin main
    git reset --hard origin/main
    git clean -fd
    git pull origin main
    
    echo "🧹 Cleaning old files..."
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    
    if [ -f "requirements.txt" ] && [ -d "venv" ]; then
        echo "📥 Installing dependencies..."
        source venv/bin/activate
        pip install -r requirements.txt --upgrade
    fi
    
    echo "✅ Backend updated!"
    echo ""
fi

# ============================================================
# RESTART SERVICES
# ============================================================
echo "🔄 Restarting services..."
if command -v pm2 &> /dev/null; then
    pm2 restart all
    pm2 status
elif command -v systemctl &> /dev/null; then
    sudo systemctl restart resonantgraph-frontend 2>/dev/null || true
    sudo systemctl restart resonantgraph-backend 2>/dev/null || true
    sudo systemctl reload nginx 2>/dev/null || true
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Status:"
cd "$FRONTEND_PATH"
echo "Frontend commit: $(git rev-parse --short HEAD)"
if [ -d "$BACKEND_PATH" ]; then
    cd "$BACKEND_PATH"
    echo "Backend commit: $(git rev-parse --short HEAD)"
fi

