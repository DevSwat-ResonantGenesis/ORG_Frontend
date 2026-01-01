#!/usr/bin/env python3
"""
Comprehensive Frontend Testing Script
Tests all pages, API connections, and UI/UX flows
"""

import requests
import json
import time
from typing import Dict, List, Tuple

BASE_URL = "http://localhost:8001"
FRONTEND_URL = "http://localhost:5173"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_status(message: str, status: str = "INFO"):
    colors = {
        "PASS": Colors.GREEN,
        "FAIL": Colors.RED,
        "WARN": Colors.YELLOW,
        "INFO": Colors.BLUE
    }
    color = colors.get(status, Colors.RESET)
    print(f"{color}[{status}]{Colors.RESET} {message}")

def test_backend_health():
    """Test if backend is running"""
    try:
        resp = requests.get(f"{BASE_URL}/health", timeout=5)
        if resp.status_code == 200:
            print_status("Backend is running", "PASS")
            return True
        else:
            print_status(f"Backend returned {resp.status_code}", "FAIL")
            return False
    except Exception as e:
        print_status(f"Backend not accessible: {e}", "FAIL")
        return False

def test_login():
    """Test login functionality"""
    print_status("\n=== Testing Login ===", "INFO")
    
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": "test@test.com", "password": "Test1234"},
            timeout=10
        )
        
        cookies = resp.cookies.get_dict()
        
        if resp.status_code == 200:
            print_status("Login successful", "PASS")
            return cookies
        else:
            print_status(f"Login failed: {resp.status_code}", "FAIL")
            print_status(f"Response: {resp.text[:200]}", "WARN")
            return None
    except Exception as e:
        print_status(f"Login error: {e}", "FAIL")
        return None

def test_api_endpoint(method: str, endpoint: str, cookies: Dict = None, data: Dict = None, expected: int = 200):
    """Test a single API endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        if method == "GET":
            resp = requests.get(url, cookies=cookies, timeout=10)
        elif method == "POST":
            resp = requests.post(url, json=data, cookies=cookies, timeout=10)
        elif method == "PUT":
            resp = requests.put(url, json=data, cookies=cookies, timeout=10)
        elif method == "DELETE":
            resp = requests.delete(url, cookies=cookies, timeout=10)
        else:
            return False, f"Unknown method: {method}"
        
        status = "PASS" if resp.status_code == expected else "FAIL"
        print_status(f"{method} {endpoint}: {resp.status_code} (expected {expected})", status)
        
        if resp.status_code != expected:
            print_status(f"  Response: {resp.text[:150]}", "WARN")
        
        return resp.status_code == expected, resp.status_code
    except Exception as e:
        print_status(f"{method} {endpoint}: ERROR - {e}", "FAIL")
        return False, None

def test_all_api_endpoints(cookies: Dict):
    """Test all API endpoints"""
    print_status("\n=== Testing API Endpoints ===", "INFO")
    
    endpoints = [
        # Auth
        ("GET", "/auth/me", 200),
        
        # Resonant Chat (newly implemented)
        ("POST", "/resonant-chat/create", 200, {"title": "Test Chat"}),
        ("GET", "/resonant-chat/chats", 200),
        ("GET", "/resonant-chat/anchors", 200),
        ("GET", "/resonant-chat/clusters", 200),
        ("GET", "/resonant-chat/history", 200),
        ("POST", "/resonant-chat/compute-resonance", 200, {"text1": "hello", "text2": "world"}),
        ("POST", "/resonant-chat/embed", 200, {"text": "test"}),
        
        # RAG
        ("GET", "/rag/memories", 200),
        ("POST", "/rag/memories", 201, {"content": "Test memory", "metadata": {}}),
        
        # Predictions
        ("GET", "/predictions", 200),
        
        # Policies
        ("GET", "/policies", 200),
        
        # Compliance
        ("GET", "/compliance/summary", 200),
        
        # Audit
        ("GET", "/audit", 200),
        
        # Settings (check specific endpoints)
        ("GET", "/settings/api-keys", 200),
        
        # Organization
        ("GET", "/orgs/current", 200),
        
        # Billing
        ("GET", "/billing/overview", 200),
    ]
    
    passed = 0
    failed = 0
    
    for endpoint_data in endpoints:
        if len(endpoint_data) == 3:
            method, endpoint, expected = endpoint_data
            data = None
        else:
            method, endpoint, expected, data = endpoint_data
        
        success, status = test_api_endpoint(method, endpoint, cookies, data, expected)
        if success:
            passed += 1
        else:
            failed += 1
        time.sleep(0.1)  # Small delay to avoid rate limiting
    
    print_status(f"\nAPI Tests: {passed} passed, {failed} failed", "INFO" if failed == 0 else "WARN")
    return passed, failed

def test_frontend_routes():
    """Test frontend routes (if frontend is running)"""
    print_status("\n=== Testing Frontend Routes ===", "INFO")
    
    routes = [
        "/",
        "/login",
        "/dashboard",
        "/predictions",
        "/policies",
        "/compliance",
        "/audit",
        "/settings",
        "/organization",
        "/billing",
        "/resonant-chat",
        "/hash-sphere/fullscreen",
    ]
    
    passed = 0
    failed = 0
    
    for route in routes:
        try:
            resp = requests.get(f"{FRONTEND_URL}{route}", timeout=5, allow_redirects=True)
            if resp.status_code in [200, 301, 302]:
                print_status(f"Route {route}: {resp.status_code}", "PASS")
                passed += 1
            else:
                print_status(f"Route {route}: {resp.status_code}", "FAIL")
                failed += 1
        except Exception as e:
            print_status(f"Route {route}: Not accessible - {e}", "WARN")
            failed += 1
    
    print_status(f"\nFrontend Routes: {passed} passed, {failed} failed", "INFO" if failed == 0 else "WARN")
    return passed, failed

def main():
    print_status("=" * 70, "INFO")
    print_status("COMPREHENSIVE FRONTEND TESTING", "INFO")
    print_status("=" * 70, "INFO")
    
    # Test backend health
    if not test_backend_health():
        print_status("Backend is not running. Please start it first.", "FAIL")
        return
    
    # Test login
    cookies = test_login()
    if not cookies:
        print_status("Cannot proceed without login. Please check credentials.", "FAIL")
        return
    
    # Test all API endpoints
    api_passed, api_failed = test_all_api_endpoints(cookies)
    
    # Test frontend routes (if frontend is running)
    frontend_passed, frontend_failed = test_frontend_routes()
    
    # Summary
    print_status("\n" + "=" * 70, "INFO")
    print_status("TEST SUMMARY", "INFO")
    print_status("=" * 70, "INFO")
    print_status(f"API Endpoints: {api_passed} passed, {api_failed} failed", "INFO")
    print_status(f"Frontend Routes: {frontend_passed} passed, {frontend_failed} failed", "INFO")
    
    total_passed = api_passed + frontend_passed
    total_failed = api_failed + frontend_failed
    
    if total_failed == 0:
        print_status("\n✅ ALL TESTS PASSED!", "PASS")
    else:
        print_status(f"\n⚠️  {total_failed} tests failed. Please review above.", "WARN")

if __name__ == "__main__":
    main()

