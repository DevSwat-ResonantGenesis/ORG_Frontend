#!/bin/bash
# Simple command to update dev-swat.com
# Run this on your Droplet

echo "🌐 Updating dev-swat.com..."

# Navigate to frontend folder
cd /root/frontend

# Pull latest changes
echo "📥 Pulling latest changes..."
git fetch origin main
git reset --hard origin/main
git pull origin main

# Build
echo "🏗️  Building..."
npm run build

# Restart services
echo "🔄 Restarting services..."
pm2 restart all
sudo systemctl restart nginx

echo ""
echo "✅ Website updated! Visit: https://dev-swat.com"
echo ""
echo "💡 If you still see old site:"
echo "   - Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "   - Or open in incognito/private window"

