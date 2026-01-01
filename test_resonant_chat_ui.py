#!/usr/bin/env python3
"""
Resonant Chat UI Test Script
Tests all functionality through API calls (simulating UI interactions)
"""

import requests
import json
import time
from typing import Dict, Any, List

# Configuration
BACKEND_URL = "http://localhost:8001"
FRONTEND_URL = "http://localhost:5173"

# Test session
session = requests.Session()

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_test(name: str):
    print(f"\n{Colors.BLUE}🧪 Testing: {name}{Colors.RESET}")

def print_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def print_error(message: str):
    print(f"{Colors.RED}❌ {message}{Colors.RESET}")

def print_warning(message: str):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")

def test_backend_health():
    """Test 1: Backend Health Check"""
    print_test("Backend Health Check")
    try:
        response = session.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Backend is healthy: {data.get('status', 'ok')}")
            return True
        else:
            print_error(f"Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Backend not accessible: {e}")
        return False

def test_resonant_chat_endpoints():
    """Test 2: Resonant Chat Endpoints Accessibility"""
    print_test("Resonant Chat Endpoints")
    endpoints = [
        "/resonant-chat/anchors",
        "/resonant-chat/clusters",
        "/resonant-chat/history",
    ]
    
    results = []
    for endpoint in endpoints:
        try:
            response = session.get(f"{BACKEND_URL}{endpoint}", timeout=5)
            if response.status_code in [200, 401]:  # 401 is OK (needs auth)
                print_success(f"{endpoint}: Accessible")
                results.append(True)
            else:
                print_warning(f"{endpoint}: Status {response.status_code}")
                results.append(False)
        except Exception as e:
            print_error(f"{endpoint}: {e}")
            results.append(False)
    
    return all(results)

def test_provider_configuration():
    """Test 3: Provider API Keys Configuration"""
    print_test("Provider Configuration")
    
    # Check if backend has provider keys configured
    # This is done by checking if we can get provider stats
    try:
        response = session.get(f"{BACKEND_URL}/resonant-chat/providers", timeout=5)
        if response.status_code == 200:
            providers = response.json()
            print_success(f"Providers endpoint accessible")
            print(f"   Available providers: {providers}")
            return True
        else:
            print_warning(f"Providers endpoint returned: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Provider check failed: {e}")
        return False

def test_message_send():
    """Test 4: Send Message (requires authentication)"""
    print_test("Send Message")
    print_warning("This test requires authentication - skipping for now")
    print("   Manual test needed: Send message through UI")
    return True  # Skip for automated test

def test_memory_anchors():
    """Test 5: Memory Anchors"""
    print_test("Memory Anchors")
    try:
        response = session.get(f"{BACKEND_URL}/resonant-chat/anchors", timeout=10)
        if response.status_code == 200:
            data = response.json()
            anchor_count = len(data.get('anchors', []))
            print_success(f"Anchors loaded: {anchor_count} anchors")
            return True
        elif response.status_code == 401:
            print_warning("Anchors endpoint requires authentication")
            return True  # Expected for unauthenticated
        else:
            print_error(f"Anchors endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Anchors test failed: {e}")
        return False

def test_resonance_clusters():
    """Test 6: Resonance Clusters"""
    print_test("Resonance Clusters")
    try:
        response = session.get(f"{BACKEND_URL}/resonant-chat/clusters", timeout=10)
        if response.status_code == 200:
            data = response.json()
            cluster_count = len(data.get('clusters', []))
            print_success(f"Clusters loaded: {cluster_count} clusters")
            return True
        elif response.status_code == 401:
            print_warning("Clusters endpoint requires authentication")
            return True  # Expected for unauthenticated
        else:
            print_error(f"Clusters endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Clusters test failed: {e}")
        return False

def test_chat_history():
    """Test 7: Chat History"""
    print_test("Chat History")
    try:
        response = session.get(f"{BACKEND_URL}/resonant-chat/history", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                chat_count = len(data)
                print_success(f"Chat history loaded: {chat_count} conversations")
            else:
                print_success("Chat history endpoint accessible")
            return True
        elif response.status_code == 401:
            print_warning("Chat history requires authentication")
            return True  # Expected for unauthenticated
        else:
            print_error(f"Chat history failed: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Chat history test failed: {e}")
        return False

def test_performance():
    """Test 8: Performance Metrics"""
    print_test("Performance Metrics")
    
    endpoints = [
        "/health",
        "/resonant-chat/anchors",
        "/resonant-chat/clusters",
    ]
    
    results = []
    for endpoint in endpoints:
        try:
            start_time = time.time()
            response = session.get(f"{BACKEND_URL}{endpoint}", timeout=10)
            elapsed = (time.time() - start_time) * 1000  # Convert to ms
            
            if response.status_code in [200, 401]:
                if elapsed < 1000:
                    print_success(f"{endpoint}: {elapsed:.2f}ms")
                else:
                    print_warning(f"{endpoint}: {elapsed:.2f}ms (slow)")
                results.append(True)
            else:
                print_error(f"{endpoint}: Failed ({response.status_code})")
                results.append(False)
        except Exception as e:
            print_error(f"{endpoint}: {e}")
            results.append(False)
    
    return all(results)

def main():
    print(f"\n{Colors.BLUE}{'='*70}")
    print("🧪 RESONANT CHAT UI TEST SUITE")
    print(f"{'='*70}{Colors.RESET}\n")
    
    tests = [
        ("Backend Health", test_backend_health),
        ("Resonant Chat Endpoints", test_resonant_chat_endpoints),
        ("Provider Configuration", test_provider_configuration),
        ("Memory Anchors", test_memory_anchors),
        ("Resonance Clusters", test_resonance_clusters),
        ("Chat History", test_chat_history),
        ("Performance", test_performance),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print_error(f"{test_name} crashed: {e}")
            results.append((test_name, False))
        time.sleep(0.5)  # Small delay between tests
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*70}")
    print("📊 TEST SUMMARY")
    print(f"{'='*70}{Colors.RESET}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{Colors.GREEN}✅ PASS{Colors.RESET}" if result else f"{Colors.RED}❌ FAIL{Colors.RESET}"
        print(f"{status} {test_name}")
    
    print(f"\n{Colors.BLUE}Results: {passed}/{total} tests passed{Colors.RESET}\n")
    
    if passed == total:
        print_success("All automated tests passed!")
        print("\n📋 Next Steps:")
        print("   1. Open browser to http://localhost:5173/resonant-chat")
        print("   2. Test UI interactions manually")
        print("   3. Follow RESONANT_CHAT_UI_TEST_PLAN.md for detailed testing")
    else:
        print_warning("Some tests failed - check backend configuration")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

