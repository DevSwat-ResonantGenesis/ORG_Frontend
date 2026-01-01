# 🧪 Resonant Chat Full Testing Checklist

**Date:** 2025-01-29  
**Purpose:** Comprehensive testing of Resonant Chat after platform update

---

## 📋 **PRE-TESTING SETUP**

### **Environment Verification:**
- [ ] Frontend deployed and accessible
- [ ] Backend running and healthy
- [ ] Database connected
- [ ] API endpoints accessible
- [ ] User logged in (for full features)

### **Browser Setup:**
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Open DevTools (F12)
- [ ] Check Network tab
- [ ] Check Console for errors

---

## 🔍 **TEST CATEGORY 1: BACKEND CONNECTION**

### **1.1 Health Check**
- [ ] Navigate to: `https://dev-swat.com/api/health`
- [ ] Expected: HTTP 200
- [ ] Response includes service status
- [ ] All services show "healthy"

**Test Command:**
```bash
curl https://dev-swat.com/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "services": {...}
}
```

---

### **1.2 Authentication**
- [ ] Login works
- [ ] Session cookie set
- [ ] Auth headers sent in requests
- [ ] User context available in backend

**Test Steps:**
1. Go to login page
2. Enter credentials
3. Submit form
4. Check DevTools → Application → Cookies
5. Verify session cookie exists

---

### **1.3 API Endpoints Available**
- [ ] `POST /resonant-chat/message` - Available
- [ ] `GET /resonant-chat/history` - Available
- [ ] `GET /resonant-chat/anchors` - Available
- [ ] `GET /resonant-chat/clusters` - Available
- [ ] `GET /resonant-chat/providers` - Available
- [ ] `GET /resonant-chat/provider/stats` - Available

**Test Command:**
```bash
# Test each endpoint
curl -X GET https://dev-swat.com/api/resonant-chat/providers \
  -H "Cookie: your-session-cookie"
```

---

## 💬 **TEST CATEGORY 2: MESSAGE SENDING**

### **2.1 Basic Message Send**
- [ ] Navigate to Resonant Chat page
- [ ] Type message: "Hello, what is Python?"
- [ ] Click Send button
- [ ] Message appears in chat
- [ ] Response received from AI
- [ ] Response displays correctly

**Expected Behavior:**
- Message sent to backend
- Backend processes with Hash Sphere
- Response includes hash, anchors, resonance score
- Response displayed in UI

---

### **2.2 Response Structure**
- [ ] Response includes `hash` field
- [ ] Response includes `anchors` array
- [ ] Response includes `resonanceScore` number
- [ ] Response includes `aiProvider` string
- [ ] Response includes `message.content` string

**Check in DevTools:**
```javascript
// In Network tab, check response
{
  "message": {
    "content": "...",
    "aiProvider": "gemini"
  },
  "hash": "abc123...",
  "anchors": ["python", "programming"],
  "resonanceScore": 0.85
}
```

---

### **2.3 Hash Sphere Processing**
- [ ] Input message is hashed (check backend logs)
- [ ] Memory anchors retrieved
- [ ] Resonance score calculated (> 0)
- [ ] Response is hashed
- [ ] New anchors created
- [ ] Memory updated

**Verification:**
- Check Network tab → Request payload
- Check Network tab → Response payload
- Check Console for hash/anchor logs

---

## 🎯 **TEST CATEGORY 3: HASH SPHERE FEATURES**

### **3.1 Memory Anchors**
- [ ] Anchors load on page load
- [ ] Anchors displayed as badges
- [ ] New anchors added after message
- [ ] Anchors clickable (if implemented)
- [ ] Anchor count increases

**Test Steps:**
1. Load Resonant Chat page
2. Check for anchor badges
3. Send a message
4. Verify new anchors appear

---

### **3.2 Resonance Score**
- [ ] Resonance score displayed
- [ ] Score is a number (0-1)
- [ ] Score updates with each message
- [ ] Score reflects semantic similarity

