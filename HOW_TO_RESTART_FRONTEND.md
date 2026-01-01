# 🔄 How to Restart Frontend on Droplet

## Problem
`docker compose restart frontend` fails because there's no `docker-compose.yml` in `/root/frontend`.

## Solutions

### Option 1: Find docker-compose.yml Location

```bash
# Find docker-compose.yml
find /root /home /var/www /opt -name "docker-compose.yml" 2>/dev/null

# Navigate to that directory and restart
cd /path/to/directory/with/docker-compose.yml
docker compose restart frontend
```

### Option 2: Find Frontend Container by Name

```bash
# List all containers
docker ps -a

# Find frontend container (might be named: frontend, nginx, web, etc.)
docker ps -a --format "{{.Names}}" | grep -iE "frontend|nginx|web"

# Restart it directly
docker restart <container-name>
```

### Option 3: Restart from Backend Directory

```bash
cd /root/ResonantGraphAIV0.1
docker compose restart frontend
```

### Option 4: Restart All Containers

```bash
# Restart all running containers
docker restart $(docker ps -q)
```

### Option 5: Use the Script

```bash
# Upload script
scp restart-frontend-on-droplet.sh root@137.184.234.252:/root/

# Run it
chmod +x /root/restart-frontend-on-droplet.sh
/root/restart-frontend-on-droplet.sh
```

## Quick Commands

```bash
# Find container
docker ps | grep -iE "frontend|nginx|web"

# Restart by name
docker restart <container-name>

# Or restart all
docker restart $(docker ps -q)
```

## Verify

```bash
# Check if frontend is running
docker ps

# Test frontend
curl http://localhost/
```

