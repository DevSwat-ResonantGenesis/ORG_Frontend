# 🧪 IDE Testing Checklist

## ✅ Installation Status

### LSP Servers
- [ ] TypeScript Language Server installed
- [ ] Python LSP Server installed

### Backend Dependencies
- [ ] debugpy installed
- [ ] gitpython installed
- [ ] httpx installed
- [ ] pylsp installed

---

## 🧪 Testing Checklist

### 1. Core IDE Features

#### Project Management
- [ ] **Upload Project**
  - [ ] Upload ZIP file
  - [ ] Files appear in file tree
  - [ ] Files can be opened in editor
  
- [ ] **File Operations**
  - [ ] Create new file
  - [ ] Edit existing file
  - [ ] Save file (Ctrl+S / Cmd+S)
  - [ ] Delete file
  - [ ] Rename file
  - [ ] Move file (drag & drop)

#### Code Editor
- [ ] **Monaco Editor**
  - [ ] Syntax highlighting works
  - [ ] Code completion (LSP)
  - [ ] Hover information (LSP)
  - [ ] Go to definition (LSP)
  - [ ] Find references (LSP)
  - [ ] Multi-file tabs
  - [ ] Find & replace
  - [ ] Code folding

#### Git Integration
- [ ] **Git Operations**
  - [ ] Initialize git repository
  - [ ] View git status
  - [ ] Stage files
  - [ ] Commit changes (with AI message)
  - [ ] View commit history
  - [ ] Create branch
  - [ ] Switch branch

#### Code Execution
- [ ] **Run Code**
  - [ ] Execute Python script
  - [ ] Execute JavaScript/TypeScript
  - [ ] View output
  - [ ] Handle errors
  - [ ] Execution time tracking

#### Code Search
- [ ] **Search Features**
  - [ ] Semantic search
  - [ ] Grep-style search
  - [ ] Filename search
  - [ ] Real-time search results

---

### 2. Advanced Features

#### GitHub Sync
- [ ] **OAuth Flow**
  - [ ] Click "Connect GitHub"
  - [ ] Redirects to GitHub
  - [ ] Authorize app
  - [ ] Redirects back to IDE
  - [ ] Shows "Connected" status

- [ ] **Repository Operations**
  - [ ] Clone repository
  - [ ] Pull changes
  - [ ] Push changes
  - [ ] List repositories

#### Collaboration
- [ ] **Real-time Editing**
  - [ ] Open collaboration panel
  - [ ] Create/join room
  - [ ] See other users
  - [ ] Real-time cursor positions
  - [ ] Live edits sync

#### Debugger
- [ ] **Debugging**
  - [ ] Set breakpoints
  - [ ] Start debug session
  - [ ] Step through code
  - [ ] Inspect variables
  - [ ] View call stack
  - [ ] Continue execution

---

### 3. Power Modules (A-E)

- [ ] **Module A: Project Runner**
  - [ ] Run project command
  - [ ] View output
  - [ ] Auto-detect project type

- [ ] **Module B: AI Patch System**
  - [ ] Generate AI patch
  - [ ] Preview changes
  - [ ] Apply/reject patch

- [ ] **Module C: Inline AI Comments**
  - [ ] Explain code snippet
  - [ ] Show examples
  - [ ] Related concepts

- [ ] **Module D: Project Download**
  - [ ] Download project as ZIP
  - [ ] Preserve structure
  - [ ] Skip hidden files

- [ ] **Module E: AST Auto-Refactor**
  - [ ] Rename symbols
  - [ ] Reorder imports
  - [ ] Safety checks

---

### 4. UI/UX Testing

- [ ] **Layout**
  - [ ] File tree resizable
  - [ ] Panels can be toggled
  - [ ] Responsive design
  - [ ] Dark/light theme

- [ ] **Performance**
  - [ ] Fast file loading
  - [ ] Smooth scrolling
  - [ ] No lag when typing
  - [ ] Quick search results

- [ ] **Error Handling**
  - [ ] 404 errors show custom page
  - [ ] API errors show messages
  - [ ] Network errors handled
  - [ ] Graceful fallbacks

---

## 📝 Test Results Template

### Test Date: ___________

#### Installation
- TypeScript LSP: ✅ / ❌
- Python LSP: ✅ / ❌
- Backend Dependencies: ✅ / ❌

#### Core Features
- Project Upload: ✅ / ❌
- File Operations: ✅ / ❌
- Git Integration: ✅ / ❌
- Code Execution: ✅ / ❌
- Code Search: ✅ / ❌

#### Advanced Features
- GitHub Sync: ✅ / ❌
- Collaboration: ✅ / ❌
- Debugger: ✅ / ❌

#### Issues Found
1. _________________________
2. _________________________
3. _________________________

---

## 🐛 Troubleshooting

### If LSP doesn't work:
```bash
# Check if installed
which typescript-language-server
pylsp --version

# Check backend logs
docker compose logs api | grep lsp
```

### If GitHub OAuth fails:
```bash
# Check environment variables
docker compose exec api printenv | grep GITHUB

# Check backend logs
docker compose logs api | grep github
```

### If Debugger doesn't work:
```bash
# Check if debugpy is installed
docker compose exec api python -c "import debugpy; print(debugpy.__version__)"

# Check backend logs
docker compose logs api | grep debug
```

---

**Happy Testing!** 🚀
