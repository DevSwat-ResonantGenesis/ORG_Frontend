#!/bin/bash
# Fix permissions for bind mount

cd /root/frontend

echo "🔐 Fixing permissions for bind mount..."

# Since nginx user doesn't exist on host, we need to make files readable by all
# The container's nginx user (UID might be different) needs to read them

# Make all files readable and directories executable
chmod -R 755 dist/
find dist/ -type f -exec chmod 644 {} \;
find dist/ -type d -exec chmod 755 {} \;

# Verify permissions
echo ""
echo "✅ Permissions fixed:"
ls -ld dist/
ls -ld dist/index.html
ls -ld dist/assets/

# Check if nginx in container can read
echo ""
echo "🧪 Testing if container nginx can read:"
docker exec frontend su -s /bin/sh nginx -c "head -1 /usr/share/nginx/html/index.html" 2>&1 && echo "✅ Nginx can read" || echo "⚠️ Nginx cannot read (checking permissions...)"

# Check actual permissions in container
echo ""
echo "📋 Permissions in container:"
docker exec frontend ls -ld /usr/share/nginx/html/
docker exec frontend ls -l /usr/share/nginx/html/index.html

# Check nginx user ID in container
echo ""
echo "👤 Nginx user in container:"
docker exec frontend id nginx

# If nginx can't read, make files world-readable
if ! docker exec frontend su -s /bin/sh nginx -c "test -r /usr/share/nginx/html/index.html" 2>/dev/null; then
    echo ""
    echo "🔧 Making files world-readable..."
    chmod -R a+r dist/
    find dist/ -type d -exec chmod a+x {} \;
fi

# Reload nginx
echo ""
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo ""
echo "✅ Done! Check https://dev-swat.com"

