# 🔐 Current Setup & Credentials Summary

**Date:** 2025-01-30  
**Status:** ✅ Backend Running | ✅ Frontend Running | 🔧 Fixing Connections

---

## 📍 **Folder Locations**

### **Local Development**
- **Frontend:** `/Applications/ResonantGraphAI_FrontendV0.1`
- **Backend:** `/Applications/ResonantGraphAIV0.1`

### **Production (Droplet)**
- **Frontend:** `/root/ResonantGraphAI_FrontendV0.1` (or similar)
- **Backend:** `/root/ResonantGraphAIV0.1` (or similar)

### **Git Repositories**
- **Frontend Repo:** `louienemesh/ResonantGraphAI_FrontendV0.1`
- **Backend Repo:** `louienemesh/ResonantGenesis_Graph` (likely)

---

## 🐳 **Docker Setup (Backend)**

### **Running Containers**
- **API Container:** `resonantgraphaiv01-api-1` → Port `8001` (mapped from 8000)
- **ML Worker:** `resonantgraphaiv01-ml-worker-1` → Port `9000`
- **Database:** `resonantgraphaiv01-db-1` → Port `5433` (mapped from 5432)

### **Docker Compose File**
- Location: `/Applications/ResonantGraphAIV0.1/docker-compose.yml`

### **Health Check**
- ✅ Backend API: `http://localhost:8001/health` → Returns `{"status":"ok"}`

---

## 🗄️ **Database Configuration**

### **Two Databases in Docker PostgreSQL:**

1. **Main Database (`resonant`)**
   - **Purpose:** Main application database
   - **Connection:** `postgresql+psycopg://postgres:postgres@db:5432/resonant`
   - **Environment Variable:** `DATABASE_URL`
   - **Used By:** FastAPI backend (api container)

2. **ML Registry Database (`ml_registry`)**
   - **Purpose:** ML worker registry and model storage
   - **Connection:** `postgresql+psycopg://postgres:postgres@db:5432/ml_registry`
   - **Environment Variable:** `ML_REGISTRY_DATABASE_URL`
   - **Used By:** ML worker container

### **Database Credentials (Docker)**
- **Host:** `db` (internal Docker network) or `localhost:5433` (external)
- **User:** `postgres`
- **Password:** `postgres`
- **Port (External):** `5433` (to avoid conflict with local PostgreSQL)

### **DigitalOcean Databases**
- **Two separate managed databases on DigitalOcean**
- **Need to find credentials** (check DigitalOcean dashboard or .env files)

---

## 🔑 **Environment Variables & Credentials**

### **Backend `.env` File Location**
- `/Applications/ResonantGraphAIV0.1/.env`

### **Found Credentials (from .env):**
- ✅ `DATABASE_URL` - Main database connection
- ✅ `ML_REGISTRY_DATABASE_URL` - ML registry database
- ✅ `JWT_SECRET` - JWT token secret
- ✅ `API_KEY_SALT` - API key salt
- ✅ `ML_INTERNAL_API_KEY` - ML service internal key
- ✅ `FASTAPI_CORS_ORIGINS` - CORS allowed origins
- ✅ `OPENAI_API_KEY` - OpenAI API key
- ✅ `GOOGLE_API_KEY` - Google API key
- ✅ `GEMINI_API_KEY` - Gemini API key
- ✅ `GROQ_API_KEY` - Groq API key

### **Frontend Environment Variables**
- **Location:** `/Applications/ResonantGraphAI_FrontendV0.1/.env.local` (if exists)
- **Example:** `env.example` shows:
  - `VITE_FASTAPI_URL=http://localhost:8001`
  - `VITE_STRIPE_TEAM_PRICE_ID`
  - `VITE_STRIPE_ENTERPRISE_PRICE_ID`
  - `VITE_SENTRY_DSN` (optional)

---

## 🌐 **Network Configuration**

### **Local Development**
- **Frontend:** `http://localhost:5175`
- **Backend API:** `http://localhost:8001`
- **Backend Docs:** `http://localhost:8001/docs`
- **ML Worker:** `http://localhost:9000`

### **Production (Droplet)**
- **Domain:** `dev-swat.com`
- **Backend Direct:** `http://137.184.234.252:8001`
- **Backend Proxied:** `https://dev-swat.com/api`
- **Frontend:** `https://dev-swat.com`

---

## 📊 **Current Status**

### **✅ What's Working**
- ✅ Backend Docker containers running
- ✅ Backend health endpoint responding
- ✅ Frontend dev server running on port 5175
- ✅ Database containers running
- ✅ ML worker container running

### **🔧 What Needs Fixing**
- ⚠️ Frontend-Backend connection (API endpoints)
- ⚠️ Missing API endpoint implementations
- ⚠️ Missing logic in frontend/backend
- ⚠️ Need to verify DigitalOcean database credentials

---

## 🚀 **Next Steps**

1. **Test API Connection** - Verify frontend can reach backend
2. **Check Missing Endpoints** - Identify which API endpoints are missing
3. **Fix Endpoints One by One** - Implement missing endpoints
4. **Test Each Feature** - Verify each feature works end-to-end
5. **Deploy to Droplet** - Once local is fully functional

---

## 📝 **Important Notes**

- **Frontend Git:** Clean (all changes committed)
- **Backend Git:** Has some untracked files (scripts)
- **Last Frontend Fixes:** May not be applied locally (need to check)
- **Terminal Commands:** Always specify full path and folder location
- **Git Operations:** Always commit and push to save changes

---

**Last Updated:** 2025-01-30  
**Status:** 🔧 In Progress - Fixing Connections

