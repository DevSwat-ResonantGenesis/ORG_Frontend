#!/usr/bin/env python3
"""
Authentication Test Runner
Runs all authentication endpoint tests and outputs results in the required format
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8001"
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "Test1234"

results = []

def run_test(test_name, method, endpoint, data=None, headers=None, cookies=None):
    """Run a test and return the result"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, cookies=cookies, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, cookies=cookies, timeout=5)
        else:
            return None
        
        result = {
            "test_name": test_name,
            "method": method,
            "endpoint": endpoint,
            "request_data": data,
            "status_code": response.status_code,
            "response_body": response.text,
            "headers": dict(response.headers) if response.headers else {},
            "cookies": dict(response.cookies) if response.cookies else {}
        }
        
        # Try to parse JSON response
        try:
            result["response_json"] = response.json()
        except:
            result["response_json"] = None
        
        return result
    except Exception as e:
        return {
            "test_name": test_name,
            "method": method,
            "endpoint": endpoint,
            "request_data": data,
            "status_code": "ERROR",
            "response_body": str(e),
            "error": True
        }

# Test 1: Valid Login
print("Test 1: POST /auth/login (Valid Input)")
result = run_test(
    "POST /auth/login (Valid Input)",
    "POST",
    "/auth/login",
    {"email": TEST_EMAIL, "password": TEST_PASSWORD}
)
results.append(result)
cookies = result.get("cookies", {}) if result else {}
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Test 2: Empty Email
print("Test 2: POST /auth/login (Empty Email)")
result = run_test(
    "POST /auth/login (Empty Email)",
    "POST",
    "/auth/login",
    {"email": "", "password": TEST_PASSWORD}
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Test 3: Empty Password
print("Test 3: POST /auth/login (Empty Password)")
result = run_test(
    "POST /auth/login (Empty Password)",
    "POST",
    "/auth/login",
    {"email": TEST_EMAIL, "password": ""}
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Test 4: Wrong Credentials
print("Test 4: POST /auth/login (Wrong Credentials)")
result = run_test(
    "POST /auth/login (Wrong Credentials)",
    "POST",
    "/auth/login",
    {"email": "nonexistent@example.com", "password": "wrongpassword"}
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Test 5: Missing Email Field
print("Test 5: POST /auth/login (Missing Email)")
result = run_test(
    "POST /auth/login (Missing Email)",
    "POST",
    "/auth/login",
    {"password": TEST_PASSWORD}
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Test 6: Missing Password Field
print("Test 6: POST /auth/login (Missing Password)")
result = run_test(
    "POST /auth/login (Missing Password)",
    "POST",
    "/auth/login",
    {"email": TEST_EMAIL}
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Test 7: Empty Body
print("Test 7: POST /auth/login (Empty Body)")
result = run_test(
    "POST /auth/login (Empty Body)",
    "POST",
    "/auth/login",
    {}
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Test 8: Very Long Email
print("Test 8: POST /auth/login (Very Long Email)")
long_email = "a@b.c" + "x" * 1000
result = run_test(
    "POST /auth/login (Very Long Email)",
    "POST",
    "/auth/login",
    {"email": long_email, "password": "test"}
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Test 9: Special Characters in Email
print("Test 9: POST /auth/login (Special Characters Email)")
result = run_test(
    "POST /auth/login (Special Characters Email)",
    "POST",
    "/auth/login",
    {"email": "test+special@example.com", "password": TEST_PASSWORD}
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Get valid session for authenticated tests
print("Getting valid session for authenticated tests...")
login_result = run_test(
    "Login for session",
    "POST",
    "/auth/login",
    {"email": TEST_EMAIL, "password": TEST_PASSWORD}
)
session_cookies = login_result.get("cookies", {}) if login_result and login_result.get("status_code") == 200 else {}
print(f"  Login Status: {login_result['status_code'] if login_result else 'ERROR'}")
print()

if session_cookies:
    # Test 10: GET /auth/me (Valid Token)
    print("Test 10: GET /auth/me (Valid Token)")
    result = run_test(
        "GET /auth/me (Valid Token)",
        "GET",
        "/auth/me",
        cookies=session_cookies
    )
    results.append(result)
    print(f"  Status: {result['status_code'] if result else 'ERROR'}")
    print()
    
    # Test 11: POST /auth/refresh (Valid Refresh Token)
    print("Test 11: POST /auth/refresh (Valid Refresh Token)")
    result = run_test(
        "POST /auth/refresh (Valid Refresh Token)",
        "POST",
        "/auth/refresh",
        cookies=session_cookies
    )
    results.append(result)
    print(f"  Status: {result['status_code'] if result else 'ERROR'}")
    print()
    
    # Test 12: POST /auth/logout (Valid Session)
    print("Test 12: POST /auth/logout (Valid Session)")
    result = run_test(
        "POST /auth/logout (Valid Session)",
        "POST",
        "/auth/logout",
        cookies=session_cookies
    )
    results.append(result)
    print(f"  Status: {result['status_code'] if result else 'ERROR'}")
    print()

# Test 13: GET /auth/me (Missing Token)
print("Test 13: GET /auth/me (Missing Token)")
result = run_test(
    "GET /auth/me (Missing Token)",
    "GET",
    "/auth/me"
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Test 14: POST /auth/refresh (Missing Token)
print("Test 14: POST /auth/refresh (Missing Token)")
result = run_test(
    "POST /auth/refresh (Missing Token)",
    "POST",
    "/auth/refresh"
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Test 15: POST /auth/logout (No Session)
print("Test 15: POST /auth/logout (No Session)")
result = run_test(
    "POST /auth/logout (No Session)",
    "POST",
    "/auth/logout"
)
results.append(result)
print(f"  Status: {result['status_code'] if result else 'ERROR'}")
print()

# Save results
with open("test_results/auth_test_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("\n✅ All tests complete!")
print(f"Results saved to: test_results/auth_test_results.json")
print(f"\n📊 Summary:")
for r in results:
    status = r.get('status_code', 'ERROR')
    name = r.get('test_name', 'Unknown')
    print(f"  {name}: {status}")

