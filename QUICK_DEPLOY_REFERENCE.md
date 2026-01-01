# 🚀 Quick Deploy Reference - Resonant Chat Update

**Date:** 2025-01-29

---

## ⚡ **QUICK DEPLOY (One Command)**

```bash
cd /root/ResonantGraphAI_FrontendV0.1
./DEPLOY_AND_TEST_RESONANT_CHAT.sh
```

---

## 📋 **MANUAL DEPLOY STEPS**

### **1. Update Code**
```bash
cd /root/ResonantGraphAI_FrontendV0.1
git pull origin main
```

### **2. Build**
```bash
export VITE_API_URL="/api"
export VITE_FASTAPI_URL="/api"
export VITE_ENABLE_FALLBACK_MODE="false"
npm install
npm run build
```

### **3. Deploy to Docker**
```bash
docker exec frontend sh -c 'rm -rf /usr/share/nginx/html/*'
docker cp dist/. frontend:/usr/share/nginx/html/
docker exec frontend nginx -s reload
```

### **4. Restart**
```bash
docker-compose -f docker-compose.frontend.yml restart frontend
```

---

## 🧪 **QUICK TEST**

### **Health Check:**
```bash
curl https://dev-swat.com/api/health
```

### **Frontend:**
```bash
curl https://dev-swat.com/
```

### **Providers:**
```bash
curl https://dev-swat.com/api/resonant-chat/providers
```

---

## ✅ **VERIFY DEPLOYMENT**

1. Visit: `https://dev-swat.com`
2. Login
3. Go to Resonant Chat
4. Send test message: "Hello"
5. Verify:
   - ✅ Message sent
   - ✅ Response received
   - ✅ Hash/anchors/resonance present
   - ✅ No console errors

---

## 🔧 **TROUBLESHOOTING**

### **Build Fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Container Issues:**
```bash
docker-compose -f docker-compose.frontend.yml down
docker-compose -f docker-compose.frontend.yml up -d
```

### **Nginx Issues:**
```bash
docker exec frontend nginx -t
docker exec frontend nginx -s reload
```

---

**Status:** ✅ **READY**

