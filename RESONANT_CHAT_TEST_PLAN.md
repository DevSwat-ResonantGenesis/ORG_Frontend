# 🧪 Resonant Chat Comprehensive Test Plan

## Overview
This test plan verifies all Resonant Chat functionality including Hash Sphere, RAG, Conversation History, and UI features.

---

## ✅ Pre-Test Checklist

- [ ] Backend Docker container is running (`docker-compose ps api`)
- [ ] Frontend is running (`npm run dev`)
- [ ] Database is accessible
- [ ] JWT tokens expire after 12 hours (not 15 minutes)
- [ ] Guest mode is enabled

---

## 🔍 Test 1: Hash Sphere Activation

### Test 1.1: Semantic Anchor Recall
**Goal:** Verify Hash Sphere retrieves meaning clusters, not just exact words

**Steps:**
1. Send message: "Tell me about quantum computing"
2. Wait for response
3. Send follow-up: "What was the deeper meaning behind what we talked about earlier?"
4. **Expected:** System should recall quantum computing topic using semantic similarity, not exact phrase match

**Success Criteria:**
- ✅ Response references quantum computing without exact phrase match
- ✅ Shows semantic understanding (meaning clusters)
- ✅ Uses Hash Sphere anchors (check console/debug if available)

### Test 1.2: Indirect Topic Retrieval
**Steps:**
1. Have a conversation about "UI scrolling issues"
2. Later, ask: "Remember that problem we discussed about the interface?"
3. **Expected:** Should recall scrolling issue using semantic matching

**Success Criteria:**
- ✅ Retrieves correct topic from earlier conversation
- ✅ Uses meaning-based recall, not keyword matching

---

## 🧠 Test 2: RAG Memory Activation

### Test 2.1: Stored Memory Retrieval
**Goal:** Verify RAG retrieves stored memories from previous sessions

**Steps:**
1. Send message: "I'm working on a secret project called Project X"
2. Wait for response (memory should be saved)
3. Start a new conversation or refresh page
4. Ask: "What was my secret project called?"
5. **Expected:** Should recall "Project X" from RAG memory

**Success Criteria:**
- ✅ Retrieves memory from previous conversation
- ✅ Not just from current chat history
- ✅ Shows in "Context Points" or memory section

### Test 2.2: Semantic Memory Search
**Steps:**
1. Save a memory: "I prefer dark mode UI"
2. Later ask: "What are my UI preferences?"
3. **Expected:** Should find "dark mode" memory using semantic search

**Success Criteria:**
- ✅ Finds memory even with different wording
- ✅ Shows semantic understanding

---

## 📜 Test 3: Conversation History

### Test 3.1: Immediate Context
**Goal:** Verify last few messages are included in context

**Steps:**
1. Send: "My name is John"
2. Send: "What's my name?"
3. **Expected:** Should respond "John" using conversation history

**Success Criteria:**
- ✅ Uses immediate conversation history
- ✅ Responds correctly to recent context

### Test 3.2: Multi-Turn Conversation
**Steps:**
1. Have a 5-6 message conversation about a topic
2. Ask a question that requires understanding the full conversation
3. **Expected:** Should use all recent messages for context

**Success Criteria:**
- ✅ Maintains conversation context across multiple turns
- ✅ References earlier messages in the conversation

---

## 🎯 Test 4: Prompt Builder Integration

### Test 4.1: Structured Response Format
**Goal:** Verify prompt builder's formatting is applied

**Steps:**
1. Send a complex question requiring multiple context sources
2. **Expected:** Response should show:
   - Topic recap
   - Structured sections
   - Evidence/references

**Success Criteria:**
- ✅ Response follows prompt builder format
- ✅ Shows structured sections (not just raw AI output)
- ✅ Includes context labels if visible

### Test 4.2: Weighted Context Merging
**Steps:**
1. Create memories with different importance scores
2. Ask a question that should prioritize certain memories
3. **Expected:** Higher-scored memories should influence response more

**Success Criteria:**
- ✅ Response reflects weighted context
- ✅ More important memories have more influence

---

## 🖥️ Test 5: UI Functionality

### Test 5.1: Message Display
- [ ] Messages render correctly
- [ ] User messages on right, assistant on left (or configured layout)
- [ ] Timestamps display (if enabled)
- [ ] Provider badges show (if enabled)
- [ ] Message actions (copy, regenerate, etc.) work

### Test 5.2: Input Features
- [ ] Text input works
- [ ] @ mentions trigger autocomplete
- [ ] / commands work (e.g., /plan, /summarize)
- [ ] File attachments work
- [ ] Code selection works
- [ ] Auto-resize textarea works

### Test 5.3: Sidebar Features
- [ ] Conversations list loads
- [ ] Memory library displays
- [ ] Search works
- [ ] Settings accessible
- [ ] Export options work

### Test 5.4: Scrolling
- [ ] Messages container scrolls when content overflows
- [ ] Auto-scroll to bottom on new messages
- [ ] Scroll position maintained when loading history

### Test 5.5: Memory Library
- [ ] Memories display correctly
- [ ] Error messages filtered out
- [ ] Memory titles are meaningful (not just IDs)
- [ ] Edit/delete memory works
- [ ] Search memories works

---

## 🔐 Test 6: Authentication & Session

### Test 6.1: Authenticated User
- [ ] Login works
- [ ] Session persists for 12 hours
- [ ] No unexpected logouts
- [ ] Token refresh works automatically
- [ ] User-specific memories load

