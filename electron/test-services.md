# Electron Services Test Checklist

## ✅ Build Verification

- [x] TypeScript compilation successful
- [x] All services compiled to `electron/dist/services/`
- [x] Main process includes all IPC handlers
- [x] Preload script exposes all APIs

## 🧪 Manual Testing Guide

### 1. Start Electron App

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron
npm run electron:dev
```

### 2. Test Backend Service

Open DevTools Console and run:

```javascript
// Check backend status
window.electron.backend.checkStatus().then(console.log);

// Start backend (if not running)
window.electron.backend.startDocker().then(console.log);

// Get backend path
window.electron.backend.getBackendPath().then(console.log);
```

### 3. Test Docker Service

```javascript
// Check Docker status
window.electron.docker.checkStatus().then(console.log);

// List containers
window.electron.docker.listContainers().then(console.log);

// If backend container is running:
// window.electron.docker.restartContainer('container-id').then(console.log);
```

### 4. Test LSP Service

```javascript
// List available servers
window.electron.lsp.listServers().then(console.log);

// Check if TypeScript LSP is installed
window.electron.lsp.checkInstalled('typescript').then(console.log);

// Start TypeScript LSP server
window.electron.lsp.startServer('typescript').then(console.log);
```

### 5. Test File Watcher

```javascript
// Watch a directory (use your project path)
window.electron.fileWatcher.watch('/path/to/project').then(console.log);

// Listen to file changes
const cleanup = window.electron.fileWatcher.onFileChange((event) => {
  console.log('File change:', event);
});

// List active watchers
window.electron.fileWatcher.listActive().then(console.log);
```

## ✅ Expected Results

- Backend Service: Should detect backend path and check status
- Docker Service: Should list containers if Docker is running
- LSP Service: Should list servers (may show as not installed if tools not present)
- File Watcher: Should start watching and emit events on file changes

## 📝 Notes

- All services are async and return Promises
- Errors are handled gracefully (won't crash the app)
- Services work independently (can use any combination)

