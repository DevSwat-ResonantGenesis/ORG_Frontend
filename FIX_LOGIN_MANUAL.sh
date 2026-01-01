#!/bin/bash

# Manually fix login endpoint - direct approach
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 MANUALLY FIXING LOGIN ENDPOINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

AUTH_FILE="backend/fastapi_app/routers/auth.py"

# Create backup
BACKUP="${AUTH_FILE}.backup.manual.$(date +%Y%m%d_%H%M%S)"
cp "$AUTH_FILE" "$BACKUP"
echo "✅ Backup created: $BACKUP"

# Create Python script to fix it
cat > /tmp/fix_login_manual.py << 'PYTHON_SCRIPT'
import sys
import re

auth_file = sys.argv[1]

with open(auth_file, 'r') as f:
    content = f.read()
    lines = content.split('\n')

# Find the login function
login_start = -1
for i, line in enumerate(lines):
    if re.search(r'def\s+login', line, re.IGNORECASE):
        login_start = i
        break

if login_start == -1:
    print("❌ Could not find login function")
    sys.exit(1)

print(f"📋 Found login function at line {login_start + 1}")

# Look for "No active organizations" error
error_line = -1
for i in range(login_start, min(login_start + 100, len(lines))):
    if 'No active organizations' in lines[i] or 'no active organization' in lines[i].lower():
        error_line = i
        break

if error_line == -1:
    print("❌ Could not find 'No active organizations' error")
    sys.exit(1)

print(f"📋 Found error at line {error_line + 1}")

# Show context around the error
print("\n📋 Context around error:")
for i in range(max(0, error_line - 15), min(len(lines), error_line + 10)):
    marker = ">>> " if i == error_line else "    "
    print(f"{marker}{i+1:4d}: {lines[i]}")

# Look backwards for the condition that triggers this
condition_line = -1
for i in range(error_line, max(0, error_line - 30), -1):
    # Look for if statements checking org
    if re.search(r'if\s+(?:not\s+)?.*(?:org|organization)', lines[i], re.IGNORECASE):
        # Check if it's checking user.org_id or similar
        if 'org_id' in lines[i] or 'organization' in lines[i]:
            condition_line = i
            print(f"\n📋 Found condition at line {i+1}: {lines[i].strip()}")
            break

if condition_line == -1:
    print("\n⚠️  Could not find condition. Looking for user.org_id or user query...")
    # Look for user query or user.org_id
    for i in range(login_start, error_line):
        if 'user.' in lines[i] and ('org_id' in lines[i] or 'organization' in lines[i]):
            print(f"   Line {i+1}: {lines[i].strip()}")
            condition_line = i
            break

# Now fix it
if condition_line != -1:
    original = lines[condition_line]
    
    # Replace user.org_id with user.default_org_id
    fixed = original.replace('user.org_id', 'user.default_org_id')
    fixed = fixed.replace("user.org_id", "user.default_org_id")
    fixed = fixed.replace("user['org_id']", "user['default_org_id']")
    fixed = fixed.replace('user["org_id"]', 'user["default_org_id"]')
    
    # Also check for direct org_id attribute access
    if 'org_id' in fixed and 'default_org_id' not in fixed:
        # Try to replace org_id with default_org_id in user context
        fixed = re.sub(r'(\w+)\.org_id\b', r'\1.default_org_id', fixed)
    
    if fixed != original:
        lines[condition_line] = fixed
        print(f"\n✅ Fixed line {condition_line + 1}:")
        print(f"   Before: {original.strip()}")
        print(f"   After:  {fixed.strip()}")
    else:
        print(f"\n⚠️  Line {condition_line + 1} already correct or couldn't auto-fix")
        print(f"   Content: {original.strip()}")

# Also check for organization query/retrieval
print("\n📋 Checking for organization retrieval...")
for i in range(login_start, min(login_start + 150, len(lines))):
    if 'Organization' in lines[i] and ('get(' in lines[i] or 'query(' in lines[i] or 'filter(' in lines[i]):
        if 'org_id' in lines[i] and 'default_org_id' not in lines[i]:
            print(f"   ⚠️  Line {i+1} uses org_id: {lines[i].strip()}")
            # Try to fix
            fixed = lines[i].replace('org_id', 'default_org_id')
            if fixed != lines[i]:
                lines[i] = fixed
                print(f"   ✅ Fixed: {lines[i].strip()}")

# Check return statement for org_id
print("\n📋 Checking return statement...")
for i in range(login_start, min(login_start + 150, len(lines))):
    if 'return' in lines[i] and ('org_id' in lines[i] or 'access_token' in lines[i]):
        if 'org_id' in lines[i] and 'default_org_id' not in lines[i]:
            print(f"   ⚠️  Line {i+1} returns org_id: {lines[i].strip()}")
            fixed = lines[i].replace('org_id', 'default_org_id')
            if fixed != lines[i]:
                lines[i] = fixed
                print(f"   ✅ Fixed: {lines[i].strip()}")

# Write the fixed file
with open(auth_file, 'w') as f:
    f.write('\n'.join(lines))

print("\n✅ File updated!")
print(f"   Backup: {auth_file}.backup.manual.*")

PYTHON_SCRIPT

echo ""
echo "📋 Running manual fix..."
python3 /tmp/fix_login_manual.py "$AUTH_FILE"

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

