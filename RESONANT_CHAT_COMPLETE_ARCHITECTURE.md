# 🏗️ Resonant Chat: Complete Architecture & Functionality Documentation

**Date:** 2025-01-30  
**Status:** ✅ Fully Operational  
**Version:** 1.0

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Data Flow & Connections](#data-flow--connections)
5. [Project Creation System](#project-creation-system)
6. [IDE Chat Integration](#ide-chat-integration)
7. [Complete Feature List](#complete-feature-list)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Component Structure](#component-structure)
10. [State Management](#state-management)

---

## 🎯 Overview

**Resonant Chat** is an AI-powered chat interface that combines:
- **Hash Sphere**: Semantic memory system with resonance scoring
- **RAG (Retrieval-Augmented Generation)**: Fallback memory system
- **Multi-AI Provider Support**: OpenAI, Anthropic, Groq, Gemini, etc.
- **Project Building**: Generate complete code projects
- **IDE Integration**: Full-featured code editor with chat
- **Memory Management**: Persistent conversation and memory storage

### Key Technologies
- **Frontend**: React + TypeScript, Monaco Editor, CSS Modules
- **Backend**: FastAPI (Python), SQLAlchemy, Hash Sphere Service
- **Database**: PostgreSQL with tenant isolation
- **Authentication**: JWT tokens (HttpOnly cookies), 12-hour sessions
- **Real-time**: WebSocket/SSE for streaming responses

---

## 🔧 Backend Architecture

### Core Services

#### 1. **Prompt Builder Service** (`services/prompt_builder.py`)
**Purpose**: Intelligently ranks and merges context from multiple sources

**Functions**:
- `rank_rag_memories()`: Ranks RAG memories by semantic score + recency
- `rank_hash_sphere()`: Ranks Hash Sphere anchors by resonance score
- `rank_history()`: Extracts last N messages from conversation
- `build_prompt()`: Merges all context sources with weighted scoring

**Scoring Weights**:
- RAG Memories: 45% (W_RAG = 0.45)
- Hash Sphere Anchors: 35% (W_HASH_SPHERE = 0.35)
- Conversation History: 20% (W_HISTORY = 0.20)

**Output**:
```python
{
  "context_blocks": [...],  # Ranked context items
  "model_messages": [...],  # Final prompt for LLM
  "debug": {...}            # Debug info
}
```

#### 2. **Resonant Chat Router** (`routers/resonant_chat.py`)
**Main Endpoint**: `POST /resonant-chat/message`

**Process Flow**:
1. **Authentication**: Optional (supports guest users)
   - Logged-in: Uses JWT identity
   - Guest: Creates guest identity from `guest_session_id` cookie

2. **Context Building**:
   - Retrieves recent messages (last 6)
   - Retrieves RAG memories (semantic search)
   - Retrieves Hash Sphere anchors (resonance search)
   - Calls `build_prompt()` to merge context

3. **AI Routing**:
   - Uses `MultiAIRouter.route_query()`
   - Routes to selected provider (OpenAI, Anthropic, Groq, etc.)
   - Handles provider failures gracefully

4. **Response Processing**:
   - Hashes response using `ResonanceHasher`
   - Calculates resonance score
   - Creates/updates memory anchors
   - Stores in Hash Sphere and RAG

5. **Response Format**:
```python
{
  "message": {
    "id": "...",
    "role": "assistant",
    "content": "...",
    "timestamp": "...",
    "xyz": [x, y, z]  # Hash Sphere coordinates
  },
  "anchors": ["python", "programming"],
  "hash": "a3f9b2c1...",
  "resonanceScore": 0.92,
  "aiProvider": "openai",
  "memoryUpdated": true,
  "chatId": "conv-123"
}
```

#### 3. **Code Router** (`routers/code.py`)
**Project Generation Endpoint**: `POST /code/project/generate`

**Process**:
1. Searches Hash Sphere for similar project patterns
2. Infers project structure from description
3. Generates files one by one with context
4. Indexes generated files immediately
5. Creates Hash Sphere anchors for the project

**File Operations**:
- `GET /code/project/files`: List project files
- `POST /code/project/file/read`: Read file content
- `POST /code/project/file/write`: Write file content
- `POST /code/project/file/delete`: Delete file
- `POST /code/project/upload`: Upload ZIP project

#### 4. **Multi-AI Router** (`services/multi_ai_router.py`)
**Purpose**: Routes queries to different AI providers

**Supported Providers**:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Groq (Llama)
- Mistral
- Cohere

**Features**:
- Automatic provider selection ("auto" mode)
- Provider health checking
- Cost tracking
- Error handling and fallback

---

## 🎨 Frontend Architecture

### Main Component: `ResonantChatPage.tsx`

**Location**: `src/pages/ResonantChat/ResonantChatPage.tsx`  
**Size**: ~3,700 lines  
**Purpose**: Main chat interface with all features

#### Key State Variables (50+ states)

**Message Management**:
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [isRegenerating, setIsRegenerating] = useState<string | null>(null);
const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
```

**UI State**:
```typescript
const [sidebarOpen, setSidebarOpen] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [showMemoryLibrary, setShowMemoryLibrary] = useState(false);
const [showMetrics, setShowMetrics] = useState(false);
const [splitViewEnabled, setSplitViewEnabled] = useState(false);
```

**Project & IDE**:
```typescript
const [buildMode, setBuildMode] = useState(false);
const [generatedProject, setGeneratedProject] = useState<{...} | null>(null);
const [ideMode, setIdeMode] = useState(false);
const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
```

**Hash Sphere**:
```typescript
const [memoryAnchors, setMemoryAnchors] = useState<Array<{...}>>([]);
const [resonanceClusters, setResonanceClusters] = useState<any[]>([]);
const [useHashSphere, setUseHashSphere] = useState(true);
```

**File & Code**:
```typescript
const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
const [codeSelection, setCodeSelection] = useState<{...} | null>(null);
```

### Message Sending Flow (`handleSend`)

**Step 1: Input Validation**
```typescript
if (!input.trim() || isLoading) return;
```

**Step 2: Project Detection**
```typescript
const projectDetection = detectProjectRequest(currentInput);
if (buildMode || projectDetection.isProject) {
  // Show Project Builder
  setGeneratedProject({ description: currentInput, projectType: ... });
  return;
}
```

**Step 3: IDE Detection**
```typescript
const ideKeywords = ['open project', 'edit project', 'ide mode'];
if (ideKeywords.some(keyword => currentInput.toLowerCase().includes(keyword))) {
  setIdeMode(true);
  return;
}
```

**Step 4: File Processing**
```typescript
// Read text files and append to message
const fileContents = await Promise.all(
  attachedFiles.map(async (file) => {
    const content = await readTextFile(file);
    return `\n\n[File: ${file.name}]\n${content}`;
  })
);
const queryWithContext = currentInput + fileContents.join('\n');
```

**Step 5: API Call**
```typescript
const resonantResponse = await sendResonantMessage({
  message: queryWithContext,
  chatId: currentConversationId,
  context: {
    previousMessages: messages.slice(-5).map(...),
    userPreferences: {}
  },
  attached_files: attachedFilePaths,
  code_selection: codeSelection,
  preferred_provider: selectedProvider,
  use_rag: useHashSphere ? false : true
});
```

**Step 6: Response Processing**
```typescript
// Extract metrics
const resonanceScore = resonantResponse.resonanceScore;
const hash = resonantResponse.hash;
const anchors = resonantResponse.anchors;
const aiProvider = resonantResponse.aiProvider;

// Create assistant message
const assistantMessage: Message = {
  id: `assistant-${Date.now()}`,
  role: 'assistant',
  content: responseContent,
  timestamp: new Date(),
  aiProvider,
  hash,
  anchors,
  resonanceScore,
  xyz: messageObj?.xyz
};
```

**Step 7: State Updates**
```typescript
setMessages(prev => [...prev, assistantMessage]);
if (resonantResponse.anchors?.length > 0) {
  loadMemoryAnchors(); // Reload anchors
}
```

### Project Detection Logic (`detectProjectRequest`)

**Code Indicators** (Skip if message looks like code):
- Starts/ends with code blocks (```)
- Function/class declarations
- Import/export statements
- Large code blocks with braces/parentheses

**Action Words**:
- `build`, `create`, `generate`, `make`, `scaffold`
- `can you build`, `please create`, `help me make`

**Project Keywords**:
- `project`, `app`, `application`, `website`, `todo`, `calculator`

**Detection Logic**:
```typescript
const isProject = 
  (hasActionWord && hasProjectKeyword) || 
  (hasStrongAction && (hasProjectKeyword || hasProjectType)) ||
  (hasProjectKeyword && (lower.includes('for me') || lower.includes('please')));
```

---

## 🔄 Data Flow & Connections

### Complete Message Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INPUT                                │
│  User types message + attaches files                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND: Input Preparation                     │
│  • Read attached files                                       │
│  • Detect project request                                    │
│  • Build context (last 5 messages)                         │
│  • Prepare request object                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API CALL: sendResonantMessage()                 │
│  POST /resonant-chat/message                                 │
│  Headers: RG-Role, RG-Org-ID, Cookies                        │
│  Body: { message, chatId, context, attached_files, ... }    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND: Resonant Chat Router                    │
│  1. Authenticate (JWT or guest)                              │
│  2. Get tenant session                                        │
│  3. Retrieve recent messages (last 6)                        │
│  4. Retrieve RAG memories (semantic search)                  │
│  5. Retrieve Hash Sphere anchors (resonance search)          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PROMPT BUILDER SERVICE                          │
│  • Rank RAG memories (semantic + recency)                    │
│  • Rank Hash Sphere anchors (resonance)                       │
│  • Extract conversation history (last 6)                     │
│  • Merge with weighted scoring                               │
│  • Build final prompt for LLM                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              MULTI-AI ROUTER                                  │
│  • Select provider (auto or specified)                       │
│  • Route query to provider                                   │
│  • Handle streaming (if supported)                           │
│  • Return response                                           │
└─────────────────────────────────────────────────────────────┐
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              RESPONSE PROCESSING                             │
│  • Hash response using ResonanceHasher                        │
│  • Calculate resonance score                                 │
│  • Create/update memory anchors                               │
│  • Store in Hash Sphere                                      │
│  • Store in RAG (if enabled)                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND: Response Handling                      │
│  • Extract metrics (hash, anchors, resonance)               │
│  • Create assistant message object                           │
│  • Update messages state                                     │
│  • Reload memory anchors                                      │
│  • Auto-save conversation                                    │
│  • Display in UI                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Connections

```
ResonantChatPage.tsx
├── EnhancedSidebar.tsx
│   ├── Conversations list
│   ├── Memories list
│   └── Settings panel
├── IDELayout.tsx (when ideMode = true)
│   ├── File tree (Explorer)
│   ├── Monaco Editor
│   ├── Terminal (ExecutionPanel)
│   ├── Git Panel
│   └── Chat Panel (shows messages from ResonantChatPage)
├── ProjectBuilder.tsx (when generatedProject exists)
│   ├── File tree
│   ├── Code preview
│   └── Download buttons
├── HashSphereIntegration.tsx (3D visualization)
├── EvidenceGraphVisualization.tsx (graph visualization)
└── Input Bar
    ├── Textarea
    ├── File attachment
    ├── Provider selector
    └── Action buttons (Build, IDE, etc.)
```

---

## 📦 Project Creation System

### What "Create Project" Window Should Do

The **Project Builder** component (`ProjectBuilder.tsx`) is displayed when:
1. User clicks "Build" button, OR
2. User message is detected as project request

### Project Builder Flow

**Step 1: Auto-Generate on Mount**
```typescript
useEffect(() => {
  if (description) {
    handleGenerate();
  }
}, [description]);
```

**Step 2: API Call**
```typescript
const response = await generateProject({
  description: "Build a todo app",
  project_type: "react" // Optional
});
```

**Step 3: Backend Processing**
1. Searches Hash Sphere for similar projects
2. Infers project structure
3. Generates files one by one
4. Indexes files immediately
5. Creates Hash Sphere anchors

**Step 4: Display Results**
- **File Tree**: Shows all generated files
- **Code Preview**: Syntax-highlighted code
- **Setup Instructions**: How to run the project
- **Download Options**: ZIP or individual files

### Project Builder Features

✅ **File Tree View**
- Shows all generated files
- Click to preview code
- File icons by extension

✅ **Code Preview**
- Syntax highlighting
- File explanation
- Download individual file

✅ **Download All**
- Creates ZIP file
- Preserves directory structure
- Downloads automatically

✅ **Setup Instructions**
- Installation steps
- Dependencies
- How to run

### Integration with IDE

After project generation:
1. User can click "Open in IDE" (if implemented)
2. Project files are loaded into IDE
3. User can edit, run, and commit code

---

## 💻 IDE Chat Integration

### Connection Between Resonant Chat and IDE Chat

**YES, they are connected!**

#### How It Works:

**1. Message Sharing**
```typescript
// In ResonantChatPage.tsx
<IDELayout
  messages={messages}  // ← Passes messages from Resonant Chat
  isLoading={isLoading}
  chatInput={...}      // ← Passes chat input component
  onChatMessage={(message) => {
    // When user sends message from IDE
    setInput(message);
    setTimeout(() => {
      handleSend();  // ← Uses same handleSend function
    }, 0);
  }}
/>
```

**2. Chat Panel in IDE**
- IDE has its own chat panel (right side)
- Shows messages from `ResonantChatPage`
- Uses same message state
- Displays same conversation

**3. Unified Message Flow**
```
IDE Chat Input
    │
    ▼
onChatMessage callback
    │
    ▼
ResonantChatPage.handleSend()
    │
    ▼
sendResonantMessage() API
    │
    ▼
Backend processing
    │
    ▼
Response updates messages state
    │
    ▼
Both IDE Chat Panel AND Main Chat display message
```

**4. State Synchronization**
- `messages` state is shared
- `isLoading` state is shared
- Both UI components update simultaneously

### IDE Chat Panel Features

✅ **Message History**
- Shows all messages from conversation
- User messages (blue background)
- Assistant messages (dark background)
- Timestamps

✅ **Auto-Scroll**
- Scrolls to bottom on new messages
- Smooth scrolling

✅ **Loading Indicator**
- Shows "Thinking..." while waiting
- Animated dots

✅ **Resizable Panel**
- Drag left edge to resize
- Width: 250px - 600px

✅ **Close Button**
- Toggle visibility
- Can reopen from activity bar

---

## 🎯 Complete Feature List

### Core Chat Features

#### 1. **Message Sending**
- ✅ Text input with auto-resize
- ✅ File attachments (text, code, images)
- ✅ Code selection (highlight code to include)
- ✅ @ mentions (anchor autocomplete)
- ✅ / commands (quick actions)
- ✅ Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- ✅ Stop generation (Ctrl+C / Cmd+C)

#### 2. **Message Display**
- ✅ Markdown rendering
- ✅ Syntax highlighting for code blocks
- ✅ Copy button
- ✅ Regenerate button
- ✅ Edit message (user messages)
- ✅ Delete message
- ✅ Share message
- ✅ Evidence graph visualization
- ✅ Hash Sphere 3D visualization

#### 3. **Provider Management**
- ✅ Provider selector (Auto, OpenAI, Anthropic, Groq, etc.)
- ✅ Auto provider selection
- ✅ Provider health checking
- ✅ Provider stats display
- ✅ Fallback on provider failure

#### 4. **Memory & Anchors**
- ✅ Hash Sphere anchors display
- ✅ Anchor badges (clickable)
- ✅ @ mention autocomplete
- ✅ Resonance clusters visualization
- ✅ Memory library sidebar
- ✅ Save to memory button
- ✅ Memory search

#### 5. **Conversation Management**
- ✅ Conversation history
- ✅ Create new conversation
- ✅ Load conversation
- ✅ Rename conversation
- ✅ Delete conversation
- ✅ Auto-save (logged-in users)
- ✅ Session storage (guest users)

#### 6. **UI Customization**
- ✅ Compact mode
- ✅ Font size (small, medium, large, extra-large)
- ✅ Show/hide timestamps
- ✅ Show/hide provider badges
- ✅ Show/hide validity scores
- ✅ Split view (for code generation)
- ✅ Dark/light theme
- ✅ Sidebar toggle

#### 7. **Settings**
- ✅ Auto-save toggle
- ✅ Sound notifications
- ✅ Keyboard shortcuts toggle
- ✅ Focus highlights
- ✅ Input auto-resize
- ✅ Temperature control
- ✅ Max tokens control
- ✅ Model selection

#### 8. **Export & Share**
- ✅ Export as TXT
- ✅ Export as JSON
- ✅ Export as PDF (if implemented)
- ✅ Share conversation link
- ✅ Copy conversation

#### 9. **Project Building**
- ✅ Project request detection
- ✅ Project Builder UI
- ✅ File tree view
- ✅ Code preview
- ✅ Download as ZIP
- ✅ Download individual files
- ✅ Setup instructions

#### 10. **IDE Integration**
- ✅ IDE mode toggle
- ✅ File tree (Explorer)
- ✅ Monaco Editor
- ✅ Terminal (Execution Panel)
- ✅ Git Panel
- ✅ Chat Panel (integrated)
- ✅ Refactor dialog
- ✅ Code completion (LSP)
- ✅ Hover information (LSP)
- ✅ File operations (read, write, delete, create)

#### 11. **Real-time Features**
- ✅ WebSocket connection
- ✅ SSE fallback
- ✅ Streaming responses
- ✅ Live updates

#### 12. **Analytics & Metrics**
- ✅ Usage stats (messages, tokens)
- ✅ Resonance scores
- ✅ Evidence scores
- ✅ Provider performance
- ✅ Cost tracking

---

## 📡 API Endpoints Reference

### Resonant Chat Endpoints

#### `POST /resonant-chat/message`
**Purpose**: Send message and get AI response

**Request**:
```json
{
  "message": "What is Python?",
  "chatId": "conv-123",
  "context": {
    "previousMessages": [...],
    "userPreferences": {}
  },
  "attached_files": ["file1.txt"],
  "code_selection": {
    "file": "app.js",
    "lines": [10, 20],
    "code": "..."
  },
  "preferred_provider": "auto",
  "use_rag": false
}
```

**Response**:
```json
{
  "message": {
    "id": "msg-123",
    "role": "assistant",
    "content": "...",
    "timestamp": "2025-01-30T...",
    "xyz": [1.2, 3.4, 5.6]
  },
  "anchors": ["python", "programming"],
  "hash": "a3f9b2c1...",
  "resonanceScore": 0.92,
  "aiProvider": "openai",
  "memoryUpdated": true,
  "chatId": "conv-123"
}
```

#### `GET /resonant-chat/history`
**Purpose**: Get conversation history

#### `GET /resonant-chat/history/{chatId}`
**Purpose**: Get specific conversation

#### `POST /resonant-chat/create`
**Purpose**: Create new conversation

#### `GET /resonant-chat/anchors`
**Purpose**: Get memory anchors

#### `GET /resonant-chat/clusters`
**Purpose**: Get resonance clusters

### Code Endpoints

#### `POST /code/project/generate`
**Purpose**: Generate complete project

**Request**:
```json
{
  "description": "Build a todo app",
  "project_type": "react"
}
```

**Response**:
```json
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "...",
      "language": "tsx",
      "explanation": "..."
    }
  ],
  "setup_instructions": "...",
  "project_structure": {...}
}
```

#### `GET /code/project/files`
**Purpose**: List project files

#### `POST /code/project/file/read`
**Purpose**: Read file content

#### `POST /code/project/file/write`
**Purpose**: Write file content

#### `POST /code/project/file/delete`
**Purpose**: Delete file

#### `POST /code/project/upload`
**Purpose**: Upload ZIP project

### RAG Endpoints

#### `GET /rag/memories`
**Purpose**: List memories

#### `POST /rag/memories`
**Purpose**: Create memory

#### `GET /rag/conversations`
**Purpose**: List conversations

---

## 🧩 Component Structure

### Main Components

```
src/
├── pages/
│   └── ResonantChat/
│       ├── ResonantChatPage.tsx (Main component)
│       └── ResonantChatPage-2025.module.css
├── components/
│   ├── ResonantChat/
│   │   ├── EnhancedSidebar.tsx
│   │   └── ProjectBuilder.tsx
│   ├── IDE/
│   │   ├── IDELayout.tsx
│   │   ├── GitPanel.tsx
│   │   ├── ExecutionPanel.tsx
│   │   └── RefactorDialog.tsx
│   ├── HashSphere/
│   │   └── HashSphereIntegration.tsx
│   └── EvidenceGraph/
│       └── EvidenceGraphVisualization.tsx
└── api/
    ├── resonantChat.ts
    ├── code.ts
    ├── rag.ts
    └── fastapiClient.ts
```

### Component Hierarchy

```
ResonantChatPage
├── EnhancedSidebar
│   ├── ConversationsList
│   ├── MemoriesList
│   └── SettingsPanel
├── MainChatArea
│   ├── MessagesContainer
│   │   ├── MessageItem (for each message)
│   │   │   ├── MessageContent
│   │   │   ├── MessageActions (Copy, Regenerate, etc.)
│   │   │   ├── EvidenceGraphButton
│   │   │   └── HashSphereButton
│   │   └── WelcomePanel (if no messages)
│   └── InputContainer
│       ├── Textarea
│       ├── FileAttachment
│       ├── ProviderSelector
│       └── ActionButtons
├── IDELayout (conditional)
│   ├── ActivityBar
│   ├── Sidebar (Explorer/Search/Git/Settings)
│   ├── EditorArea
│   │   ├── EditorTabs
│   │   ├── MonacoEditor
│   │   └── ExecutionPanel
│   ├── GitPanel (conditional)
│   ├── ChatPanel (conditional)
│   ├── StatusBar
│   └── ChatInput (from ResonantChatPage)
├── ProjectBuilder (conditional)
│   ├── FileTree
│   ├── CodePreview
│   └── DownloadButtons
├── HashSphereIntegration (modal)
└── EvidenceGraphVisualization (modal)
```

---

## 🔄 State Management

### Global State (React useState)

**Message State**:
- `messages`: Array of all messages
- `isLoading`: Loading indicator
- `currentConversationId`: Active conversation ID

**UI State**:
- `sidebarOpen`: Sidebar visibility
- `showSettings`: Settings panel visibility
- `showMemoryLibrary`: Memory library visibility
- `splitViewEnabled`: Split view mode

**Project/IDE State**:
- `buildMode`: Build mode active
- `generatedProject`: Generated project data
- `ideMode`: IDE mode active
- `currentProjectId`: Active project ID

**Hash Sphere State**:
- `memoryAnchors`: List of anchors
- `resonanceClusters`: Clusters data
- `useHashSphere`: Hash Sphere enabled

**File State**:
- `attachedFiles`: Attached files
- `codeSelection`: Selected code

### Local Storage

**Settings** (persisted):
- `resonant-chat-auto-save`
- `resonant-chat-show-timestamps`
- `resonant-chat-compact-mode`
- `resonant-chat-font-size`
- `resonant-chat-split-view`
- `resonant-chat-split-width`

**Session Storage**:
- `resonant-chat-id`: Current conversation ID
- `guest-conversations`: Guest conversation history

### Backend State

**Database** (PostgreSQL):
- `Conversation`: Conversation records
- `Message`: Message records
- `Memory`: Memory records
- `CodeFile`: Indexed code files
- `CodeChunk`: Code chunks with hashes

**Hash Sphere Service**:
- Anchors stored in Hash Sphere
- Resonance scores calculated
- Clusters generated

---

## 🎓 Summary

### Key Connections

1. **Resonant Chat ↔ IDE Chat**: Shared message state, unified conversation
2. **Frontend ↔ Backend**: REST API calls, WebSocket/SSE for streaming
3. **Hash Sphere ↔ RAG**: Hybrid memory system, Hash Sphere primary, RAG fallback
4. **Project Builder ↔ IDE**: Generated projects can be opened in IDE
5. **Prompt Builder ↔ Multi-AI Router**: Context assembly → AI provider

### Data Flow Summary

```
User Input
  → Frontend Processing
  → API Call (sendResonantMessage)
  → Backend (Resonant Chat Router)
  → Prompt Builder (context assembly)
  → Multi-AI Router (provider selection)
  → AI Provider (response generation)
  → Response Processing (hashing, anchors)
  → Frontend (display + state update)
  → UI Update (both main chat and IDE chat)
```

### All Functionality

✅ **50+ Features** including:
- Message sending/receiving
- File attachments
- Code selection
- Project building
- IDE integration
- Memory management
- Hash Sphere visualization
- Evidence graphs
- Provider management
- Conversation management
- Export/share
- Settings customization
- Real-time streaming
- Analytics/metrics

---

**Status**: ✅ **FULLY DOCUMENTED**  
**Last Updated**: 2025-01-30

