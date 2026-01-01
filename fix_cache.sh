#!/bin/bash
echo "=== Fixing Vite Cache Issue ==="
echo ""
echo "1. Clearing Vite cache..."
rm -rf node_modules/.vite dist .vite
echo "✅ Cache cleared"
echo ""
echo "2. Checking all rebuilt pages exist..."
ls -1 src/pages/Public/AboutPage.tsx \
     src/pages/Public/CareersPage.tsx \
     src/pages/Public/ContactPage.tsx \
     src/pages/Public/Legal/PrivacyPage.tsx \
     src/pages/Public/Legal/TermsPage.tsx \
     src/pages/Public/Legal/CompliancePage.tsx \
     src/pages/Help/HelpCenterPage.tsx 2>&1 | grep -v "cannot access" | wc -l | xargs echo "✅ Found files:"
echo ""
echo "3. Next steps:"
echo "   - Stop dev server (Ctrl+C)"
echo "   - Run: npm run dev"
echo "   - Hard refresh browser: Cmd+Shift+R"
