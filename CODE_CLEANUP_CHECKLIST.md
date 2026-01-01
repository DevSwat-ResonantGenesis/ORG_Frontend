# 🧹 Code Cleanup Checklist

**Date:** 2025-01-30  
**Status:** Identifying cleanup opportunities

---

## 🔍 **Issues Found**

### **Frontend Issues:**

#### **1. Console.log Statements (10 found)**
**Location:** `src/pages/Dashboards/UnifiedOrgAdminDashboard-2025.tsx`
- Line 59: `console.log('[Dashboard] Session check:')`
- Line 67: `console.log('[Dashboard] Not authenticated, redirecting to login')`
- Line 72: `console.log('[Dashboard] Authenticated, loading data...')`
- Line 94: `console.log('[Dashboard] Already loading, skipping...')`
- Line 100: `console.log('[Dashboard] Data already loaded, skipping...')`
- Line 104: `console.log('[Dashboard] Starting to load dashboard data...')`
- Line 170: `console.log('[Dashboard] ✅ Data loaded successfully')`
- Line 173: `console.error('[Dashboard] ❌ Error loading data:', err)`
- Line 197: `console.log('[Dashboard] Loading state set to false')`

**Location:** `src/components/layout/Header/Header.tsx`
- Line 136: `console.error('Logout error:', error)`

**Action:** Replace with `logger` from `@/utils/logger`

---

#### **2. TODO/FIXME Comments (3 found)**
- `src/pages/Dashboards/UnifiedOrgAdminDashboard-2025.tsx:58` - Debug logging comment
- `src/utils/apiConnectionTest.ts:137` - Debugging comment
- `src/api/fastapiClient.ts:8` - Debugging comment

**Action:** Review and either implement or remove

---

### **Backend Issues:**

#### **1. Pydantic Warnings (ML Worker)**
**Location:** ML Worker logs show:
```
Field "model_version_id" has conflict with protected namespace "model_".
```

**Action:** Fix Pydantic model configuration

---

## 📋 **Cleanup Tasks**

### **Frontend:**
- [ ] Replace `console.log` with `logger` in dashboard
- [ ] Replace `console.error` with `logger.error` in header
- [ ] Review and clean up TODO/FIXME comments
- [ ] Remove unused imports
- [ ] Remove commented code
- [ ] Fix TypeScript errors (if any)

### **Backend:**
- [ ] Fix Pydantic model warnings
- [ ] Remove unused imports
- [ ] Remove commented code
- [ ] Add missing docstrings
- [ ] Standardize error handling
- [ ] Fix Python linting errors

---

## 🚀 **Execution Order**

1. **Test features first** (Resonant Chat, ML)
2. **Then clean code** (after confirming everything works)
3. **Commit cleaned code**

---

## 📝 **Notes**

- Keep debug logging for now (useful for testing)
- Replace with proper logger after testing
- Don't remove TODO comments that are still relevant
- Document any removed features

