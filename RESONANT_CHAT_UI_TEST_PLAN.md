# 🧪 RESONANT CHAT UI TEST PLAN

**Date:** 2025-12-01  
**Status:** ✅ **COMPREHENSIVE TEST PLAN READY**

---

## 📋 **TEST CATEGORIES**

### **1. Backend Connection Tests**
- [ ] Backend health check
- [ ] API endpoint accessibility
- [ ] Authentication working
- [ ] Provider API keys configured

### **2. Basic Chat Functionality**
- [ ] Send message
- [ ] Receive response
- [ ] Message history
- [ ] Conversation creation
- [ ] Conversation loading
- [ ] Conversation deletion

### **3. Provider Selection**
- [ ] Auto provider selection
- [ ] Manual provider selection (Gemini)
- [ ] Manual provider selection (Groq)
- [ ] Manual provider selection (OpenAI)
- [ ] Provider switching mid-conversation

### **4. Hash Sphere Integration**
- [ ] Hash Sphere visualization loads
- [ ] Messages appear in 3D space
- [ ] Anchors displayed
- [ ] Clusters displayed
- [ ] Resonance scores shown

### **5. Memory System**
- [ ] Memory anchors load
- [ ] Resonance clusters load
- [ ] Memory library accessible
- [ ] Memory search works
- [ ] Memory creation from chat

### **6. File Attachments**
- [ ] Attach text file
- [ ] Attach code file
- [ ] File preview
- [ ] File removal
- [ ] Multiple files

### **7. Advanced Features**
- [ ] Code selection
- [ ] @ Mention autocomplete
- [ ] / Command autocomplete
- [ ] Split view for code
- [ ] IDE mode
- [ ] Project builder

### **8. Real-Time Features**
- [ ] WebSocket connection
- [ ] Streaming responses
- [ ] Live updates
- [ ] Reconnection handling

### **9. UI/UX**
- [ ] Responsive design (mobile/desktop)
- [ ] Dark/light theme
- [ ] Sidebar toggle
- [ ] Settings panel
- [ ] Keyboard shortcuts
- [ ] Error messages
- [ ] Loading states

### **10. Performance**
- [ ] Message send latency
- [ ] Response time
- [ ] UI responsiveness
- [ ] Memory usage
- [ ] Network requests

---

## 🧪 **DETAILED TEST SCENARIOS**

### **Test 1: Basic Message Flow**

**Steps:**
1. Open Resonant Chat page
2. Type message: "What is Python?"
3. Click Send
4. Wait for response

**Expected:**
- ✅ Message appears in chat
- ✅ Loading indicator shows
- ✅ Response appears within 5-10 seconds
- ✅ Provider badge shows (Gemini/Groq/OpenAI)
- ✅ Response is relevant and coherent

**Performance:**
- Response time: < 10 seconds
- No UI freezing
- Smooth animations

---

### **Test 2: Provider Selection**

**Steps:**
1. Open Resonant Chat
2. Click provider selector
3. Select "Gemini"
4. Send message: "Explain quantum computing"
5. Switch to "Groq"
6. Send another message
7. Switch to "OpenAI"
8. Send another message

**Expected:**
- ✅ Provider selector shows all 3 providers
- ✅ Selected provider is highlighted
- ✅ Each provider responds correctly
- ✅ Provider badge shows correct provider
- ✅ Responses differ between providers

---

### **Test 3: Hash Sphere Visualization**

**Steps:**
1. Open Resonant Chat
2. Send 3-4 messages
3. Click "Show Hash Sphere" button
4. Observe 3D visualization

**Expected:**
- ✅ Hash Sphere opens in overlay
- ✅ Messages appear as points in 3D space
- ✅ Anchors visible (yellow points)
- ✅ Clusters visible (grouped points)
- ✅ Can interact with visualization
- ✅ Can select messages from sphere

**Performance:**
- Visualization loads in < 2 seconds
- Smooth 3D rotation
- No lag when interacting

---

### **Test 4: Memory Anchors**

**Steps:**
1. Open Resonant Chat
2. Send several messages about different topics
3. Open sidebar
4. Check "Memory Anchors" section

