#!/bin/bash

# Apply fix for stripe.py Identity error
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 APPLYING STRIPE.PY FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /root/ResonantGraphAIV0.1

STRIPE_FILE="backend/fastapi_app/routers/stripe.py"

if [ ! -f "$STRIPE_FILE" ]; then
    echo "❌ File not found: $STRIPE_FILE"
    exit 1
fi

echo "📋 Step 1: Checking tenant_session_admin dependency..."
echo ""
# Find what tenant_session_admin returns
TENANT_DEP_FILE=$(grep -r "def tenant_session_admin\|tenant_session_admin\s*=" backend/fastapi_app/ --include="*.py" | head -1 | cut -d: -f1 || echo "")
if [ -n "$TENANT_DEP_FILE" ]; then
    echo "   Found in: $TENANT_DEP_FILE"
    grep -A 20 "def tenant_session_admin" "$TENANT_DEP_FILE" 2>/dev/null | head -25 | sed 's/^/     /' || true
else
    echo "   ⚠️  tenant_session_admin not found"
fi
echo ""

echo "📋 Step 2: Checking Organization import..."
echo ""
grep -n "from.*Organization\|import.*Organization" "$STRIPE_FILE" | sed 's/^/     /' || echo "     Organization not imported"
echo ""

echo "📋 Step 3: Creating backup..."
cp "$STRIPE_FILE" "${STRIPE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
echo "   ✅ Backup created"
echo ""

echo "📋 Step 4: Showing current problematic code..."
echo ""
echo "   Current code (around line 139):"
sed -n '125,145p' "$STRIPE_FILE" | cat -n | sed 's/^/     /'
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 APPLYING FIX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if Organization is imported
if ! grep -q "Organization" "$STRIPE_FILE"; then
    echo "   ⚠️  Organization not imported, need to add import"
    echo ""
fi

# Apply the fix
# Replace: session, org = session_identity
# With: session, identity = session_identity
# Then add: org = session.get(Organization, identity.org_id)

# First, check current line
CURRENT_LINE=$(sed -n '139p' "$STRIPE_FILE")
echo "   Current line 139: $CURRENT_LINE"
echo ""

# Find the line with session, org = session_identity
SESSION_ORG_LINE=$(grep -n "session, org = session_identity" "$STRIPE_FILE" | cut -d: -f1 || echo "")

if [ -n "$SESSION_ORG_LINE" ]; then
    echo "   Found 'session, org = session_identity' at line $SESSION_ORG_LINE"
    echo ""
    echo "   🔧 Fixing..."
    
    # Create a temporary file with the fix
    python3 << 'PYTHON_FIX'
import sys

file_path = sys.argv[1]
session_org_line = int(sys.argv[2])

with open(file_path, 'r') as f:
    lines = f.readlines()

# Check if Organization is imported
has_org_import = any('Organization' in line for line in lines)

# Fix the unpacking
if session_org_line > 0:
    # Replace: session, org = session_identity
    # With: session, identity = session_identity
    lines[session_org_line - 1] = lines[session_org_line - 1].replace('session, org = session_identity', 'session, identity = session_identity')
    
    # Add Organization import if needed
    if not has_org_import:
        # Find the last import line
        last_import = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('from') or line.strip().startswith('import'):
                last_import = i
        
        # Add Organization import
        if last_import > 0:
            # Check if there's already a models import
            for i, line in enumerate(lines[:last_import + 1]):
                if 'from' in line and 'models' in line and 'import' in line:
                    # Add Organization to existing import
                    if 'Organization' not in line:
                        lines[i] = line.rstrip() + ', Organization\n'
                    break
            else:
                # Add new import line
                lines.insert(last_import + 1, 'from ..models import Organization\n')
    
    # Add org = session.get(Organization, identity.org_id) after the unpacking
    insert_line = session_org_line
    lines.insert(insert_line, '    org = session.get(Organization, identity.org_id)\n')
    
    with open(file_path, 'w') as f:
        f.writelines(lines)
    
    print("✅ Fix applied successfully!")
PYTHON_FIX
    "$STRIPE_FILE" "$SESSION_ORG_LINE"
    
    echo ""
    echo "   ✅ Fix applied!"
    echo ""
    echo "   Updated code:"
    sed -n "$((SESSION_ORG_LINE-2)),$((SESSION_ORG_LINE+3))p" "$STRIPE_FILE" | cat -n | sed 's/^/     /'
else
    echo "   ⚠️  Could not find 'session, org = session_identity'"
    echo "   Manual fix required"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The fix:"
echo "1. Changed: session, org = session_identity"
echo "   To: session, identity = session_identity"
echo ""
echo "2. Added: org = session.get(Organization, identity.org_id)"
echo ""
echo "3. Added Organization import if needed"
echo ""
echo "Now restart the API:"
echo "  docker compose restart api"
echo ""

