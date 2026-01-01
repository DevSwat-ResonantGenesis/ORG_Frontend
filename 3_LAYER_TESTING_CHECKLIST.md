# 🧪 3-Layer Testing Checklist (MANDATORY)

**Testing Order:** Layer A → Layer B → Layer C (Sequential, No Skipping)

---

## 📌 **LAYER A — Backend Functional Tests**

**Purpose:** Verify each endpoint works correctly with various input scenarios.

**Rule:** Each endpoint MUST be tested with:
- ✅ Valid inputs
- ❌ Invalid inputs
- ⚪ Empty inputs
- 🔍 Edge-case inputs

---

### **1. Hash Sphere Endpoints**

#### **POST `/hash-sphere/hash`**
- [ ] **Valid:** Hash normal text string
- [ ] **Valid:** Hash long text (1000+ chars)
- [ ] **Invalid:** Hash with special characters only
- [ ] **Empty:** Hash empty string
- [ ] **Edge:** Hash unicode text (Chinese, Arabic, emoji)
- [ ] **Edge:** Hash code snippet
- [ ] **Verify:** Returns hash, XYZ coordinates, hyperspherical coords

#### **POST `/hash-sphere/anchors`**
- [ ] **Valid:** Create anchor with text + context
- [ ] **Valid:** Create anchor with importance_score
- [ ] **Invalid:** Missing anchor_text
- [ ] **Invalid:** anchor_text > 500 chars
- [ ] **Empty:** Empty anchor_text
- [ ] **Edge:** anchor_text with special chars
- [ ] **Edge:** importance_score = 0.0
- [ ] **Edge:** importance_score = 1.0
- [ ] **Verify:** Anchor created with hash, XYZ, language detection

#### **GET `/hash-sphere/anchors`**
- [ ] **Valid:** List all anchors (default limit)
- [ ] **Valid:** List with query filter
- [ ] **Valid:** List with min_importance filter
- [ ] **Valid:** List with limit parameter
- [ ] **Invalid:** limit > 100
- [ ] **Invalid:** min_importance < 0 or > 1
- [ ] **Edge:** Query with no results
- [ ] **Edge:** Query with special characters
- [ ] **Verify:** Returns list with correct structure

#### **GET `/hash-sphere/anchors/{anchor_id}`**
- [ ] **Valid:** Get existing anchor
- [ ] **Invalid:** Get non-existent anchor (404)
- [ ] **Invalid:** Get anchor from different user (403)
- [ ] **Edge:** Get anchor with special characters in ID
- [ ] **Verify:** Returns full anchor data

#### **PUT `/hash-sphere/anchors/{id}/hierarchy`**
- [ ] **Valid:** Set parent anchor
- [ ] **Valid:** Set child anchors
- [ ] **Valid:** Set both parent and children
- [ ] **Invalid:** Parent ID doesn't exist
- [ ] **Invalid:** Child ID doesn't exist
- [ ] **Invalid:** Circular parent-child relationship
- [ ] **Empty:** Set parent to null
- [ ] **Edge:** Deep hierarchy (3+ levels)
- [ ] **Verify:** Hierarchy relationships saved correctly

#### **POST `/hash-sphere/anchors/{id}/relationships`**
- [ ] **Valid:** Add related anchor
- [ ] **Valid:** Add relationship with type "similar"
- [ ] **Valid:** Add relationship with type "opposite"
- [ ] **Invalid:** Related anchor doesn't exist
- [ ] **Invalid:** Self-relationship
- [ ] **Edge:** Multiple relationships to same anchor
- [ ] **Verify:** Bidirectional relationship created

#### **POST `/hash-sphere/anchors/merge`**
- [ ] **Valid:** Merge 2 anchors
- [ ] **Valid:** Merge 3+ anchors
- [ ] **Valid:** Merge with target_anchor_id
- [ ] **Invalid:** Merge single anchor
- [ ] **Invalid:** Merge non-existent anchors
- [ ] **Invalid:** Merge anchors from different users
- [ ] **Edge:** Merge anchors with relationships
- [ ] **Verify:** Merged anchor contains all data, sources deleted

