# ⚡ Quick Test Reference - All Features

**Date:** 2025-01-29

---

## 🚀 **QUICK TEST COMMANDS**

### **Resonant Chat:**
```bash
# Send message
curl -X POST https://dev-swat.com/api/resonant-chat/message \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"message": "Hello", "preferred_provider": "auto"}'

# Get anchors
curl https://dev-swat.com/api/resonant-chat/anchors \
  -H "Cookie: session-cookie"
```

### **Project Generation:**
```bash
curl -X POST https://dev-swat.com/api/code/project/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"description": "React todo app", "project_type": "react"}'
```

### **Code Generation:**
```bash
curl -X POST https://dev-swat.com/api/code/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"description": "Add function", "language": "python"}'
```

### **File Operations:**
```bash
# List files
curl https://dev-swat.com/api/code/project/files \
  -H "Cookie: session-cookie"

# Read file
curl -X POST https://dev-swat.com/api/code/project/file/read \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"file_path": "src/App.jsx"}'

# Write file
curl -X POST https://dev-swat.com/api/code/project/file/write \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"file_path": "test.js", "content": "console.log(1);"}'
```

### **Code Search:**
```bash
# Hash Sphere search
curl "https://dev-swat.com/api/code/search?query=function&limit=10" \
  -H "Cookie: session-cookie"

# ML search
curl "https://dev-swat.com/api/code/search/ml?query=function&limit=10" \
  -H "Cookie: session-cookie"
```

### **Git Operations:**
```bash
# Init repo
curl -X POST https://dev-swat.com/api/git/init \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"project_id": "test"}'

# Status
curl -X POST https://dev-swat.com/api/git/status \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"project_id": "test"}'

# Commit
curl -X POST https://dev-swat.com/api/git/commit \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"project_id": "test", "message": "Test commit"}'
```

### **Code Execution:**
```bash
curl -X POST https://dev-swat.com/api/code/execute \
  -H "Content-Type: application/json" \
  -H "Cookie: session-cookie" \
  -d '{"code": "print(1+1)", "language": "python"}'
```

---

## 🎯 **UI TESTING CHECKLIST**

### **Resonant Chat:**
1. ✅ Send message
2. ✅ Check hash/anchors/resonance
3. ✅ Test provider selection
4. ✅ Verify memory anchors load

### **IDE:**
1. ✅ Type "open ide" in chat
2. ✅ Upload project ZIP
3. ✅ Open file in editor
4. ✅ Edit and save file
5. ✅ Delete file
6. ✅ Create new file

### **Project Builder:**
1. ✅ Ask: "Create a React todo app"
2. ✅ Verify project generated
3. ✅ Download ZIP
4. ✅ Download individual files

### **Code Features:**
1. ✅ Generate code from description
2. ✅ Refactor code
3. ✅ Search codebase
4. ✅ Execute code

### **Git:**
1. ✅ Open Git panel
2. ✅ Initialize repo
3. ✅ Stage files
4. ✅ Commit changes
5. ✅ Create branch

---

## 📋 **ALL ENDPOINTS TO TEST**

### **Resonant Chat (8):**
- POST `/resonant-chat/message`
- GET `/resonant-chat/history`
- GET `/resonant-chat/anchors`
- GET `/resonant-chat/clusters`
- POST `/resonant-chat/create`
- GET `/resonant-chat/providers`
- GET `/resonant-chat/provider/stats`
- GET `/resonant-chat/provider/health`

### **Code Operations (12):**
- POST `/code/complete`
- POST `/code/generate`
- POST `/code/refactor`
- POST `/code/refactor/advanced`
- POST `/code/index`
- GET `/code/search`
- GET `/code/search/ml`
- POST `/code/project/generate`
- GET `/code/project/files`
- POST `/code/project/file/read`
- POST `/code/project/file/write`
- POST `/code/project/file/delete`
- POST `/code/project/upload`
- POST `/code/execute`

### **Git Operations (7):**
- POST `/git/init`
- POST `/git/status`
- POST `/git/add`
- POST `/git/commit`
- POST `/git/branch`
- GET `/git/branches`
- GET `/git/log`

### **LSP Features (4):**
- POST `/code/lsp/completion`
- POST `/code/lsp/definition`
- POST `/code/lsp/references`
- POST `/code/lsp/hover`

**Total: 31 endpoints to test**

---

**Status:** ✅ **READY**

