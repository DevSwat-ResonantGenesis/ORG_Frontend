#!/bin/bash
# Find the CORRECT frontend folder first, then deploy

echo "🔍 Finding the correct frontend folder..."
echo ""

# Find all folders with package.json
FRONTEND_FOLDERS=$(find /root -maxdepth 2 -name "package.json" -type f 2>/dev/null | while read file; do dirname "$file"; done)

if [ -z "$FRONTEND_FOLDERS" ]; then
    echo "❌ No frontend folder found with package.json"
    echo "Available folders:"
    ls -la /root/ | grep "^d"
    exit 1
fi

echo "📦 Found frontend folders with package.json:"
echo "$FRONTEND_FOLDERS" | while read folder; do
    echo "   - $folder"
done
echo ""

# Ask user or use the first one, or check which one has the latest git commits
# For now, let's use the one that's NOT in the backend repo
CORRECT_FOLDER=""
for folder in $FRONTEND_FOLDERS; do
    if [[ ! "$folder" == *"ResonantGraphAIV0.1"* ]]; then
        CORRECT_FOLDER="$folder"
        break
    fi
done

if [ -z "$CORRECT_FOLDER" ]; then
    # If all are in backend, use the first one
    CORRECT_FOLDER=$(echo "$FRONTEND_FOLDERS" | head -1)
fi

echo "✅ Using folder: $CORRECT_FOLDER"
echo ""

cd "$CORRECT_FOLDER"
echo "📂 Current directory: $(pwd)"
echo ""

# Clean and deploy
echo "🧹 Cleaning..."
rm -rf node_modules dist .next .cache 2>/dev/null || true

echo "📦 Git operations..."
git stash || true
git clean -fd || true
git fetch origin main
git reset --hard origin/main
git clean -fd

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

echo "📋 Deploying to container..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/

echo "⚙️  Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Deployed from: $CORRECT_FOLDER"
echo "🌐 Visit: https://dev-swat.com"
echo "💡 Clear cache: Ctrl+Shift+R"

