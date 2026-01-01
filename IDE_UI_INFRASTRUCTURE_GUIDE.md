# 🎨 IDE UI Infrastructure - Complete Guide

**Date:** 2025-12-01  
**Purpose:** Complete guide to understanding and modifying the IDE frontend UI infrastructure

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

### **What is IDE UI Infrastructure?**

The IDE UI infrastructure is the **React + TypeScript frontend** that provides:
- **Monaco Editor**: VS Code-powered code editor
- **File Management**: Tree view, open/close files, save/delete
- **Git Integration**: Full version control UI
- **Code Execution**: Docker sandbox execution panel
- **Advanced Refactoring**: Multi-file refactoring dialog
- **LSP Integration**: Language Server Protocol features (completion, hover, definition)

### **Technology Stack**
- **Framework**: React 18 + TypeScript
- **Editor**: Monaco Editor (VS Code engine)
- **State**: React hooks (useState, useEffect)
- **API Client**: Axios (via `fastapiClient`)
- **Styling**: CSS Modules
- **Location**: `/Applications/ResonantGraphAI_FrontendV0.1/src/`

---

## 📁 File Structure

### **Component Files**

```
src/
├── components/IDE/
│   ├── IDELayout.tsx              # Main IDE component (578 lines)
│   ├── IDELayout.module.css       # Main IDE styles
│   ├── GitPanel.tsx               # Git operations panel (332 lines)
│   ├── GitPanel.module.css        # Git panel styles
│   ├── ExecutionPanel.tsx         # Code execution panel (141 lines)
│   ├── ExecutionPanel.module.css  # Execution panel styles
│   ├── RefactorDialog.tsx         # Advanced refactoring dialog (182 lines)
│   └── RefactorDialog.module.css  # Refactor dialog styles
├── api/
│   ├── code.ts                    # Code + Git API client (655 lines)
│   └── lsp.ts                     # LSP API client (113 lines)
└── pages/ResonantChat/
    └── ResonantChatPage.tsx       # IDE integration point
```

### **Key Files**

1. **IDELayout.tsx** - Main IDE component
2. **code.ts** - All code/git API functions
3. **lsp.ts** - LSP API functions
4. **GitPanel.tsx** - Git UI
5. **ExecutionPanel.tsx** - Code execution UI
6. **RefactorDialog.tsx** - Refactoring UI

---

## 🏗️ Component Architecture

### **1. IDELayout Component**

**Location:** `components/IDE/IDELayout.tsx`

**Purpose:** Main IDE container with file tree, editor, and panels

**Key Features:**
- File tree sidebar
- Monaco Editor with tabs
- Git panel integration
- Execution panel integration
- Refactor dialog integration
- File upload/download

**State Management:**
```typescript
const [files, setFiles] = useState<FileNode[]>([]);              // File tree
const [openFiles, setOpenFiles] = useState<Map<string, string>>(new Map()); // path -> content
const [activeFile, setActiveFile] = useState<string | null>(null);
const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
const [showGitPanel, setShowGitPanel] = useState(false);
const [showExecutionPanel, setShowExecutionPanel] = useState(false);
const [showRefactorDialog, setShowRefactorDialog] = useState(false);
```

**Key Methods:**
- `loadProjectFiles()` - Loads file list from backend
- `handleFileClick()` - Opens file in editor
- `handleFileChange()` - Tracks unsaved changes
- `handleSaveFile()` - Saves file to backend
- `handleDeleteFile()` - Deletes file
- `handleUploadProject()` - Uploads ZIP project

**Backend API Calls:**
- `listProjectFiles()` → `GET /code/project/files`
- `readProjectFile()` → `POST /code/project/file/read`
- `writeProjectFile()` → `POST /code/project/file/write`
- `deleteProjectFile()` → `POST /code/project/file/delete`
- `uploadProject()` → `POST /code/project/upload`

---

### **2. GitPanel Component**

**Location:** `components/IDE/GitPanel.tsx`

**Purpose:** Git operations UI (init, status, commit, branch)

**State Management:**
```typescript
const [status, setStatus] = useState<GitStatus | null>(null);
const [branches, setBranches] = useState<string[]>([]);
const [commits, setCommits] = useState<GitCommit[]>([]);
const [commitMessage, setCommitMessage] = useState('');
const [autoGenerateMessage, setAutoGenerateMessage] = useState(true);
const [newBranchName, setNewBranchName] = useState('');
```

