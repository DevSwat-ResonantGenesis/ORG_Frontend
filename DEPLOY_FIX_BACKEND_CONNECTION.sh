#!/bin/bash
# Fix Backend Connection - Complete Deployment

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING BACKEND CONNECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Check Backend Status
echo ""
echo "📋 Step 1: Checking Backend Status..."
cd /root/ResonantGraphAIV0.1
docker compose ps

echo ""
echo "📋 Testing Backend Health..."
curl -s http://137.184.234.252:8001/health || echo "❌ Backend not responding!"

# Step 2: Update Frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Updating Frontend..."
cd /root/frontend
git fetch origin main
git reset --hard origin/main
git pull origin main

echo ""
echo "📋 Building Frontend with Correct API URL..."
export VITE_API_URL="http://137.184.234.252:8001"
export VITE_FASTAPI_URL="http://137.184.234.252:8001"
npm run build

echo ""
echo "📋 Deploying to Docker..."
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Frontend Deployed!"
echo ""
echo "📋 Next Steps:"
echo "1. Open browser console (F12)"
echo "2. Look for: [API URL] Production detected..."
echo "3. Try logging in"
echo "4. Check Network tab for API requests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
