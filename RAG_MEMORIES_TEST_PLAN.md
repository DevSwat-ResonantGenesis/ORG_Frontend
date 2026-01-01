# 📚 RAG/Memories Test Plan

**Date:** 2025-01-30  
**Status:** Ready to Test (after anchor list fix)  
**Dependencies:** GET /hash-sphere/anchors list must work first

---

## 🎯 **TESTING STRATEGY**

### **Prerequisites**
1. ✅ Authentication working
2. ✅ Hash Sphere /hash endpoint working
3. ✅ Hash Sphere anchor creation working
4. ⚠️ Hash Sphere anchor list - **BLOCKED** (serialization error)
5. ✅ Hash Sphere clusters working

### **Why Anchor List is Required**
- RAG/Memories depend on anchors for semantic organization
- Memory search uses anchor system
- Memory clustering uses anchor relationships
- Without anchor list, we can't verify full integration

---

## 📋 **ENDPOINTS TO TEST**

### **1. POST `/rag/memories` - Create Memory**

#### **Test Cases:**
- ✅ Valid input with content
- ✅ Valid input with content + metadata
- ✅ Valid input with is_shared=true
- ✅ Valid input with is_public=true
- ✅ Valid input with language specified
- ❌ Missing content field
- ❌ Empty content
- ❌ Content > max length
- 🔍 Very long content (1000+ chars)
- 🔍 Unicode content (Chinese, Arabic, emoji)
- 🔍 Special characters in content

#### **Expected Response:**
```json
{
  "id": "uuid",
  "content": "Memory content",
  "hash": "sha256-hash",
  "xyz": [0.5, 0.3, 0.8],
  "metadata": {},
  "language": "en",
  "created_at": "2025-01-30T...",
  "updated_at": "2025-01-30T..."
}
```

---

### **2. GET `/rag/memories` - List Memories**

#### **Test Cases:**
- ✅ List all memories (default limit)
- ✅ List with limit parameter
- ✅ List with offset parameter
- ✅ List with pagination
- ❌ limit > 200
- ❌ offset < 0
- 🔍 Empty result (no memories)
- 🔍 Very large limit

#### **Expected Response:**
```json
{
  "memories": [
    {
      "id": "uuid",
      "content": "Memory content",
      "hash": "sha256-hash",
      "xyz": [0.5, 0.3, 0.8],
      "metadata": {},
      "created_at": "2025-01-30T..."
    }
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

---

### **3. GET `/rag/memories/{id}` - Get Memory**

#### **Test Cases:**
- ✅ Valid ID - Returns memory
- ❌ Invalid ID - 404 Not Found
- ❌ Non-existent ID - 404 Not Found
- ❌ ID from different user - 403 Forbidden (if applicable)

#### **Expected Response:**
```json
{
  "id": "uuid",
  "content": "Full memory content",
  "hash": "sha256-hash",
  "xyz": [0.5, 0.3, 0.8],
  "hyperspherical": {"r": 1.0, "phi": 0.5, "theta": 0.3},
  "metadata": {},
  "language": "en",
  "is_shared": false,
  "is_public": false,
  "created_at": "2025-01-30T...",
  "updated_at": "2025-01-30T..."
}
```

---

### **4. PUT `/rag/memories/{id}` - Update Memory**

#### **Test Cases:**
- ✅ Update content
- ✅ Update metadata
- ✅ Update sharing settings
- ✅ Update content triggers spin/drift
- ❌ Update non-existent memory - 404
- ❌ Update with empty content - 422
- 🔍 Update triggers position change (verify XYZ changes)

#### **Expected Response:**
```json
{
  "id": "uuid",
  "content": "Updated content",
  "hash": "new-sha256-hash",
  "xyz": [0.6, 0.4, 0.9],  // ← Should change after update
  "metadata": {"updated": true},
  "updated_at": "2025-01-30T..."
}
```

---

### **5. PATCH `/rag/memories/{id}` - Partial Update**

#### **Test Cases:**
- ✅ Partial update metadata only
- ✅ Partial update sharing only
- ✅ Partial update metadata + sharing
- ❌ Partial update non-existent memory - 404
- 🔍 Verify only specified fields updated

---

### **6. DELETE `/rag/memories/{id}` - Delete Memory**

#### **Test Cases:**
- ✅ Delete existing memory - 204 No Content
- ❌ Delete non-existent memory - 404
- ❌ Delete memory from different user - 403 (if applicable)
- 🔍 Verify memory removed from Hash Sphere

---

### **7. POST `/rag/memories/search` - Search Memories**

#### **Test Cases:**
- ✅ Semantic search
- ✅ Hybrid search
- ✅ Text-only search
- ✅ Search with date filter
- ✅ Search with cluster filter
- ✅ Search with anchor filter
- ✅ Search with language filter
- ✅ Search with min_resonance
- ✅ Search with min_proximity
- ❌ Invalid search_type - 422
- ❌ min_resonance < 0 or > 1 - 422
- 🔍 Search with all filters combined
- 🔍 Search with no results

#### **Expected Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "content": "Memory content",
      "hash": "sha256-hash",
      "xyz": [0.5, 0.3, 0.8],
      "resonance_score": 0.85,
      "proximity_score": 0.72,
      "metadata": {}
    }
  ],
  "total": 5,
  "query": "search term",
  "search_type": "hybrid"
}
```

