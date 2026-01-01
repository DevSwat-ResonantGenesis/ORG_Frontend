# 🐳 Docker Architecture - Complete Guide

**Date:** 2025-12-01  
**Purpose:** Complete guide to understanding and modifying Docker setup for backend and frontend

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Backend Docker Setup](#backend-docker-setup)
3. [Frontend Docker Setup](#frontend-docker-setup)
4. [Nginx Configuration](#nginx-configuration)
5. [Network Architecture](#network-architecture)
6. [How to Modify Each Component](#how-to-modify-each-component)
7. [Deployment Workflow](#deployment-workflow)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### **Docker Architecture**

```
┌─────────────────────────────────────────────────────────┐
│  PRODUCTION (Droplet)                                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Frontend Container (nginx:alpine)                │  │
│  │  - Ports: 80, 443                                 │  │
│  │  - Serves: /usr/share/nginx/html (dist/)         │  │
│  │  - Proxies: /api/* → Backend                     │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│                          │ /api/* (proxy)               │
│                          ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Backend Containers (docker-compose)              │  │
│  │  ├── api (FastAPI) - Port 8001                   │  │
│  │  ├── ml-worker - Port 9000                       │  │
│  │  └── db (PostgreSQL) - Port 5433                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Backend Docker Setup

### **Location**
- **File:** `/Applications/ResonantGraphAIV0.1/docker-compose.yml`
- **Directory:** `/Applications/ResonantGraphAIV0.1/`

### **Services**

#### **1. Database (db)**
```yaml
db:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: resonant
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
  volumes:
    - db-data:/var/lib/postgresql/data
  ports:
    - "5433:5432"  # External: 5433, Internal: 5432
```

**To change:**
- Port: Change `"5433:5432"` to different external port
- Database name: Change `POSTGRES_DB: resonant`
- Credentials: Change `POSTGRES_USER` and `POSTGRES_PASSWORD`

#### **2. ML Worker (ml-worker)**
```yaml
ml-worker:
  build:
    context: .
    dockerfile: ml/worker/Dockerfile
  environment:
    ML_REGISTRY_DATABASE_URL: postgresql+psycopg://postgres:postgres@db:5432/ml_registry
    ML_SERVICE_URL: http://ml-worker:9000
  depends_on:
    - db
  ports:
    - "9000:9000"
```

**To change:**
- Port: Change `"9000:9000"`
- Dockerfile: Change `dockerfile: ml/worker/Dockerfile`
- Environment variables: Add/modify in `environment:` section

#### **3. API (api)**
```yaml
api:
  build:
    context: .
    dockerfile: backend/fastapi_app/Dockerfile
  environment:
    DATABASE_URL: postgresql+psycopg://postgres:postgres@db:5432/resonant
    ML_SERVICE_URL: http://ml-worker:9000
  env_file:
    - .env
  depends_on:
    - db
    - ml-worker
  ports:
    - "8001:8000"  # External: 8001, Internal: 8000
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro  # For code execution
```

**To change:**
- Port: Change `"8001:8000"` (external:internal)
- Dockerfile: Change `dockerfile: backend/fastapi_app/Dockerfile`
- Environment: Modify `environment:` or `.env` file

### **Backend Docker Commands**

**Start all services:**
```bash
cd /Applications/ResonantGraphAIV0.1
docker compose up -d
```

**Start specific service:**
```bash
docker compose up -d api
docker compose up -d ml-worker
docker compose up -d db
```

**Restart service:**
```bash
docker compose restart api
```

**View logs:**
```bash
docker compose logs api -f
docker compose logs ml-worker -f
docker compose logs db -f
```

**Stop services:**
```bash
docker compose down
```

**Rebuild and restart:**
```bash
docker compose up -d --build
```

---

## 🎨 Frontend Docker Setup

### **Files**

1. **Dockerfile** (Development)
   - **Location:** `/Applications/ResonantGraphAI_FrontendV0.1/Dockerfile`
   - **Purpose:** Simple build and serve

2. **Dockerfile.prod** (Production)
   - **Location:** `/Applications/ResonantGraphAI_FrontendV0.1/Dockerfile.prod`
   - **Purpose:** Multi-stage build with nginx

3. **docker-compose.frontend.yml**
   - **Location:** `/Applications/ResonantGraphAI_FrontendV0.1/docker-compose.frontend.yml`
   - **Purpose:** Frontend container orchestration

### **Dockerfile.prod (Production)**

**Structure:**
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=/api
ARG VITE_FASTAPI_URL=/api
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FASTAPI_URL=$VITE_FASTAPI_URL
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["sh", "-c", "nginx -g 'daemon off;'"]
```

**To change:**
- Node version: Change `node:20-alpine` to `node:18-alpine`
- Build args: Modify `ARG VITE_API_URL=/api`
- Nginx config: Change `COPY nginx.conf ...`

### **docker-compose.frontend.yml**

**Structure:**
```yaml
services:
  frontend:
    image: nginx:alpine
    container_name: frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./dist:/usr/share/nginx/html
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    networks:
      - frontend-network
    healthcheck:
      test: ["CMD", "sh", "-c", "ps aux | grep -q '[n]ginx' || exit 1"]
```

**To change:**
- Ports: Change `"80:80"` or `"443:443"`
- Volume mounts: Modify paths in `volumes:`
- Health check: Change test command

### **Frontend Docker Commands**

**Build production image:**
```bash
cd /Applications/ResonantGraphAI_FrontendV0.1
docker build -f Dockerfile.prod -t frontend:latest \
  --build-arg VITE_API_URL="/api" \
  --build-arg VITE_FASTAPI_URL="/api" \
  .
```

**Run with docker-compose:**
```bash
docker compose -f docker-compose.frontend.yml up -d
```

**Copy files to running container:**
```bash
# Build first
npm run build

# Copy to container
docker exec frontend rm -rf /usr/share/nginx/html/*
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload
```

**View logs:**
```bash
docker logs frontend -f
```

---

## 🌐 Nginx Configuration

### **File Locations**

1. **Main Config:** `nginx/nginx.conf` - Main nginx config
2. **Site Config:** `nginx/conf.d/default.conf` - Site-specific config
3. **SSL Config:** `nginx-ssl.conf` - SSL/HTTPS configuration
4. **SPA Config:** `nginx-spa.conf` - SPA routing configuration

### **nginx/conf.d/default.conf (Production)**

**Key Sections:**

#### **1. HTTP → HTTPS Redirect**
```nginx
server {
    listen 80;
    server_name dev-swat.com www.dev-swat.com;
    
    location /.well-known/acme-challenge/ {
        root /usr/share/nginx/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}
```

**To change:**
- Server name: Change `dev-swat.com`
- Redirect: Modify redirect URL

#### **2. HTTPS Server**
```nginx
server {
    listen 443 ssl http2;
    server_name dev-swat.com www.dev-swat.com;
    
    ssl_certificate /etc/letsencrypt/live/dev-swat.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev-swat.com/privkey.pem;
    
    root /usr/share/nginx/html;
    index index.html;
}
```

**To change:**
- SSL certificate paths: Modify `ssl_certificate` paths
- Server name: Change `dev-swat.com`

#### **3. API Proxy (Critical)**
```nginx
location /api/ {
    # Strip /api prefix and forward to backend
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://137.184.234.252:8001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**To change:**
- Backend URL: Change `http://137.184.234.252:8001`
- Prefix stripping: Modify `rewrite ^/api/(.*)$ /$1 break;`
- Headers: Add/modify `proxy_set_header` lines

#### **4. SPA Routing**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**To change:**
- Fallback: Modify `/index.html` path
- Routing logic: Change `try_files` directive

#### **5. Static Asset Caching**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

**To change:**
- Cache duration: Change `expires 1y`
- Cache headers: Modify `Cache-Control` value

### **Nginx Commands**

**Test configuration:**
```bash
docker exec frontend nginx -t
```

**Reload nginx:**
```bash
docker exec frontend nginx -s reload
```

**Restart nginx:**
```bash
docker exec frontend nginx -s restart
```

**View nginx logs:**
```bash
docker exec frontend tail -f /var/log/nginx/error.log
docker exec frontend tail -f /var/log/nginx/access.log
```

---

## 🔗 Network Architecture

### **Request Flow**

```
User Browser
    ↓
https://dev-swat.com/api/auth/login
    ↓
Nginx (Frontend Container)
    ↓
Strips /api prefix → /auth/login
    ↓
proxy_pass http://137.184.234.252:8001
    ↓
Backend API Container (Port 8001)
    ↓
FastAPI Application
    ↓
Response → Nginx → Browser
```

### **Port Mapping**

| Service | Container Port | Host Port | Access |
|---------|---------------|-----------|--------|
| **Frontend** | 80, 443 | 80, 443 | `https://dev-swat.com` |
| **Backend API** | 8000 | 8001 | `http://localhost:8001` |
| **ML Worker** | 9000 | 9000 | `http://localhost:9000` |
| **Database** | 5432 | 5433 | `localhost:5433` |

### **Internal Docker Network**

**Backend Services:**
- `api` → `db:5432` (internal)
- `api` → `ml-worker:9000` (internal)
- `ml-worker` → `db:5432` (internal)

**Frontend → Backend:**
- `frontend` → `137.184.234.252:8001` (external IP)

---

## 🔧 How to Modify Each Component

### **1. Change Backend Port**

**File:** `/Applications/ResonantGraphAIV0.1/docker-compose.yml`

```yaml
# Find this:
api:
  ports:
    - "8001:8000"

# Change to:
api:
  ports:
    - "8002:8000"  # New external port
```

**Also update nginx:**
```nginx
# In nginx/conf.d/default.conf
proxy_pass http://137.184.234.252:8002;  # Match new port
```

### **2. Change Frontend Port**

**File:** `docker-compose.frontend.yml`

```yaml
# Find this:
ports:
  - "80:80"
  - "443:443"

# Change to:
ports:
  - "8080:80"
  - "8443:443"
```

### **3. Change API Proxy Path**

**File:** `nginx/conf.d/default.conf`

```nginx
# Current: /api/* → backend
location /api/ {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_pass http://137.184.234.252:8001;
}

# Change to: /backend/* → backend
location /backend/ {
    rewrite ^/backend/(.*)$ /$1 break;
    proxy_pass http://137.184.234.252:8001;
}
```

**Also update frontend:**
```typescript
// In src/utils/apiUrl.ts or .env
VITE_API_URL=/backend  // Match new path
```

### **4. Change Database Port**

**File:** `/Applications/ResonantGraphAIV0.1/docker-compose.yml`

```yaml
# Find this:
db:
  ports:
    - "5433:5432"

# Change to:
db:
  ports:
    - "5434:5432"  # New external port
```

**Update connection strings:**
```bash
# In .env file
DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/resonant
# Internal port stays 5432, only external changes
```

### **5. Change SSL Certificate Path**

**File:** `nginx/conf.d/default.conf`

```nginx
# Find this:
ssl_certificate /etc/letsencrypt/live/dev-swat.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/dev-swat.com/privkey.pem;

# Change to:
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

### **6. Change Backend URL in Nginx**

**File:** `nginx/conf.d/default.conf`

```nginx
# Find this:
proxy_pass http://137.184.234.252:8001;

# Change to:
proxy_pass http://localhost:8001;  # If on same host
# Or
proxy_pass http://backend-api:8001;  # If using Docker network
```

### **7. Modify Build Arguments**

**File:** `Dockerfile.prod`

```dockerfile
# Find this:
ARG VITE_API_URL=/api
ARG VITE_FASTAPI_URL=/api

# Change to:
ARG VITE_API_URL=/backend
ARG VITE_FASTAPI_URL=/backend
```

**Build with new args:**
```bash
docker build -f Dockerfile.prod -t frontend:latest \
  --build-arg VITE_API_URL="/backend" \
  --build-arg VITE_FASTAPI_URL="/backend" \
  .
```

---

## 🚀 Deployment Workflow

### **Frontend Deployment**

**Step 1: Build**
```bash
cd /Applications/ResonantGraphAI_FrontendV0.1
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
npm run build
```

**Step 2: Copy to Container**
```bash
docker exec frontend rm -rf /usr/share/nginx/html/*
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload
```

**Or rebuild container:**
```bash
docker build -f Dockerfile.prod -t frontend:latest .
docker stop frontend
docker rm frontend
docker run -d --name frontend -p 80:80 -p 443:443 \
  -v ./dist:/usr/share/nginx/html \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  -v ./nginx/conf.d:/etc/nginx/conf.d:ro \
  frontend:latest
```

### **Backend Deployment**

**Step 1: Pull Latest Code**
```bash
cd /Applications/ResonantGraphAIV0.1
git pull origin main
```

**Step 2: Restart Services**
```bash
docker compose restart api
# Or rebuild
docker compose up -d --build api
```

**Step 3: Check Status**
```bash
docker compose ps
curl http://localhost:8001/health
```

---

## 🔍 Troubleshooting

### **1. Frontend Not Loading**

**Check container:**
```bash
docker ps | grep frontend
docker logs frontend
```

**Check nginx:**
```bash
docker exec frontend nginx -t
docker exec frontend nginx -s reload
```

**Check files:**
```bash
docker exec frontend ls -la /usr/share/nginx/html
```

### **2. API Proxy Not Working**

**Check nginx config:**
```bash
docker exec frontend cat /etc/nginx/conf.d/default.conf | grep -A 10 "location /api"
```

**Test proxy:**
```bash
curl -v https://dev-swat.com/api/health
```

**Check backend:**
```bash
curl http://localhost:8001/health
```

**Fix: Update proxy_pass URL in nginx config**

### **3. Backend Not Responding**

**Check containers:**
```bash
cd /Applications/ResonantGraphAIV0.1
docker compose ps
```

**Check logs:**
```bash
docker compose logs api
docker compose logs db
```

**Restart:**
```bash
docker compose restart api
```

### **4. Database Connection Issues**

**Check database:**
```bash
docker compose ps db
docker compose logs db
```

**Test connection:**
```bash
docker exec -it resonantgraphaiv01-db-1 psql -U postgres -d resonant
```

**Check environment:**
```bash
docker compose exec api env | grep DATABASE_URL
```

### **5. SSL Certificate Issues**

**Check certificate:**
```bash
ls -la /etc/letsencrypt/live/dev-swat.com/
```

**Copy to container:**
```bash
docker cp /etc/letsencrypt/live/dev-swat.com/fullchain.pem \
  frontend:/etc/letsencrypt/live/dev-swat.com/fullchain.pem
docker cp /etc/letsencrypt/live/dev-swat.com/privkey.pem \
  frontend:/etc/letsencrypt/live/dev-swat.com/privkey.pem
```

**Reload nginx:**
```bash
docker exec frontend nginx -s reload
```

---

## 📁 File Locations Summary

| Component | File | Location |
|-----------|------|----------|
| **Backend docker-compose** | docker-compose.yml | `/Applications/ResonantGraphAIV0.1/` |
| **Frontend docker-compose** | docker-compose.frontend.yml | `/Applications/ResonantGraphAI_FrontendV0.1/` |
| **Frontend Dockerfile** | Dockerfile | `/Applications/ResonantGraphAI_FrontendV0.1/` |
| **Production Dockerfile** | Dockerfile.prod | `/Applications/ResonantGraphAI_FrontendV0.1/` |
| **Nginx main config** | nginx/nginx.conf | `/Applications/ResonantGraphAI_FrontendV0.1/nginx/` |
| **Nginx site config** | nginx/conf.d/default.conf | `/Applications/ResonantGraphAI_FrontendV0.1/nginx/conf.d/` |
| **Nginx SSL config** | nginx-ssl.conf | `/Applications/ResonantGraphAI_FrontendV0.1/` |

---

## 🎯 Quick Reference: Common Changes

| What to Change | File | Location |
|----------------|------|----------|
| **Backend port** | docker-compose.yml | `ports: "8001:8000"` |
| **Frontend port** | docker-compose.frontend.yml | `ports: "80:80"` |
| **API proxy URL** | nginx/conf.d/default.conf | `proxy_pass http://...` |
| **API proxy path** | nginx/conf.d/default.conf | `location /api/` |
| **Database port** | docker-compose.yml | `ports: "5433:5432"` |
| **SSL certificate** | nginx/conf.d/default.conf | `ssl_certificate` |
| **Build args** | Dockerfile.prod | `ARG VITE_API_URL` |
| **Environment vars** | .env (backend) | Various `ENV` variables |

---

## ⚠️ Important Notes

1. **Port Conflicts:** Backend uses 8001 (not 8000) to avoid conflicts
2. **Database Port:** Uses 5433 (not 5432) to avoid conflicts
3. **API Proxy:** Nginx strips `/api` prefix before forwarding to backend
4. **SSL Certificates:** Must be on host at `/etc/letsencrypt/`
5. **Volume Mounts:** Frontend uses `docker cp` for updates (not direct mounts)
6. **Docker Socket:** Backend API mounts Docker socket for code execution
7. **Network:** Frontend and backend are on separate Docker networks

---

## 🚀 Quick Commands Reference

### **Backend**
```bash
# Start
cd /Applications/ResonantGraphAIV0.1 && docker compose up -d

# Restart
docker compose restart api

# Logs
docker compose logs api -f

# Stop
docker compose down
```

### **Frontend**
```bash
# Build and copy
cd /Applications/ResonantGraphAI_FrontendV0.1
npm run build
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload

# Logs
docker logs frontend -f

# Test nginx
docker exec frontend nginx -t
```

---

**End of Guide** 🎉

