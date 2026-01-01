# 📚 IDE Documentation

## 🎯 **Overview**

The Resonant Graph AI IDE is a full-featured web-based code editor with AI-powered assistance, real-time collaboration, and intelligent code generation.

---

## 🚀 **Getting Started**

### **1. Opening the IDE**

**From Homepage:**
- Click "Open IDE" button
- Or navigate to `/ide` route

**From Chat:**
- Type: "open ide", "ide mode", "open project"
- Or click "Open IDE" in chat menu

**Direct URL:**
```
http://localhost:5175/ide
```

---

### **2. Loading a Project**

**Option 1: Upload Project ZIP**
1. Click "Upload Project ZIP" button in IDE header
2. Select a ZIP file containing your project
3. Files are automatically extracted and indexed

**Option 2: Generate with AI**
1. Go to Resonant Chat page
2. Click "Generate Project with AI"
3. Describe your project
4. Click "Open in IDE" after generation

**Option 3: Open Existing Project**
- Projects are stored per organization
- Select from project list (if available)

---

## 💻 **IDE Features**

### **1. File Tree Browser**

**Location:** Left sidebar

**Features:**
- ✅ Browse project structure
- ✅ Expand/collapse folders
- ✅ Visual file type icons
- ✅ Git status indicators (modified, added, deleted)
- ✅ Active file highlighting
- ✅ Click to open files

**Actions:**
- **Click file** → Opens in editor
- **Double-click file** → Opens in editor
- **Right-click** → Context menu (create, delete, rename)

---

### **2. Monaco Editor**

**Features:**
- ✅ Syntax highlighting (all languages)
- ✅ Code completion
- ✅ Multi-file tabs
- ✅ Find & replace (Cmd/Ctrl + F)
- ✅ Go to line (Cmd/Ctrl + G)
- ✅ Code folding
- ✅ Word wrap
- ✅ Minimap
- ✅ Dark/Light themes

**Keyboard Shortcuts:**
- `Cmd/Ctrl + S` → Save file
- `Cmd/Ctrl + F` → Find
- `Cmd/Ctrl + H` → Replace
- `Cmd/Ctrl + G` → Go to line
- `Cmd/Ctrl + /` → Toggle comment
- `Cmd/Ctrl + Z` → Undo
- `Cmd/Ctrl + Shift + Z` → Redo

---

### **3. Chat Panel**

**Location:** Right sidebar

**Features:**
- ✅ AI-powered code assistance
- ✅ Syntax-highlighted code blocks
- ✅ File previews with Monaco Editor
- ✅ Auto-apply code changes
- ✅ Provider selection (OpenAI, Groq, etc.)
- ✅ Agent selection (Code Assistant, Debugger, etc.)

**How to Use:**
1. Type your question or request
2. AI responds with code suggestions
3. Click file previews to open in editor
4. Click "Apply Changes" to auto-apply

---

### **4. File Operations**

**Create File:**
- Click "New File" in file tree
- Enter file path (e.g., `src/NewFile.ts`)
- File opens in editor

**Edit File:**
- Click file in tree
- Edit in Monaco Editor
- Click "Save" or `Cmd/Ctrl + S`

**Delete File:**
- Right-click file → Delete
- Or open file → Click "Delete" button
- Confirm deletion

**Rename File:**
- Right-click file → Rename
- Enter new name

---

### **5. Git Integration**

**Features:**
- ✅ View git status
- ✅ See modified/added/deleted files
- ✅ Visual indicators in file tree
- ✅ Git panel (if enabled)

**Git Status Colors:**
- 🟠 Orange dot = Modified
- 🟢 Green dot = Added
- 🔴 Red dot = Deleted

---

## 🤖 **AI Features**

### **1. Resonant Chat**

**Purpose:** Conversational coding help

**Features:**
- Ask questions about code
- Get code examples
- Understand code explanations
- Debugging help

**Example Queries:**
```
"What does this function do?"
"How do I add error handling?"
"Explain this React hook"
```

---

### **2. AI Dev Agent**

**Purpose:** Automatic code changes

**Features:**
- Multi-file modifications
- Project-wide refactoring
- Automatic file operations
- Preview before apply

**Example Tasks:**
```
"Add authentication to all endpoints"
"Refactor all components to TypeScript"
"Create error handling for all API routes"
```

---

### **3. Project Builder**

**Purpose:** Generate complete projects

**Features:**
- Generate multi-file projects
- Preview before download
- Auto-upload to IDE
- Project templates

**How to Use:**
1. Go to Resonant Chat
2. Click "Generate Project with AI"
3. Describe your project
4. Review generated files
5. Click "Open in IDE"

---

## 🎨 **UI Components**

### **1. File Tree**

**Styling:**
- Folders: Bold, folder icons
- Files: Regular weight, file type icons
- Active file: Highlighted with accent color
- Git status: Colored dots

**Icons:**
- 📁 Folders (expandable/collapsed)
- 📄 Files (with type-specific icons)
- 🟠 Modified files
- 🟢 Added files
- 🔴 Deleted files

