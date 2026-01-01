#!/bin/bash
# Check and Fix Frontend Folder - Safe script that checks before doing anything

set -e

echo "🔍 Checking Frontend Folder Status"
echo "===================================="
echo ""

cd /root

FRONTEND_DIR="/root/frontend"

# Step 1: Check if folder exists
echo "📋 Step 1: Checking /root/frontend..."
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ /root/frontend does NOT exist"
    echo "   Recovering..."
    git clone git@github.com:louienemesh/ResonantGraphAI_FrontendV0.1-.git frontend
    cd frontend
    npm install
    echo "✅ Recovered"
    exit 0
fi

echo "✅ /root/frontend exists"
echo ""

# Step 2: Check what's in it
echo "📋 Step 2: Checking contents..."
cd "$FRONTEND_DIR"

if [ -f "package.json" ]; then
    echo "✅ Has package.json"
else
    echo "❌ Missing package.json - folder is broken"
    cd /root
    rm -rf frontend
    git clone git@github.com:louienemesh/ResonantGraphAI_FrontendV0.1-.git frontend
    cd frontend
    npm install
    echo "✅ Recovered"
    exit 0
fi

if [ -d "src" ]; then
    echo "✅ Has src/ directory"
else
    echo "❌ Missing src/ - folder incomplete"
    echo "   Pulling latest code..."
    git pull origin main
    npm install
    echo "✅ Updated"
fi

if [ -f "vite.config.ts" ]; then
    echo "✅ Has vite.config.ts"
else
    echo "⚠️  Missing vite.config.ts"
    echo "   Pulling latest code..."
    git pull origin main
fi

echo ""

# Step 3: Check git status
echo "📋 Step 3: Checking git status..."
if [ -d ".git" ]; then
    echo "✅ Is a git repository"
    echo "   Current branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
    echo "   Pulling latest..."
    git pull origin main
else
    echo "⚠️  Not a git repository"
    echo "   This might be a problem"
fi
echo ""

# Step 4: Summary
echo "=========================================="
echo "📊 SUMMARY"
echo "=========================================="
echo ""
echo "Location: $FRONTEND_DIR"
echo "Status: ✅ EXISTS"
echo ""

if [ -f "package.json" ] && [ -d "src" ] && [ -f "vite.config.ts" ]; then
    echo "✅ Folder is complete and ready"
    echo ""
    echo "You can now:"
    echo "   cd /root/frontend"
    echo "   npm run build"
    echo "   bash SIMPLE_REBUILD.sh"
else
    echo "⚠️  Folder is incomplete"
    echo "   Run: git pull origin main"
fi
echo ""

