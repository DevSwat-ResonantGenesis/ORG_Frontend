#!/bin/bash
# Script to ensure changes are visible on localhost

echo "🔄 Ensuring changes are visible on localhost..."

# Touch modified files to trigger HMR
if [ -f "src/components/ThemeToggle.tsx" ]; then
    touch src/components/ThemeToggle.tsx
fi
if [ -f "src/components/ThemeToggle.css" ]; then
    touch src/components/ThemeToggle.css
fi
if [ -f "src/components/ThemeToggle.js" ]; then
    touch src/components/ThemeToggle.js
fi
if [ -f "src/store/themeStore.js" ]; then
    touch src/store/themeStore.js
fi

# Check if server is running
if lsof -ti:5175 > /dev/null 2>&1; then
    echo "✅ Dev server is running on port 5175"
    echo "✅ Changes should be visible at http://localhost:5175"
    echo "💡 If changes don't appear, do a hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
else
    echo "⚠️  Dev server is not running. Starting it..."
    npm run dev &
    sleep 3
    echo "✅ Dev server started"
fi

echo "✨ Done!"










