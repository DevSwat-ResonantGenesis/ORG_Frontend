#!/bin/bash

# Check the actual schema of the users table
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHECKING USERS TABLE SCHEMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

cat > /tmp/check_schema.py << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from fastapi_app.db import get_session
from sqlalchemy import text, inspect

session = next(get_session())

print("📋 Checking users table columns...")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

# Get column information
result = session.execute(text("""
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
""")).fetchall()

print("")
print("Columns in 'users' table:")
for col_name, data_type, is_nullable in result:
    nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
    print(f"  - {col_name}: {data_type} ({nullable})")

# Check for organization-related columns
print("")
print("📋 Organization-related columns:")
org_cols = [col for col in result if 'org' in col[0].lower() or 'organization' in col[0].lower()]
if org_cols:
    for col_name, data_type, is_nullable in org_cols:
        print(f"  ✅ {col_name}: {data_type}")
else:
    print("  ⚠️  No organization-related columns found")

# Check foreign keys
print("")
print("📋 Foreign keys in 'users' table:")
fk_result = session.execute(text("""
    SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'users'
""")).fetchall()

if fk_result:
    for fk_name, col_name, foreign_table, foreign_col in fk_result:
        if 'org' in foreign_table.lower() or 'organization' in foreign_table.lower():
            print(f"  ✅ {col_name} → {foreign_table}.{foreign_col}")
else:
    print("  ⚠️  No foreign keys found")

session.close()
PYTHON_SCRIPT

docker cp /tmp/check_schema.py $(docker compose ps -q api):/tmp/check_schema.py
docker compose exec -T api python3 /tmp/check_schema.py

