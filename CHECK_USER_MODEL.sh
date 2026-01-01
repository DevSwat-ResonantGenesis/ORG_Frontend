#!/bin/bash

# Check User model structure to find correct field name
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHECKING USER MODEL STRUCTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

cat > /tmp/check_user_model.py << 'PYTHON_SCRIPT'
import sys
sys.path.insert(0, '/app')

from fastapi_app.models import User
import inspect

print("📋 User Model Fields:")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

# Get all fields from the model
if hasattr(User, '__fields__'):
    for field_name, field_info in User.__fields__.items():
        print(f"  {field_name}: {field_info.type_}")
elif hasattr(User, '__annotations__'):
    for field_name, field_type in User.__annotations__.items():
        print(f"  {field_name}: {field_type}")
else:
    # Try to get from model_fields (Pydantic v2)
    if hasattr(User, 'model_fields'):
        for field_name, field_info in User.model_fields.items():
            print(f"  {field_name}: {field_info.annotation}")

print("")
print("📋 Checking for organization-related fields:")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

# Check all attributes
all_attrs = dir(User)
org_related = [attr for attr in all_attrs if 'org' in attr.lower() or 'organization' in attr.lower()]
if org_related:
    for attr in org_related:
        if not attr.startswith('_'):
            print(f"  {attr}")

# Try to create a user instance to see what fields are available
print("")
print("📋 Testing User instance:")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

from fastapi_app.db import get_session
session = next(get_session())

# Get a test user
user = session.query(User).filter(User.email == 'admin@test.com').first()
if user:
    print(f"  Found user: {user.email}")
    print(f"  User attributes with 'org':")
    user_attrs = [attr for attr in dir(user) if 'org' in attr.lower() and not attr.startswith('_')]
    for attr in user_attrs:
        try:
            value = getattr(user, attr)
            print(f"    {attr}: {value}")
        except:
            print(f"    {attr}: (error accessing)")
    
    # Check if there's a relationship
    if hasattr(user, 'organization'):
        print(f"  Has 'organization' relationship")
    if hasattr(user, 'org'):
        print(f"  Has 'org' relationship")
else:
    print("  No test user found")

session.close()
PYTHON_SCRIPT

docker cp /tmp/check_user_model.py $(docker compose ps -q api):/tmp/check_user_model.py
docker compose exec -T api python3 /tmp/check_user_model.py

