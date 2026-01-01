# 🔍 API Endpoints Comparison

**Date:** 2025-01-30  
**Status:** Comparing Frontend Calls vs Backend Endpoints

---

## ✅ **Backend Endpoints Available** (from `/openapi.json`)

### **Resonant Chat Endpoints:**
- ✅ `/resonant-chat/message` - POST
- ✅ `/resonant-chat/anchors` - GET
- ✅ `/resonant-chat/clusters` - GET
- ✅ `/resonant-chat/create` - POST
- ✅ `/resonant-chat/history` - GET
- ✅ `/resonant-chat/history/{chat_id}` - GET

### **RAG Endpoints:**
- ✅ `/rag/ask` - POST
- ✅ `/rag/memories` - GET, POST
- ✅ `/rag/memories/{memory_id}` - GET, PUT, DELETE
- ✅ `/rag/conversations` - GET
- ✅ `/rag/conversations/{conversation_id}` - GET, PUT, DELETE

### **Code Endpoints:**
- ✅ `/code/complete` - POST
- ✅ `/code/execute` - POST
- ✅ `/code/generate` - POST
- ✅ `/code/index` - POST
- ✅ `/code/lsp/completion` - POST
- ✅ `/code/lsp/definition` - POST
- ✅ `/code/lsp/hover` - POST
- ✅ `/code/lsp/references` - POST
- ✅ `/code/project/file/delete` - POST
- ✅ `/code/project/file/read` - POST
- ✅ `/code/project/file/write` - POST
- ✅ `/code/project/files` - GET
- ✅ `/code/project/generate` - POST
- ✅ `/code/project/upload` - POST
- ✅ `/code/refactor` - POST
- ✅ `/code/refactor/advanced` - POST
- ✅ `/code/search` - GET
- ✅ `/code/search/ml` - GET

### **Git Endpoints:**
- ✅ `/git/add` - POST
- ✅ `/git/branch` - POST
- ✅ `/git/branches` - GET
- ✅ `/git/commit` - POST
- ✅ `/git/init` - POST
- ✅ `/git/log` - GET
- ✅ `/git/status` - POST

### **Auth Endpoints:**
- ✅ `/auth/login` - POST
- ✅ `/auth/logout` - POST
- ✅ `/auth/me` - GET
- ✅ `/auth/refresh` - POST
- ✅ `/auth/change-password` - POST
- ✅ `/auth/reset-password` - POST

### **Hash Sphere Endpoints:**
- ✅ `/hash-sphere/anchors` - GET
- ✅ `/hash-sphere/anchors/{anchor_id}` - GET
- ✅ `/hash-sphere/clusters` - GET
- ✅ `/hash-sphere/clusters/{cluster_id}` - GET
- ✅ `/hash-sphere/hash` - POST
- ✅ `/hash-sphere/health` - GET
- ✅ `/hash-sphere/resonance` - POST
- ✅ `/hash-sphere/search` - GET

### **ML Endpoints:**
- ✅ `/ml/embeddings/diagnostics` - GET
- ✅ `/ml/training-jobs` - GET, POST
- ✅ `/ml/training-jobs/{job_id}` - GET
- ✅ `/ml/model-versions` - GET
- ✅ `/ml/worker/logs` - GET
- ✅ `/ml/worker/metrics` - GET

---

## 🔍 **Next Steps:**

1. **Test Authentication Flow:**
   - Test `/auth/login` endpoint
   - Verify cookies are set correctly
   - Test `/auth/me` after login

2. **Test Each Feature:**
   - Resonant Chat
   - RAG/Memories
   - Code features
   - Git operations

3. **Check CORS Configuration:**
   - Verify frontend origin is allowed
   - Check CORS headers in responses

4. **Check Error Responses:**
   - 401 = Authentication needed
   - 404 = Endpoint not found
   - 500 = Server error

---

**Status:** ✅ All expected endpoints exist in backend  
**Next:** Test actual connections and fix any issues

