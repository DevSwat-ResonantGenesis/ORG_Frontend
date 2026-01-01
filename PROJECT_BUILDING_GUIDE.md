# 🏗️ Project Building Guide - Where Everything Happens

## 📍 **Where Chat Builds Your Project**

### **Location: Chat Interface (Not IDE)**

When you request a project build, it happens **in the chat window itself**, not in the IDE. The Project Builder appears as a **full-screen overlay** that replaces the chat messages area.

---

## 🎯 **How to Trigger Project Building**

### **Method 1: Type a Request**
Just type in the chat:
```
"Build a todo app"
"Create a React project"
"Generate a Python web scraper"
"Make a Node.js API"
```

### **Method 2: Click Build Button**
Click the **"Build"** button (💡 icon) in the input toolbar:
```
[Chat Input] [💡 Build] [✏️ IDE] [📎 Attach] [Send]
```

### **Method 3: Enable Build Mode**
Toggle build mode on, then any message will trigger project generation.

---

## 🪟 **What Windows Open When Building?**

### **Single Project Builder Window**

When you request a project build, **ONE window opens** that replaces the chat area:

```
┌─────────────────────────────────────────────────────────┐
│  [← Back to Chat]  [Project Builder]                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📁 Project Structure                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  src/                                            │  │
│  │    ├── App.tsx                                   │  │
│  │    ├── index.tsx                                │  │
│  │    └── components/                              │  │
│  │  package.json                                   │  │
│  │  README.md                                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  📄 File Preview (Code Editor)                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  import React from 'react';                      │  │
│  │                                                   │  │
│  │  function App() {                                │  │
│  │    return <div>Hello</div>;                     │  │
│  │  }                                               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  📋 Setup Instructions                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  1. npm install                                  │  │
│  │  2. npm start                                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [📥 Download All] [📥 Download File] [🔄 Regenerate] │
└─────────────────────────────────────────────────────────┘
```

---

## 🔘 **Project Builder Buttons & Features**

### **Top Bar:**
- **← Back to Chat** - Return to chat interface
- **Project Builder** - Title

### **Left Sidebar:**
- **📁 File Tree** - Browse all generated files
- **Click file** - View code in preview

### **Main Area:**
- **📄 Code Preview** - Syntax-highlighted code
- **📋 Setup Instructions** - How to run the project

### **Bottom Actions:**
- **📥 Download All** - Download entire project as ZIP
- **📥 Download File** - Download individual file
- **🔄 Regenerate** - Generate project again with changes

---

## 🔄 **Workflow: Chat → Build → IDE**

### **Step 1: Request in Chat**
```
You: "Build a React todo app"
```

### **Step 2: Project Builder Opens**
- ✅ Project Builder window appears
- ✅ Files are generated automatically
- ✅ You can preview and download

### **Step 3: Download or Open in IDE**
- **Option A:** Download ZIP → Extract → Use locally
- **Option B:** Click "Open in IDE" → Upload to IDE → Edit files

---

## 🆚 **Refactor Window vs Git Panel**

### **Refactor Window (Modal Dialog)**

**Opens when:** Click "Refactor" button in IDE header

**Location:** Center overlay (modal dialog)

**What it shows:**
```
┌─────────────────────────────────────────┐
│  Advanced Refactoring            [X]   │
├─────────────────────────────────────────┤
│                                         │
│  Refactoring Request:                  │
│  ┌───────────────────────────────────┐ │
│  │ Rename all 'old' to 'new'...      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Refactored Files (3):                  │
│  • src/App.tsx                          │
│  • src/components/Button.tsx          │
│  • src/utils/helpers.ts                │
│                                         │
│  [Refactor] [Cancel]                   │
└─────────────────────────────────────────┘
```

**Features:**
- Text input for refactoring request
- List of files to be refactored
- Diff preview for each file
- Validation issues display
- Dependency changes
- Apply/Cancel buttons

---

### **Git Panel (Right Sidebar)**

**Opens when:** Click "Git" button in IDE header or Activity Bar

**Location:** Right sidebar (320px wide)

