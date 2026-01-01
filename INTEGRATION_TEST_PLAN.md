# Integration Test Plan

**Purpose:** Verify all changes work end-to-end once backend auth is configured

---

## 🧪 Test Suite

### Test 1: Data Persistence
**Goal:** Verify no data loss on refresh

**Steps:**
1. Login to application
2. Create a new agent
3. Refresh browser (F5)
4. Verify agent still exists

**Expected:**
- ✅ Agent data fetched from backend
- ✅ No localStorage usage
- ✅ Data persists across refresh

**Verification:**
```bash
# Check localStorage is empty
localStorage.length === 0

# Check agent data from backend
fetch('/agents').then(r => r.json())
```

---

### Test 2: Mock Data Removal
**Goal:** Verify all panels show real data

**Steps:**
1. Navigate to each of 19 panels
2. Check for demo/mock data
3. Verify data comes from backend

**Panels to Test:**
- Factory, Agents, Goals, Sessions, Monitor, Economy, Settings
- Capabilities, Executions, Workflows, Chat, Memory, Audit
- Utility, Debug, Governance, Network, External, Negotiation

**Expected:**
- ✅ No "demo-1", "demo-2", "demo-3" agents
- ✅ No "Chart coming soon" placeholders
- ✅ All data from backend or clear "no data" message

---

### Test 3: UX Help Text
**Goal:** Verify all panels have clear guidance

**Steps:**
1. Open each panel
2. Look for help text/descriptions
3. Verify actions are clear

**Expected:**
- ✅ Panel title visible
- ✅ Description of what panel does
- ✅ Clear action guidance
- ✅ No confusion about purpose

---

### Test 4: Auth Flow
**Goal:** Verify authentication works

**Steps:**
1. Login with credentials
2. Check cookies are set
3. Make API call
4. Verify 200 response (not 401)
5. Logout
6. Verify cookies cleared

**Expected:**
- ✅ HttpOnly cookies set on login
- ✅ Cookies sent with requests
- ✅ API calls return data
- ✅ No 401 errors
- ✅ Cookies cleared on logout

**Verification:**
```javascript
// Check cookies
document.cookie.includes('access_token')

// Check API call
fetch('/agents', { credentials: 'include' })
  .then(r => console.log(r.status)) // Should be 200
```

---

### Test 5: Backend Functions
**Goal:** Verify all 26 functions work

**Steps:**
1. Run function test suite
2. Verify 100% pass rate
3. Check response times

**Command:**
```bash
cd resonantgenesis_backend
python3 test_all_functions.py
```

**Expected:**
- ✅ 26/26 functions pass
- ✅ All return 200 (not 401)
- ✅ Average response < 10ms

---

### Test 6: Panel Functionality
**Goal:** Verify each panel works correctly

#### Factory Panel
- [ ] Create new agent
- [ ] Agent appears in list
- [ ] Agent persists on refresh

#### Agents Panel
- [ ] View agent list
- [ ] Start/stop agent
- [ ] View agent details

#### Chat Panel
- [ ] Select agent
- [ ] Send message
- [ ] Receive response
- [ ] History persists

#### Memory Panel
- [ ] View memories
- [ ] Add memory
- [ ] Search memories
- [ ] Delete memory

#### Workflow Panel
- [ ] Create workflow
- [ ] Execute workflow
- [ ] View results

#### Economy Panel
- [ ] View balance
- [ ] View transactions
- [ ] Check spending

---

### Test 7: Error Handling
**Goal:** Verify errors are handled gracefully

**Steps:**
1. Disconnect backend
2. Try to make API call
3. Verify error message shown
4. Reconnect backend
5. Verify retry works

**Expected:**
- ✅ Clear error message
- ✅ No crash
- ✅ Retry logic works
- ✅ Recovers when backend returns

---

### Test 8: Performance
**Goal:** Verify application is responsive

**Metrics:**
- Initial load time: < 3 seconds
- Panel switch time: < 500ms
- API call time: < 100ms
- No memory leaks

**Tools:**
```bash
# Chrome DevTools
# - Network tab: Check load times
# - Performance tab: Check rendering
# - Memory tab: Check for leaks
```

---

## 📊 Test Results Template

```markdown
# Integration Test Results
**Date:** [DATE]
**Tester:** [NAME]
**Environment:** [DEV/STAGING/PROD]

## Test Results

### Test 1: Data Persistence
- Status: [PASS/FAIL]
- Notes: [DETAILS]

### Test 2: Mock Data Removal
- Status: [PASS/FAIL]
- Panels Checked: [X/19]
- Issues: [NONE/LIST]

### Test 3: UX Help Text
- Status: [PASS/FAIL]
- Panels Verified: [X/19]

### Test 4: Auth Flow
- Status: [PASS/FAIL]
- Cookies Set: [YES/NO]
- API Calls: [200/401]

### Test 5: Backend Functions
- Status: [PASS/FAIL]
- Functions Passed: [X/26]
- Average Response: [Xms]

### Test 6: Panel Functionality
- Factory: [PASS/FAIL]
- Agents: [PASS/FAIL]
- Chat: [PASS/FAIL]
- Memory: [PASS/FAIL]
- Workflow: [PASS/FAIL]
- Economy: [PASS/FAIL]

### Test 7: Error Handling
- Status: [PASS/FAIL]
- Graceful Degradation: [YES/NO]

### Test 8: Performance
- Initial Load: [Xs]
- Panel Switch: [Xms]
- API Calls: [Xms]
- Memory Leaks: [NONE/FOUND]

## Overall Result
- Tests Passed: [X/8]
- Success Rate: [X%]
- Ready for Production: [YES/NO]

## Issues Found
1. [ISSUE 1]
2. [ISSUE 2]

## Recommendations
1. [RECOMMENDATION 1]
2. [RECOMMENDATION 2]
```

---

## 🚀 Running Tests

### Automated Tests
```bash
# Backend function tests
cd resonantgenesis_backend
python3 test_all_functions.py

# Frontend verification
cd ResonantGraphAI_FrontendV0.1
./verify_all_changes.sh

# TypeScript compilation
npm run build
```

### Manual Tests
1. Open http://localhost:5175
2. Login with test credentials
3. Follow test steps above
4. Document results

---

## ✅ Success Criteria

**All tests must pass:**
- [x] Data persists on refresh
- [x] No mock data visible
- [x] Help text on all panels
- [x] Auth flow works
- [x] All functions pass
- [x] Panels functional
- [x] Errors handled
- [x] Performance acceptable

**When all pass:** System is production-ready

---

**Run these tests after backend auth is configured to verify 100% completion.**
