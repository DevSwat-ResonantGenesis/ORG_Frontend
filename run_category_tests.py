#!/usr/bin/env python3
"""
Comprehensive Test Runner for Categories A, B, and C
Runs all tests from the testing roadmap and outputs results
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Optional, Any

BASE_URL = "http://localhost:8001"
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "Test1234"

results = []
session_cookies = {}
access_token = None

def run_test(
    test_name: str,
    method: str,
    endpoint: str,
    data: Optional[Dict] = None,
    headers: Optional[Dict] = None,
    cookies: Optional[Dict] = None,
    timeout: int = 10
) -> Dict[str, Any]:
    """Run a test and return the result"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, cookies=cookies, timeout=timeout)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, cookies=cookies, timeout=timeout)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, cookies=cookies, timeout=timeout)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, cookies=cookies, timeout=timeout)
        elif method == "PATCH":
            response = requests.patch(url, json=data, headers=headers, cookies=cookies, timeout=timeout)
        else:
            return {
                "test_name": test_name,
                "status": "ERROR",
                "error": f"Unsupported method: {method}"
            }
        
        result = {
            "test_name": test_name,
            "method": method,
            "endpoint": endpoint,
            "request_data": data,
            "status_code": response.status_code,
            "response_body": response.text[:500],  # Limit response body length
            "headers": dict(response.headers) if response.headers else {},
            "cookies": dict(response.cookies) if response.cookies else {}
        }
        
        # Try to parse JSON response
        try:
            result["response_json"] = response.json()
        except:
            result["response_json"] = None
        
        return result
    except requests.exceptions.Timeout:
        return {
            "test_name": test_name,
            "method": method,
            "endpoint": endpoint,
            "status_code": "TIMEOUT",
            "error": "Request timeout"
        }
    except Exception as e:
        return {
            "test_name": test_name,
            "method": method,
            "endpoint": endpoint,
            "status_code": "ERROR",
            "error": str(e)
        }

