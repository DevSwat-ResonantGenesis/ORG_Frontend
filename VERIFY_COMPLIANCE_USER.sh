#!/bin/bash

# Verify compliance user has proper OrgMembership
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFYING COMPLIANCE USER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

cat > /tmp/verify_compliance.py << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from fastapi_app.db import get_session
from sqlalchemy import text

session = next(get_session())

email = 'compliance@test.com'

print(f"📋 Checking user: {email}")
print("")

# Get user
user = session.execute(text("""
    SELECT id, email, default_org_id, is_active
    FROM users
    WHERE email = :email
"""), {"email": email}).fetchone()

if not user:
    print(f"   ❌ User not found: {email}")
    sys.exit(1)

user_id, user_email, org_id, is_active = user
print(f"   ✅ User found:")
print(f"      ID: {user_id}")
print(f"      Email: {user_email}")
print(f"      Default Org ID: {org_id}")
print(f"      Is Active: {is_active}")
print("")

# Get membership
membership = session.execute(text("""
    SELECT id, role, status, org_id
    FROM org_memberships
    WHERE user_id = :user_id AND org_id = :org_id
"""), {"user_id": str(user_id), "org_id": str(org_id)}).fetchone()

if membership:
    m_id, role, status, m_org_id = membership
    print(f"   ✅ Membership found:")
    print(f"      ID: {m_id}")
    print(f"      Role: {role}")
    print(f"      Status: {status}")
    print(f"      Org ID: {m_org_id}")
    
    if status != 'active':
        print(f"   ⚠️  Membership is not active! Fixing...")
        session.execute(text("""
            UPDATE org_memberships
            SET status = 'active', updated_at = NOW()
            WHERE id = :id
        """), {"id": str(m_id)})
        session.commit()
        print(f"   ✅ Membership activated")
    
    if role != 'compliance':
        print(f"   ⚠️  Role is '{role}', should be 'compliance'. Fixing...")
        session.execute(text("""
            UPDATE org_memberships
            SET role = 'compliance', updated_at = NOW()
            WHERE id = :id
        """), {"id": str(m_id)})
        session.commit()
        print(f"   ✅ Role updated to 'compliance'")
else:
    print(f"   ❌ No membership found! Creating...")
    from uuid import uuid4
    membership_id = str(uuid4())
    session.execute(text("""
        INSERT INTO org_memberships (id, user_id, org_id, role, status, created_at, updated_at)
        VALUES (:id, :user_id, :org_id, 'compliance', 'active', NOW(), NOW())
    """), {
        "id": membership_id,
        "user_id": str(user_id),
        "org_id": str(org_id)
    })
    session.commit()
    print(f"   ✅ Membership created")

session.close()
print("")
print("✅ Compliance user verified and fixed!")
PYTHON_SCRIPT

docker cp /tmp/verify_compliance.py $(docker compose ps -q api):/tmp/verify_compliance.py
docker compose exec -T api python3 /tmp/verify_compliance.py

echo ""
echo "🔄 Restarting API..."
docker compose restart api

echo ""
echo "✅ Done! Compliance user should now be able to sign in."

