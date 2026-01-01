#!/bin/bash

# Create Test Users for All Roles - Run on Droplet Backend
# This script uses the backend's existing database connection

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👥 CREATING TEST USERS FOR ALL ROLES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /root/ResonantGraphAIV0.1

# Method 1: Use SQL directly via psql in db container
echo ""
echo "📋 Method 1: Creating users via SQL..."

# Create SQL script
cat > /tmp/create_test_users.sql << 'SQL_SCRIPT'
-- Create test organization if it doesn't exist
INSERT INTO organizations (id, name, created_at, updated_at)
SELECT gen_random_uuid(), 'Test Organization', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Test Organization');

-- Get organization ID
DO $$
DECLARE
    org_id_val UUID;
    password_hash TEXT;
BEGIN
    -- Get organization ID
    SELECT id INTO org_id_val FROM organizations WHERE name = 'Test Organization' LIMIT 1;
    
    -- Hash password: Test1234! (using bcrypt hash - you'll need to generate this)
    -- For now, we'll use a placeholder that will be replaced by Python
    
    -- Create/Update users
    -- Platform Dev
    INSERT INTO users (id, email, password_hash, role, org_id, is_active, created_at, updated_at)
    SELECT gen_random_uuid(), 'admin@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZqZqZq', 'platform_dev', org_id_val, true, NOW(), NOW()
    ON CONFLICT (email) DO UPDATE SET role = 'platform_dev', is_active = true, updated_at = NOW();
    
    -- Org Admin
    INSERT INTO users (id, email, password_hash, role, org_id, is_active, created_at, updated_at)
    SELECT gen_random_uuid(), 'orgadmin@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZqZqZq', 'org_admin', org_id_val, true, NOW(), NOW()
    ON CONFLICT (email) DO UPDATE SET role = 'org_admin', is_active = true, updated_at = NOW();
    
    -- User
    INSERT INTO users (id, email, password_hash, role, org_id, is_active, created_at, updated_at)
    SELECT gen_random_uuid(), 'user@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZqZqZq', 'user', org_id_val, true, NOW(), NOW()
    ON CONFLICT (email) DO UPDATE SET role = 'user', is_active = true, updated_at = NOW();
    
    -- Compliance
    INSERT INTO users (id, email, password_hash, role, org_id, is_active, created_at, updated_at)
    SELECT gen_random_uuid(), 'compliance@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZqZqZq', 'compliance', org_id_val, true, NOW(), NOW()
    ON CONFLICT (email) DO UPDATE SET role = 'compliance', is_active = true, updated_at = NOW();
    
    -- ML Engineer
    INSERT INTO users (id, email, password_hash, role, org_id, is_active, created_at, updated_at)
    SELECT gen_random_uuid(), 'mlengineer@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZqZqZq', 'ml_engineer', org_id_val, true, NOW(), NOW()
    ON CONFLICT (email) DO UPDATE SET role = 'ml_engineer', is_active = true, updated_at = NOW();
    
    -- Finance
    INSERT INTO users (id, email, password_hash, role, org_id, is_active, created_at, updated_at)
    SELECT gen_random_uuid(), 'finance@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZqZqZq', 'finance', org_id_val, true, NOW(), NOW()
    ON CONFLICT (email) DO UPDATE SET role = 'finance', is_active = true, updated_at = NOW();
    
    -- Viewer
    INSERT INTO users (id, email, password_hash, role, org_id, is_active, created_at, updated_at)
    SELECT gen_random_uuid(), 'viewer@test.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJqZqZqZq', 'viewer', org_id_val, true, NOW(), NOW()
    ON CONFLICT (email) DO UPDATE SET role = 'viewer', is_active = true, updated_at = NOW();
END $$;
SQL_SCRIPT

# Try Method 2: Use Python with SQLAlchemy (backend's existing setup)
echo ""
echo "📋 Method 2: Creating users via Python (using backend's database setup)..."

cat > /tmp/create_test_users_backend.py << 'PYTHON_SCRIPT'
#!/usr/bin/env python3
import sys
import os

# Add backend to path
sys.path.insert(0, '/app')

try:
    from fastapi_app.db import get_session
    from fastapi_app.models import User, Organization
    from fastapi_app.auth.crypto import hash_password
    from sqlalchemy import select
    from uuid import uuid4
    
    # Get database session
    session = next(get_session())
    
    # Get or create test organization
    org = session.query(Organization).filter(Organization.name == 'Test Organization').first()
    if not org:
        org = Organization(
            id=str(uuid4()),
            name='Test Organization'
        )
        session.add(org)
        session.commit()
        session.refresh(org)
        print(f"✅ Created organization: Test Organization (ID: {org.id})")
    else:
        print(f"✅ Using existing organization: Test Organization (ID: {org.id})")
    
    # Hash password: Test1234!
    password_hash = hash_password("Test1234!")
    
    # Test users to create
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
    
    for email, role, role_name in users:
        # Check if user exists
        existing_user = session.query(User).filter(User.email == email).first()
        
        if existing_user:
            # Update existing user
            existing_user.role = role
            existing_user.is_active = True
            updated_count += 1
            print(f"🔄 Updated: {email} → {role_name}")
        else:
            # Create new user
            new_user = User(
                id=str(uuid4()),
                email=email,
                password_hash=password_hash,
                role=role,
                org_id=org.id,
                is_active=True
            )
            session.add(new_user)
            created_count += 1
            print(f"✅ Created: {email} → {role_name}")
    
    session.commit()
    session.close()
    
    print("")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✅ COMPLETE: Created {created_count} users, Updated {updated_count} users")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("")
    print("📋 Test User Credentials:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("Email: admin@test.com        | Role: Platform Dev    | Password: Test1234!")
    print("Email: orgadmin@test.com     | Role: Org Admin       | Password: Test1234!")
    print("Email: user@test.com         | Role: User            | Password: Test1234!")
    print("Email: compliance@test.com   | Role: Compliance      | Password: Test1234!")
    print("Email: mlengineer@test.com   | Role: ML Engineer     | Password: Test1234!")
    print("Email: finance@test.com      | Role: Finance         | Password: Test1234!")
    print("Email: viewer@test.com       | Role: Viewer          | Password: Test1234!")
    print("")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Trying alternative method...")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
PYTHON_SCRIPT

# Copy script to API container and run it
echo ""
echo "📋 Step 3: Running Python script in API container..."
docker cp /tmp/create_test_users_backend.py $(docker compose ps -q api):/tmp/create_test_users_backend.py 2>/dev/null || {
    echo "⚠️  Could not copy script, trying direct execution..."
    docker compose exec -T api python3 << 'INLINE_SCRIPT'
import sys
sys.path.insert(0, '/app')
from fastapi_app.db import get_session
from fastapi_app.models import User, Organization
from fastapi_app.auth.crypto import hash_password
from sqlalchemy import select
from uuid import uuid4

session = next(get_session())
org = session.query(Organization).filter(Organization.name == 'Test Organization').first()
if not org:
    org = Organization(id=str(uuid4()), name='Test Organization')
    session.add(org)
    session.commit()
    session.refresh(org)
    print(f"✅ Created organization: Test Organization")
else:
    print(f"✅ Using existing organization: Test Organization")

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

for email, role, role_name in users:
    existing_user = session.query(User).filter(User.email == email).first()
    if existing_user:
        existing_user.role = role
        existing_user.is_active = True
        updated_count += 1
        print(f"🔄 Updated: {email} → {role_name}")
    else:
        new_user = User(id=str(uuid4()), email=email, password_hash=password_hash, role=role, org_id=org.id, is_active=True)
        session.add(new_user)
        created_count += 1
        print(f"✅ Created: {email} → {role_name}")

session.commit()
session.close()
print(f"\n✅ COMPLETE: Created {created_count} users, Updated {updated_count} users")
INLINE_SCRIPT
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TEST USERS CREATED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 You can now test login with any of the users above"
echo "🌐 Login at: https://dev-swat.com/login"