#### **POST `/hash-sphere/anchors/{id}/split`**
- [ ] **Valid:** Split anchor into 2 parts
- [ ] **Valid:** Split anchor into 3+ parts
- [ ] **Invalid:** Split with single split_text
- [ ] **Invalid:** Split non-existent anchor
- [ ] **Empty:** Split with empty split_texts
- [ ] **Edge:** Split anchor with children
- [ ] **Verify:** New anchors created, original has children

#### **POST `/hash-sphere/clusters`**
- [ ] **Valid:** Create cluster with name
- [ ] **Valid:** Create cluster with initial anchors
- [ ] **Valid:** Create cluster with personality_traits
- [ ] **Invalid:** Missing cluster_name
- [ ] **Invalid:** cluster_name > 255 chars
- [ ] **Invalid:** anchor_ids don't exist
- [ ] **Empty:** Empty cluster_name
- [ ] **Edge:** Cluster with 0 anchors
- [ ] **Edge:** Cluster with 100+ anchors
- [ ] **Verify:** Cluster created with hash, center coordinates

#### **PUT `/hash-sphere/clusters/{id}`**
- [ ] **Valid:** Update cluster name
- [ ] **Valid:** Update personality_traits
- [ ] **Valid:** Update metadata
- [ ] **Invalid:** Update non-existent cluster
- [ ] **Invalid:** Update cluster from different user
- [ ] **Edge:** Update with empty name
- [ ] **Verify:** Changes saved correctly

#### **DELETE `/hash-sphere/clusters/{id}`**
- [ ] **Valid:** Delete existing cluster
- [ ] **Invalid:** Delete non-existent cluster (404)
- [ ] **Invalid:** Delete cluster from different user (403)
- [ ] **Edge:** Delete cluster with many anchors
- [ ] **Verify:** Cluster deleted, anchors not deleted

#### **POST `/hash-sphere/clusters/{id}/anchors`**
- [ ] **Valid:** Add anchor to cluster
- [ ] **Invalid:** Add non-existent anchor
- [ ] **Invalid:** Add anchor from different user
- [ ] **Edge:** Add anchor already in cluster
- [ ] **Verify:** anchor_count increased

#### **DELETE `/hash-sphere/clusters/{id}/anchors/{anchor_id}`**
- [ ] **Valid:** Remove anchor from cluster
- [ ] **Invalid:** Remove non-existent anchor
- [ ] **Invalid:** Remove anchor not in cluster
- [ ] **Edge:** Remove last anchor from cluster
- [ ] **Verify:** anchor_count decreased

---

### **2. RAG/Memory Endpoints**

#### **POST `/rag/memories`**
- [ ] **Valid:** Create memory with content
- [ ] **Valid:** Create memory with metadata
- [ ] **Valid:** Create shared memory
- [ ] **Valid:** Create public memory
- [ ] **Valid:** Create memory with language
- [ ] **Invalid:** Missing content
- [ ] **Invalid:** Empty content
- [ ] **Invalid:** Content > max length
- [ ] **Edge:** Memory with very long content
- [ ] **Edge:** Memory with special characters
- [ ] **Edge:** Memory with unicode
- [ ] **Verify:** Memory created with hash, XYZ, language detected

#### **GET `/rag/memories`**
- [ ] **Valid:** List all memories
- [ ] **Valid:** List with pagination
- [ ] **Valid:** List with limit
- [ ] **Invalid:** limit > 200
- [ ] **Edge:** List with no memories
- [ ] **Verify:** Returns correct structure

#### **GET `/rag/memories/{id}`**
- [ ] **Valid:** Get existing memory
- [ ] **Invalid:** Get non-existent memory (404)
- [ ] **Invalid:** Get memory from different user (403)
- [ ] **Verify:** Returns full memory data

#### **PUT `/rag/memories/{id}`**
- [ ] **Valid:** Update memory content
- [ ] **Valid:** Update metadata
- [ ] **Valid:** Update sharing settings
- [ ] **Invalid:** Update non-existent memory
- [ ] **Invalid:** Update with empty content
- [ ] **Edge:** Update triggers spin/drift
- [ ] **Verify:** Hash/XYZ recalculated, transition dynamics applied

