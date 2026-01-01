# 🔍 Dashboard Loading Issue - Full Diagnostic Report

**Date:** 2025-01-30  
**Issue:** Dashboard stuck on "Loading dashboard..." and never loads

---

## 📊 **Current State Analysis**

### **Browser Observations:**
1. ✅ Page loads at `http://localhost:5175/dashboard`
2. ✅ Dashboard components are loaded (UnifiedOrgAdminDashboard-2025.tsx, etc.)
3. ❌ **NO API calls are being made to backend** (no requests to `localhost:8001`)
4. ❌ Main content area is empty (shows "Loading dashboard...")
5. ⚠️ MetaMask error in console (unrelated - browser extension)

### **Network Analysis:**
- ✅ All frontend assets load successfully
- ✅ Dashboard component files load (304 Not Modified)
- ❌ **Zero API requests to `http://localhost:8001`**
- ❌ No `/users`, `/orgs/current`, `/policies`, etc. calls

---

## 🔴 **ROOT CAUSE IDENTIFIED**

### **Problem: Session Check Mismatch**

The dashboard uses **TWO DIFFERENT** session checking systems:

1. **`getSession()` from `utils/auth.ts`** - Checks `localStorage`
2. **`getSessionData()` from `utils/auth-cookies.ts`** - Checks `localStorage` for session metadata

**The Issue:**
- Login flow saves tokens to **HttpOnly cookies** (correct)
- Login flow saves session metadata to `localStorage` as `rg_session_data` (correct)
- But `getSession()` in `UnifiedOrgAdminDashboard-2025.tsx` checks for `rg_access_token` in `localStorage` (WRONG)
- HttpOnly cookies **cannot** be read by JavaScript, so `localStorage.getItem('rg_access_token')` returns `null`
- Dashboard sees `!session` and redirects to login, but redirect might be failing silently

---

## 🔍 **Code Flow Analysis**

### **1. Login Flow (`LoginPage-2025.tsx`):**
```typescript
// After successful login:
saveSessionData(email, role, org_id)  // Saves to localStorage as 'rg_session_data'
// Tokens are saved to HttpOnly cookies by backend
```

### **2. Dashboard Check (`UnifiedOrgAdminDashboard-2025.tsx`):**
```typescript
const session = getSession();  // Checks localStorage for 'rg_access_token'
if (!session) {
  goToLogin(navigate);  // Should redirect, but might not be working
  return;
}
```

### **3. `getSession()` Implementation:**
```typescript
export const getSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);  // 'rg_access_token' - returns NULL!
  
  // Tries to get from 'rg_session_data'
  const sessionDataStr = localStorage.getItem('rg_session_data');
  if (sessionDataStr) {
    const sessionData = JSON.parse(sessionDataStr);
    if (sessionData.email) {
      return { token, email: sessionData.email, ... };  // token is NULL!
    }
  }
  
  // Falls back to legacy storage (also NULL)
  return { token: null, email: null, ... };
};
```

### **4. The Problem:**
- `getSession()` returns `{ token: null, email: 'test@test.com', role: 'org_admin', ... }`
- Dashboard checks `if (!session)` - this is **FALSE** because session object exists (even with null token)
- But then `loadDashboardData()` is called
- API calls fail because there's no token in localStorage (tokens are in HttpOnly cookies)
- **OR** the session check is failing and redirecting, but redirect isn't working

---

## 🐛 **Specific Issues Found**

### **Issue #1: Session Check Logic**
**File:** `src/pages/Dashboards/UnifiedOrgAdminDashboard-2025.tsx:56-60`
```typescript
useEffect(() => {
  if (!session) {  // session is { token: null, email: '...', ... } - NOT null!
    goToLogin(navigate);
    return;
  }
  // ...
}, [session]);
```

**Problem:** `!session` is `false` because session is an object, not null. Should check `!session?.email` or `!session?.token`.

### **Issue #2: Token Not Available**
**File:** `src/utils/auth.ts:15-43`
```typescript
export const getSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);  // Returns NULL - token is in HttpOnly cookie!
  // ...
}
```

**Problem:** Tokens are in HttpOnly cookies (correct for security), but `getSession()` tries to read from localStorage.

