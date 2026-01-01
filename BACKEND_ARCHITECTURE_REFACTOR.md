# ResonantChat Backend Architecture Refactor
## Lightweight Router + Background Workers

**Date:** 2025-01-30  
**Status:** Architecture Blueprint - Ready for Implementation

---

## 🎯 **THE SOLUTION: 4-Service Architecture**

### **SERVICE 1: Chat Router API** (FastAPI - Main Request Handler)
- **Location:** `backend/fastapi_app/routers/resonant_chat.py`
- **Purpose:** Handle chat requests ONLY
- **Response Time:** < 2 seconds
- **Operations:**
  1. Auth validation
  2. Store user message
  3. Build minimal context (last 5 messages)
  4. Call LLM provider
  5. Store assistant message
  6. Queue background tasks
  7. Return response immediately

### **SERVICE 2: Async Memory Worker** (Background Tasks)
- **Location:** `backend/fastapi_app/workers/memory_worker.py`
- **Purpose:** All heavy memory operations
- **Execution:** After request completes
- **Operations:**
  - Hash sphere graph updates
  - RAG ingestion
  - Memory mesh updates
  - Compression tree updates
  - Anchor reinforcement
  - Knowledge propagation
  - Synthetic memory generation

### **SERVICE 3: Long-Term Memory Compressor** (Cron Job)
- **Location:** `backend/fastapi_app/workers/memory_compressor.py`
- **Purpose:** Periodic cleanup and compression
- **Execution:** Every 1 hour
- **Operations:**
  - Compress daily memories
  - Update monthly summaries
  - Create knowledge crystals
  - Prune low-importance nodes
  - Merge anchors
  - Regenerate personality matrix

### **SERVICE 4: Analytics Engine** (Optional - Low Priority)
- **Location:** `backend/fastapi_app/workers/analytics_worker.py`
- **Purpose:** Heavy analytics operations
- **Execution:** When server load is low
- **Operations:**
  - Cluster detection
  - Causal graph building
  - Predictive engine
  - 3D mesh growing

---

## 📁 **NEW FILE STRUCTURE**

```
backend/fastapi_app/
├── routers/
│   └── resonant_chat.py          # NEW: Lightweight router (replaces heavy handler)
├── workers/
│   ├── __init__.py
│   ├── memory_worker.py          # NEW: All memory operations
│   ├── memory_compressor.py      # NEW: Long-term compression
│   ├── analytics_worker.py        # NEW: Analytics (optional)
│   └── task_queue.py              # NEW: Simple task queue
├── services/
│   ├── memory/
│   │   ├── hash_sphere.py        # EXISTING: Move heavy ops to worker
│   │   ├── rag_service.py        # EXISTING: Move heavy ops to worker
│   │   └── mesh_service.py       # EXISTING: Move heavy ops to worker
│   └── ... (other services)
└── utils/
    └── db_session.py              # NEW: DB session management for workers
```

---

## 🔄 **MIGRATION STEPS**

### **Step 1: Create Task Queue System**
- File: `workers/task_queue.py`
- Uses Python threading (no external dependencies)
- Simple, reliable, zero-cost

### **Step 2: Extract Memory Operations**
- Move all heavy operations from router to `memory_worker.py`
- Each function gets its own DB session
- No shared sessions between tasks

### **Step 3: Refactor Router**
- Keep only: auth, store message, call LLM, store response, queue tasks
- Remove all heavy operations
- Response time drops from 30+ seconds to < 2 seconds

### **Step 4: Add Background Workers**
- Memory worker runs async tasks
- Compressor runs on schedule
- Analytics runs on low load

### **Step 5: Test & Deploy**
- Test lightweight router
- Verify background tasks complete
- Monitor stability

---

## ✅ **EXPECTED RESULTS**

| Metric | Before | After |
|--------|--------|-------|
| API Response Time | 30-60s | < 2s |
| Request Success Rate | 60-70% | 99%+ |
| Transaction Errors | Frequent | None |
| CPU Usage (per request) | 80-100% | 5-10% |
| Memory Usage | High | Low |
| Stability | Unstable | Stable |

---

## 🚀 **IMPLEMENTATION PRIORITY**

1. **CRITICAL:** Task queue + Memory worker
2. **HIGH:** Refactor router to be lightweight
3. **MEDIUM:** Memory compressor (cron)
4. **LOW:** Analytics worker (optional)

---

## 📝 **NEXT STEPS**

See the following files for implementation:
- `LIGHTWEIGHT_ROUTER_IMPLEMENTATION.py` - New router code
- `MEMORY_WORKER_IMPLEMENTATION.py` - Background worker code
- `TASK_QUEUE_IMPLEMENTATION.py` - Task queue system
- `MIGRATION_GUIDE.md` - Step-by-step migration