**Expected:**
- ✅ Anchors load from backend
- ✅ Anchor text visible
- ✅ Anchors linked to messages
- ✅ Can click anchor to see related messages

---

### **Test 5: File Attachments**

**Steps:**
1. Open Resonant Chat
2. Click "Attach File" button
3. Select a text file (.txt)
4. Select a code file (.py)
5. Send message with files attached

**Expected:**
- ✅ Files appear in attachment list
- ✅ File names visible
- ✅ Can preview files
- ✅ Can remove files
- ✅ Files included in message context
- ✅ Response references file content

---

### **Test 6: Conversation Management**

**Steps:**
1. Open Resonant Chat
2. Send 3 messages
3. Click "New Chat"
4. Send 2 messages in new chat
5. Open sidebar
6. Click on first conversation
7. Delete second conversation

**Expected:**
- ✅ New conversation created
- ✅ Conversations listed in sidebar
- ✅ Can switch between conversations
- ✅ Messages load correctly
- ✅ Can delete conversations
- ✅ Deleted conversation removed from list

---

### **Test 7: Real-Time Streaming**

**Steps:**
1. Open Resonant Chat
2. Send a long message that requires detailed response
3. Observe response streaming

**Expected:**
- ✅ Response streams in real-time
- ✅ Text appears word-by-word
- ✅ No UI freezing
- ✅ Can stop streaming (if implemented)

---

### **Test 8: Error Handling**

**Steps:**
1. Disconnect internet
2. Try to send message
3. Reconnect internet
4. Send message again

**Expected:**
- ✅ Error message displayed
- ✅ Clear error description
- ✅ Can retry after reconnection
- ✅ No app crash

---

### **Test 9: Mobile Responsiveness**

**Steps:**
1. Open Resonant Chat on mobile (or resize browser)
2. Test all features
3. Check sidebar behavior
4. Test input area

**Expected:**
- ✅ UI adapts to mobile screen
- ✅ Sidebar can be toggled
- ✅ Input area accessible
- ✅ Messages readable
- ✅ Buttons clickable

---

### **Test 10: Performance Metrics**

**Measure:**
- Message send latency: < 100ms
- Response time: < 10 seconds
- UI render time: < 500ms
- Memory usage: < 100MB
- Network requests: Minimal

**Tools:**
- Browser DevTools
- Network tab
- Performance tab
- Memory profiler

---

## 📊 **TEST RESULTS TEMPLATE**

### **Test Results:**

| Test # | Test Name | Status | Response Time | Notes |
|--------|-----------|--------|---------------|-------|
| 1 | Basic Message Flow | ⏳ | - | - |
| 2 | Provider Selection | ⏳ | - | - |
| 3 | Hash Sphere | ⏳ | - | - |
| 4 | Memory Anchors | ⏳ | - | - |
| 5 | File Attachments | ⏳ | - | - |
| 6 | Conversation Management | ⏳ | - | - |
| 7 | Real-Time Streaming | ⏳ | - | - |
| 8 | Error Handling | ⏳ | - | - |
| 9 | Mobile Responsiveness | ⏳ | - | - |
| 10 | Performance Metrics | ⏳ | - | - |

---

## 🎯 **SUCCESS CRITERIA**

### **Must Pass:**
- ✅ All basic chat functionality works
- ✅ All 3 providers respond correctly
- ✅ Hash Sphere visualization loads
- ✅ Memory anchors load
- ✅ No critical errors
- ✅ Response time < 15 seconds

### **Should Pass:**
- ✅ Real-time streaming works
- ✅ File attachments work
- ✅ Mobile responsive
- ✅ Performance metrics acceptable

### **Nice to Have:**
- ✅ IDE mode works
- ✅ Project builder works
- ✅ Advanced features functional

---

## 🚀 **READY TO TEST**

**Backend Status:** ✅ Restarted  
**Frontend Status:** ✅ Ready  
**Test Plan:** ✅ Complete

**Next Steps:**
1. Open browser to Resonant Chat page
2. Follow test scenarios above
3. Document results
4. Report any issues

