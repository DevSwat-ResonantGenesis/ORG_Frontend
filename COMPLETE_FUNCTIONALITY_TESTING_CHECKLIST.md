# 🧪 Complete Functionality Testing Checklist

**Date:** 2025-01-29  
**Purpose:** Comprehensive testing of ALL platform features after update

---

## 📋 **TESTING OVERVIEW**

This checklist covers:
1. ✅ Resonant Chat (Hash Sphere + RAG)
2. ✅ IDE Features
3. ✅ Project Creation & Management
4. ✅ Code Generation & Operations
5. ✅ File Operations
6. ✅ Git Operations
7. ✅ Code Execution
8. ✅ Advanced Features

---

## 🔍 **CATEGORY 1: RESONANT CHAT**

### **1.1 Basic Chat**
- [ ] Send message successfully
- [ ] Receive response from AI
- [ ] Message displays correctly
- [ ] Markdown rendering works
- [ ] Code blocks formatted
- [ ] Conversation history persists

### **1.2 Hash Sphere Features**
- [ ] Hash generated for input
- [ ] Hash generated for response
- [ ] Memory anchors retrieved
- [ ] Resonance score calculated (> 0)
- [ ] New anchors created
- [ ] Memory updated in backend

### **1.3 Provider Routing**
- [ ] Auto provider selection works
- [ ] Manual provider selection works
- [ ] Provider health checks work
- [ ] Provider stats available
- [ ] Fallback between providers works

### **1.4 Memory System**
- [ ] Memory anchors load
- [ ] Resonance clusters load
- [ ] Memory persists across sessions
- [ ] Related memories retrieved
- [ ] Context building works

**Test Commands:**
```bash
# Send message
curl -X POST https://dev-swat.com/api/resonant-chat/message \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"message": "Hello", "preferred_provider": "auto"}'

# Get anchors
curl https://dev-swat.com/api/resonant-chat/anchors \
  -H "Cookie: session-cookie"

# Get clusters
curl https://dev-swat.com/api/resonant-chat/clusters \
  -H "Cookie: session-cookie"
```

---

## 💻 **CATEGORY 2: IDE FEATURES**

### **2.1 IDE Layout**
- [ ] IDE opens from chat (type "open ide" or "ide mode")
- [ ] File tree displays
- [ ] Monaco editor loads
- [ ] Tabs work for multiple files
- [ ] Save/delete buttons visible
- [ ] Upload project button works

### **2.2 File Tree**
- [ ] Files listed correctly
- [ ] Folders expand/collapse
- [ ] Click file to open in editor
- [ ] File icons display correctly
- [ ] Unsaved changes indicator (●) works

### **2.3 Monaco Editor**
- [ ] Syntax highlighting works
- [ ] Code completion works (if LSP enabled)
- [ ] Find & replace works
- [ ] Code folding works
- [ ] Multi-cursor editing works
- [ ] Language detection works

---

## 📁 **CATEGORY 3: PROJECT CREATION & MANAGEMENT**

### **3.1 Project Generation**
- [ ] Generate project from description
- [ ] Multiple files generated
- [ ] Project structure correct
- [ ] Setup instructions provided
- [ ] Files have correct content
- [ ] Hash Sphere anchors created

**Test Request:**
```bash
curl -X POST https://dev-swat.com/api/code/project/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "description": "Create a simple React todo app",
    "project_type": "react"
  }'
```

**Expected Response:**
```json
{
  "files": [
    {
      "path": "package.json",
      "content": "...",
      "language": "json",
      "explanation": "..."
    },
    {
      "path": "src/App.jsx",
      "content": "...",
      "language": "javascript",
      "explanation": "..."
    }
  ],
  "project_structure": {...},
  "setup_instructions": "...",
  "anchors": ["react", "todo", "app"]
}
```

### **3.2 Project Upload**
- [ ] Upload ZIP file works
- [ ] Files extracted correctly
- [ ] Files indexed automatically
- [ ] Project ID returned
- [ ] File tree updates

**Test:**
1. Create a ZIP file with project files
2. Click "Upload Project" in IDE
3. Select ZIP file
4. Verify files appear in file tree

### **3.3 Project Files List**
- [ ] List all project files
- [ ] Files include path, language, size
- [ ] Project ID returned
- [ ] Empty project returns empty list