#### **PATCH `/rag/memories/{id}`**
- [ ] **Valid:** Partial update metadata
- [ ] **Valid:** Partial update sharing
- [ ] **Invalid:** Partial update non-existent memory
- [ ] **Edge:** Partial update with empty metadata
- [ ] **Verify:** Only specified fields updated

#### **DELETE `/rag/memories/{id}`**
- [ ] **Valid:** Delete existing memory
- [ ] **Invalid:** Delete non-existent memory (404)
- [ ] **Invalid:** Delete memory from different user (403)
- [ ] **Verify:** Memory deleted

#### **POST `/rag/memories/search`**
- [ ] **Valid:** Semantic search
- [ ] **Valid:** Hybrid search
- [ ] **Valid:** Text-only search
- [ ] **Valid:** Search with date filter
- [ ] **Valid:** Search with cluster filter
- [ ] **Valid:** Search with anchor filter
- [ ] **Valid:** Search with language filter
- [ ] **Valid:** Search with min_resonance
- [ ] **Valid:** Search with min_proximity
- [ ] **Invalid:** Invalid search_type
- [ ] **Invalid:** min_resonance < 0 or > 1
- [ ] **Empty:** Empty query
- [ ] **Edge:** Search with all filters
- [ ] **Edge:** Search with no results
- [ ] **Verify:** Results ranked correctly

#### **POST `/rag/memories/batch`**
- [ ] **Valid:** Batch create
- [ ] **Valid:** Batch update
- [ ] **Valid:** Batch delete
- [ ] **Invalid:** Batch with invalid IDs
- [ ] **Invalid:** Batch with empty array
- [ ] **Edge:** Batch with 100+ items
- [ ] **Verify:** Batch results correct

#### **GET `/rag/memories/shared`**
- [ ] **Valid:** Get shared memories
- [ ] **Valid:** Get org-shared memories
- [ ] **Valid:** Get user-shared memories
- [ ] **Valid:** Get public memories
- [ ] **Edge:** No shared memories
- [ ] **Verify:** Returns correct shared memories

#### **GET `/rag/memories/public`**
- [ ] **Valid:** Get public memory library
- [ ] **Edge:** No public memories
- [ ] **Verify:** Returns only public memories

#### **GET `/rag/analytics?days=30`**
- [ ] **Valid:** Get analytics for 30 days
- [ ] **Valid:** Get analytics for 7 days
- [ ] **Valid:** Get analytics for 90 days
- [ ] **Invalid:** days < 1
- [ ] **Invalid:** days > 365
- [ ] **Edge:** Analytics with no data
- [ ] **Verify:** All metrics calculated correctly

#### **GET `/rag/export/memories?format=json`**
- [ ] **Valid:** Export as JSON
- [ ] **Valid:** Export as CSV
- [ ] **Invalid:** Invalid format
- [ ] **Edge:** Export with no memories
- [ ] **Verify:** File downloads correctly

#### **POST `/rag/import/memories`**
- [ ] **Valid:** Import JSON export
- [ ] **Valid:** Import with overwrite=false
- [ ] **Valid:** Import with overwrite=true
- [ ] **Invalid:** Invalid JSON format
- [ ] **Invalid:** Missing required fields
- [ ] **Edge:** Import large file
- [ ] **Verify:** Memories imported correctly

---

### **3. Resonant Chat Endpoints**

#### **POST `/resonant-chat/conversations`**
- [ ] **Valid:** Create new conversation
- [ ] **Valid:** Create with title
- [ ] **Invalid:** Missing required fields
- [ ] **Edge:** Create with very long title
- [ ] **Verify:** Conversation created

#### **GET `/resonant-chat/conversations`**
- [ ] **Valid:** List all conversations
- [ ] **Valid:** List with pagination
- [ ] **Edge:** No conversations
- [ ] **Verify:** Returns correct structure

#### **POST `/resonant-chat/conversations/{id}/messages`**
- [ ] **Valid:** Send user message
- [ ] **Valid:** Send with context
- [ ] **Invalid:** Missing content
- [ ] **Invalid:** Empty content
- [ ] **Invalid:** Non-existent conversation
- [ ] **Edge:** Very long message
- [ ] **Verify:** Message stored, AI response generated, anchors created

