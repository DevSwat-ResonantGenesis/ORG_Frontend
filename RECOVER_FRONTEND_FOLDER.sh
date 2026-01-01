#!/bin/bash
# Recover Frontend Folder on Droplet
# This will restore the frontend directory if it was deleted

set -e

echo "🔧 Recovering Frontend Folder"
echo "=============================="
echo ""

FRONTEND_DIR="/root/frontend"

# Step 1: Check if folder exists
echo "📋 Step 1: Checking frontend folder..."
if [ -d "$FRONTEND_DIR" ]; then
    echo "✅ Folder exists: $FRONTEND_DIR"
    
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        echo "✅ Has package.json - folder is OK"
        echo "   Contents:"
        ls -la "$FRONTEND_DIR" | head -10
        exit 0
    else
        echo "⚠️  Folder exists but doesn't have package.json"
        echo "   It might be empty or corrupted"
    fi
else
    echo "❌ Folder does NOT exist: $FRONTEND_DIR"
fi
echo ""

# Step 2: Check for backups or other locations
echo "📋 Step 2: Checking for backups or other locations..."
echo ""

# Check if there's a backup
if [ -d "$FRONTEND_DIR.bak" ] || [ -d "$FRONTEND_DIR-backup" ]; then
    echo "✅ Found backup folder!"
    BACKUP_DIR=$(ls -d "$FRONTEND_DIR"*backup* "$FRONTEND_DIR".bak 2>/dev/null | head -1)
    echo "   Backup: $BACKUP_DIR"
    echo "   Restoring from backup..."
    if [ -d "$FRONTEND_DIR" ]; then
        mv "$FRONTEND_DIR" "${FRONTEND_DIR}.old.$(date +%s)"
    fi
    cp -r "$BACKUP_DIR" "$FRONTEND_DIR"
    echo "✅ Restored from backup"
    exit 0
fi

# Check other possible locations
POSSIBLE_LOCATIONS=(
    "/root/ResonantGraphAI_FrontendV0.1-"
    "/root/ResonantGraphAI_FrontendV0.1"
    "/home/root/frontend"
)

for LOC in "${POSSIBLE_LOCATIONS[@]}"; do
    if [ -d "$LOC" ] && [ -f "$LOC/package.json" ]; then
        echo "✅ Found frontend at: $LOC"
        echo "   Copying to $FRONTEND_DIR..."
        if [ -d "$FRONTEND_DIR" ]; then
            rm -rf "$FRONTEND_DIR"
        fi
        cp -r "$LOC" "$FRONTEND_DIR"
        echo "✅ Restored from $LOC"
        exit 0
    fi
done
echo ""

# Step 3: Reclone from Git
echo "📋 Step 3: No backup found, cloning from Git..."
echo ""

# Check if .git folder exists anywhere
if [ -d "$FRONTEND_DIR/.git" ]; then
    echo "✅ Git repository found in $FRONTEND_DIR"
    echo "   Trying to restore from git..."
    cd "$FRONTEND_DIR"
    git status
    git reset --hard HEAD
    git clean -fd
    echo "✅ Restored from git"
    exit 0
fi

# Clone fresh
echo "   Cloning repository..."
cd /root

# Remove if exists (empty or corrupted)
if [ -d "$FRONTEND_DIR" ]; then
    echo "   Removing corrupted folder..."
    rm -rf "$FRONTEND_DIR"
fi

# Clone repository
git clone git@github.com:louienemesh/ResonantGraphAI_FrontendV0.1-.git frontend

if [ ! -d "$FRONTEND_DIR" ] || [ ! -f "$FRONTEND_DIR/package.json" ]; then
    echo "❌ Failed to clone repository!"
    exit 1
fi

cd "$FRONTEND_DIR"
echo "✅ Repository cloned successfully"
echo ""

# Step 4: Install dependencies
echo "📋 Step 4: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 5: Verify
echo "📋 Step 5: Verifying recovery..."
cd "$FRONTEND_DIR"

if [ -f "package.json" ] && [ -d "src" ] && [ -f "vite.config.ts" ]; then
    echo "✅ Folder recovered successfully!"
    echo ""
    echo "Contents:"
    ls -la | head -15
else
    echo "⚠️  Folder recovered but some files might be missing"
fi
echo ""

echo "=========================================="
echo "✅✅✅ RECOVERY COMPLETE! ✅✅✅"
echo "=========================================="
echo ""
echo "📍 Location: $FRONTEND_DIR"
echo ""
echo "📋 Next steps:"
echo "   1. cd $FRONTEND_DIR"
echo "   2. npm install (if needed)"
echo "   3. npm run build"
echo "   4. Deploy to container"
echo ""