**Key Methods:**
- `loadGitStatus()` - Loads git status
- `loadBranches()` - Loads branch list
- `loadCommitLog()` - Loads commit history
- `handleInitRepo()` - Initializes git repo
- `handleStageFiles()` - Stages files
- `handleCommit()` - Commits changes
- `handleCreateBranch()` - Creates new branch
- `handleSwitchBranch()` - Switches branch

**Backend API Calls:**
- `initGitRepo()` → `POST /git/init`
- `getGitStatus()` → `POST /git/status`
- `stageFiles()` → `POST /git/add`
- `commitChanges()` → `POST /git/commit`
- `manageBranch()` → `POST /git/branch`
- `listBranches()` → `GET /git/branches`
- `getCommitLog()` → `GET /git/log`

---

### **3. ExecutionPanel Component**

**Location:** `components/IDE/ExecutionPanel.tsx`

**Purpose:** Code execution UI with Docker sandbox

**State Management:**
```typescript
const [executing, setExecuting] = useState(false);
const [result, setResult] = useState<CodeExecutionResponse | null>(null);
const [inputs, setInputs] = useState('');
```

**Key Methods:**
- `handleExecute()` - Executes code
- `handleClear()` - Clears results

**Backend API Calls:**
- `executeCode()` → `POST /code/execute`

**Props:**
```typescript
interface ExecutionPanelProps {
  code: string;      // Code to execute
  language: string;  // Programming language
}
```

---

### **4. RefactorDialog Component**

**Location:** `components/IDE/RefactorDialog.tsx`

**Purpose:** Advanced multi-file refactoring dialog

**State Management:**
```typescript
const [refactorRequest, setRefactorRequest] = useState('');
const [refactoring, setRefactoring] = useState(false);
const [result, setResult] = useState<AdvancedRefactorResponse | null>(null);
```

**Key Methods:**
- `handleRefactor()` - Performs refactoring
- `handleApply()` - Applies refactored code

**Backend API Calls:**
- `advancedRefactor()` → `POST /code/refactor/advanced`

**Props:**
```typescript
interface RefactorDialogProps {
  projectId: string;
  files: Array<{ path: string; content: string; language: string }>;
  onClose: () => void;
  onRefactored: (result: AdvancedRefactorResponse) => void;
}
```

---

## 🔌 API Integration

### **API Client Structure**

**File:** `api/code.ts` (655 lines)

**Sections:**
1. **Code Operations** (Lines 1-223)
   - `completeCode()` - Code completion
   - `generateCode()` - Code generation
   - `refactorCode()` - Single-file refactoring
   - `indexCodebase()` - Code indexing
   - `searchCodebase()` - Hash Sphere search
   - `searchCodebaseML()` - ML embeddings search
   - `generateProject()` - Project generation

2. **File Operations** (Lines 242-377)
   - `listProjectFiles()` - List files
   - `readProjectFile()` - Read file
   - `writeProjectFile()` - Write file
   - `deleteProjectFile()` - Delete file
   - `uploadProject()` - Upload ZIP

3. **Git Operations** (Lines 380-549)
   - `initGitRepo()` - Initialize repo
   - `getGitStatus()` - Get status
   - `stageFiles()` - Stage files
   - `commitChanges()` - Commit
   - `manageBranch()` - Branch operations
   - `listBranches()` - List branches
   - `getCommitLog()` - Commit log

4. **Code Execution** (Lines 552-592)
   - `executeCode()` - Execute code

5. **Advanced Refactoring** (Lines 595-653)
   - `advancedRefactor()` - Multi-file refactoring

---

### **LSP API Client**

**File:** `api/lsp.ts` (113 lines)

**Functions:**
- `getLSPCompletion()` → `POST /code/lsp/completion`
- `getLSPDefinition()` → `POST /code/lsp/definition`
- `getLSPReferences()` → `POST /code/lsp/references`
- `getLSPHover()` → `POST /code/lsp/hover`

