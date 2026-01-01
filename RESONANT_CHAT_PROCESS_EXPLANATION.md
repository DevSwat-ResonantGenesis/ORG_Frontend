# Resonant Chat: Complete Process Flow
## How It Works - Step by Step

**Date:** 2025-01-29  
**Status:** ✅ Fully Operational

---

## 🔄 **COMPLETE PROCESS: USER INPUT TO OUTPUT**

### **STEP 1: USER SENDS MESSAGE**

```
User types: "What is Python?"
User clicks Send or presses Enter
```

**What Happens:**
- Input is captured from textarea
- Attached files are read (if any)
- File content is appended to message
- User message object is created
- Message is added to chat history immediately

---

### **STEP 2: INPUT PREPARATION**

**File Processing (if files attached):**
- Text files are read and converted to text
- File content is appended to user message
- File paths are extracted for backend

**Query Assembly:**
```javascript
queryWithContext = userMessage + fileContent
```

**Context Building:**
- Last 5 messages are extracted
- Conversation history is prepared
- User preferences are included

---

### **STEP 3: SYSTEM SELECTION**

**Decision Logic:**
```javascript
if (isLoggedIn && useHashSphere) {
  // Use Hash Sphere (primary)
  use_rag = false
} else {
  // Use RAG (fallback or guest)
  use_rag = true
}
```

**Current Implementation:**
- ✅ **Hash Sphere is PRIMARY** for logged-in users
- ✅ **RAG is FALLBACK** (via `use_rag` parameter)
- ✅ **Guests use RAG** (no Hash Sphere access)

---

### **STEP 4: API CALL - sendResonantMessage()**

**Request Sent to Backend:**
```javascript
POST /resonant-chat/message
{
  message: "What is Python?",
  chatId: "conv-123",
  context: {
    previousMessages: [...],
    userPreferences: {}
  },
  attached_files: ["file1.txt"],
  code_selection: {...},
  preferred_provider: "auto",
  use_rag: false  // Hash Sphere mode
}
```

**Authentication:**
- HttpOnly cookies sent automatically
- `RG-Role` header: User's role
- `RG-Org-ID` header: Organization ID
- Backend identifies user from session

---

### **STEP 5: BACKEND PROCESSING (Hash Sphere)**

**What Backend Does:**

1. **Hash Generation**
   - Input message is hashed
   - Hash represents semantic meaning
   - XYZ coordinates calculated in 3D semantic space

2. **Memory Extraction (Multi-Method)**
   - **Anchor-based lookup:** Fast keyword matching
   - **Semantic proximity:** Distance in 3D space
   - **Resonance filtering:** Semantic alignment
   - **Cluster retrieval:** Related topic groups
   - Top-k memories selected and ranked

3. **Context Building**
   - Memories organized by type
   - Formatted for AI provider
   - Includes: content, resonance, metadata

4. **Provider Routing**
   - Selects best AI provider (auto or user choice)
   - Routes to: OpenAI, Gemini, Claude, Groq, etc.

5. **AI Request**
   - Sends formatted prompt to provider
   - Includes: user query + retrieved memories + history
   - Provider generates response

6. **Response Processing**
   - Response is hashed
   - Resonance score calculated
   - Anchors extracted and created
   - Memory updated (if configured)

---

### **STEP 6: RESPONSE RECEIVED**

**Response Structure:**
```javascript
{
  message: {
    id: "msg-123",
    role: "assistant",
    content: "Python is a high-level programming language...",
    timestamp: "2025-01-29T...",
    aiProvider: "openai"
  },
  hash: "a3f9b2c1d4e5f6...",
  anchors: ["python", "programming", "language"],
  resonanceScore: 0.92,
  aiProvider: "openai",
  memoryUpdated: true
}
```

---

### **STEP 7: FRONTEND PROCESSING**

