#!/bin/bash
# Check and Fix Deployment Location
# Verify we're using the correct folder structure

set -e

echo "🔍 Checking Deployment Location"
echo "================================"
echo ""

# Check current directory
CURRENT_DIR=$(pwd)
echo "📍 Current directory: $CURRENT_DIR"
echo ""

# Step 1: Check if we're in the right place
echo "📋 Step 1: Verifying frontend directory..."

EXPECTED_DIR="/root/frontend"

if [ "$CURRENT_DIR" != "$EXPECTED_DIR" ]; then
    echo "⚠️  We're NOT in the expected directory!"
    echo "   Current:  $CURRENT_DIR"
    echo "   Expected: $EXPECTED_DIR"
    echo ""
    
    # Check if we're in ResonantGraphAI_FrontendV0.1- directory
    if [[ "$CURRENT_DIR" == *"ResonantGraphAI_FrontendV0.1"* ]]; then
        echo "❌ We're in the wrong directory!"
        echo "   This is NOT the deployment directory"
        echo ""
        echo "🔧 Fixing:"
        echo "   1. We should build in $EXPECTED_DIR"
        echo "   2. Or we need to change where we build"
        echo ""
        
        # Ask if we should move or use current
        echo "Options:"
        echo "  A) Use current directory ($CURRENT_DIR) - if this is your source"
        echo "  B) Move to correct directory ($EXPECTED_DIR)"
        echo ""
        
        if [ -f "$EXPECTED_DIR/package.json" ]; then
            echo "✅ $EXPECTED_DIR exists and has package.json"
            echo "   Recommendation: Use $EXPECTED_DIR"
            USE_EXPECTED=true
        else
            echo "⚠️  $EXPECTED_DIR doesn't exist or doesn't have package.json"
            echo "   Recommendation: Use current directory"
            USE_EXPECTED=false
        fi
    else
        echo "❌ Unexpected directory structure"
        USE_EXPECTED=false
    fi
else
    echo "✅ We're in the correct directory: $EXPECTED_DIR"
    USE_EXPECTED=true
fi
echo ""

# Step 2: Check what's actually in the container
echo "📋 Step 2: Checking what's in the frontend container..."
if docker ps | grep -q frontend; then
    echo "Container files:"
    docker exec frontend ls -la /usr/share/nginx/html/ | head -10
    echo ""
    
    # Check if index.html exists
    if docker exec frontend test -f /usr/share/nginx/html/index.html; then
        echo "✅ index.html exists in container"
        HTML_SIZE=$(docker exec frontend stat -c%s /usr/share/nginx/html/index.html 2>/dev/null || echo "0")
        echo "   Size: $HTML_SIZE bytes"
    else
        echo "❌ index.html NOT found in container!"
    fi
else
    echo "❌ Frontend container is not running!"
fi
echo ""

# Step 3: Check where we should be building
echo "📋 Step 3: Checking deployment structure..."

# Check if ~/frontend exists
if [ -d "$EXPECTED_DIR" ] && [ -f "$EXPECTED_DIR/package.json" ]; then
    echo "✅ $EXPECTED_DIR exists and has package.json"
    echo "   This is the correct deployment directory"
    CORRECT_DIR="$EXPECTED_DIR"
elif [ -f "$CURRENT_DIR/package.json" ]; then
    echo "✅ Current directory has package.json"
    echo "   Using current directory: $CURRENT_DIR"
    CORRECT_DIR="$CURRENT_DIR"
else
    echo "❌ Cannot find correct directory!"
    echo "   Checked: $EXPECTED_DIR"
    echo "   Checked: $CURRENT_DIR"
    exit 1
fi
echo ""

# Step 4: Summary and fix
echo "=========================================="
echo "📊 SUMMARY"
echo "=========================================="
echo ""
echo "Current location: $CURRENT_DIR"
echo "Expected location: $EXPECTED_DIR"
echo "Correct location: $CORRECT_DIR"
echo ""

if [ "$CURRENT_DIR" != "$CORRECT_DIR" ]; then
    echo "⚠️  MISMATCH DETECTED!"
    echo ""
    echo "🔧 To fix:"
    echo "   cd $CORRECT_DIR"
    echo "   bash SIMPLE_REBUILD.sh"
    echo ""
    echo "Or continue from current location if you prefer"
else
    echo "✅ Directory is correct!"
    echo "   Ready to build and deploy"
fi
echo ""

# Step 5: Show what we need to do
echo "📋 Next Steps:"
echo ""
if [ "$CURRENT_DIR" != "$CORRECT_DIR" ]; then
    echo "1. Navigate to correct directory:"
    echo "   cd $CORRECT_DIR"
    echo ""
    echo "2. Pull latest code:"
    echo "   git pull origin main"
    echo ""
    echo "3. Build and deploy:"
    echo "   bash SIMPLE_REBUILD.sh"
else
    echo "1. You're in the correct directory"
    echo "2. Just run: bash SIMPLE_REBUILD.sh"
fi
echo ""

