#!/bin/bash

# Authentication Test Script
# Tests all authentication endpoints and records actual responses

BASE_URL="http://localhost:8001"
TEST_EMAIL="test@test.com"
TEST_PASSWORD="Test1234"
TEST_EMAIL_ALT="orgadmin@test.com"
TEST_PASSWORD_ALT="Test1234!"

echo "🧪 Starting Authentication Tests..."
echo "Base URL: $BASE_URL"
echo ""

# Create results directory
mkdir -p test_results
RESULTS_FILE="test_results/auth_test_results.json"

# Initialize results array
echo "[]" > "$RESULTS_FILE"

# Function to run test and save result
run_test() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local headers="$5"
    
    echo "Testing: $test_name"
    
    if [ -z "$data" ]; then
        if [ -z "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" 2>&1)
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" -H "$headers" 2>&1)
        fi
    else
        if [ -z "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data" 2>&1)
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data" \
                -c test_results/cookies.txt \
                -b test_results/cookies.txt 2>&1)
        fi
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n 1)
    # Extract body (all but last line)
    body=$(echo "$response" | head -n -1)
    
    # Save to JSON
    jq --arg name "$test_name" \
       --arg method "$method" \
       --arg endpoint "$endpoint" \
       --arg data "$data" \
       --arg status "$status_code" \
       --arg body "$body" \
       '. += [{
         "test_name": $name,
         "method": $method,
         "endpoint": $endpoint,
         "request_data": $data,
         "status_code": $status,
         "response_body": $body,
         "timestamp": now
       }]' "$RESULTS_FILE" > "$RESULTS_FILE.tmp" && mv "$RESULTS_FILE.tmp" "$RESULTS_FILE"
    
    echo "  Status: $status_code"
    echo "  Response: $body" | head -c 200
    echo ""
}

# Test 1: Valid Login
run_test "POST /auth/login (Valid Input)" \
    "POST" \
    "/auth/login" \
    "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}"

# Test 2: Invalid Email Format (Empty)
run_test "POST /auth/login (Empty Email)" \
    "POST" \
    "/auth/login" \
    "{\"email\":\"\",\"password\":\"$TEST_PASSWORD\"}"

# Test 3: Empty Password
run_test "POST /auth/login (Empty Password)" \
    "POST" \
    "/auth/login" \
    "{\"email\":\"$TEST_EMAIL\",\"password\":\"\"}"

# Test 4: Wrong Credentials
run_test "POST /auth/login (Wrong Credentials)" \
    "POST" \
    "/auth/login" \
    "{\"email\":\"nonexistent@example.com\",\"password\":\"wrongpassword\"}"

# Test 5: Missing Email Field
run_test "POST /auth/login (Missing Email)" \
    "POST" \
    "/auth/login" \
    "{\"password\":\"$TEST_PASSWORD\"}"

# Test 6: Missing Password Field
run_test "POST /auth/login (Missing Password)" \
    "POST" \
    "/auth/login" \
    "{\"email\":\"$TEST_EMAIL\"}"

# Test 7: Empty Body
run_test "POST /auth/login (Empty Body)" \
    "POST" \
    "/auth/login" \
    "{}"

# Test 8: Very Long Email
long_email="a@b.c$(printf 'x%.0s' {1..1000})"
run_test "POST /auth/login (Very Long Email)" \
    "POST" \
    "/auth/login" \
    "{\"email\":\"$long_email\",\"password\":\"test\"}"

# Test 9: Special Characters in Email
run_test "POST /auth/login (Special Characters Email)" \
    "POST" \
    "/auth/login" \
    "{\"email\":\"test+special@example.com\",\"password\":\"$TEST_PASSWORD\"}"

# Now test with cookies (need to login first to get tokens)
echo ""
echo "🔐 Logging in to get tokens for authenticated tests..."
login_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    -c test_results/cookies.txt 2>&1)

login_status=$(echo "$login_response" | tail -n 1)
login_body=$(echo "$login_response" | head -n -1)

if [ "$login_status" = "200" ]; then
    echo "✅ Login successful, proceeding with authenticated tests..."
    echo ""
    
    # Test 10: GET /auth/me (Valid Token)
    run_test "GET /auth/me (Valid Token)" \
        "GET" \
        "/auth/me" \
        "" \
        "Cookie: $(cat test_results/cookies.txt | grep -o 'access_token=[^;]*')"
    
    # Test 11: POST /auth/refresh (Valid Refresh Token)
    run_test "POST /auth/refresh (Valid Refresh Token)" \
        "POST" \
        "/auth/refresh" \
        ""
    
    # Test 12: POST /auth/logout (Valid Session)
    run_test "POST /auth/logout (Valid Session)" \
        "POST" \
        "/auth/logout" \
        ""
else
    echo "❌ Login failed (Status: $login_status), skipping authenticated tests"
    echo "Response: $login_body"
fi

# Test 13: GET /auth/me (Missing Token)
run_test "GET /auth/me (Missing Token)" \
    "GET" \
    "/auth/me" \
    ""

# Test 14: POST /auth/refresh (Missing Token)
run_test "POST /auth/refresh (Missing Token)" \
    "POST" \
    "/auth/refresh" \
    ""

# Test 15: POST /auth/logout (No Session)
run_test "POST /auth/logout (No Session)" \
    "POST" \
    "/auth/logout" \
    ""

echo ""
echo "✅ Authentication tests complete!"
echo "Results saved to: $RESULTS_FILE"
echo ""
echo "📊 Summary:"
jq -r '.[] | "\(.test_name): \(.status_code)"' "$RESULTS_FILE"

