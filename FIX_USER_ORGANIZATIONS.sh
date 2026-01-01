#!/bin/bash

# Fix Organization Associations for All Test Users
# This ensures all users are linked to an active organization

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING USER ORGANIZATION ASSOCIATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

# Create Python script to fix organizations
cat > /tmp/fix_organizations.py << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from fastapi_app.db import get_session
from fastapi_app.models import User, Organization
from sqlalchemy import text, update
from uuid import uuid4
import re

session = next(get_session())

# Get or create test organization with all required fields
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
    print(f"✅ Created organization: Test Organization (ID: {org.id}, Status: {org.status})")
else:
    # Ensure organization is active
    if org.status != 'active':
        org.status = 'active'
        session.commit()
        print(f"✅ Updated organization status to 'active'")
    
    # Ensure slug exists
    if not org.slug:
        org.slug = 'test-organization'
        session.commit()
        print(f"✅ Added slug to organization")
    
    print(f"✅ Using existing organization: Test Organization (ID: {org.id}, Status: {org.status})")

# List of test users
test_users = [
    "admin@test.com",
    "orgadmin@test.com",
    "user@test.com",
    "compliance@test.com",
    "mlengineer@test.com",
    "finance@test.com",
    "viewer@test.com"
]

print("")
print("📋 Fixing user organization associations...")
print("")

fixed_count = 0
updated_count = 0

for email in test_users:
    user = session.query(User).filter(User.email == email).first()
    
    if not user:
        print(f"⚠️  User not found: {email}")
        continue
    
    # Get current org_id from database directly (bypasses model)
    result = session.execute(
        text("SELECT org_id FROM users WHERE email = :email"),
        {"email": email}
    ).fetchone()
    current_org_id = result[0] if result else None
    
    # Check if user has org_id and if it matches our test org
    if not current_org_id or str(current_org_id) != str(org.id):
        # Update using raw SQL (works regardless of model structure)
        session.execute(
            text("UPDATE users SET org_id = :org_id, is_active = true WHERE email = :email"),
            {"org_id": str(org.id), "email": email}
        )
        session.commit()
        fixed_count += 1
        print(f"✅ Fixed: {email} → Linked to organization")
    elif not user.is_active:
        user.is_active = True
        session.commit()
        updated_count += 1
        print(f"✅ Updated: {email} → Activated")
    else:
        print(f"✓ OK: {email} → Already linked and active")

session.close()

print("")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"✅ COMPLETE: Fixed {fixed_count} users, Updated {updated_count} users")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("")

# Verify all users using direct SQL
print("📋 Verifying all users...")
session = next(get_session())
for email in test_users:
    # Get user data directly from database
    user_result = session.execute(
        text("SELECT org_id, is_active FROM users WHERE email = :email"),
        {"email": email}
    ).fetchone()
    
    if user_result:
        user_org_id = user_result[0]
        user_active = user_result[1]
        org_check = session.query(Organization).filter(Organization.id == user_org_id).first() if user_org_id else None
        org_status = org_check.status if org_check else "NONE"
        org_name = org_check.name if org_check else "NONE"
        status_icon = "✅" if user_org_id and org_check and org_check.status == 'active' and user_active else "❌"
        print(f"   {status_icon} {email}: org_id={user_org_id}, org_name={org_name}, org_status={org_status}, user_active={user_active}")
    else:
        print(f"   ❌ {email}: User not found")

session.close()
PYTHON_SCRIPT

# Copy script to API container and run it
echo "📋 Step 1: Copying fix script to API container..."
docker cp /tmp/fix_organizations.py $(docker compose ps -q api):/tmp/fix_organizations.py

echo ""
echo "📋 Step 2: Running fix script..."
docker compose exec -T api python3 /tmp/fix_organizations.py

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ORGANIZATION FIX COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 All test users should now have active organizations"
echo "🌐 Try logging in at: https://dev-swat.com/login"
echo ""