**Test Command:**
```bash
curl https://dev-swat.com/api/code/project/files?project_id=test \
  -H "Cookie: session-cookie"
```

---

## 📝 **CATEGORY 4: FILE OPERATIONS**

### **4.1 Read File**
- [ ] Read file by path
- [ ] File content returned
- [ ] Language detected
- [ ] Non-existent file returns error
- [ ] Large files handled

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/project/file/read \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"file_path": "src/App.jsx"}'
```

### **4.2 Write File**
- [ ] Create new file
- [ ] Update existing file
- [ ] File saved to backend
- [ ] File indexed automatically
- [ ] Hash Sphere anchor created
- [ ] Unsaved indicator clears

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/project/file/write \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "file_path": "src/NewFile.js",
    "content": "console.log(\"Hello\");",
    "language": "javascript"
  }'
```

### **4.3 Delete File**
- [ ] Delete file by path
- [ ] File removed from backend
- [ ] File removed from file tree
- [ ] Tab closes if file was open
- [ ] Error if file doesn't exist

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/project/file/delete \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"file_path": "src/NewFile.js"}'
```

---

## 🔧 **CATEGORY 5: CODE GENERATION**

### **5.1 Code Completion**
- [ ] Get completions for prefix
- [ ] Completions relevant
- [ ] Memory-based completions work
- [ ] Cursor position handled
- [ ] Language-specific completions

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/complete \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "file_path": "src/App.jsx",
    "prefix": "const handle",
    "cursor_position": {"line": 10, "column": 12},
    "language": "javascript"
  }'
```

### **5.2 Code Generation**
- [ ] Generate code from description
- [ ] Code matches description
- [ ] Explanation provided
- [ ] Tests generated (if requested)
- [ ] Context files used

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "description": "Create a function that adds two numbers",
    "language": "python",
    "file_path": "math.py"
  }'
```

### **5.3 Code Refactoring**
- [ ] Refactor code successfully
- [ ] Original code preserved
- [ ] Refactored code correct
- [ ] Diff provided
- [ ] Explanation provided
- [ ] Safety checks performed

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/refactor \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "file_path": "src/App.jsx",
    "code": "function add(a, b) { return a + b; }",
    "refactor_request": "Convert to arrow function",
    "language": "javascript"
  }'
```

### **5.4 Advanced Refactoring**
- [ ] Multi-file refactoring works
- [ ] Dependencies tracked
- [ ] Validation performed
- [ ] Dependency changes reported
- [ ] All files updated consistently

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/refactor/advanced \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "project_id": "test",
    "refactor_request": "Rename function add to sum",
    "files": [
      {
        "path": "math.js",
        "content": "...",
        "language": "javascript"
      }
    ]
  }'
```

---

## 🔍 **CATEGORY 6: CODE SEARCH**

### **6.1 Hash Sphere Search**
- [ ] Search codebase by query
- [ ] Results ranked by resonance
- [ ] File paths included
- [ ] Code snippets shown
- [ ] Language filter works
- [ ] Limit parameter works

**Test Command:**
```bash
curl "https://dev-swat.com/api/code/search?query=function%20add&language=javascript&limit=10" \
  -H "Cookie: session-cookie"
```

### **6.2 ML Embedding Search**
- [ ] ML search works
- [ ] Results ranked by similarity
- [ ] Similarity scores included
- [ ] Language filter works
- [ ] Limit parameter works

**Test Command:**
```bash
curl "https://dev-swat.com/api/code/search/ml?query=function%20add&language=javascript&limit=10" \
  -H "Cookie: session-cookie"
```

### **6.3 Code Indexing**
- [ ] Index files successfully
- [ ] Files indexed count correct
- [ ] Updated files tracked
- [ ] Errors reported
- [ ] Hash Sphere hashes created

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/index \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "files": [
      {
        "path": "src/App.jsx",
        "content": "function add(a, b) { return a + b; }",
        "language": "javascript"
      }
    ]
  }'
```

---

## 🚀 **CATEGORY 7: CODE EXECUTION**

### **7.1 Python Execution**
- [ ] Execute Python code
- [ ] Output returned
- [ ] Errors captured
- [ ] Exit code returned
- [ ] Execution time measured

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/execute \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "code": "print(\"Hello, World!\")",
    "language": "python"
  }'