#### **GET `/resonant-chat/conversations/{id}/messages`**
- [ ] **Valid:** Get message history
- [ ] **Invalid:** Non-existent conversation
- [ ] **Edge:** Empty conversation
- [ ] **Verify:** Messages include XYZ, evidence_graph

#### **GET `/resonant-chat/evidence-graph/{message_id}`**
- [ ] **Valid:** Get evidence graph
- [ ] **Invalid:** Non-existent message
- [ ] **Edge:** Message with no evidence graph
- [ ] **Verify:** Returns safe visualization data (NO weights)

#### **GET `/resonant-chat/anchors`**
- [ ] **Valid:** List memory anchors
- [ ] **Edge:** No anchors
- [ ] **Verify:** Returns anchors with XYZ

#### **GET `/resonant-chat/clusters`**
- [ ] **Valid:** List resonance clusters
- [ ] **Edge:** No clusters
- [ ] **Verify:** Returns clusters with centers

---

### **4. WebSocket/SSE Endpoints**

#### **WebSocket `/ws/resonant-chat/{chat_id}`**
- [ ] **Valid:** Connect to WebSocket
- [ ] **Valid:** Send message
- [ ] **Valid:** Receive streaming chunks
- [ ] **Invalid:** Connect with invalid chat_id
- [ ] **Invalid:** Connect without auth
- [ ] **Edge:** Send very long message
- [ ] **Edge:** Connection timeout
- [ ] **Verify:** Auto-reconnect works

#### **SSE `/sse/resonant-chat/{chat_id}`**
- [ ] **Valid:** Connect to SSE
- [ ] **Valid:** Receive events
- [ ] **Invalid:** Invalid chat_id
- [ ] **Edge:** Connection drops
- [ ] **Verify:** Events stream correctly

---

### **5. Code Features Endpoints**

#### **POST `/code/diff`**
- [ ] **Valid:** Generate diff for code
- [ ] **Invalid:** Missing original_code
- [ ] **Invalid:** Missing modified_code
- [ ] **Edge:** Very large code files
- [ ] **Verify:** Unified diff, HTML diff, line changes, stats

#### **POST `/code/review`**
- [ ] **Valid:** Review code
- [ ] **Invalid:** Missing code
- [ ] **Edge:** Review very large file
- [ ] **Verify:** Suggestions, quality_score, issues, improvements

#### **POST `/code/test`**
- [ ] **Valid:** Generate tests
- [ ] **Valid:** Generate with test_framework
- [ ] **Invalid:** Missing code
- [ ] **Edge:** Generate tests for complex code
- [ ] **Verify:** Test code generated, test_results (if available)

#### **POST `/code/quality`**
- [ ] **Valid:** Analyze code quality
- [ ] **Invalid:** Missing code
- [ ] **Edge:** Analyze very large file
- [ ] **Verify:** Metrics, complexity, maintainability_index, issues

#### **POST `/code/dependencies/analyze`**
- [ ] **Valid:** Analyze dependencies
- [ ] **Invalid:** Invalid project_id
- [ ] **Edge:** Project with no dependencies
- [ ] **Verify:** Dependencies, graph, circular deps, unused deps

---

### **6. Rate Limiting Dashboard**

#### **GET `/rate-limit/status`**
- [ ] **Valid:** Get rate limit status
- [ ] **Verify:** Returns tier, limit, remaining, reset_at

#### **GET `/rate-limit/history?period=hour`**
- [ ] **Valid:** Get hourly history
- [ ] **Valid:** Get daily history
- [ ] **Valid:** Get weekly history
- [ ] **Invalid:** Invalid period
- [ ] **Verify:** Returns historical data

#### **GET `/rate-limit/settings`**
- [ ] **Valid:** Get settings
- [ ] **Verify:** Returns all tier limits, environment

#### **PUT `/rate-limit/settings`**
- [ ] **Valid:** Update settings (admin)
- [ ] **Invalid:** Non-admin access (403)
- [ ] **Invalid:** Invalid limit values
- [ ] **Verify:** Settings updated

