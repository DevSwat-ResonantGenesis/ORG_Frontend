#!/bin/bash

# Quick Fix for Build Error - Remove force-all-fixes import
# Run this on the Droplet if build fails

cd /root/frontend

# Remove the problematic import line
sed -i '/force-all-fixes\.css/d' src/main.tsx

echo "✅ Removed force-all-fixes.css import"
echo "   Now run: npm run build"

