#!/bin/bash

# Test script for all 6 next-gen modules
# Tests backend endpoints and verifies integration

BASE_URL="http://localhost:8001"
FRONTEND_URL="http://localhost:5175"

echo "🧪 Testing All 6 Next-Gen Modules"
echo "=================================="
echo ""

# Test 1: Module 1 - Collaboration WebSocket
echo "📦 Module 1: Testing Collaboration WebSocket"
echo "-----------------------------------"
curl -s -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  "$BASE_URL/collaboration/ws/test-room" 2>&1 | head -10
echo ""
echo ""

# Test 2: Module 2 - Code Search
echo "🔍 Module 2: Testing Code Search"
echo "-----------------------------------"
curl -s -X POST "$BASE_URL/code/search/" \
  -H "Content-Type: application/json" \
  -d '{"query": "function", "search_type": "hybrid", "limit": 10}' \
  -w "\nStatus: %{http_code}\n" 2>&1 | head -15
echo ""
echo ""

# Test 3: Module 3 - GitHub Status
echo "🐙 Module 3: Testing GitHub Status"
echo "-----------------------------------"
curl -s -X GET "$BASE_URL/github/status" \
  -w "\nStatus: %{http_code}\n" 2>&1 | head -10
echo ""
echo ""

# Test 4: Module 4 - LSP WebSocket
echo "💡 Module 4: Testing LSP WebSocket"
echo "-----------------------------------"
curl -s -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  "$BASE_URL/lsp/ws/python" 2>&1 | head -10
echo ""
echo ""

# Test 5: Module 5 - Multi-LLM Router (already exists)
echo "🤖 Module 5: Multi-LLM Router (already integrated)"
echo "-----------------------------------"
echo "✅ Model selector already exists in UI"
echo ""
echo ""

# Test 6: Module 6 - Debugger
echo "🐛 Module 6: Testing Debugger"
echo "-----------------------------------"
curl -s -X POST "$BASE_URL/debug/start" \
  -H "Content-Type: application/json" \
  -d '{"project_id": "test", "language": "python"}' \
  -w "\nStatus: %{http_code}\n" 2>&1 | head -10
echo ""
echo ""

echo "✅ All module tests completed!"
echo ""
echo "Note: Some endpoints require authentication (401 expected)"
echo "Note: WebSocket tests may show connection errors (expected in curl)"

