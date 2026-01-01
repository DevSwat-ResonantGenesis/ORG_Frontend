# 🔧 Fix Frontend Connection Issues

## Problems Found

1. ❌ **No frontend container running** - Only api, db, ml-worker are running
2. ❌ **Nginx failing** - Can't bind to port 80/443 (something else is using them)
3. ✅ **Frontend build exists** - `/root/frontend/dist/` has files

## Solutions

### Solution 1: Check What's Using Port 80

```bash
# Install net-tools if needed
apt install net-tools

# Check what's using port 80
netstat -tulpn | grep :80
# OR
lsof -i :80
# OR
ss -tulpn | grep :80
```

### Solution 2: Start Frontend Container

```bash
cd /root/ResonantGraphAIV0.1

# Check if frontend service exists
grep -A 10 "frontend:" docker-compose.yml

# If it exists, start it
docker compose up -d frontend

# Check status
docker compose ps frontend
```

### Solution 3: If Frontend Service Doesn't Exist

You need to either:

**Option A: Add frontend to docker-compose.yml**
```yaml
frontend:
  build:
    context: /root/frontend
    dockerfile: Dockerfile
  ports:
    - "80:80"
  volumes:
    - /root/frontend/dist:/usr/share/nginx/html
```

**Option B: Use Nginx to Serve Static Files**

```bash
# Stop system nginx (it's failing anyway)
systemctl stop nginx
systemctl disable nginx

# Run nginx in docker to serve frontend
docker run -d \
  --name frontend-nginx \
  -p 80:80 \
  -v /root/frontend/dist:/usr/share/nginx/html:ro \
  nginx:alpine
```

### Solution 4: Quick Fix - Serve with Docker Nginx

```bash
# Stop system nginx
systemctl stop nginx

# Run nginx container to serve frontend
docker run -d \
  --name frontend-nginx \
  --restart unless-stopped \
  -p 80:80 \
  -v /root/frontend/dist:/usr/share/nginx/html:ro \
  nginx:alpine

# Test
curl http://localhost/
```

## Quick Diagnostic

```bash
# 1. Check what's using port 80
ss -tulpn | grep :80

# 2. Check docker-compose services
cd /root/ResonantGraphAIV0.1
docker compose config --services

# 3. Check if frontend is defined
grep -A 20 "frontend:" docker-compose.yml

# 4. Check frontend build
ls -la /root/frontend/dist/
```

## Most Likely Fix

Since nginx is failing and frontend container doesn't exist, the quickest fix is:

```bash
# Stop system nginx
systemctl stop nginx
systemctl disable nginx

# Serve frontend with docker nginx
docker run -d \
  --name frontend-nginx \
  --restart unless-stopped \
  -p 80:80 \
  -v /root/frontend/dist:/usr/share/nginx/html:ro \
  nginx:alpine

# Test
curl http://dev-swat.com
```

Run the diagnostic script or try the quick fix above!

