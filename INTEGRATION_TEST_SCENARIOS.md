# 🔗 Integration Test Scenarios (Backend Only)

**Purpose:** Simulate complete user workflows to verify internal consistency.

---

## 📋 **Test Scenarios**

### **1. Full Memory Creation Flow**

**Steps:**
1. Create memory via `/rag/memories`
2. Verify memory stored in database
3. Verify hash calculated
4. Verify XYZ coordinates generated
5. Verify language detected
6. Verify memory appears in search
7. Verify memory appears in analytics

**Expected:**
- Memory created with all fields
- Hash matches content
- XYZ coordinates in valid range [0, 1]
- Language metadata present
- Searchable immediately
- Counted in analytics

---

### **2. Anchor Switching Flow**

**Steps:**
1. Create anchor A
2. Create anchor B
3. Create memory M1 near anchor A
4. Switch memory M1 to anchor B (update)
5. Verify memory M1 drifts toward anchor B
6. Verify anchor relationships updated
7. Verify cluster assignments updated

**Expected:**
- Memory position updates smoothly
- Drift applied correctly
- Anchor relationships maintained
- Cluster centers recalculated

---

### **3. Evidence Graph Routing Flow**

**Steps:**
1. Create conversation
2. Send user message
3. AI generates response
4. Evidence graph built
5. Retrieve evidence graph
6. Verify nodes match messages
7. Verify edges match relationships
8. Verify NO weights exposed

**Expected:**
- Evidence graph structure correct
- Nodes represent messages/memories
- Edges represent relationships
- Only safe visualization data returned

---

### **4. Drift/Spin Transition Flow**

**Steps:**
1. Create memory M1 at position P1
2. Create anchor A at position PA
3. Update memory M1 content
4. Verify spin applied (rotation)
5. Verify drift applied (toward new position)
6. Calculate stability
7. Verify stability reflects position

**Expected:**
- Spin rotates memory position
- Drift moves memory toward new position
- Stability calculated correctly
- No position jumps

---

### **5. Export/Import Flow**

**Steps:**
1. Create 10 memories
2. Create 5 anchors
3. Create 2 clusters
4. Export memories as JSON
5. Export anchors as JSON
6. Export clusters as JSON
7. Delete all memories/anchors/clusters
8. Import memories JSON
9. Import anchors JSON
10. Import clusters JSON
11. Verify all data restored

**Expected:**
- Export files generated correctly
- Import restores all data
- Relationships preserved
- Hashes match
- XYZ coordinates preserved

---

### **6. Multi-Language Flow**

**Steps:**
1. Create memory in English
2. Create memory in Spanish
3. Create memory in Chinese
4. Search with language filter (English)
5. Verify only English memory returned
6. Search with language filter (Spanish)
7. Verify only Spanish memory returned
8. Create anchor in Japanese
9. Verify language detected correctly

**Expected:**
- Languages detected correctly
- Language filters work
- Multi-language content handled
- Language metadata stored

---

### **7. Advanced Search Query Flow**

**Steps:**
1. Create memories with different:
   - Clusters (alpha, beta, gamma)
   - Anchors (A1, A2, A3)
   - Languages (en, es, fr)
   - Dates (last week, last month)
   - Resonance scores (0.3, 0.5, 0.8)
2. Search with semantic query
3. Search with hybrid query
4. Search with text-only query
5. Search with all filters combined
6. Verify results ranked correctly
7. Verify filters applied correctly

**Expected:**
- Semantic search finds relevant memories
- Hybrid search combines text + semantic
- Filters work correctly
- Results ranked by relevance
- No false positives

---

### **8. Rate-Limiting Test Flow**

**Steps:**
1. Get current rate limit status
2. Make requests up to limit
3. Verify remaining count decreases
4. Make request beyond limit
5. Verify 429 Too Many Requests
6. Wait for reset
7. Verify limit reset
8. Update rate limit settings (admin)
9. Verify new limits applied

**Expected:**
- Rate limits enforced correctly
- Status updates in real-time
- 429 returned when limit exceeded
- Reset works correctly
- Settings update works (admin)

---

### **9. Code Analysis Flow**

**Steps:**
1. Index code files
2. Generate code from description
3. Review generated code
4. Generate tests for code
5. Analyze code quality
6. Analyze dependencies
7. Refactor code
8. Generate diff
9. Execute code
10. Verify all steps complete