**What it shows:**
```
┌─────────────────────────────┐
│  Git              [↻ Refresh]│
├─────────────────────────────┤
│  Branch: main               │
│  [New branch] [Create]       │
│  • main ✓                   │
│  • feature/new-ui            │
│                             │
│  Changes (5)                 │
│  • M  src/App.tsx           │
│  • A  src/NewFile.ts        │
│  • D  src/OldFile.ts        │
│  [Stage All]                │
│                             │
│  Commit                     │
│  ☑ Auto-generate message    │
│  [Commit Changes]           │
│                             │
│  Recent Commits             │
│  • abc123 - Initial commit  │
│  • def456 - Added features  │
└─────────────────────────────┘
```

**Features:**
- Branch management (create, switch)
- File status (modified, added, deleted)
- Stage files
- Commit changes (auto or manual message)
- Commit history
- Initialize repository

---

## 📂 **Where is the Working Tree?**

### **File Explorer (Left Sidebar in IDE)**

The **working tree** (file structure) is in the **Explorer view** of the IDE:

**Location:** Left sidebar → Explorer icon (first icon in Activity Bar)

**Shows:**
```
EXPLORER          [+ New] [📤 Upload]
─────────────────────────────────────
📁 src/
  📁 components/
    📄 Button.tsx
    📄 Header.tsx
  📄 App.tsx
  📄 index.tsx
📄 package.json
📄 README.md
```

**Features:**
- ✅ Full project file tree
- ✅ Click to open files
- ✅ Folder expand/collapse
- ✅ Active file highlighting
- ✅ Unsaved changes indicator (●)

---

## 🎯 **Complete Workflow Example**

### **Scenario: Build a Todo App**

1. **In Chat:**
   ```
   You: "Build a React todo app"
   ```

2. **Project Builder Opens:**
   - Shows file tree: `src/App.tsx`, `package.json`, etc.
   - Shows code preview
   - Shows setup instructions

3. **Download Project:**
   - Click "Download All" → Get ZIP file
   - Extract locally

4. **Open in IDE (Optional):**
   - Click "Open in IDE" button (if available)
   - Or manually upload ZIP to IDE
   - Files appear in Explorer

5. **Edit in IDE:**
   - Click files in Explorer
   - Edit in Monaco Editor
   - Save changes

6. **Use Git (Optional):**
   - Click "Git" button
   - Initialize repository
   - Stage and commit changes

7. **Refactor (Optional):**
   - Click "Refactor" button
   - Enter refactoring request
   - Apply changes

---

## 📊 **Summary: All Windows & Panels**

| Feature | Window Type | Location | Trigger |
|---------|------------|----------|---------|
| **Project Builder** | Full-screen overlay | Replaces chat | "Build..." message or Build button |
| **IDE** | Full-screen | Replaces chat | "Open IDE" or IDE button |
| **Refactor Dialog** | Modal dialog | Center overlay | Refactor button (IDE) |
| **Git Panel** | Right sidebar | 320px sidebar | Git button (IDE) |
| **Execution Panel** | Bottom panel | 300px height | Run button (IDE) |
| **File Explorer** | Left sidebar | 280px sidebar | Explorer icon (Activity Bar) |
| **Search View** | Left sidebar | 280px sidebar | Search icon (Activity Bar) |
| **Settings View** | Left sidebar | 280px sidebar | Settings icon (Activity Bar) |

---

## 💡 **Quick Tips**

- **Project Building** = Happens in **Chat** (Project Builder window)
- **File Editing** = Happens in **IDE** (Monaco Editor)
- **Refactoring** = Modal dialog in **IDE**
- **Git Operations** = Right sidebar in **IDE**
- **File Tree** = Left sidebar in **IDE** (Explorer view)

---

## ❓ **FAQ**

**Q: Where do I see my built project?**
- In the **Project Builder window** (replaces chat)
- Download as ZIP or open in IDE

**Q: Where is the working tree?**
- **IDE → Explorer** (left sidebar, first icon in Activity Bar)

**Q: Where does refactoring happen?**
- **IDE → Refactor button** → Modal dialog opens

**Q: Where is Git?**
- **IDE → Git button** → Right sidebar opens

**Q: Can I build and edit in the same place?**
- **Build** = Chat (Project Builder)
- **Edit** = IDE (Monaco Editor)
- Download from Builder → Upload to IDE

