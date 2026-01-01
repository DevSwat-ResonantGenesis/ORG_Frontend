#!/bin/bash
# Check Nginx Configuration for SPA Routing

echo "🔍 Checking Nginx Configuration..."

# Show full nginx config
echo "📋 Full Nginx Configuration:"
docker exec frontend cat /etc/nginx/conf.d/default.conf

echo ""
echo "📋 Checking for SPA routing (try_files):"
docker exec frontend grep -A 3 "try_files" /etc/nginx/conf.d/default.conf

echo ""
echo "📋 Checking root directory:"
docker exec frontend grep "root" /etc/nginx/conf.d/default.conf

echo ""
echo "📋 Checking location blocks:"
docker exec frontend grep -A 5 "location" /etc/nginx/conf.d/default.conf

