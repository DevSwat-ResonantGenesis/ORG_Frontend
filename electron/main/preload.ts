import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // Menu actions (listen to menu clicks)
  onMenuAction: (callback: (action: string) => void) => {
    const handlers = [
      'menu-new-project',
      'menu-open-project',
      'menu-about',
    ];

    handlers.forEach((action) => {
      ipcRenderer.on(action, () => callback(action));
    });

    // Return cleanup function
    return () => {
      handlers.forEach((action) => {
        ipcRenderer.removeAllListeners(action);
      });
    };
  },

  // System notifications
  showNotification: (title: string, body: string) => {
    // Use browser Notification API, which Electron supports
    if (typeof window !== 'undefined' && 'Notification' in window) {
      new (window as any).Notification(title, { body });
    }
  },

  // Platform info
  isElectron: true,
  platform: process.platform,

  // ==========================================
  // Phase 2: Local Services APIs
  // ==========================================

  // Backend Service
  backend: {
    checkStatus: () => ipcRenderer.invoke('backend:check-status'),
    startDocker: () => ipcRenderer.invoke('backend:start-docker'),
    stopDocker: () => ipcRenderer.invoke('backend:stop-docker'),
    getBackendPath: () => ipcRenderer.invoke('backend:get-path'),
    setBackendPath: (path: string) => ipcRenderer.invoke('backend:set-path', path),
  },

  // Docker Service
  docker: {
    checkStatus: () => ipcRenderer.invoke('docker:check-status'),
    listContainers: () => ipcRenderer.invoke('docker:list-containers'),
    startContainer: (containerId: string) => ipcRenderer.invoke('docker:start-container', containerId),
    stopContainer: (containerId: string) => ipcRenderer.invoke('docker:stop-container', containerId),
    restartContainer: (containerId: string) => ipcRenderer.invoke('docker:restart-container', containerId),
    getLogs: (containerId: string, lines?: number) => ipcRenderer.invoke('docker:get-logs', containerId, lines),
  },

  // LSP Service
  lsp: {
    listServers: () => ipcRenderer.invoke('lsp:list-servers'),
    getServerStatus: (serverId: string) => ipcRenderer.invoke('lsp:get-server-status', serverId),
    checkInstalled: (serverId: string) => ipcRenderer.invoke('lsp:check-installed', serverId),
    startServer: (serverId: string) => ipcRenderer.invoke('lsp:start-server', serverId),
    stopServer: (serverId: string) => ipcRenderer.invoke('lsp:stop-server', serverId),
  },

  // File Watcher Service
      fileWatcher: {
        watch: (directoryPath: string) => ipcRenderer.invoke('file-watcher:watch', directoryPath),
        unwatch: (watcherId: string) => ipcRenderer.invoke('file-watcher:unwatch', watcherId),
        listActive: () => ipcRenderer.invoke('file-watcher:list-active'),
        onFileChange: (callback: (event: any) => void) => {
          ipcRenderer.on('file-watcher:event', (_event, data) => callback(data));
          return () => {
            ipcRenderer.removeAllListeners('file-watcher:event');
          };
        },
      },

      // ==========================================
      // Phase 3: Auto-Updater APIs
      // ==========================================
      updater: {
        checkForUpdates: (allowPrerelease?: boolean) => 
          ipcRenderer.invoke('updater:check-for-updates', allowPrerelease),
        downloadUpdate: () => ipcRenderer.invoke('updater:download-update'),
        installUpdate: () => ipcRenderer.invoke('updater:install-update'),
        getCurrentVersion: () => ipcRenderer.invoke('updater:get-current-version'),
        isUpdateAvailable: () => ipcRenderer.invoke('updater:is-update-available'),
        getChannel: () => ipcRenderer.invoke('updater:get-channel'),
        setChannel: (channel: 'latest' | 'beta') => 
          ipcRenderer.invoke('updater:set-channel', channel),
        onUpdateAvailable: (callback: (info: any) => void) => {
          ipcRenderer.on('updater:update-available', (_event, data) => callback(data));
          return () => {
            ipcRenderer.removeAllListeners('updater:update-available');
          };
        },
        onUpdateNotAvailable: (callback: () => void) => {
          ipcRenderer.on('updater:update-not-available', () => callback());
          return () => {
            ipcRenderer.removeAllListeners('updater:update-not-available');
          };
        },
        onUpdateDownloaded: (callback: () => void) => {
          ipcRenderer.on('updater:update-downloaded', () => callback());
          return () => {
            ipcRenderer.removeAllListeners('updater:update-downloaded');
          };
        },
        onDownloadProgress: (callback: (progress: any) => void) => {
          ipcRenderer.on('updater:download-progress', (_event, data) => callback(data));
          return () => {
            ipcRenderer.removeAllListeners('updater:download-progress');
          };
        },
        onError: (callback: (error: any) => void) => {
          ipcRenderer.on('updater:error', (_event, data) => callback(data));
          return () => {
            ipcRenderer.removeAllListeners('updater:error');
          };
        },
      },
    });

// Type definitions for TypeScript
declare global {
  interface Window {
    electron: {
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      getAppPath: () => Promise<string>;
      onMenuAction: (callback: (action: string) => void) => () => void;
      showNotification: (title: string, body: string) => void;
      isElectron: boolean;
      platform: string;
      // Phase 2: Local Services
      backend: {
        checkStatus: () => Promise<any>;
        startDocker: () => Promise<{ success: boolean; message: string }>;
        stopDocker: () => Promise<{ success: boolean; message: string }>;
        getBackendPath: () => Promise<string>;
        setBackendPath: (path: string) => Promise<any>;
      };
      docker: {
        checkStatus: () => Promise<any>;
        listContainers: () => Promise<any[]>;
        startContainer: (containerId: string) => Promise<{ success: boolean; message: string }>;
        stopContainer: (containerId: string) => Promise<{ success: boolean; message: string }>;
        restartContainer: (containerId: string) => Promise<{ success: boolean; message: string }>;
        getLogs: (containerId: string, lines?: number) => Promise<string>;
      };
      lsp: {
        listServers: () => Promise<any[]>;
        getServerStatus: (serverId: string) => Promise<any>;
        checkInstalled: (serverId: string) => Promise<boolean>;
        startServer: (serverId: string) => Promise<{ success: boolean; message: string; port?: number }>;
        stopServer: (serverId: string) => Promise<{ success: boolean; message: string }>;
      };
      fileWatcher: {
        watch: (directoryPath: string) => Promise<any>;
        unwatch: (watcherId: string) => Promise<any>;
        listActive: () => Promise<string[]>;
        onFileChange: (callback: (event: any) => void) => () => void;
      };
      // Phase 3: Auto-Updater
      updater: {
        checkForUpdates: (allowPrerelease?: boolean) => Promise<any>;
        downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
        installUpdate: () => Promise<void>;
        getCurrentVersion: () => Promise<string>;
        isUpdateAvailable: () => Promise<boolean>;
        getChannel: () => Promise<string>;
        setChannel: (channel: 'latest' | 'beta') => Promise<{ success: boolean }>;
        onUpdateAvailable: (callback: (info: any) => void) => () => void;
        onUpdateNotAvailable: (callback: () => void) => () => void;
        onUpdateDownloaded: (callback: () => void) => () => void;
        onDownloadProgress: (callback: (progress: any) => void) => () => void;
        onError: (callback: (error: any) => void) => () => void;
      };
    };
  }
}

