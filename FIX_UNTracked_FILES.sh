#!/bin/bash
# Fix untracked files conflict on droplet

echo "🔧 Fixing untracked files conflict..."

# Remove the conflicting untracked files
rm -f src/components/EmptyState.js
rm -f src/components/ErrorState.js
rm -f src/components/LoadingState.js
rm -f src/components/ResponsiveTable.js
rm -f src/components/Toast/Toast.js
rm -f src/components/Toast/ToastContainer.js
rm -f src/context/ToastContext.js
rm -f src/hooks/useKeyboardShortcuts.js
rm -f src/hooks/useToast.js
rm -f src/utils/apiConnectionTest.js
rm -f src/utils/buttonDiagnostics.js
rm -f src/utils/formValidation.js

echo "✅ Removed conflicting files"
echo "Now run: git pull origin main"

