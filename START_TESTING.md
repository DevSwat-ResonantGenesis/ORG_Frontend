# 🚀 START TESTING - Step-by-Step Guide

## ✅ System Status Check - COMPLETE

**Backend:** ✅ Running (http://localhost:8001)
- API Container: ✅ Up 18 minutes
- Database: ✅ Up 19 hours  
- ML Worker: ✅ Up 7 hours
- Health Check: ✅ Passing

**Frontend:** ✅ Running (http://localhost:5175)
- Server: ✅ Responding
- React: ✅ Loaded

---

## 🎯 Test Execution Order

### PHASE 1: Core Functionality (5 minutes)

#### Test 1.1: Basic Message Send
**Action:** 
1. Open http://localhost:5175/resonant-chat
2. Type: `Hello, can you hear me?`
3. Press Enter or click Send

**Expected:**
- ✅ Message appears in chat
- ✅ Loading indicator shows
- ✅ Response received within 5 seconds
- ✅ No errors in console (F12)

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 1.2: Large Message (2 pages)
**Action:**
1. Copy this text (or any 2-page article):
```
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollit animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
```
2. Paste into chat
3. Send

**Expected:**
- ✅ Message sends successfully
- ✅ No "message sent error"
- ✅ Response received
- ✅ No timeout errors

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 1.3: Memory Library Check
**Action:**
1. Click "Memory Library" button (or open sidebar)
2. Check the memory list
3. Look for any error messages

**Expected:**
- ✅ Memory list displays
- ✅ No "Error calling..." messages
- ✅ Titles are meaningful (not just "Memory abc123")
- ✅ Can see memory previews

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 1.4: Guest Mode (No Login)
**Action:**
1. Logout (if logged in)
2. Open browser console (F12)
3. Go to Console tab
4. Send a message: `Test message as guest`
5. Check console for errors

**Expected:**
- ✅ Message sends successfully
- ✅ No 401 (Unauthorized) errors
- ✅ No "SSE error" messages
- ✅ Response received

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 1.5: Session Persistence
**Action:**
1. Login (if not logged in)
2. Send a message: `This is a test message`
3. Refresh the page (F5)
4. Check if still logged in

**Expected:**
- ✅ Still logged in after refresh
- ✅ Previous messages visible
- ✅ Can send new messages
- ✅ Session maintained

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 1.6: Message Scrolling
**Action:**
1. Send 10+ messages (or use quick prompts)
2. Try to scroll up to see older messages
3. Check scroll behavior

**Expected:**
- ✅ Messages container scrolls smoothly
- ✅ Can scroll to top
- ✅ Can scroll to bottom
- ✅ Auto-scrolls to bottom on new messages

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

### PHASE 2: Coding Functionality (10 minutes)

#### Test 2.1: File Attachment
**Action:**
1. Create a test file: `test.js`
   ```javascript
   function calculateSum(a, b) {
     return a + b;
   }
   ```
2. Click file attachment button (folder icon)
3. Select `test.js`
4. Check file appears in list
5. Send: `What does this code do?`

**Expected:**
- ✅ File appears in attached files list
- ✅ File count badge shows "1 Files"
- ✅ Response analyzes the code
- ✅ References the function

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 2.2: Code Generation
**Action:**
1. Send: `Generate a Python function that validates email addresses using regex`

**Expected:**
- ✅ Code generated
- ✅ Explanation provided
- ✅ Code is syntactically correct
- ✅ Response within 5-10 seconds

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 2.3: Multiple File Attachment
**Action:**
1. Create 3 test files:
   - `component.jsx` (React component)
   - `styles.css` (CSS)
   - `test.js` (test file)
2. Attach all 3 files
3. Send: `How do these files work together?`

**Expected:**
- ✅ All 3 files attached
- ✅ File count shows "3 Files"
- ✅ Response analyzes all files
- ✅ Explains relationships

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

### PHASE 3: Hash Sphere & RAG (10 minutes)

#### Test 3.1: Hash Sphere - Semantic Recall
**Action:**
1. Send: `Tell me about quantum computing and its applications`
2. Wait for response
3. Send: `What was that advanced technology we just discussed?`

**Expected:**
- ✅ Second message recalls "quantum computing"
- ✅ Uses meaning-based recall (not exact words)
- ✅ Shows semantic understanding

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 3.2: RAG Memory Retrieval
**Action:**
1. Send: `My favorite programming language is TypeScript and I prefer functional programming style`
2. Wait for response
3. Start a NEW conversation (or wait 2 minutes)
4. Send: `What are my coding preferences?`

**Expected:**
- ✅ Recalls TypeScript preference
- ✅ Recalls functional programming preference
- ✅ Uses stored memory, not just current history

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 3.3: Conversation History
**Action:**
1. Send: `My name is Alice and I'm a software engineer`
2. Send: `What's my name and profession?`

**Expected:**
- ✅ Responds "Alice"
- ✅ Responds "software engineer"
- ✅ Uses immediate conversation history

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

### PHASE 4: UI Features (5 minutes)

#### Test 4.1: @ Mentions
**Action:**
1. Type: `@` in the input
2. Check if autocomplete appears

**Expected:**
- ✅ Autocomplete dropdown appears
- ✅ Shows available options
- ✅ Can select from list

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 4.2: / Commands
**Action:**
1. Type: `/plan` in the input
2. Check if command is recognized

**Expected:**
- ✅ Command autocomplete appears
- ✅ Command executes correctly

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

#### Test 4.3: Provider Selection
**Action:**
1. Click provider selector
2. Select different provider (e.g., "Groq")
3. Send a message
4. Check provider badge

**Expected:**
- ✅ Provider changes
- ✅ Badge shows selected provider
- ✅ Response from correct provider

**Result:** [ ] Pass [ ] Fail
**Notes:** ________________________________

---

## 📊 Test Results Summary

**Phase 1: Core Functionality**
- Test 1.1: [ ] Pass [ ] Fail
- Test 1.2: [ ] Pass [ ] Fail
- Test 1.3: [ ] Pass [ ] Fail
- Test 1.4: [ ] Pass [ ] Fail
- Test 1.5: [ ] Pass [ ] Fail
- Test 1.6: [ ] Pass [ ] Fail

**Phase 2: Coding Functionality**
- Test 2.1: [ ] Pass [ ] Fail
- Test 2.2: [ ] Pass [ ] Fail
- Test 2.3: [ ] Pass [ ] Fail

**Phase 3: Hash Sphere & RAG**
- Test 3.1: [ ] Pass [ ] Fail
- Test 3.2: [ ] Pass [ ] Fail
- Test 3.3: [ ] Pass [ ] Fail

**Phase 4: UI Features**
- Test 4.1: [ ] Pass [ ] Fail
- Test 4.2: [ ] Pass [ ] Fail
- Test 4.3: [ ] Pass [ ] Fail

**Total:** ___ / 15 tests passed

---

## 🐛 Issues Found

**Critical Issues:**
1. ________________________________
2. ________________________________

**Minor Issues:**
1. ________________________________
2. ________________________________

---

## ✅ Next Steps

After completing these tests:
1. Review results
2. Fix any critical issues
3. Run full test suite from `RESONANT_CHAT_TEST_PLAN.md`
4. Test coding functionality from `CODING_FUNCTIONALITY_TEST_PLAN.md`

---

**Ready to start? Open http://localhost:5175/resonant-chat and begin!**

