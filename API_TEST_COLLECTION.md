# 🧪 API Test Collection (Postman/Thunder Client)

**Base URL:** `http://localhost:8001`  
**Auth:** JWT Token (from login) or API Key

---

## 📋 **Test Collection Structure**

### **1. Authentication**
### **2. Hash Sphere**
### **3. Memory Book (RAG)**
### **4. Evidence Graph**
### **5. Transition Dynamics**
### **6. Visualization Data**
### **7. WebSockets**
### **8. Code Features**
### **9. Rate Limiting**

---

## 🔐 **1. Authentication**

### **POST `/auth/login`**
```json
{
  "email": "test@example.com",
  "password": "testpassword",
  "org_id": "optional-org-id"
}
```
**Expected:** 200 OK, JWT tokens in cookies

---

## 🌐 **2. Hash Sphere**

### **POST `/hash-sphere/hash`**
```json
{
  "text": "Sample text to hash"
}
```
**Expected:** 
```json
{
  "hash": "abc123...",
  "xyz": [0.5, 0.3, 0.8],
  "hyperspherical": {"r": 1.0, "phi": 0.5, "theta": 0.3}
}
```

### **POST `/hash-sphere/anchors`**
```json
{
  "anchor_text": "Important concept",
  "context": "Context around anchor",
  "importance_score": 0.8,
  "language": "en"
}
```
**Expected:** 201 Created, anchor with hash, XYZ

### **GET `/hash-sphere/anchors`**
**Query Params:** `?query=test&min_importance=0.5&limit=10`
**Expected:** List of anchors

### **GET `/hash-sphere/anchors/{anchor_id}`**
**Expected:** Single anchor with full data

### **PUT `/hash-sphere/anchors/{id}/hierarchy`**
```json
{
  "parent_id": "parent-uuid",
  "child_ids": ["child1-uuid", "child2-uuid"]
}
```
**Expected:** 200 OK, hierarchy updated

### **POST `/hash-sphere/anchors/{id}/relationships`**
```json
{
  "related_anchor_id": "related-uuid",
  "relationship_type": "similar"
}
```
**Expected:** 200 OK, relationship created

### **POST `/hash-sphere/anchors/merge`**
```json
{
  "source_anchor_ids": ["uuid1", "uuid2"],
  "target_anchor_id": "target-uuid"
}
```
**Expected:** 200 OK, merged anchor

### **POST `/hash-sphere/anchors/{id}/split`**
```json
{
  "split_texts": ["Part 1", "Part 2"]
}
```
**Expected:** 200 OK, list of new anchors

### **POST `/hash-sphere/clusters`**
```json
{
  "cluster_name": "My Cluster",
  "anchor_ids": ["uuid1", "uuid2"],
  "personality_traits": {"trait1": "value1"}
}
```
**Expected:** 201 Created, cluster with hash, center

### **PUT `/hash-sphere/clusters/{id}`**
```json
{
  "cluster_name": "Updated Name",
  "personality_traits": {"updated": "value"}
}
```
**Expected:** 200 OK, updated cluster

### **DELETE `/hash-sphere/clusters/{id}`**
**Expected:** 204 No Content

### **POST `/hash-sphere/clusters/{id}/anchors`**
```json
{
  "anchor_id": "anchor-uuid"
}
```
**Expected:** 200 OK, anchor added

### **DELETE `/hash-sphere/clusters/{id}/anchors/{anchor_id}`**
**Expected:** 200 OK, anchor removed

---

## 📚 **3. Memory Book (RAG)**

### **POST `/rag/memories`**
```json
{
  "content": "Memory content here",
  "metadata": {"title": "My Memory"},
  "is_shared": false,
  "is_public": false,
  "language": "en"
}
```
**Expected:** 201 Created, memory with hash, XYZ

### **GET `/rag/memories`**
**Query Params:** `?limit=50&offset=0`
**Expected:** List of memories

### **GET `/rag/memories/{id}`**
**Expected:** Single memory with full data

### **PUT `/rag/memories/{id}`**
```json
{
  "content": "Updated content",
  "metadata": {"updated": true}
}
```
**Expected:** 200 OK, updated memory (spin/drift applied)

### **PATCH `/rag/memories/{id}`**
```json
{
  "metadata": {"partial": "update"}
}
```
**Expected:** 200 OK, partial update

### **DELETE `/rag/memories/{id}`**
**Expected:** 204 No Content

### **POST `/rag/memories/search`**
```json
{
  "query": "search term",
  "search_type": "hybrid",
  "min_resonance": 0.5,
  "min_proximity": 0.3,
  "language": "en",
  "cluster": "alpha",
  "anchor": "anchor-uuid",
  "start_date": "2025-01-01",
  "end_date": "2025-01-31",
  "limit": 50
}
```
**Expected:** List of matching memories

### **POST `/rag/memories/batch`**
```json
{
  "operation": "delete",
  "memory_ids": ["uuid1", "uuid2"]
}
```
**Expected:** Batch operation results

### **GET `/rag/memories/shared`**
**Expected:** List of shared memories

### **GET `/rag/memories/public`**
**Expected:** List of public memories

