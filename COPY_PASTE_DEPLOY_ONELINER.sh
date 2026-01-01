#!/bin/bash
# ============================================================================
# 🚀 ONE-LINER DEPLOYMENT (Copy-paste this entire block)
# ============================================================================
# Just copy everything between the lines and paste into your droplet terminal
# ============================================================================

cd /root/ResonantGraphAI_FrontendV0.1- && git pull origin main && npm install && export VITE_API_URL="/api" && export VITE_FASTAPI_URL="/api" && npm run build && docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*' && docker cp dist/. frontend:/usr/share/nginx/html/ && docker exec frontend nginx -s reload && echo "✅ Deployment complete! Visit: https://dev-swat.com"

