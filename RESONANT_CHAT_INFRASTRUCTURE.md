# 🏗️ Resonant Chat - Complete Infrastructure Documentation

**Date:** 2025-01-30  
**Status:** Full backend infrastructure documentation

---

## 📊 **Executive Summary**

Resonant Chat is a **multi-AI chat system** with **resonance hashing**, **memory anchors**, and **code context integration**. It provides intelligent routing to multiple AI providers, persistent memory, and code-aware conversations.

---

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│              /resonant-chat page                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST API
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend API (FastAPI)                           │
│         /resonant-chat/* endpoints                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐
│ MultiAI      │ │ Resonance  │ │ Code      │
│ Router       │ │ Hasher     │ │ Context   │
└───────┬──────┘ └─────┬──────┘ └────┬──────┘
        │              │              │
        │              │              │
┌───────▼──────────────▼──────────────▼──────┐
│         AI Providers                        │
│  - OpenAI / ChatGPT                         │
│  - Anthropic Claude                         │
│  - Google Gemini                            │
│  - Groq                                     │
│  - Auto (intelligent routing)               │
└─────────────────────────────────────────────┘
        │
        │
┌───────▼────────────────────────────────────┐
│         Database (PostgreSQL)               │
│  - resonant_chats                          │
│  - resonant_chat_messages                   │
│  - memory_anchors                           │
│  - resonance_clusters                       │
└─────────────────────────────────────────────┘
```

---

## 🔌 **Backend Endpoints (6 Endpoints)**

### **1. POST `/resonant-chat/message`**
**Purpose:** Send a message and get AI response with memory integration

**Request:**
```json
{
  "message": "string (1-10000 chars)",
  "chatId": "uuid (optional)",
  "context": {
    "previousMessages": [...],
    "userPreferences": {...}
  },
  "preferred_provider": "openai|chatgpt|gemini|groq|auto",
  "attached_files": ["file/path1", "file/path2"],
  "code_selection": {
    "file": "src/file.ts",
    "lines": [10, 20],
    "code": "selected code snippet"
  },
  "use_rag": true
}
```

**Response:**
```json
{
  "message": {
    "id": "uuid",
    "role": "assistant",
    "content": "AI response",
    "timestamp": "ISO date",
    "aiProvider": "openai",
    "anchors": ["anchor1", "anchor2"],
    "hash": "resonance_hash",
    "resonanceScore": 0.85
  },
  "anchors": ["anchor1", "anchor2"],
  "hash": "resonance_hash",
  "resonanceScore": 0.85,
  "aiProvider": "openai",
  "memoryUpdated": true
}
```

**Process Flow:**
1. ✅ Get or create chat
2. ✅ Hash user message
3. ✅ Get previous messages (last 10 for context)
4. ✅ Get code context (if files attached or code selected)
5. ✅ Check memory anchors (Hash Sphere)
6. ✅ Get code memories (if code context exists)
7. ✅ Build enhanced context (messages + code + anchors)
8. ✅ Route to AI provider (MultiAI Router)
9. ✅ Hash AI response
10. ✅ Calculate resonance score
11. ✅ Extract anchors from both messages
12. ✅ Save user and assistant messages
13. ✅ Create/update memory anchors
14. ✅ Return response

---

### **2. POST `/resonant-chat/create`**
**Purpose:** Create a new chat conversation

**Request:**
```json
{
  "title": "Chat Title (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Chat Title",
  "created_at": "ISO date"
}
```

---

### **3. GET `/resonant-chat/history`**
**Purpose:** Get all chats for current user

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Chat Title",
    "created_at": "ISO date",
    "updated_at": "ISO date",
    "message_count": 5
  }
]
```

---

### **4. GET `/resonant-chat/history/{chat_id}`**
**Purpose:** Get all messages for a specific chat

**Response:**
```json
[
  {
    "id": "uuid",
    "role": "user|assistant",
    "content": "message content",
    "timestamp": "ISO date",
    "aiProvider": "openai",
    "anchors": [],
    "hash": "resonance_hash",
    "resonanceScore": 0.85
  }
]
```

---

### **5. GET `/resonant-chat/anchors`**
**Purpose:** Get memory anchors for current user

**Response:**
```json
[
  {
    "id": "uuid",
    "anchor_text": "key phrase or code snippet",
    "context": "context around anchor",
    "importance_score": 0.75,
    "created_at": "ISO date"
  }
]
```

**Features:**
- Sorted by importance score (descending)
- Includes chat and code anchors
- Used for memory retrieval in conversations

---

### **6. GET `/resonant-chat/clusters`**
**Purpose:** Get resonance clusters (grouped memories)

**Response:**
```json
[
  {
    "id": "uuid",
    "cluster_name": "Cluster Name",
    "resonance_score": 0.90,
    "anchor_count": 5,
    "personality_traits": {...},
    "created_at": "ISO date"
  }
]
```

**Features:**
- Groups related memories by resonance
- Identifies personality traits
- Sorted by resonance score

---

## 🧩 **Core Services**

### **1. MultiAIRouter** (`services/multi_ai_routing.py`)
**Purpose:** Intelligent routing to AI providers

**Features:**
- Auto-selects best provider based on query type
- Supports manual provider selection
- Handles provider failures with fallback
- Code-aware routing (selects best provider for code queries)
- Context-aware routing (uses conversation context)

**Supported Providers:**
- OpenAI / ChatGPT
- Anthropic Claude
- Google Gemini
- Groq
- Auto (intelligent selection)

---

### **2. ResonanceHasher** (`services/resonance_hashing.py`)
**Purpose:** Hash generation and resonance calculation

**Features:**
- **Hash Generation:**
  - Hashes user messages
  - Hashes AI responses
  - Context-aware hashing
  - Code-aware hashing

- **Resonance Calculation:**
  - Calculates resonance score (0-1)
  - Measures semantic similarity
  - Identifies resonant patterns

- **Anchor Extraction:**
  - Extracts key phrases from messages
  - Extracts code patterns
  - Creates memory anchors
  - Updates importance scores

---

### **3. CodeContextService** (`services/code_context.py`)
**Purpose:** Code context integration

**Features:**
- **File Context:**
  - Reads file contents
  - Extracts code structure
  - Provides file metadata

- **Code Memories:**
  - Retrieves code-related memories
  - Searches by query
  - Returns relevant code snippets

- **Code Selection:**
  - Handles selected code
  - Extracts code context
  - Provides line ranges

---

### **4. CodeIndexerService** (`services/code_indexer.py`)
**Purpose:** Code indexing and search

**Features:**
- Indexes code files
- Provides code search
- Extracts code patterns
- Creates code anchors

---

## 💾 **Database Models**

### **1. ResonantChat**
**Table:** `resonant_chats`

**Fields:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users)
- `org_id` (UUID, Foreign Key → organizations)
- `title` (String, max 255)
- `status` (String, default: "active")
- `meta_data` (JSON)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

**Purpose:** Container for chat conversations

---

### **2. ResonantChatMessage**
**Table:** `resonant_chat_messages`

**Fields:**
- `id` (UUID, Primary Key)
- `chat_id` (UUID, Foreign Key → resonant_chats)
- `role` (String: "user" | "assistant" | "system")
- `content` (Text)
- `ai_provider` (String: "openai" | "claude" | "gemini" | "groq")
- `hash` (String, indexed)
- `resonance_score` (Float, 0-1)
- `meta_data` (JSON)
- `created_at` (Timestamp)

**Purpose:** Individual messages in a chat

---

### **3. MemoryAnchor**
**Table:** `memory_anchors`

**Fields:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users)
- `org_id` (UUID, Foreign Key → organizations)
- `chat_id` (UUID, Foreign Key → resonant_chats, nullable)
- `message_id` (UUID, Foreign Key → resonant_chat_messages, nullable)
- `anchor_text` (Text) - Key phrase or code snippet
- `anchor_hash` (String, indexed)
- `context` (Text) - Context around anchor
- `importance_score` (Float, 0-1)
- `anchor_type` (String: "chat" | "code" | "function" | "pattern")
- `file_path` (String, nullable, indexed)
- `function_name` (String, nullable, indexed)
- `language` (String, nullable)
- `line_range` (JSON: {start: int, end: int})
- `code_snippet` (Text, nullable)
- `meta_data` (JSON)
- `created_at` (Timestamp)

**Purpose:** Memory anchors for persistent memory

**Features:**
- Chat anchors (conversation memories)
- Code anchors (code patterns, functions)
- Importance scoring (increases with usage)
- Context preservation

---

### **4. ResonanceCluster**
**Table:** `resonance_clusters`

**Fields:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users)
- `org_id` (UUID, Foreign Key → organizations)
- `cluster_name` (String)
- `cluster_hash` (String, indexed)
- `anchor_ids` (JSON Array of UUIDs)
- `resonance_score` (Float, 0-1)
- `personality_traits` (JSON)
- `meta_data` (JSON)
- `created_at` (Timestamp)

**Purpose:** Grouped memories by resonance

**Features:**
- Groups related anchors
- Identifies personality traits
- Calculates cluster resonance

---

## 🔄 **Message Flow (Detailed)**

### **Step 1: Request Processing**
```
User sends message
  ↓
Validate request (message length, auth)
  ↓
Get or create chat
  ↓
Hash user message
```

### **Step 2: Context Building**
```
Get previous messages (last 10)
  ↓
Get code context (if files/code selected)
  ↓
Check memory anchors (Hash Sphere)
  ↓
Get code memories (if code context)
  ↓
Build enhanced context
```

### **Step 3: AI Routing**
```
Route to AI provider
  - Use preferred_provider if specified
  - Auto-select if "auto" or not specified
  - Code-aware routing for code queries
  ↓
Get AI response
```

### **Step 4: Response Processing**
```
Hash AI response
  ↓
Calculate resonance score
  ↓
Extract anchors (user + response)
  ↓
Extract code anchors (if code context)
```

### **Step 5: Memory Storage**
```
Save user message
  ↓
Save assistant message
  ↓
Create/update memory anchors
  - Check if anchor exists
  - Update importance score if exists
  - Create new anchor if not exists
  ↓
Return response
```

---

## 🎯 **Key Features**

### **1. Multi-AI Routing**
- ✅ Intelligent provider selection
- ✅ Manual provider override
- ✅ Code-aware routing
- ✅ Context-aware routing
- ✅ Fallback handling

### **2. Resonance Hashing**
- ✅ Semantic hashing
- ✅ Resonance scoring (0-1)
- ✅ Pattern detection
- ✅ Similarity measurement

### **3. Memory Anchors**
- ✅ Persistent memory
- ✅ Chat anchors (conversations)
- ✅ Code anchors (code patterns)
- ✅ Importance scoring
- ✅ Context preservation

### **4. Code Integration**
- ✅ File attachment
- ✅ Code selection
- ✅ Code context extraction
- ✅ Code memory retrieval
- ✅ Code-aware responses

### **5. Resonance Clusters**
- ✅ Memory grouping
- ✅ Personality traits
- ✅ Cluster resonance
- ✅ Pattern recognition

---

## 🔐 **Authentication & Authorization**

**Required:** JWT authentication (HttpOnly cookie)

**Dependencies:**
- `get_jwt_identity` - Get current user identity
- `get_session` - Get database session
- User must be authenticated
- Chat ownership verified (user_id match)

---

## 📊 **Performance Considerations**

1. **Context Limiting:**
   - Last 10 messages for context
   - Max 5 memory anchors
   - Max 5 code memories

2. **Anchor Limits:**
   - Max 10 anchors per message
   - Importance score decay
   - Automatic cleanup

3. **Database Indexing:**
   - `hash` indexed (fast lookup)
   - `anchor_hash` indexed
   - `user_id` indexed
   - `chat_id` indexed
   - `file_path` indexed

---

## 🧪 **Testing Status**

### **Endpoints to Test:**
- [ ] `POST /resonant-chat/message` - Send message
- [ ] `POST /resonant-chat/create` - Create chat
- [ ] `GET /resonant-chat/history` - Get all chats
- [ ] `GET /resonant-chat/history/{chat_id}` - Get messages
- [ ] `GET /resonant-chat/anchors` - Get anchors
- [ ] `GET /resonant-chat/clusters` - Get clusters

### **Features to Test:**
- [ ] Basic message sending
- [ ] Multi-AI routing
- [ ] Memory anchors creation
- [ ] Code context integration
- [ ] Resonance scoring
- [ ] Chat persistence
- [ ] Anchor importance scoring

---

## 🚀 **Next Steps**

1. **Test all endpoints** (with authentication)
2. **Verify AI provider connections**
3. **Test code context integration**
4. **Verify memory anchor creation**
5. **Test resonance scoring**
6. **Check database persistence**

---

## 📝 **Notes**

- All endpoints require authentication
- Code context is optional but enhances responses
- Memory anchors improve over time (importance scoring)
- Resonance clusters are automatically created
- Multi-AI routing provides best response quality

---

**Status:** ✅ Infrastructure documented, ready for testing

