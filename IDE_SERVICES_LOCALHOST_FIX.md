# 🚨 CRITICAL: IDE Services Localhost Hardcoding

**Status**: FOUND 10+ FILES WITH HARDCODED LOCALHOST  
**Impact**: IDE features completely broken in production

---

## 🔍 **Files With Hardcoded Localhost**

### **1. services/terminal.ts** ✅ FIXED
```typescript
// BEFORE ❌
private ws = getWebSocket('ws://localhost:8080/ws/terminal');
const response = await fetch('http://localhost:8080/api/terminal/exec', ...);

// AFTER ✅
private ws = getWebSocket(`${import.meta.env.VITE_WS_URL}/ws/terminal`);
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/terminal/exec`, ...);
```

### **2. services/fileSystem.ts** ❌ NEEDS FIX
```typescript
// Line 93: Load project
const response = await fetch(`http://localhost:8080/api/projects/tree?...`);

// Line 113: Read file
const response = await fetch(`http://localhost:8080/api/files/read?...`);

// Line 136: Write file
const response = await fetch('http://localhost:8080/api/files/write', ...);

// Line 170: Create file
const response = await fetch('http://localhost:8080/api/files/create', ...);

// Line 204: Create directory
const response = await fetch('http://localhost:8080/api/files/create', ...);

// Line 237: Delete file
const response = await fetch('http://localhost:8080/api/files/delete', ...);

// Line 266: Rename file
const response = await fetch('http://localhost:8080/api/files/rename', ...);

// Line 293: Move file
const response = await fetch('http://localhost:8080/api/files/move', ...);

// Line 324: Search files
const response = await fetch('http://localhost:8080/api/files/search', ...);
```

**Fix**: Replace ALL with `${import.meta.env.VITE_API_URL}/api/...`

---

### **3. services/git.ts** ❌ NEEDS FIX
```typescript
// Line 291: Git operations
private async request(endpoint: string, body?: unknown): Promise<any> {
  const response = await fetch(`http://localhost:8080/api${endpoint}`, ...);
}
```

**Fix**: Replace with `${import.meta.env.VITE_API_URL}/api${endpoint}`

---

### **4. services/debugger.ts** ❌ NEEDS FIX
```typescript
// Line 82: Debugger WebSocket
private ws = getWebSocket('ws://localhost:8080/ws/debug');
```

**Fix**: Replace with `${import.meta.env.VITE_WS_URL}/ws/debug`

---

### **5. services/api.ts** ❌ NEEDS FIX
```typescript
// Line 8-9: API base URLs
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const IDE_SERVICE_URL = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
```

**Fix**: Remove fallbacks, use ENV config
```typescript
import { ENV } from '../config/env';
const API_BASE_URL = ENV.apiUrl;
const IDE_SERVICE_URL = ENV.apiUrl; // IDE routes through gateway
```

---

### **6. services/aiAssistant.ts** ❌ NEEDS FIX
```typescript
// Line 253: LLM streaming
const response = await fetch('http://localhost:8000/api/llm/chat/stream', ...);
```

**Fix**: Replace with `${import.meta.env.VITE_API_URL}/api/llm/chat/stream`

---

### **7. services/reliability.ts** ❌ NEEDS FIX
```typescript
// Line 535: Gateway health check
const response = await fetch('http://localhost:8000/health');

