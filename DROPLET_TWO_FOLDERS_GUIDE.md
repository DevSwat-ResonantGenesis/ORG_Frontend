# 🚀 Droplet Deployment Guide - Two Separate Folders
## Frontend and Backend in Different Directories

**Date:** 2025-01-29  
**Droplet:** dev-swat.com (137.184.234.252)

---

## 📋 Overview

Your droplet has **TWO SEPARATE FOLDERS**:
1. **Frontend folder** - Contains frontend code
2. **Backend folder** - Contains backend code

This guide shows how to deploy to both separately.

---

## 🔍 Step 1: Find Your Folders on Droplet

### SSH to Droplet
```bash
ssh root@137.184.234.252
```

### Find Frontend Folder
```bash
# Method 1: Search for frontend
find /root /home /var/www /opt -type d -name "*Frontend*" -o -name "*frontend*" 2>/dev/null

# Method 2: Check common locations
ls -la /root/
ls -la /var/www/
ls -la /opt/

# Method 3: Find by git repo
find /root /home /var/www /opt -type d -name ".git" 2>/dev/null | xargs dirname | grep -i frontend
```

### Find Backend Folder
```bash
# Method 1: Search for backend
find /root /home /var/www /opt -type d -name "*ResonantGraph*" -o -name "*backend*" 2>/dev/null

# Method 2: Check common locations
ls -la /root/
ls -la /var/www/
ls -la /opt/

# Method 3: Find by git repo
find /root /home /var/www /opt -type d -name ".git" 2>/dev/null | xargs dirname | grep -i backend
```

### Find by Docker Containers
```bash
# Check running containers
docker ps

# Get container working directories
docker inspect <container-name> | grep -i workingdir
```

---

## 📝 Step 2: Update Deployment Script

### Edit the Script
```bash
nano /root/deploy-on-droplet.sh
```

### Set Your Folder Paths
```bash
# At the top of the script, set your actual paths:
FRONTEND_DIR="/root/your-frontend-folder"  # UPDATE THIS
BACKEND_DIR="/root/your-backend-folder"    # UPDATE THIS
```

**Example:**
```bash
FRONTEND_DIR="/root/ResonantGraphAI_FrontendV0.1"
BACKEND_DIR="/root/ResonantGraphAIV0.1"
```

---

## 🚀 Step 3: Deploy

### Option 1: Use the Script (Recommended)
```bash
# Make script executable
chmod +x /root/deploy-on-droplet.sh

# Run it
/root/deploy-on-droplet.sh
```

### Option 2: Manual Deployment

#### Deploy Frontend
```bash
# Navigate to frontend folder (UPDATE PATH)
cd /root/your-frontend-folder

# Pull latest changes
git pull origin main

# Install dependencies (if package.json changed)
npm install

# Build frontend
npm run build

# Restart frontend service
docker compose restart frontend
# OR
docker restart frontend-container-name
```

#### Deploy Backend
```bash
# Navigate to backend folder (UPDATE PATH)
cd /root/your-backend-folder

# Pull latest changes
git pull origin main

# Restart backend service
docker compose restart api
# OR
docker restart backend-container-name
```

---

## 🔧 Step 4: Restart Services

### If Using Docker Compose in Backend Folder
```bash
cd /root/your-backend-folder
docker compose restart api frontend
```

### If Using Docker Compose in Frontend Folder
```bash
cd /root/your-frontend-folder
docker compose restart frontend
```

### If Services are Separate
```bash
# Restart frontend container
docker restart frontend-container-name

# Restart backend container
docker restart backend-container-name
```

### If Using Systemd
```bash
systemctl restart frontend-service
systemctl restart backend-service
```

---

## ✅ Step 5: Verify Deployment

### Check Services
```bash
# Check running containers
docker ps

# Check frontend
curl http://localhost/

# Check backend health
curl http://localhost/api/health

# Check logs
docker compose logs -f
```

### Test Frontend
```bash
# Open in browser
http://dev-swat.com

# Or test with curl
curl -I http://dev-swat.com
```

### Test Backend
```bash
# Test API
curl http://dev-swat.com/api/health

# Test specific endpoint
curl http://dev-swat.com/api/rag/memories
```

---

## 📋 Quick Reference Commands

### Frontend Folder
```bash
# Navigate
cd /root/your-frontend-folder

# Pull changes
git pull origin main

# Build
npm install && npm run build

# Restart
docker compose restart frontend
```

### Backend Folder
```bash
# Navigate
cd /root/your-backend-folder

# Pull changes
git pull origin main

# Restart
docker compose restart api
```

---

## 🔍 Troubleshooting

### Frontend Folder Not Found
```bash
# Search for it
find /root /home /var/www /opt -type d -name "*Frontend*" 2>/dev/null

# Check git repos
find /root /home /var/www /opt -type d -name ".git" 2>/dev/null | xargs dirname
```

### Backend Folder Not Found
```bash
# Search for it
find /root /home /var/www /opt -type d -name "*ResonantGraph*" 2>/dev/null

# Check git repos
find /root /home /var/www /opt -type d -name ".git" 2>/dev/null | xargs dirname
```

### Git Pull Fails
```bash
# Reset to remote
git fetch origin
git reset --hard origin/main

# Or stash local changes
git stash
git pull origin main
git stash pop
```

### Services Won't Restart
```bash
# Check if containers exist
docker ps -a

# Check docker compose file
cat docker-compose.yml

# Restart Docker daemon
systemctl restart docker
```

---

## 📝 Example: Complete Deployment

```bash
# 1. SSH to droplet
ssh root@137.184.234.252

# 2. Deploy Frontend
cd /root/ResonantGraphAI_FrontendV0.1
git pull origin main
npm install
npm run build
docker compose restart frontend

# 3. Deploy Backend
cd /root/ResonantGraphAIV0.1
git pull origin main
docker compose restart api

# 4. Verify
docker ps
curl http://localhost/api/health
```

---

## 🎯 Summary

1. ✅ **Find your folders** on the droplet
2. ✅ **Update the script** with your folder paths
3. ✅ **Run the script** or deploy manually
4. ✅ **Restart services** in both folders
5. ✅ **Verify** everything works

**Remember:** 
- Frontend and backend are in **SEPARATE FOLDERS**
- Deploy to **BOTH** folders
- Restart services in **BOTH** folders

---

**Need Help?** Check the logs:
```bash
docker compose logs -f
```

