# 🎯 IDE User Guide - Where Everything Is

## 📍 **After Upload: Where to See Your Code**

### **1. File Explorer (Left Sidebar)**
After uploading a project:
- ✅ **Files appear in the EXPLORER panel** (left sidebar)
- ✅ **All folders are auto-expanded** so you can see your code immediately
- ✅ **Click any file** to open it in the editor

**Location:** Left sidebar → Explorer icon (first icon in Activity Bar)

---

## 🪟 **How Many Windows Open?**

### **Single IDE Window with Multiple Panels:**

```
┌─────────────────────────────────────────────────────────┐
│  [Header Toolbar: Refactor | Run | Git | Upload | Close] │
├───┬───────────────────────────────────────────────────────┤
│   │  [Activity Bar]  │  [Sidebar]  │  [Editor Area]      │
│   │                  │             │                      │
│ E │  EXPLORER        │  Files:     │  [Tabs: file1.ts]   │
│ x │  - src/          │  - src/     │                      │
│ p │    - App.tsx     │    - App.tsx│  [Monaco Editor]    │
│ l │    - index.ts    │    - index  │                      │
│ o │  - package.json  │  - package  │                      │
│ r │                  │             │                      │
│ e │  SEARCH          │             │                      │
│ r │                  │             │                      │
│   │  GIT             │             │                      │
│   │                  │             │                      │
│   │  SETTINGS        │             │                      │
└───┴───────────────────────────────────────────────────────┘
│  [Status Bar: Language | Line:Col | Project ID]          │
└─────────────────────────────────────────────────────────┘
```

### **Panels Breakdown:**

1. **Header Toolbar** (Top)
   - Refactor, Run, Git, Upload, Close buttons

2. **Activity Bar** (Left Edge - 48px wide)
   - Explorer, Search, Git, Settings icons

3. **Sidebar** (Left - 280px wide)
   - File tree (Explorer view)
   - Search input (Search view)
   - Settings panel (Settings view)

4. **Editor Area** (Center - Flexible)
   - File tabs at top
   - Monaco Editor (code editing)
   - Toolbar (Save, Delete buttons)

5. **Status Bar** (Bottom - 22px high)
   - Language, Line/Column, Project ID

6. **Optional Panels** (Can be toggled):
   - **Git Panel** (Right sidebar - 320px) - Click Git button
   - **Execution Panel** (Bottom - 300px) - Click Run button

---

## 🔘 **Where Are All The Buttons?**

### **Top Header Toolbar:**
```
[Project: abc123...]  [Refactor] [Run] [Git] [Upload] [X]
```

**Buttons:**
- **Refactor** - Advanced code refactoring (disabled if no files open)
- **Run** - Execute code (disabled if no file open)
- **Git** - Toggle Git panel (right sidebar)
- **Upload** - Upload new project ZIP
- **X** - Close IDE

### **Activity Bar (Left Edge):**
```
[📁] Explorer
[🔍] Search  
[🔄] Git
[⚙️] Settings
```

**Icons:**
- **Explorer** - File tree view (default)
- **Search** - File search view
- **Git** - Source control
- **Settings** - IDE settings

### **Sidebar Header (Explorer View):**
```
EXPLORER          [+ New File] [📤 Upload]
```

**Buttons:**
- **+ New File** - Create new file
- **📤 Upload** - Upload project (same as header)

### **Editor Toolbar (Above Editor):**
```
[💾 Save] [🗑️ Delete]
```

**Buttons:**
- **Save** - Save current file (disabled if no changes)
- **Delete** - Delete current file

### **Status Bar (Bottom):**
```
[TYPESCRIPT] [Ln 42, Col 15] [● Unsaved]    [Project: abc123...] [Terminal]
```

**Info:**
- Language type
- Cursor position
- Unsaved indicator
- Project ID
- Terminal toggle button

---

## 📂 **File Tree Navigation**

### **After Upload:**
1. **Files appear in Explorer** (left sidebar)
2. **Folders are auto-expanded** to show structure
3. **Click any file** to open in editor
4. **Click folder** to expand/collapse

### **File Icons:**
- 📁 **Folder** (closed)
- 📂 **Folder** (open/expanded)
- 📄 **File** (with extension icon)

### **Indicators:**
- **● Orange dot** = Unsaved changes
- **Blue highlight** = Active/selected file
- **White text** = Currently open file

---

## ⌨️ **Keyboard Shortcuts**

- **Ctrl/Cmd + S** - Save file
- **Ctrl/Cmd + W** - Close tab
- **Ctrl/Cmd + P** - Search files
- **Ctrl/Cmd + Enter** - Run code

---

## 🎯 **Quick Start After Upload**

1. **Upload Project** → Click "Upload" button → Select ZIP file
2. **See Files** → Files appear in Explorer (left sidebar)
3. **Open File** → Click any file in the tree
4. **Edit Code** → Code appears in Monaco Editor (center)
5. **Save Changes** → Click "Save" button or Ctrl+S
6. **Run Code** → Click "Run" button (if executable)

---

## 💡 **Tips**

- **All folders auto-expand** after upload so you see everything immediately
- **Click Explorer icon** in Activity Bar if sidebar is hidden
- **Use Search** (Ctrl+P) to quickly find files
- **Multiple tabs** - Open multiple files, switch between them
- **Unsaved indicator** - Orange dot shows files with changes

---

## ❓ **Troubleshooting**

**Q: I don't see my files after upload?**
- Check Explorer view is active (first icon in Activity Bar)
- Check if project ID appears in header
- Try refreshing or re-uploading

**Q: Where are the buttons?**
- Top header: Main actions (Refactor, Run, Git, Upload)
- Left edge: Activity Bar (Explorer, Search, Git, Settings)
- Sidebar header: File operations (New File, Upload)
- Editor toolbar: File operations (Save, Delete)

**Q: How do I see the code?**
- Files appear in Explorer (left sidebar)
- Click any file to open in editor (center)
- Code appears in Monaco Editor

