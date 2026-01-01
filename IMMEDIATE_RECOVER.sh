#!/bin/bash
# IMMEDIATE Recovery - Just restore /root/frontend
# Uses ONLY /root/frontend - nothing else

set -e

echo "🔧 Immediate Recovery - Restoring /root/frontend"
echo "================================================="
echo ""

cd /root

# Check if folder exists
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "✅ /root/frontend already exists and has package.json"
    echo "   No recovery needed"
    exit 0
fi

# Remove if broken
if [ -d "frontend" ]; then
    echo "⚠️  /root/frontend exists but is broken"
    echo "   Backing up and removing..."
    mv frontend "frontend.broken.$(date +%s)" 2>/dev/null || rm -rf frontend
fi

# Clone to /root/frontend (EXACTLY as specified)
echo "📋 Cloning to /root/frontend..."
git clone git@github.com:louienemesh/ResonantGraphAI_FrontendV0.1-.git frontend

cd frontend

# Verify
if [ ! -f "package.json" ]; then
    echo "❌ Recovery failed - package.json missing"
    exit 1
fi

echo "✅ /root/frontend recovered!"
echo ""
echo "Location: $(pwd)"
echo "Verified: package.json exists"
echo ""
echo "Next: npm install (if needed)"