### **GET `/rag/analytics?days=30`**
**Expected:** Analytics data

### **GET `/rag/export/memories?format=json`**
**Expected:** File download

### **POST `/rag/import/memories`**
**Form Data:** `file` (JSON file), `overwrite` (boolean)
**Expected:** Import results

---

## 🕸️ **4. Evidence Graph**

### **GET `/resonant-chat/evidence-graph/{message_id}`**
**Expected:** 
```json
{
  "message_id": "uuid",
  "nodes": [
    {"id": "node1", "type": "message", "label": "Text", "xyz": [0.5, 0.3, 0.8]}
  ],
  "edges": [
    {"source": "node1", "target": "node2", "type": "related"}
  ],
  "node_count": 5,
  "edge_count": 4
}
```
**⚠️ Verify:** NO weights (w_ij) exposed

---

## 🔄 **5. Transition Dynamics**

### **Test Spin:**
1. **GET** `/rag/memories/{id}` - Get current XYZ
2. **PUT** `/rag/memories/{id}` - Update content
3. **GET** `/rag/memories/{id}` - Verify XYZ rotated (spin applied)

### **Test Drift:**
1. **GET** `/rag/memories/{id}` - Get current XYZ
2. **PUT** `/rag/memories/{id}` - Update content
3. **GET** `/rag/memories/{id}` - Verify XYZ drifted toward new position

### **Test Stability:**
1. Create anchor
2. Create memory near anchor
3. Calculate stability (via internal endpoint or calculation)
4. Verify stability score in [0, 1]

---

## 🎨 **6. Visualization Data**

### **Test Safe Visualization Payload:**
1. **GET** `/hash-sphere/anchors`
2. **Verify:** Response contains:
   - ✅ hash
   - ✅ xyz
   - ✅ anchor_text
   - ❌ NO importance_score (if filtered)
   - ❌ NO full embeddings

### **Test Anchor Index Values:**
1. **GET** `/hash-sphere/anchors`
2. **Verify:** Only safe index values exposed

### **Test No Embedding Exposures:**
1. **GET** `/rag/memories/{id}`
2. **Verify:** NO `embedding` field in response
3. **Verify:** NO vector data exposed

---

## 🔌 **7. WebSockets**

### **WebSocket Connection:**
```
ws://localhost:8001/ws/resonant-chat/{chat_id}
```

**Test Messages:**
```json
{
  "type": "message",
  "content": "Test message"
}
```

**Expected Events:**
- `message_chunk` - Streaming response
- `memory_update` - Memory updated
- `cluster_update` - Cluster updated

**Verify:**
- ✅ Real-time events received
- ✅ Memory updates broadcast
- ✅ Cluster transitions broadcast
- ❌ NO sensitive data in events

---

## 💻 **8. Code Features**

### **POST `/code/diff`**
```json
{
  "original_code": "def old():\n    return 1",
  "modified_code": "def new():\n    return 2",
  "language": "python",
  "file_path": "test.py"
}
```
**Expected:** Unified diff, HTML diff, line changes, stats

### **POST `/code/review`**
```json
{
  "code": "def test():\n    return 1",
  "language": "python",
  "file_path": "test.py"
}
```
**Expected:** Suggestions, quality_score, issues, improvements

### **POST `/code/test`**
```json
{
  "code": "def add(a, b):\n    return a + b",
  "language": "python",
  "test_framework": "pytest"
}
```
**Expected:** Test code, test_results (if available)

### **POST `/code/quality`**
```json
{
  "code": "def complex():\n    if x:\n        if y:\n            if z:\n                return 1",
  "language": "python"
}
```
**Expected:** Metrics, complexity, maintainability_index, issues

### **POST `/code/dependencies/analyze`**
```json
{
  "project_id": "project-uuid",
  "file_paths": ["file1.py", "file2.py"]
}
```
**Expected:** Dependencies, graph, circular deps, unused deps

---

## ⚡ **9. Rate Limiting**

### **GET `/rate-limit/status`**
**Expected:** Current status, tier, limit, remaining, reset_at

### **GET `/rate-limit/history?period=hour`**
**Expected:** Historical data

### **GET `/rate-limit/settings`**
**Expected:** Current settings

### **PUT `/rate-limit/settings`** (Admin only)
```json
{
  "anonymous": 100,
  "authenticated": 500,
  "api_key": 1000,
  "admin": 2000
}
```
**Expected:** Updated settings

---

## 📝 **Test Execution Order**

1. **Authentication** - Get JWT token
2. **Hash Sphere** - Create anchors, clusters
3. **Memory Book** - Create memories, test CRUD
4. **Evidence Graph** - Create messages, verify graphs
5. **Transition Dynamics** - Test spin/drift
6. **Visualization Data** - Verify safe data only
7. **WebSockets** - Test real-time streams
8. **Code Features** - Test all code endpoints
9. **Rate Limiting** - Test dashboard

---

## ✅ **Success Criteria**

- [ ] All endpoints return expected status codes
- [ ] All responses have correct structure
- [ ] No sensitive data exposed
- [ ] All integrations work correctly
- [ ] Performance acceptable (< 2s response time)