**Expected:**
- Score between 0 and 1
- Higher score = more relevant memories
- Displayed in UI (if enabled)

---

### **3.3 Hash Display**
- [ ] Hash displayed (if UI option enabled)
- [ ] Hash is a string
- [ ] Hash unique per message
- [ ] Hash represents semantic meaning

---

### **3.4 Resonance Clusters**
- [ ] Clusters load
- [ ] Clusters displayed (if UI implemented)
- [ ] Clusters group related memories
- [ ] Cluster count reasonable

---

## 🤖 **TEST CATEGORY 4: PROVIDER ROUTING**

### **4.1 Provider Selection**
- [ ] Provider dropdown visible
- [ ] Can select "auto" mode
- [ ] Can select specific provider (Gemini, Groq, OpenAI)
- [ ] Selection persists
- [ ] Provider used in request

**Test Steps:**
1. Open provider selector
2. Select "auto"
3. Send message
4. Check which provider responded
5. Select specific provider
6. Send message
7. Verify correct provider used

---

### **4.2 Auto Provider Selection**
- [ ] Auto mode selects best provider
- [ ] Provider health considered
- [ ] Fallback works if provider fails
- [ ] Provider badge shows correct provider

---

### **4.3 Provider Health**
- [ ] Provider health checks work
- [ ] Health status displayed (if UI implemented)
- [ ] Unhealthy providers avoided
- [ ] Health updates periodically

**Test Command:**
```bash
curl https://dev-swat.com/api/resonant-chat/provider/health
```

---

### **4.4 Provider Stats**
- [ ] Provider stats endpoint works
- [ ] Stats include latency, cost, error rate
- [ ] Stats update over time
- [ ] Stats used for routing decisions

**Test Command:**
```bash
curl https://dev-swat.com/api/resonant-chat/provider/stats
```

---

## 🎨 **TEST CATEGORY 5: UI/UX**

### **5.1 Page Load**
- [ ] Page loads without errors
- [ ] No console errors
- [ ] All components render
- [ ] Loading states work
- [ ] Page responsive

---

### **5.2 Message Display**
- [ ] Messages display correctly
- [ ] Markdown rendering works
- [ ] Code blocks formatted
- [ ] Links clickable
- [ ] Images display (if any)

---

### **5.3 Message Input**
- [ ] Input field works
- [ ] Can type messages
- [ ] Enter key sends message
- [ ] Send button works
- [ ] Input clears after send
- [ ] File upload works (if implemented)

---

### **5.4 Visual Indicators**
- [ ] Resonance score displayed
- [ ] Hash displayed (if enabled)
- [ ] Anchor badges shown
- [ ] Provider badge shown
- [ ] Loading indicators work
- [ ] Error messages clear

---

### **5.5 Error Handling**
- [ ] Backend errors show clear messages
- [ ] Network errors handled
- [ ] Timeout errors handled
- [ ] User-friendly error messages
- [ ] Errors don't break UI

**Test Scenarios:**
1. Stop backend → Send message → Check error
2. Disconnect network → Send message → Check error
3. Invalid request → Check error message

---

## 🔄 **TEST CATEGORY 6: INTEGRATION**

### **6.1 Frontend → Backend**
- [ ] Requests reach backend
- [ ] Authentication headers sent
- [ ] Request format correct
- [ ] Response format correct
- [ ] Error handling works

**Check in DevTools:**
- Network tab → Request headers
- Network tab → Request payload
- Network tab → Response payload

---

### **6.2 Backend → Providers**
- [ ] Backend routes to providers
- [ ] API keys work
- [ ] Provider responses received
- [ ] Error handling works
- [ ] Fallback between providers

**Check Backend Logs:**
- Provider selection
- API calls
- Response times
- Errors

---

