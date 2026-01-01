# 🔬 Resonant Chat Diagnostic Test Script

## Quick Diagnostic Commands

Copy and paste these into your Resonant Chat to test each system:

---

## 🧪 Test Sequence 1: Hash Sphere Detection

### Step 1: Create Semantic Anchor
```
Send: "I'm working on a quantum computing project that uses AI to solve optimization problems"
```

### Step 2: Test Semantic Recall (Hash Sphere)
```
Wait 30 seconds, then send: "What was that advanced technology project I mentioned?"
```

**Expected Result:**
- ✅ Should recall "quantum computing" even though you didn't use exact words
- ✅ This proves Hash Sphere is mapping meaning clusters, not keywords

**If it fails:** Hash Sphere may not be active or anchors not created

---

## 🧠 Test Sequence 2: RAG Memory Detection

### Step 1: Create Memory
```
Send: "My favorite programming language is TypeScript and I prefer functional programming"
```

### Step 2: Test RAG Retrieval
```
Start a NEW conversation (or wait 5 minutes), then send: "What are my coding preferences?"
```

**Expected Result:**
- ✅ Should recall TypeScript and functional programming
- ✅ This proves RAG is retrieving stored memories, not just current history

**If it fails:** RAG may not be saving/retrieving memories

---

## 📜 Test Sequence 3: Conversation History

### Step 1-3: Multi-Turn Context
```
Message 1: "I have three pets: a dog named Max, a cat named Luna, and a bird named Charlie"
Message 2: "What are their names?"
```

**Expected Result:**
- ✅ Should list all three pet names
- ✅ This proves conversation history is working

**If it fails:** History context not being passed correctly

---

## 🎯 Test Sequence 4: Prompt Builder Format

### Step 1: Complex Query
```
Send: "Explain how Hash Sphere, RAG, and conversation history work together in this chat system"
```

**Expected Result:**
- ✅ Response should be structured (not just raw AI output)
- ✅ Should reference multiple context sources
- ✅ Should show understanding of the system architecture

**If it fails:** Prompt builder may not be formatting correctly

---

## 🔍 Test Sequence 5: Weighted Context Priority

### Step 1: Create High-Importance Memory
```
Send: "IMPORTANT: I'm allergic to peanuts. Always remind me about this."
```

### Step 2: Create Low-Importance Memory
```
Send: "I like the color blue"
```

### Step 3: Test Priority
```
Send: "What should you remember about me?"
```

**Expected Result:**
- ✅ Peanut allergy should be mentioned prominently (high weight)
- ✅ Color preference may or may not appear (lower weight)
- ✅ This proves weighted scoring is working

**If it fails:** Context weighting may not be applied

---

## 🚨 Test Sequence 6: Error Handling

### Test 6.1: Large Message
```
Send a message that's 2-3 pages long (copy/paste a long article)
```

**Expected:**
- ✅ Should send successfully
- ✅ Should not show "message sent error"
- ✅ Should process and respond

**If it fails:** Request size limit issue

### Test 6.2: Network Error Simulation
```
1. Stop backend: docker-compose stop api
2. Try to send a message
3. Start backend: docker-compose start api
```

**Expected:**
- ✅ Should show graceful error message
- ✅ Should not crash UI
- ✅ Should recover when backend restarts

**If it fails:** Error handling needs improvement

---

## 🔐 Test Sequence 7: Authentication & Session

### Test 7.1: Session Persistence
```
1. Login
2. Send a few messages
3. Refresh the page (F5)
4. Check if still logged in
```

**Expected:**
- ✅ Should remain logged in
- ✅ Messages should still be visible
- ✅ Session should persist

**If it fails:** Session management issue

### Test 7.2: Guest Mode
```
1. Logout
2. Try to send a message as guest
3. Check console for 401 errors
```

**Expected:**
- ✅ Should work without login
- ✅ No 401 errors in console
- ✅ Can send messages as guest

**If it fails:** Guest mode authentication issue

---

## 📊 Test Sequence 8: Performance

### Test 8.1: Response Time
```
Send: "What is the meaning of life?"
Time the response
```

**Expected:**
- ✅ Response within 3-5 seconds
- ✅ No long delays

