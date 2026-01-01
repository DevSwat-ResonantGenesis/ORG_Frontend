# 🚀 Server Deployment Instructions

**Date:** 2025-01-29  
**Status:** Ready for server deployment

---

## 📍 **IMPORTANT: This Script Runs on Server**

The deployment script is configured for the **production server** (DigitalOcean Droplet), not local development.

**Server Path:** `/root/ResonantGraphAI_FrontendV0.1`  
**Local Path:** `/Applications/ResonantGraphAI_FrontendV0.1` (for development only)

---

## 🔧 **OPTION 1: Deploy on Server (Recommended)**

### **Step 1: Copy Script to Server**

**From your local machine:**
```bash
# Copy the deployment script to server
scp DEPLOY_AND_TEST_RESONANT_CHAT.sh root@137.184.234.252:/root/ResonantGraphAI_FrontendV0.1/

# Or if you have the code already on server, just pull latest
ssh root@137.184.234.252
cd /root/ResonantGraphAI_FrontendV0.1
git pull origin main
```

### **Step 2: SSH to Server**
```bash
ssh root@137.184.234.252
```

### **Step 3: Navigate and Run**
```bash
cd /root/ResonantGraphAI_FrontendV0.1
chmod +x DEPLOY_AND_TEST_RESONANT_CHAT.sh
./DEPLOY_AND_TEST_RESONANT_CHAT.sh
```

---

## 🔧 **OPTION 2: One-Line Server Deployment**

**From your local machine:**
```bash
ssh root@137.184.234.252 "cd /root/ResonantGraphAI_FrontendV0.1 && git pull origin main && chmod +x DEPLOY_AND_TEST_RESONANT_CHAT.sh && ./DEPLOY_AND_TEST_RESONANT_CHAT.sh"
```

---

## 🔧 **OPTION 3: Manual Deployment Steps**

If you prefer to run steps manually on the server:

### **1. Update Code:**
```bash
cd /root/ResonantGraphAI_FrontendV0.1
git pull origin main
```

### **2. Build Frontend:**
```bash
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
export VITE_ENABLE_FALLBACK_MODE="false"
npm install
npm run build
```

### **3. Update Docker Container:**
```bash
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload
```

### **4. Restart Services:**
```bash
docker-compose -f docker-compose.frontend.yml restart frontend
```

### **5. Verify:**
```bash
curl https://dev-swat.com/api/health
curl https://dev-swat.com/
```

---

## ✅ **VERIFICATION**

After deployment, verify:

1. **Frontend loads:**
   ```bash
   curl https://dev-swat.com/
   ```

2. **Backend health:**
   ```bash
   curl https://dev-swat.com/api/health
   ```

3. **Resonant Chat endpoint:**
   ```bash
   curl https://dev-swat.com/api/resonant-chat/providers
   ```

---

## 🧪 **TESTING**

After deployment, follow the testing checklist:

1. **Open:** `COMPLETE_FUNCTIONALITY_TESTING_CHECKLIST.md`
2. **Test all features:**
   - Resonant Chat
   - IDE Features
   - Project Creation
   - Code Operations
   - Git Operations
   - Code Execution
   - All 31 endpoints

---

## 📝 **NOTES**

- ✅ Script is ready and syntax-validated
- ✅ All paths configured for server
- ✅ Environment variables set correctly
- ✅ Docker commands ready
- ✅ Health checks included

**Status:** ✅ **Ready to deploy on server**