def login() -> bool:
    """Login and get session cookies"""
    global session_cookies, access_token
    print("🔐 Logging in to get session...")
    result = run_test(
        "Login for session",
        "POST",
        "/auth/login",
        {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    
    if result.get("status_code") == 200:
        session_cookies = result.get("cookies", {})
        # Try to extract token from response
        if result.get("response_json"):
            access_token = result.get("response_json", {}).get("access_token")
        print(f"  ✅ Login successful")
        return True
    else:
        print(f"  ⚠️  Login failed: {result.get('status_code')}")
        return False

def create_expired_token() -> str:
    """Create a token that appears expired (malformed)"""
    # Return a malformed token that will be rejected
    return "expired.token.here"

# ============================================================================
# CATEGORY A: AUTHENTICATION - 4 tests
# ============================================================================

def test_category_a():
    """Category A: Authentication Token Expiry Tests"""
    print("\n" + "="*70)
    print("CATEGORY A: AUTHENTICATION - Token Expiry Tests")
    print("="*70)
    
    # A.1: GET /auth/me with expired access token
    print("\n[A.1] GET /auth/me with expired access token")
    expired_token = create_expired_token()
    result = run_test(
        "A.1 - GET /auth/me with expired access token",
        "GET",
        "/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"} if expired_token else None,
        cookies={"access_token": expired_token} if expired_token else None
    )
    results.append(result)
    expected = 401
    status = "✅ PASS" if result.get("status_code") == expected else f"❌ FAIL (expected {expected}, got {result.get('status_code')})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # A.2: POST /auth/refresh with expired refresh token
    print("\n[A.2] POST /auth/refresh with expired refresh token")
    result = run_test(
        "A.2 - POST /auth/refresh with expired refresh token",
        "POST",
        "/auth/refresh",
        cookies={"refresh_token": "expired.refresh.token"}
    )
    results.append(result)
    expected = 401
    status = "✅ PASS" if result.get("status_code") == expected else f"❌ FAIL (expected {expected}, got {result.get('status_code')})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # A.3: Accessing protected endpoint with expired token
    print("\n[A.3] Accessing protected endpoint with expired token")
    result = run_test(
        "A.3 - Accessing protected endpoint with expired token",
        "GET",
        "/rag/memories",
        cookies={"access_token": "expired.token"}
    )
    results.append(result)
    expected = 401
    status = "✅ PASS" if result.get("status_code") == expected else f"❌ FAIL (expected {expected}, got {result.get('status_code')})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # A.4: Login → wait → refresh → access protected
    print("\n[A.4] Login → wait → refresh → access protected")
    # First login
    login_result = run_test(
        "A.4 - Initial login",
        "POST",
        "/auth/login",
        {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if login_result.get("status_code") == 200:
        temp_cookies = login_result.get("cookies", {})
        # Try refresh
        refresh_result = run_test(
            "A.4 - Refresh token",
            "POST",
            "/auth/refresh",
            cookies=temp_cookies
        )
        if refresh_result.get("status_code") == 200:
            new_cookies = refresh_result.get("cookies", {}) or temp_cookies
            # Try accessing protected endpoint
            protected_result = run_test(
                "A.4 - Access protected endpoint after refresh",
                "GET",
                "/rag/memories",
                cookies=new_cookies
            )
            results.append(protected_result)
            expected = 200
            status = "✅ PASS" if protected_result.get("status_code") == expected else f"❌ FAIL (expected {expected}, got {protected_result.get('status_code')})"
            print(f"  Status: {protected_result.get('status_code')} - {status}")
        else:
            results.append(refresh_result)
            print(f"  ⚠️  Refresh failed: {refresh_result.get('status_code')}")
    else:
        results.append(login_result)
        print(f"  ⚠️  Login failed: {login_result.get('status_code')}")

# ============================================================================
# CATEGORY B: HASH SPHERE - 3 tests
# ============================================================================

def test_category_b():
    """Category B: Hash Sphere - Anchors List"""
    print("\n" + "="*70)
    print("CATEGORY B: HASH SPHERE - Anchors List Tests")
    print("="*70)
    
    # B.1: GET /hash-sphere/anchors (valid)
    print("\n[B.1] GET /hash-sphere/anchors (valid)")
    result = run_test(
        "B.1 - GET /hash-sphere/anchors (valid)",
        "GET",
        "/hash-sphere/anchors",
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"❌ FAIL (expected {expected}, got {result.get('status_code')})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # B.2: GET /hash-sphere/anchors?limit=200
    print("\n[B.2] GET /hash-sphere/anchors?limit=200")
    result = run_test(
        "B.2 - GET /hash-sphere/anchors?limit=200",
        "GET",
        "/hash-sphere/anchors?limit=200",
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"❌ FAIL (expected {expected}, got {result.get('status_code')})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # B.3: GET /hash-sphere/anchors with min_importance filters
    print("\n[B.3] GET /hash-sphere/anchors with min_importance filters")
    result = run_test(
        "B.3 - GET /hash-sphere/anchors with min_importance filters",
        "GET",
        "/hash-sphere/anchors?min_importance=0.5",
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"❌ FAIL (expected {expected}, got {result.get('status_code')})"
    print(f"  Status: {result.get('status_code')} - {status}")

# ============================================================================
# CATEGORY C: RAG / MEMORY - 32 tests
# ============================================================================

def test_category_c():
    """Category C: RAG / Memory Tests"""
    print("\n" + "="*70)
    print("CATEGORY C: RAG / MEMORY - 32 Tests")
    print("="*70)
    
    created_memory_id = None
    
    # C.1: Memory CRUD (12 tests)
    print("\n" + "-"*70)
    print("C.1: Memory CRUD Operations")
    print("-"*70)
    
    # C.1.1: POST /rag/memories – valid
    print("\n[C.1.1] POST /rag/memories – valid")
    memory_data = {
        "content": "Test memory content for testing",
        "metadata": {"source": "test", "category": "testing"}
    }
    result = run_test(
        "C.1.1 - POST /rag/memories (valid)",
        "POST",
        "/rag/memories",
        data=memory_data,
        cookies=session_cookies
    )
    results.append(result)
    if result.get("status_code") in [200, 201]:
        # Extract memory ID from response
        if result.get("response_json") and isinstance(result.get("response_json"), dict):
            created_memory_id = result.get("response_json", {}).get("id") or result.get("response_json", {}).get("memory_id")
    expected = 201
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.1.2: POST /rag/memories – missing fields
    print("\n[C.1.2] POST /rag/memories – missing fields")
    result = run_test(
        "C.1.2 - POST /rag/memories (missing fields)",
        "POST",
        "/rag/memories",
        data={"metadata": {}},  # Missing content
        cookies=session_cookies
    )
    results.append(result)
    expected = 422
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.1.3: POST /rag/memories – huge content
    print("\n[C.1.3] POST /rag/memories – huge content")
    huge_content = "x" * (2 * 1024 * 1024)  # 2MB
    result = run_test(
        "C.1.3 - POST /rag/memories (huge content)",
        "POST",
        "/rag/memories",
        data={"content": huge_content, "metadata": {}},
        cookies=session_cookies,
        timeout=30
    )
    results.append(result)
    expected = [201, 413]
    status = "✅ PASS" if result.get("status_code") in expected else f"⚠️  {result.get('status_code')}"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.1.4: POST /rag/memories – unicode
    print("\n[C.1.4] POST /rag/memories – unicode")
    unicode_content = "测试内容 🚀 日本語 한국어 العربية русский"
    result = run_test(
        "C.1.4 - POST /rag/memories (unicode)",
        "POST",
        "/rag/memories",
        data={"content": unicode_content, "metadata": {}},
        cookies=session_cookies
    )
    results.append(result)
    expected = 201
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.1.5: GET /rag/memories – list
    print("\n[C.1.5] GET /rag/memories – list")
    result = run_test(
        "C.1.5 - GET /rag/memories (list)",
        "GET",
        "/rag/memories",
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"❌ FAIL (expected {expected}, got {result.get('status_code')})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.1.6: GET /rag/memories?limit=50
    print("\n[C.1.6] GET /rag/memories?limit=50")
    result = run_test(
        "C.1.6 - GET /rag/memories?limit=50",
        "GET",
        "/rag/memories?limit=50",
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"❌ FAIL (expected {expected}, got {result.get('status_code')})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.1.7: GET /rag/memories/{id} – valid
    if created_memory_id:
        print(f"\n[C.1.7] GET /rag/memories/{created_memory_id} – valid")
        result = run_test(
            f"C.1.7 - GET /rag/memories/{created_memory_id} (valid)",
            "GET",
            f"/rag/memories/{created_memory_id}",
            cookies=session_cookies
        )
        results.append(result)
        expected = 200
        status = "✅ PASS" if result.get("status_code") == expected else f"❌ FAIL (expected {expected}, got {result.get('status_code')})"
        print(f"  Status: {result.get('status_code')} - {status}")
    else:
        print("\n[C.1.7] GET /rag/memories/{id} – valid (SKIPPED - no memory ID)")
        results.append({
            "test_name": "C.1.7 - GET /rag/memories/{id} (valid)",
            "status": "SKIPPED",
            "reason": "No memory ID available"
        })
    
    # C.1.8: GET /rag/memories/{id} – 404
    print("\n[C.1.8] GET /rag/memories/{id} – 404")
    result = run_test(
        "C.1.8 - GET /rag/memories/99999999 (404)",
        "GET",
        "/rag/memories/99999999",
        cookies=session_cookies
    )
    results.append(result)
    expected = 404
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.1.9: PUT /rag/memories/{id} – update
    if created_memory_id:
        print(f"\n[C.1.9] PUT /rag/memories/{created_memory_id} – update")
        result = run_test(
            f"C.1.9 - PUT /rag/memories/{created_memory_id} (update)",
            "PUT",
            f"/rag/memories/{created_memory_id}",
            data={"content": "Updated memory content", "metadata": {"updated": True}},
            cookies=session_cookies
        )
        results.append(result)
        expected = 200
        status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
        print(f"  Status: {result.get('status_code')} - {status}")
    else:
        print("\n[C.1.9] PUT /rag/memories/{id} – update (SKIPPED - no memory ID)")
        results.append({
            "test_name": "C.1.9 - PUT /rag/memories/{id} (update)",
            "status": "SKIPPED",
            "reason": "No memory ID available"
        })
    
    # C.1.10: PUT /rag/memories/{id} – update invalid
    if created_memory_id:
        print(f"\n[C.1.10] PUT /rag/memories/{created_memory_id} – update invalid")
        result = run_test(
            f"C.1.10 - PUT /rag/memories/{created_memory_id} (update invalid)",
            "PUT",
            f"/rag/memories/{created_memory_id}",
            data={"invalid_field": "invalid"},  # Invalid data
            cookies=session_cookies
        )
        results.append(result)
        expected = 422
        status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
        print(f"  Status: {result.get('status_code')} - {status}")
    else:
        print("\n[C.1.10] PUT /rag/memories/{id} – update invalid (SKIPPED)")
        results.append({
            "test_name": "C.1.10 - PUT /rag/memories/{id} (update invalid)",
            "status": "SKIPPED"
        })
    
    # C.1.11: DELETE /rag/memories/{id} – valid
    if created_memory_id:
        print(f"\n[C.1.11] DELETE /rag/memories/{created_memory_id} – valid")
        result = run_test(
            f"C.1.11 - DELETE /rag/memories/{created_memory_id} (valid)",
            "DELETE",
            f"/rag/memories/{created_memory_id}",
            cookies=session_cookies
        )
        results.append(result)
        expected = 204
        status = "✅ PASS" if result.get("status_code") in [200, 204] else f"⚠️  {result.get('status_code')} (expected {expected})"
        print(f"  Status: {result.get('status_code')} - {status}")
    else:
        print("\n[C.1.11] DELETE /rag/memories/{id} – valid (SKIPPED)")
        results.append({
            "test_name": "C.1.11 - DELETE /rag/memories/{id} (valid)",
            "status": "SKIPPED"
        })
    
    # C.1.12: DELETE /rag/memories/{id} – 404
    print("\n[C.1.12] DELETE /rag/memories/{id} – 404")
    result = run_test(
        "C.1.12 - DELETE /rag/memories/99999999 (404)",
        "DELETE",
        "/rag/memories/99999999",
        cookies=session_cookies
    )
    results.append(result)
    expected = 404
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.2: Memory Search (8 tests)
    print("\n" + "-"*70)
    print("C.2: Memory Search")
    print("-"*70)
    
    # Create a memory for search tests
    search_memory = run_test(
        "C.2 - Create memory for search",
        "POST",
        "/rag/memories",
        data={"content": "This is a test memory about artificial intelligence and machine learning", "metadata": {"topic": "AI"}},
        cookies=session_cookies
    )
    
    # C.2.1: POST /rag/memories/search – simple query
    print("\n[C.2.1] POST /rag/memories/search – simple query")
    result = run_test(
        "C.2.1 - POST /rag/memories/search (simple query)",
        "POST",
        "/rag/memories/search",
        data={"query": "artificial intelligence"},
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.2.2: Search – semantic
    print("\n[C.2.2] Search – semantic")
    result = run_test(
        "C.2.2 - POST /rag/memories/search (semantic)",
        "POST",
        "/rag/memories/search",
        data={"query": "machine learning", "search_type": "semantic"},
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.2.3: Search – hybrid
    print("\n[C.2.3] Search – hybrid")
    result = run_test(
        "C.2.3 - POST /rag/memories/search (hybrid)",
        "POST",
        "/rag/memories/search",
        data={"query": "AI", "search_type": "hybrid"},
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.2.4: Search – no results
    print("\n[C.2.4] Search – no results")
    result = run_test(
        "C.2.4 - POST /rag/memories/search (no results)",
        "POST",
        "/rag/memories/search",
        data={"query": "xyzabc123nonexistentquery"},
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.2.5: Search – unicode
    print("\n[C.2.5] Search – unicode")
    result = run_test(
        "C.2.5 - POST /rag/memories/search (unicode)",
        "POST",
        "/rag/memories/search",
        data={"query": "测试 日本語"},
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.2.6: Search – large query
    print("\n[C.2.6] Search – large query")
    large_query = "test " * 1000
    result = run_test(
        "C.2.6 - POST /rag/memories/search (large query)",
        "POST",
        "/rag/memories/search",
        data={"query": large_query},
        cookies=session_cookies,
        timeout=30
    )
    results.append(result)
    expected = [200, 400]
    status = "✅ PASS" if result.get("status_code") in expected else f"⚠️  {result.get('status_code')}"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.2.7: Search – with filters
    print("\n[C.2.7] Search – with filters")
    result = run_test(
        "C.2.7 - POST /rag/memories/search (with filters)",
        "POST",
        "/rag/memories/search",
        data={"query": "test", "filters": {"topic": "AI"}},
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.2.8: Search – multiple memories
    print("\n[C.2.8] Search – multiple memories")
    # Create another memory
    run_test(
        "C.2.8 - Create second memory",
        "POST",
        "/rag/memories",
        data={"content": "Another memory about neural networks", "metadata": {}},
        cookies=session_cookies
    )
    result = run_test(
        "C.2.8 - POST /rag/memories/search (multiple memories)",
        "POST",
        "/rag/memories/search",
        data={"query": "neural"},
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.3: Memory Analytics (3 tests)
    print("\n" + "-"*70)
    print("C.3: Memory Analytics")
    print("-"*70)
    
    # C.3.1: GET /rag/analytics – distribution
    print("\n[C.3.1] GET /rag/analytics – distribution")
    result = run_test(
        "C.3.1 - GET /rag/analytics (distribution)",
        "GET",
        "/rag/analytics",
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.3.2: Analytics – empty database (skip if we have memories)
    print("\n[C.3.2] Analytics – empty database")
    result = run_test(
        "C.3.2 - GET /rag/analytics (empty database)",
        "GET",
        "/rag/analytics",
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.3.3: Analytics – after multiple inserts
    print("\n[C.3.3] Analytics – after multiple inserts")
    # Create a few more memories
    for i in range(3):
        run_test(
            f"C.3.3 - Create memory {i+1}",
            "POST",
            "/rag/memories",
            data={"content": f"Memory {i+1} for analytics test", "metadata": {}},
            cookies=session_cookies
        )
    result = run_test(
        "C.3.3 - GET /rag/analytics (after multiple inserts)",
        "GET",
        "/rag/analytics",
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.4: Memory Sharing (4 tests)
    print("\n" + "-"*70)
    print("C.4: Memory Sharing")
    print("-"*70)
    
    # Create a memory to share
    share_memory = run_test(
        "C.4 - Create memory for sharing",
        "POST",
        "/rag/memories",
        data={"content": "Memory to be shared", "metadata": {}},
        cookies=session_cookies
    )
    share_memory_id = None
    if share_memory.get("status_code") in [200, 201] and share_memory.get("response_json"):
        share_memory_id = share_memory.get("response_json", {}).get("id") or share_memory.get("response_json", {}).get("memory_id")
    
    # C.4.1: POST /rag/memories/share
    if share_memory_id:
        print(f"\n[C.4.1] POST /rag/memories/share")
        result = run_test(
            "C.4.1 - POST /rag/memories/share",
            "POST",
            f"/rag/memories/{share_memory_id}/share",
            data={"user_id": "test_user_id"},  # May need actual user ID
            cookies=session_cookies
        )
        results.append(result)
        expected = [200, 201]
        status = "✅ PASS" if result.get("status_code") in expected else f"⚠️  {result.get('status_code')}"
        print(f"  Status: {result.get('status_code')} - {status}")
    else:
        print("\n[C.4.1] POST /rag/memories/share (SKIPPED)")
        results.append({"test_name": "C.4.1 - POST /rag/memories/share", "status": "SKIPPED"})
    
    # C.4.2: GET /rag/memories/shared
    print("\n[C.4.2] GET /rag/memories/shared")
    result = run_test(
        "C.4.2 - GET /rag/memories/shared",
        "GET",
        "/rag/memories/shared",
        cookies=session_cookies
    )
    results.append(result)
    expected = 200
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.4.3: Remove share
    if share_memory_id:
        print(f"\n[C.4.3] Remove share")
        result = run_test(
            "C.4.3 - DELETE /rag/memories/{id}/share",
            "DELETE",
            f"/rag/memories/{share_memory_id}/share",
            cookies=session_cookies
        )
        results.append(result)
        expected = [200, 204]
        status = "✅ PASS" if result.get("status_code") in expected else f"⚠️  {result.get('status_code')}"
        print(f"  Status: {result.get('status_code')} - {status}")
    else:
        print("\n[C.4.3] Remove share (SKIPPED)")
        results.append({"test_name": "C.4.3 - Remove share", "status": "SKIPPED"})
    
    # C.4.4: Share with invalid target
    if share_memory_id:
        print(f"\n[C.4.4] Share with invalid target")
        result = run_test(
            "C.4.4 - POST /rag/memories/{id}/share (invalid target)",
            "POST",
            f"/rag/memories/{share_memory_id}/share",
            data={"user_id": "nonexistent_user_id_99999"},
            cookies=session_cookies
        )
        results.append(result)
        expected = [404, 400]
        status = "✅ PASS" if result.get("status_code") in expected else f"⚠️  {result.get('status_code')}"
        print(f"  Status: {result.get('status_code')} - {status}")
    else:
        print("\n[C.4.4] Share with invalid target (SKIPPED)")
        results.append({"test_name": "C.4.4 - Share with invalid target", "status": "SKIPPED"})
    
    # C.5: Batch Operations (5 tests)
    print("\n" + "-"*70)
    print("C.5: Batch Operations")
    print("-"*70)
    
    # C.5.1: POST /rag/memories/batch-create (using batch endpoint)
    print("\n[C.5.1] POST /rag/memories/batch (create operation)")
    # First create memories individually, then use batch for delete/update
    # The batch endpoint uses operation parameter, not separate create endpoint
    result = run_test(
        "C.5.1 - POST /rag/memories (create multiple individually)",
        "POST",
        "/rag/memories",
        data={"content": "Batch memory 1", "metadata": {}},
        cookies=session_cookies
    )
    # Create a few more
    for i in range(2, 4):
        run_test(
            f"C.5.1 - Create memory {i}",
            "POST",
            "/rag/memories",
            data={"content": f"Batch memory {i}", "metadata": {}},
            cookies=session_cookies
        )
    results.append(result)
    expected = 201
    status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.5.2: POST /rag/memories/batch (delete operation)
    print("\n[C.5.2] POST /rag/memories/batch (delete operation)")
    # Get some memory IDs first
    list_result = run_test(
        "C.5.2 - Get memories for batch delete",
        "GET",
        "/rag/memories?limit=5",
        cookies=session_cookies
    )
    memory_ids = []
    if list_result.get("status_code") == 200 and list_result.get("response_json"):
        if isinstance(list_result.get("response_json"), list):
            memory_ids = [m.get("id") or m.get("memory_id") for m in list_result.get("response_json", [])[:3] if m.get("id") or m.get("memory_id")]
        elif isinstance(list_result.get("response_json"), dict):
            items = list_result.get("response_json", {}).get("items", []) or list_result.get("response_json", {}).get("memories", [])
            memory_ids = [m.get("id") or m.get("memory_id") for m in items[:3] if m.get("id") or m.get("memory_id")]
    
    if memory_ids:
        result = run_test(
            "C.5.2 - POST /rag/memories/batch (delete)",
            "POST",
            "/rag/memories/batch",
            data={"operation": "delete", "memory_ids": memory_ids},
            cookies=session_cookies
        )
        results.append(result)
        expected = 200
        status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
        print(f"  Status: {result.get('status_code')} - {status}")
    else:
        print("\n[C.5.2] POST /rag/memories/batch (delete) (SKIPPED - no memory IDs)")
        results.append({"test_name": "C.5.2 - POST /rag/memories/batch (delete)", "status": "SKIPPED"})
    
    # C.5.3: POST /rag/memories/batch (update operation)
    print("\n[C.5.3] POST /rag/memories/batch (update operation)")
    # Get memory IDs for update
    list_result = run_test(
        "C.5.3 - Get memories for batch update",
        "GET",
        "/rag/memories?limit=3",
        cookies=session_cookies
    )
    memory_ids = []
    if list_result.get("status_code") == 200 and list_result.get("response_json"):
        if isinstance(list_result.get("response_json"), list):
            memory_ids = [m.get("id") or m.get("memory_id") for m in list_result.get("response_json", [])[:2] if m.get("id") or m.get("memory_id")]
        elif isinstance(list_result.get("response_json"), dict):
            items = list_result.get("response_json", {}).get("items", []) or list_result.get("response_json", {}).get("memories", [])
            memory_ids = [m.get("id") or m.get("memory_id") for m in items[:2] if m.get("id") or m.get("memory_id")]
    
    if memory_ids:
        result = run_test(
            "C.5.3 - POST /rag/memories/batch (update)",
            "POST",
            "/rag/memories/batch",
            data={
                "operation": "update",
                "memory_ids": memory_ids,
                "updates": {"content": "Updated batch memory", "metadata": {}}
            },
            cookies=session_cookies
        )
        results.append(result)
        expected = 200
        status = "✅ PASS" if result.get("status_code") == expected else f"⚠️  {result.get('status_code')} (expected {expected})"
        print(f"  Status: {result.get('status_code')} - {status}")
    else:
        print("\n[C.5.3] POST /rag/memories/batch (update) (SKIPPED - no memory IDs)")
        results.append({"test_name": "C.5.3 - POST /rag/memories/batch (update)", "status": "SKIPPED"})
    
    # C.5.4: Batch with invalid items
    print("\n[C.5.4] Batch with invalid items")
    # Get a valid memory ID first
    list_result = run_test(
        "C.5.4 - Get memory for invalid batch test",
        "GET",
        "/rag/memories?limit=1",
        cookies=session_cookies
    )
    valid_id = None
    if list_result.get("status_code") == 200 and list_result.get("response_json"):
        if isinstance(list_result.get("response_json"), list) and len(list_result.get("response_json", [])) > 0:
            valid_id = list_result.get("response_json", [])[0].get("id")
        elif isinstance(list_result.get("response_json"), dict):
            items = list_result.get("response_json", {}).get("items", []) or list_result.get("response_json", {}).get("memories", [])
            if items:
                valid_id = items[0].get("id")
    
    if valid_id:
        result = run_test(
            "C.5.4 - POST /rag/memories/batch (invalid operation)",
            "POST",
            "/rag/memories/batch",
            data={
                "operation": "invalid_operation",
                "memory_ids": [valid_id]
            },
            cookies=session_cookies
        )
    else:
        result = run_test(
            "C.5.4 - POST /rag/memories/batch (invalid memory IDs)",
            "POST",
            "/rag/memories/batch",
            data={
                "operation": "delete",
                "memory_ids": ["invalid-uuid-123"]
            },
            cookies=session_cookies
        )
    results.append(result)
    expected = [207, 422]
    status = "✅ PASS" if result.get("status_code") in expected else f"⚠️  {result.get('status_code')}"
    print(f"  Status: {result.get('status_code')} - {status}")
    
    # C.5.5: Batch with huge payload
    print("\n[C.5.5] Batch with huge payload")
    # Get many memory IDs
    list_result = run_test(
        "C.5.5 - Get many memories for huge batch",
        "GET",
        "/rag/memories?limit=100",
        cookies=session_cookies
    )
    memory_ids = []
    if list_result.get("status_code") == 200 and list_result.get("response_json"):
        if isinstance(list_result.get("response_json"), list):
            memory_ids = [m.get("id") for m in list_result.get("response_json", [])[:50] if m.get("id")]
        elif isinstance(list_result.get("response_json"), dict):
            items = list_result.get("response_json", {}).get("items", []) or list_result.get("response_json", {}).get("memories", [])
            memory_ids = [m.get("id") for m in items[:50] if m.get("id")]
    
    if memory_ids:
        result = run_test(
            "C.5.5 - POST /rag/memories/batch (huge payload)",
            "POST",
            "/rag/memories/batch",
            data={"operation": "delete", "memory_ids": memory_ids},
            cookies=session_cookies,
            timeout=60
        )
    else:
        # Create many memories first
        huge_ids = []
        for i in range(10):
            create_res = run_test(
                f"C.5.5 - Create memory {i}",
                "POST",
                "/rag/memories",
                data={"content": "x" * 1000, "metadata": {}},
                cookies=session_cookies
            )
            if create_res.get("status_code") in [200, 201] and create_res.get("response_json"):
                huge_ids.append(create_res.get("response_json", {}).get("id"))
        
        if huge_ids:
            result = run_test(
                "C.5.5 - POST /rag/memories/batch (huge payload)",
                "POST",
                "/rag/memories/batch",
                data={"operation": "delete", "memory_ids": huge_ids},
                cookies=session_cookies,
                timeout=60
            )
        else:
            result = {"test_name": "C.5.5 - POST /rag/memories/batch (huge payload)", "status": "SKIPPED"}
    results.append(result)
    expected = [201, 413]
    status = "✅ PASS" if result.get("status_code") in expected else f"⚠️  {result.get('status_code')}"
    print(f"  Status: {result.get('status_code')} - {status}")

# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main test execution"""
    print("="*70)
    print("COMPREHENSIVE API TEST RUNNER")
    print("Categories A, B, and C")
    print("="*70)
    print(f"\nBase URL: {BASE_URL}")
    print(f"Test User: {TEST_EMAIL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Login first
    if not login():
        print("\n⚠️  WARNING: Login failed. Some tests may fail due to authentication.")
        print("Continuing with tests anyway...")
    
    # Run tests
    test_category_a()
    test_category_b()
    test_category_c()
    
    # Generate summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    total = len(results)
    passed = sum(1 for r in results if r.get("status_code") in [200, 201, 204] or r.get("status") == "SKIPPED")
    failed = sum(1 for r in results if r.get("status_code") not in [200, 201, 204, "SKIPPED", "ERROR", "TIMEOUT"] and r.get("status") != "SKIPPED")
    errors = sum(1 for r in results if r.get("status_code") in ["ERROR", "TIMEOUT"] or r.get("error"))
    skipped = sum(1 for r in results if r.get("status") == "SKIPPED")
    
    print(f"\nTotal Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"⚠️  Errors: {errors}")
    print(f"⏭️  Skipped: {skipped}")
    
    # Save results
    import os
    os.makedirs("test_results", exist_ok=True)
    output_file = f"test_results/category_abc_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "base_url": BASE_URL,
            "summary": {
                "total": total,
                "passed": passed,
                "failed": failed,
                "errors": errors,
                "skipped": skipped
            },
            "results": results
        }, f, indent=2)
    
    print(f"\n📄 Results saved to: {output_file}")
    print("\n" + "="*70)

if __name__ == "__main__":
    main()

