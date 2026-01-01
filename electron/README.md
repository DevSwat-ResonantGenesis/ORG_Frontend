# Electron Desktop App

This directory contains the Electron application code for the ResonantGraph AI desktop app.

## Structure

```
electron/
├── main/
│   ├── main.ts       # Main process (window management, menu, IPC)
│   └── preload.ts    # Preload script (secure IPC bridge)
├── tsconfig.json     # TypeScript config for Electron
└── README.md         # This file
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Running in Development

1. Start the Vite dev server in one terminal:
   ```bash
   npm run dev
   ```

2. In another terminal, build and start Electron:
   ```bash
   npm run electron:dev
   ```

   Or use the combined script (runs both):
   ```bash
   npm run electron:dev
   ```

### Building for Production

1. Build the React app:
   ```bash
   npm run build
   ```

2. Build the Electron main process:
   ```bash
   npm run electron:build
   ```

3. Package the application:
   ```bash
   npm run electron:package
   ```

   Platform-specific packages:
   ```bash
   npm run electron:package:mac
   npm run electron:package:win
   npm run electron:package:linux
   ```

## Architecture

### Main Process (`main.ts`)
- Manages application lifecycle
- Creates and manages BrowserWindow instances
- Handles application menu
- IPC communication with renderer process

### Preload Script (`preload.ts`)
- Runs in isolated context before renderer
- Exposes secure APIs to renderer via `contextBridge`
- No direct Node.js access for renderer (security)

### Renderer Process
- Your existing React app running in BrowserWindow
- Accesses Electron APIs via `window.electron`
- Full React/TypeScript/Vite workflow

## IPC Communication

The renderer can call Electron APIs through `window.electron`:

```typescript
// Get app version
const version = await window.electron.getAppVersion();

// Get platform
const platform = await window.electron.getPlatform();

// Listen to menu actions
window.electron.onMenuAction((action) => {
  console.log('Menu action:', action);
});
```

## Security

- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Sandbox mode enabled
- ✅ External link protection
- ✅ Navigation restrictions

## Auto-Updater

Auto-updater configuration is ready. To enable:

1. Set up GitHub releases
2. Configure `electron-builder.config.js` publish settings
3. Implement update checks in main process

## Troubleshooting

### Electron won't start
- Make sure Vite dev server is running on port 5175
- Check that `electron:build` completed successfully
- Verify `electron/dist/main.js` exists

### Build errors
- Run `npm run electron:build` first
- Check TypeScript errors in `electron/main/`
- Verify all dependencies are installed

### Port conflicts
- Change PORT in `main.ts` if 5175 is taken
- Update Vite config port as well