```

### **7.2 TypeScript/JavaScript Execution**
- [ ] Execute TypeScript code
- [ ] Execute JavaScript code
- [ ] Output returned
- [ ] Errors captured
- [ ] Timeout handling works

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/execute \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "code": "console.log(\"Hello\");",
    "language": "javascript"
  }'
```

### **7.3 Execution Safety**
- [ ] Timeout enforced
- [ ] Infinite loops detected
- [ ] Unsafe code blocked
- [ ] Resource limits enforced
- [ ] Sandbox isolation works

---

## 🔀 **CATEGORY 8: GIT OPERATIONS**

### **8.1 Initialize Repository**
- [ ] Initialize git repo
- [ ] .git folder created
- [ ] Success message returned
- [ ] Error if already initialized

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/git/init \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"project_id": "test"}'
```

### **8.2 Git Status**
- [ ] Get git status
- [ ] Modified files listed
- [ ] Branch name returned
- [ ] Status text correct
- [ ] Works for non-repo (returns error)

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/git/status \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"project_id": "test"}'
```

### **8.3 Stage Files**
- [ ] Stage all files
- [ ] Stage specific files
- [ ] Files added to index
- [ ] Success message returned

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/git/add \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "project_id": "test",
    "files": ["src/App.jsx"]
  }'
```

### **8.4 Commit Changes**
- [ ] Commit with message
- [ ] Auto-generate commit message
- [ ] Commit hash returned
- [ ] Output logged
- [ ] Error if nothing to commit

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/git/commit \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "project_id": "test",
    "message": "Add new feature",
    "auto_generate": false
  }'
```

### **8.5 Branch Management**
- [ ] Create new branch
- [ ] Switch branch
- [ ] Branch name returned
- [ ] Error if branch exists

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/git/branch \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "project_id": "test",
    "branch_name": "feature/new-feature",
    "create": true
  }'
```

### **8.6 List Branches**
- [ ] List all branches
- [ ] Current branch marked
- [ ] Branch names returned

**Test Command:**
```bash
curl "https://dev-swat.com/api/git/branches?project_id=test" \
  -H "Cookie: session-cookie"
```

### **8.7 Commit Log**
- [ ] Get commit log
- [ ] Commits include hash, author, date, message
- [ ] Limit parameter works
- [ ] Chronological order

**Test Command:**
```bash
curl "https://dev-swat.com/api/git/log?project_id=test&limit=10" \
  -H "Cookie: session-cookie"
```

---

## 🎯 **CATEGORY 9: LSP FEATURES (Language Server Protocol)**

### **9.1 Code Completion (LSP)**
- [ ] LSP completion works
- [ ] Context-aware suggestions
- [ ] Import suggestions
- [ ] Type information included

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/lsp/completion \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "file_path": "src/App.jsx",
    "position": {"line": 10, "column": 5},
    "language": "javascript"
  }'
```

### **9.2 Go to Definition**
- [ ] Definition found
- [ ] File path returned
- [ ] Line/column returned
- [ ] Works for imports
- [ ] Works for functions

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/lsp/definition \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "file_path": "src/App.jsx",
    "position": {"line": 10, "column": 5},
    "language": "javascript"
  }'
```

### **9.3 Find References**
- [ ] References found
- [ ] All locations returned
- [ ] File paths included
- [ ] Line/column included

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/lsp/references \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "file_path": "src/App.jsx",
    "position": {"line": 10, "column": 5},
    "language": "javascript"
  }'
```

### **9.4 Hover Information**
- [ ] Hover info returned
- [ ] Type information shown
- [ ] Documentation included
- [ ] Signature shown

**Test Command:**
```bash
curl -X POST https://dev-swat.com/api/code/lsp/hover \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{
    "file_path": "src/App.jsx",
    "position": {"line": 10, "column": 5},
    "language": "javascript"
  }'
```

---

## 🎨 **CATEGORY 10: UI/UX INTEGRATION**

### **10.1 IDE Integration with Chat**
- [ ] IDE opens from chat command
- [ ] Project context shared
- [ ] Code selection works
- [ ] File attachments work
- [ ] Seamless switching

### **10.2 Project Builder UI**
- [ ] Project builder opens
- [ ] Description input works
- [ ] Project type selection works
- [ ] Generate button works
- [ ] Files displayed
- [ ] Download ZIP works
- [ ] Download individual files works

