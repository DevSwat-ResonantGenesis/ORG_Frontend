#!/bin/bash

# Direct fix for login endpoint to use default_org_id
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIXING LOGIN ENDPOINT - USE default_org_id"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

# Find auth router file
AUTH_FILE=$(find backend/fastapi_app/routers -name "*auth*.py" | head -1)

if [ -z "$AUTH_FILE" ]; then
    echo "❌ Could not find auth router file"
    exit 1
fi

echo "📋 Found auth file: $AUTH_FILE"

# Create backup
BACKUP="${AUTH_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$AUTH_FILE" "$BACKUP"
echo "✅ Backup created: $BACKUP"

# Create Python script to fix the login endpoint
cat > /tmp/fix_login_direct.py << 'PYTHON_SCRIPT'
import sys
import re

auth_file = sys.argv[1]

with open(auth_file, 'r') as f:
    lines = f.readlines()

changes = []
in_login_function = False
login_start = -1

# Find login function
for i, line in enumerate(lines):
    if re.search(r'def\s+(login|authenticate)', line, re.IGNORECASE):
        in_login_function = True
        login_start = i
        print(f"📋 Found login function at line {i+1}")
    elif in_login_function and (line.strip().startswith('def ') or line.strip().startswith('@')):
        # End of login function
        break

if login_start == -1:
    print("❌ Could not find login function")
    sys.exit(1)

# Look for "No active organizations" error
for i in range(login_start, min(login_start + 100, len(lines))):
    line = lines[i]
    
    # Find the error message
    if 'No active organizations' in line or 'no active organization' in line.lower():
        print(f"\n📋 Found 'No active organizations' check at line {i+1}")
        
        # Show context
        print("\nContext (10 lines before and after):")
        start = max(0, i-10)
        end = min(len(lines), i+10)
        for j in range(start, end):
            marker = ">>> " if j == i else "    "
            print(f"{marker}{j+1:4d}: {lines[j].rstrip()}")
        
        # Look for the condition that triggers this error
        # Go backwards to find the if statement
        for j in range(i, max(0, i-20), -1):
            if re.search(r'if\s+(?:not\s+)?(?:user\.|\.)(org_id|organization)', lines[j], re.IGNORECASE):
                print(f"\n📋 Found condition at line {j+1}: {lines[j].strip()}")
                
                # Check if it uses org_id instead of default_org_id
                if 'default_org_id' not in lines[j] and ('org_id' in lines[j] or 'organization' in lines[j]):
                    print(f"   ⚠️  This condition needs to use 'default_org_id'")
                    print(f"   Current: {lines[j].strip()}")
                    
                    # Try to fix it
                    fixed = re.sub(
                        r'(user\.|\.)org_id',
                        r'\1default_org_id',
                        lines[j],
                        flags=re.IGNORECASE
                    )
                    if fixed != lines[j]:
                        lines[j] = fixed
                        changes.append(f"Line {j+1}: Updated to use default_org_id")
                        print(f"   ✅ Fixed: {lines[j].strip()}")
                break

# Also check for where org_id is retrieved/used in login response
print("\n📋 Checking login response for org_id...")
for i in range(login_start, min(login_start + 150, len(lines))):
    line = lines[i]
    
    # Look for return statement or response building
    if 'return' in line.lower() or 'org_id' in line or 'access_token' in line:
        # Check if it uses user.org_id instead of user.default_org_id
        if 'user.org_id' in line and 'default_org_id' not in line:
            print(f"   ⚠️  Line {i+1} uses user.org_id: {line.strip()}")
            fixed = line.replace('user.org_id', 'user.default_org_id')
            if fixed != line:
                lines[i] = fixed
                changes.append(f"Line {i+1}: Updated response to use default_org_id")
                print(f"   ✅ Fixed: {lines[i].strip()}")
        
        # Check for organization query
        if 'Organization' in line and 'get(' in line or 'query(' in line:
            # Check if it uses org_id instead of default_org_id
            if 'org_id' in line and 'default_org_id' not in line:
                print(f"   ⚠️  Line {i+1} queries org with org_id: {line.strip()}")
                # This is trickier - need to see the full context
                print(f"   Context: {''.join(lines[max(0,i-2):min(len(lines),i+3)])}")

if changes:
    print(f"\n✅ Made {len(changes)} changes:")
    for change in changes:
        print(f"   - {change}")
    
    # Write fixed file
    with open(auth_file, 'w') as f:
        f.writelines(lines)
    print(f"\n✅ File updated: {auth_file}")
else:
    print("\n⚠️  No automatic fixes applied. Manual review needed.")
    print("   The login function may need manual updates to use 'default_org_id'")

PYTHON_SCRIPT

echo ""
echo "📋 Running fix script..."
python3 /tmp/fix_login_direct.py "$AUTH_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 RESTARTING API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

docker compose restart api

echo ""
echo "⏳ Waiting for API to restart..."
sleep 10

echo ""
echo "🧪 Testing login..."
cd /root/frontend
chmod +x VERIFY_USER_ORG_FIX.sh
./VERIFY_USER_ORG_FIX.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

