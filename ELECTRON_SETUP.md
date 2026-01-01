# 🚀 Electron Desktop App Setup

## Quick Start

### Development Mode

Run both Vite dev server and Electron together:

```bash
npm run dev:electron
```

Or run separately:

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
npm run electron:dev
```

### Building for Production

1. **Build the Electron main process:**
   ```bash
   npm run electron:build
   ```

2. **Build the React app:**
   ```bash
   npm run build
   ```

3. **Package the application:**
   ```bash
   npm run electron:package          # All platforms
   npm run electron:package:mac      # macOS only
   npm run electron:package:win      # Windows only
   npm run electron:package:linux    # Linux only
   ```

## Project Structure

```
electron/
├── main/
│   ├── main.ts       # Main process (window, menu, IPC)
│   └── preload.ts    # Preload script (secure IPC bridge)
├── tsconfig.json     # TypeScript config (CommonJS output)
└── README.md         # Detailed documentation

electron-builder.config.js   # Packaging configuration
scripts/dev-electron.js      # Combined dev script
```

## Features

✅ **Window Management**
- Auto-resize, minimize, maximize
- Window state persistence (coming soon)
- Multi-window support (coming soon)

✅ **Application Menu**
- File menu (New Project, Open Project, Quit)
- Edit menu (Copy, Paste, etc.)
- View menu (Reload, DevTools, Zoom)
- Help menu

✅ **Security**
- Context isolation enabled
- Node integration disabled in renderer
- Sandbox mode enabled
- External link protection

✅ **IPC Communication**
- Secure API bridge via preload script
- App version, platform, paths
- Menu action handlers

## Using Electron APIs in React

Access Electron APIs through `window.electron`:

```typescript
// Check if running in Electron
if (window.electron?.isElectron) {
  // Get app version
  const version = await window.electron.getAppVersion();
  
  // Get platform
  const platform = await window.electron.getPlatform();
  
  // Get app data path
  const appPath = await window.electron.getAppPath();
  
  // Listen to menu actions
  window.electron.onMenuAction((action) => {
    if (action === 'menu-new-project') {
      // Handle new project
    }
  });
}
```

## Development Workflow

1. **Start development:**
   ```bash
   npm run dev:electron
   ```

2. **Make changes:**
   - React changes: Auto-reload via Vite HMR
   - Electron main process: Rebuild required
     ```bash
     npm run electron:build
     ```

3. **Test production build:**
   ```bash
   npm run build
   npm run electron:build
   npm run electron:start
   ```

## Troubleshooting

### Electron won't start
- ✅ Make sure Vite is running on port 5175
- ✅ Check `electron/dist/main.js` exists (run `npm run electron:build`)
- ✅ Check for TypeScript errors

### Port conflicts
- Change PORT in `electron/main/main.ts` (default: 5175)
- Update Vite config port to match

### Build errors
- Clean build: `rm -rf electron/dist`
- Rebuild: `npm run electron:build`
- Check TypeScript: `tsc -p electron/tsconfig.json`

### Window doesn't load
- Check browser console (DevTools)
- Verify Vite is accessible at `http://localhost:5175`
- Check network tab for failed requests

## Next Steps

- [ ] Add window state persistence
- [ ] Implement auto-updater
- [ ] Add local database support
- [ ] Integrate Docker control
- [ ] Add file system access
- [ ] Implement offline mode

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [Electron Security Guide](https://www.electronjs.org/docs/tutorial/security)

