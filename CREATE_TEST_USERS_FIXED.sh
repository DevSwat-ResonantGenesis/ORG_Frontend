#!/bin/bash

# Create Test Users with Proper Organization Setup - Fixed Version
# This script ensures all users are linked to an active organization

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👥 CREATING TEST USERS (FIXED VERSION)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

# Create Python script to generate users with proper org setup
cat > /tmp/create_test_users_fixed.py << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from fastapi_app.db import get_session
from fastapi_app.models import User, Organization
from fastapi_app.auth.crypto import hash_password
from uuid import uuid4

session = next(get_session())

# Get or create test organization with ALL required fields
org = session.query(Organization).filter(Organization.name == 'Test Organization').first()

if not org:
    # Create organization with all required fields
    org = Organization(
        id=str(uuid4()),
        name='Test Organization',
        slug='test-organization',  # Required field
        plan='free',  # Default plan
        status='active',  # Must be active
        meta={},
        settings={}
    )
    session.add(org)
    session.commit()
    session.refresh(org)
    print(f"✅ Created organization: Test Organization")
    print(f"   ID: {org.id}")
    print(f"   Slug: {org.slug}")
    print(f"   Status: {org.status}")
else:
    # Ensure organization is active and has slug
    needs_update = False
    if org.status != 'active':
        org.status = 'active'
        needs_update = True
    if not org.slug:
        org.slug = 'test-organization'
        needs_update = True
    
    if needs_update:
        session.commit()
        session.refresh(org)
        print(f"✅ Updated organization: Test Organization")
    else:
        print(f"✅ Using existing organization: Test Organization")
    
    print(f"   ID: {org.id}")
    print(f"   Slug: {org.slug}")
    print(f"   Status: {org.status}")

password_hash = hash_password("Test1234!")

users = [
    ("admin@test.com", "platform_dev", "Platform Developer"),
    ("orgadmin@test.com", "org_admin", "Organization Admin"),
    ("user@test.com", "user", "Standard User"),
    ("compliance@test.com", "compliance", "Compliance Officer"),
    ("mlengineer@test.com", "ml_engineer", "ML Engineer"),
    ("finance@test.com", "finance", "Finance Role"),
    ("viewer@test.com", "viewer", "Viewer"),
]

created_count = 0
updated_count = 0

print("")
print("📋 Creating/updating users...")
print("")

for email, role, role_name in users:
    existing_user = session.query(User).filter(User.email == email).first()
    
    if existing_user:
        # Update existing user - ensure org_id is set and user is active
        existing_user.role = role
        existing_user.org_id = org.id  # Always set org_id
        existing_user.is_active = True
        session.commit()
        updated_count += 1
        print(f"🔄 Updated: {email} → {role_name} (org_id: {org.id})")
    else:
        # Create new user with org_id
        new_user = User(
            id=str(uuid4()),
            email=email,
            password_hash=password_hash,
            role=role,
            org_id=org.id,  # Always set org_id
            is_active=True
        )
        session.add(new_user)
        session.commit()
        created_count += 1
        print(f"✅ Created: {email} → {role_name} (org_id: {org.id})")

session.close()

print("")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"✅ COMPLETE: Created {created_count} users, Updated {updated_count} users")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("")

# Verify all users
print("📋 Verifying all users have active organizations...")
session = next(get_session())
all_good = True

for email, role, role_name in users:
    user = session.query(User).filter(User.email == email).first()
    if user:
        org_check = session.query(Organization).filter(Organization.id == user.org_id).first() if user.org_id else None
        if org_check and org_check.status == 'active' and user.is_active:
            print(f"   ✅ {email}: Active organization")
        else:
            print(f"   ❌ {email}: Missing or inactive organization")
            all_good = False
    else:
        print(f"   ❌ {email}: User not found")
        all_good = False

session.close()

if all_good:
    print("")
    print("✅ All users have active organizations!")
else:
    print("")
    print("⚠️  Some users need fixing. Run FIX_USER_ORGANIZATIONS.sh")

print("")
print("📋 Test User Credentials (Password: Test1234!):")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("Email: admin@test.com        | Role: Platform Dev")
print("Email: orgadmin@test.com     | Role: Org Admin")
print("Email: user@test.com         | Role: User")
print("Email: compliance@test.com   | Role: Compliance")
print("Email: mlengineer@test.com   | Role: ML Engineer")
print("Email: finance@test.com      | Role: Finance")
print("Email: viewer@test.com       | Role: Viewer")
print("")
PYTHON_SCRIPT

# Copy script to API container and run it
echo "📋 Step 1: Copying script to API container..."
docker cp /tmp/create_test_users_fixed.py $(docker compose ps -q api):/tmp/create_test_users_fixed.py

echo ""
echo "📋 Step 2: Creating/updating test users..."
docker compose exec -T api python3 /tmp/create_test_users_fixed.py

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TEST USERS CREATED/UPDATED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 All users should now have active organizations"
echo "🌐 Login at: https://dev-swat.com/login"
echo ""

