#!/bin/bash
# Fix router file on droplet
# Run this ON YOUR DROPLET

set -e

FRONTEND_DIR="/root/frontend"

echo "🔧 Fixing router file on droplet..."
echo ""

cd "$FRONTEND_DIR"

# Backup current router file
echo "📦 Backing up current router file..."
cp src/router/index.tsx src/router/index.tsx.backup

# Fix the imports
echo "🔨 Fixing imports in router file..."
sed -i "s|'../pages/PredictionsPage/PredictionsPage'|'../pages/Predictions/PredictionsPage-2025'|g" src/router/index.tsx
sed -i "s|'../pages/PredictionsPage/PredictionDetailPage'|'../pages/Predictions/PredictionDetailPage'|g" src/router/index.tsx

# Verify the fix
echo "✅ Checking if fix worked..."
if grep -q "pages/Predictions/PredictionsPage-2025" src/router/index.tsx; then
    echo "✅ Router file fixed successfully!"
else
    echo "❌ Fix failed. Restoring backup..."
    mv src/router/index.tsx.backup src/router/index.tsx
    exit 1
fi

echo ""
echo "🚀 Now try building again:"
echo "   npm run build"

