import { BrowserWindow, screen } from 'electron';
import * as path from 'path';

export interface WindowOptions {
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  title?: string;
  url?: string;
  parent?: BrowserWindow;
  modal?: boolean;
}

export class WindowManager {
  private windows: Map<string, BrowserWindow> = new Map();
  private windowCount: number = 0;

  /**
   * Create a new window
   */
  createWindow(
    windowId: string,
    options: WindowOptions = {}
  ): BrowserWindow {
    const {
      width = 1200,
      height = 800,
      minWidth = 400,
      minHeight = 300,
      resizable = true,
      title = 'ResonantGraph AI',
      url,
      parent,
      modal = false,
    } = options;

    // Get primary display for positioning
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

    // Center window on screen
    const x = Math.floor((screenWidth - width) / 2);
    const y = Math.floor((screenHeight - height) / 2);

    const window = new BrowserWindow({
      width,
      height,
      minWidth,
      minHeight,
      x,
      y,
      resizable,
      title,
      show: false,
      parent: parent || undefined,
      modal,
      backgroundColor: '#1e1e1e',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        webSecurity: true,
        preload: path.join(__dirname, '../preload.js'),
      },
    });

    // Load URL if provided
    if (url) {
      window.loadURL(url);
    }

    // Track window
    this.windows.set(windowId, window);
    this.windowCount++;

    // Clean up when window is closed
    window.on('closed', () => {
      this.windows.delete(windowId);
      this.windowCount--;
    });

    // Show window when ready
    window.once('ready-to-show', () => {
      window.show();
    });

    return window;
  }

  /**
   * Get window by ID
   */
  getWindow(windowId: string): BrowserWindow | undefined {
    return this.windows.get(windowId);
  }

  /**
   * Close window
   */
  closeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (window) {
      window.close();
      return true;
    }
    return false;
  }

  /**
   * Close all windows
   */
  closeAllWindows(): void {
    for (const [windowId, window] of this.windows) {
      window.close();
    }
    this.windows.clear();
    this.windowCount = 0;
  }

  /**
   * Get all windows
   */
  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  /**
   * Get window count
   */
  getWindowCount(): number {
    return this.windowCount;
  }

  /**
   * Focus window
   */
  focusWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (window) {
      if (window.isMinimized()) {
        window.restore();
      }
      window.focus();
      return true;
    }
    return false;
  }

  /**
   * Minimize window
   */
  minimizeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (window) {
      window.minimize();
      return true;
    }
    return false;
  }

  /**
   * Maximize window
   */
  maximizeWindow(windowId: string): boolean {
    const window = this.windows.get(windowId);
    if (window) {
      window.maximize();
      return true;
    }
    return false;
  }

  /**
   * Check if window exists
   */
  hasWindow(windowId: string): boolean {
    return this.windows.has(windowId);
  }

  /**
   * Get window IDs
   */
  getWindowIds(): string[] {
    return Array.from(this.windows.keys());
  }
}

