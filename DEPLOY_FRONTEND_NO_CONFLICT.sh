#!/bin/bash
# Frontend deployment - NO CONFLICTS VERSION
# This handles all potential conflicts automatically

set -e

cd /root/frontend

# Stash any local changes
git stash || true

# Remove any conflicting untracked files that might cause issues
rm -rf src/components/EmptyState.js src/components/ErrorState.js src/components/LoadingState.js src/components/ResponsiveTable.js src/components/Toast/Toast.js src/components/Toast/ToastContainer.js src/context/ToastContext.js src/hooks/useKeyboardShortcuts.js src/hooks/useToast.js src/utils/apiConnectionTest.js src/utils/buttonDiagnostics.js src/utils/formValidation.js 2>/dev/null || true

# Force clean pull (reset to match remote)
git fetch origin main
git reset --hard origin/main

# Install dependencies
npm install

# Build frontend
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build

# Deploy to container
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload

echo "✅ Frontend deployed successfully!"

