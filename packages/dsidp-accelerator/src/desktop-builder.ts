/**
 * DSID-P Desktop Builder
 * 
 * Electron and Tauri app generation:
 * - Project scaffolding
 * - Window management
 * - Native API integration
 * - Auto-updates
 * - Build and package automation
 */

import { LLMEngine } from './llm-engine';

// ============== TYPES ==============

export interface DesktopConfig {
  framework: DesktopFramework;
  projectName: string;
  appId: string;
  platforms: DesktopPlatform[];
  features: DesktopFeature[];
  windowConfig: WindowConfig;
  buildConfig?: BuildConfig;
}

export type DesktopFramework = 'electron' | 'tauri';
export type DesktopPlatform = 'windows' | 'macos' | 'linux';
export type DesktopFeature = 
  | 'auto-update'
  | 'tray-icon'
  | 'native-menus'
  | 'file-associations'
  | 'deep-linking'
  | 'notifications'
  | 'single-instance';

export interface WindowConfig {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  resizable: boolean;
  frame: boolean;
  transparent?: boolean;
  alwaysOnTop?: boolean;
}

export interface BuildConfig {
  appId: string;
  productName: string;
  copyright?: string;
  icon?: string;
}

export interface DesktopProject {
  name: string;
  framework: DesktopFramework;
  files: ProjectFile[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export interface ProjectFile {
  path: string;
  content: string;
}

// ============== ELECTRON BUILDER ==============

export class ElectronBuilder {
  private config: DesktopConfig;
  private llm: LLMEngine | null;

  constructor(config: DesktopConfig, llmEngine?: LLMEngine) {
    this.config = config;
    this.llm = llmEngine || null;
  }

  async createProject(): Promise<DesktopProject> {
    const files: ProjectFile[] = [
      this.generatePackageJson(),
      this.generateMain(),
      this.generatePreload(),
      this.generateRenderer(),
      this.generateIndex(),
      this.generateElectronBuilder(),
    ];

    if (this.config.features.includes('tray-icon')) {
      files.push(this.generateTrayModule());
    }

    if (this.config.features.includes('auto-update')) {
      files.push(this.generateUpdaterModule());
    }

    return {
      name: this.config.projectName,
      framework: 'electron',
      files,
      dependencies: this.getDependencies(),
      devDependencies: this.getDevDependencies(),
      scripts: this.getScripts(),
    };
  }

  private generatePackageJson(): ProjectFile {
    return {
      path: 'package.json',
      content: JSON.stringify({
        name: this.config.projectName.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        main: 'dist/main/index.js',
        scripts: this.getScripts(),
        dependencies: this.getDependencies(),
        devDependencies: this.getDevDependencies(),
      }, null, 2),
    };
  }

  private generateMain(): ProjectFile {
    return {
      path: 'src/main/index.ts',
      content: `import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
${this.config.features.includes('auto-update') ? "import { setupAutoUpdater } from './updater';" : ''}
${this.config.features.includes('tray-icon') ? "import { createTray } from './tray';" : ''}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: ${this.config.windowConfig.width},
    height: ${this.config.windowConfig.height},
    minWidth: ${this.config.windowConfig.minWidth || 400},
    minHeight: ${this.config.windowConfig.minHeight || 300},
    resizable: ${this.config.windowConfig.resizable},
    frame: ${this.config.windowConfig.frame},
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  ${this.config.features.includes('tray-icon') ? 'createTray(mainWindow!);' : ''}
  ${this.config.features.includes('auto-update') ? 'setupAutoUpdater();' : ''}
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('get-app-version', () => app.getVersion());
`,
    };
  }

  private generatePreload(): ProjectFile {
    return {
      path: 'src/main/preload.ts',
      content: `import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onUpdateAvailable: (callback: () => void) => 
    ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback: () => void) => 
    ipcRenderer.on('update-downloaded', callback),
});
`,
    };
  }

  private generateRenderer(): ProjectFile {
    return {
      path: 'src/renderer/App.tsx',
      content: `import React, { useEffect, useState } from 'react';
import './App.css';

declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      onUpdateAvailable: (callback: () => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
    };
  }
}

export default function App() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    window.electronAPI.getAppVersion().then(setVersion);
  }, []);

  return (
    <div className="app">
      <h1>${this.config.projectName}</h1>
      <p>Version: {version}</p>
    </div>
  );
}
`,
    };
  }

  private generateIndex(): ProjectFile {
    return {
      path: 'src/renderer/index.html',
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
  <title>${this.config.projectName}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
`,
    };
  }

  private generateElectronBuilder(): ProjectFile {
    return {
      path: 'electron-builder.yml',
      content: `appId: ${this.config.appId}
productName: ${this.config.projectName}
directories:
  output: release
files:
  - dist/**/*
${this.config.platforms.includes('macos') ? `mac:
  category: public.app-category.developer-tools
  target:
    - dmg
    - zip` : ''}
${this.config.platforms.includes('windows') ? `win:
  target:
    - nsis
    - portable` : ''}
${this.config.platforms.includes('linux') ? `linux:
  target:
    - AppImage
    - deb` : ''}
`,
    };
  }

  private generateTrayModule(): ProjectFile {
    return {
      path: 'src/main/tray.ts',
      content: `import { Tray, Menu, BrowserWindow, nativeImage } from 'electron';
import path from 'path';

let tray: Tray | null = null;

export function createTray(mainWindow: BrowserWindow) {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../../assets/tray-icon.png')
  );
  
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', role: 'quit' },
  ]);
  
  tray.setToolTip('${this.config.projectName}');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => mainWindow.show());
}
`,
    };
  }

  private generateUpdaterModule(): ProjectFile {
    return {
      path: 'src/main/updater.ts',
      content: `import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';

export function setupAutoUpdater() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', () => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => win.webContents.send('update-available'));
  });

  autoUpdater.on('update-downloaded', () => {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(win => win.webContents.send('update-downloaded'));
  });

  autoUpdater.checkForUpdatesAndNotify();
}
`,
    };
  }

  private getDependencies(): Record<string, string> {
    const deps: Record<string, string> = {};
    if (this.config.features.includes('auto-update')) {
      deps['electron-updater'] = '^6.1.0';
    }
    return deps;
  }

  private getDevDependencies(): Record<string, string> {
    return {
      'electron': '^27.0.0',
      'electron-builder': '^24.6.0',
      'typescript': '^5.0.0',
      'vite': '^5.0.0',
      '@vitejs/plugin-react': '^4.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
    };
  }

  private getScripts(): Record<string, string> {
    return {
      dev: 'vite',
      build: 'tsc && vite build',
      'electron:dev': 'electron .',
      'electron:build': 'electron-builder',
      'dist': 'npm run build && npm run electron:build',
    };
  }
}

// ============== TAURI BUILDER ==============

export class TauriBuilder {
  private config: DesktopConfig;
  private llm: LLMEngine | null;

  constructor(config: DesktopConfig, llmEngine?: LLMEngine) {
    this.config = config;
    this.llm = llmEngine || null;
  }

  async createProject(): Promise<DesktopProject> {
    const files: ProjectFile[] = [
      this.generateTauriConf(),
      this.generateCargoToml(),
      this.generateRustMain(),
      this.generatePackageJson(),
      this.generateFrontend(),
    ];

    return {
      name: this.config.projectName,
      framework: 'tauri',
      files,
      dependencies: {},
      devDependencies: this.getDevDependencies(),
      scripts: this.getScripts(),
    };
  }

  private generateTauriConf(): ProjectFile {
    return {
      path: 'src-tauri/tauri.conf.json',
      content: JSON.stringify({
        build: {
          beforeDevCommand: 'npm run dev',
          beforeBuildCommand: 'npm run build',
          devPath: 'http://localhost:5173',
          distDir: '../dist',
        },
        package: {
          productName: this.config.projectName,
          version: '1.0.0',
        },
        tauri: {
          bundle: {
            active: true,
            identifier: this.config.appId,
            icon: ['icons/icon.png'],
            targets: 'all',
          },
          windows: [{
            title: this.config.projectName,
            width: this.config.windowConfig.width,
            height: this.config.windowConfig.height,
            minWidth: this.config.windowConfig.minWidth,
            minHeight: this.config.windowConfig.minHeight,
            resizable: this.config.windowConfig.resizable,
            decorations: this.config.windowConfig.frame,
          }],
        },
      }, null, 2),
    };
  }

  private generateCargoToml(): ProjectFile {
    return {
      path: 'src-tauri/Cargo.toml',
      content: `[package]