---

## 📌 **LAYER B — Subsystem Integration Tests**

**Purpose:** Verify components work together correctly.

---

### **1. HashSphere + Anchor System Integration**

- [ ] **Create anchor → Verify in HashSphere**
  - [ ] Create anchor via API
  - [ ] Verify anchor appears in HashSphere visualization
  - [ ] Verify XYZ coordinates match
  - [ ] Verify hash matches

- [ ] **Update anchor → Verify HashSphere updates**
  - [ ] Update anchor importance_score
  - [ ] Verify HashSphere reflects change
  - [ ] Verify position updates (if applicable)

- [ ] **Delete anchor → Verify HashSphere removes**
  - [ ] Delete anchor
  - [ ] Verify anchor removed from HashSphere
  - [ ] Verify no orphaned references

- [ ] **Anchor hierarchy → Verify relationships**
  - [ ] Create parent-child relationships
  - [ ] Verify hierarchy in HashSphere
  - [ ] Verify parent/child links work

- [ ] **Anchor merge → Verify consolidation**
  - [ ] Merge multiple anchors
  - [ ] Verify merged anchor in HashSphere
  - [ ] Verify source anchors removed
  - [ ] Verify relationships preserved

---

### **2. Evidence Graph Consistency**

- [ ] **Node creation → Verify consistency**
  - [ ] Create message with evidence graph
  - [ ] Verify nodes created correctly
  - [ ] Verify node IDs are unique
  - [ ] Verify node types correct

- [ ] **Edge creation → Verify connections**
  - [ ] Create edges between nodes
  - [ ] Verify edges are bidirectional
  - [ ] Verify edge types correct
  - [ ] Verify no self-loops (unless intentional)

- [ ] **Graph retrieval → Verify structure**
  - [ ] Retrieve evidence graph
  - [ ] Verify nodes match messages
  - [ ] Verify edges match relationships
  - [ ] Verify NO sensitive weights exposed

- [ ] **Graph updates → Verify sync**
  - [ ] Update message
  - [ ] Verify evidence graph updates
  - [ ] Verify nodes/edges consistent

---

### **3. Spin/Drift Transition Dynamics**

- [ ] **Memory update → Verify spin applied**
  - [ ] Update memory content
  - [ ] Verify XYZ coordinates rotated (spin)
  - [ ] Verify rotation is smooth
  - [ ] Verify spin_vector applied correctly

- [ ] **Memory update → Verify drift applied**
  - [ ] Update memory content
  - [ ] Verify XYZ coordinates drift toward new position
  - [ ] Verify drift_factor applied
  - [ ] Verify decay is gradual

- [ ] **Stability calculation → Verify metric**
  - [ ] Calculate stability for memory
  - [ ] Verify stability score in range [0, 1]
  - [ ] Verify stability reflects position relative to anchor

- [ ] **Multiple updates → Verify cumulative effects**
  - [ ] Update memory multiple times
  - [ ] Verify spin/drift accumulate correctly
  - [ ] Verify no position jumps

---

### **4. Memory CRUD + Visualization Sync**

- [ ] **Create memory → Verify in visualization**
  - [ ] Create memory via API
  - [ ] Verify memory appears in HashSphere
  - [ ] Verify XYZ coordinates correct
  - [ ] Verify hash matches

- [ ] **Update memory → Verify visualization updates**
  - [ ] Update memory content
  - [ ] Verify HashSphere position updates
  - [ ] Verify transition dynamics applied
  - [ ] Verify no flickering

- [ ] **Delete memory → Verify removal**
  - [ ] Delete memory
  - [ ] Verify removed from HashSphere
  - [ ] Verify no orphaned references

- [ ] **Batch operations → Verify sync**
  - [ ] Batch create memories
  - [ ] Verify all appear in visualization
  - [ ] Verify performance acceptable

---

### **5. Code Features Execution**

- [ ] **Code completion → Verify execution**
  - [ ] Request code completion
  - [ ] Verify completion generated
  - [ ] Verify context used correctly
  - [ ] Verify Hash Sphere memory used

