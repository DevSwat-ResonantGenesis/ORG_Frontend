#!/bin/bash
# NUCLEAR CACHE CLEAR - Fixes all cached errors

echo "🧹 NUCLEAR CACHE CLEAR - Removing ALL cached code..."
echo ""

cd /Applications/ResonantGraphAI_FrontendV0.1

# Kill all processes
echo "1. Stopping all processes..."
pkill -f "vite" 2>/dev/null
pkill -f "electron" 2>/dev/null
sleep 2

# Clear Vite cache
echo "2. Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

# Clear Electron cache
cd /Applications/ResonantGraphAI_Desktop
echo "3. Clearing Electron cache..."
rm -rf electron/dist
rm -rf node_modules/.cache

# Clear browser/Electron user data cache
echo "4. Clearing Electron browser cache..."
if [ -d ~/Library/Application\ Support/ResonantGraphAI* ]; then
  rm -rf ~/Library/Application\ Support/ResonantGraphAI*/Cache
  rm -rf ~/Library/Application\ Support/ResonantGraphAI*/Code\ Cache
  rm -rf ~/Library/Application\ Support/ResonantGraphAI*/GPUCache
  echo "   ✅ Electron cache cleared"
fi

# Rebuild Electron
cd /Applications/ResonantGraphAI_Desktop
echo "5. Rebuilding Electron..."
npm run electron:build

echo ""
echo "✅ ALL CACHES CLEARED!"
echo ""
echo "Now restart:"
echo "  cd /Applications/ResonantGraphAI_Desktop"
echo "  npm run dev"

