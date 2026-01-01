# 🔧 Fix Nginx Container Issues

## Problem
- Container was created but port 80 is not listening
- `curl http://dev-swat.com` still fails

## Diagnostic Steps

### 1. Check Container Status

```bash
# Check if container is running
docker ps -a | grep frontend-nginx

# Check container logs
docker logs frontend-nginx

# Check container status
docker inspect frontend-nginx --format '{{.State.Status}}'
```

### 2. Check Port Binding

```bash
# Check what ports are exposed
docker port frontend-nginx

# Check if port 80 is listening
ss -tulpn | grep :80
```

### 3. Common Issues & Fixes

#### Issue 1: Container Not Running

```bash
# Start the container
docker start frontend-nginx

# Check status
docker ps | grep frontend-nginx
```

#### Issue 2: Port Already in Use

```bash
# Check what's using port 80
ss -tulpn | grep :80

# If something is using it, stop it first
# Then remove and recreate nginx container
docker stop frontend-nginx
docker rm frontend-nginx

# Recreate with port 80
docker run -d \
  --name frontend-nginx \
  --restart unless-stopped \
  -p 80:80 \
  -v /root/frontend/dist:/usr/share/nginx/html:ro \
  nginx:alpine
```

#### Issue 3: Volume Mount Issue

```bash
# Check if dist directory exists and has files
ls -la /root/frontend/dist/

# Check container can access files
docker exec frontend-nginx ls -la /usr/share/nginx/html/
```

#### Issue 4: Container Failed to Start

```bash
# Check logs for errors
docker logs frontend-nginx

# Remove and recreate
docker rm frontend-nginx
docker run -d \
  --name frontend-nginx \
  --restart unless-stopped \
  -p 80:80 \
  -v /root/frontend/dist:/usr/share/nginx/html:ro \
  nginx:alpine

# Check logs again
docker logs frontend-nginx
```

## Quick Fix Commands

```bash
# 1. Remove existing container
docker stop frontend-nginx 2>/dev/null
docker rm frontend-nginx 2>/dev/null

# 2. Check port 80 is free
ss -tulpn | grep :80

# 3. Recreate container
docker run -d \
  --name frontend-nginx \
  --restart unless-stopped \
  -p 80:80 \
  -v /root/frontend/dist:/usr/share/nginx/html:ro \
  nginx:alpine

# 4. Check it's running
docker ps | grep frontend-nginx

# 5. Check port 80
ss -tulpn | grep :80

# 6. Test
curl http://localhost/
curl http://dev-swat.com
```

## Alternative: Use Different Port

If port 80 is blocked, use port 8080:

```bash
docker run -d \
  --name frontend-nginx \
  --restart unless-stopped \
  -p 8080:80 \
  -v /root/frontend/dist:/usr/share/nginx/html:ro \
  nginx:alpine

# Test
curl http://dev-swat.com:8080
```

Then configure your reverse proxy or load balancer to forward port 80 to 8080.

