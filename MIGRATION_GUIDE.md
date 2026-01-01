# ResonantChat Backend Migration Guide
## From Heavy Handler to Lightweight Router + Background Workers

**Date:** 2025-01-30  
**Status:** Step-by-Step Migration Instructions

---

## 🎯 **MIGRATION OVERVIEW**

This guide walks you through migrating from the current heavy request handler to a lightweight router with background workers.

**Expected Time:** 2-4 hours  
**Risk Level:** Medium (backward compatible)  
**Downtime:** None (can be done incrementally)

---

## 📋 **PRE-MIGRATION CHECKLIST**

- [ ] Backup current backend code
- [ ] Backup database
- [ ] Test current endpoint to establish baseline
- [ ] Review current `/resonant-chat/message` implementation
- [ ] Identify all heavy operations in current handler
- [ ] Ensure you have access to backend repository

---

## 🔧 **STEP 1: Create Task Queue System**

### **1.1 Create Directory Structure**

```bash
cd /Applications/ResonantGraphAIV0.1/backend/fastapi_app
mkdir -p workers
touch workers/__init__.py
```

### **1.2 Create Task Queue**

Copy `TASK_QUEUE_IMPLEMENTATION.py` to:
```
backend/fastapi_app/workers/task_queue.py
```

### **1.3 Update main.py to Start Workers**

In `backend/fastapi_app/main.py`, add:

```python
from .workers.task_queue import start_worker_pool, stop_worker_pool

@app.on_event("startup")
async def startup_event():
    # Start background worker pool
    start_worker_pool()
    logger.info("Background workers started")

@app.on_event("shutdown")
async def shutdown_event():
    # Stop background worker pool
    stop_worker_pool()
    logger.info("Background workers stopped")
```

**Test:** Start the server and verify workers start without errors.

---

## 🔧 **STEP 2: Create Memory Worker**

### **2.1 Create Memory Worker File**

Copy `MEMORY_WORKER_IMPLEMENTATION.py` to:
```
backend/fastapi_app/workers/memory_worker.py
```

### **2.2 Update Imports**

Update the imports in `memory_worker.py` to match your actual service paths:

```python
# Adjust these paths to match your actual structure
from ..services.memory.hash_sphere import HashSphereService
from ..services.memory.rag_service import RAGService
from ..services.memory.mesh_service import MeshService
```

### **2.3 Test Worker Functions**

Create a test script to verify worker functions work:

```python
# test_worker.py
from workers.memory_worker import update_hash_sphere_graph

# Test with sample data
update_hash_sphere_graph(
    message_id=1,
    chat_id="test-chat",
    user_id=1,
    content="Test message"
)
```

**Test:** Run test script and verify no errors.

---

## 🔧 **STEP 3: Refactor Router (CRITICAL)**

### **3.1 Backup Current Router**

```bash
cp routers/resonant_chat.py routers/resonant_chat.py.backup
```

### **3.2 Create New Lightweight Router**

Copy `LIGHTWEIGHT_ROUTER_IMPLEMENTATION.py` to:
```
backend/fastapi_app/routers/resonant_chat.py
```

**⚠️ IMPORTANT:** This replaces your current router. Make sure you:
1. Keep the same endpoint path: `/resonant-chat/message`
2. Keep the same request/response models
3. Update imports to match your actual structure

### **3.3 Update Request/Response Models**

Ensure your request model matches:

```python
class ResonantChatRequest(BaseModel):
    message: str
    chat_id: Optional[str] = None
    context: Optional[Dict] = None
    attached_files: Optional[List[str]] = None
    code_selection: Optional[Dict] = None
    preferred_provider: Optional[str] = "auto"
    use_rag: Optional[bool] = False
```

### **3.4 Update LLM Provider Call**

Update the `call_llm_provider` function call to match your actual implementation:

```python
# Adjust this to match your actual LLM service
from ..services.llm_provider import call_llm_provider
# OR
from ..services.providers.router import route_to_provider
```

**Test:** Start server and test endpoint with a simple message.

---

## 🔧 **STEP 4: Move Heavy Operations**

### **4.1 Identify Heavy Operations**

In your current router, find all operations that:
- Take > 1 second
- Do complex calculations
- Write to multiple tables
- Call external services
- Do graph/mesh operations

### **4.2 Move to Worker**

For each heavy operation:

1. **Extract function** from router
2. **Move to** `memory_worker.py`
3. **Ensure** it uses `get_worker_session()`
4. **Queue** it in router using `queue_memory_task()`

Example:

**Before (in router):**
```python
# Heavy operation in request handler
hash_sphere_service.update_graph(message)
mesh_service.update_mesh(user_id)
```

**After (in router):**
```python
# Queue for background processing
queue_memory_task("update_hash_sphere_graph", {
    "message_id": message.id,
    "user_id": user_id,
    "content": message.content
})
queue_memory_task("update_memory_mesh", {
    "user_id": user_id,
    "message_id": message.id
})
```

### **4.3 Update Response**

Since heavy operations run in background, update response:

```python
return {
    "message": llm_response.content,
    "memoryUpdated": False,  # Will be updated in background
    "hash": None,  # Will be set in background
    "anchors": [],  # Will be populated in background
}
```

