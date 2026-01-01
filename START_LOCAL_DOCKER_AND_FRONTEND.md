# Starting Local Docker and Frontend
_Complete Guide with Fixed Commands_

---

## **🚀 Quick Start: Backend in Docker + Frontend Locally**

To start the backend in Docker and frontend locally (recommended for development):

### **Prerequisites**
1. **Docker Desktop must be running** (check the Docker icon in your menu bar)
2. Backend repository located at `/Applications/ResonantGraphAIV0.1/`

### **Option 1: Using the Automated Script (Recommended)**

```bash
# Run the startup script
./start-backend-docker-frontend-local.sh
```

This script will:
1. ✅ Check if Docker is running
2. ✅ Start backend services in Docker (API, ML Worker, DB)
3. ✅ Start frontend development server locally
4. ✅ Verify everything is working

### **Option 2: Manual Steps**

#### **Step 1: Start Backend in Docker**

```bash
# Navigate to backend directory
cd /Applications/ResonantGraphAIV0.1

# Start Docker services
docker compose up -d

# Check status
docker compose ps

# View logs (optional)
docker compose logs -f api
```

The backend will be available at:
- **API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs
- **Health Check:** http://localhost:8001/health

#### **Step 2: Start Frontend Locally**

```bash
# Navigate to frontend directory
cd /Applications/ResonantGraphAI_FrontendV0.1

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

The frontend will be available at:
- **Frontend:** http://localhost:5175

### **Stopping Services**

```bash
# Stop frontend: Press Ctrl+C in the terminal running npm run dev

# Stop backend:
cd /Applications/ResonantGraphAIV0.1
docker compose down
```

---

## **Frontend (Development Mode)**

For local development without Docker:

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5175`.

---

## **Docker (Production-like Setup)**

To run the frontend in Docker using nginx:

### **Option 1: Using docker-compose (Recommended)**

```bash
# First, build the frontend (creates dist/ directory)
npm run build

# Then start Docker Compose
docker compose -f docker-compose.frontend.yml up -d
```

This will:
- Start an nginx container serving the built frontend from `dist/`
- Expose ports 80 (HTTP) and 443 (HTTPS)
- Mount the `dist/` directory and nginx config

### **Option 2: Using Dockerfile**

```bash
# Build the Docker image
docker build -t resonantgraph-frontend .

# Run the container
docker run -d -p 80:80 --name frontend resonantgraph-frontend
```

---

## **Quick Commands**

```bash
# Check if containers are running
docker ps

# View logs (follow mode)
docker compose -f docker-compose.frontend.yml logs -f

# View logs (last 100 lines)
docker compose -f docker-compose.frontend.yml logs --tail=100

# Stop containers
docker compose -f docker-compose.frontend.yml down

# Restart containers
docker compose -f docker-compose.frontend.yml restart

# Rebuild and restart
docker compose -f docker-compose.frontend.yml up -d --build
```

---

## **Common Issues & Solutions**

### Issue 1: Missing `dist/` directory
**Error:** `ERROR: for frontend  Cannot start service frontend: OCI runtime create failed`

**Solution:**
```bash
# Build the frontend first
npm run build
```

### Issue 2: Port 80/443 already in use
**Error:** `Error: bind: address already in use`

**Solution:**
```bash
# Check what's using the port
lsof -i :80
lsof -i :443

# Stop the conflicting service or change ports in docker-compose.frontend.yml
```

### Issue 3: Old containers conflicting
**Error:** Container name already exists

**Solution:**
```bash
# Remove old containers
docker ps -a | grep frontend | awk '{print $1}' | xargs docker rm -f

# Or use the cleanup script
./start-local.sh
```

---

## **Quick Start Script**

Use the provided startup script for automated setup:

```bash
# Make executable (if needed)
chmod +x start-local.sh

# Run it
./start-local.sh
```

This script will:
1. ✅ Clean up old containers
2. ✅ Install dependencies (if needed)
3. ✅ Build the frontend
4. ✅ Start Docker Compose
5. ✅ Verify everything is working

---

## **Verification**

After starting, verify the frontend is running:

```bash
# Check container status
docker compose -f docker-compose.frontend.yml ps

# Test the frontend
curl http://localhost/

# Or open in browser
open http://localhost/
```

---

## **Troubleshooting**

### View container logs
```bash
docker compose -f docker-compose.frontend.yml logs frontend
```

### Check nginx configuration
```bash
# Test nginx config inside container
docker compose -f docker-compose.frontend.yml exec frontend nginx -t
```

### Rebuild everything from scratch
```bash
# Stop and remove containers
docker compose -f docker-compose.frontend.yml down

# Remove old build
rm -rf dist/

# Rebuild frontend
npm run build

# Start fresh
docker compose -f docker-compose.frontend.yml up -d
```