### **6.3 Backend → Hash Sphere**
- [ ] Hash generation works
- [ ] Memory retrieval works
- [ ] Resonance calculation works
- [ ] Anchor creation works
- [ ] Memory storage works

**Check Backend Logs:**
- Hash generation
- Memory queries
- Resonance scores
- Anchor creation

---

### **6.4 Backend → RAG (if enabled)**
- [ ] RAG retrieval works
- [ ] Embeddings generated
- [ ] Similarity search works
- [ ] Context building works

---

## 🔒 **TEST CATEGORY 7: SECURITY**

### **7.1 API Keys**
- [ ] No hardcoded keys in frontend code
- [ ] Keys in environment variables
- [ ] Backend keys configured
- [ ] Keys not exposed in responses
- [ ] Keys not in browser DevTools

**Verification:**
- Check `src/api/providers/config.ts` - no hardcoded keys
- Check browser DevTools → Sources - no keys visible
- Check Network tab → Responses - no keys exposed

---

### **7.2 Authentication**
- [ ] Unauthorized requests rejected
- [ ] Session management works
- [ ] Token refresh works
- [ ] Logout works
- [ ] Session expires correctly

---

### **7.3 Error Messages**
- [ ] No sensitive data in errors
- [ ] Error messages user-friendly
- [ ] Stack traces not exposed (production)
- [ ] Error codes appropriate

---

## ⚡ **TEST CATEGORY 8: PERFORMANCE**

### **8.1 Response Times**
- [ ] Message response < 5s
- [ ] History load < 2s
- [ ] Anchors load < 1s
- [ ] Provider stats < 1s
- [ ] Page load < 3s

**Measure in DevTools:**
- Network tab → Timing
- Performance tab → Metrics

---

### **8.2 Resource Usage**
- [ ] Memory usage reasonable
- [ ] CPU usage reasonable
- [ ] Network requests optimized
- [ ] Bundle size acceptable
- [ ] No memory leaks

---

## 📊 **TEST RESULTS TEMPLATE**

```markdown
## Test Results - [Date/Time]

### Backend Connection: ✅/❌
- Health Check: ✅/❌
- Endpoints Available: ✅/❌
- Authentication: ✅/❌

### Message Sending: ✅/❌
- Basic Send: ✅/❌
- Response Structure: ✅/❌
- Hash Sphere Processing: ✅/❌

### Hash Sphere Features: ✅/❌
- Memory Anchors: ✅/❌
- Resonance Score: ✅/❌
- Hash Display: ✅/❌
- Clusters: ✅/❌

### Provider Routing: ✅/❌
- Provider Selection: ✅/❌
- Auto Selection: ✅/❌
- Health Checks: ✅/❌
- Stats: ✅/❌

### UI/UX: ✅/❌
- Page Load: ✅/❌
- Message Display: ✅/❌
- Error Handling: ✅/❌

### Integration: ✅/❌
- Frontend → Backend: ✅/❌
- Backend → Providers: ✅/❌
- Backend → Hash Sphere: ✅/❌

### Security: ✅/❌
- API Keys: ✅/❌
- Authentication: ✅/❌
- Error Messages: ✅/❌

### Performance: ✅/❌
- Response Times: ✅/❌
- Resource Usage: ✅/❌

### Issues Found:
1. [Issue description]
2. [Issue description]

### Next Steps:
1. [Action item]
2. [Action item]
```

---

## ✅ **SUCCESS CRITERIA**

### **Must Pass (Critical):**
- ✅ Backend health check returns 200
- ✅ Resonant Chat sends messages successfully
- ✅ Hash Sphere features work (hash, anchors, resonance)
- ✅ Provider routing works
- ✅ UI displays correctly
- ✅ No hardcoded API keys
- ✅ Error handling works

### **Should Pass (Important):**
- ⚠️ Response times < 5s
- ⚠️ All providers available
- ⚠️ Memory persists correctly
- ⚠️ Error messages user-friendly

---

**Status:** 📋 **READY FOR TESTING**

