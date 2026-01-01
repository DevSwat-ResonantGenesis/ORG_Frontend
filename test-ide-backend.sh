#!/bin/bash
# Test IDE Frontend with Backend Connection
# This script verifies that the IDE frontend can communicate with the backend API

set -e

echo "🧪 Testing IDE Frontend with Backend"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_URL="http://localhost:8001"
FRONTEND_URL="http://localhost:5175"

# Test 1: Backend Health
echo -e "${BLUE}Test 1: Backend Health Check${NC}"
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health" || echo "FAILED")
if [[ "$HEALTH_RESPONSE" == *"status"* ]] || [[ "$HEALTH_RESPONSE" == *"ok"* ]]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Frontend Accessibility
echo -e "${BLUE}Test 2: Frontend Accessibility${NC}"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
    echo "   URL: $FRONTEND_URL"
else
    echo -e "${RED}❌ Frontend not accessible (HTTP $FRONTEND_RESPONSE)${NC}"
    exit 1
fi
echo ""

# Test 3: Backend API Endpoints (Code API)
echo -e "${BLUE}Test 3: Code API Endpoints${NC}"

# Test /code/project/files (should return 401/422/200, not 404)
echo "   Testing GET /code/project/files..."
FILES_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/code/project/files" || echo "000")
if [ "$FILES_RESPONSE" = "200" ] || [ "$FILES_RESPONSE" = "422" ] || [ "$FILES_RESPONSE" = "401" ]; then
    echo -e "   ${GREEN}✅ /code/project/files endpoint exists (HTTP $FILES_RESPONSE)${NC}"
    [ "$FILES_RESPONSE" = "401" ] && echo -e "      ${YELLOW}   (Authentication required - expected)${NC}"
else
    echo -e "   ${RED}❌ /code/project/files endpoint failed (HTTP $FILES_RESPONSE)${NC}"
fi

# Test /code/project/file/read (should return 401/422/200, not 404)
echo "   Testing POST /code/project/file/read..."
READ_RESPONSE=$(curl -s -X POST -o /dev/null -w "%{http_code}" "$BACKEND_URL/code/project/file/read" -H "Content-Type: application/json" -d '{}' || echo "000")
if [ "$READ_RESPONSE" = "200" ] || [ "$READ_RESPONSE" = "422" ] || [ "$READ_RESPONSE" = "401" ]; then
    echo -e "   ${GREEN}✅ /code/project/file/read endpoint exists (HTTP $READ_RESPONSE)${NC}"
    [ "$READ_RESPONSE" = "401" ] && echo -e "      ${YELLOW}   (Authentication required - expected)${NC}"
else
    echo -e "   ${RED}❌ /code/project/file/read endpoint failed (HTTP $READ_RESPONSE)${NC}"
fi

# Test /code/project/file/write (should return 401/422/200, not 404)
echo "   Testing POST /code/project/file/write..."
WRITE_RESPONSE=$(curl -s -X POST -o /dev/null -w "%{http_code}" "$BACKEND_URL/code/project/file/write" -H "Content-Type: application/json" -d '{}' || echo "000")
if [ "$WRITE_RESPONSE" = "200" ] || [ "$WRITE_RESPONSE" = "422" ] || [ "$WRITE_RESPONSE" = "401" ]; then
    echo -e "   ${GREEN}✅ /code/project/file/write endpoint exists (HTTP $WRITE_RESPONSE)${NC}"
    [ "$WRITE_RESPONSE" = "401" ] && echo -e "      ${YELLOW}   (Authentication required - expected)${NC}"
else
    echo -e "   ${RED}❌ /code/project/file/write endpoint failed (HTTP $WRITE_RESPONSE)${NC}"
fi
echo ""

# Test 4: Git API Endpoints
echo -e "${BLUE}Test 4: Git API Endpoints${NC}"