**Test:** Verify endpoint responds quickly (< 2 seconds).

---

## 🔧 **STEP 5: Add Memory Compressor (Optional)**

### **5.1 Create Compressor**

Copy `MEMORY_COMPRESSOR_IMPLEMENTATION.py` to:
```
backend/fastapi_app/workers/memory_compressor.py
```

### **5.2 Set Up Cron Job**

Add to crontab (runs every hour):

```bash
# Edit crontab
crontab -e

# Add this line
0 * * * * cd /Applications/ResonantGraphAIV0.1/backend && python -m fastapi_app.workers.memory_compressor
```

**Or** run as background service in Docker.

---

## 🔧 **STEP 6: Database Session Management**

### **6.1 Ensure Separate Sessions**

**CRITICAL:** Each worker function MUST use its own session:

```python
# ✅ CORRECT
def worker_function():
    with get_worker_session() as session:
        # Do work
        pass

# ❌ WRONG - Never share sessions
def worker_function(session):  # Don't do this
    # Do work
    pass
```

### **6.2 Update Database Utilities**

If needed, create `utils/db_session.py`:

```python
from sqlalchemy.orm import Session
from contextlib import contextmanager

@contextmanager
def get_worker_session():
    engine = get_db_engine()
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise
    finally:
        session.close()
```

---

## 🧪 **STEP 7: Testing**

### **7.1 Test Lightweight Router**

```bash
# Test endpoint
curl -X POST http://localhost:8001/resonant-chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "chat_id": "test-123"
  }'
```

**Expected:**
- Response time: < 2 seconds
- Response contains message
- No errors in logs

### **7.2 Test Background Workers**

Check logs for worker activity:

```bash
# Watch logs
docker compose logs -f api | grep "MemoryWorker"
```

**Expected:**
- Tasks are queued
- Workers process tasks
- No errors in worker logs

### **7.3 Test Memory Updates**

Wait 10-30 seconds, then check:
- Hash sphere graph updated
- Memory mesh updated
- Anchors reinforced
- RAG ingested

---

## 🚀 **STEP 8: Deployment**

### **8.1 Deploy to Staging First**

```bash
# Test on staging
cd /Applications/ResonantGraphAIV0.1
git add .
git commit -m "Refactor: Lightweight router + background workers"
git push origin staging
```

### **8.2 Monitor**

Watch for:
- Response times
- Error rates
- Worker queue size
- Database load

### **8.3 Deploy to Production**

Once stable on staging:

```bash
git push origin main
# Deploy to production
```

---

## 🔍 **TROUBLESHOOTING**

### **Issue: Tasks Not Processing**

**Check:**
- Workers started? (`start_worker_pool()` called?)
- Queue size? (`get_queue_stats()`)
- Worker logs?

**Fix:**
```python
# In main.py, ensure workers start
@app.on_event("startup")
async def startup_event():
    start_worker_pool()
```

### **Issue: Database Transaction Errors**

**Check:**
- Are workers using separate sessions?
- Are sessions being shared?

**Fix:**
- Ensure each worker function uses `get_worker_session()`
- Never pass session from router to worker

### **Issue: Response Still Slow**

**Check:**
- Are heavy operations still in router?
- Is LLM call taking too long?

**Fix:**
- Move ALL heavy operations to workers
- Only keep: auth, store message, call LLM, store response

### **Issue: Memory Not Updating**

**Check:**
- Are workers processing tasks?
- Are worker functions correct?

**Fix:**
- Check worker logs
- Test worker functions directly
- Verify task queue is working

---

## ✅ **POST-MIGRATION CHECKLIST**

- [ ] Router responds in < 2 seconds
- [ ] Background workers processing tasks
- [ ] Memory updates happening (check after 30s)
- [ ] No transaction errors
- [ ] No performance degradation
- [ ] Error rates same or lower
- [ ] Database load manageable

---

## 📊 **EXPECTED RESULTS**

| Metric | Before | After |
|--------|--------|-------|
| API Response Time | 30-60s | < 2s |
| Request Success Rate | 60-70% | 99%+ |
| Transaction Errors | Frequent | None |
| CPU Usage (per request) | 80-100% | 5-10% |
| Stability | Unstable | Stable |

---

## 🆘 **ROLLBACK PLAN**

If something goes wrong:

1. **Restore backup router:**
   ```bash
   cp routers/resonant_chat.py.backup routers/resonant_chat.py
   ```

2. **Restart server:**
   ```bash
   docker compose restart api
   ```

3. **Verify old behavior restored**

---

## 📝 **NOTES**

- Workers run in background, so memory updates happen after response
- Response may not include hash/anchors immediately (they're added in background)
- This is expected and acceptable
- Frontend can poll for updates if needed

---

## 🎉 **SUCCESS CRITERIA**

Migration is successful when:
1. ✅ API responds in < 2 seconds
2. ✅ No transaction errors
3. ✅ Background workers processing tasks
4. ✅ Memory updates happening
5. ✅ System stable under load

---

**Questions?** Check the implementation files or review the architecture document.

