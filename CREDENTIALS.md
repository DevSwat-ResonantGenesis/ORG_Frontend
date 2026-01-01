# 🔐 Platform Credentials

**Date:** 2025-01-30  
**Status:** Test User Created and Verified

---

## ✅ **Test User Credentials**

### **Login Credentials:**
- **Email:** `test@test.com`
- **Password:** `Test1234`
- **Role:** `org_admin`
- **Organization:** Test Organization

### **Login URL:**
- **Local Frontend:** `http://localhost:5175/login`
- **Backend API:** `http://localhost:8001/auth/login`

---

## 🗄️ **Database Credentials**

### **Local PostgreSQL (Docker):**
- **Host:** `localhost` (or `db` from within Docker)
- **Port:** `5432`
- **Database Name:** `resonant`
- **Username:** `resonant_user`
- **Password:** `resonant_password`
- **Connection String:** `postgresql://resonant_user:resonant_password@db:5432/resonant`

### **ML Registry Database (Docker):**
- **Host:** `localhost` (or `ml_db` from within Docker)
- **Port:** `5433`
- **Database Name:** `ml_registry`
- **Username:** `ml_user`
- **Password:** `ml_password`
- **Connection String:** `postgresql://ml_user:ml_password@ml_db:5433/ml_registry`

---

## 🌐 **DigitalOcean Database Credentials**

### **Main Database (`resonant`):**
- **Host:** `[TO BE FILLED FROM DROPLET]`
- **Port:** `25060` (standard PostgreSQL port)
- **Database Name:** `resonant`
- **Username:** `[TO BE FILLED FROM DROPLET]`
- **Password:** `[TO BE FILLED FROM DROPLET]`

### **ML Registry Database (`ml_registry`):**
- **Host:** `[TO BE FILLED FROM DROPLET]`
- **Port:** `25060` (standard PostgreSQL port)
- **Database Name:** `ml_registry`
- **Username:** `[TO BE FILLED FROM DROPLET]`
- **Password:** `[TO BE FILLED FROM DROPLET]`

**Note:** DigitalOcean database credentials are stored in:
- Backend `.env` file on droplet
- DigitalOcean dashboard → Databases → Connection Details

---

## 🔑 **API Keys & Environment Variables**

### **Backend Environment Variables:**
Location: `/Applications/ResonantGraphAIV0.1/backend/.env`

Key variables:
- `DATABASE_URL` - Main database connection
- `ML_DATABASE_URL` - ML registry database connection
- `JWT_SECRET` - JWT token signing secret
- `JWT_ALGORITHM` - JWT algorithm (HS256)
- `CORS_ORIGINS` - Allowed CORS origins
- `ENVIRONMENT` - Environment (development/production)

### **Frontend Environment Variables:**
Location: `/Applications/ResonantGraphAI_FrontendV0.1/.env`

Key variables:
- `VITE_API_URL` - Backend API URL
- `VITE_ENVIRONMENT` - Environment (development/production)

---

## 📍 **Repository Locations**

### **Frontend:**
- **Local Path:** `/Applications/ResonantGraphAI_FrontendV0.1`
- **Git Repository:** `[TO BE FILLED]`
- **Droplet Path:** `[TO BE FILLED]`

### **Backend:**
- **Local Path:** `/Applications/ResonantGraphAIV0.1`
- **Git Repository:** `[TO BE FILLED]`
- **Droplet Path:** `[TO BE FILLED]`

---

## 🐳 **Docker Services**

### **Local Docker Setup:**
- **API Service:** `http://localhost:8001`
- **Database Service:** `localhost:5432`
- **ML Database Service:** `localhost:5433`
- **ML Worker Service:** Running in Docker

### **Docker Compose Commands:**
```bash
# Start services
cd /Applications/ResonantGraphAIV0.1
docker compose up -d

# View logs
docker compose logs -f api

# Restart services
docker compose restart api

# Stop services
docker compose down
```

---

## ✅ **Verification**

### **Test Login:**
```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}' \
  -c cookies.txt
```

### **Test Authenticated Endpoint:**
```bash
curl -b cookies.txt http://localhost:8001/auth/me
```

---

## 📝 **Notes**

- Test user was created using `/Applications/ResonantGraphAIV0.1/create_test_user.py`
- Password is hashed using bcrypt
- User has `org_admin` role in "Test Organization"
- All credentials are for **LOCAL DEVELOPMENT ONLY**
- Production credentials should be stored securely (not in this file)
