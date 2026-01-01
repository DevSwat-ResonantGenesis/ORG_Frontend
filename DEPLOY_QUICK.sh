#!/bin/bash
# Quick deployment command - auto-detects folder and deploys

FRONTEND_FOLDER=$(find /root -name "package.json" -type f 2>/dev/null | grep -E "frontend|ResonantGraph" | head -1 | xargs dirname) && \
cd "$FRONTEND_FOLDER" && \
git pull origin main && \
export VITE_API_URL="/api" && \
export VITE_FASTAPI_URL="/api" && \
npm run build && \
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' && \
docker cp dist/. frontend:/usr/share/nginx/html/ && \
docker exec frontend nginx -s reload && \
echo "✅ Deployed from: $FRONTEND_FOLDER"

