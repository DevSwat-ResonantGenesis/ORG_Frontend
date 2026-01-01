# 🚀 DigitalOcean Droplet Deployment Guide
## Step-by-Step Deployment Process

**Date:** 2025-01-29  
**Droplet:** dev-swat.com (137.184.234.252)

---

## 📋 Workflow Overview

### Step 1: Commit & Push from LOCAL Machine ✅
- Commit changes locally
- Push to GitHub

### Step 2: Pull on DROPLET 🔄
- SSH to droplet
- Pull latest changes
- Restart services

---

## 🔄 Complete Deployment Process

### PART 1: Local Machine (Your Computer)

#### 1.1 Commit and Push Frontend
```bash
cd /Applications/ResonantGraphAI_FrontendV0.1

# Check what changed
git status

# Add all changes
git add .

# Commit
git commit -m "feat: Deployment readiness - Complete analysis and preparation

- Complete deployment readiness analysis (100+ API endpoints)
- All dashboards functional (8 dashboards)
- ML services fully integrated (5 endpoints)
- Backend integration complete (Hash Sphere + RAG)
- Docker/Nginx configuration verified
- Security headers configured
- Deployment documentation added
- Menu styling unified across all pages
- Body scroll prevention when menu opens
- Input bar width matches messages in split view
- All API connections verified and tested"

# Push to GitHub
git push origin main
```

#### 1.2 Commit and Push Backend
```bash
cd /Applications/ResonantGraphAIV0.1

# Check what changed
git status

# Add all changes
git add .

# Commit
git commit -m "feat: Backend updates for deployment readiness

- All API endpoints ready for production
- Hash Sphere integration complete
- RAG fallback system active
- Code services operational (7 endpoints)
- ML services integrated (5 endpoints)
- Git integration ready (7 endpoints)
- LSP integration complete (4 endpoints)
- All endpoints tested and verified
- Deployment configuration ready"

# Push to GitHub
git push origin main
```

---

### PART 2: DigitalOcean Droplet

#### 2.1 SSH to Droplet
```bash
ssh root@137.184.234.252
```

#### 2.2 Find Frontend Directory
```bash
# Find frontend directory
find /root /home -type d -name "*Frontend*" -o -name "*frontend*" 2>/dev/null

# Or check common locations
ls -la /root/
ls -la /var/www/
ls -la /opt/
```

**Common locations:**
- `/root/ResonantGraphAI_FrontendV0.1/`
- `/var/www/frontend/`
- `/opt/frontend/`

#### 2.3 Pull Frontend Changes
```bash
# Navigate to frontend directory (update path as needed)
cd /root/ResonantGraphAI_FrontendV0.1

# Or if in different location:
# cd /var/www/frontend
# cd /opt/frontend

# Pull latest changes
git pull origin main

# If you need to reset (if there are conflicts):
# git fetch origin
# git reset --hard origin/main
```

#### 2.4 Rebuild Frontend (if needed)
```bash
# Install dependencies (if package.json changed)
npm install

# Build frontend
npm run build

# Or if using Docker:
docker compose build frontend
docker compose up -d frontend
```

#### 2.5 Find Backend Directory
```bash
# Find backend directory
find /root /home -type d -name "*ResonantGraph*" -o -name "*backend*" 2>/dev/null

# Or check common locations
ls -la /root/
```

**Common locations:**
- `/root/ResonantGraphAIV0.1/`
- `/root/backend/`

#### 2.6 Pull Backend Changes
```bash
# Navigate to backend directory (update path as needed)
cd /root/ResonantGraphAIV0.1

# Pull latest changes
git pull origin main

# If you need to reset (if there are conflicts):
# git fetch origin
# git reset --hard origin/main
```

#### 2.7 Restart Services
```bash
# If using Docker Compose (recommended)
cd /root/ResonantGraphAIV0.1
docker compose restart api
docker compose restart frontend

# Or restart all services
docker compose restart

# Or if services are separate:
# systemctl restart nginx
# systemctl restart backend-service
```

