# ⚙️ Configuration Guide - All 6 Next-Gen Modules

**Date:** 2025-12-04  
**Status:** ✅ **CONFIGURATION REQUIRED**

---

## 🔧 Module 1: Real-time Collaboration

### Configuration
- **WebSocket URL:** `ws://localhost:8001/collaboration/ws/{room_id}`
- **No additional config needed** - Works out of the box

### Testing
1. Open IDE in two browser windows
2. Open the same file in both
3. Type in one window
4. Verify changes appear in the other

---

## 🔧 Module 2: AI Code Search

### Configuration
- **Search Endpoint:** `POST /code/search/`
- **No additional config needed** - Uses existing ML worker for embeddings

### Testing
1. Click 🔍 button in toolbar
2. Type a search query
3. Verify results appear
4. Click result to navigate

---

## 🔧 Module 3: GitHub Sync

### Required Configuration

#### Step 1: Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set:
   - **Application name:** ResonantGraph IDE
   - **Homepage URL:** `http://localhost:5175`
   - **Authorization callback URL:** `http://localhost:8001/github/oauth/callback`
4. Copy **Client ID** and **Client Secret**

#### Step 2: Set Environment Variables
```bash
export GITHUB_CLIENT_ID="your_client_id_here"
export GITHUB_CLIENT_SECRET="your_client_secret_here"
export API_BASE_URL="http://localhost:8001"
export FRONTEND_URL="http://localhost:5175"
```

Or add to `.env` file:
```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
API_BASE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:5175
```

#### Step 3: Restart Backend
```bash
cd /Applications/ResonantGraphAIV0.1
docker compose restart api
```

### Testing
1. Click 🐙 button in toolbar
2. Click "Connect GitHub"
3. Complete OAuth flow
4. Test clone/pull/push operations

---

## 🔧 Module 4: IntelliSense (LSP)

### Required Installation

#### TypeScript/JavaScript
```bash
npm install -g typescript-language-server
```

#### Python
```bash
pip install python-lsp-server
```

#### JSON
```bash
npm install -g vscode-json-languageserver
```

### Configuration
- **LSP WebSocket:** `ws://localhost:8001/lsp/ws/{language}`
- **Workspace Path:** Automatically detected from project

### Testing
1. Open a TypeScript/Python file
2. Start typing
3. Verify auto-completion appears
4. Hover over symbols for tooltips

---

## 🔧 Module 5: Multi-LLM Router

### Configuration
- **Already configured** - Uses existing `MultiAIRouter` service
- **Model selector** already in UI

### Testing
1. Select different models from dropdown
2. Make AI requests
3. Verify routing works correctly

---

## 🔧 Module 6: Debugger

### Required Installation

#### Python
```bash
pip install debugpy
```

#### Node.js
- Built-in, no installation needed

### Configuration
- **Debug Endpoint:** `POST /debug/start`
- **Port:** 5678 (Python), 9229 (Node.js)

### Testing
1. Set a breakpoint (double-click line number)
2. Click 🐛 button in toolbar
3. Click "Start Debugging"
4. Verify execution pauses
5. Inspect variables and stack

---

## 🚀 Quick Setup Checklist

- [ ] Install backend dependencies: `pip install gitpython cryptography debugpy python-lsp-server pyright`
- [ ] Install frontend dependencies: `npm install yjs y-websocket y-monaco monaco-languageclient vscode-ws-jsonrpc`
- [ ] Configure GitHub OAuth (Module 3)
- [ ] Install LSP servers (Module 4)
- [ ] Install debug adapters (Module 6)
- [ ] Restart backend: `docker compose restart api`
- [ ] Restart frontend: `npm run dev`
- [ ] Test each module

---

## 📝 Environment Variables Summary

```bash
# GitHub OAuth (Module 3)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
API_BASE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:5175

# Optional: LSP Server Paths
TYPESCRIPT_LSP_PATH=/usr/local/bin/typescript-language-server
PYTHON_LSP_PATH=/usr/local/bin/pylsp
```

---

## ✅ Verification

After configuration, verify each module:

1. **Collaboration:** Open two browser windows, edit same file
2. **Code Search:** Click 🔍, search for code
3. **GitHub:** Click 🐙, connect GitHub account
4. **IntelliSense:** Type in editor, see autocomplete
5. **Multi-LLM:** Select model, make AI request
6. **Debugger:** Set breakpoint, start debugging

---

**Status:** ⚙️ **CONFIGURATION REQUIRED**

