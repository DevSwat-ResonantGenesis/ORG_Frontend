#!/bin/bash

# Create Test Users for All Roles - Run on Droplet
# This script creates test users with password: Test1234!

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👥 CREATING TEST USERS FOR ALL ROLES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd /root/ResonantGraphAIV0.1

# Check if Python is available in API container
echo ""
echo "📋 Step 1: Checking Python availability..."
docker compose exec -T api python3 --version || {
    echo "❌ Python not available in API container"
    exit 1
}

# Create Python script to generate users
cat > /tmp/create_test_users.py << 'PYTHON_SCRIPT'
import bcrypt
import psycopg2
from uuid import uuid4
import sys

# Database connection (using internal Docker network)
try:
    conn = psycopg2.connect(
        host="db",
        port=5432,
        database="resonant",
        user="postgres",
        password="postgres"
    )
    cur = conn.cursor()
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    sys.exit(1)

# Hash password: Test1234!
password = "Test1234!"
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Get or create test organization
cur.execute("SELECT id FROM organizations WHERE name = 'Test Organization' LIMIT 1")
org = cur.fetchone()

if not org:
    org_id = str(uuid4())
    cur.execute(
        "INSERT INTO organizations (id, name, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())",
        (org_id, "Test Organization")
    )
    print(f"✅ Created organization: Test Organization (ID: {org_id})")
else:
    org_id = org[0]
    print(f"✅ Using existing organization: Test Organization (ID: {org_id})")

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
    cur.execute("SELECT id, role FROM users WHERE email = %s", (email,))
    existing = cur.fetchone()
    
    if existing:
        # Update existing user
        cur.execute("""
            UPDATE users 
            SET role = %s, is_active = true, updated_at = NOW()
            WHERE email = %s
        """, (role, email))
        updated_count += 1
        print(f"🔄 Updated: {email} → {role_name}")
    else:
        # Create new user
        user_id = str(uuid4())
        cur.execute("""
            INSERT INTO users (id, email, password_hash, role, org_id, is_active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, true, NOW(), NOW())
        """, (user_id, email, hashed, role, org_id))
        created_count += 1
        print(f"✅ Created: {email} → {role_name}")

conn.commit()
cur.close()
conn.close()

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
PYTHON_SCRIPT

# Copy script to API container and run it
echo ""
echo "📋 Step 2: Creating test users..."
docker cp /tmp/create_test_users.py $(docker compose ps -q api):/tmp/create_test_users.py
docker compose exec -T api python3 /tmp/create_test_users.py

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TEST USERS CREATED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 You can now test login with any of the users above"
echo "🌐 Login at: https://dev-swat.com/login"

