#!/bin/bash

# Create OrgMembership records - Fixed version that checks schema first
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 CREATING ORG MEMBERSHIPS (FIXED VERSION)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

cat > /tmp/create_memberships_fixed.py << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from fastapi_app.db import get_session
from fastapi_app.models import User, Organization, OrgMembership
from sqlalchemy import text, inspect
from uuid import uuid4

session = next(get_session())

print("📋 Step 1: Checking users table schema...")
columns = session.execute(text("""
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
""")).fetchall()

column_names = [col[0] for col in columns]
print(f"   Columns: {', '.join(column_names)}")

# Determine role column name
role_column = None
if 'role' in column_names:
    role_column = 'role'
elif 'user_role' in column_names:
    role_column = 'user_role'
else:
    print("   ⚠️  No role column found. Will use 'user' as default role")

print("")
print("📋 Step 2: Getting all users with default_org_id...")

if role_column:
    query = f"""
        SELECT id, email, default_org_id, {role_column}
        FROM users
        WHERE default_org_id IS NOT NULL
        AND is_active = true
    """
else:
    query = """
        SELECT id, email, default_org_id
        FROM users
        WHERE default_org_id IS NOT NULL
        AND is_active = true
    """

users = session.execute(text(query)).fetchall()

print(f"   Found {len(users)} users with default_org_id")

if not users:
    print("   ⚠️  No users found with default_org_id")
    session.close()
    sys.exit(1)

print("")
print("📋 Step 3: Creating/updating OrgMembership records...")

created_count = 0
updated_count = 0

for row in users:
    if role_column:
        user_id, email, default_org_id, user_role = row
    else:
        user_id, email, default_org_id = row
        user_role = 'user'  # Default role
    
    # Check if membership already exists
    existing = session.execute(text("""
        SELECT id, status, role
        FROM org_memberships
        WHERE user_id = :user_id AND org_id = :org_id
    """), {"user_id": str(user_id), "org_id": str(default_org_id)}).fetchone()
    
    if existing:
        membership_id, status, role = existing
        # Update if needed
        if status != 'active' or role != user_role:
            session.execute(text("""
                UPDATE org_memberships
                SET status = 'active', role = :role, updated_at = NOW()
                WHERE id = :id
            """), {"id": str(membership_id), "role": user_role})
            session.commit()
            updated_count += 1
            print(f"   🔄 Updated: {email} → Membership activated (role: {user_role})")
        else:
            print(f"   ✓ OK: {email} → Membership already exists and active")
    else:
        # Create new membership
        membership_id = str(uuid4())
        session.execute(text("""
            INSERT INTO org_memberships (id, user_id, org_id, role, status, created_at, updated_at)
            VALUES (:id, :user_id, :org_id, :role, 'active', NOW(), NOW())
        """), {
            "id": membership_id,
            "user_id": str(user_id),
            "org_id": str(default_org_id),
            "role": user_role
        })
        session.commit()
        created_count += 1
        print(f"   ✅ Created: {email} → Membership created (role: {user_role})")

session.close()

print("")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"✅ COMPLETE: Created {created_count} memberships, Updated {updated_count} memberships")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("")

# Verify
print("📋 Step 4: Verifying memberships...")
session = next(get_session())
for row in users:
    if role_column:
        user_id, email, default_org_id, user_role = row
    else:
        user_id, email, default_org_id = row
    
    membership = session.execute(text("""
        SELECT status, role
        FROM org_memberships
        WHERE user_id = :user_id AND org_id = :org_id AND status = 'active'
    """), {"user_id": str(user_id), "org_id": str(default_org_id)}).fetchone()
    
    if membership:
        status, role = membership
        print(f"   ✅ {email}: Active membership (role: {role})")
    else:
        print(f"   ❌ {email}: No active membership found")

session.close()
PYTHON_SCRIPT

echo "📋 Running fixed membership creation script..."
docker cp /tmp/create_memberships_fixed.py $(docker compose ps -q api):/tmp/create_memberships_fixed.py
docker compose exec -T api python3 /tmp/create_memberships_fixed.py

echo ""
echo "🔄 Restarting API..."
docker compose restart api

echo ""
echo "⏳ Waiting for API..."
sleep 10

echo ""
echo "🧪 Testing login..."
cd /root/frontend
./VERIFY_USER_ORG_FIX.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

