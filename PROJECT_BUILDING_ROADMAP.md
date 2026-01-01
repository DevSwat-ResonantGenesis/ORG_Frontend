# Resonant Chat - Project Building Capabilities Roadmap

## Goal
Enable Resonant Chat to help users build complete projects, not just answer questions.

---

## Current State Analysis

### ✅ What We Have
1. **Code APIs (Backend)**
   - `/code/generate` - Generate code from description
   - `/code/refactor` - Refactor existing code
   - `/code/complete` - Code completion
   - `/code/index` - Index codebase
   - `/code/search` - Search code (Hash Sphere + ML)

2. **File Attachments**
   - Can attach files to chat
   - Can read text/code files
   - Code selection support (API)

3. **Memory System**
   - Hash Sphere anchors
   - Semantic search
   - Context retrieval

### ❌ What's Missing for Project Building
1. **Multi-File Generation** - Can't create multiple files at once
2. **Project Structure** - No understanding of project layout
3. **File Operations** - Can't create/edit/delete files
4. **Dependency Management** - Can't manage package.json, requirements.txt, etc.
5. **Project Templates** - No scaffolding system
6. **Code Coordination** - Can't ensure files work together

---

## Implementation Plan: Phase 1 (MVP - 2-3 months)

### 1. Project Context System
**Goal:** Understand project structure and dependencies

**Features:**
- Project root detection
- File tree scanning
- Dependency file parsing (package.json, requirements.txt, Cargo.toml, etc.)
- Project type detection (React, Python, Node.js, etc.)

**API Endpoints Needed:**
```
POST /code/project/scan
GET  /code/project/structure
GET  /code/project/dependencies
POST /code/project/context
```

**Frontend Components:**
- Project selector/uploader
- Project structure viewer
- Dependency viewer

---

### 2. Multi-File Code Generation
**Goal:** Generate multiple related files together

**Features:**
- Generate file with imports/dependencies
- Generate related files (e.g., component + test + styles)
- Ensure file consistency
- Generate project scaffolding

**API Endpoints Needed:**
```
POST /code/project/generate
POST /code/project/generate-multi
POST /code/project/scaffold
```

**Request Format:**
```typescript
interface ProjectGenerationRequest {
  description: string;
  project_type?: string; // 'react', 'python', 'node', etc.
  files: Array<{
    path: string;
    purpose: string;
    dependencies?: string[]; // Other files this depends on
  }>;
  context?: {
    existing_files?: string[];
    project_structure?: any;
  };
}
```

**Response Format:**
```typescript
interface ProjectGenerationResponse {
  files: Array<{
    path: string;
    content: string;
    explanation: string;
    dependencies: string[];
  }>;
  project_structure: any;
  setup_instructions: string;
}
```

---

### 3. File Operations API
**Goal:** Create, edit, and manage files

**API Endpoints Needed:**
```
POST /code/files/create
PUT  /code/files/update
DELETE /code/files/delete
GET  /code/files/list
GET  /code/files/read
```

**Frontend Integration:**
- File tree component
- File editor component
- File creation wizard
- Multi-file diff viewer

---

### 4. Project Templates & Scaffolding
**Goal:** Quick project setup

**Features:**
- Pre-built templates (React, Next.js, Python Flask, etc.)
- Custom template creation
- Template-based generation

**API Endpoints Needed:**
```
GET  /code/templates
POST /code/templates/create
POST /code/project/scaffold-from-template
```

---

## Implementation Plan: Phase 2 (Advanced - 3-4 months)

### 5. Code Intelligence Layer
**Goal:** Understand code relationships

**Features:**
- Import/export tracking
- Function/class dependency graph
- Type checking across files
- Refactoring safety checks

### 6. Dependency Management
**Goal:** Auto-manage project dependencies

**Features:**
- Auto-add npm/pip packages
- Update package.json/requirements.txt
- Version conflict resolution
- Dependency recommendations

### 7. Project Validation
**Goal:** Ensure generated code works

**Features:**
- Syntax validation
- Import resolution checking
- Type checking
- Build/test validation

---

## Frontend UI Components Needed

### 1. Project Manager Panel
```typescript
// New component: ProjectManager.tsx
- Project selector
- File tree browser
- Project settings
- Template selector
```

