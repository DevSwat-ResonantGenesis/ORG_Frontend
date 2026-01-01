# 📚 IDE Features Documentation

## 🎯 **Overview**

Complete documentation of all IDE features, capabilities, and usage.

---

## 📁 **Table of Contents**

1. [Getting Started](#getting-started)
2. [File Operations](#file-operations)
3. [Code Editor](#code-editor)
4. [Chat Features](#chat-features)
5. [AI Features](#ai-features)
6. [Project Management](#project-management)
7. [Git Integration](#git-integration)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 **Getting Started**

### **Opening the IDE**

**Methods:**
1. Navigate to `/ide` route
2. Click "Open IDE" button from homepage
3. Type "open ide" in Resonant Chat
4. Click "Open IDE" in IDE dropdown menu

### **Loading Your First Project**

**Option 1: Upload ZIP**
1. Click "Upload Project ZIP" in IDE header
2. Select your project ZIP file
3. Wait for extraction and indexing
4. Files appear in file tree

**Option 2: Generate with AI**
1. Go to Resonant Chat
2. Click "Generate Project with AI"
3. Describe your project
4. Click "Open in IDE" after generation

---

## 📝 **File Operations**

### **Create File**

**Method 1: Button**
- Click "New File" in file tree
- Enter file path (e.g., `src/NewFile.ts`)
- File opens in editor

**Method 2: Chat**
- Ask: "Create a new file called src/utils.ts"
- AI creates file automatically

### **Edit File**

1. Click file in file tree
2. File opens in Monaco Editor
3. Make changes
4. Click "Save" or `Cmd/Ctrl + S`

### **Delete File**

**Method 1: Right-click**
- Right-click file → Delete
- Confirm deletion

**Method 2: Editor**
- Open file in editor
- Click "Delete" button
- Confirm deletion

### **Rename File**

- Right-click file → Rename
- Enter new name
- File is renamed automatically

### **Move File**

- Right-click file → Move
- Enter new path
- File is moved automatically

---

## 💻 **Code Editor**

### **Monaco Editor Features**

**Syntax Highlighting:**
- ✅ All languages supported
- ✅ Automatic language detection
- ✅ VS Code Dark+ theme

**Code Intelligence:**
- ✅ Code completion
- ✅ Error detection
- ✅ Code folding
- ✅ Bracket matching

**Navigation:**
- ✅ Go to line (`Cmd/Ctrl + G`)
- ✅ Find & replace (`Cmd/Ctrl + F`)
- ✅ Multi-cursor editing
- ✅ Code navigation

**Editor Options:**
- ✅ Word wrap toggle
- ✅ Minimap toggle
- ✅ Font size adjustment
- ✅ Theme switching

### **Keyboard Shortcuts**

| Action | Shortcut |
|--------|----------|
| Save | `Cmd/Ctrl + S` |
| Find | `Cmd/Ctrl + F` |
| Replace | `Cmd/Ctrl + H` |
| Go to Line | `Cmd/Ctrl + G` |
| Toggle Comment | `Cmd/Ctrl + /` |
| Undo | `Cmd/Ctrl + Z` |
| Redo | `Cmd/Ctrl + Shift + Z` |
| Format | `Shift + Alt + F` |

---

## 💬 **Chat Features**

### **Resonant Chat Panel**

**Location:** Right sidebar

**Features:**
- ✅ Syntax-highlighted code blocks
- ✅ File preview cards
- ✅ Auto-apply code changes
- ✅ Provider selection
- ✅ Agent selection

### **Code Highlighting**

**Automatic:**
- Code blocks are automatically highlighted
- Language is auto-detected
- VS Code Dark+ theme applied

**Example:**
```
```typescript
const getUser = async (id: string) => {
  return await db.users.find(id);
};
```
```

**Result:**
- Syntax-highlighted TypeScript
- Keywords in blue
- Strings in green
- Functions in yellow

### **File Previews**

When AI generates code with file paths:
- File preview card appears
- Shows code with syntax highlighting
- Click to open in editor
- "Open in Editor" button

---

## 🤖 **AI Features**

### **1. Conversational Chat**

**Purpose:** Ask questions, get help

**Use Cases:**
- "What does this function do?"
- "How do I add error handling?"
- "Explain this React hook"

**Agents:**
- **Default** - General help
- **Code Assistant** - Coding help
- **Debugger** - Bug fixing
- **Documentation** - Clear explanations
- **Refactor** - Code improvement

### **2. Auto-Apply Changes**

**Purpose:** Automatically apply code changes

**How It Works:**
1. Ask for changes: "Add authentication to all endpoints"
2. AI generates file operations
3. Preview shows what will change
4. Click "Apply Changes Automatically"
5. Changes are applied!

**Example:**
```
You: "Add error handling to all API routes"

AI: ✨ I can apply these changes automatically:
    1. ✏️ src/api/users.ts
    2. ✏️ src/api/posts.ts
    3. ✏️ src/api/comments.ts
    [🚀 Apply Changes Automatically]
```

### **3. AI Dev Agent**

**Purpose:** System-level code modifications

**Features:**
- Multi-file changes
- Project-wide refactoring
- Automatic file operations
- Preview before apply

**Access:**
- IDE Menu → AI Dev Agent
- Or use auto-apply in chat

---

## 📦 **Project Management**

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

### **Project Operations**

**Upload:**
- Click "Upload Project ZIP"
- Select ZIP file
- Files extracted automatically

**Download:**
- IDE Menu → Download Project
- Downloads as ZIP

**Delete:**
- Delete project folder from filesystem
- Or use API endpoint

---

## 🔧 **Git Integration**

### **Git Status**

**Visual Indicators:**
- 🟠 Orange dot = Modified
- 🟢 Green dot = Added
- 🔴 Red dot = Deleted

**Location:** File tree (next to file names)

### **Git Panel**

**Features:**
- View git status
- See changed files
- Commit changes
- Branch management

**Access:**
- IDE Menu → Git Panel
- Or click Git icon in sidebar

---

## 🐛 **Troubleshooting**

### **Chat Not Detecting Current Project**

**Symptoms:**
- Chat references old projects
- Chat doesn't see current files

**Solutions:**

1. **Check projectId:**
   ```javascript
   // Open browser console
   console.log('Project ID:', localStorage.getItem('ide-project-id'));
   ```

2. **Verify project loaded:**
   - Check file tree has files
   - Check projectId in URL: `/ide?projectId=xxx`

3. **Clear old data:**
   ```bash
   # Delete old projects
   rm -rf /tmp/resonant_projects/{org_id}/*
   
   # Clear Hash Sphere memory
   # Connect to database:
   DELETE FROM memory_anchors WHERE org_id = 'your-org-id';
   ```

4. **Reload IDE:**
   - Refresh page
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

3. **Check console:**
   - Open browser console
   - Look for errors

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

3. **Check console:**
   - Look for errors in console
   - Check network tab for API errors

---

## 📊 **Feature Matrix**

| Feature | Status | Description |
|---------|--------|-------------|
| **Monaco Editor** | ✅ | Full code editor |
| **File Tree** | ✅ | Browse project files |
| **Syntax Highlighting** | ✅ | All languages |
| **Chat with AI** | ✅ | Conversational help |
| **Auto-Apply** | ✅ | Automatic code changes |
| **File Previews** | ✅ | Live file previews |
| **Git Integration** | ✅ | Git status, commits |
| **Project Upload** | ✅ | ZIP upload |
| **Project Generation** | ✅ | AI project generation |
| **Multi-file Editing** | ✅ | Multiple tabs |
| **Code Completion** | ✅ | LSP integration |
| **Real-time Collaboration** | ✅ | Yjs integration |

---

## 🎯 **Quick Reference**

### **Essential Commands**

| Action | Method |
|--------|--------|
| **Open IDE** | `/ide` route or "Open IDE" button |
| **Upload Project** | "Upload Project ZIP" button |
| **Save File** | `Cmd/Ctrl + S` or "Save" button |
| **Open File** | Click in file tree |
| **New File** | "New File" button |
| **Delete File** | Right-click → Delete |
| **Open Chat** | Click chat icon |
| **Find in File** | `Cmd/Ctrl + F` |
| **Go to Line** | `Cmd/Ctrl + G` |

---

## 📚 **Additional Resources**

- **Syntax Highlighting:** `CHAT_SYNTAX_HIGHLIGHTING_GUIDE.md`
- **Provider & Agents:** `CHAT_PROVIDER_AGENT_GUIDE.md`
- **Old Files:** `HOW_TO_CLEAR_OLD_FILES.md`
- **Project Creation:** `HOW_TO_CREATE_FIRST_AI_PROJECT.md`
- **Unified Chat:** `UNIFIED_CHAT_GUIDE.md`

---

**The IDE is fully documented and ready to use!** 🚀

