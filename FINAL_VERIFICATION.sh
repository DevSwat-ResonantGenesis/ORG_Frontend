#!/bin/bash
# Final Verification - Check Everything is Working
# Run this to verify all connections

set -e

echo "🔍 Final Verification - Checking All Connections"
echo "================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ALL_GOOD=true

# 1. Check Backend API
echo "1️⃣  Checking Backend API..."
BACKEND_HEALTH=$(curl -s http://localhost:8001/health 2>/dev/null || echo "ERROR")
if echo "$BACKEND_HEALTH" | grep -q "status\|ok"; then
    echo -e "${GREEN}✅ Backend API: Working${NC}"
    echo "   Response: $BACKEND_HEALTH" | head -1
else
    echo -e "${RED}❌ Backend API: Not working${NC}"
    ALL_GOOD=false
fi
echo ""

# 2. Check API Proxy
echo "2️⃣  Checking API Proxy (/api/)..."
PROXY_HEALTH=$(curl -s http://localhost/api/health 2>/dev/null || echo "ERROR")
if echo "$PROXY_HEALTH" | grep -q "status\|ok"; then
    echo -e "${GREEN}✅ API Proxy: Working${NC}"
    echo "   Response: $PROXY_HEALTH" | head -1
else
    echo -e "${RED}❌ API Proxy: Not working${NC}"
    ALL_GOOD=false
fi
echo ""

# 3. Check Frontend
echo "3️⃣  Checking Frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null || echo "000")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend: Working (HTTP $FRONTEND_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Frontend: Not working (HTTP $FRONTEND_RESPONSE)${NC}"
    ALL_GOOD=false
fi
echo ""

# 4. Check SSL
echo "4️⃣  Checking SSL Certificate..."
SSL_CERT="/etc/letsencrypt/live/dev-swat.com/fullchain.pem"
SSL_EXISTS=$(docker exec frontend sh -c "test -f $SSL_CERT && echo yes || echo no" 2>/dev/null || echo "no")
if [ "$SSL_EXISTS" = "yes" ]; then
    echo -e "${GREEN}✅ SSL Certificate: Found${NC}"
    HTTPS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -k https://localhost 2>/dev/null || echo "000")
    if [ "$HTTPS_RESPONSE" = "200" ] || [ "$HTTPS_RESPONSE" = "301" ] || [ "$HTTPS_RESPONSE" = "302" ]; then
        echo -e "${GREEN}✅ HTTPS: Working (HTTP $HTTPS_RESPONSE)${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTPS: Certificate exists but not responding (HTTP $HTTPS_RESPONSE)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  SSL Certificate: Not found (using HTTP only)${NC}"
fi
echo ""

# 5. Check Frontend Build Configuration
echo "5️⃣  Checking Frontend Build Configuration..."
cd ~/frontend
if [ -f "dist/index.html" ]; then
    # Check if frontend uses /api path
    if grep -q '"/api' dist/index.html 2>/dev/null || grep -q "'/api" dist/index.html 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend: Using /api path${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend: Might not be using /api path${NC}"
        echo "   Consider rebuilding with: export VITE_API_URL='/api' && npm run build"
    fi
else
    echo -e "${YELLOW}⚠️  Frontend build not found${NC}"
fi
echo ""

# 6. Check Docker Containers
echo "6️⃣  Checking Docker Containers..."
if docker ps | grep -q frontend; then
    echo -e "${GREEN}✅ Frontend Container: Running${NC}"
else
    echo -e "${RED}❌ Frontend Container: Not running${NC}"
    ALL_GOOD=false
fi

if docker ps | grep -q "api\|resonantgraphaiv01-api"; then
    echo -e "${GREEN}✅ Backend API Container: Running${NC}"
else
    echo -e "${RED}❌ Backend API Container: Not running${NC}"
    ALL_GOOD=false
fi
echo ""

# 7. Test Key API Endpoints
echo "7️⃣  Testing Key API Endpoints..."

# Health
HEALTH_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "000")
if [ "$HEALTH_TEST" = "200" ]; then
    echo -e "${GREEN}✅ /api/health: Working${NC}"
else
    echo -e "${RED}❌ /api/health: Failed (HTTP $HEALTH_TEST)${NC}"
fi

# Docs
DOCS_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/docs 2>/dev/null || echo "000")
if [ "$DOCS_TEST" = "200" ]; then
    echo -e "${GREEN}✅ /api/docs: Working${NC}"
else
    echo -e "${YELLOW}⚠️  /api/docs: HTTP $DOCS_TEST${NC}"
fi
echo ""

# Summary
echo "================================================="
if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✅✅✅ ALL CHECKS PASSED! ✅✅✅${NC}"
else
    echo -e "${RED}❌ Some checks failed - see above${NC}"
fi
echo "================================================="
echo ""
echo "🌐 Website URLs:"
if [ "$SSL_EXISTS" = "yes" ]; then
    echo "   HTTP:  http://dev-swat.com (redirects to HTTPS)"
    echo "   HTTPS: https://dev-swat.com ✅"
else
    echo "   HTTP:  http://dev-swat.com ✅"
    echo "   HTTPS: https://dev-swat.com (SSL certificate needed)"
fi
echo ""
echo "🔌 API Endpoints:"
echo "   - Health: http://dev-swat.com/api/health ✅"
echo "   - Docs:   http://dev-swat.com/api/docs"
echo "   - Direct: http://137.184.234.252:8001"
echo ""
echo "📝 Next Steps (if needed):"
if [ "$SSL_EXISTS" = "no" ]; then
    echo "   - Set up SSL: docker exec frontend certbot --nginx -d dev-swat.com"
fi
echo "   - Rebuild frontend: export VITE_API_URL='/api' && npm run build"
echo "   - Deploy: docker exec frontend rm -rf /usr/share/nginx/html/* && docker cp dist/. frontend:/usr/share/nginx/html/"
echo ""

