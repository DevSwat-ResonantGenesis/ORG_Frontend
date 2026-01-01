# 🧪 Testing & Fixing Plan

**Date:** 2025-01-30  
**Goal:** Test and fix all frontend-backend connections one by one

---

## ✅ **Current Status**

- ✅ Backend running on `http://localhost:8001`
- ✅ Frontend running on `http://localhost:5175`
- ✅ Backend has 100+ endpoints available
- ✅ Health check working: `{"status":"ok"}`
- ⚠️ Need to test actual connections

---

## 🔍 **Testing Order**

### **Phase 1: Authentication** 🔐
1. **Test Login:**
   - [ ] Check if test user exists
   - [ ] Test `/auth/login` endpoint
   - [ ] Verify cookies are set
   - [ ] Test `/auth/me` after login

2. **Fix Issues:**
   - [ ] Create test user if needed
   - [ ] Fix cookie handling if broken
   - [ ] Fix CORS if blocking requests

### **Phase 2: Basic Features** 📝
3. **Test Resonant Chat:**
   - [ ] `/resonant-chat/message` - Send message
   - [ ] `/resonant-chat/anchors` - Get anchors
   - [ ] `/resonant-chat/clusters` - Get clusters
   - [ ] `/resonant-chat/create` - Create chat
   - [ ] `/resonant-chat/history` - Get history

4. **Test RAG:**
   - [ ] `/rag/memories` - List/create memories
   - [ ] `/rag/conversations` - List conversations
   - [ ] `/rag/ask` - Ask with RAG

### **Phase 3: Code Features** 💻
5. **Test Code Endpoints:**
   - [ ] `/code/complete` - Code completion
   - [ ] `/code/generate` - Code generation
   - [ ] `/code/execute` - Code execution
   - [ ] `/code/project/generate` - Project generation

6. **Test Git:**
   - [ ] `/git/init` - Initialize repo
   - [ ] `/git/status` - Get status
   - [ ] `/git/commit` - Commit changes

### **Phase 4: Advanced Features** 🚀
7. **Test ML:**
   - [ ] `/ml/embeddings/diagnostics` - Embeddings
   - [ ] `/ml/training-jobs` - Training jobs

8. **Test Hash Sphere:**
   - [ ] `/hash-sphere/anchors` - Get anchors
   - [ ] `/hash-sphere/search` - Search

---

## 🛠️ **How to Test Each Endpoint**

### **Step 1: Check if endpoint exists**
```bash
curl http://localhost:8001/<endpoint>
```

### **Step 2: Test with authentication**
```bash
# First login to get cookies
curl -c cookies.txt -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Then use cookies for authenticated requests
curl -b cookies.txt http://localhost:8001/<endpoint>
```

### **Step 3: Test from frontend**
- Open browser DevTools → Network tab
- Try the feature in the UI
- Check which requests fail
- Fix the failing requests

---

## 🔧 **Common Issues & Fixes**

### **Issue 1: CORS Error**
**Symptom:** Browser console shows CORS error  
**Fix:** Add frontend origin to backend CORS config

### **Issue 2: 401 Unauthorized**
**Symptom:** All requests return 401  
**Fix:** Check authentication flow, verify cookies are sent

### **Issue 3: 404 Not Found**
**Symptom:** Endpoint not found  
**Fix:** Check endpoint path, verify router is registered

### **Issue 4: 500 Server Error**
**Symptom:** Server error  
**Fix:** Check backend logs, fix server-side code

---

## 📝 **Testing Checklist**

- [ ] Authentication works
- [ ] CORS configured correctly
- [ ] Cookies are set and sent
- [ ] Resonant Chat works
- [ ] RAG works
- [ ] Code features work
- [ ] Git features work
- [ ] ML features work
- [ ] All errors fixed
- [ ] Ready to deploy

---

**Status:** 🔄 Ready to start testing  
**Next Step:** Test authentication first

