# 🔒 Security: Data Protection & Competitive Advantage

**Date:** 2025-01-30  
**Status:** Critical - Do Not Expose Sensitive Data

---

## 🚨 **HIGH-RISK DATA - NEVER EXPOSE ON FRONTEND**

### **❌ 1. Anchor Matrix (Exact Numerical Values)**

**What NOT to expose:**
- ❌ Calibrated semantic fields
- ❌ Anchor embeddings (full vectors)
- ❌ Energy function parameters (β, α values)
- ❌ Anchor → universe relationships (exact mappings)
- ❌ Fusion layer weights (α = 0.9)

**What IS safe to expose:**
- ✅ Hash values (SHA-256, deterministic but not reversible)
- ✅ XYZ coordinates (3D projection, not full embedding)
- ✅ Visual positions (for visualization only)
- ✅ Anchor text (user content, not embeddings)

---

### **❌ 2. Evidence Graph (Full Memory + Node Weights)**

**What NOT to expose:**
- ❌ Node weights (w_ij values)
- ❌ Edge weights (cosine similarity scores)
- ❌ Full memory content (unless user's own)
- ❌ Internal reasoning chains
- ❌ Persistent memory structure
- ❌ Alignment structure

**What IS safe to expose:**
- ✅ Visual graph structure (nodes and edges, no weights)
- ✅ User's own messages (already visible)
- ✅ Cluster names (user-defined)
- ✅ Counts (number of nodes, edges)

---

### **❌ 3. Vector Store / Embedding Database**

**What NOT to expose:**
- ❌ Full embedding vectors (any dimension)
- ❌ Indexed text content (unless user's own)
- ❌ Meaning encodings
- ❌ Model's knowledge state
- ❌ Database structure

**What IS safe to expose:**
- ✅ XYZ coordinates (3D projection only)
- ✅ Hash values (not reversible to content)
- ✅ User's own content (already visible)
- ✅ Visual positions (for visualization)

---

### **❌ 4. Multi-LLM Routing Constants & Correction λ**

**What NOT to expose:**
- ❌ Lambda (λ) correction values
- ❌ Routing decision logic
- ❌ Provider selection algorithms
- ❌ Consistency checking formulas
- ❌ Output correction equations

**What IS safe to expose:**
- ✅ Selected provider name (user already knows)
- ✅ Response content (already visible)
- ✅ Quality scores (general metrics, not formulas)

---

## ✅ **CURRENT IMPLEMENTATION STATUS**

### **Hash Sphere Visualization**

**Currently Exposed:**
- ✅ Hash values (SHA-256) - **SAFE** (not reversible)
- ✅ XYZ coordinates (3D) - **SAFE** (projection only, not full embedding)
- ✅ Visual positions - **SAFE** (for visualization)
- ✅ Message content - **SAFE** (user's own content)
- ✅ Anchor text - **SAFE** (user's own content)
- ⚠️ `importance_score` - **REVIEW** (might reveal calibration)
- ⚠️ `resonance_score` - **REVIEW** (might reveal energy functions)

**Recommendation:**
- Remove or round `importance_score` and `resonance_score` from visualization
- Only show relative positions, not exact scores
- Use normalized/rounded values if scores are needed

---

### **Backend API Responses**

**Currently Exposed:**
- ✅ `hash` - **SAFE** (SHA-256)
- ✅ `xyz` - **SAFE** (3D projection)
- ⚠️ `resonance_score` - **REVIEW** (might reveal energy function)
- ⚠️ `importance_score` - **REVIEW** (might reveal calibration)

**Recommendation:**
- Round scores to 2-3 decimal places
- Or remove scores from public endpoints
- Only include in authenticated admin endpoints

---

## 🛡️ **SECURITY MEASURES IMPLEMENTED**

### **1. Hash Sphere Integration Component**

**Filters Applied:**
- ✅ Only shows XYZ coordinates (3D projection)
- ✅ Only shows hash values (not embeddings)
- ✅ Only shows user's own content
- ⚠️ **TODO:** Remove or round `importance_score` and `resonance_score`

### **2. Backend API**

**Filters Applied:**
- ✅ Only returns user's own data (user isolation)
- ✅ XYZ coordinates are 3D projections (not full embeddings)
- ⚠️ **TODO:** Round or remove sensitive scores

---

## 📋 **ACTION ITEMS**

### **Immediate (High Priority):**

1. **Remove sensitive scores from visualization**
   - Remove `importance_score` from HashSphereIntegration
   - Remove `resonance_score` from HashSphereIntegration
   - Or round to 2 decimal places if needed for UX

2. **Backend API sanitization**
   - Round `resonance_score` to 2 decimal places
   - Round `importance_score` to 2 decimal places
   - Or remove from public endpoints

3. **Documentation**
   - Add comments in code about what's safe to expose
   - Add security review checklist

### **Future (Medium Priority):**

4. **Evidence Graph Visualization**
   - When implemented, only show structure (no weights)
   - No edge weights in visualization
   - No node weights in visualization

5. **Admin-only endpoints**
   - Create separate admin endpoints for sensitive data
   - Require special permissions for exact values

---

## 🔍 **CODE REVIEW CHECKLIST**

Before exposing any data on frontend, verify:

- [ ] Is this a full embedding vector? → **REMOVE**
- [ ] Is this an exact energy function value? → **REMOVE or ROUND**
- [ ] Is this a routing constant (λ, α, β)? → **REMOVE**
- [ ] Is this an edge/node weight? → **REMOVE**
- [ ] Is this a hash value? → **OK** (not reversible)
- [ ] Is this a 3D coordinate (XYZ)? → **OK** (projection only)
- [ ] Is this user's own content? → **OK** (already visible)

---

## 📝 **NOTES**

- **Hash values are safe** - SHA-256 is deterministic but not reversible to content
- **XYZ coordinates are safe** - 3D projection doesn't reveal full embedding
- **Visual positions are safe** - Only for visualization, not for reconstruction
- **User content is safe** - User already has access to their own data

---

**Last Updated:** 2025-01-30  
**Status:** ✅ Most protections in place, ⚠️ Scores need review