**Usage in IDELayout:**
```typescript
// Line 435-471: LSP Completion Provider
monaco.languages.registerCompletionItemProvider(language, {
  provideCompletionItems: async (model, position) => {
    const response = await getLSPCompletion({
      project_id: projectId,
      file_path: activeFile,
      language: language,
      line: position.lineNumber - 1,
      character: position.column - 1,
      content: model.getValue()
    });
    return { suggestions: ... };
  }
});

// Line 474-510: LSP Hover Provider
monaco.languages.registerHoverProvider(language, {
  provideHover: async (model, position) => {
    const response = await getLSPHover({...});
    return { contents: ... };
  }
});
```

---

## 📊 State Management

### **IDELayout State Flow**

```
User Action → State Update → API Call → State Update → UI Re-render
```

**Example: Save File**
```
1. User clicks "Save" button
   ↓
2. handleSaveFile(activeFile) called
   ↓
3. writeProjectFile(filePath, content) API call
   ↓
4. Backend: POST /code/project/file/write
   ↓
5. Response: { success: true, indexed: true }
   ↓
6. setUnsavedChanges() - Remove file from unsaved set
   ↓
7. loadProjectFiles() - Refresh file list
   ↓
8. UI updates (unsaved indicator removed)
```

**Example: Git Commit**
```
1. User clicks "Commit Changes"
   ↓
2. handleCommit() called
   ↓
3. commitChanges(projectId, message, autoGenerate) API call
   ↓
4. Backend: POST /git/commit
   ↓
5. Response: { success: true, message: "..." }
   ↓
6. loadGitStatus() - Refresh status
   ↓
7. loadCommitLog() - Refresh commit history
   ↓
8. UI updates (status cleared, new commit in log)
```

---

## 🔗 Backend → Frontend Mapping

### **Complete API Endpoint Mapping**

| Backend Endpoint | Frontend Function | Component | Line |
|-----------------|------------------|-----------|------|
| `POST /code/project/files` | `listProjectFiles()` | IDELayout | 67 |
| `POST /code/project/file/read` | `readProjectFile()` | IDELayout | 125 |
| `POST /code/project/file/write` | `writeProjectFile()` | IDELayout | 154 |
| `POST /code/project/file/delete` | `deleteProjectFile()` | IDELayout | 174 |
| `POST /code/project/upload` | `uploadProject()` | IDELayout | 196 |
| `POST /code/execute` | `executeCode()` | ExecutionPanel | 29 |
| `POST /git/init` | `initGitRepo()` | GitPanel | 69 |
| `POST /git/status` | `getGitStatus()` | GitPanel | 41 |
| `POST /git/add` | `stageFiles()` | GitPanel | 87 |
| `POST /git/commit` | `commitChanges()` | GitPanel | 109 |
| `POST /git/branch` | `manageBranch()` | GitPanel | 137, 156 |
| `GET /git/branches` | `listBranches()` | GitPanel | 50 |
| `GET /git/log` | `getCommitLog()` | GitPanel | 59 |
| `POST /code/refactor/advanced` | `advancedRefactor()` | RefactorDialog | 36 |
| `POST /code/lsp/completion` | `getLSPCompletion()` | IDELayout | 438 |
| `POST /code/lsp/hover` | `getLSPHover()` | IDELayout | 477 |

---

## 🔧 How to Modify Each Component

### **1. Change File Tree Display**

**File:** `components/IDE/IDELayout.tsx`

**Location:** Line 225-266 (`renderFileTree`)

**Current:**
```typescript
const renderFileTree = (nodes: FileNode[], level: number = 0): React.ReactNode => {
  return nodes.map(node => (
    <div key={node.path}>
      <div className={styles.fileTreeNode} ...>
        {node.type === 'folder' ? (
          <span className={styles.folderIcon}>
            {expandedFolders.has(node.path) ? '📂' : '📁'}
          </span>
        ) : (
          <FileIcon className={styles.fileIcon} />
        )}
        ...
      </div>
    </div>
  ));
};
```

**To modify:**
- Change folder icons: Line 248-250
- Change file icons: Line 252
- Change tree structure: Line 77-115 (`buildFileTree`)

---

### **2. Change Monaco Editor Configuration**

**File:** `components/IDE/IDELayout.tsx`

**Location:** Line 413-428

