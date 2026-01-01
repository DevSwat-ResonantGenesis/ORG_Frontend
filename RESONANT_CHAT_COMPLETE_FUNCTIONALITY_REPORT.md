# 📊 Resonant Chat: Complete Functionality Report

**Date:** 2025-01-30  
**Status:** ✅ Fully Operational  
**Version:** 2.0 - Complete Documentation

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Resonant Chat Page - Core Functionality](#resonant-chat-page---core-functionality)
3. [Docker Architecture & Deployment](#docker-architecture--deployment)
4. [Git Integration System](#git-integration-system)
5. [IDE (Integrated Development Environment)](#ide-integrated-development-environment)
6. [Project Building System](#project-building-system)
7. [Split View Window](#split-view-window)
8. [System Connections & Data Flow](#system-connections--data-flow)
9. [IDE Project Code Window](#ide-project-code-window)
10. [Complete Feature Matrix](#complete-feature-matrix)
11. [User Workflows](#user-workflows)

---

## 🎯 Executive Summary

**Resonant Chat** is a comprehensive AI-powered development platform that combines:
- **Chat Interface**: AI conversations with Hash Sphere memory
- **Project Building**: Generate complete code projects from descriptions
- **IDE**: Full-featured code editor (VS Code-like)
- **Git Integration**: Version control within IDE
- **Docker**: Containerized backend services
- **Split View**: Side-by-side chat and code viewing

**All systems are interconnected** and work together to provide a seamless development experience.

---

## 💬 Resonant Chat Page - Core Functionality

### Main Component
**File**: `src/pages/ResonantChat/ResonantChatPage.tsx` (3,768 lines)

### Core Features

#### 1. **Message System**
- **Send Messages**: Text input with auto-resize
- **Receive Responses**: AI-generated responses with streaming
- **Message History**: Persistent conversation storage
- **Message Actions**: Copy, Regenerate, Edit, Delete, Share
- **Message Types**: User, Assistant, System

#### 2. **File Attachments**
- **Supported Types**: Text files, code files, images
- **File Reading**: Automatic content extraction
- **File Upload**: Backend storage via `/rag/upload`
- **File Context**: Appended to messages automatically

#### 3. **Code Selection**
- **Select Code**: Highlight code in messages
- **Code Context**: Passed to backend for better responses
- **Code Display**: Syntax-highlighted code blocks

#### 4. **Memory & Anchors**
- **Hash Sphere Anchors**: Semantic memory anchors
- **@ Mentions**: Autocomplete for anchor mentions
- **Resonance Clusters**: Grouped related memories
- **Memory Library**: Browse and search memories

#### 5. **Provider Management**
- **Multi-Provider**: OpenAI, Anthropic, Groq, Gemini, Mistral, Cohere
- **Auto Selection**: Intelligent provider routing
- **Provider Stats**: Health, latency, cost tracking
- **Fallback**: Automatic failover on errors

#### 6. **Conversation Management**
- **Create Chat**: New conversation creation
- **Load Chat**: Load previous conversations
- **Rename Chat**: Custom conversation titles
- **Delete Chat**: Remove conversations
- **Auto-Save**: Automatic conversation persistence

#### 7. **UI Customization**
- **Compact Mode**: Dense message display
- **Font Sizes**: Small, Medium, Large, Extra-Large
- **Theme**: Light/Dark mode toggle
- **Timestamps**: Show/hide message timestamps
- **Provider Badges**: Show/hide AI provider badges
- **Validity Scores**: Show/hide quality scores

#### 8. **Split View** (See Section 7)
- **Toggle**: Enable/disable split view
- **Resizable**: Drag to adjust panel widths
- **Code View**: Side-by-side code display

#### 9. **Project Building** (See Section 6)
- **Auto-Detection**: Detects project requests
- **Project Builder**: Full project generation UI
- **File Tree**: Browse generated files
- **Download**: ZIP or individual files

#### 10. **IDE Integration** (See Section 5)
- **IDE Mode**: Toggle full IDE interface
- **Chat Integration**: Chat within IDE
- **Project Loading**: Load projects into IDE

---

## 🐳 Docker Architecture & Deployment

### Docker Compose Setup
**File**: `/Applications/ResonantGraphAIV0.1/docker-compose.yml`

### Services

#### 1. **API Service** (`api`)
- **Image**: `resonantgraphaiv01-api`
- **Port**: `8001` (mapped from 8000)
- **Dockerfile**: `backend/fastapi_app/Dockerfile`
- **Command**: `uvicorn fastapi_app.main:app --host 0.0.0.0 --port 8000`
- **Features**:
  - FastAPI application
  - Hash Sphere integration
  - RAG system
  - Code generation
  - Project building
  - Git operations
  - LSP (Language Server Protocol)
  - Authentication (JWT)
  - Database connection
  - **Docker Socket Mount**: `/var/run/docker.sock:/var/run/docker.sock:ro` (for code execution)

#### 2. **Database Service** (`db`)
- **Image**: `postgres:15-alpine`
- **Port**: `5433` (mapped from 5432)
- **Databases**:
  - `resonant`: Main application database
  - `ml_registry`: ML worker registry
- **Credentials**: `postgres/postgres`

#### 3. **ML Worker Service** (`ml-worker`)
- **Image**: `resonantgraphaiv01-ml-worker`
- **Port**: `9000`
- **Purpose**: Machine learning model serving

### Docker Features

#### Code Execution
- **Docker Socket Access**: API container has read-only access to Docker socket
- **Sandbox Execution**: Code runs in isolated Docker containers
- **Security**: Read-only socket prevents container creation from API
- **Languages**: Python, JavaScript, TypeScript, Java, C++, etc.

#### Container Management
```yaml
services:
  api:
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro  # Docker socket for code execution
    environment:
      - JWT_ACCESS_EXP_MINUTES=720  # 12-hour sessions
      - DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/resonant
```

### How Docker Works

1. **Code Execution Flow**:
   ```
   User clicks "Run" in IDE
   → Frontend calls /code/execute
   → Backend creates temporary Docker container
   → Code executes in sandbox
   → Results returned to frontend
   → Container destroyed
   ```

2. **Project Building**:
   ```
   User requests project
   → Backend generates files
   → Files stored in database
   → Project indexed for Hash Sphere
   → Available in IDE
   ```

3. **Git Operations**:
   ```
   User commits in IDE
   → Backend executes git commands
   → Changes tracked in project directory
   → Git history stored
   ```

---

## 🔀 Git Integration System

### Git Panel Component
**File**: `src/components/IDE/GitPanel.tsx`

### Features

#### 1. **Repository Management**
- **Initialize Repo**: `POST /code/git/init`
- **Status Check**: `POST /code/git/status`
- **Branch Management**: Create, switch, list branches
- **Commit History**: View commit log

#### 2. **File Operations**
- **Stage Files**: Stage all or selected files
- **Unstage Files**: Remove files from staging
- **View Changes**: See modified files
- **Diff View**: See file differences

#### 3. **Commit System**
- **Manual Commit**: Enter custom commit message
- **Auto-Generate Message**: AI-generated commit messages
- **Commit History**: Browse past commits
- **Commit Details**: View commit changes

#### 4. **Branch Operations**
- **Create Branch**: Create new branch
- **Switch Branch**: Change active branch
- **List Branches**: View all branches
- **Branch Status**: See current branch

### Git API Endpoints

#### `POST /code/git/init`
**Purpose**: Initialize Git repository in project

**Request**:
```json
{
  "project_id": "project-123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Repository initialized"
}
```

#### `POST /code/git/status`
**Purpose**: Get Git status (modified files, branch, etc.)

**Request**:
```json
{
  "project_id": "project-123"
}
```

**Response**:
```json
{
  "is_repo": true,
  "has_changes": true,
  "files": [
    {
      "file": "src/App.tsx",
      "status": "modified",
      "status_text": "M"
    }
  ],
  "branch": "main"
}
```

#### `POST /code/git/add`
**Purpose**: Stage files for commit

**Request**:
```json
{
  "project_id": "project-123",
  "files": ["src/App.tsx"]  // Optional: specific files, or empty for all
}
```

#### `POST /code/git/commit`
**Purpose**: Commit staged changes

**Request**:
```json
{
  "project_id": "project-123",
  "message": "Fix bug in App component",  // Optional if auto-generate enabled
  "auto_generate_message": true
}
```

#### `POST /code/git/branch`
**Purpose**: Create or switch branch

**Request**:
```json
{
  "project_id": "project-123",
  "action": "create",  // or "switch"
  "branch_name": "feature/new-feature"
}
```

#### `GET /code/git/branches`
**Purpose**: List all branches

**Response**:
```json
{
  "branches": ["main", "feature/new-feature", "develop"]
}
```

#### `GET /code/git/log`
**Purpose**: Get commit history

**Response**:
```json
{
  "commits": [
    {
      "hash": "abc123",
      "message": "Fix bug",
      "author": "user@example.com",
      "date": "2025-01-30T12:00:00Z"
    }
  ]
}
```

### Git Panel UI

**Location**: Right side of IDE (when Git button clicked)

**Sections**:
1. **Repository Status**
   - Initialize button (if not a repo)
   - Current branch display
   - Repository status

2. **Changes Section**
   - List of modified files
   - File status badges (M, A, D, etc.)
   - Stage All button

3. **Commit Section**
   - Auto-generate message checkbox
   - Commit message textarea
   - Commit button

4. **Commit History**
   - List of past commits
   - Commit hash, message, author, date
   - Click to view commit details

---

## 💻 IDE (Integrated Development Environment)

### IDE Layout Component
**File**: `src/components/IDE/IDELayout.tsx` (1,120 lines)

### Structure

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (35px)                                          │
│  [Project Info] [Refactor] [Run] [Git] [Upload] [Close]│
├──────┬──────────────────────────────────────────────────┤
│      │  EXPLORER / SEARCH / GIT / SETTINGS              │
│ACTIV │  ┌────────────────────────────────────────────┐  │
│ITY   │  │ File Tree                                  │  │
│BAR   │  │  📁 src/                                   │  │
│(48px)│  │    📄 App.tsx                               │  │
│      │  │    📄 index.ts                             │  │
│      │  └────────────────────────────────────────────┘  │
│      ├──────────────────────────────────────────────────┤
│      │  EDITOR AREA                                     │
│      │  ┌────────────────────────────────────────────┐ │
│      │  │ Tabs: [App.tsx ●] [index.ts]               │ │
│      │  ├────────────────────────────────────────────┤ │
│      │  │                                             │ │
│      │  │  Monaco Editor (Code)                       │ │
│      │  │                                             │ │
│      │  │                                             │ │
│      │  ├────────────────────────────────────────────┤ │
│      │  │ TERMINAL (Execution Panel)                 │ │
│      │  │ > npm start                                 │ │
│      │  │ Server running on port 3000                 │ │
│      │  └────────────────────────────────────────────┘ │
│      │                                                  │
│      │  [Git Panel] (Right side, when active)         │
│      │  [Chat Panel] (Right side, when active)        │
├──────┴──────────────────────────────────────────────────┤
│  STATUS BAR (22px)                                       │
│  [TypeScript] [Ln 10, Col 5] [● Unsaved] [Project ID]   │
├─────────────────────────────────────────────────────────┤
│  CHAT INPUT (Bottom)                                     │
│  [Type a goal. Hit @ to pull anchors inline.] [Send]    │
└─────────────────────────────────────────────────────────┘
```

### Components

#### 1. **Activity Bar** (Left - 48px width)
- **Explorer Icon**: File tree view
- **Search Icon**: File search
- **Git Icon**: Source control
- **Chat Icon**: Chat panel
- **Settings Icon**: IDE settings

#### 2. **Sidebar** (Resizable - 180px to 600px)
- **Explorer View**:
  - File tree with folders/files
  - New File button (+)
  - Refresh button
  - File search input
  - Upload Files/Folder buttons
  
- **Search View**:
  - File search input
  - Search results
  
- **Git View**:
  - Git status
  - Changes list
  - Commit controls
  
- **Settings View**:
  - Editor options
  - Keyboard shortcuts
  - Theme settings

#### 3. **Editor Area** (Center - Flexible)
- **Editor Tabs**:
  - Open file tabs
  - Active tab indicator
  - Unsaved indicator (●)
  - Close tab button (×)
  
- **Monaco Editor**:
  - Full-featured code editor
  - Syntax highlighting
  - Code completion (LSP)
  - Hover information (LSP)
  - Error detection
  - Multi-cursor editing
  - Find & Replace
  - Minimap
  - Line numbers
  - Word wrap
  
- **Execution Panel** (Terminal):
  - Code execution
  - Input field (stdin)
  - Output display
  - Error display
  - Execution time
  - Exit code
  - Clear button

#### 4. **Git Panel** (Right Side - When Active)
- **Width**: 320px (resizable)
- **Features**: See Git Integration section

#### 5. **Chat Panel** (Right Side - When Active)
- **Width**: 350px (resizable)
- **Features**:
  - Message history
  - User/Assistant messages
  - Timestamps
  - Auto-scroll
  - Loading indicator

#### 6. **Status Bar** (Bottom - 22px)
- **Left Side**:
  - File language (e.g., "TYPESCRIPT")
  - Cursor position (e.g., "Ln 10, Col 5")
  - Unsaved indicator ("● Unsaved")
  
- **Right Side**:
  - Project ID
  - Terminal toggle button

#### 7. **Header Toolbar** (Top - 35px)
- **Left**: Project info
- **Right**: Action buttons
  - **Refactor**: Advanced code refactoring
  - **Run**: Execute code (opens terminal)
  - **Git**: Toggle Git panel
  - **Upload**: Upload files/folders
  - **Folder**: Upload entire folder
  - **Close**: Close IDE

### IDE Features

#### File Operations
- **Create File**: New empty file
- **Read File**: Load file content
- **Write File**: Save file changes
- **Delete File**: Remove file
- **Upload Files**: Multiple file upload
- **Upload Folder**: Entire folder structure
- **File Tree**: Hierarchical file browser

#### Code Editing
- **Monaco Editor**: VS Code editor engine
- **Syntax Highlighting**: All major languages
- **Code Completion**: LSP-powered autocomplete
- **Hover Info**: LSP-powered documentation
- **Error Detection**: Real-time error highlighting
- **Multi-Cursor**: Multiple cursor editing
- **Find & Replace**: Advanced search
- **Formatting**: Code formatting
- **Folding**: Code block folding

#### Code Execution
- **Terminal**: Integrated execution panel
- **Language Support**: Python, JavaScript, TypeScript, etc.
- **Input Support**: stdin input
- **Output Display**: stdout/stderr
- **Error Handling**: Execution errors
- **Time Tracking**: Execution time
- **Exit Codes**: Program exit codes

#### Refactoring
- **Advanced Refactor Dialog**: Modal refactoring UI
- **Multi-File Refactoring**: Refactor across files
- **Diff Preview**: See changes before applying
- **Validation**: Check for issues
- **Dependency Analysis**: Track dependencies

#### Git Integration
- **Full Git Support**: All Git operations
- **Visual Status**: See changes visually
- **Branch Management**: Create/switch branches
- **Commit History**: Browse commits
- **Auto-Generate Messages**: AI commit messages

#### LSP (Language Server Protocol)
- **Code Completion**: Intelligent autocomplete
- **Hover Information**: Documentation on hover
- **Definition**: Go to definition
- **References**: Find all references
- **Error Detection**: Real-time errors

### IDE Keyboard Shortcuts

- **⌘/Ctrl + S**: Save file
- **⌘/Ctrl + W**: Close tab
- **⌘/Ctrl + P**: Search files
- **⌘/Ctrl + Enter**: Run code
- **⌘/Ctrl + Shift + R**: Refactor
- **⌘/Ctrl + Shift + G**: Git panel
- **⌘/Ctrl + Shift + E**: Explorer
- **⌘/Ctrl + Shift + F**: Search

---

## 🏗️ Project Building System

### Project Builder Component
**File**: `src/components/ResonantChat/ProjectBuilder.tsx`

### How It Works

#### 1. **Project Detection**
**Function**: `detectProjectRequest(message: string)`

**Triggers**:
- Action words: "build", "create", "generate", "make"
- Project keywords: "project", "app", "application", "website"
- Project types: "react", "python", "node", "vue", "angular"

**Example Messages**:
- "Build a React todo app"
- "Create a Python Flask API"
- "Make a landing page"

#### 2. **Project Generation Flow**

```
User: "Build a React todo app"
  ↓
Frontend: detectProjectRequest() → { isProject: true, projectType: "react" }
  ↓
Frontend: setGeneratedProject({ description, projectType })
  ↓
ProjectBuilder: Auto-generates on mount
  ↓
API Call: POST /code/project/generate
  {
    description: "Build a React todo app",
    project_type: "react"
  }
  ↓
Backend: Prompt Builder Service
  - Searches Hash Sphere for similar projects
  - Infers project structure
  - Generates files one by one
  - Indexes files immediately
  - Creates Hash Sphere anchors
  ↓
Response: {
  files: [
    { path: "src/App.tsx", content: "...", language: "tsx" },
    { path: "package.json", content: "...", language: "json" },
    ...
  ],
  setup_instructions: "npm install && npm start",
  project_structure: {...}
}
  ↓
Frontend: ProjectBuilder displays files
  - File tree view
  - Code preview
  - Download options
```

#### 3. **Project Builder UI**

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  HEADER                                                  │
│  [← Back] Generated Project (5 files) [Download ZIP] [×] │
├──────────────┬──────────────────────────────────────────┤
│ FILE TREE    │ CODE PREVIEW                              │
│              │                                            │
│ 📁 src/      │ src/App.tsx                               │
│   📄 App.tsx │                                            │
│   📄 index.ts│ import React from 'react';                │
│ 📁 public/   │                                            │
│   📄 index.html│ function App() {                        │
│ 📄 package.json│   return (                             │
│              │     <div>Todo App</div>                  │
│              │   );                                      │
│              │ }                                         │
│              │                                            │
│              │ [Download File]                           │
├──────────────┴──────────────────────────────────────────┤
│ SETUP INSTRUCTIONS                                       │
│ npm install && npm start                                 │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- **File Tree**: Browse all generated files
- **Code Preview**: Syntax-highlighted code
- **File Explanation**: Purpose of each file
- **Download All**: ZIP file with all files
- **Download File**: Individual file download
- **Setup Instructions**: How to run the project

#### 4. **Backend Project Generation**

**Endpoint**: `POST /code/project/generate`

**Process**:
1. **Hash Sphere Search**: Find similar projects
2. **Structure Inference**: Determine file structure
3. **File Generation**: Generate files one by one
4. **Context Building**: Use related files for context
5. **Indexing**: Index files immediately
6. **Anchor Creation**: Create Hash Sphere anchors

**Response**:
```json
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "import React...",
      "language": "tsx",
      "explanation": "Main React component"
    }
  ],
  "setup_instructions": "npm install && npm start",
  "project_structure": {
    "type": "react",
    "files": [...]
  }
}
```

---

## 🔀 Split View Window

### What Is Split View?

**Split View** is a feature that divides the chat interface into two panels:
- **Left Panel**: Chat messages (40% width, resizable)
- **Right Panel**: Code view (60% width, resizable)

### How It Works

#### 1. **Activation**
- **Toggle Button**: Click split view icon in input toolbar
- **Auto-Activation**: Can be enabled automatically for code messages
- **Persistence**: Setting saved in localStorage

#### 2. **Layout**

```
┌─────────────────────────────────────────────────────────┐
│  CHAT MESSAGES PANEL (40%)    │  CODE VIEW PANEL (60%)  │
│                              │                          │
│  User: "Build a todo app"    │  Code View               │
│                              │  ┌────────────────────┐  │
│  Assistant: "Here's the..."  │  │ function App() {  │  │
│                              │  │   return (        │  │
│  [Click message with code]   │  │     <div>...</div>│  │
│                              │  │   );              │  │
│                              │  │ }                 │  │
│                              │  │                   │  │
│                              │  │ [Copy Code]       │  │
│                              │  └────────────────────┘  │
│                              │                          │
│  [Resize Handle] ←───────────┼──────────────────────────│
└─────────────────────────────────────────────────────────┘
```

#### 3. **Features**

**Left Panel (Chat)**:
- Full message history
- Click message with code → shows in right panel
- Selected message highlighted
- Usage tracking bar
- All normal chat features

**Right Panel (Code View)**:
- Extracts code blocks from selected message
- Syntax highlighting
- Language detection
- Copy code button
- Multiple code blocks support
- Empty state when no code selected

**Resize Handle**:
- Drag to adjust panel widths
- Constrained: 20% to 80% per panel
- Visual feedback on hover
- Smooth resizing

#### 4. **Code Detection**

**Automatic Detection**:
- Messages with code blocks (```) are clickable
- Clicking message selects it for code view
- Multiple code blocks shown sequentially

**Code Block Extraction**:
```typescript
const codeBlocks = message.content.match(/```(\w+)?\n([\s\S]*?)```/g);
// Extracts: language, code content
```

#### 5. **State Management**

**State Variables**:
```typescript
const [splitViewEnabled, setSplitViewEnabled] = useState(false);
const [splitViewWidth, setSplitViewWidth] = useState(40); // Percentage
const [selectedCodeMessage, setSelectedCodeMessage] = useState<string | null>(null);
const [isResizing, setIsResizing] = useState(false);
```

**Persistence**:
- Settings saved to localStorage
- Restored on page load
- User preference remembered

#### 6. **Mobile Support**

**Touch-Friendly**:
- Horizontal swipe between panels
- Each panel takes full width
- Scroll-snap for smooth navigation
- Touch gestures for resizing

---

## 🔗 System Connections & Data Flow

### Complete System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RESONANT CHAT PAGE                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Chat UI    │  │ Project      │  │    IDE       │     │
│  │              │  │ Builder      │  │              │     │
│  │ - Messages   │  │ - File Tree  │  │ - Editor     │     │
│  │ - Input      │  │ - Preview    │  │ - Terminal   │     │
│  │ - Split View │  │ - Download   │  │ - Git Panel  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                        │                                      │
│                        ▼                                      │
│              ┌─────────────────┐                            │
│              │  FastAPI Client  │                            │
│              │  (withCredentials)│                            │
│              └────────┬──────────┘                            │
└───────────────────────┼───────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER BACKEND                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  API Service │  │   Database   │  │  ML Worker   │     │
│  │  (Port 8001) │  │  (Port 5433) │  │  (Port 9000) │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                        │                                      │
│         ┌──────────────┼──────────────┐                    │
│         │              │              │                     │
│         ▼              ▼              ▼                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ Resonant │  │   Code   │  │   Git    │                │
│  │   Chat   │  │  Router  │  │  Router  │                │
│  │  Router  │  │          │  │          │                │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                │
│       │             │             │                        │
│       ▼             ▼             ▼                        │
│  ┌─────────────────────────────────────┐                  │
│  │      Prompt Builder Service         │                  │
│  │  - RAG Memories (45%)               │                  │
│  │  - Hash Sphere Anchors (35%)        │                  │
│  │  - Conversation History (20%)      │                  │
│  └──────────────┬──────────────────────┘                  │
│                 │                                         │
│                 ▼                                         │
│  ┌─────────────────────────────────────┐                  │
│  │      Multi-AI Router                │                  │
│  │  - OpenAI, Anthropic, Groq, etc.    │                  │
│  └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Connection Details

#### 1. **Chat → Backend**
- **API**: `POST /resonant-chat/message`
- **Authentication**: HttpOnly cookies (JWT)
- **Headers**: `RG-Role`, `RG-Org-ID`
- **Response**: Message + anchors + hash + resonance score

#### 2. **Project Builder → Backend**
- **API**: `POST /code/project/generate`
- **Authentication**: Required (JWT)
- **Process**: Hash Sphere search → File generation → Indexing
- **Response**: Files array + setup instructions

#### 3. **IDE → Backend**
- **File Operations**: `POST /code/project/file/*`
- **Git Operations**: `POST /code/git/*`
- **Code Execution**: `POST /code/execute`
- **LSP**: `POST /code/lsp/*`
- **Project Upload**: `POST /code/project/upload`

#### 4. **IDE Chat → Main Chat**
- **Shared State**: `messages` array
- **Shared Function**: `handleSend()`
- **Unified Flow**: Same API calls, same responses

#### 5. **Project Builder → IDE**
- **After Generation**: Project files available in IDE
- **Project ID**: Generated project has ID
- **File Loading**: IDE can load project files

#### 6. **Git → IDE**
- **Project-Based**: Git operations require project ID
- **File Tracking**: Tracks IDE file changes
- **Commit Integration**: Commits from IDE

#### 7. **Split View → Chat**
- **Message Selection**: Click message to view code
- **Code Extraction**: Extracts code blocks from messages
- **Synchronized**: Updates when messages change

---

## 💻 IDE Project Code Window

### What Is the IDE Project Code Window?

The **IDE Project Code Window** is the main editor area in the IDE where code files are displayed and edited.

### Structure

```
┌─────────────────────────────────────────────────────────┐
│  EDITOR TABS                                            │
│  [App.tsx ●] [index.ts] [styles.css]                    │
├─────────────────────────────────────────────────────────┤
│  EDITOR TOOLBAR                                         │
│  [Save] [Delete]                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MONACO EDITOR (Code Window)                            │
│  ┌─────────────────────────────────────────────────┐  │
│  │ 1  import React from 'react';                   │  │
│  │ 2                                               │  │
│  │ 3  function App() {                             │  │
│  │ 4    return (                                   │  │
│  │ 5      <div>Hello World</div>                  │  │
│  │ 6    );                                         │  │
│  │ 7  }                                            │  │
│  │ 8                                               │  │
│  │ 9  export default App;                         │  │
│  │                                                 │  │
│  │ [Minimap]                                       │  │
│  └─────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  TERMINAL (Execution Panel)                             │
│  > npm start                                            │
│  Server running on http://localhost:3000                │
└─────────────────────────────────────────────────────────┘
```

### Features

#### 1. **Editor Tabs**
- **Multiple Files**: Open multiple files simultaneously
- **Active Tab**: Highlighted active file
- **Unsaved Indicator**: ● shows unsaved changes
- **Close Tab**: × button to close file
- **Tab Switching**: Click tab to switch files

#### 2. **Monaco Editor**
- **Full VS Code Engine**: Same editor as VS Code
- **Syntax Highlighting**: All languages supported
- **Code Completion**: LSP-powered autocomplete
- **Hover Information**: Documentation on hover
- **Error Detection**: Real-time error highlighting
- **Multi-Cursor**: Multiple cursor editing
- **Find & Replace**: Advanced search (⌘/Ctrl+F)
- **Go to Line**: Jump to line number (⌘/Ctrl+G)
- **Minimap**: Code overview on right
- **Line Numbers**: Line number display
- **Word Wrap**: Automatic line wrapping
- **Folding**: Code block folding
- **Formatting**: Code formatting
- **Transparent Background**: Matches IDE theme

#### 3. **Editor Toolbar**
- **Save Button**: Save current file (⌘/Ctrl+S)
- **Delete Button**: Delete current file
- **Disabled States**: Buttons disabled when appropriate

#### 4. **Terminal (Execution Panel)**
- **Code Execution**: Run code in sandbox
- **Input Field**: Provide stdin input
- **Output Display**: Show stdout
- **Error Display**: Show stderr
- **Execution Time**: Time taken
- **Exit Code**: Program exit code
- **Clear Button**: Clear terminal
- **Run Button**: Execute code (▶ Run)

#### 5. **File Operations**
- **Create File**: New empty file
- **Read File**: Load file from backend
- **Write File**: Save file to backend
- **Delete File**: Remove file
- **Upload Files**: Multiple file upload
- **Upload Folder**: Entire folder structure

#### 6. **LSP Integration**
- **Code Completion**: Intelligent autocomplete
- **Hover Info**: Documentation on hover
- **Go to Definition**: Jump to definition
- **Find References**: Find all usages
- **Error Detection**: Real-time errors

### Code Window Features

#### Editing Features
- **Multi-Cursor**: Multiple cursors for batch editing
- **Column Selection**: Select columns
- **Find & Replace**: Search and replace
- **Go to Symbol**: Jump to functions/classes
- **Bracket Matching**: Highlight matching brackets
- **Auto-Indent**: Automatic indentation
- **Code Folding**: Collapse code blocks

#### Language Support
- **TypeScript/JavaScript**: Full support
- **Python**: Full support
- **Java**: Full support
- **C/C++**: Full support
- **Go**: Full support
- **Rust**: Full support
- **HTML/CSS**: Full support
- **JSON**: Full support
- **Markdown**: Full support
- **And 100+ more languages**

#### Editor Options
- **Font Size**: Adjustable (default: 14px)
- **Tab Size**: Configurable (default: 2 spaces)
- **Word Wrap**: On/Off
- **Minimap**: On/Off
- **Line Numbers**: On/Off
- **Render Whitespace**: Show spaces/tabs
- **Auto-Save**: Automatic saving (optional)

---

## 📊 Complete Feature Matrix

### Resonant Chat Page Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Message Sending** | ✅ | Text input, file attachments, code selection |
| **Message Display** | ✅ | Markdown, syntax highlighting, copy, regenerate |
| **Provider Management** | ✅ | Multi-provider, auto-selection, health checks |
| **Memory & Anchors** | ✅ | Hash Sphere anchors, @ mentions, clusters |
| **Conversation Management** | ✅ | Create, load, rename, delete, auto-save |
| **UI Customization** | ✅ | Compact mode, font sizes, theme, timestamps |
| **Split View** | ✅ | Side-by-side chat and code view |
| **Project Building** | ✅ | Auto-detect, generate, download projects |
| **IDE Integration** | ✅ | Full IDE with editor, terminal, Git |
| **Export & Share** | ✅ | Export as TXT, JSON, PDF, share links |
| **Settings** | ✅ | Auto-save, notifications, shortcuts |
| **Real-time** | ✅ | WebSocket/SSE streaming |
| **Analytics** | ✅ | Usage stats, metrics, costs |

### Docker Features

| Feature | Status | Description |
|---------|--------|-------------|
| **API Container** | ✅ | FastAPI backend (port 8001) |
| **Database Container** | ✅ | PostgreSQL (port 5433) |
| **ML Worker Container** | ✅ | ML model serving (port 9000) |
| **Docker Socket** | ✅ | Code execution in sandbox |
| **Health Checks** | ✅ | Container health monitoring |
| **Auto-Restart** | ✅ | Container auto-restart on failure |
| **Volume Mounts** | ✅ | Persistent data storage |
| **Network** | ✅ | Internal Docker network |

### Git Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Init Repository** | ✅ | Initialize Git repo |
| **Status Check** | ✅ | View modified files |
| **Stage Files** | ✅ | Add files to staging |
| **Commit Changes** | ✅ | Commit with message |
| **Branch Management** | ✅ | Create, switch, list branches |
| **Commit History** | ✅ | View commit log |
| **Auto-Generate Messages** | ✅ | AI-generated commit messages |
| **Visual Status** | ✅ | See changes visually |

### IDE Features

| Feature | Status | Description |
|---------|--------|-------------|
| **File Tree** | ✅ | Hierarchical file browser |
| **Monaco Editor** | ✅ | VS Code editor engine |
| **Code Completion** | ✅ | LSP-powered autocomplete |
| **Hover Info** | ✅ | LSP-powered documentation |
| **Error Detection** | ✅ | Real-time error highlighting |
| **Terminal** | ✅ | Code execution panel |
| **Git Panel** | ✅ | Git integration UI |
| **Chat Panel** | ✅ | Chat within IDE |
| **Refactoring** | ✅ | Advanced code refactoring |
| **File Operations** | ✅ | Create, read, write, delete |
| **Upload Files** | ✅ | Multiple files/folders |
| **Keyboard Shortcuts** | ✅ | VS Code-like shortcuts |
| **Resizable Panels** | ✅ | Drag to resize |

### Project Building Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Auto-Detection** | ✅ | Detects project requests |
| **Multi-File Generation** | ✅ | Generates complete projects |
| **Hash Sphere Integration** | ✅ | Uses similar projects |
| **File Tree View** | ✅ | Browse generated files |
| **Code Preview** | ✅ | Syntax-highlighted preview |
| **Download ZIP** | ✅ | Download all files |
| **Download Individual** | ✅ | Download single files |
| **Setup Instructions** | ✅ | How to run project |
| **Project Type Detection** | ✅ | React, Python, Node, etc. |

### Split View Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Toggle** | ✅ | Enable/disable split view |
| **Resizable Panels** | ✅ | Drag to adjust widths |
| **Code Extraction** | ✅ | Extracts code from messages |
| **Syntax Highlighting** | ✅ | Code highlighting |
| **Copy Code** | ✅ | Copy code blocks |
| **Multiple Blocks** | ✅ | Shows all code blocks |
| **Message Selection** | ✅ | Click message to view code |
| **Persistence** | ✅ | Settings saved |

---

## 🔄 User Workflows

### Workflow 1: Chat → Project Building → IDE

```
1. User: "Build a React todo app"
   ↓
2. System detects project request
   ↓
3. Project Builder opens
   ↓
4. Backend generates files
   ↓
5. User downloads project or opens in IDE
   ↓
6. IDE loads project files
   ↓
7. User edits code in IDE
   ↓
8. User runs code in terminal
   ↓
9. User commits changes via Git panel
```

### Workflow 2: IDE → Chat → Code Execution

```
1. User opens IDE
   ↓
2. User uploads project files
   ↓
3. User opens file in editor
   ↓
4. User types in IDE chat: "Add a button"
   ↓
5. AI generates code
   ↓
6. User copies code to editor
   ↓
7. User runs code in terminal
   ↓
8. User sees output
   ↓
9. User saves and commits
```

### Workflow 3: Split View → Code Review

```
1. User enables split view
   ↓
2. User asks: "Show me a React component"
   ↓
3. AI responds with code
   ↓
4. User clicks message
   ↓
5. Code appears in right panel
   ↓
6. User reviews code
   ↓
7. User copies code
   ↓
8. User pastes in IDE
```

### Workflow 4: Git → Commit → History

```
1. User makes changes in IDE
   ↓
2. User opens Git panel
   ↓
3. System shows modified files
   ↓
4. User stages files
   ↓
5. User commits (auto-generate message)
   ↓
6. System creates commit
   ↓
7. User views commit history
   ↓
8. User switches branch
```

---

## 🔗 Complete Connection Map

### Frontend Connections

```
ResonantChatPage.tsx
├── EnhancedSidebar.tsx
│   ├── Conversations
│   ├── Memories
│   └── Settings
├── IDELayout.tsx (when ideMode = true)
│   ├── File Tree (Explorer)
│   ├── Monaco Editor
│   ├── ExecutionPanel.tsx (Terminal)
│   ├── GitPanel.tsx
│   ├── Chat Panel (shows messages from ResonantChatPage)
│   └── RefactorDialog.tsx
├── ProjectBuilder.tsx (when generatedProject exists)
│   ├── File Tree
│   ├── Code Preview
│   └── Download Buttons
├── HashSphereIntegration.tsx (3D visualization)
├── EvidenceGraphVisualization.tsx (graph visualization)
└── Split View (when splitViewEnabled = true)
    ├── Chat Messages Panel
    └── Code View Panel
```

### Backend Connections

```
FastAPI Backend (Docker)
├── /resonant-chat/message
│   ├── Prompt Builder Service
│   ├── Hash Sphere Service
│   ├── RAG Service
│   └── Multi-AI Router
├── /code/project/generate
│   ├── Hash Sphere Search
│   ├── Code Generation
│   └── File Indexing
├── /code/project/file/*
│   ├── File Operations
│   └── Project Management
├── /code/git/*
│   ├── Git Operations
│   └── Repository Management
├── /code/execute
│   └── Docker Sandbox Execution
└── /code/lsp/*
    └── Language Server Protocol
```

### Data Flow Connections

```
User Input
  ↓
ResonantChatPage.handleSend()
  ↓
sendResonantMessage() API
  ↓
Backend: Prompt Builder
  ↓
Backend: Multi-AI Router
  ↓
AI Provider (OpenAI, etc.)
  ↓
Backend: Hash Sphere Processing
  ↓
Response with anchors/hash
  ↓
Frontend: Update messages state
  ↓
Both IDE Chat Panel AND Main Chat display
  ↓
If project request → Project Builder
  ↓
If IDE mode → IDE Layout
```

---

## 📝 Summary

### All Systems Are Connected

1. **Resonant Chat** ↔ **IDE**: Shared message state, unified conversation
2. **Project Builder** ↔ **IDE**: Generated projects loadable in IDE
3. **IDE** ↔ **Git**: Git operations on IDE files
4. **IDE** ↔ **Terminal**: Code execution from IDE
5. **Split View** ↔ **Chat**: Code extraction from messages
6. **Docker** ↔ **All**: Backend services containerized
7. **Hash Sphere** ↔ **All**: Memory system for all features

### Key Features

✅ **50+ Features** across all systems
✅ **Full Integration** between all components
✅ **VS Code-like IDE** with all functionality
✅ **Docker-based** backend with sandbox execution
✅ **Git Integration** for version control
✅ **Project Building** with Hash Sphere memory
✅ **Split View** for code review
✅ **Real-time** streaming and updates

---

**Status**: ✅ **FULLY DOCUMENTED**  
**Last Updated**: 2025-01-30

