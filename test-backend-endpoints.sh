#!/bin/bash

# Test script for the 5 new backend endpoints
# Make sure you're authenticated first

BASE_URL="http://localhost:8001"
PROJECT_ID="4347ffe9-36c8-4312-ad48-29423780efac"

echo "🧪 Testing Backend Endpoints for Advanced Modules"
echo "=================================================="
echo ""

# Test 1: Module A - Run Project
echo "📦 Module A: Testing POST /code/run"
echo "-----------------------------------"
curl -X POST "$BASE_URL/code/run" \
  -H "Content-Type: application/json" \
  -d "{\"project_id\": \"$PROJECT_ID\"}" \
  -w "\nStatus: %{http_code}\n" \
  2>/dev/null | head -20
echo ""
echo ""

# Test 2: Module B - Patch File
echo "🔧 Module B: Testing POST /code/patch"
echo "-----------------------------------"
curl -X POST "$BASE_URL/code/patch" \
  -H "Content-Type: application/json" \
  -d "{\"file_path\": \"test.py\", \"instructions\": \"Add error handling\"}" \
  -w "\nStatus: %{http_code}\n" \
  2>/dev/null | head -20
echo ""
echo ""

# Test 3: Module C - Explain Code
echo "💬 Module C: Testing POST /code/explain"
echo "-----------------------------------"
curl -X POST "$BASE_URL/code/explain" \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"def hello(): print('world')\", \"language\": \"python\"}" \
  -w "\nStatus: %{http_code}\n" \
  2>/dev/null | head -20
echo ""
echo ""

# Test 4: Module D - Download Project
echo "📥 Module D: Testing GET /code/project/download"
echo "-----------------------------------"
curl -X GET "$BASE_URL/code/project/download?project_id=$PROJECT_ID" \
  -w "\nStatus: %{http_code}\n" \
  -o /tmp/test-download.zip \
  2>/dev/null
if [ -f /tmp/test-download.zip ]; then
  echo "✅ Download successful, file size: $(ls -lh /tmp/test-download.zip | awk '{print $5}')"
  rm /tmp/test-download.zip
else
  echo "❌ Download failed"
fi
echo ""
echo ""

# Test 5: Module E - AST Refactor
echo "🔄 Module E: Testing POST /code/refactor/ast"
echo "-----------------------------------"
curl -X POST "$BASE_URL/code/refactor/ast" \
  -H "Content-Type: application/json" \
  -d "{\"file_path\": \"test.py\", \"rule\": \"reorder_imports\"}" \
  -w "\nStatus: %{http_code}\n" \
  2>/dev/null | head -20
echo ""
echo ""

echo "✅ All tests completed!"
