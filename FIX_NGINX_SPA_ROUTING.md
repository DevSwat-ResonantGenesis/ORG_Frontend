# 🔧 Fix Nginx SPA Routing (404 Errors)

## Problem
- Frontend HTML is loading
- But getting 404 errors for routes
- Nginx not configured for SPA (Single Page Application) routing

## Solution: Update docker-compose.yml

### Step 1: Copy nginx config to droplet

**On your local machine:**
```bash
scp nginx-spa.conf root@137.184.234.252:/root/frontend/
```

### Step 2: Update docker-compose.yml

**On droplet, edit docker-compose.yml:**

```bash
cd /root/ResonantGraphAIV0.1
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

**Save and restart:**

```bash
docker compose up -d frontend
docker compose logs frontend
```

## Alternative: Quick Fix Without Config File

**Edit docker-compose.yml and add command:**

```yaml
frontend:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - /root/frontend/dist:/usr/share/nginx/html:ro
  command: >
    sh -c "echo 'server {
      listen 80;
      root /usr/share/nginx/html;
      index index.html;
      location / {
        try_files $uri $uri/ /index.html;
      }
      location /api/ {
        proxy_pass http://api:8001/;
        proxy_set_header Host $host;
      }
    }' > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
  restart: unless-stopped
```

## Quick Fix Command

**On droplet:**

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
    location /api/ {
        proxy_pass http://api:8001/;
        proxy_set_header Host $host;
    }
}
EOF

# Update docker-compose.yml to use it
# (Edit manually or use sed)
nano docker-compose.yml
# Add volume: - /tmp/nginx-spa.conf:/etc/nginx/conf.d/default.conf:ro

# Restart
docker compose restart frontend
```

## Verify

```bash
# Check nginx config is loaded
docker exec resonantgraphaiv01-frontend-1 cat /etc/nginx/conf.d/default.conf

# Test
curl http://dev-swat.com
curl http://dev-swat.com/resonant-chat
```

The key is adding `try_files $uri $uri/ /index.html;` to handle SPA routing!