**If it fails:** Performance issue or provider timeout

### Test 8.2: Concurrent Requests
```
Send 3 messages quickly in succession
```

**Expected:**
- ✅ All messages process correctly
- ✅ Responses match requests
- ✅ No race conditions

**If it fails:** Concurrency handling issue

---

## 🎨 Test Sequence 9: UI Features

### Test 9.1: @ Mentions
```
Type: "@" and check if autocomplete appears
```

**Expected:**
- ✅ Autocomplete dropdown appears
- ✅ Can select from list
- ✅ Inserts selected item

**If it fails:** Mention autocomplete not working

### Test 9.2: / Commands
```
Type: "/plan" and check if command is recognized
```

**Expected:**
- ✅ Command autocomplete appears
- ✅ Command executes correctly

**If it fails:** Command system not working

### Test 9.3: Memory Library
```
1. Open Memory Library
2. Check if error messages are filtered
3. Check if titles are meaningful
```

**Expected:**
- ✅ No "Error calling..." messages
- ✅ Titles are readable (not just IDs)
- ✅ Can edit/delete memories

**If it fails:** Memory library filtering issue

---

## 🔬 Advanced Diagnostic: System Activation Detection

### Method 1: Check Response Patterns

**Hash Sphere Active If:**
- Response references topics not in immediate history
- Semantic connections made across conversations
- Meaning-based recall (not keyword matching)

**RAG Active If:**
- Response includes information from previous sessions
- Structured memory recall
- Context points shown in UI

**History Active If:**
- Response references last 1-3 messages
- Immediate context maintained
- Conversation flow preserved

### Method 2: Check Console Logs

Open browser console (F12) and look for:
- `[DEBUG] Hash Sphere anchor retrieved`
- `[DEBUG] RAG memory retrieved`
- `[DEBUG] Context built with X memories, Y anchors`

### Method 3: Check Network Requests

1. Open Network tab (F12)
2. Send a message
3. Check `/resonant-chat/message` request
4. Look at request payload for context structure

**Expected Payload Structure:**
```json
{
  "message": "...",
  "context": {
    "rag_memories": [...],
    "anchors": [...],
    "history": [...]
  }
}
```

---

## 📋 Quick Diagnostic Checklist

Run through these quickly:

- [ ] Can send messages (basic functionality)
- [ ] No 401 errors in console
- [ ] Memory library shows no error messages
- [ ] Can send 2-page messages without error
- [ ] Session persists after refresh
- [ ] Guest mode works
- [ ] @ mentions work
- [ ] / commands work
- [ ] Messages scroll properly
- [ ] Provider selection works

**If all checked:** ✅ Core functionality working
**If any unchecked:** ⚠️ Issue needs investigation

---

## 🐛 Common Issues & Solutions

### Issue: 401 Errors
**Solution:** Check guest mode authentication, verify backend is running

### Issue: "Message sent error" on large messages
**Solution:** Check request size limits, verify Docker container has enough resources

### Issue: Session expires too quickly
**Solution:** Verify JWT expiration is 720 minutes (12 hours)

### Issue: Memory library shows errors
**Solution:** Check memory filtering logic

### Issue: Hash Sphere not working
**Solution:** Check anchor creation, verify resonance hashing is active

### Issue: RAG not retrieving memories
**Solution:** Check memory storage, verify semantic search is working

---

## 📊 Expected Behavior Summary

| System | Activation Signal | What to Look For |
|--------|-------------------|------------------|
| **Hash Sphere** | Semantic recall | Topics recalled by meaning, not exact words |
| **RAG** | Memory retrieval | Information from previous sessions |
| **History** | Immediate context | References to last few messages |
| **Prompt Builder** | Structured format | Organized response with sections |

---

## 🎯 Success Criteria

**All Systems Working If:**
- ✅ Can recall topics semantically (Hash Sphere)
- ✅ Can retrieve old memories (RAG)
- ✅ Maintains conversation flow (History)
- ✅ Responses are well-structured (Prompt Builder)
- ✅ No errors in console
- ✅ UI is responsive
- ✅ Session persists

---

**Use this script to systematically test each component!**

