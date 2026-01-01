#!/bin/bash

# Frontend Code Cleanup Script
# Removes compiled .js files from src directory and updates .gitignore

set -e

echo "🧹 Starting frontend code cleanup..."
echo ""

# 1. Count files before cleanup
JS_COUNT=$(find src -name "*.js" -type f ! -name "*.test.js" ! -name "*.config.js" 2>/dev/null | wc -l | tr -d ' ')

if [ "$JS_COUNT" -eq 0 ]; then
  echo "✅ No .js files found in src/ directory. Already clean!"
  exit 0
fi

echo "📊 Found $JS_COUNT .js files in src/ directory"
echo ""

# 2. Show what will be deleted (first 10)
echo "📋 Sample files to be removed (first 10):"
find src -name "*.js" -type f ! -name "*.test.js" ! -name "*.config.js" 2>/dev/null | head -10
echo ""

# 3. Ask for confirmation
read -p "⚠️  Do you want to delete these compiled .js files? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cleanup cancelled."
  exit 1
fi

# 4. Remove .js files
echo "🗑️  Removing .js files from src/..."
find src -name "*.js" -type f ! -name "*.test.js" ! -name "*.config.js" -delete
echo "✅ Removed $JS_COUNT .js files"
echo ""

# 5. Update .gitignore
echo "📝 Updating .gitignore..."
if ! grep -q "^src/\*\*/\*.js$" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Compiled TypeScript output (should not be in source)" >> .gitignore
  echo "src/**/*.js" >> .gitignore
  echo "!src/**/*.test.js" >> .gitignore
  echo "!src/**/*.config.js" >> .gitignore
  echo "✅ Added .js exclusion to .gitignore"
else
  echo "✅ .gitignore already has .js exclusion"
fi
echo ""

# 6. Show remaining issues
echo "📊 Remaining code quality issues:"
CONSOLE_COUNT=$(grep -r "console\.\(log\|error\|warn\|debug\)" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
ANY_COUNT=$(grep -r ":\s*any\s" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
TODO_COUNT=$(grep -ri "TODO\|FIXME" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')

echo "  - Console.log statements: $CONSOLE_COUNT"
echo "  - 'any' types: $ANY_COUNT"
echo "  - TODO/FIXME comments: $TODO_COUNT"
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Review CODE_CLEANUP_ANALYSIS.md for detailed recommendations"
echo "   2. Consider replacing console.log with Sentry logging"
echo "   3. Replace 'any' types with proper TypeScript types"
echo "   4. Review and resolve TODO/FIXME comments"
echo ""

