import { app, nativeImage, nativeTheme, systemPreferences } from 'electron';
import { screen } from 'electron';

export interface PlatformInfo {
  platform: string;
  version: string;
  arch: string;
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
}

export class PlatformService {
  /**
   * Get platform information
   */
  getPlatformInfo(): PlatformInfo {
    return {
      platform: process.platform,
      version: process.getSystemVersion(),
      arch: process.arch,
      isMac: process.platform === 'darwin',
      isWindows: process.platform === 'win32',
      isLinux: process.platform === 'linux',
    };
  }

  /**
   * macOS-specific: Get dock settings
   */
  async getDockSettings(): Promise<{
    visible: boolean;
    position: string;
  } | null> {
    if (process.platform !== 'darwin') {
      return null;
    }

    // macOS dock visibility can be checked via system preferences
    return {
      visible: true, // Dock is usually visible, but can be hidden
      position: 'bottom', // Default position
    };
  }

  /**
   * macOS-specific: Set dock badge
   */
  setDockBadge(text: string | null): void {
    if (process.platform === 'darwin') {
      app.dock.setBadge(text || '');
    }
  }

  /**
   * macOS-specific: Bounce dock icon
   */
  bounceDock(type: 'critical' | 'informational' = 'informational'): number {
    if (process.platform === 'darwin') {
      return app.dock.bounce(type);
    }
    return -1;
  }

  /**
   * macOS-specific: Cancel dock bounce
   */
  cancelDockBounce(id: number): void {
    if (process.platform === 'darwin') {
      app.dock.cancelBounce(id);
    }
  }

  /**
   * Get system theme (dark/light)
   */
  getSystemTheme(): 'dark' | 'light' {
    if (process.platform === 'darwin') {
      return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    }
    // For Windows/Linux, check nativeTheme
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }

  /**
   * Listen to theme changes
   */
  onThemeChanged(callback: (theme: 'dark' | 'light') => void): () => void {
    const handler = () => {
      callback(this.getSystemTheme());
    };

    nativeTheme.on('updated', handler);

    // Return cleanup function
    return () => {
      nativeTheme.removeListener('updated', handler);
    };
  }

  /**
   * Get all displays
   */
  getAllDisplays(): Array<{
    id: number;
    bounds: { x: number; y: number; width: number; height: number };
    workArea: { x: number; y: number; width: number; height: number };
    scaleFactor: number;
    primary: boolean;
  }> {
    const displays = screen.getAllDisplays();
    return displays.map((display, index) => ({
      id: index,
      bounds: display.bounds,
      workArea: display.workArea,
      scaleFactor: display.scaleFactor,
      primary: display.primary,
    }));
  }

  /**
   * Get primary display
   */
  getPrimaryDisplay(): {
    bounds: { x: number; y: number; width: number; height: number };
    workArea: { x: number; y: number; width: number; height: number };
    scaleFactor: number;
  } {
    const primaryDisplay = screen.getPrimaryDisplay();
    return {
      bounds: primaryDisplay.bounds,
      workArea: primaryDisplay.workArea,
      scaleFactor: primaryDisplay.scaleFactor,
    };
  }

  /**
   * Windows-specific: Get taskbar position
   */
  getTaskbarPosition(): 'bottom' | 'top' | 'left' | 'right' | null {
    if (process.platform !== 'win32') {
      return null;
    }

    // Windows taskbar position detection
    // This is a simplified version - full implementation would require
    // reading Windows registry or using native modules
    return 'bottom'; // Default
  }

  /**
   * macOS-specific: Set app badge count
   */
  setAppBadgeCount(count: number): void {
    if (process.platform === 'darwin') {
      app.setBadgeCount(count);
    }
  }

  /**
   * macOS-specific: Request user attention
   */
  requestUserAttention(type: 'critical' | 'informational' = 'informational'): number {
    if (process.platform === 'darwin') {
      return app.dock.bounce(type);
    }
    return -1;
  }

  /**
   * Get system accent color (macOS/iOS)
   */
  async getAccentColor(): Promise<string | null> {
    if (process.platform === 'darwin') {
      try {
        // macOS system accent color
        const color = systemPreferences.getSystemColor('controlAccent');
        return color;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if system supports transparency
   */
  supportsTransparency(): boolean {
    // Most platforms support window transparency
    return true;
  }

  /**
   * Get system locale
   */
  getLocale(): string {
    return app.getLocale();
  }

  /**
   * Get system preferred languages
   */
  getPreferredLanguages(): string[] {
    return app.getPreferredSystemLanguages();
  }
}