**Message Object Created:**
```javascript
const assistantMessage = {
  id: "assistant-123",
  role: "assistant",
  content: resonantResponse.message.content,
  timestamp: new Date(),
  aiProvider: resonantResponse.aiProvider,
  hash: resonantResponse.hash,
  anchors: resonantResponse.anchors,
  resonanceScore: resonantResponse.resonanceScore,
  metrics: {
    resonantEnergy: resonantResponse.resonanceScore,
    evidence: resonantResponse.resonanceScore
  }
}
```

**Anchor Updates:**
- New anchors added to `memoryAnchors` state
- Anchors displayed in UI
- Available for @ mentions

**Message Added:**
- Added to `messages` state
- Triggers UI re-render
- Scrolls to bottom

---

### **STEP 8: UI DISPLAY**

**Message Rendered:**
- Assistant message displayed
- Markdown formatting applied
- Code blocks syntax highlighted

**Hash Sphere Data Displayed:**
- ✅ **Resonance Score:** "Quality: 92%"
- ✅ **Hash:** "ID: a3f9b2c1..."
- ✅ **Anchors:** Badge list (python, programming, language)
- ✅ **Provider Badge:** "OpenAI"

**Interactive Elements:**
- Copy button
- Regenerate button
- Share button
- Export options

---

### **STEP 9: AUTO-SAVE (if enabled)**

**Logged-in Users:**
- After 2+ messages, auto-saves to backend
- Creates conversation via `createChat()`
- Conversation ID stored
- Available in conversation history

**Guest Users:**
- Saves to `sessionStorage`
- Available during session
- Lost on browser close

---

## 🔐 **USER ISOLATION PROCESS**

### **How Multi-User Works:**

**User A Sends Message:**
1. Request includes User A's session cookies
2. Backend identifies: User A
3. Backend routes to: **User A's Hash Sphere**
4. Only User A's memories/anchors accessed
5. Response contains: User A's data only

**User B Sends Same Message:**
1. Request includes User B's session cookies
2. Backend identifies: User B
3. Backend routes to: **User B's Hash Sphere**
4. Only User B's memories/anchors accessed
5. Response contains: User B's data only (may differ)

**Key Point:** Same query, different memories per user!

---

## 📊 **DATA FLOW DIAGRAM**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT                                │
│  "What is Python?"                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND: Input Preparation                     │
│  • Read attached files                                       │
│  • Build context (last 5 messages)                           │
│  • Prepare request                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API CALL: sendResonantMessage()                 │
│  POST /resonant-chat/message                                 │
│  Headers: RG-Role, RG-Org-ID, Cookies                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND: Hash Sphere Processing                 │
│  1. Hash generation                                          │
│  2. Memory extraction (anchor + proximity + resonance)      │
│  3. Context building                                         │
│  4. Provider routing                                         │
│  5. AI request                                               │
│  6. Response processing (hash + resonance + anchors)         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              RESPONSE RECEIVED                                │
│  {                                                            │
│    message: { content, aiProvider },                        │
│    hash: "a3f9b2c1...",                                      │
│    anchors: ["python", "programming"],                       │
│    resonanceScore: 0.92                                     │
│  }                                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND: Processing                             │
│  • Create message object                                     │
│  • Update anchors state                                      │
│  • Add to messages array                                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              UI DISPLAY                                       │
│  • Show message with markdown                                │
│  • Display resonance score                                   │
│  • Display hash                                              │
│  • Show anchor badges                                        │
│  • Show provider badge                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              AUTO-SAVE (if enabled)                          │
│  • Logged-in: Save to backend                                │
│  • Guest: Save to sessionStorage                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 **KEY FEATURES**

### **1. Hash Sphere Integration** ✅

- **Hash Generation:** Every message hashed
- **Anchor System:** Keywords linked to memories
- **Resonance Scoring:** Semantic alignment measured
- **3D Semantic Space:** Memories positioned in XYZ space
- **Cluster Organization:** Related memories grouped

### **2. Multi-User Support** ✅

- **User Isolation:** Each user has own Hash Sphere
- **Session-Based:** Automatic user identification
- **Organization Support:** Org-level boundaries
- **Privacy:** Complete data isolation

