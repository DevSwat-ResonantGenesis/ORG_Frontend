# 🔧 Fix Nginx API Proxy and SPA Routing

## Problem
- ✅ Frontend loads at `http://dev-swat.com`
- ❌ SPA routes return 404 (`/resonant-chat`)
- ❌ API calls return 404 (`/api/health`)

## Solution

### Step 1: Update nginx-spa.conf on Droplet

The `nginx-spa.conf` file needs the API proxy configuration. I've updated it locally - you need to:

**Option A: Copy from git (if you commit and push)**
```bash
cd /root/frontend
git pull origin main
```

**Option B: Edit manually on droplet**
```bash
cd /root/frontend
nano nginx-spa.conf
```

Add this section **BEFORE** the `location /` block:

```nginx
    # API proxy - forward /api requests to backend
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
```

### Step 2: Check How Nginx is Running

```bash
# Check if nginx container exists
docker ps | grep nginx

# Or check all containers
docker ps -a | grep nginx
```

### Step 3: Restart Nginx Container

**If nginx is running as a standalone container:**
```bash
# Find container name
NGINX_CONTAINER=$(docker ps --format '{{.Names}}' | grep nginx | head -1)

# Restart it
docker restart $NGINX_CONTAINER

# Or if you know the name:
docker restart <nginx-container-name>
```

**If nginx is managed by systemd or another method:**
```bash
# Check systemd
systemctl status nginx

# Restart if needed
systemctl restart nginx
```

### Step 4: Verify

```bash
# Test frontend
curl http://dev-swat.com

# Test SPA route (should return HTML, not 404)
curl http://dev-swat.com/resonant-chat

# Test API (should return JSON, not 404)
curl http://dev-swat.com/api/health
```

## Complete nginx-spa.conf Structure

The file should look like this:

```nginx
server {
    listen 80;
    server_name dev-swat.com www.dev-swat.com;

    root /usr/share/nginx/html;
    index index.html;

    # API proxy - forward /api requests to backend
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ... rest of config (cache, gzip, security headers) ...
}
```