**Current:**
```typescript
options={{
  minimap: { enabled: true },
  fontSize: 14,
  wordWrap: 'on',
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  quickSuggestions: true,
  // ...
}}
```

**To modify:**
```typescript
options={{
  minimap: { enabled: false },  // Disable minimap
  fontSize: 16,                  // Larger font
  wordWrap: 'off',               // No word wrap
  tabSize: 4,                    // 4 spaces
  // ...
}}
```

---

### **3. Change LSP Integration**

**File:** `components/IDE/IDELayout.tsx`

**Location:** Line 435-511

**To add new LSP feature (e.g., Go to Definition):**
```typescript
// Add after hover provider (Line 510)
editor.addAction({
  id: 'go-to-definition',
  label: 'Go to Definition',
  keybindings: [
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.F12
  ],
  run: async (editor) => {
    const position = editor.getPosition();
    if (!position) return;
    
    const { getLSPDefinition } = await import('@/api/lsp');
    const response = await getLSPDefinition({
      project_id: projectId,
      file_path: activeFile,
      language: getLanguageFromPath(activeFile),
      line: position.lineNumber - 1,
      character: position.column - 1,
      content: editor.getValue()
    });
    
    if (response.definition) {
      // Navigate to definition
      // Implementation depends on your navigation system
    }
  }
});
```

---

### **4. Change Git Panel Layout**

**File:** `components/IDE/GitPanel.tsx`

**Location:** Line 191-328

**To reorder sections:**
```typescript
// Current order:
// 1. Branch Info (Line 204)
// 2. Status (Line 241)
// 3. Commit (Line 267)
// 4. Commit History (Line 300)

// Change to:
// 1. Status
// 2. Commit
// 3. Branch Info
// 4. Commit History
```

**To add new section:**
```typescript
{/* New Section */}
<div className={styles.section}>
  <div className={styles.sectionHeader}>
    <span>Remote Repositories</span>
  </div>
  {/* Your UI here */}
</div>
```

---

### **5. Change Execution Panel Output Display**

**File:** `components/IDE/ExecutionPanel.tsx`

**Location:** Line 94-118

**Current:**
```typescript
{result.success ? (
  <pre className={styles.outputArea}>
    <code>{result.output || '(no output)'}</code>
  </pre>
) : (
  <pre className={styles.errorArea}>
    <code>{result.error || 'Unknown error'}</code>
  </pre>
)}
```

**To modify:**
```typescript
{result.success ? (
  <div className={styles.outputArea}>
    <SyntaxHighlighter language={language}>
      {result.output || '(no output)'}
    </SyntaxHighlighter>
  </div>
) : (
  <div className={styles.errorArea}>
    <ErrorIcon />
    <code>{result.error || 'Unknown error'}</code>
  </div>
)}
```

---

### **6. Change Refactor Dialog Results Display**

**File:** `components/IDE/RefactorDialog.tsx`

**Location:** Line 85-154

**To add diff viewer:**
```typescript
import { DiffViewer } from '@/components/DiffViewer';

// In results section (Line 89):
{result.files.map((file, idx) => (
  <div key={idx} className={styles.fileItem}>
    <div className={styles.fileHeader}>
      <span>{file.path}</span>
      <button onClick={() => handleApply(file.path, file.refactored)}>
        Apply
      </button>
    </div>
    <DiffViewer
      original={file.original}
      modified={file.refactored}
      language={files.find(f => f.path === file.path)?.language}
    />
  </div>
))}
```

---

### **7. Add New API Function**

**File:** `api/code.ts`

**Example: Add code review function:**
```typescript
/**
 * Review code
 * POST /code/review
 */
export const reviewCode = async (
  code: string,
  language: string,
  filePath?: string
): Promise<CodeReviewResponse> => {
  try {
    const response = await fastapiClient.post('/code/review', {
      code,
      language,
      file_path: filePath
    });
    return response.data;
  } catch (error) {
    logger.error('Code review error', error);
    throw error;
  }
};
```

**Then use in component:**
```typescript
// In IDELayout.tsx
const handleReviewCode = async () => {
  const content = openFiles.get(activeFile);
  if (!content) return;
  
  const review = await reviewCode(
    content,
    getLanguageFromPath(activeFile),
    activeFile
  );
  
  // Display review results
  console.log(review.suggestions);
};
```

