#!/bin/bash
# SAFE Recover - Uses ONLY the correct paths from PERMANENT_FOLDER_STRUCTURE.md
# DO NOT MODIFY - This uses the confirmed structure

set -e

echo "🔧 SAFE Recovery - Using Permanent Structure"
echo "=============================================="
echo ""
echo "According to PERMANENT_FOLDER_STRUCTURE.md:"
echo "  Droplet Frontend: /root/frontend/"
echo "  Droplet Backend:  /root/ResonantGraphAIV0.1/"
echo ""

FRONTEND_DIR="/root/frontend"
BACKEND_DIR="/root/ResonantGraphAIV0.1"

# Step 1: Check current state
echo "📋 Step 1: Checking current state..."
echo ""

if [ -d "$FRONTEND_DIR" ] && [ -f "$FRONTEND_DIR/package.json" ]; then
    echo "✅ Frontend folder EXISTS and has package.json"
    echo "   Location: $FRONTEND_DIR"
    echo "   Contents:"
    ls -la "$FRONTEND_DIR" | head -10
    echo ""
    echo "   Folder is OK - no recovery needed"
    exit 0
fi

if [ -d "$FRONTEND_DIR" ]; then
    echo "⚠️  Frontend folder exists but is missing package.json"
    echo "   Checking what's there..."
    ls -la "$FRONTEND_DIR"
    echo ""
fi

# Step 2: Safe recovery - ONLY clone to /root/frontend
echo "📋 Step 2: Recovering frontend folder..."
echo "   Target: $FRONTEND_DIR"
echo ""

cd /root

# Only remove if we need to recover
if [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo "   Cloning repository to $FRONTEND_DIR..."
    
    # Backup current if exists
    if [ -d "$FRONTEND_DIR" ]; then
        BACKUP_NAME="${FRONTEND_DIR}.backup.$(date +%s)"
        echo "   Backing up existing folder to: $BACKUP_NAME"
        mv "$FRONTEND_DIR" "$BACKUP_NAME"
    fi
    
    # Clone fresh
    git clone git@github.com:louienemesh/ResonantGraphAI_FrontendV0.1-.git frontend
    
    if [ ! -f "$FRONTEND_DIR/package.json" ]; then
        echo "❌ Recovery failed!"
        exit 1
    fi
    
    echo "✅ Frontend folder recovered"
else
    echo "✅ Frontend folder already exists and is OK"
fi
echo ""

# Step 3: Verify recovery
echo "📋 Step 3: Verifying recovery..."
cd "$FRONTEND_DIR"

if [ -f "package.json" ] && [ -d "src" ]; then
    echo "✅ Recovery successful!"
    echo ""
    echo "Contents verified:"
    echo "  - package.json: ✅"
    echo "  - src/: ✅"
    echo "  - vite.config.ts: $([ -f vite.config.ts ] && echo '✅' || echo '⚠️')"
    echo ""
else
    echo "⚠️  Recovery incomplete - some files missing"
fi
echo ""

echo "=========================================="
echo "✅ Recovery Complete"
echo "=========================================="
echo ""
echo "📍 Frontend: $FRONTEND_DIR"
echo "📍 Backend:  $BACKEND_DIR"
echo ""
echo "💡 Remember:"
echo "   - Frontend: /root/frontend/ (NOT ResonantGraphAI_FrontendV0.1-)"
echo "   - Backend:  /root/ResonantGraphAIV0.1/"
echo ""

