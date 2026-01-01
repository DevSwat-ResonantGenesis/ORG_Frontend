# 🔧 Troubleshoot Frontend Connection Issues

## Problem
- Frontend container restarted successfully
- But `curl http://dev-swat.com` fails with "Connection refused"
- No frontend container visible in `docker ps`

## Diagnosis Steps

### 1. Check if Frontend Container Exists

```bash
# Check all containers (including stopped)
docker ps -a | grep frontend

# Check if frontend service is defined
cd /root/ResonantGraphAIV0.1
docker compose ps
```

### 2. Check docker-compose.yml

```bash
cd /root/ResonantGraphAIV0.1
cat docker-compose.yml | grep -A 20 frontend
```

### 3. Check Nginx/Web Server

```bash
# Check if nginx is running
docker ps | grep nginx

# Or check system nginx
systemctl status nginx

# Check port 80
netstat -tulpn | grep :80
```

### 4. Check Frontend Service Status

```bash
cd /root/ResonantGraphAIV0.1
docker compose ps frontend
docker compose logs frontend
```

## Solutions

### Solution 1: Start Frontend Service

```bash
cd /root/ResonantGraphAIV0.1
docker compose up -d frontend
```

### Solution 2: Check if Frontend is Defined in docker-compose.yml

```bash
cd /root/ResonantGraphAIV0.1
grep -i frontend docker-compose.yml
```

If frontend is not defined, you might need to:
- Add frontend service to docker-compose.yml
- Or use nginx directly to serve the built files

### Solution 3: Serve Frontend with Nginx Directly

If frontend container doesn't exist, serve the built files with nginx:

```bash
# Check if nginx is installed
which nginx

# Or check docker nginx
docker ps | grep nginx

# If nginx exists, configure it to serve /root/frontend/dist
```

### Solution 4: Check Frontend Build Output

```bash
# Verify build output exists
ls -la /root/frontend/dist/

# Check if index.html exists
ls -la /root/frontend/dist/index.html
```

## Quick Diagnostic Commands

```bash
# 1. Check all containers
docker ps -a

# 2. Check compose services
cd /root/ResonantGraphAIV0.1
docker compose ps

# 3. Check frontend logs
docker compose logs frontend

# 4. Check what's listening on port 80
netstat -tulpn | grep :80
lsof -i :80

# 5. Check nginx
systemctl status nginx
docker ps | grep nginx
```

## Most Likely Issues

1. **Frontend service not defined in docker-compose.yml** - Need to add it
2. **Nginx not running** - Need to start nginx
3. **Port 80 not exposed** - Check port mapping
4. **Frontend container not started** - Need to start it

Run these commands and share the output!

