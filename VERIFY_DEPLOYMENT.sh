#!/bin/bash

# Verify Deployment - Check if files are updated

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFYING DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/frontend

# Step 1: Check if dist folder exists and has recent files
echo "📁 Step 1: Checking dist folder..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ dist folder exists"
    echo "   Files in dist:"
    ls -lh dist/ | head -10
    echo ""
    echo "   index.html last modified:"
    ls -lh dist/index.html
    echo ""
    
    # Check if ResonantChat files exist
    if grep -q "resonant-chat" dist/index.html 2>/dev/null || find dist/assets -name "*ResonantChat*" 2>/dev/null | head -1; then
        echo "✅ Resonant Chat files found in build"
    else
        echo "⚠️  Resonant Chat files not found - may need to rebuild"
    fi
else
    echo "❌ dist folder not found - need to build"
fi
echo ""

# Step 2: Check files in container
echo "🐳 Step 2: Checking files in container..."
echo "   Files in container:"
docker exec frontend ls -lh /usr/share/nginx/html/ | head -10
echo ""
echo "   index.html in container:"
docker exec frontend ls -lh /usr/share/nginx/html/index.html
echo ""

# Step 3: Check if container files match dist folder
echo "🔍 Step 3: Comparing container files with dist folder..."
CONTAINER_TIME=$(docker exec frontend stat -c %y /usr/share/nginx/html/index.html 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
DIST_TIME=$(stat -c %y dist/index.html 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1 || echo "N/A")

echo "   Container file time: $CONTAINER_TIME"
echo "   Dist file time: $DIST_TIME"
echo ""

# Step 4: Check if we need to rebuild
echo "📦 Step 4: Checking if rebuild is needed..."
if [ -f "dist/index.html" ]; then
    # Check git log to see last commit
    LAST_COMMIT=$(git log -1 --format="%h %s" 2>/dev/null || echo "unknown")
    echo "   Last commit: $LAST_COMMIT"
    echo ""
    
    # Check if dist is older than last commit
    LAST_COMMIT_TIME=$(git log -1 --format="%ct" 2>/dev/null || echo "0")
    DIST_TIME_STAMP=$(stat -c %Y dist/index.html 2>/dev/null || echo "0")
    
    if [ "$DIST_TIME_STAMP" -lt "$LAST_COMMIT_TIME" ]; then
        echo "⚠️  dist folder is older than last commit - REBUILD NEEDED"
        echo "   Run: npm run build"
    else
        echo "✅ dist folder is up to date"
    fi
else
    echo "❌ dist folder missing - REBUILD NEEDED"
fi
echo ""

# Step 5: Test actual content
echo "🌐 Step 5: Testing actual content from server..."
echo "   Checking if 'Aivara AI' is in the HTML:"
curl -s https://dev-swat.com | grep -i "aivara\|resonant.chat" | head -3 || echo "   Not found in HTML (may be in JS bundle)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 RECOMMENDATIONS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. If dist is outdated: npm run build"
echo "2. If container files are old: docker-compose restart frontend"
echo "3. Clear browser cache: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "4. Try incognito/private mode to bypass cache"
echo ""

