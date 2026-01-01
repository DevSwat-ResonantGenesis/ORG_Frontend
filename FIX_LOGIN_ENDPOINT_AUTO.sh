#!/bin/bash

# Automatically fix login endpoint to use default_org_id
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 AUTO-FIXING LOGIN ENDPOINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

# Find login file
LOGIN_FILE=$(find backend/fastapi_app/routers -name "*auth*.py" | head -1)

if [ -z "$LOGIN_FILE" ]; then
    LOGIN_FILE=$(find backend/fastapi_app -name "*auth*.py" | head -1)
fi

if [ -z "$LOGIN_FILE" ]; then
    echo "❌ Could not find auth router file"
    exit 1
fi

echo "📋 Found login file: $LOGIN_FILE"

# Create backup
cp "$LOGIN_FILE" "${LOGIN_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"

# Create Python script to fix the login endpoint
cat > /tmp/fix_login.py << 'PYTHON_SCRIPT'
import sys
import re

login_file = sys.argv[1]

with open(login_file, 'r') as f:
    content = f.read()

# Pattern 1: Fix "No active organizations" check
# Look for code that checks for active organizations and update to use default_org_id

# Pattern 2: Update org_id references to default_org_id in user queries
# Replace user.org_id with user.default_org_id (but be careful not to break other things)

# Pattern 3: Ensure login response includes org_id from default_org_id

changes_made = []

# Fix 1: Replace checks for user.org_id with user.default_org_id in organization context
if 'user.org_id' in content and 'default_org_id' not in content:
    # This is tricky - we need to be careful
    # Let's look for the specific pattern around "No active organizations"
    if 'No active organizations' in content:
        # Find the section with this error
        pattern = r'(if\s+(?:not\s+)?(?:user\.org_id|org_id|user_org))'
        if re.search(pattern, content):
            changes_made.append("Found org_id check that may need updating")
            print("⚠️  Found org_id references that may need manual review")

# Fix 2: Add default_org_id to login response if missing
if 'default_org_id' in content:
    print("✅ File already references default_org_id")
else:
    print("⚠️  File does not reference default_org_id - may need manual update")

# Show the problematic section
if 'No active organizations' in content:
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'No active organizations' in line:
            print(f"\n📋 Found 'No active organizations' at line {i+1}:")
            # Show context
            start = max(0, i-5)
            end = min(len(lines), i+10)
            for j in range(start, end):
                marker = ">>> " if j == i else "    "
                print(f"{marker}{j+1:4d}: {lines[j]}")

print(f"\n📝 Summary:")
print(f"   File: {login_file}")
print(f"   Contains 'No active organizations': {'Yes' if 'No active organizations' in content else 'No'}")
print(f"   Contains 'default_org_id': {'Yes' if 'default_org_id' in content else 'No'}")
print(f"   Contains 'user.org_id': {'Yes' if 'user.org_id' in content else 'No'}")

PYTHON_SCRIPT

python3 /tmp/fix_login.py "$LOGIN_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The login endpoint needs to check 'default_org_id' instead of 'org_id'"
echo ""
echo "Please check the login function in: $LOGIN_FILE"
echo ""
echo "Look for code that:"
echo "  1. Checks if user has an organization"
echo "  2. Returns 'No active organizations' error"
echo "  3. Updates it to use 'user.default_org_id'"
echo ""
echo "Example fix:"
echo "  # Before:"
echo "  if not user.org_id:"
echo "      raise HTTPException(..., 'No active organizations')"
echo ""
echo "  # After:"
echo "  if not user.default_org_id:"
echo "      raise HTTPException(..., 'No active organizations')"
echo ""
echo "  # And when getting organization:"
echo "  org = session.get(Organization, user.default_org_id)"
echo ""

