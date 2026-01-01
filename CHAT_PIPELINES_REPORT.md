# ResonantGenesis Chat Pipelines Comparison Report

## Overview

ResonantGenesis has **4 chat interfaces**, each with different purposes and pipelines:

| Feature | IDE Chat (Windsurf) | Resonant Chat Page | Floating Widget | Build Project |
|---------|---------------------|-------------------|-----------------|---------------|
| **Location** | External IDE | `/resonant-chat` | Global overlay | Modal in chat |
| **Purpose** | Code assistance | Full AI chat | Quick access | Project generation |
| **Backend** | Windsurf API | Chat Service | Chat Service | Chat Service |
| **Memory** | Session only | Persistent DB | Shared with Page | Session |
| **Sync** | None | localStorage | localStorage | None |

---

## 1. IDE Chat Pipeline (Windsurf/Cascade)

**Not part of ResonantGenesis** - This is the external IDE chat you're using now.

```
User Input → Windsurf IDE → Cascade AI → Code Actions
```

- **Memory**: Session-based, no persistence
- **Storage**: None (managed by IDE)
- **Sync**: None with ResonantGenesis

---

## 2. Resonant Chat Page Pipeline (`/resonant-chat`)

**Full-featured AI chat with Hash Sphere integration**

### Flow:
```
User Input
    ↓
ResonantChatPage.tsx (handleSend)
    ↓
sendResonantMessage() API call
    ↓
Gateway (port 8000) → Auth Middleware
    ↓
Chat Service (/resonant-chat/message)
    ↓
LLM Service (Groq/OpenAI/Gemini/Anthropic)
    ↓
Response with metrics (resonanceScore, hash, xyz)
    ↓
Save to PostgreSQL (chat_db)
    ↓
Update UI + triggerChatSync()
```

### Storage:
- **Conversation ID**: `localStorage['resonant-chat-current-conversation']`
- **Messages**: PostgreSQL `resonant_chat_messages` table
- **Settings**: `localStorage['resonant-chat-*']` (various keys)

### Memory Process:
1. Messages saved to `resonant_chat_messages` table
2. Memory anchors extracted via Hash Sphere
3. Anchors stored with XYZ coordinates for 3D visualization
4. Clusters grouped by semantic similarity

### Metrics Calculated:
| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Quality** | Overall response quality | `resonanceScore * 100%` |
| **Resonance Score** | Hash Sphere alignment | Cosine similarity to memory anchors |
| **Hallucination** | Factual accuracy estimate | `1 - evidence_score` (lower is better) |
| **Evidence** | Source grounding | RAG retrieval confidence |
| **Tokens** | Token usage | Counted by LLM provider |

---

## 3. Floating Chat Widget Pipeline

**Quick-access chat overlay, synced with Resonant Chat Page**

### Flow:
```
User Input
    ↓
FloatingChatWidget.tsx (handleSend)
    ↓
sendResonantMessage() API call
    ↓
Gateway (port 8000) → Auth Middleware
    ↓
Chat Service (/resonant-chat/message)
    ↓
LLM Service
    ↓
Response
    ↓
Update UI + triggerChatSync()
```

### Storage:
- **Conversation ID**: `localStorage['resonant-chat-current-conversation']` (SHARED with Page)
- **Position**: `localStorage['resonant-chat-widget-position']`
- **Height**: `localStorage['resonant-chat-widget-height']`

### Sync Mechanism:
1. Both use same `localStorage` key for conversation ID
2. `triggerChatSync()` dispatches `'resonant-chat-sync'` event
3. Widget listens for event and reloads history
4. Periodic polling every 500ms as fallback

### Memory Process:
- Same as Resonant Chat Page (shared conversation)
- Loads history via `getChatHistory(conversationId)`

---

## 4. Build Project Pipeline

**Project generation from natural language**

### Flow:
```
User clicks "Build" button
    ↓
ProjectBuilder modal opens
    ↓
User describes project
    ↓
sendResonantMessage() with build context
    ↓
LLM generates project structure
    ↓
Files created in virtual filesystem
    ↓
User can download or deploy
```

### Storage:
- **Generated files**: Session memory only
- **Project config**: Not persisted

### Memory Process:
- No persistent memory
- Uses conversation context for multi-turn generation

---

## Metrics Explanation

### Quality Score (0-100%)
**What it means**: Overall quality of the AI response based on Hash Sphere resonance.

**How it's calculated**:
```python
quality = resonance_score * 100
# resonance_score = cosine_similarity(response_embedding, memory_anchors)
```

**Interpretation**:
- 90-100%: Excellent - highly aligned with your knowledge base
- 70-89%: Good - reasonable alignment
- 50-69%: Fair - some alignment
- <50%: Poor - may need more context

### Hallucination Score (0-100%)
**What it means**: Estimated likelihood the response contains fabricated information.

**How it's calculated**:
```python
hallucination = (1 - evidence_score) * 100
# evidence_score = max(source_relevance_scores)
```

**Interpretation**:
- 0-20%: Low hallucination risk - well-grounded
- 20-50%: Moderate risk - verify important claims
- >50%: High risk - cross-check facts

### Token Usage
**What it means**: Number of tokens consumed by the request/response.

**How it's calculated**:
- Input tokens: Tokenized user message + context
- Output tokens: Tokenized AI response
- Total: Input + Output

**Limits by Plan**:
| Plan | Monthly Tokens |
|------|---------------|
| Free | 10,000 |
| Starter | 100,000 |
| Professional | 1,000,000 |
| Enterprise | 10,000,000 |
| Unlimited | No limit |

### Resonant Energy
**What it means**: Strength of connection to memory anchors.

**How it's calculated**:
```python
resonant_energy = sum(anchor_weights * anchor_similarities) / num_anchors
```

### Evidence Score
**What it means**: How well the response is grounded in retrieved sources.

**How it's calculated**:
```python
evidence = weighted_average(source_relevance_scores)
```

---

## Graph Visualization

The **Hash Sphere Graph** shows:
- **Nodes**: Memory anchors (your stored knowledge)
- **Edges**: Semantic connections between anchors
- **Colors**: Cluster membership
- **Size**: Relevance to current conversation
- **Position (XYZ)**: 3D embedding coordinates

### How to Access:
1. Click "Show Graph" button in chat
2. Or view in Memory Library sticker
3. Or access via `/resonant-chat/clusters` endpoint

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/resonant-chat/message` | POST | Send message |
| `/resonant-chat/conversations` | POST | Create chat |
| `/resonant-chat/conversations/{id}` | GET | Get history |
| `/resonant-chat/providers` | GET | List AI providers |
| `/resonant-chat/anchors` | GET | Get memory anchors |
| `/resonant-chat/clusters` | GET | Get clusters |
| `/resonant-chat/metrics/{id}` | GET | Get chat metrics |

---

## Sync Issues Fixed

**Problem**: ResonantChatPage used `sessionStorage` while FloatingChatWidget used `localStorage`.

**Solution**: Both now use `localStorage['resonant-chat-current-conversation']` for conversation ID.

**Sync Events**:
- `triggerChatSync()` → dispatches `'resonant-chat-sync'` custom event
- Both components listen for this event
- Widget also polls localStorage every 500ms
