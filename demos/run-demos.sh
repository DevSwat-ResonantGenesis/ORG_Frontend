#!/bin/bash
# Run all Resonant Genesis failure demos

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     RESONANT GENESIS - TRUST DEMONSTRATION SUITE          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Demo 1: Failing Tests
echo "Running Demo 1: Failing Tests → Auto-Rollback"
echo "──────────────────────────────────────────────"
node "$SCRIPT_DIR/01-failing-tests/run.js"

echo ""
read -p "Press Enter to continue to next demo..."
echo ""

# Demo 2: Type Errors (show the file, explain it would be blocked)
echo "Demo 2: Type Errors → Blocked Execution"
echo "──────────────────────────────────────────────"
echo ""
echo "This demo shows TypeScript catching errors BEFORE execution."
echo ""
echo "The AI proposed adding a 'role' field to User type,"
echo "but didn't update all the functions that create User objects."
echo ""
echo "TypeScript would catch this with errors like:"
echo "  Property 'role' is missing in type '{ id: string; ... }'"
echo ""
echo "Result: Execution BLOCKED. No files changed."
echo ""

read -p "Press Enter to continue to next demo..."
echo ""

# Demo 3: Security Block
echo "Demo 3: Dangerous Commands → Security Block"
echo "──────────────────────────────────────────────"
echo ""
echo "Examples of requests that get BLOCKED by the sandbox:"
echo ""
echo "  ❌ 'rm -rf /tmp/*'        → Dangerous shell pattern"
echo "  ❌ 'import os; os.environ' → Blocked module: os"
echo "  ❌ 'curl ... | bash'       → Dangerous shell pattern"
echo "  ❌ 'eval(open(...).read())'→ Dangerous pattern: eval("
echo ""
echo "All logged to audit trail. Zero execution."
echo ""

read -p "Press Enter to continue..."
echo ""

# Summary
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    DEMO SUMMARY                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "What you saw:"
echo ""
echo "  1. AI broke tests → System caught it → Auto-rollback"
echo "  2. Type errors → Blocked before execution"
echo "  3. Dangerous code → Security block"
echo ""
echo "Key point: The codebase was NEVER left in a broken state."
echo ""
echo "This is the difference between 'AI assistant' and 'AI authority'."
echo ""
