# 🧪 Backend Features Test & Cleanup Plan

**Date:** 2025-01-30  
**Status:** Testing and organizing backend features

---

## 🎯 **Goals**

1. ✅ Test Resonant Chat functionality
2. ✅ Test ML features and check training requirements
3. ✅ Verify all backend endpoints are working
4. ✅ Clean and organize code

---

## 📋 **STAGE 1: Resonant Chat Testing**

### **Backend Endpoints to Test:**
1. ✅ `POST /resonant-chat/message` - Send message
2. ✅ `GET /resonant-chat/history` - Get chat history
3. ✅ `GET /resonant-chat/history/{chat_id}` - Get specific chat
4. ✅ `POST /resonant-chat/create` - Create new chat
5. ✅ `GET /resonant-chat/anchors` - Get memory anchors
6. ✅ `GET /resonant-chat/clusters` - Get resonance clusters

### **Dependencies:**
- ✅ RAG endpoints (memories, conversations)
- ✅ Hash Sphere endpoints (hashing, resonance)
- ✅ AI Provider connections (OpenAI, Anthropic, etc.)

### **Test Plan:**
1. Navigate to `/resonant-chat` page
2. Send a test message
3. Verify response comes back
4. Check if memory anchors are created
5. Verify chat history loads
6. Test conversation persistence

---

## 📋 **STAGE 2: ML Features Testing**

### **Backend Endpoints to Test:**
1. ✅ `GET /ml/training-jobs` - List training jobs
2. ✅ `GET /ml/training-jobs/{id}` - Get job details
3. ✅ `POST /ml/training-jobs` - Create training job
4. ✅ `POST /ml/training-jobs/{id}/stop` - Stop job
5. ✅ `GET /ml/model-versions` - List model versions
6. ✅ `POST /ml/model-versions/{id}/promote` - Promote version
7. ✅ `GET /ml/worker/metrics` - Worker metrics
8. ✅ `GET /ml/worker/logs` - Worker logs
9. ✅ `GET /ml/evaluations` - List evaluations
10. ✅ `POST /ml/evaluations` - Run evaluation
11. ✅ `GET /ml/drift-detections` - List drift detections
12. ✅ `POST /ml/drift-detections` - Run drift detection

### **Training Requirements:**
- ⚠️ **Do we need to train models first?**
  - Check if models exist in database
  - Check if training jobs can be created without existing models
  - Verify ML worker is running and connected
  - Check if datasets are required

### **ML Worker Status:**
- Check Docker container: `docker-compose ps ml-worker`
- Check logs: `docker-compose logs ml-worker`
- Verify database connection (ml_registry database)

### **Test Plan:**
1. Check ML worker status
2. Navigate to `/ml/training-jobs` page
3. Try to create a training job
4. Check if models exist
5. Test model versioning
6. Test drift detection
7. Test evaluations

---

## 📋 **STAGE 3: Backend Endpoints Verification**

### **All Backend Routers (34 routers):**

#### **Core Features:**
1. ✅ `health.py` - Health checks
2. ✅ `auth.py` - Authentication
3. ✅ `users.py` - User management
4. ✅ `orgs.py` - Organization management
5. ✅ `settings.py` - User settings

#### **AI Features:**
6. ✅ `resonant_chat.py` - Resonant Chat
7. ✅ `rag.py` - RAG/Memories
8. ✅ `hash_sphere.py` - Hash Sphere
9. ✅ `llm_scanner.py` - LLM Scanner
10. ✅ `validation.py` - Validation Tool
11. ✅ `ai_audit.py` - AI Audit Logs

#### **ML Features:**
12. ✅ `ml_ops.py` - ML Operations (training, models)
13. ✅ `ml_advanced.py` - Advanced ML features

#### **Code Features:**
14. ✅ `code.py` - Code completion, execution, refactoring
15. ✅ `git.py` - Git operations

#### **Governance:**
16. ✅ `policies.py` - Policy management
17. ✅ `compliance.py` - Compliance
18. ✅ `audit.py` - Audit logs
19. ✅ `predictions.py` - Predictions

