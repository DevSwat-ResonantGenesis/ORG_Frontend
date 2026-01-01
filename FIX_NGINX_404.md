# 🔧 Fix Nginx 404 Error

## Problem
- Frontend HTML is loading (you can see the React app structure)
- But getting 404 errors from nginx
- This is because nginx needs SPA routing configuration

## Solution: Update docker-compose.yml

The frontend container needs nginx config for SPA routing.

### Option 1: Use nginx config file (Recommended)

**On droplet:**

```bash
cd /root/ResonantGraphAIV0.1

# Create nginx config for SPA
cat > /root/frontend/nginx-spa.conf << 'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Don't cache index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Edit docker-compose.yml
nano docker-compose.yml
```

**Change frontend section to:**

```yaml
frontend:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - /root/frontend/dist:/usr/share/nginx/html:ro
    - /root/frontend/nginx-spa.conf:/etc/nginx/conf.d/default.conf:ro
  restart: unless-stopped
```

**Restart:**

```bash
docker compose up -d frontend
docker compose logs frontend
curl http://dev-swat.com
```

### Option 2: Quick fix with command

```bash
cd /root/ResonantGraphAIV0.1

# Create nginx config
cat > /tmp/nginx-spa.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Update docker-compose.yml to use the config
# Edit manually or use sed
nano docker-compose.yml
# Add volume: - /tmp/nginx-spa.conf:/etc/nginx/conf.d/default.conf:ro

# Restart
docker compose up -d frontend
```

## Quick One-Liner Fix

```bash
cd /root/ResonantGraphAIV0.1 && \
docker exec resonantgraphaiv01-frontend-1 sh -c 'echo "server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf && nginx -s reload' || \
echo "Container not running, need to update docker-compose.yml first"
```

## Verify

```bash
# Test root
curl http://dev-swat.com

# Test a route
curl http://dev-swat.com/resonant-chat

# Both should return HTML (not 404)
```

The key is adding `try_files $uri $uri/ /index.html;` to the nginx config for SPA routing!

