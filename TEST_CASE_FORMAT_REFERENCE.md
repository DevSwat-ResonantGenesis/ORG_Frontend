# 📋 Test Case Format Reference (MANDATORY)

**Every test case MUST follow this exact format. No exceptions.**

---

## ✅ **CORRECT FORMAT**

```markdown
### **Test: [ENDPOINT] ([Test Case Description])**

**Request:**
```json
{
  "field1": "value1",
  "field2": "value2"
}
```
**Headers:** (if applicable)
- Cookie: `access_token=<token>`
- Authorization: `Bearer <token>`

**Expected:**
- Status: [Expected HTTP Status Code]
- [Other expected behaviors]

**Actual Response:**
- Status: [ACTUAL HTTP STATUS CODE - REQUIRED]
- Body:
```json
{
  "actual": "response",
  "data": "here"
}
```

**Pass/Fail:** ✅ Pass | ❌ Fail | ⬜ Not Tested  
**Notes:** [Any relevant notes, issues, or observations]
```

---

## ❌ **INCORRECT FORMATS (DO NOT USE)**

### **Bad Example 1: Missing Actual Response**
```markdown
- **Status:** ✅ Tested
- **Result:** (empty)
```
**Problem:** No actual HTTP status or response body recorded.

---

### **Bad Example 2: Placeholder Only**
```markdown
- **Status:** ⬜ Testing...
- **Result:**
```
**Problem:** No actual data captured. Later debugging will be impossible.

---

### **Bad Example 3: Incomplete Information**
```markdown
- **Result:** 401 Unauthorized
```
**Problem:** Missing request details, expected vs actual comparison, and notes.

---

## 📝 **REQUIRED FIELDS CHECKLIST**

Every test case MUST include:

- [ ] **Request:** Complete request body (JSON formatted)
- [ ] **Headers:** Authentication headers, cookies (if applicable)
- [ ] **Expected:** Expected status code and behaviors
- [ ] **Actual Response Status:** Real HTTP status code (not placeholder)
- [ ] **Actual Response Body:** Real JSON response (not placeholder)
- [ ] **Pass/Fail:** Clear pass/fail/not tested status
- [ ] **Notes:** Any relevant observations or issues

---

## 🎯 **EXAMPLE: Complete Test Case**

### **Test: POST `/auth/login` (Valid Input)**

**Request:**
```json
{
  "email": "test@test.com",
  "password": "Test1234"
}
```

**Expected:**
- Status: 200 OK
- `access_token` cookie set (HttpOnly)
- `refresh_token` cookie set (HttpOnly)
- Response body with user info

**Actual Response:**
- Status: 200
- Body:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "org_id": "607ef9bc-643e-4a92-95f6-e305547049bf",
  "role": "org_admin"
}
```
- Cookies: ✅ `access_token` and `refresh_token` set (HttpOnly, verified via browser DevTools)

**Pass/Fail:** ✅ Pass  
**Notes:** Login working correctly. Tokens are in HttpOnly cookies as expected.

---

## 🚨 **CRITICAL RULES**

1. **NEVER** leave "Status: ___" or "Result:" empty
2. **ALWAYS** record actual HTTP status codes
3. **ALWAYS** record actual response bodies (even if empty)
4. **ALWAYS** include request details
5. **ALWAYS** compare expected vs actual
6. **ALWAYS** add notes for context

---

## 📊 **Why This Format Matters**

- **Debugging:** Actual responses help identify issues quickly
- **Documentation:** Complete test records serve as API documentation
- **Regression Testing:** Clear pass/fail status helps track fixes
- **Team Communication:** Notes explain context and decisions

---

**Last Updated:** 2025-01-30

