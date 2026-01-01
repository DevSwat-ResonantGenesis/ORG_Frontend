# 🔬 Resonant Chat Coding Functionality - Complete Investigation

## Executive Summary

This document provides a complete investigation of how coding functionality works in Resonant Chat, including architecture, data flow, API endpoints, and integration points.

---

## 📐 Architecture Overview

### Frontend Components

```
ResonantChatPage.tsx
├── File Attachment System
│   ├── attachedFiles (state)
│   ├── uploadedFileIds (Map<File, string>)
│   ├── handleFileUpload()
│   └── handleRemoveFile()
│
├── Code Selection System
│   ├── codeSelection (state)
│   └── { file, lines, code }
│
├── Message Sending
│   ├── File context preparation
│   ├── Code selection inclusion
│   └── API request assembly
│
└── Code Features Integration
    ├── Project building detection
    ├── IDE mode activation
    └── Code API calls
```

### Backend Architecture

```
Backend Services
├── /resonant-chat/message (Main Chat)
│   ├── Receives: attached_files, code_selection
│   ├── Processes with Hash Sphere
│   └── Returns: response with code context
│
├── /code/* (Code-Specific APIs)
│   ├── /code/generate
│   ├── /code/refactor
│   ├── /code/complete
│   ├── /code/index
│   ├── /code/search
│   ├── /code/execute
│   └── /code/project/generate
│
└── /rag/files/upload (File Storage)
    ├── Stores files
    └── Returns file IDs
```

---

## 🔄 Complete Data Flow

### Flow 1: File Attachment → Message Send

```
1. User clicks file button
   ↓
2. File picker opens
   ↓
3. User selects file(s)
   ↓
4. handleFileUpload() called
   ├── Validates file type
   ├── Reads file content (if text/code)
   ├── Adds to attachedFiles state
   └── If logged in: uploads to backend
       ├── POST /rag/files/upload
       ├── Receives file ID
       └── Stores in uploadedFileIds map
   ↓
5. User types message
   ↓
6. User clicks Send
   ↓
7. handleSend() called
   ├── Reads file contents
   ├── Appends to message: "[File: name]\ncontent"
   ├── Extracts file paths/IDs
   └── Includes in request:
       {
         message: "query + file content",
         attached_files: ["file_id_1", "file_id_2"]
       }
   ↓
8. POST /resonant-chat/message
   ├── Backend receives files
   ├── Processes with Hash Sphere
   ├── Uses file context in prompt
   └── Returns response
   ↓
9. Response displayed
   └── File context used in answer
```

### Flow 2: Code Selection → Message Send

```
1. Code selection set (programmatically or via UI)
   ↓
2. codeSelection state updated:
   {
     file: "src/utils.js",
     lines: [10, 20],
     code: "selected code snippet"
   }
   ↓
3. User sends message
   ↓
4. handleSend() includes code_selection:
   {
     message: "Refactor this",
     code_selection: {
       file: "src/utils.js",
       lines: [10, 20],
       code: "..."
     }
   }
   ↓
5. POST /resonant-chat/message
   ├── Backend receives code_selection
   ├── Uses for context
   └── May create Hash Sphere anchor
   ↓
6. Response uses code context
   ↓
7. codeSelection cleared after send
```

### Flow 3: Code Generation Request

```
1. User requests: "Generate a function that..."
   ↓
2. Frontend detects code generation intent
   OR
   Direct API call: POST /code/generate
   ↓
3. Request:
   {
     description: "Generate a function...",
     language: "python",
     file_path: "utils.py",  // optional
     context_files: ["helper.py"]  // optional
   }
   ↓
4. Backend Processing:
   ├── Gets file context (if file_path provided)
   ├── Gets related files context
   ├── Searches Hash Sphere for similar patterns
   ├── Builds prompt with context
   ├── Calls AI router
   └── Generates code
   ↓
5. Response:
   {
     code: "def function(): ...",
     explanation: "...",
     tests: "def test_function(): ..."
   }
   ↓
6. Code displayed to user
   └── Can be copied/saved
```

### Flow 4: Code Refactoring Request

```
1. User attaches code file
   OR
   Provides code selection
   ↓
2. User sends: "Refactor this to use async/await"
   ↓
3. Frontend sends to /code/refactor:
   {
     file_path: "src/utils.js",
     code: "original code",
     refactor_request: "Convert to async/await",
     language: "javascript"
   }
   ↓
4. Backend Processing:
   ├── Parses code (AST if available)
   ├── Searches for similar refactored patterns
   ├── Uses Hash Sphere memory
   ├── Generates refactored code
   ├── Creates diff
   ├── Runs safety checks
   └── Returns result
   ↓
5. Response:
   {
     original_code: "...",
     refactored_code: "...",
     diff: "--- ... +++ ...",
     explanation: "...",
     safety_checks: {
       breaking_changes: false,
       warnings: [...]
     }
   }
   ↓
6. User sees:
   ├── Original code
   ├── Refactored code
   ├── Diff visualization
   └── Safety warnings (if any)
```

