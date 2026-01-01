# 🔧 Integration Guide - All 6 Next-Gen Modules

**Date:** 2025-12-04  
**Status:** ✅ **ALL MODULES IMPLEMENTED - READY FOR INTEGRATION**

---

## 📋 Quick Start

### 1. Install Backend Dependencies

```bash
cd /Applications/ResonantGraphAIV0.1/backend
pip install y-websocket pyright-langserver pylsp debugpy gitpython cryptography
```

Or add to `fastapi_requirements.txt`:
```
y-websocket
pyright-langserver
pylsp
debugpy
gitpython
cryptography
```

### 2. Restart Backend

```bash
cd /Applications/ResonantGraphAIV0.1
docker compose restart api
```

### 3. Verify Backend is Running

```bash
curl http://localhost:8001/health
# Should return: {"status":"ok"}
```

---

## 🎯 Integration Steps

### Step 1: Add Components to IDE Layout

Edit `src/components/IDE/CursorIDELayout.tsx`:

```tsx
// Add imports
import { CollaborationPanel } from './CollaborationPanel';
import { CodeSearchPanel } from './CodeSearchPanel';
import { GitHubPanel } from './GitHubPanel';
import { DebuggerPanel } from './DebuggerPanel';
import { useCollaborativeEditor } from '@/hooks/useCollaborativeEditor';
import { useLSPClient } from '@/hooks/useLSPClient';

// Add state
const [showCollaboration, setShowCollaboration] = useState(false);
const [showCodeSearch, setShowCodeSearch] = useState(false);
const [showGitHub, setShowGitHub] = useState(false);
const [showDebugger, setShowDebugger] = useState(false);

// Add hooks
useCollaborativeEditor({
  fileId: currentFile?.path || '',
  editor: monacoEditor,
  enabled: showCollaboration,
});

useLSPClient({
  editor: monacoEditor,
  language: currentFile?.language || 'typescript',
  enabled: true,
});

// Add panels to layout
{showCollaboration && (
  <CollaborationPanel
    collaborators={collaborators}
    onClose={() => setShowCollaboration(false)}
  />
)}

{showCodeSearch && (
  <CodeSearchPanel
    onFileSelect={(file, line) => openFile(file, line)}
    onClose={() => setShowCodeSearch(false)}
  />
)}

{showGitHub && (
  <GitHubPanel
    projectId={projectId}
    onClose={() => setShowGitHub(false)}
  />
)}

{showDebugger && (
  <DebuggerPanel
    projectId={projectId}
    onClose={() => setShowDebugger(false)}
  />
)}
```

### Step 2: Add Toolbar Buttons

Add buttons to the IDE toolbar:

```tsx
<button onClick={() => setShowCollaboration(!showCollaboration)}>
  👥 Collaborate
</button>
<button onClick={() => setShowCodeSearch(!showCodeSearch)}>
  🔍 Search
</button>
<button onClick={() => setShowGitHub(!showGitHub)}>
  🐙 GitHub
</button>
<button onClick={() => setShowDebugger(!showDebugger)}>
  🐛 Debug
</button>
```

### Step 3: Configure Services

#### GitHub OAuth
Set environment variables:
```bash
export GITHUB_CLIENT_ID="your_client_id"
export GITHUB_CLIENT_SECRET="your_client_secret"
```

#### LSP Servers
Install language servers:
```bash
# TypeScript/JavaScript
npm install -g typescript-language-server

# Python
pip install python-lsp-server

# JSON
npm install -g vscode-json-languageserver
```

#### Debug Adapters
```bash
# Python
pip install debugpy

# Node.js (built-in)
# No installation needed
```

---

## 🧪 Testing Each Module

### Module 1: Real-time Collaboration
1. Open IDE in two browser windows
2. Open the same file in both
3. Type in one window
4. Verify changes appear in the other window
5. Check collaboration panel for user presence

### Module 2: Code Search
1. Click search button
2. Type a query
3. Verify results appear
4. Click a result to navigate to file
5. Test grep, semantic, and hybrid modes

### Module 3: GitHub Sync
1. Click GitHub button
2. Click "Connect GitHub"
3. Complete OAuth flow
4. Clone a repository
5. Test pull/push operations

### Module 4: IntelliSense
1. Open a TypeScript/Python file
2. Start typing
3. Verify auto-completion appears
4. Hover over symbols
5. Test "Go to Definition"

### Module 5: Multi-LLM Router
1. Select different models from dropdown
2. Make AI requests
3. Verify routing works
4. Check model status indicators

### Module 6: Debugger
1. Set a breakpoint (double-click line number)
2. Click "Start Debugging"
3. Verify execution pauses at breakpoint
4. Inspect variables
5. Use step controls
6. View call stack

---

## 🔧 Troubleshooting

### Backend Not Starting
- Check logs: `docker compose logs api`
- Verify all imports work
- Check for syntax errors

### WebSocket Connection Failed
- Verify WebSocket endpoint is accessible
- Check CORS configuration
- Verify authentication tokens

### LSP Not Working
- Verify LSP servers are installed
- Check server logs
- Verify WebSocket connection

### GitHub OAuth Failing
- Verify client ID/secret are set
- Check redirect URI matches
- Verify OAuth app permissions

---

## 📊 Module Status

| Module | Backend | Frontend | Integration | Testing |
|--------|---------|----------|-------------|---------|
| 1. Collaboration | ✅ | ✅ | ⏳ | ⏳ |
| 2. Code Search | ✅ | ✅ | ⏳ | ⏳ |
| 3. GitHub Sync | ✅ | ✅ | ⏳ | ⏳ |
| 4. IntelliSense | ✅ | ✅ | ⏳ | ⏳ |
| 5. Multi-LLM | ✅ | ✅ | ✅ | ⏳ |
| 6. Debugger | ✅ | ✅ | ⏳ | ⏳ |

---

## ✅ Next Steps

1. **Integrate Components** - Add to IDE layout
2. **Configure Services** - Set up OAuth, LSP, debug adapters
3. **Test Each Module** - Verify functionality
4. **Fix Issues** - Address any bugs
5. **Deploy** - Push to production

---

**Status:** ✅ **READY FOR INTEGRATION**