---

### **8. Change File Upload Behavior**

**File:** `components/IDE/IDELayout.tsx`

**Location:** Line 193-209

**Current:**
```typescript
const handleUploadProject = async (file: File) => {
  setLoading(true);
  try {
    const response = await uploadProject(file);
    if (response.project_id) {
      if (onProjectIdChange) {
        onProjectIdChange(response.project_id);
      }
      await loadProjectFiles();
    }
  } catch (error) {
    logger.error('Failed to upload project', error);
  } finally {
    setLoading(false);
  }
};
```

**To add progress tracking:**
```typescript
const handleUploadProject = async (file: File) => {
  setLoading(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  try {
    const response = await uploadProject(file, {
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percent);
      }
    });
    // ...
  } finally {
    setLoading(false);
  }
};
```

---

## 🎨 Styling Architecture

### **CSS Modules Structure**

**File:** `components/IDE/IDELayout.module.css`

**Key Classes:**
- `.ideLayout` - Main container
- `.ideHeader` - Header bar
- `.fileTreeSidebar` - File tree container
- `.editorArea` - Editor container
- `.editorTabs` - File tabs
- `.editorContainer` - Monaco editor wrapper

**Design Tokens Used:**
```css
.ideLayout {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: var(--space-12);
  border-radius: var(--radius-md);
}
```

**To modify styles:**
1. Edit CSS module file
2. Use design tokens from `tokens-2025.css`
3. Follow BEM naming convention

---

### **Component-Specific Styles**

**GitPanel.module.css:**
- `.gitPanel` - Main panel
- `.section` - Section container
- `.fileList` - Changed files list
- `.commitControls` - Commit input area

**ExecutionPanel.module.css:**
- `.executionPanel` - Main panel
- `.outputArea` - Output display
- `.errorArea` - Error display
- `.executingState` - Loading state

**RefactorDialog.module.css:**
- `.overlay` - Modal overlay
- `.dialog` - Dialog container
- `.fileList` - Refactored files list
- `.diffPreview` - Diff preview

---

## 🔗 Integration Points

### **1. ResonantChatPage Integration**

**File:** `pages/ResonantChat/ResonantChatPage.tsx`

**Location:** Line 32-42 (Lazy loading)

```typescript
const IDELayout = React.lazy(() => 
  import('@/components/IDE/IDELayout').then(module => ({ default: module.IDELayout }))
  .catch(() => ({
    default: () => (
      <div>IDE Not Available</div>
    )
  }))
);
```

**Usage:**
```typescript
{ideMode && (
  <Suspense fallback={<div>Loading IDE...</div>}>
    <IDELayout
      projectId={currentProjectId}
      onClose={() => setIdeMode(false)}
      onProjectIdChange={(id) => setCurrentProjectId(id)}
    />
  </Suspense>
)}
```

**To modify:**
- Change lazy loading: Line 32
- Change props: Line 179 (ideMode state)

---

### **2. API Client Integration**

**File:** `api/fastapiClient.ts`

**Base Configuration:**
```typescript
import axios from 'axios';

const fastapiClient = axios.create({
  baseURL: import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**To modify:**
- Change base URL: Environment variable
- Add interceptors: For auth, error handling
- Add request/response transformers

---

### **3. Toast Context Integration**

**File:** `context/ToastContext.tsx`

**Usage in components:**
```typescript
import { useToastContext } from '@/context/ToastContext';

const { success, error: showError } = useToastContext();

// Show success
success('File saved successfully');

// Show error
showError('Failed to save file');
```

---

## 📊 Component Data Flow

### **File Save Flow**

```
User edits code in Monaco Editor
  ↓
handleFileChange() - Updates openFiles state
  ↓
Unsaved indicator appears (●)
  ↓
User clicks "Save" button
  ↓
handleSaveFile() called
  ↓
writeProjectFile() API call
  ↓
POST /code/project/file/write
  ↓
Backend saves and indexes file
  ↓
Response: { success: true, indexed: true }
  ↓
setUnsavedChanges() - Remove from unsaved set
  ↓
loadProjectFiles() - Refresh file list
  ↓