#### **Billing & Finance:**
20. ✅ `billing.py` - Billing
21. ✅ `stripe.py` - Stripe integration
22. ✅ `finance.py` - Finance features
23. ✅ `usage.py` - Usage tracking

#### **Platform:**
24. ✅ `platform.py` - Platform features
25. ✅ `marketplace.py` - Marketplace
26. ✅ `metrics.py` - Metrics
27. ✅ `metrics_export.py` - Metrics export

#### **Other:**
28. ✅ `public.py` - Public endpoints
29. ✅ `docs.py` - API documentation
30. ✅ `mfa.py` - Multi-factor auth
31. ✅ `password_reset.py` - Password reset
32. ✅ `sso.py` - SSO
33. ✅ `anchors.py` - Memory anchors
34. ✅ `openapi.py` - OpenAPI spec

### **Test Plan:**
1. Check each router is included in `main.py`
2. Test health endpoint for each router
3. Verify authentication works
4. Test key endpoints from each router
5. Check for 404/500 errors

---

## 📋 **STAGE 4: Code Cleanup & Organization**

### **Frontend Cleanup:**
1. ✅ Remove unused imports
2. ✅ Remove commented code
3. ✅ Fix TypeScript errors
4. ✅ Organize file structure
5. ✅ Remove duplicate code
6. ✅ Update deprecated code

### **Backend Cleanup:**
1. ✅ Remove unused imports
2. ✅ Remove commented code
3. ✅ Fix Python linting errors
4. ✅ Organize router structure
5. ✅ Remove duplicate code
6. ✅ Update deprecated code
7. ✅ Add missing docstrings
8. ✅ Standardize error handling

### **Common Issues to Fix:**
- [ ] Unused variables
- [ ] Unused imports
- [ ] Commented code blocks
- [ ] TODO comments
- [ ] FIXME comments
- [ ] Console.log statements (use logger)
- [ ] Debug code
- [ ] Duplicate functions
- [ ] Inconsistent naming
- [ ] Missing error handling

---

## 🚀 **Execution Plan**

### **Step 1: Test Resonant Chat (NOW)**
```bash
# 1. Navigate to Resonant Chat page
# 2. Test sending a message
# 3. Check browser console for errors
# 4. Check Network tab for API calls
# 5. Verify responses
```

### **Step 2: Test ML Features**
```bash
# 1. Check ML worker status
cd /Applications/ResonantGraphAIV0.1/backend
docker-compose ps ml-worker
docker-compose logs ml-worker --tail 50

# 2. Navigate to ML training jobs page
# 3. Check if models exist
# 4. Try creating a training job
# 5. Verify ML worker connection
```

### **Step 3: Verify All Endpoints**
```bash
# Test all endpoints via browser or curl
curl http://localhost:8001/health
curl http://localhost:8001/api/docs  # Check OpenAPI docs
```

### **Step 4: Code Cleanup**
```bash
# Frontend
cd /Applications/ResonantGraphAI_FrontendV0.1
npm run lint  # Check for linting errors
npm run type-check  # Check TypeScript errors

# Backend
cd /Applications/ResonantGraphAIV0.1/backend
# Run Python linter (pylint, flake8, black)
```

---

## 📊 **Status Tracking**

### **Resonant Chat:**
- [ ] Endpoints tested
- [ ] Messages working
- [ ] Memory anchors working
- [ ] Chat history working
- [ ] Clusters working

### **ML Features:**
- [ ] ML worker running
- [ ] Training jobs endpoint working
- [ ] Model versions endpoint working
- [ ] Evaluations working
- [ ] Drift detection working
- [ ] **Training required?** (TBD)

### **Backend Endpoints:**
- [ ] All 34 routers verified
- [ ] No 404 errors
- [ ] No 500 errors
- [ ] Authentication working
- [ ] CORS configured

### **Code Cleanup:**
- [ ] Frontend cleaned
- [ ] Backend cleaned
- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] Code organized

---

## 🎯 **Next Actions**

1. **Start with Resonant Chat testing**
2. **Then test ML features and check training requirements**
3. **Verify all backend endpoints**
4. **Clean and organize code**

Let's start! 🚀