---

## 🛠️ API Endpoints Deep Dive

### 1. File Upload: `POST /rag/files/upload`

**Purpose:** Store files in backend for later reference

**Request:**
```http
POST /rag/files/upload
Content-Type: multipart/form-data

file: [binary file data]
```

**Response:**
```json
{
  "id": "file-uuid-123",
  "url": "/files/file-uuid-123",
  "content": "file content (if text)"
}
```

**Frontend Usage:**
- Called automatically when logged-in user attaches file
- File ID stored in `uploadedFileIds` Map
- File ID used in `attached_files` array when sending message

**Backend Processing:**
- Stores file in database/storage
- Returns file ID for reference
- Content extracted if text file

---

### 2. Chat Message with Code: `POST /resonant-chat/message`

**Purpose:** Send message with file/code context

**Request:**
```json
{
  "message": "Review this code",
  "chatId": "chat-123",
  "attached_files": ["file-id-1", "file-id-2"],
  "code_selection": {
    "file": "src/utils.js",
    "lines": [10, 20],
    "code": "const helper = () => { ... }"
  },
  "context": {
    "previousMessages": [...],
    "userPreferences": {}
  },
  "preferred_provider": "auto",
  "use_rag": false
}
```

**Backend Processing:**
1. Receives message + code context
2. If `attached_files` provided:
   - Loads file content from storage
   - Includes in context
3. If `code_selection` provided:
   - Uses selected code as primary context
   - May create Hash Sphere anchor
4. Builds prompt with:
   - User message
   - File contents
   - Code selection
   - Conversation history
   - Hash Sphere anchors
   - RAG memories
5. Sends to AI provider
6. Returns response with code context

**Response:**
```json
{
  "message": {
    "content": "Here's my review of your code...",
    "role": "assistant"
  },
  "anchors": ["code-pattern-1", "code-pattern-2"],
  "hash": "resonance-hash-123",
  "resonanceScore": 0.85,
  "aiProvider": "groq",
  "memoryUpdated": true,
  "chatId": "chat-123"
}
```

---

### 3. Code Generation: `POST /code/generate`

**Purpose:** Generate code from natural language

**Request:**
```json
{
  "description": "Create a function that validates email addresses",
  "language": "python",
  "file_path": "utils.py",  // optional
  "context_files": ["helpers.py"]  // optional
}
```

**Backend Processing:**
1. If `file_path` provided:
   - Gets file context using `CodeContextService`
   - Extracts functions, classes, imports
2. If `context_files` provided:
   - Gets context from each file
   - Builds related context
3. Searches Hash Sphere for similar code patterns
4. Builds generation prompt:
   ```
   Generate python code for: [description]
   
   Context from utils.py:
   [existing code structure]
   
   Related files:
   [related code]
   
   Similar patterns:
   [Hash Sphere matches]
   ```
5. Calls AI router (prefers OpenAI for code)
6. Parses response for code blocks
7. Generates tests if applicable
8. Returns structured response

**Response:**
```json
{
  "code": "def validate_email(email: str) -> bool:\n    ...",
  "explanation": "This function uses regex to validate...",
  "tests": "def test_validate_email():\n    ..."
}
```

---

### 4. Code Refactoring: `POST /code/refactor`

**Purpose:** Refactor existing code

**Request:**
```json
{
  "file_path": "src/utils.js",
  "code": "function oldCode() { return x + y; }",
  "refactor_request": "Convert to arrow function",
  "language": "javascript"
}
```

**Backend Processing:**
1. Parses code (AST if language supported)
2. Searches for similar refactored patterns in Hash Sphere
3. Builds refactoring prompt:
   ```
   Refactor this javascript code:
   ```javascript
   [original code]
   ```
   
   Request: [refactor_request]
   
   Similar patterns:
   [Hash Sphere matches]
   ```
4. Calls AI router
5. Generates refactored code
6. Creates diff using `difflib`
7. Runs safety checks:
   - Syntax validation
   - Breaking change detection
   - Type compatibility
8. Returns result

**Response:**
```json
{
  "original_code": "function oldCode() { ... }",
  "refactored_code": "const oldCode = () => { ... }",
  "diff": "--- a/src/utils.js\n+++ b/src/utils.js\n...",
  "explanation": "Converted function declaration to arrow function...",
  "safety_checks": {
    "syntax_valid": true,
    "breaking_changes": false,
    "warnings": []
  }
}
```

---

### 5. Code Completion: `POST /code/complete`

**Purpose:** Provide code completion suggestions

**Request:**
```json
{
  "file_path": "src/utils.js",
  "prefix": "const total = ",
  "cursor_position": {"line": 10, "column": 15},
  "language": "javascript"
}
```

