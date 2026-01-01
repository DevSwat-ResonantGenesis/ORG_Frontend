# Quick Start: Lightweight Backend Architecture
## Get Started in 5 Minutes

**Date:** 2025-01-30

---

## 🚀 **QUICK START (5 Steps)**

### **Step 1: Copy Files to Backend**

```bash
cd /Applications/ResonantGraphAIV0.1/backend/fastapi_app

# Create workers directory
mkdir -p workers

# Copy implementation files
# (Copy from frontend repo to backend repo)
cp /path/to/LIGHTWEIGHT_ROUTER_IMPLEMENTATION.py routers/resonant_chat.py
cp /path/to/TASK_QUEUE_IMPLEMENTATION.py workers/task_queue.py
cp /path/to/MEMORY_WORKER_IMPLEMENTATION.py workers/memory_worker.py
cp /path/to/MEMORY_COMPRESSOR_IMPLEMENTATION.py workers/memory_compressor.py

# Create __init__.py
touch workers/__init__.py
```

### **Step 2: Update main.py**

Add to `backend/fastapi_app/main.py`:

```python
from .workers.task_queue import start_worker_pool, stop_worker_pool

@app.on_event("startup")
async def startup_event():
    start_worker_pool()

@app.on_event("shutdown")
async def shutdown_event():
    stop_worker_pool()
```

### **Step 3: Update Imports**

In `workers/memory_worker.py`, update imports to match your structure:

```python
# Adjust these paths
from ..services.memory.hash_sphere import HashSphereService
from ..services.memory.rag_service import RAGService
from ..services.memory.mesh_service import MeshService
```

### **Step 4: Test**

```bash
# Start server
cd /Applications/ResonantGraphAIV0.1
docker compose up -d

# Test endpoint
curl -X POST http://localhost:8001/resonant-chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

**Expected:** Response in < 2 seconds

### **Step 5: Verify Workers**

```bash
# Check logs
docker compose logs -f api | grep "MemoryWorker"
```

**Expected:** See worker tasks processing

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Server starts without errors
- [ ] Endpoint responds in < 2 seconds
- [ ] Workers processing tasks (check logs)
- [ ] No transaction errors
- [ ] Memory updates happening (wait 30s, then check DB)

---

## 🆘 **COMMON ISSUES**

### **Issue: Import Errors**

**Fix:** Update import paths in `memory_worker.py` to match your actual service structure.

### **Issue: Workers Not Starting**

**Fix:** Ensure `start_worker_pool()` is called in `main.py` startup event.

### **Issue: Tasks Not Processing**

**Fix:** Check worker logs for errors. Ensure worker functions use `get_worker_session()`.

---

## 📚 **FULL DOCUMENTATION**

- **Architecture:** `BACKEND_ARCHITECTURE_REFACTOR.md`
- **Migration:** `MIGRATION_GUIDE.md`
- **Implementation:** See `.py` files

---

## 🎯 **WHAT CHANGED**

**Before:**
- 35+ operations in single request
- 30-60 second response time
- Frequent transaction errors
- Unstable under load

**After:**
- 5 operations in request (auth, store, LLM, store, queue)
- < 2 second response time
- No transaction errors
- Stable under load

---

**Ready?** Follow the migration guide for detailed steps.