### **Issue #3: API Client Not Using Cookies**
**File:** `src/api/fastapiClient.ts`
- Axios should automatically send cookies with `withCredentials: true`
- But if session check fails, API calls never happen

### **Issue #4: Session Check Should Use `auth-cookies.ts`**
**File:** `src/utils/auth-cookies.ts`
- Has `getSessionData()` and `isAuthenticated()` functions
- These check `localStorage.getItem('rg_session_data')` correctly
- Dashboard should use these instead of `getSession()`

---

## ✅ **Solutions**

### **Solution 1: Fix Session Check (IMMEDIATE FIX)**
**File:** `src/pages/Dashboards/UnifiedOrgAdminDashboard-2025.tsx`

**Change:**
```typescript
// BEFORE:
const session = getSession();
if (!session) {
  goToLogin(navigate);
  return;
}

// AFTER:
const session = getSession();
if (!session?.email || !session?.role) {  // Check for actual data, not just object existence
  goToLogin(navigate);
  return;
}
```

### **Solution 2: Use Cookie-Based Auth Check (BETTER FIX)**
**File:** `src/pages/Dashboards/UnifiedOrgAdminDashboard-2025.tsx`

**Change:**
```typescript
// BEFORE:
import { getSession } from '../../utils/auth';

// AFTER:
import { getSessionData, isAuthenticated } from '../../utils/auth-cookies';

// In component:
const session = getSessionData();
if (!isAuthenticated() || !session?.role || !session?.org) {
  goToLogin(navigate);
  return;
}
```

### **Solution 3: Ensure API Client Sends Cookies**
**File:** `src/api/fastapiClient.ts`

**Verify:**
```typescript
const fastapiClient = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,  // MUST be true to send HttpOnly cookies
  // ...
});
```

---

## 📝 **Files That Need Changes**

1. ✅ `src/pages/Dashboards/UnifiedOrgAdminDashboard-2025.tsx` - Fix session check
2. ✅ `src/pages/Dashboards/UnifiedViewerDashboard-2025.tsx` - Fix session check
3. ✅ `src/pages/Dashboards/UnifiedPlatformDevDashboard-2025.tsx` - Fix session check
4. ✅ `src/pages/Dashboards/UnifiedUserDashboard-2025.tsx` - Fix session check
5. ✅ `src/pages/Dashboards/UnifiedComplianceDashboard-2025.tsx` - Fix session check
6. ✅ `src/pages/Dashboards/UnifiedFinanceDashboard-2025.tsx` - Fix session check
7. ✅ `src/pages/Dashboards/UnifiedMLEngineerDashboard-2025.tsx` - Fix session check
8. ✅ `src/api/fastapiClient.ts` - Verify `withCredentials: true`

---

## 🧪 **Testing Steps**

1. **Clear browser storage:**
   - Open DevTools → Application → Clear Storage
   - Clear cookies, localStorage, sessionStorage

2. **Login:**
   - Go to `http://localhost:5175/login`
   - Login with `test@test.com` / `Test1234`
   - Check DevTools → Application → Local Storage
   - Should see `rg_session_data` with email, role, org

3. **Check Dashboard:**
   - Navigate to `http://localhost:5175/dashboard`
   - Check DevTools → Network tab
   - Should see API calls to `localhost:8001`
   - Should see `/users`, `/orgs/current`, etc.

4. **Verify Session:**
   - Check DevTools → Application → Cookies
   - Should see `rg_access_token` and `rg_refresh_token` (HttpOnly)

---

## 🎯 **Expected Behavior After Fix**

1. ✅ Dashboard checks session correctly
2. ✅ API calls are made to backend
3. ✅ Dashboard loads data or shows empty state
4. ✅ Dashboard never gets stuck on "Loading dashboard..."
5. ✅ Proper error handling if API calls fail

---

## 📌 **Summary**

**Root Cause:** Session check is using wrong function (`getSession()` instead of `isAuthenticated()` from `auth-cookies.ts`), and checking for object existence instead of actual session data.

**Impact:** Dashboard thinks user is not authenticated, redirects to login (or fails silently), and never makes API calls.

**Fix:** Change all dashboard components to use `isAuthenticated()` and `getSessionData()` from `auth-cookies.ts`, and check for actual session data (email, role) instead of just object existence.

