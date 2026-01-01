#!/bin/bash
# Complete API and Backend Verification Script
# Run this on the droplet to verify everything is connected

set -e

echo "🔍 Verifying API and Backend Connections..."
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check Docker Services
echo "📋 Step 1: Checking Docker Services..."
echo ""

# Check backend API container
if docker ps | grep -q "api\|resonantgraphaiv01-api"; then
    API_CONTAINER=$(docker ps | grep "api\|resonantgraphaiv01-api" | awk '{print $1}' | head -1)
    echo -e "${GREEN}✅ Backend API container is running${NC}"
    echo "   Container: $API_CONTAINER"
else
    echo -e "${RED}❌ Backend API container is NOT running!${NC}"
    echo "   Checking all containers..."
    docker ps -a | grep -E "api|backend|resonant"
fi
echo ""

# Check ML Worker container
if docker ps | grep -q "ml-worker\|resonantgraphaiv01-ml-worker"; then
    ML_CONTAINER=$(docker ps | grep "ml-worker\|resonantgraphaiv01-ml-worker" | awk '{print $1}' | head -1)
    echo -e "${GREEN}✅ ML Worker container is running${NC}"
    echo "   Container: $ML_CONTAINER"
else
    echo -e "${YELLOW}⚠️  ML Worker container is NOT running${NC}"
fi
echo ""

# Check frontend container
if docker ps | grep -q frontend; then
    echo -e "${GREEN}✅ Frontend container is running${NC}"
else
    echo -e "${RED}❌ Frontend container is NOT running!${NC}"
fi
echo ""

# Step 2: Check Backend API Health
echo "📋 Step 2: Checking Backend API Health..."
echo ""

# Test backend API directly (port 8001)
echo "Testing backend API on port 8001..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health 2>/dev/null || echo "000")

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Backend API is responding (HTTP $BACKEND_HEALTH)${NC}"
    curl -s http://localhost:8001/health | head -3
elif [ "$BACKEND_HEALTH" = "000" ]; then
    echo -e "${RED}❌ Cannot connect to backend API on port 8001${NC}"
    echo "   Checking if port is listening..."
    netstat -tlnp | grep 8001 || echo "   Port 8001 is not listening"
else
    echo -e "${YELLOW}⚠️  Backend API returned HTTP $BACKEND_HEALTH${NC}"
    curl -s http://localhost:8001/health || echo ""
fi
echo ""

# Test backend API docs
echo "Testing backend API docs..."
BACKEND_DOCS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/docs 2>/dev/null || echo "000")
if [ "$BACKEND_DOCS" = "200" ]; then
    echo -e "${GREEN}✅ Backend API docs accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Backend API docs returned HTTP $BACKEND_DOCS${NC}"
fi
echo ""

# Step 3: Check Frontend-Backend Connection via Nginx Proxy
echo "📋 Step 3: Checking Frontend-Backend Connection (via Nginx Proxy)..."
echo ""

# Test API proxy from frontend container
echo "Testing /api/health through nginx proxy..."
PROXY_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "000")