### 2. Code Editor Integration
```typescript
// Enhanced: Code generation with file preview
- Multi-file diff viewer
- File creation wizard
- Code preview before applying
```

### 3. Project Builder Chat Mode
```typescript
// New chat mode: "Build Mode"
- Project context awareness
- Multi-file generation UI
- File operation buttons
- Project structure sidebar
```

---

## Backend Architecture Changes

### New Service: Project Builder Service
```
services/
  project_builder/
    - project_scanner.py      # Scan project structure
    - file_generator.py       # Generate files
    - dependency_manager.py   # Manage dependencies
    - template_engine.py      # Template system
    - code_coordinator.py     # Ensure file consistency
```

### Enhanced Code Service
```
services/
  code/
    - multi_file_generator.py  # Generate multiple files
    - project_context.py        # Project understanding
    - file_operations.py        # CRUD operations
```

---

## Example User Flow

### Scenario: "Build a React todo app"

1. **User:** "Build a React todo app with TypeScript"

2. **System:**
   - Detects: React + TypeScript project
   - Scans existing files (if any)
   - Generates project structure:
     ```
     src/
       components/
         TodoList.tsx
         TodoItem.tsx
         AddTodo.tsx
       App.tsx
       index.tsx
     package.json
     tsconfig.json
     ```

3. **System Response:**
   - Shows file tree preview
   - Shows code for each file
   - Shows setup instructions
   - "I've created a React todo app with 4 components. Would you like me to add features like filtering or persistence?"

4. **User:** "Add filtering by status"

5. **System:**
   - Updates TodoList.tsx
   - Creates FilterBar.tsx
   - Updates App.tsx
   - Ensures all imports are correct

---

## Technical Requirements

### Backend Dependencies
- AST parser libraries (tree-sitter, etc.)
- File system operations
- Template engine (Jinja2, etc.)
- Dependency parsers (npm, pip, etc.)

### Frontend Dependencies
- File tree component (react-file-tree)
- Code editor (Monaco Editor or CodeMirror)
- Diff viewer (react-diff-view)
- File upload/download

---

## MVP Implementation Steps

### Step 1: Project Scanner (Week 1-2)
- [ ] Backend: Project structure scanning
- [ ] Backend: Dependency file parsing
- [ ] API: `/code/project/scan`
- [ ] Frontend: Project upload/selector

### Step 2: Multi-File Generator (Week 3-4)
- [ ] Backend: Multi-file generation logic
- [ ] Backend: File consistency checks
- [ ] API: `/code/project/generate-multi`
- [ ] Frontend: Multi-file preview UI

### Step 3: File Operations (Week 5-6)
- [ ] Backend: File CRUD operations
- [ ] API: `/code/files/*`
- [ ] Frontend: File tree + editor
- [ ] Frontend: File creation wizard

### Step 4: Project Templates (Week 7-8)
- [ ] Backend: Template system
- [ ] Backend: Template storage
- [ ] API: `/code/templates/*`
- [ ] Frontend: Template selector

### Step 5: Integration (Week 9-10)
- [ ] Integrate with Resonant Chat UI
- [ ] Add "Build Mode" toggle
- [ ] Project context in chat
- [ ] Testing & refinement

---

## Success Metrics

- Can generate a complete React app from scratch
- Can add features to existing projects
- Can scaffold from templates
- Files are syntactically correct
- Imports/dependencies are resolved
- User can download generated project

---

## Next Steps

1. **Review this roadmap** - Confirm priorities
2. **Backend team** - Implement project scanner & multi-file generator
3. **Frontend team** - Build project manager UI
4. **Integration** - Connect to Resonant Chat
5. **Testing** - Test with real projects

---

## Alternative: Quick Win Approach

If full implementation is too much, start with:

1. **Enhanced Code Generation** (2 weeks)
   - Improve `/code/generate` to handle project context
   - Add file path suggestions
   - Better code structure

2. **Project Context in Chat** (1 week)
   - Allow uploading project folder
   - Include project structure in context
   - Better code suggestions

3. **File Download** (1 week)
   - Generate code as downloadable files
   - ZIP export of generated project
   - Simple but effective

This gives 80% of value with 20% of effort.

