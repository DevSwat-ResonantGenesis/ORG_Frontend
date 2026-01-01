# 💻 IDE Backend - Complete Architecture Guide

**Date:** 2025-12-01  
**Purpose:** Complete guide to understanding and modifying the IDE backend API (Code + Git)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Code API Endpoints](#code-api-endpoints)
4. [Git API Endpoints](#git-api-endpoints)
5. [Data Models](#data-models)
6. [Services](#services)
7. [Request/Response Flow](#requestresponse-flow)
8. [How to Modify Each Component](#how-to-modify-each-component)
9. [Integration Points](#integration-points)

---

## 🎯 Overview

### **What is IDE Backend?**

The IDE backend is a **FastAPI-based API** that powers the integrated development environment with:
- **Code Operations**: Generation, completion, refactoring, indexing
- **File Management**: Read, write, delete, list project files
- **Project Generation**: Multi-file project creation from descriptions
- **Code Execution**: Docker sandbox execution
- **LSP Integration**: Language Server Protocol features
- **Git Integration**: Full version control operations
- **Advanced Refactoring**: Multi-file refactoring with dependency tracking

### **Technology Stack**
- **Framework**: FastAPI
- **Database**: PostgreSQL (via SQLModel)
- **Code Execution**: Docker (sandbox)
- **LSP**: Language Server Protocol (TypeScript, Python, JSON)
- **Git**: Subprocess-based git operations
- **Location**: `/Applications/ResonantGraphAIV0.1/backend/fastapi_app/`

---

## 📁 File Structure

### **Main Files**

```
/Applications/ResonantGraphAIV0.1/backend/fastapi_app/
├── routers/
│   ├── code.py              # Code router (1718 lines) - ALL CODE ENDPOINTS
│   └── git.py               # Git router (220 lines) - ALL GIT ENDPOINTS
├── models/governance/
│   └── code.py              # Database models (79 lines)
└── services/
    ├── code_executor.py     # Docker code execution (241 lines)
    ├── code_indexer.py      # Code indexing (239 lines)
    ├── code_context.py      # Code context retrieval (335 lines)
    ├── code_parser.py       # Code parsing
    ├── lsp_proxy.py         # LSP server proxy (452 lines)
    ├── advanced_refactor.py # Multi-file refactoring (380 lines)
    └── git_service.py       # Git operations (409 lines)
```

### **Router Registration**

**File:** `main.py`

```python
from fastapi_app.routers import code, git

app.include_router(code.router)
app.include_router(git.router)
```

**Router Prefixes:**
- Code: `/code`
- Git: `/git`

---

## 🔌 Code API Endpoints

### **1. Code Completion**

**Endpoint:** `POST /code/complete`

**Location:** `routers/code.py:164`

**Request:**
```json
{
  "file_path": "src/App.tsx",
  "prefix": "const total = ",
  "cursor_position": {"line": 10, "column": 15},
  "language": "typescript"
}
```

**Response:**
```json
{
  "completions": [
    {"text": "const total = sum", "score": 0.95}
  ],
  "from_memory": true
}
```

**Process:**
1. Get file context
2. Get related files
3. Search Hash Sphere for similar patterns
4. Get code memories
5. Generate completion via AI

**To modify:**
- Change completion logic: Line 229-248
- Change context retrieval: Line 180-211

---

### **2. Code Generation**

**Endpoint:** `POST /code/generate`

**Location:** `routers/code.py:256`

**Request:**
```json
{
  "description": "Create a function to calculate factorial",
  "language": "python",
  "file_path": "math.py",
  "context_files": ["utils.py"]
}
```

**Response:**
```json
{
  "code": "def factorial(n):\n    ...",
  "explanation": "Generated code based on your description",
  "tests": null
}
```

**To modify:**
- Change prompt building: Line 291-303
- Change AI provider: Line 310

---

### **3. Code Refactoring**

**Endpoint:** `POST /code/refactor`

**Location:** `routers/code.py:335`

**Request:**
```json
{
  "file_path": "src/App.tsx",
  "code": "function oldName() {...}",
  "refactor_request": "Rename function to newName",
  "language": "typescript"
}
```

**Response:**
```json
{
  "original_code": "...",
  "refactored_code": "...",
  "diff": "--- ...\n+++ ...",
  "explanation": "Code refactored based on your request",
  "safety_checks": {"syntax_valid": true}
}
```

**To modify:**
- Change refactoring logic: Line 364-404
- Change diff generation: Line 391

---

### **4. Code Indexing**

**Endpoint:** `POST /code/index`

**Location:** `routers/code.py:407`

**Request:**
```json
{
  "files": [
    {"path": "src/App.tsx", "content": "...", "language": "typescript"}
  ]
}
```

**Response:**
```json
{
  "indexed": 1,
  "updated": 0,
  "errors": 0
}
```

**Process:**
1. Parse each file
2. Extract chunks (functions, classes, imports)
3. Generate Hash Sphere hashes
4. Generate ML embeddings
5. Store in database
6. Index dependencies

**To modify:**
- Change indexing logic: `services/code_indexer.py`

---

### **5. Code Search (Hash Sphere)**

**Endpoint:** `GET /code/search`

**Location:** `routers/code.py:434`

**Parameters:**
- `query`: Search query
- `language` (optional): Filter by language
- `limit` (default: 10): Number of results

**Response:**
```json
{
  "results": [
    {
      "chunk_id": "uuid",
      "file_path": "src/App.tsx",
      "code": "function example() {...}",
      "resonance_score": 0.85
    }
  ],
  "count": 5
}
```

**To modify:**
- Change search algorithm: `services/code_context.py:172`

---

### **6. Code Search (ML Embeddings)**

**Endpoint:** `GET /code/search/ml`

**Location:** `routers/code.py:460`

**Uses:** Vector similarity search (pgvector)

**To modify:**
- Change embedding model: `services/code_context.py:234`

---

### **7. Project Generation**

**Endpoint:** `POST /code/project/generate`

**Location:** `routers/code.py:486`

**Request:**
```json
{
  "description": "Build a React todo app",
  "project_type": "react",
  "files": null,
  "context": null
}
```

**Response:**
```json
{
  "files": [
    {
      "path": "src/App.tsx",
      "content": "...",
      "language": "typescript",
      "explanation": "Main React component"
    }
  ],
  "project_structure": {...},
  "setup_instructions": "npm install && npm start",
  "anchors": ["hash1", "hash2"]
}
```

**Process:**
1. Search Hash Sphere for similar projects
2. Infer project structure
3. Generate files one by one
4. Index files immediately
5. Create Hash Sphere anchors

**To modify:**
- Change project structure inference: Line 1118-1186
- Change file generation: Line 529-636

---

### **8. Project Upload**

**Endpoint:** `POST /code/project/upload`

**Location:** `routers/code.py:654`

**Request:** Multipart file upload (ZIP)

**Response:**
```json
{
  "project_id": "project-123",
  "files_indexed": 10,
  "message": "Project uploaded and indexed"
}
```

**Status:** ⚠️ Implementation pending (Line 667)

**To modify:**
- Implement ZIP extraction: Line 667-673

---

### **9. List Project Files**

**Endpoint:** `GET /code/project/files`

**Location:** `routers/code.py:676`

**Parameters:**
- `project_id` (optional): Project identifier

**Response:**
```json
{
  "files": [
    {
      "path": "src/App.tsx",
      "language": "typescript",
      "size": 0,
      "modified": "2025-01-30T12:00:00Z"
    }
  ],
  "project_id": "project-123"
}
```

**To modify:**
- Change file filtering: Line 693

---

### **10. Read Project File**

**Endpoint:** `POST /code/project/file/read`

**Location:** `routers/code.py:712`

**Request:**
```json
{
  "file_path": "src/App.tsx"
}
```

**Response:**
```json
{
  "path": "src/App.tsx",
  "content": "...",
  "language": "typescript",
  "exists": true
}
```

**Status:** ⚠️ Content reconstruction pending (Line 753)

**To modify:**
- Implement content storage: Line 752-760

---

### **11. Write Project File**

**Endpoint:** `POST /code/project/file/write`

**Location:** `routers/code.py:763`

**Request:**
```json
{
  "file_path": "src/App.tsx",
  "content": "function App() {...}",
  "language": "typescript"
}
```

**Response:**
```json
{
  "path": "src/App.tsx",
  "success": true,
  "indexed": true,
  "anchor_created": "hash_value"
}
```

**Process:**
1. Index/update file
2. Create Hash Sphere anchor
3. Return success

**To modify:**
- Change indexing: Line 780-787
- Change anchor creation: Line 790

---

### **12. Delete Project File**

**Endpoint:** `POST /code/project/file/delete`

**Location:** `routers/code.py:806`

**Request:**
```json
{
  "file_path": "src/App.tsx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File src/App.tsx deleted"
}
```

**Process:**
1. Delete chunks
2. Delete dependencies
3. Delete file record

**To modify:**
- Change deletion logic: Line 819-857

---

### **13. Execute Code**

**Endpoint:** `POST /code/execute`

**Location:** `routers/code.py:878`

**Request:**
```json
{
  "code": "print('Hello, World!')",
  "language": "python",
  "inputs": ["input1", "input2"],
  "timeout": 30
}
```

**Response:**
```json
{
  "success": true,
  "output": "Hello, World!",
  "error": null,
  "exit_code": 0,
  "execution_time": 0.15
}
```

**Process:**
1. Create temporary file
2. Run in Docker container
3. Capture stdout/stderr
4. Return results

**Supported Languages:**
- Python, JavaScript, TypeScript, Java, Go, Rust, C/C++

**To modify:**
- Change Docker images: `services/code_executor.py:199`
- Change timeout: `services/code_executor.py:28`
- Change resource limits: Line 29-31

---

### **14. LSP Completion**

**Endpoint:** `POST /code/lsp/completion`

**Location:** `routers/code.py:949`

**Request:**
```json
{
  "project_id": "project-123",
  "file_path": "src/App.tsx",
  "language": "typescript",
  "line": 10,
  "character": 15,
  "content": "const x = "
}
```

**Response:**
```json
{
  "completions": [
    {
      "label": "total",
      "kind": 6,
      "detail": "number",
      "insertText": "total"
    }
  ]
}
```

**To modify:**
- Change LSP server: `services/lsp_proxy.py:20`
- Add new language: Add to `servers` dict

---

### **15. LSP Definition**

**Endpoint:** `POST /code/lsp/definition`

**Location:** `routers/code.py:976`

**Returns:** Definition location (file, line, column)

**To modify:**
- Change definition logic: `services/lsp_proxy.py:251`

---

### **16. LSP References**

**Endpoint:** `POST /code/lsp/references`

**Location:** `routers/code.py:1003`

**Returns:** List of all references to symbol

**To modify:**
- Change references logic: `services/lsp_proxy.py:305`

---

### **17. LSP Hover**

**Endpoint:** `POST /code/lsp/hover`

**Location:** `routers/code.py:1030`

**Returns:** Hover information (documentation, type, etc.)

**To modify:**
- Change hover logic: `services/lsp_proxy.py:358`

---

### **18. Advanced Refactoring**

**Endpoint:** `POST /code/refactor/advanced`

**Location:** `routers/code.py:1072`

**Request:**
```json
{
  "project_id": "project-123",
  "refactor_request": "Rename all instances of 'oldFunction' to 'newFunction'",
  "files": [
    {"path": "src/App.tsx", "content": "...", "language": "typescript"}
  ]
}
```

**Response:**
```json
{
  "files": [
    {
      "path": "src/App.tsx",
      "original": "...",
      "refactored": "...",
      "diff": "--- ...\n+++ ..."
    }
  ],
  "validation": {
    "valid": true,
    "issues": []
  },
  "dependency_changes": {
    "added_dependencies": [],
    "removed_dependencies": []
  }
}
```

**Process:**
1. Parse all files
2. Build dependency graph
3. Find affected files
4. Generate refactored code
5. Validate refactoring
6. Analyze dependency changes

**To modify:**
- Change refactoring logic: `services/advanced_refactor.py:25`
- Change dependency analysis: Line 337-378

---

### **19. Code Diff**

**Endpoint:** `POST /code/diff`

**Location:** `routers/code.py:1267`

**Request:**
```json
{
  "original_code": "function old() {...}",
  "modified_code": "function new() {...}",
  "language": "typescript",
  "file_path": "src/App.tsx"
}
```

**Response:**
```json
{
  "unified_diff": "--- ...\n+++ ...",
  "html_diff": "<span>...</span>",
  "line_changes": [
    {"line": 1, "original": "...", "modified": "...", "type": "modified"}
  ],
  "stats": {
    "lines_added": 2,
    "lines_removed": 1,
    "lines_modified": 3,
    "total_changes": 6
  }
}
```

**To modify:**
- Change diff format: Line 1285-1347

---

### **20. Code Review**

**Endpoint:** `POST /code/review`

**Location:** `routers/code.py:1350`

**Request:**
```json
{
  "code": "function example() {...}",
  "language": "typescript",
  "file_path": "src/App.tsx",
  "context": "Additional context"
}
```

**Response:**
```json
{
  "suggestions": [
    {"type": "suggestion", "description": "...", "severity": "medium"}
  ],
  "quality_score": 0.85,
  "issues": [
    {"type": "issue", "description": "..."}
  ],
  "improvements": ["Add error handling", "..."]
}
```

**To modify:**
- Change review criteria: Line 1370-1417

---

### **21. Generate Tests**

**Endpoint:** `POST /code/test`

**Location:** `routers/code.py:1425`

**Request:**
```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "python",
  "test_framework": "pytest",
  "existing_tests": null
}
```

**Response:**
```json
{
  "test_code": "def test_add(): ...",
  "test_results": {
    "success": true,
    "output": "..."
  },
  "coverage": null
}
```

**To modify:**
- Change test generation: Line 1454-1506

---

### **22. Code Quality Analysis**

**Endpoint:** `POST /code/quality`

**Location:** `routers/code.py:1509`

**Request:**
```json
{
  "code": "function example() {...}",
  "language": "typescript",
  "file_path": "src/App.tsx"
}
```

**Response:**
```json
{
  "metrics": {
    "total_lines": 50,
    "code_lines": 40,
    "comment_lines": 5,
    "functions": 3,
    "classes": 1
  },
  "complexity": 5,
  "maintainability_index": 75.5,
  "issues": [
    {"type": "high_complexity", "severity": "high", "description": "..."}
  ],
  "recommendations": ["Break down complex functions", "..."]
}
```

**To modify:**
- Change quality metrics: Line 1529-1599
- Change complexity calculation: Line 1536-1539

---

### **23. Dependency Analysis**

**Endpoint:** `POST /code/dependencies/analyze`

**Location:** `routers/code.py:1602`

**Request:**
```json
{
  "project_id": "project-123",
  "file_paths": ["src/App.tsx"]
}
```

**Response:**
```json
{
  "dependencies": [
    {"source": "src/App.tsx", "target": "src/utils.ts", "type": "import"}
  ],
  "dependency_graph": {
    "src/App.tsx": ["src/utils.ts"]
  },
  "circular_dependencies": [],
  "unused_dependencies": [],
  "security_issues": []
}
```

**To modify:**
- Change dependency detection: Line 1622-1689

---

## 🔀 Git API Endpoints

### **1. Initialize Repository**

**Endpoint:** `POST /git/init`

**Location:** `routers/git.py:60`

**Request:**
```json
{
  "project_id": "project-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Repository initialized",
  "error": null
}
```

**To modify:**
- Change init options: `services/git_service.py:30`

---

### **2. Get Git Status**

**Endpoint:** `POST /git/status`

**Location:** `routers/git.py:85`

**Request:**
```json
{
  "project_id": "project-123"
}
```

**Response:**
```json
{
  "is_repo": true,
  "files": [
    {
      "status": "M ",
      "file": "src/App.tsx",
      "status_text": "Modified"
    }
  ],
  "has_changes": true,
  "branch": "main",
  "message": "1 file(s) changed"
}
```

**To modify:**
- Change status parsing: `services/git_service.py:58`

---

### **3. Stage Files**

**Endpoint:** `POST /git/add`

**Location:** `routers/git.py:103`

**Request:**
```json
{
  "project_id": "project-123",
  "files": ["src/App.tsx"]  // Optional: all if not provided
}
```

**Response:**
```json
{
  "success": true,
  "message": "Files staged",
  "error": null
}
```

**To modify:**
- Change staging logic: `services/git_service.py:127`

---

### **4. Commit Changes**

**Endpoint:** `POST /git/commit`

**Location:** `routers/git.py:128`

**Request:**
```json
{
  "project_id": "project-123",
  "message": "Fix bug in App component",  // Optional if auto_generate
  "auto_generate": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fix bug in App component",
  "output": "[main abc123] Fix bug...",
  "error": null
}
```

**Process:**
1. Generate commit message (if auto_generate)
2. Stage all changes
3. Commit with message

**To modify:**
- Change commit message generation: `services/git_service.py:327`
- Change commit options: Line 186-192

---

### **5. Manage Branch**

**Endpoint:** `POST /git/branch`

**Location:** `routers/git.py:156`

**Request:**
```json
{
  "project_id": "project-123",
  "branch_name": "feature/new-feature",
  "create": true  // true = create, false = switch
}
```

**Response:**
```json
{
  "success": true,
  "branch": "feature/new-feature",
  "output": "Switched to branch...",
  "error": null
}
```

**To modify:**
- Change branch operations: `services/git_service.py:215` (create), `267` (switch)

---

### **6. List Branches**

**Endpoint:** `GET /git/branches`

**Location:** `routers/git.py:184`

**Parameters:**
- `project_id`: Project identifier

**Response:**
```json
{
  "branches": ["main", "feature/new-feature", "develop"]
}
```

**To modify:**
- Change branch listing: `services/git_service.py:247`

---

### **7. Get Commit Log**

**Endpoint:** `GET /git/log`

**Location:** `routers/git.py:202`

**Parameters:**
- `project_id`: Project identifier
- `limit` (default: 10): Number of commits

**Response:**
```json
{
  "commits": [
    {
      "hash": "abc123",
      "author": "user@example.com",
      "email": "user@example.com",
      "date": "2025-01-30T12:00:00Z",
      "message": "Fix bug in App component"
    }
  ]
}
```

**To modify:**
- Change log format: `services/git_service.py:299`

---

## 🗄️ Data Models

### **1. CodeFile**

**Location:** `models/governance/code.py:15`

```python
class CodeFile(IDMixin, TimestampMixin, SQLModel, table=True):
    __tablename__ = "code_files"
    
    file_path: str
    language: str
    content_hash: str
    ast_json: Optional[dict]
    indexed_at: Optional[datetime]
    org_id: GUID
    indexed_by_user_id: Optional[GUID]
```

**To modify:**
- Add fields: Add new `Field()` declarations

---

### **2. CodeChunk**

**Location:** `models/governance/code.py:37`

```python
class CodeChunk(IDMixin, TimestampMixin, SQLModel, table=True):
    __tablename__ = "code_chunks"
    
    file_id: GUID
    chunk_text: str
    chunk_type: str  # 'function', 'class', 'import', etc.
    start_line: int
    end_line: int
    hash_sphere_hash: Optional[str]
    embedding: Optional[dict]  # ML embedding (JSON)
    org_id: GUID
```

**To modify:**
- Add chunk types: Modify validation
- Change embedding storage: Line 54

---

### **3. CodeDependency**

**Location:** `models/governance/code.py:62`

```python
class CodeDependency(IDMixin, TimestampMixin, SQLModel, table=True):
    __tablename__ = "code_dependencies"
    
    source_file_id: GUID
    target_file_id: GUID
    dependency_type: str  # 'import', 'extends', 'implements', etc.
    org_id: GUID
```

**To modify:**
- Add dependency types: Modify validation

---

## 🔧 Services

### **1. CodeExecutor**

**Location:** `services/code_executor.py:16`

**Purpose:** Execute code in Docker sandbox

**Key Methods:**

#### `execute_code()`
```python
async def execute_code(
    code: str,
    language: str,
    inputs: Optional[List[str]] = None,
    timeout: Optional[int] = None
) -> Dict[str, Any]:
```

**Supported Languages:**
- Python, JavaScript, TypeScript, Java, Go, Rust, C/C++

**Docker Images:**
- Python: `python:3.11-slim`
- JavaScript/TypeScript: `node:18-slim`
- Java: `openjdk:17-slim`
- Go: `golang:1.21-alpine`
- Rust: `rust:1.75-slim`
- C/C++: `gcc:latest`

**Security:**
- Network disabled
- Memory limit: 512MB
- CPU limit: 50%
- Timeout: 30 seconds (default)

**To modify:**
- Change Docker images: Line 199-211
- Change resource limits: Line 28-31
- Change timeout: Line 28
- Add new language: Add to `_get_image()`, `_get_command()`, `_get_extension()`

---

### **2. CodeIndexerService**

**Location:** `services/code_indexer.py:19`

**Purpose:** Index code files for search

**Key Methods:**

#### `index_file()`
```python
def index_file(
    session: Session,
    file_path: str,
    content: str,
    language: str,
    org_id: UUID,
    user_id: Optional[UUID] = None
) -> CodeFile:
```

**Process:**
1. Parse file
2. Check if exists
3. Update or create CodeFile
4. Index chunks
5. Index dependencies

**To modify:**
- Change parsing: Uses `CodeParserService`
- Change chunk extraction: Line 90
- Change embedding generation: Line 109

#### `index_codebase()`
**Location:** Line 190

**Indexes multiple files at once**

---

### **3. CodeContextService**

**Location:** `services/code_context.py:20`

**Purpose:** Retrieve code context for AI

**Key Methods:**

#### `get_file_context()`
**Location:** Line 27

**Returns:** File chunks, dependencies, AST

#### `search_codebase()`
**Location:** Line 172

**Uses:** Hash Sphere resonance matching

#### `search_codebase_ml()`
**Location:** Line 234

**Uses:** ML embeddings (pgvector)

**To modify:**
- Change search algorithm: Line 172-232
- Change ML search: Line 234-300

---

### **4. LSPProxy**

**Location:** `services/lsp_proxy.py:15`

**Purpose:** Proxy LSP requests to language servers

**Supported Languages:**
- TypeScript/JavaScript: `typescript-language-server`
- Python: `pylsp`
- JSON: `vscode-json-languageserver`

**Key Methods:**

#### `get_completions()`
**Location:** Line 197

**Returns:** Code completion suggestions

#### `get_definition()`
**Location:** Line 251

**Returns:** Definition location

#### `get_references()`
**Location:** Line 305

**Returns:** All references to symbol

#### `get_hover()`
**Location:** Line 358

**Returns:** Hover information

**To modify:**
- Add new language: Add to `servers` dict (Line 20)
- Change LSP server: Modify command in `servers` dict

---

### **5. AdvancedRefactorService**

**Location:** `services/advanced_refactor.py:16`

**Purpose:** Multi-file refactoring with dependency tracking

**Key Methods:**

#### `refactor_multi_file()`
**Location:** Line 25

**Process:**
1. Parse all files
2. Build dependency graph
3. Find affected files
4. Generate refactored code
5. Validate refactoring
6. Analyze dependency changes

**To modify:**
- Change dependency graph: Line 124-158
- Change refactoring generation: Line 222-265
- Change validation: Line 288-335

---

### **6. GitService**

**Location:** `services/git_service.py:16`

**Purpose:** Git operations on project repositories

**Key Methods:**

#### `init_repo()`
**Location:** Line 30

**Initializes git repository**

#### `get_status()`
**Location:** Line 58

**Returns:** Git status with modified files

#### `add_files()`
**Location:** Line 127

**Stages files for commit**

#### `commit()`
**Location:** Line 162

**Commits with optional AI-generated message**

#### `create_branch()`
**Location:** Line 215

**Creates new branch**

#### `switch_branch()`
**Location:** Line 267

**Switches to existing branch**

#### `get_branches()`
**Location:** Line 247

**Lists all branches**

#### `get_log()`
**Location:** Line 299

**Returns commit history**

**To modify:**
- Change git commands: Modify subprocess calls
- Change commit message generation: Line 327

---

## 🔄 Request/Response Flow

### **Code Execution Flow**

```
1. User clicks "Run" in IDE
   ↓
2. POST /code/execute
   ↓
3. CodeExecutor creates temp file
   ↓
4. Docker container created
   ↓
5. Code executed in sandbox
   ↓
6. Output captured
   ↓
7. Container destroyed
   ↓
8. Results returned to frontend
```

### **Project Generation Flow**

```
1. User requests project
   ↓
2. POST /code/project/generate
   ↓
3. Search Hash Sphere for similar projects
   ↓
4. Infer project structure
   ↓
5. Generate files one by one
   ↓
6. Index each file immediately
   ↓
7. Create Hash Sphere anchors
   ↓
8. Return files + setup instructions
```

### **Git Commit Flow**

```
1. User clicks "Commit" in Git Panel
   ↓
2. POST /git/commit
   ↓
3. GitService.get_status() - Get changes
   ↓
4. Generate commit message (if auto_generate)
   ↓
5. Stage all files
   ↓
6. Commit with message
   ↓
7. Return commit result
```

### **LSP Completion Flow**

```
1. User types in Monaco Editor
   ↓
2. POST /code/lsp/completion
   ↓
3. LSPProxy.start_server() - Start LSP server
   ↓
4. Send textDocument/didChange notification
   ↓
5. Send textDocument/completion request
   ↓
6. LSP server returns completions
   ↓
7. Return to frontend
   ↓
8. Monaco Editor displays completions
```

---

## 🔧 How to Modify Each Component

### **1. Change Code Execution Timeout**

**File:** `services/code_executor.py`

```python
# Find this (Line 28):
self.timeout = 30  # seconds

# Change to:
self.timeout = 60  # 60 seconds
```

---

### **2. Change Docker Resource Limits**

**File:** `services/code_executor.py`

```python
# Find this (Line 29-31):
self.mem_limit = '512m'
self.cpu_period = 100000
self.cpu_quota = 50000  # 50% CPU

# Change to:
self.mem_limit = '1g'  # 1GB memory
self.cpu_quota = 100000  # 100% CPU
```

---

### **3. Add New Language for Execution**

**File:** `services/code_executor.py`

```python
# 1. Add Docker image (Line 199):
def _get_image(self, language: str) -> str:
    images = {
        # ... existing ...
        'ruby': 'ruby:3.2-slim'  # Add new
    }

# 2. Add command (Line 213):
def _get_command(self, language: str, file_path: str) -> str:
    commands = {
        # ... existing ...
        'ruby': f'ruby /workspace/{file_name}'  # Add new
    }

# 3. Add extension (Line 228):
def _get_extension(self, language: str) -> str:
    extensions = {
        # ... existing ...
        'ruby': 'rb'  # Add new
    }
```

---

### **4. Change LSP Server**

**File:** `services/lsp_proxy.py`

```python
# Find this (Line 20):
self.servers = {
    'typescript': {
        'command': ['typescript-language-server', '--stdio'],
        'install': 'npm install -g typescript-language-server'
    },
    # ...
}

# Change to:
self.servers = {
    'typescript': {
        'command': ['tsx', '--stdio'],  # Different server
        'install': 'npm install -g tsx'
    },
    # ...
}
```

---

### **5. Change Project Structure Templates**

**File:** `routers/code.py`

```python
# Find this (Line 1147):
structures = {
    "react": {
        "files": [
            {"path": "src/App.tsx", "purpose": "...", "language": "typescript"},
            # ...
        ]
    },
    # ...
}

# Add new template:
structures = {
    # ... existing ...
    "nextjs": {
        "files": [
            {"path": "pages/index.tsx", "purpose": "Home page", "language": "typescript"},
            {"path": "package.json", "purpose": "Dependencies", "language": "json"}
        ]
    }
}
```

---

### **6. Change Code Quality Metrics**

**File:** `routers/code.py`

```python
# Find this (Line 1542):
maintainability_index = max(0, min(100, 171 - 5.2 * (avg_lines if avg_lines > 0 else 1) - 0.23 * complexity + 50 * (comment_ratio ** 0.5)))

# Change formula:
maintainability_index = max(0, min(100, 200 - 10 * complexity - 5 * avg_lines))
```

---

### **7. Change Git Commit Message Generation**

**File:** `services/git_service.py`

```python
# Find this (Line 338):
prompt = f"""Generate a concise, professional git commit message for these changes:

{changes_summary}

Return only the commit message, no explanation or markdown formatting."""

# Change prompt:
prompt = f"""Create a detailed commit message with:
1. Summary (50 chars)
2. Body explaining why
3. Footer with issue references

Changes: {changes_summary}"""
```

---

### **8. Change Code Search Limit**

**File:** `routers/code.py`

```python
# Find this (Line 438):
limit: int = 10,

# Change to:
limit: int = 20,  # More results
```

---

### **9. Change File Indexing**

**File:** `services/code_indexer.py`

```python
# Find this (Line 90):
chunks = self.parser.extract_code_chunks(parsed_data, chunk_type="all")

# Change to:
chunks = self.parser.extract_code_chunks(parsed_data, chunk_type="function")  # Only functions
```

---

### **10. Change Advanced Refactoring Validation**

**File:** `services/advanced_refactor.py`

```python
# Find this (Line 333):
'valid': len([i for i in issues if i['type'] == 'error']) == 0,

# Change to:
'valid': len(issues) == 0,  # No warnings allowed
```

---

## 🔗 Integration Points

### **1. Hash Sphere Integration**

**Location:** `routers/code.py:500`

```python
similar_patterns = code_context_service.search_codebase(
    session=session,
    query=request.description,
    org_id=org_id,
    limit=5
)
```

**Used in:** Project generation, code completion, refactoring

---

### **2. ML Worker Integration**

**Location:** `services/code_indexer.py:109`

```python
embedding_result = ml_client.embed(chunk_data["text"])
embedding = embedding_result.get("vector", [])
```

**Used in:** Code indexing, ML search

---

### **3. Multi-AI Router Integration**

**Location:** `routers/code.py:232`

```python
ai_response = ai_router.route_query(
    message=completion_prompt,
    context=None,
    preferred_provider="openai"
)
```

**Used in:** Code generation, completion, refactoring, commit messages

---

### **4. Docker Integration**

**Location:** `services/code_executor.py:106`

```python
container = self.client.containers.run(
    image=image,
    command=command,
    volumes=volumes,
    network_disabled=True,
    # ...
)
```

**Used in:** Code execution

---

### **5. Git Integration**

**Location:** `services/git_service.py:33`

```python
result = subprocess.run(
    ['git', 'init'],
    cwd=self.workspace_path,
    # ...
)
```

**Used in:** All git operations

---

## 📊 Quick Reference: Endpoint → File → Line

| Endpoint | Method | File | Line |
|----------|--------|------|------|
| `/code/complete` | POST | `routers/code.py` | 164 |
| `/code/generate` | POST | `routers/code.py` | 256 |
| `/code/refactor` | POST | `routers/code.py` | 335 |
| `/code/index` | POST | `routers/code.py` | 407 |
| `/code/search` | GET | `routers/code.py` | 434 |
| `/code/search/ml` | GET | `routers/code.py` | 460 |
| `/code/project/generate` | POST | `routers/code.py` | 486 |
| `/code/project/upload` | POST | `routers/code.py` | 654 |
| `/code/project/files` | GET | `routers/code.py` | 676 |
| `/code/project/file/read` | POST | `routers/code.py` | 712 |
| `/code/project/file/write` | POST | `routers/code.py` | 763 |
| `/code/project/file/delete` | POST | `routers/code.py` | 806 |
| `/code/execute` | POST | `routers/code.py` | 878 |
| `/code/lsp/completion` | POST | `routers/code.py` | 949 |
| `/code/lsp/definition` | POST | `routers/code.py` | 976 |
| `/code/lsp/references` | POST | `routers/code.py` | 1003 |
| `/code/lsp/hover` | POST | `routers/code.py` | 1030 |
| `/code/refactor/advanced` | POST | `routers/code.py` | 1072 |
| `/code/diff` | POST | `routers/code.py` | 1267 |
| `/code/review` | POST | `routers/code.py` | 1350 |
| `/code/test` | POST | `routers/code.py` | 1425 |
| `/code/quality` | POST | `routers/code.py` | 1509 |
| `/code/dependencies/analyze` | POST | `routers/code.py` | 1602 |
| `/git/init` | POST | `routers/git.py` | 60 |
| `/git/status` | POST | `routers/git.py` | 85 |
| `/git/add` | POST | `routers/git.py` | 103 |
| `/git/commit` | POST | `routers/git.py` | 128 |
| `/git/branch` | POST | `routers/git.py` | 156 |
| `/git/branches` | GET | `routers/git.py` | 184 |
| `/git/log` | GET | `routers/git.py` | 202 |

---

## ⚠️ Important Notes

1. **Docker Required:** Code execution requires Docker (checked at runtime)
2. **LSP Servers:** Must be installed on server (TypeScript, Python, JSON)
3. **Git Required:** Git operations require git installed on server
4. **Project Storage:** Projects stored in temp directory (`/tmp/resonant_projects/`)
5. **File Content:** Currently file content reconstruction from chunks is pending
6. **ZIP Upload:** Project upload endpoint implementation pending
7. **Security:** Code execution runs in isolated Docker containers (no network)
8. **Organization Isolation:** All queries filtered by `org_id`

---

## 🚀 Quick Commands

### **Test Endpoint Locally**

```bash
# Start backend
cd /Applications/ResonantGraphAIV0.1
docker compose up -d api

# Test code execution
curl -X POST http://localhost:8001/code/execute \
  -H "Content-Type: application/json" \
  -d '{"code": "print(\"Hello\")", "language": "python"}'

# Test project generation
curl -X POST http://localhost:8001/code/project/generate \
  -H "Content-Type: application/json" \
  -d '{"description": "Build a React app", "project_type": "react"}'
```

### **View API Docs**

```bash
# Open in browser
http://localhost:8001/docs
```

---

**End of Guide** 🎉