// Line 544: IDE service health check
const response = await fetch('http://localhost:8080/health');
```

**Fix**: Use ENV variables for health checks

---

### **8. services/dsidp/IDEAccelerator.ts** ❌ NEEDS FIX
```typescript
// Line 419: Resonant node URL
constructor(resonantNodeUrl: string = 'http://localhost:8081') {
```

**Fix**: Use `import.meta.env.VITE_NODE_API_URL`

---

### **9. services/nodeApi.ts** ⚠️ PARTIAL FIX
```typescript
// Line 7: Has fallback (better than hardcoded)
const NODE_API_BASE = import.meta.env.VITE_NODE_API_URL || 'http://localhost:8081';
```

**Fix**: Remove fallback, use ENV config

---

### **10. services/embeddingService.ts** ✅ OK (Local model server)
```typescript
// Line 180: Local model file server
modelUrl = `http://localhost:8788/models/${modelId}/`;
```

**Note**: This is OK - it's for local Electron app model serving, not production API

---

## 🎯 **Backend Architecture**

### **IDE Service Routes Through Gateway**:
```
Frontend → Gateway (VITE_API_URL) → IDE Service
         ↓
    /api/ide/terminal/*
    /api/ide/files/*
    /api/ide/git/*
    /api/ide/debug/*
    
WebSocket:
    /ws/terminal
    /ws/debug
```

### **IDE Service Backend** ✅ EXISTS:
- Location: `ide_service/app/main.py`
- Endpoints: `/execute`, `/build`, `/chat`, `/ws/terminal`, `/ws/debug`
- Docker: Should be in docker-compose.yml

---

## 🔧 **Fix Pattern**

### **For HTTP Requests**:
```typescript
// BEFORE ❌
const response = await fetch('http://localhost:8080/api/files/read', ...);

// AFTER ✅
import { ENV } from '../config/env';
const response = await fetch(`${ENV.apiUrl}/api/ide/files/read`, ...);
```

### **For WebSocket Connections**:
```typescript
// BEFORE ❌
private ws = getWebSocket('ws://localhost:8080/ws/terminal');

// AFTER ✅
import { ENV } from '../config/env';
private ws = getWebSocket(`${ENV.wsUrl}/ws/terminal`);
```

---

## 📋 **Complete Fix Checklist**

### **High Priority** (IDE Core):
- [x] `services/terminal.ts` - WebSocket endpoint ✅
- [ ] `services/terminal.ts` - HTTP exec endpoint
- [ ] `services/fileSystem.ts` - ALL 9 fetch calls
- [ ] `services/git.ts` - Request method
- [ ] `services/debugger.ts` - WebSocket endpoint

### **Medium Priority** (Support):
- [ ] `services/api.ts` - Remove localhost fallbacks
- [ ] `services/aiAssistant.ts` - LLM streaming
- [ ] `services/reliability.ts` - Health checks
- [ ] `services/dsidp/IDEAccelerator.ts` - Node URL
- [ ] `services/nodeApi.ts` - Remove fallback

### **Low Priority** (OK as-is):
- [x] `services/embeddingService.ts` - Local model server ✅

---

## 🚀 **After Fixes**

### **1. Add IDE to Navigation**

**File**: Header component

```typescript
{
  label: 'Dev Tools',
  dropdown: true,
  items: [
    { label: 'IDE', path: '/ide', icon: <Code /> },
    { label: 'Terminal', path: '/ide?tab=terminal' },
    { label: 'Project Builder', path: '/build' },
    { label: 'Code Visualizer', path: '/code-visualizer' },
  ]
}
```

---

### **2. Verify Gateway Routes**

**Check**: `gateway/app/main.py` has IDE routes

```python
# Should exist:
app.include_router(ide_router, prefix="/api/ide", tags=["ide"])

# WebSocket routes:
@app.websocket("/ws/terminal")
@app.websocket("/ws/debug")
```

---

### **3. Test IDE Features**

- [ ] Open IDE page from navigation
- [ ] Create terminal session
- [ ] Execute commands
- [ ] Browse files
- [ ] Read/write files
- [ ] Git operations
- [ ] Debug session

---

## 📊 **Summary**

**Total Files**: 10  
**Fixed**: 1 (terminal.ts WebSocket)  
**Remaining**: 9 files with 20+ localhost references

**Estimated Time**: 1-2 hours to fix all files

**Impact**: IDE completely non-functional in production until fixed

---

## ⚠️ **Why This Matters**

These are NOT "localhost fallbacks" - they're the **actual IDE service endpoints** that users need to:
- Run terminal commands
- Edit files
- Use Git
- Debug code
- Build projects

**Without these fixes, the entire IDE feature is broken in production!**
