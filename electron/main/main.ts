import { app, BrowserWindow, Menu, ipcMain, shell } from 'electron';
import * as path from 'path';
import { backendService, dockerService, lspService, fileWatcherService, updaterService, windowStateService, platformService } from './services';
import { WindowManager } from './utils/windowManager';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
const windowManager = new WindowManager();
const MAIN_WINDOW_ID = 'main';

const PORT = 5175;
const isDevelopment = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): void {
  const startUrl = isDevelopment
    ? `http://localhost:${PORT}`
    : `file://${path.join(__dirname, '../renderer/index.html')}`;

  // Restore window state or use defaults
  const defaultBounds = {
    width: 1600,
    height: 1000,
  };

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: defaultBounds.width,
    height: defaultBounds.height,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#1e1e1e',
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Restore window state (position, size, maximized)
  windowStateService.restoreWindowState(MAIN_WINDOW_ID, mainWindow, defaultBounds);

  // Track window with window manager
  windowManager.getWindow(MAIN_WINDOW_ID) || windowManager.windows.set(MAIN_WINDOW_ID, mainWindow);

  // Load the app
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Open DevTools in development
    if (isDevelopment) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Save window state on move/resize
  const saveState = () => {
    if (mainWindow) {
      windowStateService.saveWindowState(MAIN_WINDOW_ID, mainWindow);
    }
  };

  mainWindow.on('move', saveState);
  mainWindow.on('resize', saveState);
  mainWindow.on('maximize', saveState);
  mainWindow.on('unmaximize', saveState);

  // Handle window closed
  mainWindow.on('closed', () => {
    // Save final state
    if (mainWindow) {
      windowStateService.saveWindowState(MAIN_WINDOW_ID, mainWindow);
    }
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (isDevelopment) {
      // Allow localhost in development
      if (parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    } else {
      // In production, only allow file:// protocol
      if (parsedUrl.protocol !== 'file:') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    }
  });
}

// Create application menu
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Send IPC message to renderer
            mainWindow?.webContents.send('menu-new-project');
          },
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu-open-project');
          },
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'close' as const },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' as const },
          { role: 'front' as const },
        ] : []),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            // Show about dialog
            mainWindow?.webContents.send('menu-about');
          },
        },
        {
          label: 'Learn More',
          click: () => {
            shell.openExternal('https://resonantgraph.ai');
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
  setupUpdaterListeners();

  // Check for updates after a short delay (5 seconds)
  // This gives the app time to fully load before checking
  if (app.isPackaged) {
    setTimeout(() => {
      updaterService.checkForUpdates(false).catch((error) => {
        console.error('Failed to check for updates on startup:', error);
      });
    }, 5000);
  }

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});

// Handle app protocol for deep linking (optional)
app.setAsDefaultProtocolClient('resonantgraph');

// ==========================================
// Phase 2: Local Services IPC Handlers
// ==========================================

// Backend Service IPC Handlers
ipcMain.handle('backend:check-status', async () => {
  return await backendService.checkStatus();
});

ipcMain.handle('backend:start-docker', async () => {
  return await backendService.startWithDocker();
});

ipcMain.handle('backend:stop-docker', async () => {
  return await backendService.stopDocker();
});

ipcMain.handle('backend:get-path', () => {
  return backendService.getBackendPath();
});

ipcMain.handle('backend:set-path', (_event, path: string) => {
  backendService.setBackendPath(path);
  return { success: true };
});

// Docker Service IPC Handlers
ipcMain.handle('docker:check-status', async () => {
  return await dockerService.checkDockerStatus();
});

ipcMain.handle('docker:list-containers', async () => {
  return await dockerService.listContainers();
});

ipcMain.handle('docker:start-container', async (_event, containerId: string) => {
  return await dockerService.startContainer(containerId);
});

ipcMain.handle('docker:stop-container', async (_event, containerId: string) => {
  return await dockerService.stopContainer(containerId);
});

ipcMain.handle('docker:restart-container', async (_event, containerId: string) => {
  return await dockerService.restartContainer(containerId);
});

ipcMain.handle('docker:get-logs', async (_event, containerId: string, lines: number = 100) => {
  return await dockerService.getContainerLogs(containerId, lines);
});

// LSP Service IPC Handlers
ipcMain.handle('lsp:list-servers', () => {
  return lspService.listServers();
});

ipcMain.handle('lsp:get-server-status', (_event, serverId: string) => {
  return lspService.getServerStatus(serverId);
});

ipcMain.handle('lsp:check-installed', async (_event, serverId: string) => {
  return await lspService.checkServerInstalled(serverId);
});

ipcMain.handle('lsp:start-server', async (_event, serverId: string) => {
  return await lspService.startServer(serverId);
});

ipcMain.handle('lsp:stop-server', async (_event, serverId: string) => {
  return await lspService.stopServer(serverId);
});

// File Watcher Service IPC Handlers
ipcMain.handle('file-watcher:watch', async (_event, directoryPath: string) => {
  // Create a callback that sends events to renderer
  const watcherId = await fileWatcherService.watchDirectory(directoryPath, (event) => {
    mainWindow?.webContents.send('file-watcher:event', event);
  });
  return watcherId;
});

ipcMain.handle('file-watcher:unwatch', async (_event, watcherId: string) => {
  return await fileWatcherService.unwatchDirectory(watcherId);
});

ipcMain.handle('file-watcher:list-active', () => {
  return fileWatcherService.getActiveWatchers();
});

// ==========================================
// Phase 3: Auto-Updater IPC Handlers
// ==========================================

ipcMain.handle('updater:check-for-updates', async (_event, allowPrerelease: boolean = false) => {
  return await updaterService.checkForUpdates(allowPrerelease);
});

ipcMain.handle('updater:download-update', async () => {
  return await updaterService.downloadUpdate();
});

ipcMain.handle('updater:install-update', async () => {
  await updaterService.installUpdate();
});

ipcMain.handle('updater:get-current-version', () => {
  return updaterService.getCurrentVersion();
});

ipcMain.handle('updater:is-update-available', () => {
  return updaterService.isUpdateAvailable();
});

ipcMain.handle('updater:get-channel', () => {
  return updaterService.getChannel();
});

ipcMain.handle('updater:set-channel', (_event, channel: 'latest' | 'beta') => {
  updaterService.setChannel(channel);
  return { success: true };
});

/**
 * Setup updater event listeners to send events to renderer
 */
function setupUpdaterListeners(): void {
  updaterService.onUpdateAvailable((info) => {
    mainWindow?.webContents.send('updater:update-available', info);
  });

  updaterService.onUpdateNotAvailable(() => {
    mainWindow?.webContents.send('updater:update-not-available');
  });

  updaterService.onUpdateDownloaded(() => {
    mainWindow?.webContents.send('updater:update-downloaded');
  });

  updaterService.onDownloadProgress((progress) => {
    mainWindow?.webContents.send('updater:download-progress', progress);
  });

  updaterService.onError((error) => {
    mainWindow?.webContents.send('updater:error', {
      message: error.message,
      stack: error.stack,
    });
  });
}

// Cleanup on app quit
app.on('before-quit', async () => {
  // Stop all LSP servers
  await lspService.stopAllServers();
  
  // Stop all file watchers
  await fileWatcherService.stopAll();
});
