#!/bin/bash
# Fix nginx http2 deprecation warning

echo "🔧 Fixing nginx http2 deprecation warning..."

# Fix the nginx config in the container
docker exec frontend sh -c 'sed -i "s/listen 443 ssl http2;/listen 443 ssl;\n    http2 on;/" /etc/nginx/conf.d/default.conf'

# Or if the file is in /root/frontend/nginx-ssl.conf, fix it there too
if [ -f "/root/frontend/nginx-ssl.conf" ]; then
    sed -i 's/listen 443 ssl http2;/listen 443 ssl;\n    http2 on;/' /root/frontend/nginx-ssl.conf
    echo "✅ Fixed nginx-ssl.conf"
fi

# Test nginx config
echo "🧪 Testing nginx configuration..."
docker exec frontend nginx -t

# Reload nginx
echo "🔄 Reloading nginx..."
docker exec frontend nginx -s reload

echo "✅ Nginx http2 warning fixed!"

