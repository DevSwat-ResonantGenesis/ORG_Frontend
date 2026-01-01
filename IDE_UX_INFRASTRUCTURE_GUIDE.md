# 💻 IDE UX Infrastructure - Complete Guide

**Date:** 2025-12-01  
**Purpose:** Complete guide to user experience flows, interaction patterns, and UX architecture for the IDE

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Personas & Use Cases](#user-personas--use-cases)
3. [Core User Journeys](#core-user-journeys)
4. [Interaction Patterns](#interaction-patterns)
5. [User Flows](#user-flows)
6. [Feedback & Loading States](#feedback--loading-states)
7. [Error Handling UX](#error-handling-ux)
8. [Accessibility](#accessibility)
9. [Responsive Design](#responsive-design)
10. [Progressive Enhancement](#progressive-enhancement)

---

## 🎯 Overview

### **What is IDE UX Infrastructure?**

The IDE UX infrastructure defines how users **interact with and experience** the integrated development environment, covering:
- **User Journeys**: Complete paths from project upload to code execution
- **Interaction Patterns**: How users interact with editor, file tree, and panels
- **Feedback Mechanisms**: Loading, success, error states
- **Accessibility**: Inclusive design patterns
- **Responsive Design**: Mobile and desktop experiences
- **Workflow Integration**: How IDE integrates with Resonant Chat

### **UX Principles**
1. **Familiar**: VS Code-like experience (Monaco Editor)
2. **Efficient**: Quick file navigation and editing
3. **Transparent**: Clear feedback on all operations
4. **Accessible**: Keyboard shortcuts and screen reader support
5. **Integrated**: Seamless with Resonant Chat
6. **Progressive**: Enhanced features for logged-in users

---

## 👥 User Personas & Use Cases

### **Persona 1: Quick Editor**

**Characteristics:**
- Needs to edit code quickly
- Single file focus
- Minimal setup

**Use Cases:**
1. **Quick Edit**: Edit a single file
2. **Code Review**: Review generated code
3. **Quick Fix**: Fix a bug in existing code

**UX Flow:**
```
Upload Project → Open File → Edit → Save → Done
```

**Features Used:**
- File tree
- Monaco Editor
- Save functionality
- Basic LSP (completion, hover)

---

### **Persona 2: Full Developer**

**Characteristics:**
- Multi-file projects
- Git version control
- Code execution
- Advanced refactoring

**Use Cases:**
1. **Project Development**: Full project editing
2. **Code Execution**: Test code in sandbox
3. **Git Workflow**: Version control operations
4. **Refactoring**: Multi-file refactoring

**UX Flow:**
```
Upload Project → Edit Files → Execute Code → Git Commit → Refactor → Save
```

**Features Used:**
- All IDE features
- Git panel
- Execution panel
- Refactor dialog
- LSP features

---

### **Persona 3: Code Generator**

**Characteristics:**
- Generates projects from chat
- Reviews generated code
- Downloads projects

**Use Cases:**
1. **Project Generation**: Generate from description
2. **Code Review**: Review generated code
3. **Download**: Download as ZIP

**UX Flow:**
```
Chat: "Build React app" → Project Generated → Review in IDE → Download
```

**Features Used:**
- Project generation
- File preview
- Download functionality

---

## 🗺️ Core User Journeys

### **Journey 1: Upload and Edit Project**

**Goal:** Upload a project and edit files

**Steps:**
1. **Entry** (0s)
   - User activates IDE mode from chat
   - IDE layout appears
   - Empty state shown

2. **Upload** (5-30s)
   - User clicks "Upload Project"
   - File picker opens
   - User selects ZIP file
   - Upload progress shown

3. **Processing** (2-10s)
   - Backend extracts ZIP
   - Files indexed
   - File tree builds
   - Loading indicator

4. **File Tree Display** (instant)
   - File tree appears
   - Folders expandable
   - Files clickable
   - Project structure visible

5. **Open File** (1-2s)
   - User clicks file
   - File opens in editor
   - Tab appears
   - Syntax highlighting active

6. **Edit** (30s-30min)
   - User edits code
   - Unsaved indicator appears
   - LSP features active
   - Auto-completion works

7. **Save** (1-2s)
   - User clicks Save
   - File saved to backend
   - Unsaved indicator clears
   - Success feedback

**UX Elements:**
- ✅ Clear upload button
- ✅ Progress indicator
- ✅ File tree navigation
- ✅ Unsaved changes indicator
- ✅ Save feedback

---

### **Journey 2: Code Execution**

**Goal:** Execute code and see results

**Steps:**
1. **Open File** (5s)
   - User opens code file
   - Code visible in editor

2. **Activate Execution** (2s)
   - User clicks "Run" button
   - Execution panel opens
   - Code extracted

3. **Prepare Execution** (1s)
   - Code sent to backend
   - Docker container prepared
   - Input fields shown (if needed)

4. **Execute** (2-30s)
   - Code runs in sandbox
   - Progress indicator
   - "Executing..." message

5. **View Results** (instant)
   - Output displayed
   - Errors shown (if any)
   - Execution time shown
   - Exit code displayed

6. **Iterate** (optional)
   - User edits code
   - Re-runs
   - Compares results

**UX Elements:**
- ✅ Clear Run button
- ✅ Execution panel
- ✅ Output/error display
- ✅ Execution time
- ✅ Re-run capability

---

### **Journey 3: Git Workflow**

**Goal:** Version control operations

**Steps:**
1. **Initialize** (5s)
   - User clicks "Git" button
   - Git panel opens
   - "Initialize Repository" shown (if not initialized)

2. **Check Status** (1s)
   - User views git status
   - Changed files listed
   - Status badges shown

3. **Stage Files** (2s)
   - User clicks "Stage All"
   - Files staged
   - Status updates

4. **Commit** (3-10s)
   - User enters commit message (or auto-generate)
   - Clicks "Commit Changes"
   - AI generates message (if enabled)
   - Commit created

5. **View History** (instant)
   - Commit log displayed
   - Recent commits shown
   - Commit details visible

**UX Elements:**
- ✅ Git panel toggle
- ✅ Status display
- ✅ Staging interface
- ✅ Commit interface
- ✅ History view

---

### **Journey 4: Advanced Refactoring**

**Goal:** Refactor multiple files

**Steps:**
1. **Open Files** (10s)
   - User opens multiple files
   - Files edited
   - Context ready

2. **Initiate Refactoring** (5s)
   - User clicks "Refactor" button
   - Refactor dialog opens
   - Files listed

3. **Enter Request** (30s)
   - User types refactoring request
   - Natural language description
   - Context provided

4. **Refactoring** (10-60s)
   - Backend analyzes files
   - Dependency graph built
   - Refactored code generated
   - Validation performed

5. **Review Results** (30s-5min)
   - Refactored files shown
   - Diffs displayed
   - Validation issues listed
   - Dependency changes shown

6. **Apply Changes** (5s)
   - User reviews each file
   - Clicks "Apply" on desired files
   - Changes applied
   - Files updated

**UX Elements:**
- ✅ Refactor button
- ✅ Refactor dialog
- ✅ Diff preview
- ✅ Validation display
- ✅ Apply controls

---

### **Journey 5: LSP Features**

**Goal:** Use Language Server Protocol features

**Steps:**
1. **Open File** (5s)
   - User opens code file
   - LSP server starts (if needed)

2. **Code Completion** (instant)
   - User types code
   - Completion suggestions appear
   - User selects suggestion
   - Code inserted

3. **Hover Information** (instant)
   - User hovers over symbol
   - Tooltip appears
   - Type information shown
   - Documentation displayed

4. **Go to Definition** (1-2s)
   - User right-clicks symbol
   - Selects "Go to Definition"
   - Definition location shown
   - File opens (if different file)

5. **Find References** (1-2s)
   - User right-clicks symbol
   - Selects "Find References"
   - All references listed
   - Can navigate to each

**UX Elements:**
- ✅ Completion dropdown
- ✅ Hover tooltips
- ✅ Context menu
- ✅ Navigation indicators

---

## 🎮 Interaction Patterns

### **1. File Tree Navigation Pattern**

**Location:** File tree sidebar

**Interactions:**
- **Click File**: Opens file in editor
- **Click Folder**: Expands/collapses folder
- **Right-click**: Context menu (create, delete, rename)
- **Drag & Drop**: Reorder files (future)

**Visual Feedback:**
- Active file highlight
- Expanded folder icon
- Collapsed folder icon
- Unsaved indicator (●)
- Loading state

**Code Location:** `IDELayout.tsx:225-266`

---

### **2. Editor Interaction Pattern**

**Location:** Monaco Editor

**Interactions:**
- **Type**: Code input
- **Ctrl/Cmd+F**: Find
- **Ctrl/Cmd+H**: Replace
- **Ctrl/Cmd+/**: Comment toggle
- **Tab**: Indent
- **Shift+Tab**: Unindent
- **Ctrl/Cmd+S**: Save
- **Ctrl/Cmd+Z**: Undo
- **Ctrl/Cmd+Y**: Redo

**Visual Feedback:**
- Syntax highlighting
- Line numbers
- Error/warning squiggles
- Selection highlight
- Cursor position

**Code Location:** `IDELayout.tsx:405-513`

---

### **3. Tab Management Pattern**

**Location:** Editor tabs

**Interactions:**
- **Click Tab**: Switch to file
- **Click X**: Close file
- **Middle-click**: Close file
- **Ctrl/Cmd+W**: Close active tab
- **Ctrl/Cmd+Tab**: Switch between tabs

**Visual Feedback:**
- Active tab highlight
- Unsaved tab indicator (●)
- Hover state
- Close button on hover

**Code Location:** `IDELayout.tsx:358-384`

---

### **4. Save Pattern**

**Location:** Save button

**Interactions:**
- **Click Save**: Saves file
- **Ctrl/Cmd+S**: Keyboard shortcut
- **Auto-save**: (if enabled)

**Visual Feedback:**
- Button enabled/disabled state
- Loading spinner during save
- Success feedback
- Unsaved indicator clears

**Code Location:** `IDELayout.tsx:148-167`

---

### **5. Git Panel Pattern**

**Location:** Git panel

**Interactions:**
- **Click Git Button**: Toggle panel
- **Click Stage**: Stage files
- **Click Commit**: Commit changes
- **Click Branch**: Switch branch
- **Click Init**: Initialize repo

**Visual Feedback:**
- Panel slide animation
- Status badges
- Branch indicator
- Commit log display

**Code Location:** `GitPanel.tsx:21-330`

---

### **6. Execution Panel Pattern**

**Location:** Execution panel

**Interactions:**
- **Click Run**: Execute code
- **Enter Input**: Provide stdin
- **Click Clear**: Clear output
- **View Output**: Scroll output

**Visual Feedback:**
- Execution button state
- Loading spinner
- Output/error display
- Execution time
- Exit code

**Code Location:** `ExecutionPanel.tsx:18-50`

---

### **7. Refactor Dialog Pattern**

**Location:** Refactor dialog modal

**Interactions:**
- **Click Refactor**: Open dialog
- **Type Request**: Enter refactoring request
- **Click Refactor Button**: Start refactoring
- **Review Results**: View diffs
- **Click Apply**: Apply changes
- **Click Cancel**: Close dialog

**Visual Feedback:**
- Modal overlay
- Loading state
- Diff preview
- Validation issues
- Apply buttons

**Code Location:** `RefactorDialog.tsx:26-51`

---

### **8. LSP Completion Pattern**

**Location:** Monaco Editor

**Interactions:**
- **Type**: Triggers completion
- **Arrow Keys**: Navigate suggestions
- **Enter/Tab**: Accept suggestion
- **Escape**: Dismiss completion

**Visual Feedback:**
- Completion dropdown
- Selected item highlight
- Type information
- Documentation preview

**Code Location:** `IDELayout.tsx:435-471`

---

## 🔄 User Flows

### **Flow 1: File Edit Flow**

```
User Action: Clicks file in tree
  ↓
[UX] File highlights
[UX] Loading indicator on file
  ↓
[Backend] POST /code/project/file/read
  ↓
[Backend] Returns file content
  ↓
[UX] File opens in editor
[UX] Tab appears
[UX] Syntax highlighting active
[UX] LSP features activate
  ↓
User Action: Edits code
  ↓
[UX] Unsaved indicator appears (●)
[UX] Tab shows unsaved dot
[UX] Save button enabled
  ↓
User Action: Clicks Save or Ctrl+S
  ↓
[UX] Save button shows loading
[UX] "Saving..." indicator
  ↓
[Backend] POST /code/project/file/write
[Backend] Indexes file
[Backend] Creates Hash Sphere anchor
  ↓
[UX] Unsaved indicator clears
[UX] Success feedback
[UX] File list refreshes
```

**UX Touchpoints:**
1. **File Selection**: Clear highlight
2. **Loading**: File loading indicator
3. **Editor**: Smooth file opening
4. **Unsaved State**: Clear visual indicator
5. **Save Feedback**: Loading and success states

---

### **Flow 2: Code Execution Flow**

```
User Action: Opens code file
  ↓
[UX] File opens in editor
[UX] Code visible
  ↓
User Action: Clicks "Run" button
  ↓
[UX] Execution panel opens
[UX] Code extracted
[UX] Language detected
[UX] Input field shown (if needed)
  ↓
User Action: (Optional) Enters stdin input
  ↓
User Action: Clicks "▶ Run"
  ↓
[UX] Run button shows loading
[UX] "Executing..." message
[UX] Spinner shown
  ↓
[Backend] POST /code/execute
[Backend] Creates Docker container
[Backend] Executes code
[Backend] Captures output
  ↓
[UX] Output appears
[UX] Execution time shown
[UX] Exit code displayed
[UX] Success/error styling
  ↓
User can: Re-run, Clear, Edit code
```

**UX Touchpoints:**
1. **Run Button**: Clear, accessible
2. **Execution State**: Clear progress indication
3. **Output Display**: Readable, scrollable
4. **Error Display**: Clear error messages
5. **Re-run**: Easy to iterate

---

### **Flow 3: Git Commit Flow**

```
User Action: Makes changes in editor
  ↓
[UX] Files marked as modified
[UX] Git status updates
  ↓
User Action: Clicks "Git" button
  ↓
[UX] Git panel opens
[UX] Status displayed
[UX] Changed files listed
  ↓
User Action: Clicks "Stage All"
  ↓
[UX] Files staged
[UX] Status updates
[UX] Success feedback
  ↓
[Backend] POST /git/add
  ↓
User Action: Enters commit message (or auto-generate)
  ↓
User Action: Clicks "Commit Changes"
  ↓
[UX] Commit button shows loading
[UX] "Committing..." message
  ↓
[Backend] POST /git/commit
[Backend] Generates commit message (if auto)
[Backend] Creates commit
  ↓
[UX] Commit success
[UX] Status cleared
[UX] Commit log updated
[UX] New commit appears in history
```

**UX Touchpoints:**
1. **Status Display**: Clear file status
2. **Staging**: Easy staging interface
3. **Commit**: Clear commit interface
4. **Auto-generate**: Helpful AI messages
5. **History**: Easy to view commits

---

### **Flow 4: Advanced Refactoring Flow**

```
User Action: Opens multiple files
  ↓
[UX] Files open in tabs
[UX] Context ready
  ↓
User Action: Clicks "Refactor" button
  ↓
[UX] Refactor dialog opens
[UX] Files listed
[UX] Request input shown
  ↓
User Action: Types refactoring request
  ↓
User Action: Clicks "Refactor" button
  ↓
[UX] Refactoring button shows loading
[UX] "Refactoring files..." message
[UX] Progress indicator
  ↓
[Backend] POST /code/refactor/advanced
[Backend] Parses all files
[Backend] Builds dependency graph
[Backend] Generates refactored code
[Backend] Validates changes
[Backend] Analyzes dependencies
  ↓
[UX] Results displayed
[UX] Refactored files shown
[UX] Diffs previewed
[UX] Validation issues listed
[UX] Dependency changes shown
  ↓
User Action: Reviews and clicks "Apply"
  ↓
[UX] Changes applied to files
[UX] Files updated in editor
[UX] Unsaved indicators appear
[UX] Success feedback
```

**UX Touchpoints:**
1. **Dialog**: Clear, accessible
2. **Progress**: Transparent refactoring progress
3. **Results**: Easy to review
4. **Diff Preview**: Clear change visualization
5. **Apply**: Selective application

---

### **Flow 5: Project Upload Flow**

```
User Action: Clicks "Upload Project"
  ↓
[UX] File picker opens
[UX] ZIP files filter
  ↓
User Action: Selects ZIP file
  ↓
[UX] Upload starts
[UX] Progress indicator
[UX] "Uploading..." message
  ↓
[Backend] POST /code/project/upload
[Backend] Extracts ZIP
[Backend] Indexes files
[Backend] Creates project structure
  ↓
[UX] Upload complete
[UX] File tree appears
[UX] Files listed
[UX] First file auto-selected (optional)
[UX] Success feedback
  ↓
User can: Browse files, Edit, Execute
```

**UX Touchpoints:**
1. **Upload Trigger**: Clear button
2. **Progress**: Upload progress indicator
3. **Completion**: Clear success state
4. **File Tree**: Immediate file tree display

---

### **Flow 6: LSP Completion Flow**

```
User Action: Types code in editor
  ↓
[UX] Monaco Editor detects typing
[UX] Triggers completion request
  ↓
[Backend] POST /code/lsp/completion
[Backend] LSP server processes
[Backend] Returns completions
  ↓
[UX] Completion dropdown appears
[UX] Suggestions listed
[UX] First item selected
[UX] Type information shown
  ↓
User Action: Uses arrow keys or clicks
  ↓
[UX] Selection moves
[UX] Documentation updates
  ↓
User Action: Presses Enter or Tab
  ↓
[UX] Completion inserted
[UX] Dropdown closes
[UX] Cursor moves
```

**UX Touchpoints:**
1. **Trigger**: Fast, responsive
2. **Dropdown**: Clear, readable
3. **Navigation**: Keyboard accessible
4. **Documentation**: Helpful information

---

## 💬 Feedback & Loading States

### **1. File Operations States**

**State: Loading Files**
- Skeleton loader in file tree
- "Loading files..." message
- Disabled interactions

**State: File Opening**
- Loading indicator on file
- "Opening..." message
- Editor shows loading

**State: File Saving**
- Save button spinner
- "Saving..." text
- Unsaved indicator persists

**State: File Saved**
- Unsaved indicator clears
- Success toast
- File list refreshes

**Code Location:** `IDELayout.tsx:64-75, 148-167`

---

### **2. Code Execution States**

**State: Idle**
- Run button enabled
- No output shown
- Input field available

**State: Executing**
- Run button shows spinner
- "Executing..." message
- Output area shows loading
- Input disabled

**State: Complete**
- Output displayed
- Execution time shown
- Exit code shown
- Run button enabled

**State: Error**
- Error message displayed
- Error styling
- Exit code shown
- Run button enabled

**Code Location:** `ExecutionPanel.tsx:18-50`

---

### **3. Git Operations States**

**State: Loading Status**
- Git panel shows loading
- "Loading status..." message

**State: Staging**
- Stage button shows loading
- "Staging files..." message

**State: Committing**
- Commit button shows loading
- "Committing..." message
- "Generating message..." (if auto)

**State: Complete**
- Status refreshed
- Commit log updated
- Success feedback

**Code Location:** `GitPanel.tsx:39-169`

---

### **4. Refactoring States**

**State: Idle**
- Refactor button enabled
- Dialog closed

**State: Refactoring**
- Refactor button shows loading
- "Refactoring files..." message
- Progress indicator
- Dialog shows loading

**State: Results**
- Results displayed
- Diffs shown
- Validation displayed
- Apply buttons enabled

**Code Location:** `RefactorDialog.tsx:26-51`

---

### **5. LSP States**

**State: Loading Completion**
- Completion dropdown shows loading
- "Loading..." message

**State: Completion Ready**
- Suggestions appear
- Type information shown
- Documentation available

**State: Error**
- Completion fails silently
- Falls back to basic completion
- No error shown to user

**Code Location:** `IDELayout.tsx:435-471`

---

## ⚠️ Error Handling UX

### **1. File Read Error**

**Scenario:** File doesn't exist or can't be read

**UX Response:**
- Error message: "File not found" or "Failed to read file"
- File remains in tree (if exists)
- Can retry or create new file
- Helpful suggestions

**User Actions:**
- Retry opening
- Create new file
- Check file permissions

**Code Location:** `IDELayout.tsx:117-137`

---

### **2. File Save Error**

**Scenario:** Save fails (network, permissions, etc.)

**UX Response:**
- Error toast: "Failed to save file"
- Unsaved indicator remains
- Retry option
- File content preserved

**User Actions:**
- Retry save
- Copy content (backup)
- Check network

**Code Location:** `IDELayout.tsx:148-167`

---

### **3. Code Execution Error**

**Scenario:** Docker unavailable or execution fails

**UX Response:**
- Error message in execution panel
- Clear error output
- Exit code shown
- Execution time shown
- Can retry

**User Actions:**
- Review error
- Fix code
- Retry execution

**Code Location:** `ExecutionPanel.tsx:18-50`

---

### **4. Git Operation Error**

**Scenario:** Git command fails

**UX Response:**
- Error message in git panel
- Operation status shown
- Retry option
- Helpful error details

**User Actions:**
- Retry operation
- Check git installation
- Review error details

**Code Location:** `GitPanel.tsx:66-169`

---

### **5. LSP Error**

**Scenario:** LSP server unavailable

**UX Response:**
- Completion fails silently
- Falls back to basic completion
- No error shown (non-blocking)
- Hover/definition may not work

**User Actions:**
- Continue editing (basic features work)
- Check LSP server installation
- Restart IDE (if needed)

**Code Location:** `IDELayout.tsx:435-471`

---

### **6. Project Upload Error**

**Scenario:** Invalid ZIP or upload fails

**UX Response:**
- Error message: "Failed to upload project"
- File picker closes
- Can retry upload
- Helpful suggestions

**User Actions:**
- Retry upload
- Check file format
- Verify file size

**Code Location:** `IDELayout.tsx:193-209`

---

## ♿ Accessibility

### **1. Keyboard Navigation**

**Supported Shortcuts:**
- **Ctrl/Cmd+S**: Save file
- **Ctrl/Cmd+W**: Close tab
- **Ctrl/Cmd+Tab**: Switch tabs
- **Ctrl/Cmd+F**: Find
- **Ctrl/Cmd+H**: Replace
- **Ctrl/Cmd+/**: Toggle comment
- **Tab**: Indent
- **Shift+Tab**: Unindent
- **Ctrl/Cmd+Z**: Undo
- **Ctrl/Cmd+Y**: Redo
- **F5**: Run code (if available)
- **Escape**: Close dialogs

**Implementation:**
- All actions keyboard accessible
- Focus indicators visible
- Tab order logical
- Shortcuts documented

**Code Location:** Monaco Editor handles most shortcuts

---

### **2. Screen Reader Support**

**ARIA Labels:**
- File tree items
- Editor content
- Button purposes
- Status messages
- Loading states

**Implementation:**
```typescript
<button
  aria-label="Save file"
  aria-busy={isLoading}
  aria-live="polite"
>
  Save
</button>
```

**Code Location:** Throughout components

---

### **3. Focus Management**

**Patterns:**
- Focus returns to editor after save
- Focus trapped in modals
- Focus moves to new tabs
- Focus indicators visible

**Code Location:** `IDELayout.tsx:342-347`

---

### **4. Color Contrast**

**Design Tokens:**
- Editor uses Monaco themes
- UI elements meet WCAG AA
- Error states high contrast
- Focus indicators visible

**Implementation:**
- Monaco Editor themes
- Design tokens from `tokens-2025.css`
- High contrast mode support

---

## 📱 Responsive Design

### **1. Desktop Layout**

**Breakpoint:** > 1024px

**Layout:**
```
┌─────────────────────────────────────────┐
│  Header (Project, Actions)             │
├──────────┬──────────────────────────────┤
│          │                              │
│  File    │   Editor (Tabs + Content)     │
│  Tree    │                              │
│  (280px) │   (Remaining width)          │
│          │                              │
└──────────┴──────────────────────────────┘
│  Git Panel | Execution Panel (if open)  │
└─────────────────────────────────────────┘
```

**Features:**
- Full sidebar visible
- Multi-panel support
- Hover states active
- Keyboard shortcuts
- Split view available

---

### **2. Tablet Layout**

**Breakpoint:** 769px - 1024px

**Layout:**
```
┌─────────────────────────────────────────┐
│  Header                                  │
├──────────┬──────────────────────────────┤
│          │                              │
│  File    │   Editor                     │
│  Tree    │                              │
│  (240px) │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

**Features:**
- Collapsible sidebar
- Panels stack vertically
- Touch and mouse support
- Adaptive spacing

---

### **3. Mobile Layout**

**Breakpoint:** ≤ 768px

**Layout:**
```
┌─────────────────────────────────────────┐
│  Header (Compact)                       │
├──────────────────────────────────────────┤
│                                          │
│  Editor (Full width)                    │
│                                          │
│                                          │
└─────────────────────────────────────────┘
│  File Tree (Drawer)                     │
│  Panels (Bottom Sheet)                   │
└─────────────────────────────────────────┘
```

**Features:**
- File tree as drawer
- Panels as bottom sheets
- Touch-optimized targets
- Swipe gestures
- Full-screen editor

**Code Location:** Responsive CSS in `IDELayout.module.css`

---

## 🚀 Progressive Enhancement

### **1. Base Features (All Users)**

**Available:**
- ✅ File tree navigation
- ✅ Monaco Editor
- ✅ File operations (read, write, delete)
- ✅ Basic editing
- ✅ Tab management
- ✅ Save functionality

**Limitations:**
- No Git (requires backend)
- No execution (requires Docker)
- No LSP (requires LSP servers)
- No refactoring (requires backend)

---

### **2. Enhanced Features (Logged-in)**

**Additional:**
- ✅ Git integration
- ✅ Code execution
- ✅ LSP features
- ✅ Advanced refactoring
- ✅ Project indexing
- ✅ Hash Sphere integration

**UX Strategy:**
- Feature badges (e.g., "Pro Feature")
- Clear value proposition
- Seamless upgrade path

---

### **3. Feature Detection**

**Pattern:**
```typescript
if (codeExecutor.is_available()) {
  // Show execution button
} else {
  // Hide or disable execution
}
```

**UX Indicators:**
- Feature availability badges
- Disabled state explanations
- Setup instructions
- Feature comparison

---

## 📊 User Flow Diagrams

### **Complete File Edit Flow**

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTION                           │
│  Clicks file in tree                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              UX: IMMEDIATE FEEDBACK                      │
│  • File highlights                                       │
│  • Loading indicator on file                             │
│  • Editor shows loading state                            │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│         BACKEND: FILE READ                               │
│  POST /code/project/file/read                            │
│  1. Get file from storage                                │
│  2. Return content                                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              UX: FILE DISPLAY                            │
│  • File opens in editor                                  │
│  • Tab appears                                           │
│  • Syntax highlighting active                            │
│  • LSP features activate                                 │
│  • Cursor positioned                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              USER ACTION: EDIT                           │
│  Types code in editor                                    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              UX: UNSAVED STATE                           │
│  • Unsaved indicator appears (●)                         │
│  • Tab shows unsaved dot                                 │
│  • Save button enabled                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              USER ACTION: SAVE                            │
│  Clicks Save or Ctrl+S                                   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              UX: SAVE FEEDBACK                           │
│  • Save button shows loading                             │
│  • "Saving..." indicator                                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│         BACKEND: FILE WRITE                              │
│  POST /code/project/file/write                           │
│  1. Save file content                                    │
│  2. Index file                                           │
│  3. Create Hash Sphere anchor                            │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              UX: SAVE COMPLETE                           │
│  • Unsaved indicator clears                              │
│  • Success feedback                                      │
│  • File list refreshes                                   │
└─────────────────────────────────────────────────────────┘
```

---

### **Code Execution Flow**

```
┌─────────────────────────────────────────────────────────┐
│              USER ACTION: RUN                             │
│  Clicks "Run" button                                      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              UX: EXECUTION PANEL                         │
│  • Panel opens                                            │
│  • Code extracted                                         │
│  • Language detected                                     │
│  • Input field shown                                      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              UX: EXECUTION STATE                          │
│  • Run button shows loading                               │
│  • "Executing..." message                                 │
│  • Spinner shown                                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│         BACKEND: CODE EXECUTION                          │
│  POST /code/execute                                      │
│  1. Create Docker container                              │
│  2. Execute code in sandbox                              │
│  3. Capture stdout/stderr                                │
│  4. Return results                                       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              UX: RESULTS DISPLAY                          │
│  • Output displayed                                       │
│  • Execution time shown                                  │
│  • Exit code displayed                                   │
│  • Success/error styling                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 UX Best Practices

### **1. Immediate Feedback**

**Principle:** Users should always know what's happening

**Implementation:**
- File selection: Immediate highlight
- Save: Loading state immediately
- Execution: Progress indication
- Git: Status updates immediately

**Examples:**
- File click → Immediate highlight
- Save click → Immediate loading
- Run click → Immediate execution start

---

### **2. Undo/Redo Support**

**Principle:** Users should be able to undo mistakes

**Implementation:**
- Monaco Editor built-in undo/redo
- File-level undo (editor)
- Git for project-level undo

**Examples:**
- Ctrl/Cmd+Z: Undo in editor
- Git revert: Undo file changes
- Git reset: Undo commits

---

### **3. Unsaved Changes Protection**

**Principle:** Prevent accidental data loss

**Implementation:**
- Clear unsaved indicators
- Confirmation on close
- Auto-save option
- Save reminders

**Examples:**
- Unsaved dot (●) on tabs
- "Unsaved changes" warning
- Auto-save toggle
- Save before close

---

### **4. Context Preservation**

**Principle:** Maintain user context

**Implementation:**
- Remember open files
- Remember cursor position
- Remember expanded folders
- Remember panel states

**Examples:**
- Tabs persist
- Cursor position saved
- Folder expansion saved
- Panel visibility saved

---

### **5. Error Recovery**

**Principle:** Always provide recovery options

**Implementation:**
- Retry buttons
- Error details
- Fallback options
- Helpful messages

**Examples:**
- "Retry" on save error
- Error details in execution
- Fallback completion
- Clear error messages

---

## 🔍 UX Metrics & Analytics

### **Key Metrics to Track**

1. **File Open Time**
   - Time from click to editor ready
   - Target: < 1 second

2. **Save Time**
   - Time from save click to success
   - Target: < 2 seconds

3. **Execution Time**
   - Time from run to results
   - Target: < 5 seconds (depends on code)

4. **Git Operation Time**
   - Time for git operations
   - Target: < 3 seconds

5. **Refactoring Time**
   - Time for refactoring
   - Target: < 30 seconds

---

## 🎨 UX Design Patterns

### **1. Empty States**

**No Project:**
- "No project loaded" message
- Upload project button
- Helpful hints
- Example projects

**No Files:**
- "No files in project" message
- Create file button
- Upload project option

**No Open Files:**
- "No file open" message
- "Click a file to open it" hint
- File tree visible

---

### **2. Loading States**

**Skeleton Loaders:**
- File tree skeletons
- Editor loading state
- Panel loading states

**Progress Indicators:**
- Upload progress
- Execution progress
- Refactoring progress

**Status Messages:**
- "Loading files..."
- "Saving..."
- "Executing..."
- "Refactoring..."

---

### **3. Success States**

**Toast Notifications:**
- "File saved"
- "File deleted"
- "Commit created"
- "Refactoring complete"

**Visual Feedback:**
- Checkmarks
- Success badges
- Animation
- Status updates

---

## 📝 Quick Reference: UX Patterns

| Pattern | Location | Implementation |
|---------|----------|----------------|
| File Tree | File tree sidebar | Click to open, expand/collapse |
| Editor | Monaco Editor | Type, shortcuts, LSP |
| Tabs | Editor tabs | Click to switch, X to close |
| Save | Save button | Click or Ctrl+S |
| Git Panel | Git panel | Toggle, operations |
| Execution Panel | Execution panel | Run, view output |
| Refactor Dialog | Refactor dialog | Open, enter request, apply |
| LSP Completion | Editor | Type, select, insert |
| Loading States | Throughout | Spinners, skeletons, progress |
| Error Handling | Error boundaries | Messages, retry, fallback |

---

## ⚠️ Important UX Notes

1. **Monaco Editor**: VS Code-like experience (familiar)
2. **Unsaved Changes**: Clear indicators prevent data loss
3. **Git Integration**: Full version control workflow
4. **Code Execution**: Secure Docker sandbox
5. **LSP Features**: Enhanced code intelligence
6. **Refactoring**: Multi-file with dependency tracking
7. **Project Upload**: ZIP extraction and indexing
8. **Responsive**: Works on mobile, tablet, desktop

---

## 🔗 Integration with Resonant Chat

### **Activation Flow**

```
User in Chat: "Open IDE" or "Edit project"
  ↓
[UX] IDE mode activates
[UX] IDE layout appears
[UX] Chat minimized or hidden
  ↓
User can: Upload project, Edit files, Execute code
  ↓
User can: Switch back to chat
  ↓
[UX] Chat mode reactivates
[UX] IDE context available in chat
```

**UX Elements:**
- Seamless mode switching
- Context preservation
- Shared project state
- Unified experience

---

**End of Guide** 🎉