---

### **2. Code Editor**

**Theme:** Dark (vs-dark) by default

**Features:**
- Syntax highlighting
- Line numbers
- Code folding
- Minimap
- Word wrap
- Find & replace

---

### **3. Chat Panel**

**Features:**
- Syntax-highlighted code blocks
- File preview cards
- Auto-apply buttons
- Provider selector
- Agent selector

**Code Highlighting:**
- Uses Monaco Editor syntax highlighting
- Supports all languages
- Cursor AI-style appearance

---

## 🔧 **Configuration**

### **Project Storage**

**Location:** `/tmp/resonant_projects/{org_id}/{project_id}/`

**Structure:**
```
/tmp/resonant_projects/
  └── {org_id}/
      └── {project_id}/
          ├── src/
          ├── package.json
          └── ...
```

---

### **Environment Variables**

**Frontend:**
- `VITE_API_URL` - Backend API URL (default: `http://localhost:8001`)

**Backend:**
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth secret

---

## 📖 **API Endpoints**

### **Project Operations**

```
POST   /code/project/upload         # Upload project ZIP
GET    /code/project/files          # List project files
POST   /code/project/file/read      # Read file content
POST   /code/project/file/write     # Write file content
POST   /code/project/file/delete    # Delete file
POST   /code/project/file/create    # Create new file
```

### **Code Features**

```
POST   /code/generate               # Generate code
POST   /code/refactor               # Refactor code
POST   /code/index                  # Index codebase
GET    /code/search                 # Search code
```

### **Chat**

```
POST   /resonant-chat/message       # Send chat message
GET    /resonant-chat/history       # Get chat history
```

---

## 🐛 **Troubleshooting**

### **Chat Not Detecting Current Project**

**Symptoms:**
- Chat references old projects
- Chat doesn't see current files

**Solutions:**
1. **Check projectId:**
   - Open browser console
   - Check if `projectId` is set
   - Verify project is loaded

2. **Clear old data:**
   ```bash
   # Delete old projects
   rm -rf /tmp/resonant_projects/{org_id}/*
   
   # Clear Hash Sphere memory
   # Connect to database and run:
   DELETE FROM memory_anchors WHERE org_id = 'your-org-id';
   ```

3. **Refresh IDE:**
   - Reload page
   - Re-upload project if needed

---

### **Code Not Highlighted**

**Symptoms:**
- Code blocks appear as plain text
- No syntax colors

**Solutions:**
1. **Check dependencies:**
   ```bash
   npm install react-syntax-highlighter
   ```

2. **Clear cache:**
   - Hard refresh: `Cmd/Ctrl + Shift + R`
   - Clear browser cache

---

### **Files Not Opening**

**Symptoms:**
- Click file but editor doesn't show content
- File tree shows files but editor is empty

**Solutions:**
1. **Check file path:**
   - Verify file exists in project
   - Check file permissions

2. **Reload project:**
   - Close and reopen IDE
   - Re-upload project

---

## 📝 **Best Practices**

### **1. Project Organization**

- ✅ Use clear folder structure
- ✅ Keep related files together
- ✅ Use meaningful file names
- ✅ Organize by feature/module

### **2. Chat Usage**

- ✅ Be specific in requests
- ✅ Include file paths when needed
- ✅ Use appropriate agent (Code Assistant for coding)
- ✅ Review code before applying

### **3. File Management**

- ✅ Save files regularly (`Cmd/Ctrl + S`)
- ✅ Use Git for version control
- ✅ Delete unused files
- ✅ Keep project structure clean

---

## 🚀 **Advanced Features**

### **1. Real-time Collaboration**

- Multiple users can edit simultaneously
- See other users' cursors
- Live file updates

### **2. Code Search**

- Semantic code search
- Find by meaning, not keywords
- Hash Sphere resonance matching

### **3. AI Code Generation**

- Generate complete projects
- Multi-file code generation
- Pattern matching from Hash Sphere

---

## 📚 **Additional Resources**

- **Provider Guide:** `CHAT_PROVIDER_AGENT_GUIDE.md`
- **Old Files Guide:** `HOW_TO_CLEAR_OLD_FILES.md`
- **Project Creation:** `HOW_TO_CREATE_FIRST_AI_PROJECT.md`
- **Unified Chat:** `UNIFIED_CHAT_GUIDE.md`

---

## ✅ **Quick Reference**

| Action | Shortcut/Button |
|--------|----------------|
| **Open IDE** | `/ide` route or "Open IDE" button |
| **Upload Project** | "Upload Project ZIP" button |
| **Save File** | `Cmd/Ctrl + S` or "Save" button |
| **Open File** | Click in file tree |
| **New File** | "New File" button |
| **Delete File** | Right-click → Delete |
| **Open Chat** | Click chat icon or `Cmd/Ctrl + L` |
| **Find in File** | `Cmd/Ctrl + F` |
| **Go to Line** | `Cmd/Ctrl + G` |

---

**The IDE is now ready to use with full syntax highlighting and proper project detection!** 🎉