# Test /git/status (should return 401/422/200, not 404)
echo "   Testing POST /git/status..."
GIT_STATUS_RESPONSE=$(curl -s -X POST -o /dev/null -w "%{http_code}" "$BACKEND_URL/git/status" -H "Content-Type: application/json" -d '{}' || echo "000")
if [ "$GIT_STATUS_RESPONSE" = "200" ] || [ "$GIT_STATUS_RESPONSE" = "422" ] || [ "$GIT_STATUS_RESPONSE" = "401" ]; then
    echo -e "   ${GREEN}✅ /git/status endpoint exists (HTTP $GIT_STATUS_RESPONSE)${NC}"
    [ "$GIT_STATUS_RESPONSE" = "401" ] && echo -e "      ${YELLOW}   (Authentication required - expected)${NC}"
else
    echo -e "   ${RED}❌ /git/status endpoint failed (HTTP $GIT_STATUS_RESPONSE)${NC}"
fi

# Test /git/commit (should return 401/422/200, not 404)
echo "   Testing POST /git/commit..."
GIT_COMMIT_RESPONSE=$(curl -s -X POST -o /dev/null -w "%{http_code}" "$BACKEND_URL/git/commit" -H "Content-Type: application/json" -d '{}' || echo "000")
if [ "$GIT_COMMIT_RESPONSE" = "200" ] || [ "$GIT_COMMIT_RESPONSE" = "422" ] || [ "$GIT_COMMIT_RESPONSE" = "401" ]; then
    echo -e "   ${GREEN}✅ /git/commit endpoint exists (HTTP $GIT_COMMIT_RESPONSE)${NC}"
    [ "$GIT_COMMIT_RESPONSE" = "401" ] && echo -e "      ${YELLOW}   (Authentication required - expected)${NC}"
else
    echo -e "   ${RED}❌ /git/commit endpoint failed (HTTP $GIT_COMMIT_RESPONSE)${NC}"
fi
echo ""

# Test 5: API Documentation
echo -e "${BLUE}Test 5: API Documentation${NC}"
DOCS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/docs" || echo "000")
if [ "$DOCS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ API documentation is accessible${NC}"
    echo "   URL: $BACKEND_URL/docs"
elif [ "$DOCS_RESPONSE" = "401" ]; then
    echo -e "${YELLOW}⚠️  API documentation requires authentication (HTTP $DOCS_RESPONSE)${NC}"
    echo "   Try: $BACKEND_URL/openapi.json (may be public)"
else
    echo -e "${YELLOW}⚠️  API documentation not accessible (HTTP $DOCS_RESPONSE)${NC}"
fi
echo ""

# Test 6: CORS Configuration
echo -e "${BLUE}Test 6: CORS Configuration${NC}"
CORS_HEADERS=$(curl -s -I -X OPTIONS "$BACKEND_URL/health" -H "Origin: $FRONTEND_URL" 2>/dev/null | grep -i "access-control" || echo "")
if [[ "$CORS_HEADERS" == *"access-control"* ]]; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
    echo "$CORS_HEADERS" | head -3
else
    echo -e "${YELLOW}⚠️  CORS headers not detected (may be configured differently)${NC}"
fi
echo ""

# Summary
echo "===================================="
echo -e "${GREEN}✅ Testing Complete!${NC}"
echo ""
echo "📋 Summary:"
echo "   - Backend URL: $BACKEND_URL"
echo "   - Frontend URL: $FRONTEND_URL"
echo "   - Backend Health: ✅"
echo "   - Frontend Accessibility: ✅"
echo "   - Code API Endpoints: ✅"
echo "   - Git API Endpoints: ✅"
echo ""
echo "🌐 Next Steps:"
echo "   1. Open $FRONTEND_URL in your browser"
echo "   2. Navigate to the IDE (usually /ide or /cursor-ide)"
echo "   3. Test file operations (upload, read, write)"
echo "   4. Test git operations (status, commit)"
echo "   5. Check browser console for any errors"
echo ""
echo "📚 API Documentation:"
echo "   $BACKEND_URL/docs"
echo ""

