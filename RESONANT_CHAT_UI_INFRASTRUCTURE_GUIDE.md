# 💬 Resonant Chat UI Infrastructure - Complete Guide

**Date:** 2025-12-01  
**Purpose:** Complete guide to understanding and modifying the Resonant Chat frontend UI infrastructure

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Component Architecture](#component-architecture)
4. [API Integration](#api-integration)
5. [State Management](#state-management)
6. [Backend → Frontend Mapping](#backend--frontend-mapping)
7. [How to Modify Each Component](#how-to-modify-each-component)
8. [Styling Architecture](#styling-architecture)
9. [Integration Points](#integration-points)

---

## 🎯 Overview

### **What is Resonant Chat UI Infrastructure?**

The Resonant Chat UI infrastructure is the **React + TypeScript frontend** that provides:
- **Intelligent Chat**: Hash Sphere-powered conversations
- **Memory Management**: Memory anchors, clusters, and library
- **Multi-AI Routing**: Automatic provider selection
- **Real-time Updates**: WebSocket/SSE streaming
- **File Attachments**: Code and document support
- **Project Generation**: AI-powered project creation
- **Evidence Visualization**: Graph visualization of evidence chains

### **Technology Stack**
- **Framework**: React 18 + TypeScript
- **State**: React hooks (useState, useEffect, useRef)
- **API Client**: Axios (via `fastapiClient`)
- **Styling**: CSS Modules (2025 design system)
- **Real-time**: WebSocket + SSE
- **Markdown**: ReactMarkdown
- **Location**: `/Applications/ResonantGraphAI_FrontendV0.1/src/`

---

## 📁 File Structure

### **Component Files**

```
src/
├── pages/ResonantChat/
│   ├── ResonantChatPage.tsx              # Main chat page (3426 lines)
│   └── ResonantChatPage-2025.module.css   # Main page styles
├── components/ResonantChat/
│   ├── EnhancedSidebar.tsx                # Sidebar component (1027 lines)
│   ├── EnhancedSidebar-2025.module.css    # Sidebar styles
│   ├── ProjectBuilder.tsx                 # Project generation (263 lines)
│   └── ProjectBuilder.module.css          # Project builder styles
├── components/HashSphere/
│   └── HashSphereIntegration.tsx          # Hash Sphere visualization
├── components/EvidenceGraph/
│   └── EvidenceGraphVisualization.tsx     # Evidence graph visualization
├── api/
│   ├── resonantChat.ts                    # Resonant Chat API (390 lines)
│   └── rag.ts                             # RAG API (255 lines)
└── utils/
    ├── websocketClient.ts                 # WebSocket client
    └── sseClient.ts                       # SSE client
```

### **Key Files**

1. **ResonantChatPage.tsx** - Main chat interface
2. **EnhancedSidebar.tsx** - Conversations, memory, settings sidebar
3. **resonantChat.ts** - Resonant Chat API client
4. **rag.ts** - RAG API client
5. **ProjectBuilder.tsx** - Project generation UI

---

## 🏗️ Component Architecture

### **1. ResonantChatPage Component**

**Location:** `pages/ResonantChat/ResonantChatPage.tsx`

**Purpose:** Main chat interface with message display, input, and all features

**Key Features:**
- Message display with markdown rendering
- Real-time streaming (WebSocket/SSE)
- File attachments
- Code selection
- Provider selection
- Hash Sphere visualization
- Evidence graph
- Project generation
- IDE mode integration

**State Management:**
```typescript
// Messages
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);

// Conversations
const [conversations, setConversations] = useState<Array<{...}>>([]);
const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

// Memory
const [memories, setMemories] = useState<MemoryResponse[]>([]);
const [memoryAnchors, setMemoryAnchors] = useState<Array<{...}>>([]);
const [resonanceClusters, setResonanceClusters] = useState<any[]>([]);

// Settings
const [selectedProvider, setSelectedProvider] = useState<Provider>('auto');
const [temperature, setTemperature] = useState(0.7);
const [maxTokens, setMaxTokens] = useState(2000);
const [useHashSphere, setUseHashSphere] = useState(true);

// Real-time
const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
const [sseClient, setSseClient] = useState<SSEClient | null>(null);
const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
const [streamingContent, setStreamingContent] = useState('');

// Files
const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
const [codeSelection, setCodeSelection] = useState<{...} | null>(null);

// UI States
const [sidebarOpen, setSidebarOpen] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [showEvidenceGraph, setShowEvidenceGraph] = useState<string | null>(null);
const [showHashSphere, setShowHashSphere] = useState(false);
const [splitViewEnabled, setSplitViewEnabled] = useState(false);
const [ideMode, setIdeMode] = useState(false);
const [buildMode, setBuildMode] = useState(false);
```

**Key Methods:**
- `handleSendMessage()` - Sends message to backend
- `loadConversations()` - Loads conversation list
- `loadMemories()` - Loads memory list
- `loadMemoryAnchors()` - Loads Hash Sphere anchors
- `loadResonanceClusters()` - Loads resonance clusters
- `handleRegenerate()` - Regenerates last response
- `handleFileUpload()` - Handles file attachments

**Backend API Calls:**
- `sendResonantMessage()` → `POST /resonant-chat/message`
- `getChatHistory()` → `GET /resonant-chat/history`
- `createChat()` → `POST /resonant-chat/create`
- `getMemoryAnchors()` → `GET /resonant-chat/anchors`
- `getResonanceClusters()` → `GET /resonant-chat/clusters`
- `getEvidenceGraph()` → `GET /resonant-chat/evidence-graph/{message_id}`
- `listMemories()` → `GET /rag/memories`
- `createMemory()` → `POST /rag/memories`
- `uploadFile()` → `POST /rag/files/upload`

---

### **2. EnhancedSidebar Component**

**Location:** `components/ResonantChat/EnhancedSidebar.tsx`

**Purpose:** Sidebar with conversations, memory, files, and settings

**Key Features:**
- Conversations list
- Memory library
- Code files
- Settings panel
- Provider selector
- Export/share options

**Props:**
```typescript
interface EnhancedSidebarProps {
  conversations: Conversation[];
  memories: Memory[];
  currentConversationId: string | null;
  onConversationClick: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onMemoryClick: (memory: Memory) => void;
  onMemorySave: () => void;
  onSettingsClick?: () => void;
  selectedProvider?: string;
  onProviderChange?: (provider: string) => void;
  // ... many more props
}
```

**Tabs:**
1. **Conversations** - List of chat conversations
2. **Memory** - Memory library with search
3. **Files** - Code files and attachments
4. **Settings** - Chat settings and preferences

**Backend API Calls:**
- Uses props passed from ResonantChatPage
- No direct API calls (data passed via props)

---

### **3. ProjectBuilder Component**

**Location:** `components/ResonantChat/ProjectBuilder.tsx`

**Purpose:** Project generation UI with file preview and download

**State Management:**
```typescript
const [files, setFiles] = useState<ProjectFile[]>([]);
const [loading, setLoading] = useState(false);
const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
const [setupInstructions, setSetupInstructions] = useState<string>('');
const [error, setError] = useState<string | null>(null);
```

**Key Methods:**
- `handleGenerate()` - Generates project
- `handleDownloadAll()` - Downloads ZIP
- `handleDownloadFile()` - Downloads single file

**Backend API Calls:**
- `generateProject()` → `POST /code/project/generate`

---

## 🔌 API Integration

### **Resonant Chat API Client**

**File:** `api/resonantChat.ts` (390 lines)

**Functions:**

#### **1. sendResonantMessage()**
**Location:** Line 56

**Endpoint:** `POST /resonant-chat/message`

**Request:**
```typescript
interface ResonantChatRequest {
  message: string;
  chatId?: string;
  context?: {
    previousMessages?: ResonantChatMessage[];
    userPreferences?: Record<string, any>;
  };
  attached_files?: string[];
  code_selection?: {
    file: string;
    lines: number[];
    code?: string;
  };
  preferred_provider?: string;
  use_rag?: boolean;
}
```

**Response:**
```typescript
interface ResonantChatResponse {
  message: ResonantChatMessage & { xyz?: [number, number, number] };
  anchors: string[];
  hash: string;
  resonanceScore: number;
  aiProvider: string;
  memoryUpdated: boolean;
  chatId?: string;
}
```

**Fallback:** Falls back to direct provider call if backend unavailable

---

#### **2. getChatHistory()**
**Location:** Line 183

**Endpoint:** `GET /resonant-chat/history` or `GET /resonant-chat/history/{chatId}`

**Returns:** Chat history messages

---

#### **3. createChat()**
**Location:** Line 198

**Endpoint:** `POST /resonant-chat/create`

**Request:**
```typescript
{ title?: string }
```

**Returns:** `{ chatId: string }`

---

#### **4. getMemoryAnchors()**
**Location:** Line 212

**Endpoint:** `GET /resonant-chat/anchors`

**Returns:** `{ anchors: Array<{...}> }`

**Fallback:** Falls back to RAG memories if Hash Sphere unavailable

---

#### **5. getResonanceClusters()**
**Location:** Line 242

**Endpoint:** `GET /resonant-chat/clusters`

**Returns:** `{ clusters: Array<{...}> }`

**Fallback:** Falls back to RAG memory grouping if Hash Sphere unavailable

---

#### **6. getProviderStats()**
**Location:** Line 298

**Endpoint:** `GET /resonant-chat/provider/stats`

**Returns:** Provider statistics (health, latency, cost)

---

#### **7. getProviders()**
**Location:** Line 312

**Endpoint:** `GET /resonant-chat/providers`

**Returns:** List of available providers

---

#### **8. getProviderHealth()**
**Location:** Line 326

**Endpoint:** `GET /resonant-chat/provider/health`

**Returns:** Provider health status

---

#### **9. getEvidenceGraph()**
**Location:** Line 370

**Endpoint:** `GET /resonant-chat/evidence-graph/{message_id}`

**Returns:** Evidence graph data for visualization

---

### **RAG API Client**

**File:** `api/rag.ts` (255 lines)

**Functions:**

#### **1. askWithRAG()**
**Endpoint:** `POST /rag/ask`

**Request:**
```typescript
interface RAGAskRequest {
  query: string;
  conversation_id?: string;
  top_k?: number;
  use_memory?: boolean;
  provider?: string;
}
```

**Response:**
```typescript
interface RAGAskResponse {
  response: string;
  sources: Array<{...}>;
  validity: number;
  entropy: number;
  evidence_graph: Record<string, any>;
  context_used: boolean;
  conversation_id: string;
}
```

---

#### **2. createMemory()**
**Endpoint:** `POST /rag/memories`

**Request:**
```typescript
interface MemoryCreateRequest {
  content: string;
  metadata?: Record<string, any>;
}
```

**Response:** `MemoryResponse`

---

#### **3. listMemories()**
**Endpoint:** `GET /rag/memories?limit={limit}`

**Returns:** `MemoryResponse[]`

---

#### **4. getMemory()**
**Endpoint:** `GET /rag/memories/{memory_id}`

**Returns:** `MemoryResponse`

---

#### **5. updateMemory()**
**Endpoint:** `PUT /rag/memories/{memory_id}`

**Request:** `MemoryCreateRequest`

**Returns:** `MemoryResponse`

---

#### **6. deleteMemory()**
**Endpoint:** `DELETE /rag/memories/{memory_id}`

**Returns:** `{ success: boolean }`

---

#### **7. listConversations()**
**Endpoint:** `GET /rag/conversations`

**Returns:** `ConversationResponse[]`

---

#### **8. getConversation()**
**Endpoint:** `GET /rag/conversations/{conversation_id}`

**Returns:** `ConversationResponse`

---

#### **9. updateConversation()**
**Endpoint:** `PUT /rag/conversations/{conversation_id}`

**Request:** `{ title?: string }`

**Returns:** `ConversationResponse`

---

#### **10. deleteConversation()**
**Endpoint:** `DELETE /rag/conversations/{conversation_id}`

**Returns:** `{ success: boolean }`

---

#### **11. uploadFile()**
**Endpoint:** `POST /rag/files/upload`

**Request:** `FormData` with file

**Returns:** `{ file_id: string, file_path: string }`

---

## 📊 State Management

### **Message Flow**

```
User types message
  ↓
handleSendMessage() called
  ↓
Prepare request (message, context, files, code selection)
  ↓
sendResonantMessage() API call
  ↓
POST /resonant-chat/message
  ↓
Backend processes:
  1. Hash input
  2. Check memory anchors
  3. Route to AI provider
  4. Hash response
  5. Create anchors
  6. Store in memory
  ↓
Response: { message, anchors, hash, resonanceScore, aiProvider, chatId }
  ↓
Create assistant message with metrics
  ↓
Update messages state
  ↓
If WebSocket connected, subscribe to streaming updates
  ↓
UI updates (message displayed, metrics shown)
```

### **Conversation Loading Flow**

```
User clicks conversation
  ↓
onConversationClick(conversationId) called
  ↓
setCurrentConversationId(conversationId)
  ↓
Save to sessionStorage
  ↓
getChatHistory(conversationId) API call
  ↓
GET /resonant-chat/history/{chatId}
  ↓
Backend returns messages
  ↓
setMessages(messages)
  ↓
UI updates (messages displayed)
```

### **Memory Anchor Loading Flow**

```
Component mounts or user requests
  ↓
loadMemoryAnchors() called
  ↓
getMemoryAnchors() API call
  ↓
GET /resonant-chat/anchors
  ↓
Backend returns anchors with xyz coordinates
  ↓
setMemoryAnchors(anchors)
  ↓
Hash Sphere visualization updates
```

---

## 🔗 Backend → Frontend Mapping

### **Complete API Endpoint Mapping**

| Backend Endpoint | Frontend Function | Component | Line |
|-----------------|------------------|-----------|------|
| `POST /resonant-chat/message` | `sendResonantMessage()` | ResonantChatPage | 751 |
| `GET /resonant-chat/history` | `getChatHistory()` | ResonantChatPage | 183 |
| `GET /resonant-chat/history/{chatId}` | `getChatHistory(chatId)` | ResonantChatPage | 183 |
| `POST /resonant-chat/create` | `createChat()` | ResonantChatPage | 870 |
| `GET /resonant-chat/anchors` | `getMemoryAnchors()` | ResonantChatPage | 508 |
| `GET /resonant-chat/clusters` | `getResonanceClusters()` | ResonantChatPage | 1485 |
| `GET /resonant-chat/evidence-graph/{id}` | `getEvidenceGraph()` | ResonantChatPage | 370 |
| `GET /resonant-chat/provider/stats` | `getProviderStats()` | resonantChat.ts | 298 |
| `GET /resonant-chat/providers` | `getProviders()` | resonantChat.ts | 312 |
| `GET /resonant-chat/provider/health` | `getProviderHealth()` | resonantChat.ts | 326 |
| `POST /rag/ask` | `askWithRAG()` | rag.ts | 59 |
| `POST /rag/memories` | `createMemory()` | ResonantChatPage | 80 |
| `GET /rag/memories` | `listMemories()` | ResonantChatPage | 476 |
| `GET /rag/memories/{id}` | `getMemory()` | rag.ts | 108 |
| `PUT /rag/memories/{id}` | `updateMemory()` | ResonantChatPage | 119 |
| `DELETE /rag/memories/{id}` | `deleteMemory()` | ResonantChatPage | 130 |
| `GET /rag/conversations` | `listConversations()` | ResonantChatPage | 476 |
| `GET /rag/conversations/{id}` | `getConversation()` | rag.ts | 148 |
| `PUT /rag/conversations/{id}` | `updateConversation()` | ResonantChatPage | 177 |
| `DELETE /rag/conversations/{id}` | `deleteConversation()` | ResonantChatPage | 185 |
| `POST /rag/files/upload` | `uploadFile()` | ResonantChatPage | 197 |
| `POST /code/project/generate` | `generateProject()` | ProjectBuilder | 44 |

---

## 🔧 How to Modify Each Component

### **1. Change Message Display Format**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** Message rendering section (around line 2000-2500)

**Current:**
```typescript
<div className={styles.messageContent}>
  <ReactMarkdown>{message.content}</ReactMarkdown>
</div>
```

**To modify:**
```typescript
<div className={styles.messageContent}>
  {message.role === 'user' ? (
    <div className={styles.userMessage}>{message.content}</div>
  ) : (
    <ReactMarkdown
      components={{
        code: ({ node, inline, className, children, ...props }) => {
          // Custom code block rendering
          return <SyntaxHighlighter style={vscDarkPlus} {...props}>
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>;
        }
      }}
    >
      {message.content}
    </ReactMarkdown>
  )}
</div>
```

---

### **2. Change Provider Selection UI**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** Provider selector (around line 1500-1600)

**Current:**
```typescript
<ProviderSelector
  selected={selectedProvider}
  onChange={setSelectedProvider}
  showAutoReason={true}
  autoReason={autoReason}
/>
```

**To modify:**
```typescript
<ProviderSelector
  selected={selectedProvider}
  onChange={(provider) => {
    setSelectedProvider(provider);
    // Add custom logic
    if (provider === 'openai') {
      setTemperature(0.7);
    } else if (provider === 'groq') {
      setTemperature(0.5);
    }
  }}
  showAutoReason={true}
  autoReason={autoReason}
  disabledProviders={['gemini']} // Disable specific providers
/>
```

---

### **3. Change Memory Anchor Display**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** Memory anchors section (around line 500-600)

**Current:**
```typescript
{memoryAnchors.map(anchor => (
  <div key={anchor.id}>{anchor.anchor_text}</div>
))}
```

**To modify:**
```typescript
{memoryAnchors
  .sort((a, b) => b.importance_score - a.importance_score)
  .slice(0, 10) // Show top 10
  .map(anchor => (
    <div 
      key={anchor.id}
      className={styles.anchorItem}
      style={{ 
        opacity: anchor.importance_score > 0.7 ? 1 : 0.6 
      }}
    >
      <span className={styles.anchorText}>{anchor.anchor_text}</span>
      <span className={styles.anchorScore}>
        {Math.round(anchor.importance_score * 100)}%
      </span>
    </div>
  ))}
```

---

### **4. Change File Upload Behavior**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** File upload handler (around line 600-700)

**Current:**
```typescript
const handleFileUpload = async (files: FileList) => {
  // Upload files
};
```

**To modify:**
```typescript
const handleFileUpload = async (files: FileList) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['text/', 'application/json', 'application/javascript'];
  
  Array.from(files).forEach(file => {
    // Validate size
    if (file.size > maxSize) {
      showError(`File ${file.name} is too large (max 10MB)`);
      return;
    }
    
    // Validate type
    if (!allowedTypes.some(type => file.type.startsWith(type))) {
      showError(`File ${file.name} type not allowed`);
      return;
    }
    
    // Add to attached files
    setAttachedFiles(prev => [...prev, file]);
  });
};
```

---

### **5. Change Streaming Update Behavior**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** WebSocket/SSE handlers (around line 1400-1500)

**Current:**
```typescript
wsClient.onMessage((message: WebSocketMessage) => {
  if (message.message_id === streamingMessageId) {
    setStreamingContent(prev => prev + message.content);
  }
});
```

**To modify:**
```typescript
wsClient.onMessage((message: WebSocketMessage) => {
  if (message.message_id === streamingMessageId) {
    setStreamingContent(prev => {
      const newContent = prev + message.content;
      
      // Update message in real-time
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === streamingMessageId
            ? { ...msg, content: newContent }
            : msg
        )
      );
      
      return newContent;
    });
  }
});
```

---

### **6. Change Sidebar Tab Order**

**File:** `components/ResonantChat/EnhancedSidebar.tsx`

**Location:** Tab rendering (around line 200-300)

**Current:**
```typescript
const tabs = ['conversations', 'memory', 'files', 'settings'];
```

**To modify:**
```typescript
const tabs = ['conversations', 'memory', 'settings', 'files']; // Reorder
```

---

### **7. Add New Message Action**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** Message context menu (around line 1800-1900)

**To add:**
```typescript
const handleCopyMessage = (messageId: string) => {
  const message = messages.find(m => m.id === messageId);
  if (message) {
    navigator.clipboard.writeText(message.content);
    success('Message copied to clipboard');
  }
};

const handleShareMessage = async (messageId: string) => {
  const message = messages.find(m => m.id === messageId);
  if (message && navigator.share) {
    try {
      await navigator.share({
        title: 'Resonant Chat Message',
        text: message.content
      });
    } catch (err) {
      logger.error('Share failed', err);
    }
  }
};
```

---

### **8. Change Evidence Graph Display**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** Evidence graph section (around line 2800-2900)

**Current:**
```typescript
{showEvidenceGraph && (
  <EvidenceGraphVisualization data={evidenceGraphData} />
)}
```

**To modify:**
```typescript
{showEvidenceGraph && evidenceGraphData && (
  <div className={styles.evidenceGraphContainer}>
    <div className={styles.evidenceGraphHeader}>
      <h3>Evidence Graph</h3>
      <button onClick={() => setShowEvidenceGraph(null)}>Close</button>
    </div>
    <EvidenceGraphVisualization 
      data={evidenceGraphData}
      onNodeClick={(nodeId) => {
        // Navigate to related message
        const relatedMessage = messages.find(m => m.id === nodeId);
        if (relatedMessage) {
          // Scroll to message
        }
      }}
    />
  </div>
)}
```

---

### **9. Add Custom Provider**

**File:** `api/resonantChat.ts`

**Location:** `sendResonantMessage()` function (Line 56)

**To add:**
```typescript
// In ResonantChatRequest interface (Line 16)
preferred_provider?: string; // Add 'custom' to allowed values

// In sendResonantMessage() (Line 56)
if (request.preferred_provider === 'custom') {
  // Custom provider logic
  const customResponse = await callCustomProvider(request.message);
  return {
    message: {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: customResponse.content,
      timestamp: new Date().toISOString(),
      aiProvider: 'custom'
    },
    anchors: [],
    hash: '',
    resonanceScore: 0,
    aiProvider: 'custom',
    memoryUpdated: false
  };
}
```

---

### **10. Change Conversation List Display**

**File:** `components/ResonantChat/EnhancedSidebar.tsx`

**Location:** Conversations tab (around line 400-500)

**Current:**
```typescript
{conversations.map(conv => (
  <div onClick={() => onConversationClick(conv.id)}>
    {conv.title || 'Untitled'}
  </div>
))}
```

**To modify:**
```typescript
{conversations
  .sort((a, b) => {
    // Sort by date
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return dateB - dateA;
  })
  .map(conv => (
    <div 
      key={conv.id}
      className={`${styles.conversationItem} ${
        conv.id === currentConversationId ? styles.active : ''
      }`}
      onClick={() => onConversationClick(conv.id)}
    >
      <div className={styles.conversationTitle}>
        {conv.title || 'Untitled Conversation'}
      </div>
      {conv.created_at && (
        <div className={styles.conversationDate}>
          {new Date(conv.created_at).toLocaleDateString()}
        </div>
      )}
    </div>
  ))}
```

---

## 🎨 Styling Architecture

### **CSS Modules Structure**

**File:** `pages/ResonantChat/ResonantChatPage-2025.module.css`

**Key Classes:**
- `.chatPage` - Main container
- `.messageBubble` - Message display
- `.inputContainer` - Input area
- `.sidebar` - Sidebar container
- `.splitView` - Split view layout

**Design Tokens Used:**
```css
.chatPage {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: var(--space-16);
  border-radius: var(--radius-md);
}
```

**File:** `components/ResonantChat/EnhancedSidebar-2025.module.css`

**Key Classes:**
- `.sidebar` - Main sidebar
- `.tabs` - Tab navigation
- `.conversationList` - Conversations list
- `.memoryList` - Memory list
- `.settingsPanel` - Settings panel

---

## 🔗 Integration Points

### **1. Router Integration**

**File:** `router/index.tsx` or similar

**Route:**
```typescript
{
  path: '/resonant-chat',
  element: <ResonantChatPage />
}
```

---

### **2. Authentication Integration**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** Line 96-97

```typescript
const session = getSession();
const isLoggedIn = isAuthenticated() && !!session;
```

**Usage:**
- Guest users: Limited features, sessionStorage
- Logged-in users: Full features, backend storage

---

### **3. Toast Context Integration**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** Line 98

```typescript
const { success, error: showError, warning, info } = useToastContext();
```

**Usage:**
```typescript
success('Message sent successfully');
showError('Failed to send message');
warning('Provider unavailable');
info('Loading conversation...');
```

---

### **4. Theme Integration**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** Line 99

```typescript
const { theme, toggleTheme } = useThemeStore();
```

**Usage:**
- Light/dark mode switching
- Theme-aware styling

---

### **5. WebSocket/SSE Integration**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** Line 140-144

```typescript
const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
const [sseClient, setSseClient] = useState<SSEClient | null>(null);
const [useWebSocket, setUseWebSocket] = useState(true);
```

**Usage:**
- Real-time message streaming
- Connection status monitoring
- Automatic fallback to SSE if WebSocket fails

---

## 📊 Component Data Flow

### **Message Send Flow**

```
User types message and clicks send
  ↓
handleSendMessage() called
  ↓
Prepare request:
  - message + file context
  - attached file paths
  - code selection
  - previous messages (context)
  - preferred provider
  ↓
sendResonantMessage() API call
  ↓
POST /resonant-chat/message
  ↓
Backend processes:
  1. Hash input with Hash Sphere
  2. Search memory anchors
  3. Build context
  4. Route to AI provider
  5. Hash response
  6. Create anchors
  7. Store in memory
  ↓
Response: { message, anchors, hash, resonanceScore, aiProvider, chatId }
  ↓
Create assistant message with:
  - content
  - aiProvider
  - hash
  - anchors
  - resonanceScore
  - xyz coordinates
  - metrics
  ↓
Update messages state
  ↓
If WebSocket connected:
  - Subscribe to streaming updates
  - Update message content in real-time
  ↓
If new anchors created:
  - loadMemoryAnchors() to refresh
  ↓
If auto-save enabled:
  - createChat() or save to sessionStorage
  ↓
UI updates:
  - Message displayed
  - Metrics shown
  - Hash Sphere visualization updated
```

### **Conversation Load Flow**

```
User clicks conversation in sidebar
  ↓
onConversationClick(conversationId) called
  ↓
setCurrentConversationId(conversationId)
  ↓
Save to sessionStorage
  ↓
getChatHistory(conversationId) API call
  ↓
GET /resonant-chat/history/{chatId}
  ↓
Backend returns messages
  ↓
setMessages(messages)
  ↓
UI updates:
  - Messages displayed
  - Scroll to bottom
  - Hash Sphere visualization updated
```

### **Memory Anchor Load Flow**

```
Component mounts or user requests
  ↓
loadMemoryAnchors() called
  ↓
getMemoryAnchors() API call
  ↓
GET /resonant-chat/anchors
  ↓
Backend returns anchors with:
  - id
  - anchor_text
  - anchor_hash
  - xyz coordinates
  - importance_score
  ↓
setMemoryAnchors(anchors)
  ↓
Hash Sphere visualization updates
```

---

## 🚀 Quick Reference

### **Component → API → Backend Endpoint**

| Component | Method | API Function | Backend Endpoint |
|-----------|--------|--------------|-----------------|
| ResonantChatPage | `handleSendMessage()` | `sendResonantMessage()` | `POST /resonant-chat/message` |
| ResonantChatPage | `loadConversations()` | `listConversations()` | `GET /rag/conversations` |
| ResonantChatPage | `loadChatHistory()` | `getChatHistory()` | `GET /resonant-chat/history/{id}` |
| ResonantChatPage | `handleNewChat()` | `createChat()` | `POST /resonant-chat/create` |
| ResonantChatPage | `loadMemoryAnchors()` | `getMemoryAnchors()` | `GET /resonant-chat/anchors` |
| ResonantChatPage | `loadResonanceClusters()` | `getResonanceClusters()` | `GET /resonant-chat/clusters` |
| ResonantChatPage | `loadEvidenceGraph()` | `getEvidenceGraph()` | `GET /resonant-chat/evidence-graph/{id}` |
| ResonantChatPage | `loadMemories()` | `listMemories()` | `GET /rag/memories` |
| ResonantChatPage | `handleSaveMemory()` | `createMemory()` | `POST /rag/memories` |
| ResonantChatPage | `handleUpdateMemory()` | `updateMemory()` | `PUT /rag/memories/{id}` |
| ResonantChatPage | `handleDeleteMemory()` | `deleteMemory()` | `DELETE /rag/memories/{id}` |
| ResonantChatPage | `handleDeleteConversation()` | `deleteConversation()` | `DELETE /rag/conversations/{id}` |
| ResonantChatPage | `handleFileUpload()` | `uploadFile()` | `POST /rag/files/upload` |
| ProjectBuilder | `handleGenerate()` | `generateProject()` | `POST /code/project/generate` |

---

## ⚠️ Important Notes

1. **Hash Sphere vs RAG**: `useHashSphere` toggle switches between Hash Sphere (default) and RAG
2. **Real-time Updates**: WebSocket preferred, SSE fallback
3. **Guest Users**: Limited features, sessionStorage for persistence
4. **File Attachments**: Supports text files, code files, and documents
5. **Code Selection**: Can select code from IDE for context
6. **Provider Routing**: Automatic provider selection based on query
7. **Memory Anchors**: Hash Sphere anchors with 3D coordinates
8. **Resonance Clusters**: Grouped memory clusters
9. **Evidence Graph**: Visualization of evidence chains
10. **Project Generation**: Integrated with IDE backend

---

## 🔍 Debugging Tips

### **Check API Calls**

```typescript
// Add to api/resonantChat.ts
fastapiClient.interceptors.request.use(request => {
  console.log('Resonant Chat Request:', request.method, request.url, request.data);
  return request;
});

fastapiClient.interceptors.response.use(
  response => {
    console.log('Resonant Chat Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('Resonant Chat Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

### **Check State Updates**

```typescript
// Add to ResonantChatPage.tsx
useEffect(() => {
  console.log('Messages updated:', messages.length);
  console.log('Current conversation:', currentConversationId);
  console.log('Memory anchors:', memoryAnchors.length);
}, [messages, currentConversationId, memoryAnchors]);
```

### **Check WebSocket Connection**

```typescript
// Add to ResonantChatPage.tsx
useEffect(() => {
  if (wsClient) {
    console.log('WebSocket connected:', wsClient.isConnected());
    wsClient.onConnect(() => console.log('WebSocket connected'));
    wsClient.onDisconnect(() => console.log('WebSocket disconnected'));
    wsClient.onError((error) => console.error('WebSocket error:', error));
  }
}, [wsClient]);
```

---

**End of Guide** 🎉