- [ ] **Code generation → Verify output**
  - [ ] Generate code from description
  - [ ] Verify code is valid
  - [ ] Verify code matches description
  - [ ] Verify anchors created

- [ ] **Code refactoring → Verify changes**
  - [ ] Refactor code
  - [ ] Verify diff generated
  - [ ] Verify refactored code works
  - [ ] Verify safety checks passed

- [ ] **Code execution → Verify results**
  - [ ] Execute code
  - [ ] Verify output correct
  - [ ] Verify errors handled
  - [ ] Verify timeout works

---

### **6. Real-Time Stream Data**

- [ ] **WebSocket → Verify data format**
  - [ ] Connect WebSocket
  - [ ] Send message
  - [ ] Verify streaming chunks format
  - [ ] Verify NO sensitive data in stream
  - [ ] Verify only safe visualization data

- [ ] **SSE → Verify event format**
  - [ ] Connect SSE
  - [ ] Verify events format
  - [ ] Verify NO sensitive data
  - [ ] Verify event types correct

- [ ] **Memory updates → Verify broadcast**
  - [ ] Update memory
  - [ ] Verify update broadcast to all clients
  - [ ] Verify data format correct
  - [ ] Verify no data leaks

- [ ] **Cluster transitions → Verify updates**
  - [ ] Update cluster
  - [ ] Verify transition broadcast
  - [ ] Verify visualization updates
  - [ ] Verify consistency

---

## 📌 **LAYER C — UI/Frontend Binding Tests**

**⚠️ ONLY START AFTER LAYERS A & B PASS**

---

### **1. UI Rendering**

- [ ] **Login page renders**
- [ ] **Dashboard pages render**
- [ ] **Resonant Chat page renders**
- [ ] **Hash Sphere visualization renders**
- [ ] **Evidence Graph visualization renders**
- [ ] **No console errors**
- [ ] **No layout breaks**

### **2. Memory Book Loading**

- [ ] **Memories load correctly**
- [ ] **Pagination works**
- [ ] **Filters work**
- [ ] **Search works**
- [ ] **Sorting works**

### **3. Hash Sphere Visualization**

- [ ] **3D visualization displays**
- [ ] **Points render correctly**
- [ ] **Click interactions work**
- [ ] **Toggle controls work**
- [ ] **No sensitive data exposed**

### **4. Evidence Graph Edges**

- [ ] **Graph renders**
- [ ] **Nodes clickable**
- [ ] **Edges visible**
- [ ] **Interactive exploration works**

### **5. Real-Time Response**

- [ ] **WebSocket connects**
- [ ] **Streaming works**
- [ ] **UI updates in real-time**
- [ ] **Reconnection works**

### **6. Multi-Language Switching**

- [ ] **Language detection works**
- [ ] **Language filter works**
- [ ] **Multi-language content displays**

### **7. Code IDE Agent**

- [ ] **Code completion works**
- [ ] **Code generation works**
- [ ] **Code review displays**
- [ ] **Code quality metrics display**

### **8. Export/Import**

- [ ] **Export downloads file**
- [ ] **Import uploads file**
- [ ] **Data integrity maintained**

### **9. Pagination + Filters**

- [ ] **Pagination controls work**
- [ ] **All filters work**
- [ ] **Filter combinations work**

### **10. Unsafe Data Protection Test**

- [ ] **NO importance_score in frontend**
- [ ] **NO resonance_score in frontend**
- [ ] **NO embedding vectors in frontend**
- [ ] **NO evidence graph weights in frontend**
- [ ] **NO routing constants in frontend**

### **11. Cross-Browser Checks**

- [ ] **Chrome works**
- [ ] **Firefox works**
- [ ] **Safari works**
- [ ] **Edge works**

---

## ✅ **TESTING COMPLETION CHECKLIST**

- [ ] **Layer A:** All backend functional tests pass
- [ ] **Layer B:** All subsystem integration tests pass
- [ ] **Layer C:** All UI/frontend binding tests pass
- [ ] **Documentation:** All issues documented
- [ ] **Performance:** All performance tests pass
- [ ] **Security:** All security tests pass

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Failed

