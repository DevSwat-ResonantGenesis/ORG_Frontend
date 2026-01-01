#!/usr/bin/env python3
"""
Create Test User for Resonant Chat
Creates a test user account via signup endpoint
"""

import requests
import json
import sys

BACKEND_URL = "http://localhost:8001"

# Test user credentials
TEST_USER = {
    "email": "test.resonant.chat@example.com",
    "password": "TestResonantChat123!",
    "full_name": "Resonant Chat Tester",
    "org_name": "Test Org"
}

def create_test_user():
    """Create a test user account"""
    print("🔐 Creating Test User for Resonant Chat...")
    print(f"   Email: {TEST_USER['email']}")
    print(f"   Name: {TEST_USER['full_name']}")
    print()
    
    # Try signup endpoint
    signup_endpoints = [
        "/auth/signup",
        "/auth/register",
        "/public/signup",
        "/users/signup"
    ]
    
    for endpoint in signup_endpoints:
        try:
            print(f"Trying: {endpoint}...")
            response = requests.post(
                f"{BACKEND_URL}{endpoint}",
                json=TEST_USER,
                timeout=10
            )
            
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                print(f"✅ User created successfully!")
                print(f"   Response: {json.dumps(data, indent=2)}")
                return True
            elif response.status_code == 400:
                error_data = response.json()
                if "already exists" in str(error_data).lower() or "duplicate" in str(error_data).lower():
                    print(f"⚠️  User already exists (this is OK)")
                    print(f"   You can login with these credentials")
                    return True
                else:
                    print(f"❌ Error: {error_data}")
            else:
                print(f"⚠️  Status {response.status_code}: {response.text[:200]}")
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to backend at {BACKEND_URL}")
            return False
        except Exception as e:
            print(f"⚠️  {endpoint} failed: {e}")
            continue
    
    print()
    print("❌ Could not create user via API")
    print()
    print("📋 Alternative: Use Signup Page")
    print("   1. Open: http://localhost:5175/public/signup")
    print(f"   2. Email: {TEST_USER['email']}")
    print(f"   3. Password: {TEST_USER['password']}")
    print(f"   4. Name: {TEST_USER['name']}")
    print()
    
    return False

def main():
    print("=" * 70)
    print("🧪 CREATE TEST USER FOR RESONANT CHAT")
    print("=" * 70)
    print()
    
    # Check backend
    try:
        health = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if health.status_code == 200:
            print("✅ Backend is accessible")
        else:
            print("⚠️  Backend health check failed")
    except:
        print("❌ Backend not accessible")
        print(f"   Make sure backend is running on {BACKEND_URL}")
        return False
    
    print()
    
    # Create user
    success = create_test_user()
    
    print()
    print("=" * 70)
    if success:
        print("✅ TEST USER READY")
        print("=" * 70)
        print()
        print("📋 Login Credentials:")
        print(f"   Email: {TEST_USER['email']}")
        print(f"   Password: {TEST_USER['password']}")
        print()
        print("🚀 Next Steps:")
        print("   1. Go to: http://localhost:5175/login")
        print(f"   2. Login with: {TEST_USER['email']}")
        print("   3. Navigate to: /resonant-chat")
        print("   4. Test all features with full Hash Sphere access!")
        print()
    else:
        print("⚠️  USE SIGNUP PAGE INSTEAD")
        print("=" * 70)
        print()
        print("📋 Manual Signup:")
        print("   1. Open: http://localhost:5175/public/signup")
        print(f"   2. Email: {TEST_USER['email']}")
        print(f"   3. Password: {TEST_USER['password']}")
        print(f"   4. Name: {TEST_USER['full_name']}")
        print(f"   5. Organization: {TEST_USER['org_name']}")
        print("   5. Complete signup")
        print("   6. Login and test Resonant Chat")
        print()
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

