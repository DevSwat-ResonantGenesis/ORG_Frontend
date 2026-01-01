# 🔍 How to Find Your Folders on Droplet

## Quick Method

### Step 1: SSH to Droplet
```bash
ssh root@137.184.234.252
```

### Step 2: Run the Discovery Script
```bash
# Upload the script first (from your local machine):
# scp find-folders-on-droplet.sh root@137.184.234.252:/root/

# Then on droplet:
chmod +x /root/find-folders-on-droplet.sh
/root/find-folders-on-droplet.sh
```

## Manual Method

### Find Frontend Folder
```bash
# Method 1: Search by name
find /root /home /var/www /opt -type d -iname "*frontend*" 2>/dev/null

# Method 2: Find git repos
find /root /home /var/www /opt -type d -name ".git" 2>/dev/null | xargs dirname | grep -i frontend

# Method 3: Find by package.json
find /root /home /var/www /opt -name "package.json" -type f 2>/dev/null | xargs dirname

# Method 4: Check common locations
ls -la /root/
ls -la /var/www/
ls -la /opt/
```

### Find Backend Folder
```bash
# Method 1: Search by name
find /root /home /var/www /opt -type d -iname "*resonant*" -o -iname "*backend*" 2>/dev/null

# Method 2: Find git repos
find /root /home /var/www /opt -type d -name ".git" 2>/dev/null | xargs dirname | grep -iE "resonant|backend"

# Method 3: Find by docker-compose.yml
find /root /home /var/www /opt -name "docker-compose.yml" -type f 2>/dev/null | xargs dirname

# Method 4: Check common locations
ls -la /root/
ls -la /var/www/
ls -la /opt/
```

### Find by Docker Containers
```bash
# List all containers
docker ps

# Get working directory of each container
docker ps --format "{{.Names}}" | while read container; do
    echo "Container: $container"
    docker inspect "$container" --format 'Working Dir: {{.Config.Labels.com.docker.compose.project.working_dir}}'
    echo ""
done
```

## Common Locations

### Frontend Usually Located At:
- `/root/ResonantGraphAI_FrontendV0.1`
- `/root/frontend`
- `/var/www/frontend`
- `/opt/frontend`

### Backend Usually Located At:
- `/root/ResonantGraphAIV0.1`
- `/root/backend`
- `/var/www/backend`
- `/opt/backend`

## Quick Check Commands

```bash
# Check if folder exists and has git
[ -d "/root/ResonantGraphAI_FrontendV0.1" ] && echo "Frontend found!" || echo "Not found"
[ -d "/root/ResonantGraphAIV0.1" ] && echo "Backend found!" || echo "Not found"

# List all directories in /root
ls -la /root/ | grep "^d"

# Find all git repos
find /root -maxdepth 2 -type d -name ".git" 2>/dev/null | xargs dirname
```

## Once You Find Them

Update your deployment script:
```bash
nano /root/deploy-on-droplet.sh

# Set the paths:
FRONTEND_DIR="/root/your-actual-frontend-path"
BACKEND_DIR="/root/your-actual-backend-path"
```