### **3. Hybrid Architecture** ✅

- **Primary:** Hash Sphere (logged-in users)
- **Fallback:** RAG (if Hash Sphere fails or guests)
- **Seamless:** Automatic fallback
- **Progressive:** Better features for logged-in users

### **4. Provider Routing** ✅

- **Auto Selection:** Backend chooses best provider
- **Manual Selection:** User can choose provider
- **Multi-Provider:** OpenAI, Gemini, Claude, Groq
- **Cost Optimization:** Backend optimizes costs

### **5. Memory Management** ✅

- **Auto-Anchor Creation:** New anchors created automatically
- **Memory Updates:** Responses stored in memory
- **Anchor Following:** @ mentions use anchors
- **Cluster Updates:** Clusters updated with new memories

---

## 📋 **TECHNICAL DETAILS**

### **APIs Used:**

1. **`sendResonantMessage()`** - Primary messaging
2. **`getMemoryAnchors()`** - Load anchors
3. **`getResonanceClusters()`** - Load clusters
4. **`createChat()`** - Auto-save conversations
5. **RAG APIs** - Memory/conversation management

### **Authentication:**

- **HttpOnly Cookies:** Secure token storage
- **Session Headers:** `RG-Role`, `RG-Org-ID`
- **Automatic:** No manual user ID passing
- **Secure:** Backend validates all requests

### **Error Handling:**

- **Retry Logic:** 3 retries with exponential backoff
- **Graceful Fallback:** RAG if Hash Sphere fails
- **User Feedback:** Error messages displayed
- **Network Resilience:** Handles connection issues

---

## 🎨 **UI FEATURES**

### **Message Display:**

- ✅ Markdown rendering
- ✅ Code syntax highlighting
- ✅ Copy/regenerate/share buttons
- ✅ Provider badge
- ✅ Timestamp (if enabled)

### **Hash Sphere Data:**

- ✅ Resonance score badge
- ✅ Hash ID display
- ✅ Anchor badges (clickable)
- ✅ Quality indicators

### **Interactive:**

- ✅ @ mentions (anchor autocomplete)
- ✅ / commands (quick actions)
- ✅ File attachments
- ✅ Code selection
- ✅ Export options

---

## 🔄 **COMPLETE CYCLE**

**Example Flow:**

1. **User:** "What is Python?"
2. **Frontend:** Prepares request with context
3. **Backend:** Hashes query, finds related memories
4. **Backend:** Routes to OpenAI GPT-4
5. **AI:** Generates response with context
6. **Backend:** Hashes response, calculates resonance
7. **Backend:** Creates anchors: ["python", "programming"]
8. **Frontend:** Displays response with metadata
9. **Frontend:** Updates anchor list
10. **Frontend:** Auto-saves conversation

**Result:**
- User sees response
- Response has hash: "a3f9b2c1..."
- Resonance score: 92%
- Anchors: python, programming, language
- Anchors available for future @ mentions

---

## 📝 **SUMMARY**

**Resonant Chat Process:**

1. ✅ **User Input** → Prepared with context
2. ✅ **Hash Sphere API** → `sendResonantMessage()`
3. ✅ **Backend Processing** → Hash, anchors, resonance
4. ✅ **AI Provider** → Generates response
5. ✅ **Response Processing** → Hash, resonance, anchors
6. ✅ **Frontend Display** → Shows message + metadata
7. ✅ **Anchor Updates** → New anchors available
8. ✅ **Auto-Save** → Conversation stored

**Key Points:**

- ✅ Hash Sphere is PRIMARY system
- ✅ Multi-user isolation works
- ✅ Anchors system active
- ✅ Resonance scoring working
- ✅ Hybrid architecture (Hash Sphere + RAG fallback)
- ✅ Complete user isolation
- ✅ Progressive enhancement (logged-in vs guest)

**Status: ✅ FULLY OPERATIONAL**