**Backend Processing:**
1. Gets file context around cursor
2. Gets related files
3. Searches codebase for similar patterns:
   ```python
   similar_patterns = code_context_service.search_codebase(
       query=request.prefix,
       language=request.language,
       limit=5
   )
   ```
4. Gets code memories from Hash Sphere
5. Builds completion context
6. Calls AI router (prefers OpenAI)
7. Parses completions
8. Returns ranked suggestions

**Response:**
```json
{
  "completions": [
    {"text": "const total = sum", "score": 0.95},
    {"text": "const total = calculateTotal", "score": 0.88},
    {"text": "const total = getTotal", "score": 0.82}
  ],
  "from_memory": true
}
```

---

### 6. Code Indexing: `POST /code/index`

**Purpose:** Index code files for search

**Request:**
```json
{
  "files": [
    {
      "path": "src/utils.js",
      "content": "function helper() { ... }",
      "language": "javascript"
    }
  ]
}
```

**Backend Processing:**
1. For each file:
   - Parses code (AST if supported)
   - Extracts functions, classes, variables
   - Creates embeddings
   - Stores in code index
   - Creates Hash Sphere anchors
2. Returns indexing results

**Response:**
```json
{
  "indexed": 5,
  "updated": 2,
  "errors": 0
}
```

---

### 7. Code Execution: `POST /code/execute`

**Purpose:** Execute code in sandbox (requires Docker)

**Request:**
```json
{
  "code": "print('Hello, World!')",
  "language": "python",
  "timeout": 5
}
```

**Backend Processing:**
1. Creates Docker container for language
2. Writes code to file in container
3. Executes code
4. Captures output/errors
5. Cleans up container
6. Returns result

**Response:**
```json
{
  "output": "Hello, World!\n",
  "error": null,
  "execution_time": 0.1
}
```

**Note:** Requires Docker socket access, may not be available in all environments.

---

### 8. Project Generation: `POST /code/project/generate`

**Purpose:** Generate complete multi-file projects

**Request:**
```json
{
  "description": "A React todo app with TypeScript",
  "project_type": "react",
  "files": null,  // optional file specs
  "context": null  // optional existing project
}
```

**Backend Processing:**
1. Detects project type
2. Generates project structure:
   - Entry files
   - Configuration files
   - Component files
   - Test files
   - Documentation
3. For each file:
   - Generates code
   - Ensures consistency
   - Adds imports/dependencies
4. Creates Hash Sphere anchors for project
5. Generates setup instructions
6. Returns complete project

**Response:**
```json
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "...",
      "language": "typescript",
      "explanation": "Main app component"
    },
    {
      "path": "package.json",
      "content": "...",
      "language": "json",
      "explanation": "Dependencies"
    }
  ],
  "project_structure": {
    "type": "react",
    "entry": "src/App.tsx",
    "dependencies": ["react", "typescript"]
  },
  "setup_instructions": "npm install && npm start",
  "anchors": ["react-todo-pattern", "typescript-config"]
}
```

---

## 🔗 Integration Points

### Hash Sphere Integration

**How Code Features Use Hash Sphere:**

1. **Code Patterns as Anchors:**
   - When code is discussed/used, patterns are extracted
   - Stored as Hash Sphere anchors
   - Used for similarity matching

2. **Semantic Code Search:**
   - Code queries use Hash Sphere resonance
   - Finds similar code by meaning, not just keywords
   - Enables "find code like this" functionality

3. **Code Memory:**
   - Frequently used code patterns stored
   - Retrieved when generating similar code
   - Maintains coding style consistency

**Example Flow:**
```
1. User discusses: "I use this pattern for API calls"
   ↓
2. Code pattern extracted
   ↓
3. Hash Sphere anchor created: "api-call-pattern"
   ↓
4. Later, user asks: "Generate an API call function"
   ↓
5. Hash Sphere finds "api-call-pattern" anchor
   ↓
6. Generated code uses similar pattern
   ↓
7. Consistency maintained
```

### RAG Integration

**How Code Features Use RAG:**

1. **Code Documentation:**
   - Code explanations stored in RAG
   - Retrieved when explaining similar code

2. **Code Examples:**
   - Example code snippets stored
   - Retrieved for reference

3. **Code Patterns:**
   - Common patterns stored
   - Used for code generation

---

## 📊 State Management

### Frontend State Variables

```typescript
// File Management
const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
const [uploadedFileIds, setUploadedFileIds] = useState<Map<File, string>>(new Map());
const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

// Code Selection
const [codeSelection, setCodeSelection] = useState<{
  file: string;
  lines: number[];
  code?: string;
} | null>(null);

// Project Building
const [buildMode, setBuildMode] = useState(false);
const [generatedProject, setGeneratedProject] = useState<Project | null>(null);

// IDE Mode
const [ideMode, setIdeMode] = useState(false);
```

