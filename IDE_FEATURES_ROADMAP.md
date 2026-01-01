# IDE Features Roadmap - Edit & Maintain Existing Projects

## Goal
Make Resonant Chat a full IDE for editing and maintaining existing projects, like Cursor.

---

## Phase 1: MVP IDE (2-3 weeks)

### 1. Web-Based Code Editor
**Technology:** Monaco Editor (same engine as VS Code)

**Features:**
- Syntax highlighting (all languages)
- Code completion
- Error detection
- Multi-file tabs
- Find & replace
- Code folding

### 2. Project File Tree
**Features:**
- Browse project structure
- Open files in editor
- Create new files
- Delete files
- Rename files
- Folder navigation

### 3. Project Upload/Import
**Features:**
- Upload project folder (ZIP)
- Drag & drop files
- Auto-detect project type
- Index all files

### 4. File Operations
**Features:**
- Edit files in Monaco Editor
- Save changes
- Auto-save
- Undo/redo
- Multi-file editing

---

## Phase 2: Advanced IDE Features (3-4 weeks)

### 5. Code Intelligence
- Go to definition
- Find references
- Symbol search
- Code navigation

### 6. Multi-File Refactoring
- Rename across files
- Extract function
- Move file
- Update imports

### 7. Git Integration
- View git status
- Commit changes
- Branch management
- Diff viewer

### 8. Code Execution (Optional)
- Run code in sandbox
- View output
- Error capture

---

## Implementation Plan

### Step 1: Add Monaco Editor (Day 1-2)

**Install:**
```bash
npm install @monaco-editor/react monaco-editor
```

**Create Editor Component:**
```typescript
// src/components/IDE/MonacoCodeEditor.tsx
import Editor from '@monaco-editor/react';

export const MonacoCodeEditor = ({ file, onChange }) => {
  return (
    <Editor
      height="100%"
      language={detectLanguage(file.path)}
      value={file.content}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
      }}
    />
  );
};
```

### Step 2: Create IDE Layout (Day 3-4)

**New Component:** `src/components/IDE/IDELayout.tsx`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Header (Project name, Save, etc.)      │
├──────────┬──────────────────────────────┤
│          │                              │
│  File    │   Monaco Editor              │
│  Tree    │   (Code editing area)        │
│          │                              │
│  - src/  │   [Tabs: file1.ts, file2.ts]│
│    - App │                              │
│    - ... │   [Editor content]          │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Step 3: Project Upload (Day 5-6)

**Features:**
- ZIP upload
- Extract files
- Index in backend
- Show in file tree

### Step 4: File Operations API (Day 7-8)

**Backend Endpoints:**
```
POST /code/project/upload - Upload project
GET  /code/project/files - List project files
GET  /code/project/file/{path} - Get file content
PUT  /code/project/file/{path} - Update file
POST /code/project/file - Create file
DELETE /code/project/file/{path} - Delete file
```

### Step 5: Integration with Chat (Day 9-10)

**Features:**
- "Open project" command
- "Edit file" command
- Switch between Chat and IDE modes
- Share context between chat and IDE

---

## Technical Stack

### Frontend
- **Monaco Editor** - Code editor
- **React File Tree** - File navigation
- **ZIP.js** - Project upload/extract
- **Axios** - API calls

### Backend
- **File Storage** - Store project files
- **File Operations** - CRUD for files
- **Project Indexing** - Index uploaded projects
- **Hash Sphere** - Store project patterns

---

## User Flow

### Scenario: Edit Existing Project

1. **User:** "Open my React project"
2. **System:** Shows upload dialog
3. **User:** Uploads project ZIP
4. **System:**
   - Extracts files
   - Indexes in backend
   - Shows file tree
   - Opens main file in editor

5. **User:** Edits `App.tsx` in Monaco Editor
6. **User:** "Add a new component"
7. **System:**
   - Generates component code
   - Creates new file
   - Updates imports
   - Shows in file tree

8. **User:** Saves changes
9. **System:**
   - Updates backend
   - Creates Hash Sphere anchors
   - Indexes new code

---

## Success Criteria

- ✅ Can upload existing project
- ✅ Can browse files in tree
- ✅ Can edit files in Monaco Editor
- ✅ Can create new files
- ✅ Can save changes
- ✅ Can download updated project
- ✅ Hash Sphere indexes all changes

---

## Estimated Time

- **Phase 1 (MVP):** 2-3 weeks
- **Phase 2 (Advanced):** 3-4 weeks
- **Total:** 5-7 weeks for full IDE

---

## Next Steps

1. Install Monaco Editor
2. Create IDE layout component
3. Add project upload
4. Connect to backend file operations
5. Integrate with chat

Let's start! 🚀

