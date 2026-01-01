#!/bin/bash
# Fix build errors on droplet
# Run this ON YOUR DROPLET

set -e

FRONTEND_DIR="/root/frontend"

echo "🔧 Fixing build errors on droplet..."
echo ""

cd "$FRONTEND_DIR"

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf dist/
rm -rf node_modules/.vite
rm -rf .vite

# Remove any .js files that might have old imports
echo "🧹 Removing old compiled files..."
find src -name "*.js" -type f -delete 2>/dev/null || true

# Clear npm cache
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies
echo "📦 Reinstalling dependencies..."
rm -rf node_modules
npm install

# Build
echo "🔨 Building..."
npm run build

echo ""
echo "✅ Build complete!"

