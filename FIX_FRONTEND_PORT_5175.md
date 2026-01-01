# 🔧 Fix Frontend Port 5175 Connection

## Problem
- Frontend container started successfully
- But `curl http://dev-swat.com:5175` fails with "Connection refused"

## Diagnostic Steps

### 1. Check Container Status

```bash
cd /root/ResonantGraphAIV0.1

# Check if container is actually running
docker compose ps frontend

# Check all containers
docker ps | grep frontend

# Check container logs for errors
docker compose logs frontend
```

### 2. Check Port Mapping

```bash
# Check what ports the container is exposing
docker port resonantgraphaiv01-frontend-1

# Check what's listening on port 5175
ss -tulpn | grep :5175
```

### 3. Common Issues

#### Issue 1: Container Started But Immediately Stopped

```bash
# Check logs for why it stopped
docker compose logs frontend

# Check container status
docker ps -a | grep frontend
```

#### Issue 2: Port Not Mapped Correctly

```bash
# Check docker-compose.yml port mapping
grep -A 5 "ports:" docker-compose.yml | grep frontend -A 5

# Verify it says "5175:80"
```

#### Issue 3: Nginx Inside Container Not Starting

```bash
# Check container logs
docker compose logs frontend

# Common errors:
# - Missing dist files
# - Nginx config error
# - Permission issues
```

#### Issue 4: Firewall Blocking Port

```bash
# Check firewall
ufw status
iptables -L | grep 5175

# If firewall is active, allow port 5175
ufw allow 5175
```

## Quick Fixes

### Fix 1: Check and Restart Container

```bash
cd /root/ResonantGraphAIV0.1

# Check status
docker compose ps frontend

# If stopped, check logs
docker compose logs frontend

# Restart
docker compose restart frontend

# Wait a moment, then check
sleep 3
docker compose ps frontend
ss -tulpn | grep :5175
```

### Fix 2: Rebuild Frontend Container

```bash
cd /root/ResonantGraphAIV0.1

# Rebuild and restart
docker compose up -d --build frontend

# Check logs
docker compose logs frontend
```

### Fix 3: Check Frontend Dockerfile

```bash
# Check if Dockerfile exists and is correct
cat /root/frontend/Dockerfile

# Check if dist directory has files
ls -la /root/frontend/dist/
```

## Most Likely Issues

1. **Container crashed** - Check logs: `docker compose logs frontend`
2. **Port not mapped** - Verify docker-compose.yml
3. **Nginx not starting** - Check container logs
4. **Missing dist files** - Verify `/root/frontend/dist/` exists

## Quick Diagnostic Command

```bash
cd /root/ResonantGraphAIV0.1 && \
echo "=== Container Status ===" && \
docker compose ps frontend && \
echo "" && \
echo "=== Container Logs ===" && \
docker compose logs frontend --tail 20 && \
echo "" && \
echo "=== Port Status ===" && \
ss -tulpn | grep -E ":(80|5175)" && \
echo "" && \
echo "=== Frontend Build ===" && \
ls -la /root/frontend/dist/ | head -5
```

Run this diagnostic and share the output!