**Expected:**
- Code indexed correctly
- Code generation works
- Review provides suggestions
- Tests generated correctly
- Quality metrics calculated
- Dependencies analyzed
- Refactoring works
- Diff generated correctly
- Code executes successfully

---

### **10. Memory Sharing Flow**

**Steps:**
1. Create memory M1 (private)
2. Create memory M2 (shared with org)
3. Create memory M3 (public)
4. Create memory M4 (shared with user U2)
5. Login as user U2
6. Get shared memories
7. Verify M2, M3, M4 visible
8. Verify M1 NOT visible
9. Get public memories
10. Verify M3 visible

**Expected:**
- Sharing settings work correctly
- Org-shared memories visible to org members
- Public memories visible to all
- User-shared memories visible to specified users
- Private memories only visible to owner

---

### **11. Anchor Hierarchy Flow**

**Steps:**
1. Create anchor A1 (parent)
2. Create anchor A2 (child of A1)
3. Create anchor A3 (child of A1)
4. Create anchor A4 (child of A2)
5. Verify hierarchy structure
6. Merge A2 and A3
7. Verify merged anchor has A1 as parent
8. Split A1 into A1a and A1b
9. Verify A2 and A3 have new parents
10. Verify hierarchy maintained

**Expected:**
- Hierarchy relationships correct
- Merge preserves hierarchy
- Split maintains hierarchy
- Parent-child links work

---

### **12. Cluster Management Flow**

**Steps:**
1. Create cluster C1
2. Create anchors A1, A2, A3
3. Add A1, A2 to C1
4. Verify anchor_count = 2
5. Add A3 to C1
6. Verify anchor_count = 3
7. Remove A2 from C1
8. Verify anchor_count = 2
9. Update cluster name
10. Delete cluster C1
11. Verify anchors NOT deleted

**Expected:**
- Cluster operations work correctly
- Anchor count updates correctly
- Cluster updates work
- Deleting cluster doesn't delete anchors

---

### **13. Real-Time Update Flow**

**Steps:**
1. Connect WebSocket to chat
2. Send message
3. Verify streaming chunks received
4. Create memory via API
5. Verify memory update event received
6. Update cluster via API
7. Verify cluster update event received
8. Disconnect WebSocket
9. Reconnect WebSocket
10. Verify reconnection works

**Expected:**
- WebSocket connects successfully
- Streaming works
- Real-time updates received
- Reconnection works
- No data leaks in events

---

### **14. Hyperspherical Coordinates Flow**

**Steps:**
1. Hash text to get XYZ coordinates
2. Convert XYZ to hyperspherical (r, φ, θ)
3. Convert hyperspherical back to XYZ
4. Verify round-trip conversion
5. Verify r = 1.0 (on unit sphere)
6. Verify φ, θ in valid ranges
7. Test with multiple coordinates

**Expected:**
- Conversion works correctly
- Round-trip preserves values
- Coordinates on unit sphere
- Valid ranges maintained

---

### **15. Multi-Method Ranking Flow**

**Steps:**
1. Create memories with different:
   - Resonance scores
   - Proximity to query
   - Anchor associations
   - Cluster memberships
2. Search with multi-method extraction
3. Verify results ranked by:
   - Resonance
   - Proximity
   - Anchor relevance
   - Cluster relevance
4. Verify weighted ranking correct

**Expected:**
- All methods contribute to ranking
- Weighted formula applied correctly
- Results ordered by relevance
- Top results most relevant

---

## ✅ **Integration Test Checklist**

- [ ] Full Memory Creation Flow
- [ ] Anchor Switching Flow
- [ ] Evidence Graph Routing Flow
- [ ] Drift/Spin Transition Flow
- [ ] Export/Import Flow
- [ ] Multi-Language Flow
- [ ] Advanced Search Query Flow
- [ ] Rate-Limiting Test Flow
- [ ] Code Analysis Flow
- [ ] Memory Sharing Flow
- [ ] Anchor Hierarchy Flow
- [ ] Cluster Management Flow
- [ ] Real-Time Update Flow
- [ ] Hyperspherical Coordinates Flow
- [ ] Multi-Method Ranking Flow

---

## 📊 **Success Criteria**

- [ ] All flows complete without errors
- [ ] All data consistent across operations
- [ ] All relationships maintained
- [ ] Performance acceptable
- [ ] No data corruption
- [ ] No memory leaks

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Failed

