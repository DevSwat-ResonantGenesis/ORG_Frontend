#!/bin/bash
# Frontend deployment with fix for untracked files conflict

set -e

echo "🚀 Deploying Frontend (with conflict fix)..."

cd /root/frontend

# Stash any local changes
echo "📦 Stashing local changes..."
git stash || echo "⚠️  No changes to stash"

# Remove conflicting untracked files
echo "🧹 Removing conflicting untracked files..."
rm -f src/components/EmptyState.js
rm -f src/components/ErrorState.js
rm -f src/components/LoadingState.js
rm -f src/components/ResponsiveTable.js
rm -f src/components/Toast/Toast.js
rm -f src/components/Toast/ToastContainer.js
rm -f src/context/ToastContext.js
rm -f src/hooks/useKeyboardShortcuts.js
rm -f src/hooks/useToast.js
rm -f src/utils/apiConnectionTest.js
rm -f src/utils/buttonDiagnostics.js
rm -f src/utils/formValidation.js

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build frontend
echo "🏗️  Building frontend..."
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# Copy to container
echo "📋 Copying to container..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/

# Reload nginx
echo "⚙️  Reloading nginx..."
docker exec frontend nginx -s reload

echo "✅ Frontend deployed! Visit: https://dev-swat.com"

