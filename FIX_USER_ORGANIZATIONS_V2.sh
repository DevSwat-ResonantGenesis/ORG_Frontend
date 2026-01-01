#!/bin/bash

# Fix Organization Associations - Version 2 (handles missing column)
# This ensures all users are linked to an active organization

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING USER ORGANIZATION ASSOCIATIONS (V2)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

# Create Python script to fix organizations
cat > /tmp/fix_organizations_v2.py << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from fastapi_app.db import get_session
from fastapi_app.models import User, Organization
from sqlalchemy import text
from uuid import uuid4

session = next(get_session())

# Step 1: Check if org_id column exists
print("📋 Step 1: Checking users table schema...")
column_check = session.execute(text("""
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'org_id'
""")).fetchone()

if not column_check:
    print("   ⚠️  'org_id' column doesn't exist. Checking for alternative column name...")
    
    # Check for organization_id or other variations
    alt_check = session.execute(text("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND (column_name LIKE '%org%' OR column_name LIKE '%organization%')
    """)).fetchall()
    
    if alt_check:
        print(f"   Found organization-related columns: {[col[0] for col in alt_check]}")
        org_column = alt_check[0][0]
        print(f"   Using column: {org_column}")
    else:
        print("   ⚠️  No organization column found. Creating 'org_id' column...")
        # Add the column
        try:
            session.execute(text("""
                ALTER TABLE users
                ADD COLUMN org_id UUID REFERENCES organizations(id)
            """))
            session.commit()
            print("   ✅ Created 'org_id' column")
            org_column = 'org_id'
        except Exception as e:
            print(f"   ❌ Failed to create column: {e}")
            session.rollback()
            raise
else:
    print("   ✅ 'org_id' column exists")
    org_column = 'org_id'

# Step 2: Get or create test organization
print("")
print("📋 Step 2: Getting/creating test organization...")
org = session.query(Organization).filter(Organization.name == 'Test Organization').first()

if not org:
    # Create organization with all required fields
    org = Organization(
        id=str(uuid4()),
        name='Test Organization',
        slug='test-organization',
        plan='free',
        status='active',
        meta={},
        settings={}
    )
    session.add(org)
    session.commit()
    session.refresh(org)
    print(f"   ✅ Created organization: Test Organization (ID: {org.id}, Status: {org.status})")
else:
    # Ensure organization is active
    if org.status != 'active':
        org.status = 'active'
        session.commit()
        print(f"   ✅ Updated organization status to 'active'")
    
    # Ensure slug exists
    if not org.slug:
        org.slug = 'test-organization'
        session.commit()
        print(f"   ✅ Added slug to organization")
    
    print(f"   ✅ Using existing organization: Test Organization (ID: {org.id}, Status: {org.status})")

# Step 3: Fix user associations
print("")
print("📋 Step 3: Fixing user organization associations...")
print("")

test_users = [
    "admin@test.com",
    "orgadmin@test.com",
    "user@test.com",
    "compliance@test.com",
    "mlengineer@test.com",
    "finance@test.com",
    "viewer@test.com"
]

fixed_count = 0
updated_count = 0

for email in test_users:
    # Get current org_id from database
    result = session.execute(
        text(f"SELECT {org_column}, is_active FROM users WHERE email = :email"),
        {"email": email}
    ).fetchone()
    
    if not result:
        print(f"   ⚠️  User not found: {email}")
        continue
    
    current_org_id = result[0]
    user_active = result[1]
    
    # Check if user has org_id and if it matches our test org
    if not current_org_id or str(current_org_id) != str(org.id):
        # Update using raw SQL
        session.execute(
            text(f"UPDATE users SET {org_column} = :org_id, is_active = true WHERE email = :email"),
            {"org_id": str(org.id), "email": email}
        )
        session.commit()
        fixed_count += 1
        print(f"   ✅ Fixed: {email} → Linked to organization")
    elif not user_active:
        session.execute(
            text("UPDATE users SET is_active = true WHERE email = :email"),
            {"email": email}
        )
        session.commit()
        updated_count += 1
        print(f"   ✅ Updated: {email} → Activated")
    else:
        print(f"   ✓ OK: {email} → Already linked and active")

session.close()

print("")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"✅ COMPLETE: Fixed {fixed_count} users, Updated {updated_count} users")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("")

# Step 4: Verify all users
print("📋 Step 4: Verifying all users...")
session = next(get_session())
for email in test_users:
    # Get user data directly from database
    user_result = session.execute(
        text(f"SELECT {org_column}, is_active FROM users WHERE email = :email"),
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
echo "📋 Copying fix script to API container..."
docker cp /tmp/fix_organizations_v2.py $(docker compose ps -q api):/tmp/fix_organizations_v2.py

echo ""
echo "📋 Running fix script..."
docker compose exec -T api python3 /tmp/fix_organizations_v2.py

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ORGANIZATION FIX COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 All test users should now have active organizations"
echo "🌐 Try logging in at: https://dev-swat.com/login"
echo ""

