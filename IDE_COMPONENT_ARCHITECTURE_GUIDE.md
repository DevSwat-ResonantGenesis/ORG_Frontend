# 💻 IDE Component - Complete Architecture Guide

**Date:** 2025-12-01  
**Purpose:** Complete guide to understanding and modifying the IDE component in Resonant Chat

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Component Structure](#component-structure)
3. [File Organization](#file-organization)
4. [How IDE Mode Works](#how-ide-mode-works)
5. [Component Breakdown](#component-breakdown)
6. [Styling Architecture](#styling-architecture)
7. [How to Modify Each Element](#how-to-modify-each-element)
8. [Integration Points](#integration-points)
9. [API Integration](#api-integration)

---

## 🎯 Overview

The IDE component is a **full-featured code editor** integrated into Resonant Chat that allows users to:
- Upload and manage projects
- Edit files with Monaco Editor (VS Code engine)
- Use Git integration
- Execute code
- Perform advanced refactoring
- Browse file trees

**Key Technology:** Monaco Editor (same engine as VS Code)

---

## 🏗️ Component Structure

### **Main Component Hierarchy**

```
IDELayout.tsx (Main Component)
├── ideLayout (container)
│   ├── ideHeader
│   │   ├── headerLeft (title + project info)
│   │   └── headerRight (buttons: Refactor, Run, Git, Upload, Close)
│   │
│   └── ideContent
│       ├── fileTreeSidebar
│       │   ├── fileTreeHeader (Files + New File button)
│       │   └── fileTreeContent (file tree rendered recursively)
│       │
│       ├── editorArea
│       │   ├── editorTabs (multi-file tabs)
│       │   └── editorContainer
│       │       ├── editorToolbar (Save, Delete buttons)
│       │       └── Monaco Editor (lazy loaded)
│       │
│       ├── gitPanelWrapper (optional - GitPanel component)
│       └── executionPanelWrapper (optional - ExecutionPanel component)
│
└── RefactorDialog (modal - optional)
```

---

## 📁 File Organization

### **IDE Component Files**

```
src/components/IDE/
├── IDELayout.tsx              # Main IDE component (576 lines)
├── IDELayout.module.css       # IDE styles (472 lines)
├── GitPanel.tsx               # Git integration panel (332 lines)
├── GitPanel.module.css        # Git panel styles
├── ExecutionPanel.tsx         # Code execution panel (141 lines)
├── ExecutionPanel.module.css  # Execution panel styles
├── RefactorDialog.tsx         # Advanced refactoring dialog (182 lines)
└── RefactorDialog.module.css  # Refactor dialog styles
```

### **Integration Files**

```
src/pages/ResonantChat/
├── ResonantChatPage.tsx       # IDE mode integration (line 32, 179, 2178-2190)
└── ResonantChatPage-2025.module.css  # IDE wrapper styles

src/api/
└── code.ts                    # File operations API functions
```

---

## 🔄 How IDE Mode Works

### **1. Activation**

**From Chat Input:**
```typescript
// In ResonantChatPage.tsx (line 694-697)
const ideKeywords = ['open project', 'edit project', 'ide mode', 'open ide', 'load project'];
if (ideKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
  setIdeMode(true);
}
```

**From IDE Button:**
```typescript
// In ResonantChatPage.tsx (line 3036-3041)
<button onClick={() => {
  setIdeMode(true);
  setGeneratedProject(null);
  setBuildMode(false);
}}>
  IDE
</button>
```

### **2. State Management**

```typescript
// In ResonantChatPage.tsx
const [ideMode, setIdeMode] = useState(false);
const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
```

### **3. Rendering**

```tsx
// In ResonantChatPage.tsx (line 2178-2190)
{ideMode && (
  <div className={styles.ideWrapper}>
    <Suspense fallback={<div>Loading IDE...</div>}>
      <IDELayout
        projectId={currentProjectId || undefined}
        onClose={() => {
          setIdeMode(false);
          setCurrentProjectId(null);
        }}
        onProjectIdChange={(newProjectId) => {
          setCurrentProjectId(newProjectId);
        }}
      />
    </Suspense>
  </div>
)}
```

---

## 🧩 Component Breakdown

### **1. IDELayout.tsx (Main Component)**

**Location:** `src/components/IDE/IDELayout.tsx`

**Key State:**
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

**Key Functions:**
- `loadProjectFiles()` - Loads file list from backend
- `buildFileTree()` - Converts flat file list to tree structure
- `handleFileClick()` - Opens file in editor
- `handleFileChange()` - Handles editor content changes
- `handleSaveFile()` - Saves file to backend
- `handleDeleteFile()` - Deletes file
- `handleUploadProject()` - Uploads ZIP project
- `renderFileTree()` - Recursively renders file tree

**Monaco Editor Integration:**
```typescript
// Lazy loaded with fallback
const Editor = lazy(() => 
  import('@monaco-editor/react').catch(() => {
    // Fallback if not installed
  })
);

// Used with LSP providers
<Editor
  height="100%"
  language={getLanguageFromPath(activeFile)}
  value={openFiles.get(activeFile) || ''}
  onChange={(value) => handleFileChange(activeFile, value || '')}
  theme="vs-dark"
  options={{
    minimap: { enabled: true },
    fontSize: 14,
    wordWrap: 'on',
    // LSP features enabled
    quickSuggestions: true,
    semanticHighlighting: { enabled: true },
  }}
  onMount={(editor, monaco) => {
    // Register LSP completion provider
    // Register hover provider
  }}
/>
```

---

### **2. GitPanel.tsx**

**Location:** `src/components/IDE/GitPanel.tsx`

**Features:**
- Initialize git repository
- View git status
- Stage files
- Commit changes (with AI-generated messages)
- Branch management (create/switch)
- View commit history

**Key Functions:**
- `loadGitStatus()` - Gets git status
- `handleInitRepo()` - Initializes git repo
- `handleStageFiles()` - Stages all changes
- `handleCommit()` - Commits with message
- `handleCreateBranch()` - Creates new branch
- `handleSwitchBranch()` - Switches branch

---

### **3. ExecutionPanel.tsx**

**Location:** `src/components/IDE/ExecutionPanel.tsx`

**Features:**
- Execute code in Docker sandbox
- Provide stdin input
- View stdout/stderr output
- Show execution time and exit code

**Key Functions:**
- `handleExecute()` - Executes code via API
- `handleClear()` - Clears output

**Supported Languages:**
- Python, JavaScript, TypeScript, Java, Go, Rust, C/C++

---

### **4. RefactorDialog.tsx**

**Location:** `src/components/IDE/RefactorDialog.tsx`

**Features:**
- Multi-file refactoring
- Dependency tracking
- Validation
- Diff preview

**Key Functions:**
- `handleRefactor()` - Performs refactoring
- `handleApply()` - Applies refactored changes

---

## 🎨 Styling Architecture

### **IDELayout.module.css**

**Key CSS Classes:**

#### **1. Main Container**
```css
.ideLayout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
}
```

**To change:** Overall layout, background, dimensions

#### **2. Header**
```css
.ideHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-12) var(--space-20);
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}
```

**To change:** Header padding, background, border

#### **3. File Tree Sidebar**
```css
.fileTreeSidebar {
  width: 280px;
  min-width: 200px;
  border-right: 1px solid var(--border);
  background: var(--bg-secondary);
}
```

**To change:** Sidebar width, background, border

#### **4. File Tree Node**
```css
.fileTreeNode {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  padding: var(--space-6) var(--space-8);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.fileTreeNode.active {
  background: var(--color-primary-500);
  color: white;
}
```

**To change:** File item padding, active state color, hover effects

#### **5. Editor Tabs**
```css
.tab {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-8) var(--space-12);
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
}

.tab.activeTab {
  background: var(--bg-primary);
  border-bottom-color: var(--bg-primary);
}

.tab.unsavedTab {
  border-left: 2px solid var(--color-warning-500);
}
```

**To change:** Tab padding, active state, unsaved indicator

#### **6. Editor Toolbar**
```css
.editorToolbar {
  display: flex;
  gap: var(--space-8);
  padding: var(--space-8) var(--space-16);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}
```

**To change:** Toolbar padding, button spacing

#### **7. Buttons**
```css
.saveButton {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-6) var(--space-10);
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
}

.saveButton:hover:not(:disabled) {
  background: var(--color-primary-500);
  color: white;
}
```

**To change:** Button colors, padding, hover states

---

## 🔧 How to Modify Each Element

### **Method 1: Modify CSS Module**

**File:** `src/components/IDE/IDELayout.module.css`

**Example: Change sidebar width**
```css
/* Find this: */
.fileTreeSidebar {
  width: 280px; /* Current width */
}

/* Change to: */
.fileTreeSidebar {
  width: 320px; /* New width */
}
```

**Example: Change active file color**
```css
/* Find this: */
.fileTreeNode.active {
  background: var(--color-primary-500); /* Blue */
}

/* Change to: */
.fileTreeNode.active {
  background: var(--color-success); /* Green */
}
```

### **Method 2: Modify Component Logic**

**File:** `src/components/IDE/IDELayout.tsx`

**Example: Change default editor theme**
```typescript
// Find this (line 412):
theme="vs-dark"

// Change to:
theme="vs" // Light theme
```

**Example: Change editor font size**
```typescript
// Find this (line 415):
fontSize: 14,

// Change to:
fontSize: 16,
```

### **Method 3: Modify Design Tokens**

**File:** `src/theme/modules/tokens-2025.css`

**Example: Change primary color (affects active states)**
```css
--color-primary-500: #0ea5e9; /* Change this */
```

---

## 🔗 Integration Points

### **1. ResonantChatPage Integration**

**Location:** `src/pages/ResonantChat/ResonantChatPage.tsx`

**Key Integration Points:**

```typescript
// Line 32-44: Lazy load IDE component
const IDELayout = React.lazy(() => 
  import('@/components/IDE/IDELayout').then(module => ({ default: module.IDELayout }))
);

// Line 179: IDE mode state
const [ideMode, setIdeMode] = useState(false);

// Line 694-697: Auto-activate on keywords
const ideKeywords = ['open project', 'edit project', 'ide mode', 'open ide', 'load project'];

// Line 2178-2190: Render IDE when active
{ideMode && (
  <IDELayout
    projectId={currentProjectId || undefined}
    onClose={() => setIdeMode(false)}
    onProjectIdChange={(newProjectId) => setCurrentProjectId(newProjectId)}
  />
)}
```

### **2. API Integration**

**Location:** `src/api/code.ts`

**Key API Functions:**
```typescript
// File operations
uploadProject(file: File)
listProjectFiles(projectId?: string)
readProjectFile(filePath: string)
writeProjectFile(filePath: string, content: string, language?: string)
deleteProjectFile(filePath: string)

// Git operations
initGitRepo(projectId: string)
getGitStatus(projectId: string)
stageFiles(projectId: string)
commitChanges(projectId: string, message?: string, autoGenerate?: boolean)
manageBranch(projectId: string, branchName: string, create: boolean)
listBranches(projectId: string)
getCommitLog(projectId: string, limit: number)

// Code execution
executeCode(code: string, language: string, inputs?: string[])

// Refactoring
advancedRefactor(request: RefactorRequest)

// LSP features
getLSPCompletion(params)
getLSPHover(params)
getLSPDefinition(params)
getLSPReferences(params)
```

---

## 📊 Component State Flow

### **File Operations Flow**

```
User clicks file in tree
  ↓
handleFileClick(filePath)
  ↓
readProjectFile(filePath) [API call]
  ↓
Add to openFiles Map
  ↓
Set as activeFile
  ↓
Monaco Editor displays content
  ↓
User edits
  ↓
handleFileChange(filePath, newContent)
  ↓
Update openFiles Map
  ↓
Mark as unsaved (add to unsavedChanges Set)
  ↓
User clicks Save
  ↓
handleSaveFile(filePath)
  ↓
writeProjectFile(filePath, content) [API call]
  ↓
Remove from unsavedChanges Set
```

### **Project Upload Flow**

```
User clicks Upload Project
  ↓
Select ZIP file
  ↓
handleUploadProject(file)
  ↓
uploadProject(file) [API call]
  ↓
Backend extracts ZIP
  ↓
Backend indexes files
  ↓
Returns project_id
  ↓
onProjectIdChange(project_id)
  ↓
loadProjectFiles()
  ↓
File tree updates
```

---

## 🎨 Common Modifications

### **1. Change Sidebar Width**

**File:** `IDELayout.module.css`

```css
.fileTreeSidebar {
  width: 320px; /* Change from 280px */
}
```

### **2. Change Editor Theme**

**File:** `IDELayout.tsx`

```typescript
<Editor
  theme="vs" // Change from "vs-dark"
  // ...
/>
```

### **3. Change Tab Colors**

**File:** `IDELayout.module.css`

```css
.tab.activeTab {
  background: var(--color-primary-500); /* Change active tab background */
  color: white;
}

.tab.unsavedTab {
  border-left: 2px solid var(--color-warning); /* Change unsaved indicator */
}
```

### **4. Change File Tree Item Styling**

**File:** `IDELayout.module.css`

```css
.fileTreeNode {
  padding: var(--space-4) var(--space-6); /* Change padding */
  font-size: var(--font-13); /* Change font size */
}

.fileTreeNode:hover {
  background: var(--surface-hover); /* Change hover color */
}
```

### **5. Change Header Buttons**

**File:** `IDELayout.module.css`

```css
.refactorButton,
.execButton,
.gitButton,
.uploadButton {
  padding: var(--space-6) var(--space-10); /* Change button padding */
  font-size: var(--font-13); /* Change font size */
}
```

### **6. Change Monaco Editor Options**

**File:** `IDELayout.tsx`

```typescript
<Editor
  options={{
    minimap: { enabled: false }, // Disable minimap
    fontSize: 16, // Change font size
    wordWrap: 'off', // Disable word wrap
    lineNumbers: 'off', // Hide line numbers
    // Add more options
  }}
/>
```

---

## 📁 File Locations Summary

| Element | File | CSS Class / Function |
|---------|------|---------------------|
| **Main Container** | IDELayout.tsx | `ideLayout` |
| **Header** | IDELayout.module.css | `.ideHeader` |
| **File Tree** | IDELayout.tsx | `fileTreeSidebar` |
| **File Node** | IDELayout.module.css | `.fileTreeNode` |
| **Editor Tabs** | IDELayout.module.css | `.tab` |
| **Monaco Editor** | IDELayout.tsx | `<Editor />` component |
| **Save Button** | IDELayout.module.css | `.saveButton` |
| **Git Panel** | GitPanel.tsx | `<GitPanel />` |
| **Execution Panel** | ExecutionPanel.tsx | `<ExecutionPanel />` |
| **Refactor Dialog** | RefactorDialog.tsx | `<RefactorDialog />` |

---

## 🔍 Finding Elements Quickly

### **Search Strategy**

1. **Find component:**
   ```tsx
   // Search for: "IDELayout" or "ideMode"
   ```

2. **Find CSS class:**
   ```css
   // In IDELayout.module.css, search for:
   .fileTreeNode
   ```

3. **Find function:**
   ```typescript
   // In IDELayout.tsx, search for:
   handleFileClick
   ```

---

## ⚠️ Important Notes

1. **Lazy Loading:** IDE component is lazy-loaded to avoid blocking if Monaco Editor isn't installed
2. **Monaco Editor Required:** Must have `@monaco-editor/react` installed
3. **Project ID:** IDE requires a `projectId` to work (from upload or generation)
4. **File State:** Uses `Map<string, string>` for open files (path → content)
5. **Unsaved Changes:** Tracked in a `Set<string>` of file paths
6. **LSP Integration:** Monaco Editor has LSP providers registered for code intelligence
7. **Responsive:** File tree collapses on mobile (< 768px)

---

## 🚀 Quick Reference: Element → File → Location

| Element | File | Line/Class |
|---------|------|------------|
| IDE activation | ResonantChatPage.tsx | Line 694-697, 3036-3041 |
| IDE rendering | ResonantChatPage.tsx | Line 2178-2190 |
| Main container | IDELayout.tsx | Line 269, `.ideLayout` |
| File tree | IDELayout.tsx | Line 326, `.fileTreeSidebar` |
| File node | IDELayout.tsx | Line 228, `.fileTreeNode` |
| Editor tabs | IDELayout.tsx | Line 358, `.editorTabs` |
| Monaco Editor | IDELayout.tsx | Line 407, `<Editor />` |
| Save button | IDELayout.tsx | Line 392, `.saveButton` |
| Git panel | GitPanel.tsx | Line 22, `<GitPanel />` |
| Execution panel | ExecutionPanel.tsx | Line 12, `<ExecutionPanel />` |
| Refactor dialog | RefactorDialog.tsx | Line 15, `<RefactorDialog />` |

---

## 📖 Next Steps

1. **Understand the flow** - See how IDE mode activates and integrates
2. **Test modifications** - Try changing sidebar width or colors
3. **Add features** - Extend functionality as needed
4. **Check mobile** - Test responsive behavior

---

**End of Guide** 🎉

