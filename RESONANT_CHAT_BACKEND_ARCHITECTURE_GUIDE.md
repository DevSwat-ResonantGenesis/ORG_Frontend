# 🔌 Resonant Chat Backend - Complete Architecture Guide

**Date:** 2025-12-01  
**Purpose:** Complete guide to understanding and modifying the Resonant Chat backend API

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Services](#services)
6. [Request/Response Flow](#requestresponse-flow)
7. [How to Modify Each Component](#how-to-modify-each-component)
8. [Integration Points](#integration-points)

---

## 🎯 Overview

### **What is Resonant Chat Backend?**

The Resonant Chat backend is a **FastAPI-based API** that powers the intelligent chat system with:
- **Hash Sphere Integration**: 3D semantic memory system
- **Multi-AI Routing**: Automatic provider selection (OpenAI, Groq, Gemini)
- **Memory Extraction**: Multi-method memory retrieval
- **Resonance Hashing**: Semantic hashing for memory matching
- **Anchor Management**: Memory anchor creation and retrieval
- **Cluster Analysis**: Resonance cluster grouping

### **Technology Stack**
- **Framework**: FastAPI
- **Database**: PostgreSQL (via SQLModel)
- **Authentication**: JWT + Hash Sphere tokens
- **AI Providers**: OpenAI, Groq, Google Gemini
- **Location**: `/Applications/ResonantGraphAIV0.1/backend/fastapi_app/`

---

## 📁 File Structure

### **Main Files**

```
/Applications/ResonantGraphAIV0.1/backend/fastapi_app/
├── routers/
│   └── resonant_chat.py          # Main router (1157 lines) - ALL ENDPOINTS
├── models/governance/
│   └── resonant_chat.py          # Database models (107 lines)
├── services/
│   ├── multi_ai_routing.py      # AI provider routing (531 lines)
│   ├── memory_extraction.py     # Memory retrieval (426 lines)
│   ├── resonance_hashing.py     # Hash generation
│   └── prompt_builder.py        # Context building
└── main.py                       # FastAPI app (includes router)
```

### **Router Registration**

**File:** `main.py`

```python
from fastapi_app.routers import resonant_chat

app.include_router(resonant_chat.router)
```

**Router Prefix:** `/resonant-chat`

---

## 🔌 API Endpoints

### **1. Send Message** (Primary Endpoint)

**Endpoint:** `POST /resonant-chat/message`

**Location:** `routers/resonant_chat.py:76`

**Request Model:**
```python
class ResonantChatRequest(BaseModel):
    message: str                    # User message
    chatId: Optional[str]           # Chat ID (creates new if None)
    context: Optional[Dict]         # Previous messages
    attached_files: Optional[List[str]]  # File paths
    code_selection: Optional[Dict]  # Code context
    preferred_provider: Optional[str]  # "openai", "groq", "gemini"
    use_rag: Optional[bool]         # Use RAG (default: False = Hash Sphere)
```

**Response Model:**
```python
class ResonantChatResponse(BaseModel):
    message: Dict[str, Any]         # Assistant message
    anchors: List[str]              # Created anchors
    hash: str                       # Response hash
    resonanceScore: float           # Resonance score (0-1)
    aiProvider: str                 # Provider used
    memoryUpdated: bool             # Whether memory was updated
    chatId: Optional[str]           # Chat ID
```

**Process Flow:**
1. Authenticate user (JWT or guest)
2. Get or create chat
3. Hash user message
4. Extract memories (Hash Sphere or RAG)
5. Build prompt context
6. Route to AI provider
7. Hash response
8. Calculate resonance score
9. Store messages
10. Create anchors
11. Return response

**To modify:**
- Change memory extraction: Line 226-280
- Change prompt building: Line 350-379
- Change AI routing: Line 364-379
- Change anchor creation: Line 484-548

---

### **2. Get Chat History**

**Endpoint:** `GET /resonant-chat/history` or `GET /resonant-chat/history/{chat_id}`

**Location:** `routers/resonant_chat.py:569-570`

**Parameters:**
- `chat_id` (optional): Specific chat ID
- `limit` (default: 100): Number of messages

**Response:**
```json
[
  {
    "id": "uuid",
    "role": "user" | "assistant",
    "content": "message text",
    "timestamp": "ISO date",
    "aiProvider": "chatgpt",
    "hash": "resonance_hash",
    "resonanceScore": 0.85,
    "xyz": [0.5, 0.3, 0.7]
  }
]
```

**To modify:**
- Change limit: Line 573
- Change ordering: Line 591
- Change response format: Line 595-607

---

### **3. Create Chat**

**Endpoint:** `POST /resonant-chat/create`

**Location:** `routers/resonant_chat.py:631`

**Request:**
```json
{
  "title": "Chat Title"  // Optional
}
```

**Response:**
```json
{
  "chatId": "uuid",
  "title": "Chat Title"
}
```

**To modify:**
- Change default title: Line 647
- Change status: Line 648

---

### **4. List Chats**

**Endpoint:** `GET /resonant-chat/chats`

**Location:** `routers/resonant_chat.py:660`

**Parameters:**
- `limit` (default: 50): Number of chats

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Chat Title",
    "status": "active",
    "created_at": "ISO date",
    "updated_at": "ISO date"
  }
]
```

---

### **5. Get Memory Anchors**

**Endpoint:** `GET /resonant-chat/anchors`

**Location:** `routers/resonant_chat.py:688`

**Parameters:**
- `limit` (default: 100): Number of anchors

**Response:**
```json
{
  "anchors": [
    {
      "id": "uuid",
      "text": "anchor text",
      "hash": "anchor_hash",
      "importance": 0.85,
      "type": "chat",
      "xyz": [0.5, 0.3, 0.7]
    }
  ],
  "count": 10
}
```

**To modify:**
- Change ordering: Line 704
- Change limit: Line 705

---

### **6. Get Resonance Clusters**

**Endpoint:** `GET /resonant-chat/clusters`

**Location:** `routers/resonant_chat.py:724`

**Parameters:**
- `limit` (default: 20): Number of clusters

**Response:**
```json
{
  "clusters": [
    {
      "id": "uuid",
      "name": "cluster name",
      "resonance_score": 0.85,
      "anchor_count": 5,
      "personality_traits": {}
    }
  ],
  "count": 3
}
```

---

### **7. Compute Resonance**

**Endpoint:** `POST /resonant-chat/compute-resonance`

**Location:** `routers/resonant_chat.py:765`

**Request:**
```json
{
  "text1": "First text",
  "text2": "Second text"
}
```

**Response:**
```json
{
  "resonance_score": 0.85,
  "hash1": "hash1",
  "hash2": "hash2",
  "xyz1": [0.5, 0.3, 0.7],
  "xyz2": [0.6, 0.4, 0.8],
  "proximity": 0.92
}
```

---

### **8. Embed Text**

**Endpoint:** `POST /resonant-chat/embed`

**Location:** `routers/resonant_chat.py:795`

**Request:**
```json
{
  "text": "Text to embed"
}
```

**Response:**
```json
{
  "hash": "resonance_hash",
  "xyz": [0.5, 0.3, 0.7],
  "text": "Text to embed"
}
```

---

### **9. Get Evidence Graph**

**Endpoint:** `GET /resonant-chat/evidence-graph/{message_id}`

**Location:** `routers/resonant_chat.py:813`

**Response:**
```json
{
  "message_id": "uuid",
  "nodes": [
    {
      "id": "uuid",
      "type": "query" | "anchor",
      "label": "text preview",
      "xyz": [0.5, 0.3, 0.7],
      "role": "user" | "assistant"
    }
  ],
  "edges": [
    {
      "source": "message_id",
      "target": "anchor_id",
      "type": "evidence"
    }
  ],
  "node_count": 5,
  "edge_count": 4
}
```

**Security:** Only returns data for user's own messages

---

### **10. Get Providers**

**Endpoint:** `GET /resonant-chat/providers`

**Location:** `routers/resonant_chat.py:901`

**Response:**
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI ChatGPT",
      "model": "gpt-4o",
      "enabled": true,
      "api_key_configured": true,
      "status": "available"
    }
  ],
  "count": 3
}
```

**To modify:**
- Add new provider: Add new section in function (Line 922-960)
- Change model names: Line 929, 940, 951

---

### **11. Get Provider Health**

**Endpoint:** `GET /resonant-chat/provider/health`

**Location:** `routers/resonant_chat.py:963`

**Parameters:**
- `provider` (optional): Specific provider ID

**Response:**
```json
{
  "providers": {
    "openai": {
      "health": "healthy" | "degraded" | "down",
      "latency_ms": 123,
      "last_checked": "ISO date",
      "api_key_configured": true
    }
  },
  "timestamp": "ISO date"
}
```

---

### **12. Get Provider Stats**

**Endpoint:** `GET /resonant-chat/provider/stats`

**Location:** `routers/resonant_chat.py:1073`

**Response:**
```json
{
  "providers": {
    "openai": {
      "health": "healthy",
      "latency_ms": 123,
      "cost_per_1k_tokens": 0.03,
      "error_rate": 0.05,
      "requests_count": 100,
      "tokens_used": 50000,
      "last_checked": "ISO date",
      "api_key_configured": true
    }
  },
  "timestamp": "ISO date",
  "period": "24h"
}
```

**To modify:**
- Change time period: Line 1101
- Change cost estimates: Line 1121, 1124, 1127

---

## 🗄️ Data Models

### **1. ResonantChat**

**Location:** `models/governance/resonant_chat.py:17`

```python
class ResonantChat(IDMixin, TimestampMixin, SQLModel, table=True):
    __tablename__ = "resonant_chats"
    
    user_id: GUID
    org_id: GUID
    title: str = "New Chat"
    status: str = "active"
    meta_data: dict = {}
```

**To modify:**
- Add fields: Add new `Field()` declarations
- Change defaults: Modify default values

---

### **2. ResonantChatMessage**

**Location:** `models/governance/resonant_chat.py:32`

```python
class ResonantChatMessage(IDMixin, TimestampMixin, SQLModel, table=True):
    __tablename__ = "resonant_chat_messages"
    
    chat_id: GUID
    role: str                      # 'user', 'assistant', 'system'
    content: str
    ai_provider: Optional[str]      # 'chatgpt', 'groq', 'gemini'
    hash: Optional[str]             # Resonance hash
    resonance_score: Optional[float]  # 0-1
    xyz_x: Optional[float]          # X coordinate
    xyz_y: Optional[float]          # Y coordinate
    xyz_z: Optional[float]          # Z coordinate
    meta_data: dict = {}
```

**To modify:**
- Add fields: Add new `Field()` declarations
- Change role options: Modify validation

---

### **3. MemoryAnchor**

**Location:** `models/governance/resonant_chat.py:51`

```python
class MemoryAnchor(IDMixin, TimestampMixin, SQLModel, table=True):
    __tablename__ = "memory_anchors"
    
    user_id: GUID
    org_id: GUID
    chat_id: Optional[GUID]
    message_id: Optional[GUID]
    anchor_text: str
    anchor_hash: str
    context: str = ""
    importance_score: float = 0.5
    xyz_x: Optional[float]
    xyz_y: Optional[float]
    xyz_z: Optional[float]
    anchor_type: str = "chat"      # 'chat' | 'code' | 'function' | 'pattern'
    file_path: Optional[str]
    function_name: Optional[str]
    language: Optional[str]
    line_range: Optional[dict]
    code_snippet: Optional[str]
    meta_data: dict = {}
```

**To modify:**
- Add code fields: Already has file_path, function_name, etc.
- Change anchor types: Modify `anchor_type` validation

---

### **4. ResonanceCluster**

**Location:** `models/governance/resonant_chat.py:91`

```python
class ResonanceCluster(IDMixin, TimestampMixin, SQLModel, table=True):
    __tablename__ = "resonance_clusters"
    
    user_id: GUID
    org_id: GUID
    cluster_name: str
    cluster_hash: str
    anchor_ids: list[str] = []
    resonance_score: float = 0.0
    personality_traits: dict = {}
    meta_data: dict = {}
```

---

## 🔧 Services

### **1. MultiAIRouter**

**Location:** `services/multi_ai_routing.py:18`

**Purpose:** Routes queries to AI providers with automatic fallback

**Key Methods:**

#### `route_query()`
```python
def route_query(
    message: str,
    context: Optional[List[Dict]] = None,
    preferred_provider: Optional[str] = None,
    code_context: Optional[Dict] = None,
    evidence_vector: Optional[List[float]] = None,
) -> Dict:
    """
    Returns:
        {
            'provider': str,
            'response': str,
            'metadata': dict
        }
    """
```

**Provider Priority:**
1. Preferred provider (if specified)
2. Groq (fast)
3. ChatGPT (quality)
4. Gemini (fallback)

**To modify:**
- Change provider priority: Line 64-81
- Add new provider: Add new `_call_*` method
- Change models: Line 173, 258, 330

#### `_call_chatgpt()`
**Location:** Line 158

**Model:** `gpt-4o`

**To modify:**
- Change model: Line 173
- Change temperature: Line 175
- Change max_tokens: Line 176

#### `_call_groq()`
**Location:** Line 211

**Model:** `llama-3.3-70b-versatile`

**To modify:**
- Change model: Line 258
- Change timeout: Line 263

#### `_call_gemini()`
**Location:** Line 312

**Models tried:** `gemini-2.0-flash`, `gemini-2.5-flash`, `gemini-2.5-pro`

**To modify:**
- Change models: Line 330
- Change order: Line 330

---

### **2. MemoryExtractionService**

**Location:** `services/memory_extraction.py:23`

**Purpose:** Extracts relevant memories using multiple methods

**Key Methods:**

#### `extract_memories()`
```python
def extract_memories(
    session: Session,
    user_id: UUID,
    org_id: UUID,
    query: str,
    query_hash: str,
    query_xyz: Tuple[float, float, float],
    limit: int = 5,
    use_anchors: bool = True,
    use_proximity: bool = True,
    use_resonance: bool = True,
    use_clusters: bool = True,
) -> List[Dict]:
```

**Extraction Methods:**
1. **Anchor-based** (fast keyword matching)
2. **Proximity-based** (3D distance)
3. **Resonance-based** (hash similarity)
4. **Cluster-based** (context grouping)

**To modify:**
- Change method weights: Line 412-417
- Disable methods: Set `use_*` flags to False
- Change limit: Line 37

#### `_rank_memories()`
**Location:** Line 373

**Scoring Weights:**
- Resonance: 0.4
- Proximity: 0.3
- Anchor: 0.2
- Recency: 0.1

**To modify:**
- Change weights: Line 412-417
- Change recency decay: Line 400

---

### **3. ResonanceHasher**

**Location:** `services/resonance_hashing.py` (referenced but not shown)

**Purpose:** Generates semantic hashes and calculates resonance

**Key Methods:**
- `hash_text()`: Generate hash from text
- `calculate_resonance()`: Calculate resonance between two hashes
- `calculate_proximity()`: Calculate 3D distance
- `extract_anchors()`: Extract keywords from text

---

## 🔄 Request/Response Flow

### **Complete Message Flow**

```
1. User sends message
   ↓
2. POST /resonant-chat/message
   ↓
3. Authentication (JWT or guest)
   ↓
4. Get or create chat
   ↓
5. Hash user message
   ↓
6. Extract memories (Hash Sphere)
   ↓
7. Build prompt context
   ↓
8. Route to AI provider
   ↓
9. Get AI response
   ↓
10. Hash response
   ↓
11. Calculate resonance score
   ↓
12. Store messages in database
   ↓
13. Create memory anchors
   ↓
14. Return response to frontend
```

### **Memory Extraction Flow**

```
1. Query received
   ↓
2. Hash query → query_hash, query_xyz
   ↓
3. Extract by anchors (keyword matching)
   ↓
4. Extract by proximity (3D distance)
   ↓
5. Extract by resonance (hash similarity)
   ↓
6. Extract by clusters (context grouping)
   ↓
7. Rank all memories (multi-method scoring)
   ↓
8. Return top-k memories
```

### **AI Routing Flow**

```
1. Message + context received
   ↓
2. Check preferred_provider
   ↓
3. Build provider priority list
   ↓
4. Try preferred provider first
   ↓
5. If error → try next provider
   ↓
6. Continue until success or all fail
   ↓
7. Return response or error
```

---

## 🔧 How to Modify Each Component

### **1. Change Default AI Provider**

**File:** `services/multi_ai_routing.py`

```python
# Find this (Line 140):
def _select_provider(self, message: str, context: Optional[List[Dict]] = None) -> str:
    if self.groq_api_key:
        return "groq"
    elif self.openai_client:
        return "chatgpt"
    # ...

# Change to:
def _select_provider(self, message: str, context: Optional[List[Dict]] = None) -> str:
    if self.openai_client:
        return "chatgpt"  # Prefer ChatGPT
    elif self.groq_api_key:
        return "groq"
    # ...
```

---

### **2. Change AI Model**

**File:** `services/multi_ai_routing.py`

```python
# ChatGPT (Line 173):
model="gpt-4o"  # Change to "gpt-4-turbo" or other

# Groq (Line 258):
model="llama-3.3-70b-versatile"  # Change to other Groq model

# Gemini (Line 330):
models_to_try = ['gemini-2.0-flash', 'gemini-2.5-flash']  # Change order
```

---

### **3. Change Memory Extraction Weights**

**File:** `services/memory_extraction.py`

```python
# Find this (Line 412):
combined_score = (
    resonance_score * 0.4 +
    proximity_score * 0.3 +
    anchor_score * 0.2 +
    recency_score * 0.1
)

# Change to:
combined_score = (
    resonance_score * 0.5 +  # Increase resonance weight
    proximity_score * 0.3 +
    anchor_score * 0.15 +    # Decrease anchor weight
    recency_score * 0.05     # Decrease recency weight
)
```

---

### **4. Change Memory Limit**

**File:** `routers/resonant_chat.py`

```python
# Find this (Line 267):
limit=5

# Change to:
limit=10  # Get more memories
```

---

### **5. Change Resonance Calculation**

**File:** `routers/resonant_chat.py`

```python
# Find this (Line 417):
resonance_score = hasher.calculate_resonance(user_hash, assistant_hash)

# Add custom logic:
if len(request.message) > 1000:
    resonance_score = resonance_score * 0.9  # Penalize long messages
```

---

### **6. Change Anchor Creation Logic**

**File:** `routers/resonant_chat.py`

```python
# Find this (Line 488):
for mem in memories[:5]:

# Change to:
for mem in memories[:10]:  # Create more anchors

# Or change importance threshold:
if mem.get("resonance_score", 0.5) > 0.7:  # Only high-resonance anchors
    # Create anchor
```

---

### **7. Add New Provider**

**File:** `services/multi_ai_routing.py`

```python
# 1. Add API key check in __init__ (Line 21):
self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")

# 2. Add to route_query (Line 81):
if "anthropic" not in available_providers and self.anthropic_api_key:
    available_providers.append("anthropic")

# 3. Add _call_anthropic method:
def _call_anthropic(self, message: str, context: Optional[List[Dict]] = None) -> Dict:
    # Implementation
    pass

# 4. Add to route_query try block (Line 94):
elif provider == "anthropic":
    result = self._call_anthropic(message, context)
```

---

### **8. Change Response Format**

**File:** `routers/resonant_chat.py`

```python
# Find this (Line 549):
return ResonantChatResponse(
    message={...},
    anchors=anchors[:5],
    # ...
)

# Add custom fields:
return ResonantChatResponse(
    message={
        **existing_message,
        "custom_field": "value"  # Add new field
    },
    anchors=anchors[:5],
    # ...
)
```

---

### **9. Change Authentication**

**File:** `routers/resonant_chat.py`

```python
# Find this (Line 80):
identity: Optional[Identity] = Depends(get_hash_sphere_identity),

# Change to:
identity: Identity = Depends(get_jwt_identity),  # Require JWT only

# Or add custom dependency:
identity: Identity = Depends(custom_auth),
```

---

### **10. Change Database Query**

**File:** `routers/resonant_chat.py`

```python
# Find this (Line 295):
recent_db_messages = session.exec(
    select(ResonantChatMessage)
    .where(ResonantChatMessage.chat_id == UUID(chat_id))
    .order_by(ResonantChatMessage.created_at.desc())
    .limit(10)
).all()

# Change to:
recent_db_messages = session.exec(
    select(ResonantChatMessage)
    .where(ResonantChatMessage.chat_id == UUID(chat_id))
    .where(ResonantChatMessage.role == "assistant")  # Only assistant messages
    .order_by(ResonantChatMessage.created_at.desc())
    .limit(20)  # More messages
).all()
```

---

## 🔗 Integration Points

### **1. Hash Sphere Integration**

**Location:** `routers/resonant_chat.py:260`

```python
memories = memory_extractor.extract_memories(
    session=session,
    user_id=UUID(user_id),
    org_id=UUID(org_id),
    query=request.message,
    query_hash=user_hash,
    query_xyz=user_xyz,
    limit=5
)
```

**To modify:**
- Change extraction methods: Set `use_*` flags
- Change limit: Modify `limit` parameter

---

### **2. RAG Integration**

**Location:** `routers/resonant_chat.py:193`

```python
rag_engine.store_memory(
    session=session,
    user_id=user_id,
    org_id=org_id,
    content=request.message,
    metadata={...}
)
```

**Auto-saves messages to RAG for fallback**

---

### **3. Prompt Builder Integration**

**Location:** `routers/resonant_chat.py:351`

```python
prompt_data = build_prompt(
    history_messages=recent_messages,
    rag_memories=rag_memories_formatted,
    anchors=anchors_list
)
```

**Builds context for AI providers**

---

### **4. Database Models**

**Tables:**
- `resonant_chats` - Chat conversations
- `resonant_chat_messages` - Individual messages
- `memory_anchors` - Memory anchors
- `resonance_clusters` - Resonance clusters

**To modify:**
- Add fields: Edit `models/governance/resonant_chat.py`
- Create migration: Run Alembic migration

---

## 📊 Quick Reference: Endpoint → File → Line

| Endpoint | Method | File | Line |
|----------|--------|------|------|
| `/message` | POST | `routers/resonant_chat.py` | 76 |
| `/history` | GET | `routers/resonant_chat.py` | 569 |
| `/history/{chat_id}` | GET | `routers/resonant_chat.py` | 570 |
| `/create` | POST | `routers/resonant_chat.py` | 631 |
| `/chats` | GET | `routers/resonant_chat.py` | 660 |
| `/anchors` | GET | `routers/resonant_chat.py` | 688 |
| `/clusters` | GET | `routers/resonant_chat.py` | 724 |
| `/compute-resonance` | POST | `routers/resonant_chat.py` | 765 |
| `/embed` | POST | `routers/resonant_chat.py` | 795 |
| `/evidence-graph/{message_id}` | GET | `routers/resonant_chat.py` | 813 |
| `/providers` | GET | `routers/resonant_chat.py` | 901 |
| `/provider/health` | GET | `routers/resonant_chat.py` | 963 |
| `/provider/stats` | GET | `routers/resonant_chat.py` | 1073 |

---

## ⚠️ Important Notes

1. **Authentication:** Supports both JWT (registered) and guest (session-based)
2. **Guest Users:** Auto-generates user_id/org_id from session
3. **Memory Extraction:** Uses Hash Sphere by default, RAG as fallback
4. **AI Routing:** Automatic fallback on errors
5. **Resonance Hashing:** All messages are hashed for memory matching
6. **Anchor Creation:** Only creates anchors from high-resonance memories
7. **Security:** All queries filtered by user_id and org_id
8. **Auto-Save:** Messages auto-saved to RAG for compatibility

---

## 🚀 Quick Commands

### **Test Endpoint Locally**

```bash
# Start backend
cd /Applications/ResonantGraphAIV0.1
docker compose up -d api

# Test message endpoint
curl -X POST http://localhost:8001/resonant-chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Test providers
curl http://localhost:8001/resonant-chat/providers
```

### **View API Docs**

```bash
# Open in browser
http://localhost:8001/docs
```

---

**End of Guide** 🎉