if [ "$PROXY_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ API proxy is working (HTTP $PROXY_HEALTH)${NC}"
    curl -s http://localhost/api/health | head -3
elif [ "$PROXY_HEALTH" = "000" ]; then
    echo -e "${RED}❌ Cannot connect through API proxy${NC}"
else
    echo -e "${YELLOW}⚠️  API proxy returned HTTP $PROXY_HEALTH${NC}"
    curl -s http://localhost/api/health || echo ""
fi
echo ""

# Test from inside frontend container
echo "Testing API from inside frontend container..."
CONTAINER_PROXY=$(docker exec frontend sh -c 'curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health' 2>/dev/null || echo "000")
if [ "$CONTAINER_PROXY" = "200" ]; then
    echo -e "${GREEN}✅ API proxy works from inside container${NC}"
else
    echo -e "${YELLOW}⚠️  API proxy from container returned HTTP $CONTAINER_PROXY${NC}"
fi
echo ""

# Step 4: Check Nginx Configuration
echo "📋 Step 4: Checking Nginx API Proxy Configuration..."
echo ""

# Check if nginx config has API proxy
NGINX_HAS_API=$(docker exec frontend sh -c 'cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /api"' 2>/dev/null || echo "")

if [ -n "$NGINX_HAS_API" ]; then
    echo -e "${GREEN}✅ Nginx has API proxy configuration${NC}"
    echo "   Configuration:"
    docker exec frontend sh -c 'cat /etc/nginx/conf.d/default.conf | grep -A 10 "location /api"' | head -10
else
    echo -e "${RED}❌ Nginx does NOT have API proxy configuration!${NC}"
    echo "   Need to add /api/ location block"
fi
echo ""

# Step 5: Check Database Connection
echo "📋 Step 5: Checking Database Connection..."
echo ""

# Check backend logs for database connection
cd ~/ResonantGraphAIV0.1 2>/dev/null || cd /root/ResonantGraphAIV0.1 2>/dev/null || echo "Backend directory not found"

if [ -f ".env" ]; then
    echo "Checking .env file for database URLs..."
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✅ DATABASE_URL found in .env${NC}"
        DB_HOST=$(grep DATABASE_URL .env | sed 's/.*@\([^:]*\):.*/\1/' | head -1)
        echo "   Database host: $DB_HOST"
    else
        echo -e "${RED}❌ DATABASE_URL not found in .env${NC}"
    fi
    
    if grep -q "ML_REGISTRY_DATABASE_URL" .env; then
        echo -e "${GREEN}✅ ML_REGISTRY_DATABASE_URL found in .env${NC}"
    else
        echo -e "${YELLOW}⚠️  ML_REGISTRY_DATABASE_URL not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
fi
echo ""

# Check backend logs for database errors
echo "Checking backend logs for database connection errors..."
if [ -n "$API_CONTAINER" ]; then
    DB_ERRORS=$(docker logs "$API_CONTAINER" --tail 50 2>&1 | grep -i "database\|connection\|error" | tail -3 || echo "")
    if [ -n "$DB_ERRORS" ]; then
        echo -e "${YELLOW}⚠️  Found database-related messages in logs:${NC}"
        echo "$DB_ERRORS"
    else
        echo -e "${GREEN}✅ No database errors in recent logs${NC}"
    fi
fi
echo ""

# Step 6: Test Key API Endpoints
echo "📋 Step 6: Testing Key API Endpoints..."
echo ""

# Test /api/health
echo "Testing /api/health..."
HEALTH_RESPONSE=$(curl -s http://localhost/api/health 2>/dev/null || echo "ERROR")
if echo "$HEALTH_RESPONSE" | grep -q "ok\|status"; then
    echo -e "${GREEN}✅ /api/health endpoint working${NC}"
    echo "   Response: $HEALTH_RESPONSE" | head -1
else
    echo -e "${RED}❌ /api/health endpoint not working${NC}"
    echo "   Response: $HEALTH_RESPONSE"
fi
echo ""

# Test /api/docs (if available)
echo "Testing /api/docs..."
DOCS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/docs 2>/dev/null || echo "000")
if [ "$DOCS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ /api/docs endpoint accessible${NC}"
else
    echo -e "${YELLOW}⚠️  /api/docs returned HTTP $DOCS_RESPONSE${NC}"
fi
echo ""

# Step 7: Check Frontend API Configuration
echo "📋 Step 7: Checking Frontend API Configuration..."
echo ""

cd ~/frontend 2>/dev/null || cd /root/frontend 2>/dev/null || echo "Frontend directory not found"

# Check if frontend was built with correct API URL
if [ -f "dist/index.html" ]; then
    echo "Checking frontend build configuration..."
    # Check if API calls use /api (relative path)
    if grep -q '"/api' dist/index.html 2>/dev/null || grep -q "'/api" dist/index.html 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend uses /api (relative path)${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend might not be using /api path${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Frontend dist/index.html not found${NC}"
fi
echo ""

# Step 8: Summary and Recommendations
echo "=========================================="
echo "📊 SUMMARY"
echo "=========================================="
echo ""

# Count issues
ISSUES=0

if ! docker ps | grep -q "api\|resonantgraphaiv01-api"; then
    echo -e "${RED}❌ Backend API container is NOT running${NC}"
    ISSUES=$((ISSUES + 1))
fi

if [ "$BACKEND_HEALTH" != "200" ]; then
    echo -e "${RED}❌ Backend API health check failed${NC}"
    ISSUES=$((ISSUES + 1))
fi

if [ "$PROXY_HEALTH" != "200" ]; then
    echo -e "${RED}❌ API proxy health check failed${NC}"
    ISSUES=$((ISSUES + 1))
fi

if [ -z "$NGINX_HAS_API" ]; then
    echo -e "${RED}❌ Nginx API proxy configuration missing${NC}"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅✅✅ ALL CHECKS PASSED! ✅✅✅${NC}"
    echo ""
    echo "🌐 API Endpoints:"
    echo "   - Backend API: http://137.184.234.252:8001"
    echo "   - API Proxy: http://dev-swat.com/api"
    echo "   - API Health: http://dev-swat.com/api/health"
    echo "   - API Docs: http://dev-swat.com/api/docs"
else
    echo -e "${RED}❌ Found $ISSUES issue(s) that need to be fixed${NC}"
    echo ""
    echo "🔧 Next Steps:"
    echo "   1. Check backend container: cd ~/ResonantGraphAIV0.1 && docker compose ps"
    echo "   2. Check backend logs: docker compose logs api --tail 50"
    echo "   3. Verify nginx config: docker exec frontend cat /etc/nginx/conf.d/default.conf"
    echo "   4. Test API directly: curl http://localhost:8001/health"
fi

echo ""