### **10.3 Execution Panel**
- [ ] Execution panel opens
- [ ] Code input works
- [ ] Language selection works
- [ ] Execute button works
- [ ] Output displayed
- [ ] Errors displayed

### **10.4 Refactor Dialog**
- [ ] Refactor dialog opens
- [ ] Refactor request input works
- [ ] Preview shows diff
- [ ] Apply button works
- [ ] Cancel button works

### **10.5 Git Panel**
- [ ] Git panel opens
- [ ] Status displayed
- [ ] Files listed
- [ ] Stage/unstage works
- [ ] Commit works
- [ ] Branch operations work

---

## 🔒 **CATEGORY 11: SECURITY & ERROR HANDLING**

### **11.1 Authentication**
- [ ] All endpoints require auth
- [ ] Unauthorized requests rejected
- [ ] Session management works
- [ ] Token refresh works

### **11.2 Input Validation**
- [ ] Invalid inputs rejected
- [ ] Error messages clear
- [ ] File path validation
- [ ] Code size limits enforced

### **11.3 Error Handling**
- [ ] Network errors handled
- [ ] Backend errors handled
- [ ] Timeout errors handled
- [ ] User-friendly messages
- [ ] No sensitive data exposed

### **11.4 Code Execution Safety**
- [ ] Sandbox isolation works
- [ ] Resource limits enforced
- [ ] Timeout enforced
- [ ] Unsafe operations blocked

---

## ⚡ **CATEGORY 12: PERFORMANCE**

### **12.1 Response Times**
- [ ] Code generation < 10s
- [ ] Code search < 2s
- [ ] File operations < 1s
- [ ] Git operations < 2s
- [ ] Code execution < 5s

### **12.2 Resource Usage**
- [ ] Memory usage reasonable
- [ ] CPU usage reasonable
- [ ] Network requests optimized
- [ ] Bundle size acceptable

---

## 📊 **TEST RESULTS TEMPLATE**

```markdown
## Complete Test Results - [Date/Time]

### Resonant Chat: ✅/❌
- Basic Chat: ✅/❌
- Hash Sphere: ✅/❌
- Provider Routing: ✅/❌
- Memory System: ✅/❌

### IDE Features: ✅/❌
- IDE Layout: ✅/❌
- File Tree: ✅/❌
- Monaco Editor: ✅/❌

### Project Management: ✅/❌
- Project Generation: ✅/❌
- Project Upload: ✅/❌
- File Operations: ✅/❌

### Code Operations: ✅/❌
- Code Generation: ✅/❌
- Code Completion: ✅/❌
- Code Refactoring: ✅/❌
- Code Search: ✅/❌
- Code Indexing: ✅/❌

### Git Operations: ✅/❌
- Init: ✅/❌
- Status: ✅/❌
- Add/Commit: ✅/❌
- Branch: ✅/❌
- Log: ✅/❌

### Code Execution: ✅/❌
- Python: ✅/❌
- JavaScript: ✅/❌
- Safety: ✅/❌

### LSP Features: ✅/❌
- Completion: ✅/❌
- Definition: ✅/❌
- References: ✅/❌
- Hover: ✅/❌

### UI/UX: ✅/❌
- IDE Integration: ✅/❌
- Project Builder: ✅/❌
- Execution Panel: ✅/❌
- Git Panel: ✅/❌

### Security: ✅/❌
- Authentication: ✅/❌
- Validation: ✅/❌
- Error Handling: ✅/❌
- Safety: ✅/❌

### Performance: ✅/❌
- Response Times: ✅/❌
- Resource Usage: ✅/❌

### Issues Found:
1. [Issue description]
2. [Issue description]

### Next Steps:
1. [Action item]
2. [Action item]
```

---

## ✅ **SUCCESS CRITERIA**

### **Must Pass (Critical):**
- ✅ Resonant Chat works
- ✅ IDE opens and functions
- ✅ Project generation works
- ✅ File operations work
- ✅ Code generation works
- ✅ Git operations work
- ✅ Code execution works
- ✅ Authentication works
- ✅ Error handling works

### **Should Pass (Important):**
- ⚠️ All LSP features work
- ⚠️ Advanced refactoring works
- ⚠️ Performance acceptable
- ⚠️ UI/UX smooth

---

**Status:** 📋 **READY FOR COMPREHENSIVE TESTING**