---

### **8. POST `/rag/memories/batch` - Batch Operations**

#### **Test Cases:**
- ✅ Batch create
- ✅ Batch update
- ✅ Batch delete
- ❌ Batch with invalid IDs - 422
- ❌ Batch with empty array - 422
- 🔍 Batch with 100+ items

---

### **9. GET `/rag/memories/shared` - Get Shared Memories**

#### **Test Cases:**
- ✅ Get org-shared memories
- ✅ Get user-shared memories
- ✅ Get all shared memories
- 🔍 No shared memories (empty result)

---

### **10. GET `/rag/memories/public` - Get Public Memories**

#### **Test Cases:**
- ✅ Get public memory library
- 🔍 No public memories (empty result)

---

### **11. GET `/rag/analytics?days=30` - Get Analytics**

#### **Test Cases:**
- ✅ Analytics for 30 days
- ✅ Analytics for 7 days
- ✅ Analytics for 90 days
- ❌ days < 1 - 422
- ❌ days > 365 - 422
- 🔍 Analytics with no data

---

### **12. GET `/rag/export/memories?format=json` - Export Memories**

#### **Test Cases:**
- ✅ Export as JSON
- ✅ Export as CSV
- ❌ Invalid format - 422
- 🔍 Export with no memories

---

### **13. POST `/rag/import/memories` - Import Memories**

#### **Test Cases:**
- ✅ Import JSON export
- ✅ Import with overwrite=false
- ✅ Import with overwrite=true
- ❌ Invalid JSON format - 422
- ❌ Missing required fields - 422
- 🔍 Import large file

---

## 🔍 **INTEGRATION TESTS**

### **Test 1: Memory Creation → Hash Sphere Integration**
1. Create memory via POST /rag/memories
2. Verify memory appears in Hash Sphere
3. Verify XYZ coordinates generated
4. Verify hash matches
5. Verify anchor created (if applicable)

### **Test 2: Memory Update → Spin/Drift**
1. Get memory XYZ coordinates
2. Update memory content
3. Verify XYZ coordinates changed (spin/drift applied)
4. Verify hash recalculated

### **Test 3: Memory Search → Anchor Integration**
1. Create multiple memories
2. Search memories
3. Verify results ranked by resonance
4. Verify anchor relationships used

### **Test 4: Memory Clustering**
1. Create memories with similar content
2. Verify memories cluster together
3. Verify cluster relationships

---

## ⚠️ **BLOCKERS**

### **Current Blockers:**
1. ⚠️ **GET /hash-sphere/anchors list** - Serialization error
   - **Impact:** Cannot verify anchor integration
   - **Workaround:** Can test individual anchor retrieval, but not list

2. ⚠️ **POST /hash-sphere/anchors with importance_score = 1.0**
   - **Impact:** Edge case, doesn't block core testing
   - **Workaround:** Use importance_score = 0.9

---

## 📝 **TEST EXECUTION ORDER**

1. **Basic CRUD Tests:**
   - POST /rag/memories (create)
   - GET /rag/memories (list)
   - GET /rag/memories/{id} (get)
   - PUT /rag/memories/{id} (update)
   - DELETE /rag/memories/{id} (delete)

2. **Search Tests:**
   - POST /rag/memories/search (all search types)

3. **Advanced Tests:**
   - Batch operations
   - Shared/public memories
   - Analytics
   - Export/import

4. **Integration Tests:**
   - Hash Sphere integration
   - Spin/drift transitions
   - Anchor relationships

---

## ✅ **READINESS CHECKLIST**

- [ ] GET /hash-sphere/anchors list fixed
- [ ] Authentication working ✅
- [ ] Hash Sphere /hash working ✅
- [ ] Hash Sphere anchor creation working ✅
- [ ] Test environment ready ✅
- [ ] Test data prepared

---

**Last Updated:** 2025-01-30  
**Status:** Ready to test (after anchor list fix)