name = "${this.config.projectName.toLowerCase().replace(/\s+/g, '_')}"
version = "1.0.0"
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.5", features = [] }

[dependencies]
tauri = { version = "1.5", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
`,
    };
  }

  private generateRustMain(): ProjectFile {
    return {
      path: 'src-tauri/src/main.rs',
      content: `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
`,
    };
  }

  private generatePackageJson(): ProjectFile {
    return {
      path: 'package.json',
      content: JSON.stringify({
        name: this.config.projectName.toLowerCase().replace(/\s+/g, '-'),
        scripts: this.getScripts(),
        devDependencies: this.getDevDependencies(),
      }, null, 2),
    };
  }

  private generateFrontend(): ProjectFile {
    return {
      path: 'src/App.tsx',
      content: `import { invoke } from '@tauri-apps/api/tauri';
import { useState } from 'react';

export default function App() {
  const [greeting, setGreeting] = useState('');

  async function greet() {
    setGreeting(await invoke('greet', { name: 'World' }));
  }

  return (
    <div>
      <h1>${this.config.projectName}</h1>
      <button onClick={greet}>Greet</button>
      <p>{greeting}</p>
    </div>
  );
}
`,
    };
  }

  private getDevDependencies(): Record<string, string> {
    return {
      '@tauri-apps/api': '^1.5.0',
      '@tauri-apps/cli': '^1.5.0',
      'vite': '^5.0.0',
      '@vitejs/plugin-react': '^4.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'typescript': '^5.0.0',
    };
  }

  private getScripts(): Record<string, string> {
    return {
      dev: 'vite',
      build: 'vite build',
      'tauri': 'tauri',
      'tauri:dev': 'tauri dev',
      'tauri:build': 'tauri build',
    };
  }
}

// ============== DESKTOP BUILDER ==============

export class DesktopBuilder {
  private config: DesktopConfig;
  private electronBuilder: ElectronBuilder | null = null;
  private tauriBuilder: TauriBuilder | null = null;

  constructor(config: DesktopConfig, llmEngine?: LLMEngine) {
    this.config = config;
    if (config.framework === 'tauri') {
      this.tauriBuilder = new TauriBuilder(config, llmEngine);
    } else {
      this.electronBuilder = new ElectronBuilder(config, llmEngine);
    }
  }

  async createProject(): Promise<DesktopProject> {
    if (this.config.framework === 'tauri') {
      return this.tauriBuilder!.createProject();
    }
    return this.electronBuilder!.createProject();
  }
}

// ============== FACTORY ==============

export function createDesktopBuilder(config: DesktopConfig, llmEngine?: LLMEngine): DesktopBuilder {
  return new DesktopBuilder(config, llmEngine);
}

export function createElectronBuilder(config: DesktopConfig, llmEngine?: LLMEngine): ElectronBuilder {
  return new ElectronBuilder(config, llmEngine);
}

export function createTauriBuilder(config: DesktopConfig, llmEngine?: LLMEngine): TauriBuilder {
  return new TauriBuilder(config, llmEngine);
}