### State Flow

```
User Action → State Update → UI Update → API Call → Response → State Update → UI Update
```

**Example: File Attachment**
```
1. User selects file
   → handleFileUpload() called
   → setAttachedFiles([...prev, file])
   → UI shows file in list
   → If logged in: uploadFile(file)
   → setUploadedFileIds(map.set(file, id))
   → File ID stored for later use
```

---

## 🎯 Key Features Breakdown

### 1. File Attachment System

**Components:**
- File input (hidden)
- File list display
- File removal
- File preview (if implemented)

**Supported File Types:**
- Text: `.txt`, `.md`, `.json`
- Code: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.cpp`, `.c`, `.cs`, `.go`, `.rs`, `.rb`, `.php`

**File Processing:**
```typescript
// Text/code files: Read content
if (file.type.startsWith('text/') || isCodeFile(file.name)) {
  const content = await readTextFile(file);
  return `[File: ${file.name}]\n${content}`;
}
// Other files: Just reference
else {
  const fileId = uploadedFileIds.get(file);
  return `[File: ${file.name}${fileId ? ` (ID: ${fileId})` : ''}]`;
}
```

### 2. Code Selection System

**Current Implementation:**
- State-based (no visual editor selection yet)
- Can be set programmatically
- Included in message requests

**Future Enhancement:**
- Visual code selection in editor
- Multi-file selection
- Selection persistence

### 3. Code Generation

**Capabilities:**
- Single function generation
- Multi-function generation
- File generation
- Project generation

**Context Sources:**
- File context (if file_path provided)
- Related files (if context_files provided)
- Hash Sphere patterns
- RAG memories
- Conversation history

### 4. Code Refactoring

**Capabilities:**
- Function refactoring
- Code style conversion
- Pattern application
- Safety checking

**Safety Features:**
- Syntax validation
- Breaking change detection
- Type compatibility checking
- Warning system

---

## 🔍 Debugging & Troubleshooting

### Common Issues

**Issue 1: Files Not Uploading**
- Check: Is user logged in?
- Check: Backend running?
- Check: Network tab for errors
- Solution: Files still work locally, upload is optional

**Issue 2: Code Selection Not Working**
- Check: Is codeSelection state set?
- Check: Is it included in request?
- Check: Backend logs for code_selection

**Issue 3: Code Generation Fails**
- Check: Language supported?
- Check: Description clear?
- Check: Backend code router working?
- Check: AI provider available?

**Issue 4: Large Files Cause Errors**
- Check: File size limits
- Check: Request timeout
- Check: Backend memory

### Debug Commands

**Check File Upload:**
```javascript
// In browser console
console.log('Attached files:', attachedFiles);
console.log('Uploaded IDs:', uploadedFileIds);
```

**Check Code Selection:**
```javascript
console.log('Code selection:', codeSelection);
```

**Check API Requests:**
```javascript
// In Network tab
// Look for: /resonant-chat/message
// Check request payload for:
// - attached_files
// - code_selection
```

---

## 📈 Performance Considerations

### File Size Limits
- **Frontend:** No hard limit (browser memory)
- **Backend:** 50MB request body limit (configured)
- **Recommendation:** Keep files under 5MB for best performance

### Code Generation
- **Simple functions:** < 2 seconds
- **Complex functions:** 3-5 seconds
- **Multi-file projects:** 10-30 seconds

### Code Indexing
- **Small files (< 100 lines):** < 1 second
- **Medium files (100-1000 lines):** 1-3 seconds
- **Large files (> 1000 lines):** 3-10 seconds

---

## 🚀 Future Enhancements

### Planned Features
1. **Visual Code Editor:** Integrated code editor with selection
2. **Multi-File Editing:** Edit multiple files simultaneously
3. **Code Diff Viewer:** Visual diff for refactoring
4. **Code Templates:** Reusable code templates
5. **Code Review:** Automated code review suggestions
6. **Test Generation:** Automatic test generation
7. **Documentation Generation:** Auto-generate code docs

### Technical Improvements
1. **AST Parsing:** Full AST support for all languages
2. **Type Inference:** Better type awareness
3. **Code Analysis:** Static analysis integration
4. **Performance:** Caching and optimization
5. **Security:** Enhanced sandboxing for execution

---

## 📚 Related Documentation

- `RESONANT_CHAT_TEST_PLAN.md` - General test plan
- `RESONANT_CHAT_DIAGNOSTIC_SCRIPT.md` - Diagnostic commands
- `PROMPT_BUILDER_IMPLEMENTATION.md` - Prompt building system
- `PROJECT_BUILDING_ROADMAP.md` - Project building roadmap

---

**Last Updated:** 2025-01-30
**Version:** 1.0
**Status:** ✅ Complete Investigation