UI updates (unsaved indicator removed)
```

### **Git Commit Flow**

```
User makes changes in editor
  ↓
Files marked as modified in git status
  ↓
User clicks "Stage All"
  ↓
handleStageFiles() → stageFiles() API
  ↓
POST /git/add
  ↓
User enters commit message (or auto-generate)
  ↓
User clicks "Commit Changes"
  ↓
handleCommit() → commitChanges() API
  ↓
POST /git/commit
  ↓
Backend generates commit message (if auto)
  ↓
Backend commits changes
  ↓
Response: { success: true, message: "..." }
  ↓
loadGitStatus() - Refresh status
  ↓
loadCommitLog() - Add new commit to history
  ↓
UI updates (status cleared, commit in log)
```

### **Code Execution Flow**

```
User writes code in editor
  ↓
User clicks "Run" button
  ↓
ExecutionPanel receives code + language
  ↓
User enters stdin (optional)
  ↓
User clicks "▶ Run"
  ↓
handleExecute() → executeCode() API
  ↓
POST /code/execute
  ↓
Backend creates Docker container
  ↓
Backend executes code in sandbox
  ↓
Backend captures stdout/stderr
  ↓
Response: { success: true, output: "...", execution_time: 0.15 }
  ↓
setResult() - Update state
  ↓
UI displays output/error
```

---

## 🚀 Quick Reference

### **Component → API → Backend Endpoint**

| Component | Method | API Function | Backend Endpoint |
|-----------|--------|--------------|-----------------|
| IDELayout | `loadProjectFiles()` | `listProjectFiles()` | `GET /code/project/files` |
| IDELayout | `handleFileClick()` | `readProjectFile()` | `POST /code/project/file/read` |
| IDELayout | `handleSaveFile()` | `writeProjectFile()` | `POST /code/project/file/write` |
| IDELayout | `handleDeleteFile()` | `deleteProjectFile()` | `POST /code/project/file/delete` |
| IDELayout | `handleUploadProject()` | `uploadProject()` | `POST /code/project/upload` |
| IDELayout | LSP Completion | `getLSPCompletion()` | `POST /code/lsp/completion` |
| IDELayout | LSP Hover | `getLSPHover()` | `POST /code/lsp/hover` |
| GitPanel | `loadGitStatus()` | `getGitStatus()` | `POST /git/status` |
| GitPanel | `handleInitRepo()` | `initGitRepo()` | `POST /git/init` |
| GitPanel | `handleStageFiles()` | `stageFiles()` | `POST /git/add` |
| GitPanel | `handleCommit()` | `commitChanges()` | `POST /git/commit` |
| GitPanel | `handleCreateBranch()` | `manageBranch()` | `POST /git/branch` |
| GitPanel | `loadBranches()` | `listBranches()` | `GET /git/branches` |
| GitPanel | `loadCommitLog()` | `getCommitLog()` | `GET /git/log` |
| ExecutionPanel | `handleExecute()` | `executeCode()` | `POST /code/execute` |
| RefactorDialog | `handleRefactor()` | `advancedRefactor()` | `POST /code/refactor/advanced` |

---

## ⚠️ Important Notes

1. **Monaco Editor**: Lazy loaded, fallback if not installed
2. **File Content**: Currently stored in memory (Map), not persisted
3. **Project Storage**: Backend stores in temp directory
4. **LSP Integration**: Requires LSP servers installed on backend
5. **Code Execution**: Requires Docker on backend
6. **Git Operations**: Requires git installed on backend
7. **State Management**: Uses React hooks, no global state
8. **Error Handling**: Uses toast notifications via `useToastContext`

---

## 🔍 Debugging Tips

### **Check API Calls**

```typescript
// Add to api/code.ts
fastapiClient.interceptors.request.use(request => {
  console.log('API Request:', request.method, request.url, request.data);
  return request;
});

fastapiClient.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

### **Check Component State**

```typescript
// Add to IDELayout.tsx
useEffect(() => {
  console.log('Open files:', Array.from(openFiles.keys()));
  console.log('Active file:', activeFile);
  console.log('Unsaved changes:', Array.from(unsavedChanges));
}, [openFiles, activeFile, unsavedChanges]);
```

---

**End of Guide** 🎉

