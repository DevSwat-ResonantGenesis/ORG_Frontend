#!/bin/bash
# Fix Deployment Location - Ensure we're in the right directory

set -e

echo "🔧 Fixing Deployment Location"
echo "=============================="
echo ""

CORRECT_DIR="/root/frontend"
CURRENT_DIR=$(pwd)

echo "Current:  $CURRENT_DIR"
echo "Correct:  $CORRECT_DIR"
echo ""

# Check if correct directory exists
if [ ! -d "$CORRECT_DIR" ]; then
    echo "❌ $CORRECT_DIR does not exist!"
    echo ""
    echo "Creating it and cloning repository..."
    mkdir -p "$CORRECT_DIR"
    cd "$CORRECT_DIR"
    git clone git@github.com:louienemesh/ResonantGraphAI_FrontendV0.1-.git . || {
        echo "❌ Failed to clone repository"
        exit 1
    }
    echo "✅ Repository cloned to $CORRECT_DIR"
elif [ ! -f "$CORRECT_DIR/package.json" ]; then
    echo "⚠️  $CORRECT_DIR exists but doesn't have package.json"
    echo "   Checking if it's a git repo..."
    
    if [ -d "$CORRECT_DIR/.git" ]; then
        echo "   It's a git repo, pulling..."
        cd "$CORRECT_DIR"
        git pull origin main
    else
        echo "   Cloning repository..."
        cd "$CORRECT_DIR"
        git clone git@github.com:louienemesh/ResonantGraphAI_FrontendV0.1-.git .
    fi
else
    echo "✅ $CORRECT_DIR exists and has package.json"
    cd "$CORRECT_DIR"
    git pull origin main
fi

echo ""
echo "📍 Now in: $(pwd)"
echo ""

# Verify we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ Still not in correct directory!"
    exit 1
fi

echo "✅ We're now in the correct directory"
echo ""
echo "📋 Next: Run deployment"
echo "   bash SIMPLE_REBUILD.sh"
echo ""

