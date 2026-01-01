#!/bin/bash

# Fix user roles in OrgMembership records
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING USER ROLES IN ORG MEMBERSHIPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

cat > /tmp/fix_user_roles.py << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from fastapi_app.db import get_session
from fastapi_app.models import User, OrgMembership
from sqlalchemy import text

session = next(get_session())

print("📋 Step 1: Checking where user roles are stored...")

# Check if there's a user_roles table or roles stored elsewhere
tables = session.execute(text("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE '%role%'
""")).fetchall()

print(f"   Role-related tables: {[t[0] for t in tables]}")

# Check if User model has role attribute
print("\n📋 Step 2: Checking User model for role...")
try:
    # Try to get a user and see what attributes it has
    user = session.exec(text("SELECT * FROM users WHERE email = 'admin@test.com' LIMIT 1")).first()
    if user:
        print(f"   User attributes available")
        # Try to access role via model
        from fastapi_app.models import User as UserModel
        user_obj = session.query(UserModel).filter(UserModel.email == 'admin@test.com').first()
        if user_obj:
            # Check if role attribute exists
            if hasattr(user_obj, 'role'):
                print(f"   ✅ User model has 'role' attribute")
                print(f"   admin@test.com role: {getattr(user_obj, 'role', 'NOT FOUND')}")
            else:
                print(f"   ⚠️  User model does not have 'role' attribute")
except Exception as e:
    print(f"   ⚠️  Error checking User model: {e}")

# Check user_identities or other tables that might store roles
print("\n📋 Step 3: Checking for role storage in other tables...")
identity_tables = session.execute(text("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (table_name LIKE '%identity%' OR table_name LIKE '%user%')
""")).fetchall()

for table in identity_tables:
    table_name = table[0]
    if table_name == 'users':
        continue
    columns = session.execute(text(f"""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = '{table_name}'
        AND column_name LIKE '%role%'
    """)).fetchall()
    if columns:
        print(f"   Table '{table_name}' has role columns: {[c[0] for c in columns]}")

# Now let's try to get roles from the actual User objects
print("\n📋 Step 4: Getting user roles from database...")
test_users = {
    'admin@test.com': 'platform_dev',
    'orgadmin@test.com': 'org_admin',
    'user@test.com': 'user',
    'compliance@test.com': 'compliance',
    'mlengineer@test.com': 'ml_engineer',
    'finance@test.com': 'finance',
    'viewer@test.com': 'viewer'
}

print("\n📋 Step 5: Updating OrgMembership roles...")
updated_count = 0

for email, expected_role in test_users.items():
    # Get user's default_org_id
    user_result = session.execute(text("""
        SELECT id, default_org_id
        FROM users
        WHERE email = :email
    """), {"email": email}).fetchone()
    
    if not user_result:
        print(f"   ⚠️  User not found: {email}")
        continue
    
    user_id, org_id = user_result
    
    # Update the membership role
    result = session.execute(text("""
        UPDATE org_memberships
        SET role = :role, updated_at = NOW()
        WHERE user_id = :user_id AND org_id = :org_id
        RETURNING id
    """), {
        "role": expected_role,
        "user_id": str(user_id),
        "org_id": str(org_id)
    }).fetchone()
    
    if result:
        session.commit()
        updated_count += 1
        print(f"   ✅ Updated: {email} → {expected_role}")
    else:
        print(f"   ⚠️  No membership found for: {email}")

session.close()

print("")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"✅ COMPLETE: Updated {updated_count} user roles")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("")

# Verify
print("📋 Step 6: Verifying roles...")
session = next(get_session())
for email, expected_role in test_users.items():
    membership = session.execute(text("""
        SELECT om.role, u.email
        FROM org_memberships om
        JOIN users u ON om.user_id = u.id
        WHERE u.email = :email AND om.status = 'active'
    """), {"email": email}).fetchone()
    
    if membership:
        role, user_email = membership
        status = "✅" if role == expected_role else "❌"
        print(f"   {status} {email}: {role} (expected: {expected_role})")
    else:
        print(f"   ❌ {email}: No membership found")

session.close()
PYTHON_SCRIPT

echo "📋 Running role fix script..."
docker cp /tmp/fix_user_roles.py $(docker compose ps -q api):/tmp/fix_user_roles.py
docker compose exec -T api python3 /tmp/fix_user_roles.py

echo ""
echo "🔄 Restarting API..."
docker compose restart api

echo ""
echo "⏳ Waiting for API..."
sleep 10

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ROLE FIX COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 Now log out and log back in to see the updated role"
echo "🌐 Login at: https://dev-swat.com/login"
echo ""

