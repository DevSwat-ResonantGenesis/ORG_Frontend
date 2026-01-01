#!/bin/bash
# Complete Diagnostic and Fix Script
# Run this on the droplet: cd ~/frontend && bash DIAGNOSE_AND_FIX.sh

set -e

echo "🔍 Diagnosing issues..."
echo ""

# Step 1: Check container
echo "📋 Step 1: Checking container..."
if docker ps | grep -q frontend; then
    echo "✅ Container is running"
else
    echo "❌ Container is NOT running!"
    exit 1
fi
echo ""

# Step 2: Check files in container
echo "📋 Step 2: Checking files in container..."
FILE_COUNT=$(docker exec frontend sh -c 'ls -1 /usr/share/nginx/html/ 2>/dev/null | wc -l')
if [ "$FILE_COUNT" -gt "0" ]; then
    echo "✅ Files in container: $FILE_COUNT"
    docker exec frontend ls -la /usr/share/nginx/html/ | head -5
else
    echo "❌ No files in container!"
    exit 1
fi
echo ""

# Step 3: Check nginx config
echo "📋 Step 3: Checking nginx configuration..."
docker exec frontend nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid"
else
    echo "❌ Nginx config has errors!"
    echo "Checking SSL certificate..."
    SSL_EXISTS=$(docker exec frontend sh -c 'test -f /etc/letsencrypt/live/dev-swat.com/fullchain.pem && echo "yes" || echo "no"')
    if [ "$SSL_EXISTS" = "no" ]; then
        echo "⚠️  SSL certificate not found!"
        echo "   Using HTTP-only config temporarily..."
        if [ -f "nginx.conf" ]; then
            docker cp nginx.conf frontend:/etc/nginx/conf.d/default.conf
            docker exec frontend nginx -t
            docker exec frontend nginx -s reload
            echo "✅ Switched to HTTP-only config"
        else
            echo "❌ nginx.conf not found!"
        fi
    fi
fi
echo ""

# Step 4: Test from inside container
echo "📋 Step 4: Testing nginx from inside container..."
HTTP_TEST=$(docker exec frontend sh -c 'curl -s -o /dev/null -w "%{http_code}" http://localhost' 2>/dev/null || echo "000")
if [ "$HTTP_TEST" = "200" ] || [ "$HTTP_TEST" = "301" ] || [ "$HTTP_TEST" = "302" ]; then
    echo "✅ Nginx responding: HTTP $HTTP_TEST"
else
    echo "❌ Nginx not responding correctly: HTTP $HTTP_TEST"
fi
echo ""

# Step 5: Check bundle optimization
echo "📋 Step 5: Checking if bundle optimization was applied..."
cd ~/frontend

# Check if vite.config.ts has the new chunking
if grep -q "echarts-vendor" vite.config.ts 2>/dev/null; then
    echo "✅ vite.config.ts has optimization"
    
    # Check if build used it
    if ls dist/assets/echarts-vendor-*.js 2>/dev/null | grep -q .; then
        echo "✅ Bundle optimization applied!"
        ls -lh dist/assets/ | grep -E "echarts|recharts" | head -5
    else
        echo "⚠️  Optimization in config but not in build"
        echo "   Rebuilding with optimized config..."
        export VITE_API_URL="/api"
        export VITE_FASTAPI_URL="/api"
        npm run build
        
        # Check again
        if ls dist/assets/echarts-vendor-*.js 2>/dev/null | grep -q .; then
            echo "✅ Rebuild successful with optimization!"
            echo "   Deploying new build..."
            docker exec frontend rm -rf /usr/share/nginx/html/*
            docker cp dist/. frontend:/usr/share/nginx/html/
            docker exec frontend nginx -s reload
            echo "✅ New build deployed!"
        else
            echo "⚠️  Still showing chart-vendor, checking build output..."
            ls -lh dist/assets/ | grep vendor | head -5
        fi
    fi
else
    echo "⚠️  vite.config.ts doesn't have optimization"
    echo "   Pulling latest code..."
    git pull origin main
    
    if grep -q "echarts-vendor" vite.config.ts 2>/dev/null; then
        echo "✅ vite.config.ts updated"
        echo "   Rebuilding..."
        export VITE_API_URL="/api"
        export VITE_FASTAPI_URL="/api"
        npm run build
        docker exec frontend rm -rf /usr/share/nginx/html/*
        docker cp dist/. frontend:/usr/share/nginx/html/
        docker exec frontend nginx -s reload
        echo "✅ Rebuild and deploy complete!"
    else
        echo "❌ vite.config.ts still not updated"
        echo "   You may need to commit and push the changes first"
    fi
fi
echo ""

# Step 6: Final verification
echo "📋 Step 6: Final verification..."
echo ""
echo "Container status:"
docker ps | grep frontend
echo ""
echo "Nginx test:"
docker exec frontend nginx -t
echo ""
echo "Test HTTP:"
curl -I http://localhost 2>/dev/null | head -1 || echo "Could not test"
echo ""
echo "Bundle sizes:"
ls -lh dist/assets/ | grep -E "vendor|chart" | awk '{print $5, $9}' | head -5
echo ""

echo "✅✅✅ Diagnosis complete! ✅✅✅"
echo ""
echo "🌐 Test website:"
echo "   http://dev-swat.com (if using HTTP config)"
echo "   https://dev-swat.com (if SSL is configured)"
echo ""
echo "💡 If website still doesn't work:"
echo "   1. Check DNS: nslookup dev-swat.com"
echo "   2. Check firewall: sudo ufw status"
echo "   3. Check container logs: docker logs frontend --tail 50"

