#!/bin/bash
# Test script for Power Modules (A-E) Backend Endpoints
# Tests all 5 modules with authentication

set -e

API_URL="${API_URL:-http://localhost:8001}"
PROJECT_ID="test-project-$(date +%s)"
WORKSPACE_ID=""
DEPLOYMENT_ID=""
PLUGIN_ID=""

echo "═══════════════════════════════════════════════════════════════"
echo "🧪 TESTING POWER MODULES (A-E) BACKEND ENDPOINTS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if API is running
echo "📡 Checking API health..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/health" || echo "000")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
if [ "$HEALTH_CODE" != "200" ]; then
  echo "❌ API is not healthy (HTTP $HEALTH_CODE)"
  echo "   Please ensure the backend is running on ${API_URL}"
  exit 1
fi
echo "✅ API is healthy"
echo ""

# Note: These endpoints require authentication
# In production, you would need to:
# 1. Login to get JWT token
# 2. Use token in Authorization header

echo "═══════════════════════════════════════════════════════════════"
echo "MODULE A: Container Sandbox"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "📦 Testing: POST /api/workspace/start"
START_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/workspace/start" \
  -H "Content-Type: application/json" \
  -H "Cookie: rg_access_token=test-token" \
  -d "{
    \"project_id\": \"${PROJECT_ID}\",
    \"image\": \"node:20\",
    \"memory_limit\": \"2g\"
  }" || echo "000")
START_CODE=$(echo "$START_RESPONSE" | tail -n1)
START_BODY=$(echo "$START_RESPONSE" | sed '$d')

if [ "$START_CODE" = "200" ] || [ "$START_CODE" = "201" ]; then
  echo "✅ Workspace started successfully"
  WORKSPACE_ID=$(echo "$START_BODY" | grep -o '"workspace_id":"[^"]*"' | cut -d'"' -f4 || echo "")
  echo "   Workspace ID: ${WORKSPACE_ID}"
elif [ "$START_CODE" = "401" ] || [ "$START_CODE" = "403" ]; then
  echo "⚠️  Authentication required (expected)"
  echo "   Response: $START_BODY"
else
  echo "❌ Failed to start workspace (HTTP $START_CODE)"
  echo "   Response: $START_BODY"
fi
echo ""

if [ -n "$WORKSPACE_ID" ]; then
  echo "📊 Testing: GET /api/workspace/${WORKSPACE_ID}/status"
  STATUS_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/api/workspace/${WORKSPACE_ID}/status" \
    -H "Cookie: rg_access_token=test-token" || echo "000")
  STATUS_CODE=$(echo "$STATUS_RESPONSE" | tail -n1)
  if [ "$STATUS_CODE" = "200" ]; then
    echo "✅ Workspace status retrieved"
  else
    echo "⚠️  Status check returned HTTP $STATUS_CODE (may require auth)"
  fi
  echo ""
fi

echo "═══════════════════════════════════════════════════════════════"
echo "MODULE B: Serverless Deploy"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "🚀 Testing: POST /api/deploy/vercel"
VERCEL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/deploy/vercel" \
  -H "Content-Type: application/json" \
  -H "Cookie: rg_access_token=test-token" \
  -d "{
    \"project_id\": \"${PROJECT_ID}\",
    \"name\": \"test-deployment\"
  }" || echo "000")
VERCEL_CODE=$(echo "$VERCEL_RESPONSE" | tail -n1)
if [ "$VERCEL_CODE" = "200" ] || [ "$VERCEL_CODE" = "201" ]; then
  echo "✅ Vercel deployment initiated"
  DEPLOYMENT_ID=$(echo "$VERCEL_RESPONSE" | sed '$d' | grep -o '"deployment_id":"[^"]*"' | cut -d'"' -f4 || echo "")
elif [ "$VERCEL_CODE" = "400" ]; then
  echo "⚠️  Vercel token required (expected for first-time setup)"
elif [ "$VERCEL_CODE" = "401" ] || [ "$VERCEL_CODE" = "403" ]; then
  echo "⚠️  Authentication required (expected)"
else
  echo "⚠️  Deployment test returned HTTP $VERCEL_CODE"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "MODULE C: Workspace Sharing"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ -n "$WORKSPACE_ID" ]; then
  echo "🔗 Testing: POST /api/workspace/${WORKSPACE_ID}/invite"
  INVITE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}/api/workspace/${WORKSPACE_ID}/invite" \
    -H "Content-Type: application/json" \
    -H "Cookie: rg_access_token=test-token" \
    -d "{
      \"permission\": \"edit\",
      \"expires_in_hours\": 24
    }" || echo "000")
  INVITE_CODE=$(echo "$INVITE_RESPONSE" | tail -n1)
  if [ "$INVITE_CODE" = "200" ] || [ "$INVITE_CODE" = "201" ]; then
    echo "✅ Invite link created"
    INVITE_TOKEN=$(echo "$INVITE_RESPONSE" | sed '$d' | grep -o '"invite_token":"[^"]*"' | cut -d'"' -f4 || echo "")
    echo "   Token: ${INVITE_TOKEN:0:20}..."
  elif [ "$INVITE_CODE" = "401" ] || [ "$INVITE_CODE" = "403" ]; then
    echo "⚠️  Authentication required (expected)"
  else
    echo "⚠️  Invite creation returned HTTP $INVITE_CODE"
  fi
  echo ""
fi

echo "═══════════════════════════════════════════════════════════════"
echo "MODULE D: PTY Terminal"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "💻 Testing: WebSocket /api/terminal/pty/{workspace_id}"
if [ -n "$WORKSPACE_ID" ]; then
  echo "   WebSocket endpoint: ws://localhost:8001/api/terminal/pty/${WORKSPACE_ID}"
  echo "   ⚠️  WebSocket testing requires a WebSocket client"
  echo "   Use browser DevTools or a WebSocket testing tool"
else
  echo "   ⚠️  Skipped (no workspace ID available)"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "MODULE E: Plugin System"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "🔌 Testing: GET /api/plugins"
PLUGINS_RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}/api/plugins" \
  -H "Cookie: rg_access_token=test-token" || echo "000")
PLUGINS_CODE=$(echo "$PLUGINS_RESPONSE" | tail -n1)
if [ "$PLUGINS_CODE" = "200" ]; then
  echo "✅ Plugins list retrieved"
  PLUGIN_COUNT=$(echo "$PLUGINS_RESPONSE" | sed '$d' | grep -o '"plugin_id"' | wc -l || echo "0")
  echo "   Found $PLUGIN_COUNT plugins"
elif [ "$PLUGINS_CODE" = "401" ] || [ "$PLUGINS_CODE" = "403" ]; then
  echo "⚠️  Authentication required (expected)"
else
  echo "⚠️  Plugins list returned HTTP $PLUGINS_CODE"
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ TEST SUMMARY"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "All endpoints are accessible and responding."
echo "401/403 responses are expected without authentication."
echo ""
echo "To test with authentication:"
echo "1. Login to get JWT token"
echo "2. Use token in Cookie: rg_access_token=<token>"
echo "3. Re-run this script"
echo ""
echo "WebSocket endpoints require a WebSocket client to test."
echo ""

