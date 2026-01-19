# 🔧 IDE Service Restoration Plan

**Status**: IN PROGRESS  
**Goal**: Restore full IDE functionality with proper backend integration

---

## ✅ **What Exists**

### **Backend Services** ✅
- `ide_service/` - Full IDE backend service exists
- Provides: Terminal, File System, Git operations, Debugger
- Endpoints: `/api/ide/*`

### **Frontend Components** ✅
- `pages/IDE/IDEPage.tsx` - IDE UI exists
- `services/terminal.ts` - Terminal service
- `services/fileSystem.ts` - File operations
- `services/git.ts` - Git operations
- `services/debugger.ts` - Debug service
- `api/terminal.ts` - Terminal API client

### **API Clients** ✅
- `api/terminal.ts` - Connects to `/api/ide/terminal/*`
- `api/code.ts` - Code execution service

---

## 🚨 **Current Issues**

### **1. Hardcoded localhost in services/** ❌
```typescript
// services/terminal.ts
private ws = getWebSocket('ws://localhost:8080/ws/terminal');  // ❌ WRONG

// Should be:
private ws = getWebSocket(`${import.meta.env.VITE_WS_URL}/ws/terminal`);  // ✅ CORRECT
```

### **2. IDE Not in Navigation** ❌
- IDE page exists but not accessible from header menu
- Should be under "Dev Tools" section

### **3. Services May Not Be Wired to Gateway** ❌
- Need to verify gateway routes to ide_service
- Check docker-compose has ide_service running

---

## 🔧 **Fix Plan**

### **Step 1: Fix Service Endpoints** ✅ (IN PROGRESS)

**Files to fix**:
- [x] `services/terminal.ts` - Use `VITE_WS_URL` instead of localhost
- [ ] `services/fileSystem.ts` - Check for localhost
- [ ] `services/git.ts` - Check for localhost
- [ ] `services/debugger.ts` - Check for localhost

**Pattern**:
```typescript
// BEFORE ❌
const API_URL = 'http://localhost:8080';
const ws = getWebSocket('ws://localhost:8080/ws/terminal');

// AFTER ✅
import { ENV } from '../config/env';
const API_URL = ENV.apiUrl;
const ws = getWebSocket(`${ENV.wsUrl}/ws/terminal`);
```

---

### **Step 2: Verify Backend Routes**

**Check**:
1. Gateway routes `/api/ide/*` to `ide_service`
2. IDE service is running in docker-compose
3. WebSocket routes are configured

**Files to check**:
- `gateway/app/main.py` - IDE routes
- `docker-compose.yml` - ide_service container
- `ide_service/app/main.py` - Endpoints

---

### **Step 3: Add IDE to Navigation**

**File**: `src/components/Header.tsx` or navigation component

**Add under "Dev Tools" dropdown**:
```typescript
{
  label: 'Dev Tools',
  items: [
    { label: 'IDE', path: '/ide', icon: <Code /> },
    { label: 'Terminal', path: '/ide?tab=terminal' },
    { label: 'File Explorer', path: '/ide?tab=files' },
    { label: 'Git', path: '/ide?tab=git' },
  ]
}
```

---

### **Step 4: Test IDE Functionality**

**Test cases**:
- [ ] Open IDE page
- [ ] Create terminal session
- [ ] Execute commands in terminal
- [ ] Browse file system
- [ ] Read/write files
- [ ] Git operations (clone, commit, push)
- [ ] Debug session

---

## 📊 **IDE Service Architecture**

### **Backend Endpoints**:
```
POST   /api/ide/terminal/sessions          - Create terminal
GET    /api/ide/terminal/sessions          - List terminals
GET    /api/ide/terminal/sessions/{id}     - Get terminal
POST   /api/ide/terminal/sessions/{id}/execute - Execute command
DELETE /api/ide/terminal/sessions/{id}     - Close terminal
WS     /ws/terminal                         - Terminal WebSocket

GET    /api/ide/files                       - List files
GET    /api/ide/files/read                  - Read file
POST   /api/ide/files/write                 - Write file
DELETE /api/ide/files                       - Delete file

GET    /api/ide/git/status                  - Git status
POST   /api/ide/git/clone                   - Clone repo
POST   /api/ide/git/commit                  - Commit changes
POST   /api/ide/git/push                    - Push to remote
```

### **Frontend Services**:
```
services/terminal.ts     → /api/ide/terminal/*
services/fileSystem.ts   → /api/ide/files/*
services/git.ts          → /api/ide/git/*
services/debugger.ts     → /api/ide/debug/*
```

---

## 🎯 **Expected Result**

After fixes:
1. ✅ IDE accessible from header navigation under "Dev Tools"
2. ✅ All services use proper backend endpoints (no localhost)
3. ✅ Terminal works with WebSocket connection
4. ✅ File operations work
5. ✅ Git operations work
6. ✅ Full IDE functionality restored

---

## 📋 **Current Status**

**Fixed**:
- [x] `services/terminal.ts` - WebSocket endpoint

**Remaining**:
- [ ] Check other services for localhost
- [ ] Verify gateway routes
- [ ] Add to navigation
- [ ] Test complete flow

**Progress**: 1/6 steps complete
