#!/bin/bash

# Find where roles are stored and fix all user roles
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 FINDING AND FIXING USER ROLES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

cat > /tmp/find_and_fix_roles.py << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from fastapi_app.db import get_session
from fastapi_app.models import User
from sqlalchemy import text

session = next(get_session())

print("📋 Step 1: Checking all tables for role storage...")

# Check all tables
all_tables = session.execute(text("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
""")).fetchall()

print(f"   Found {len(all_tables)} tables")

# Check each table for role-related columns
role_tables = {}
for table in all_tables:
    table_name = table[0]
    columns = session.execute(text(f"""
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = '{table_name}'
        AND (column_name LIKE '%role%' OR column_name = 'user_role')
    """)).fetchall()
    if columns:
        role_tables[table_name] = [c[0] for c in columns]
        print(f"   ✅ {table_name}: {[c[0] for c in columns]}")

print("\n📋 Step 2: Checking User model directly...")
try:
    from fastapi_app.models import User as UserModel
    
    # Try to get a user and inspect it
    user = session.query(UserModel).filter(UserModel.email == 'admin@test.com').first()
    if user:
        print(f"   User object type: {type(user)}")
        print(f"   User attributes: {dir(user)}")
        
        # Check for role in various ways
        if hasattr(user, 'role'):
            print(f"   ✅ User.role = {getattr(user, 'role', None)}")
        if hasattr(user, '__dict__'):
            print(f"   User __dict__ keys: {list(user.__dict__.keys())}")
            
        # Try to access role via SQLModel
        try:
            role = getattr(user, 'role', None)
            if role:
                print(f"   ✅ Found role via attribute: {role}")
        except:
            pass
except Exception as e:
    print(f"   ⚠️  Error: {e}")

print("\n📋 Step 3: Checking user_identities or identities table...")
identity_result = session.execute(text("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (table_name LIKE '%identity%' OR table_name = 'identities')
""")).fetchall()

if identity_result:
    for table in identity_result:
        table_name = table[0]
        print(f"   Checking {table_name}...")
        # Get sample data
        sample = session.execute(text(f"""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = '{table_name}'
        """)).fetchall()
        print(f"      Columns: {[c[0] for c in sample]}")
        
        # Check if it has user_id and role
        if any('user' in c[0].lower() for c in sample) and any('role' in c[0].lower() for c in sample):
            print(f"      ✅ {table_name} has user and role columns!")
            # Get roles for test users
            user_roles = session.execute(text(f"""
                SELECT u.email, i.role
                FROM {table_name} i
                JOIN users u ON i.user_id = u.id
                WHERE u.email IN ('admin@test.com', 'orgadmin@test.com', 'user@test.com')
            """)).fetchall()
            if user_roles:
                print(f"      Sample roles: {user_roles}")

print("\n📋 Step 4: Direct SQL query to find roles...")
# Try to find roles in any table that links users to roles
for table_name, columns in role_tables.items():
    if 'user' in [c.lower() for c in columns] or 'user_id' in [c.lower() for c in columns]:
        print(f"   Checking {table_name}...")
        try:
            # Try to get user roles
            result = session.execute(text(f"""
                SELECT u.email, t.role
                FROM {table_name} t
                JOIN users u ON t.user_id = u.id
                WHERE u.email = 'admin@test.com'
                LIMIT 1
            """)).fetchone()
            if result:
                print(f"      ✅ Found role in {table_name}: {result}")
        except Exception as e:
            print(f"      ⚠️  Error querying {table_name}: {e}")

# Now let's just directly update based on known roles
print("\n📋 Step 5: Updating OrgMembership roles directly...")
test_users_roles = {
    'admin@test.com': 'platform_dev',
    'orgadmin@test.com': 'org_admin',
    'user@test.com': 'user',
    'compliance@test.com': 'compliance',
    'mlengineer@test.com': 'ml_engineer',
    'finance@test.com': 'finance',
    'viewer@test.com': 'viewer'
}

updated_count = 0
for email, role in test_users_roles.items():
    result = session.execute(text("""
        UPDATE org_memberships om
        SET role = :role, updated_at = NOW()
        FROM users u
        WHERE om.user_id = u.id
        AND u.email = :email
        AND om.status = 'active'
        RETURNING om.id
    """), {"email": email, "role": role}).fetchone()
    
    if result:
        session.commit()
        updated_count += 1
        print(f"   ✅ Updated: {email} → {role}")
    else:
        print(f"   ⚠️  No membership found for: {email}")

session.close()

print("")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"✅ COMPLETE: Updated {updated_count} roles")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print("")

# Verify
print("📋 Step 6: Verifying all roles...")
session = next(get_session())
for email, expected_role in test_users_roles.items():
    result = session.execute(text("""
        SELECT om.role
        FROM org_memberships om
        JOIN users u ON om.user_id = u.id
        WHERE u.email = :email AND om.status = 'active'
    """), {"email": email}).fetchone()
    
    if result:
        actual_role = result[0]
        status = "✅" if actual_role == expected_role else "❌"
        print(f"   {status} {email}: {actual_role} (expected: {expected_role})")
    else:
        print(f"   ❌ {email}: No membership found")

session.close()
PYTHON_SCRIPT

echo "📋 Running role finder and fixer script..."
docker cp /tmp/find_and_fix_roles.py $(docker compose ps -q api):/tmp/find_and_fix_roles.py
docker compose exec -T api python3 /tmp/find_and_fix_roles.py

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
echo "🧪 Log out and log back in to see updated roles"
echo "🌐 Login at: https://dev-swat.com/login"
echo ""