#### 2.8 Verify Deployment
```bash
# Check if services are running
docker compose ps

# Check frontend
curl http://localhost/

# Check backend health
curl http://localhost/api/health

# Check nginx logs
docker compose logs frontend -f

# Check backend logs
docker compose logs api -f
```

---

## 🔍 Finding Your Directories on Droplet

### Method 1: Find by Docker Compose
```bash
# Find docker-compose.yml files
find /root /home -name "docker-compose.yml" 2>/dev/null

# Check running containers
docker ps

# Get container working directory
docker inspect <container-name> | grep -i workingdir
```

### Method 2: Find by Git Repos
```bash
# Find all git repositories
find /root /home -type d -name ".git" 2>/dev/null | xargs dirname
```

### Method 3: Check Common Locations
```bash
# Check root directory
ls -la /root/

# Check www directory
ls -la /var/www/

# Check opt directory
ls -la /opt/
```

---

## 🐳 Docker Commands Reference

### Check Running Containers
```bash
docker ps
docker compose ps
```

### View Logs
```bash
# Frontend logs
docker compose logs frontend -f

# Backend logs
docker compose logs api -f

# All logs
docker compose logs -f
```

### Restart Services
```bash
# Restart specific service
docker compose restart frontend
docker compose restart api

# Restart all
docker compose restart

# Rebuild and restart
docker compose up -d --build
```

### Stop Services
```bash
docker compose stop
docker compose down
```

### Start Services
```bash
docker compose up -d
```

---

## 🔧 Troubleshooting

### Git Pull Fails (Merge Conflicts)
```bash
# Reset to remote (WARNING: loses local changes)
git fetch origin
git reset --hard origin/main

# Or stash local changes
git stash
git pull origin main
git stash pop
```

### Services Won't Start
```bash
# Check logs
docker compose logs

# Check disk space
df -h

# Check memory
free -h

# Restart Docker
systemctl restart docker
```

### Frontend Not Loading
```bash
# Check nginx
docker compose logs frontend

# Check if port 80 is open
netstat -tulpn | grep :80

# Test nginx config
docker compose exec frontend nginx -t
```

### Backend Not Responding
```bash
# Check backend logs
docker compose logs api

# Check if backend is running
curl http://localhost:8001/health

# Check database connection
docker compose exec api python -c "from db import get_session; print('DB OK')"
```

---

## 📋 Quick Deployment Script

Save this as `deploy-on-droplet.sh` on your droplet:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying to Droplet..."

# Frontend
echo "📦 Updating Frontend..."
cd /root/ResonantGraphAI_FrontendV0.1
git pull origin main
npm install
npm run build
docker compose restart frontend

# Backend
echo "📦 Updating Backend..."
cd /root/ResonantGraphAIV0.1
git pull origin main
docker compose restart api

echo "✅ Deployment complete!"
docker compose ps
```

Make it executable:
```bash
chmod +x deploy-on-droplet.sh
./deploy-on-droplet.sh
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads: `http://dev-swat.com`
- [ ] Backend health: `http://dev-swat.com/api/health`
- [ ] API endpoints work: `http://dev-swat.com/api/rag/memories`
- [ ] Authentication works: Login/logout
- [ ] Dashboards load: All 8 dashboards
- [ ] Resonant Chat works: Send message
- [ ] Hash Sphere works: Check anchors
- [ ] No errors in logs: `docker compose logs`

---

## 📞 Quick Reference

### Frontend Repo
- **GitHub:** `https://github.com/louienemesh/ResonantGraphAI_FrontendV0.1-.git`
- **Branch:** `main`

### Backend Repo
- **GitHub:** `https://github.com/louienemesh/ResonantGraphAIV0.1.git`
- **Branch:** `main`

### Droplet Info
- **IP:** `137.184.234.252`
- **Domain:** `dev-swat.com`
- **SSH:** `ssh root@137.184.234.252`

---

**Remember:** 
1. ✅ Commit & Push from **LOCAL** machine
2. ✅ SSH to droplet and **PULL** changes
3. ✅ Restart services

**DO NOT** commit/push from the droplet - always do it from your local machine!