### Test 6.2: Guest User
- [ ] Can use chat without login
- [ ] Guest session persists
- [ ] Guest memories work
- [ ] No 401 errors
- [ ] Can send messages as guest

### Test 6.3: Session Persistence
- [ ] Refresh page - session maintained
- [ ] Close tab and reopen - session maintained (if cookies set)
- [ ] After 12 hours - requires re-login

---

## 🚀 Test 7: AI Provider Routing

### Test 7.1: Auto Provider Selection
- [ ] Auto mode selects appropriate provider
- [ ] Provider badge shows correct provider
- [ ] Fallback works if primary provider fails

### Test 7.2: Manual Provider Selection
- [ ] Can select specific provider (ChatGPT, Gemini, Groq)
- [ ] Selected provider is used
- [ ] Provider change works mid-conversation

### Test 7.3: Provider Errors
- [ ] Handles provider errors gracefully
- [ ] Shows error messages clearly
- [ ] Fallback to another provider works

---

## 📊 Test 8: Performance & Limits

### Test 8.1: Large Messages
- [ ] Can send 2+ page messages
- [ ] No "message sent error"
- [ ] Response handles large context

### Test 8.2: Long Conversations
- [ ] Handles 50+ message conversations
- [ ] Context window managed properly
- [ ] Performance remains acceptable

### Test 8.3: Multiple Concurrent Requests
- [ ] Can send messages while previous is processing
- [ ] No race conditions
- [ ] Responses match requests

---

## 🐛 Test 9: Error Handling

### Test 9.1: Network Errors
- [ ] Handles backend unavailable gracefully
- [ ] Shows appropriate error messages
- [ ] Doesn't crash or break UI

### Test 9.2: Invalid Input
- [ ] Handles empty messages
- [ ] Handles very long messages
- [ ] Handles special characters

### Test 9.3: Token Expiration
- [ ] Handles expired tokens gracefully
- [ ] Refreshes tokens automatically
- [ ] Doesn't log out unexpectedly

---

## 📝 Test 10: Memory & Anchors

### Test 10.1: Memory Creation
- [ ] Can save messages to memory
- [ ] Memory appears in memory library
- [ ] Memory persists across sessions

### Test 10.2: Anchor Creation
- [ ] Anchors created from conversations
- [ ] Anchors used in future conversations
- [ ] Anchor resonance scores calculated

### Test 10.3: Memory Retrieval
- [ ] Relevant memories retrieved
- [ ] Memories ranked by importance
- [ ] Old/irrelevant memories filtered

---

## 🎨 Test 11: UI/UX Features

### Test 11.1: Theme
- [ ] Dark/light mode toggle works
- [ ] Theme persists across sessions
- [ ] All UI elements respect theme

### Test 11.2: Responsive Design
- [ ] Works on mobile
- [ ] Works on tablet
- [ ] Works on desktop
- [ ] Sidebar responsive behavior

### Test 11.3: Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible (if applicable)
- [ ] Focus states visible

---

## 🔧 Test 12: Advanced Features

### Test 12.1: Code Features
- [ ] Code selection works
- [ ] Code context included in messages
- [ ] File attachments work

### Test 12.2: Export/Share
- [ ] Export conversation works
- [ ] Share functionality works
- [ ] Export formats correct

### Test 12.3: Settings
- [ ] Settings save correctly
- [ ] Settings persist
- [ ] All settings options work

---

## 📋 Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: [ ] Local [ ] Docker [ ] Production

Test Results:
[ ] Test 1.1: Hash Sphere - Semantic Recall
[ ] Test 1.2: Hash Sphere - Indirect Retrieval
[ ] Test 2.1: RAG - Memory Retrieval
[ ] Test 2.2: RAG - Semantic Search
[ ] Test 3.1: History - Immediate Context
[ ] Test 3.2: History - Multi-Turn
[ ] Test 4.1: Prompt Builder - Format
[ ] Test 4.2: Prompt Builder - Weighting
[ ] Test 5: UI Functionality
[ ] Test 6: Authentication
[ ] Test 7: Provider Routing
[ ] Test 8: Performance
[ ] Test 9: Error Handling
[ ] Test 10: Memory & Anchors
[ ] Test 11: UI/UX
[ ] Test 12: Advanced Features

Issues Found:
1. 
2. 
3. 

Notes:
```

---

## 🚨 Known Issues to Watch For

1. **401 Errors**: Should not occur for guest users
2. **Session Timeout**: Should be 12 hours, not 15 minutes
3. **Large Messages**: Should not fail with "message sent error"
4. **Memory Filtering**: Error messages should not appear in memory library
5. **Scrolling**: Messages container should scroll properly

---

## 🎯 Quick Smoke Test (5 minutes)

If you only have 5 minutes, run these critical tests:

1. ✅ Login and send a message
2. ✅ Send a 2-page message (should not error)
3. ✅ Check memory library (no error messages)
4. ✅ Use as guest user (no 401 errors)
5. ✅ Scroll messages container
6. ✅ Check session persists after refresh

---

## 📊 Success Metrics

- **Hash Sphere**: 80%+ semantic recall accuracy
- **RAG**: 90%+ memory retrieval accuracy
- **History**: 100% immediate context accuracy
- **UI**: 0 critical bugs
- **Performance**: < 3s response time
- **Uptime**: 99%+ availability

---

## 🔄 Continuous Testing

Run these tests:
- After each deployment
- Before major releases
- When adding new features
- When fixing bugs

---

**Last Updated:** 2025-01-30
**Version:** 1.0

