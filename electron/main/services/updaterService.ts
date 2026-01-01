import { autoUpdater } from 'electron-updater';
import { app } from 'electron';

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion?: string;
  info?: UpdateInfo;
  error?: string;
}

export interface UpdateProgress {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
}

export class UpdaterService {
  private checkingForUpdates: boolean = false;
  private updateAvailable: boolean = false;
  private currentVersion: string;

  constructor() {
    this.currentVersion = app.getVersion();
    this.configureUpdater();
  }

  /**
   * Configure auto-updater settings
   */
  private configureUpdater(): void {
    // Disable auto-download (we'll handle it manually)
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Configure update channel (can be 'latest' or 'beta')
    autoUpdater.channel = 'latest';

    // Log update events
    if (process.env.NODE_ENV === 'development') {
      autoUpdater.logger = {
        info: (message: string) => console.log('[Updater]', message),
        warn: (message: string) => console.warn('[Updater]', message),
        error: (message: string) => console.error('[Updater]', message),
        debug: (message: string) => console.debug('[Updater]', message),
      };
    }
  }

  /**
   * Check for updates
   */
  async checkForUpdates(allowPrerelease: boolean = false): Promise<UpdateCheckResult> {
    if (this.checkingForUpdates) {
      return {
        updateAvailable: false,
        currentVersion: this.currentVersion,
        error: 'Update check already in progress',
      };
    }

    // Skip update check in development
    if (!app.isPackaged) {
      return {
        updateAvailable: false,
        currentVersion: this.currentVersion,
        error: 'Update check skipped in development mode',
      };
    }

    this.checkingForUpdates = true;

    try {
      // Set channel based on prerelease preference
      if (allowPrerelease) {
        autoUpdater.allowPrerelease = true;
        autoUpdater.channel = 'beta';
      } else {
        autoUpdater.allowPrerelease = false;
        autoUpdater.channel = 'latest';
      }

      // Check for updates
      const result = await autoUpdater.checkForUpdates();

      this.checkingForUpdates = false;

      if (result?.updateInfo) {
        const latestVersion = result.updateInfo.version;
        const updateAvailable = latestVersion !== this.currentVersion;

        this.updateAvailable = updateAvailable;

        return {
          updateAvailable,
          currentVersion: this.currentVersion,
          latestVersion,
          info: {
            version: latestVersion,
            releaseDate: result.updateInfo.releaseDate
              ? new Date(result.updateInfo.releaseDate).toISOString()
              : new Date().toISOString(),
            releaseNotes: this.extractReleaseNotes(result.updateInfo.releaseNotes),
          },
        };
      }

      return {
        updateAvailable: false,
        currentVersion: this.currentVersion,
      };
    } catch (error: any) {
      this.checkingForUpdates = false;
      return {
        updateAvailable: false,
        currentVersion: this.currentVersion,
        error: error.message || 'Failed to check for updates',
      };
    }
  }

  /**
   * Download update
   */
  async downloadUpdate(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.updateAvailable) {
        return {
          success: false,
          error: 'No update available to download',
        };
      }

      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to download update',
      };
    }
  }

  /**
   * Install update (quits app and installs)
   */
  async installUpdate(): Promise<void> {
    if (!this.updateAvailable) {
      throw new Error('No update available to install');
    }

    // Install and restart
    autoUpdater.quitAndInstall(false, true);
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.currentVersion;
  }

  /**
   * Check if update is available
   */
  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  /**
   * Set update event listeners
   */
  onUpdateAvailable(callback: (info: UpdateInfo) => void): void {
    autoUpdater.on('update-available', (info) => {
      callback({
        version: info.version,
        releaseDate: info.releaseDate
          ? new Date(info.releaseDate).toISOString()
          : new Date().toISOString(),
        releaseNotes: this.extractReleaseNotes(info.releaseNotes),
      });
    });
  }

  onUpdateNotAvailable(callback: () => void): void {
    autoUpdater.on('update-not-available', callback);
  }

  onUpdateDownloaded(callback: () => void): void {
    autoUpdater.on('update-downloaded', callback);
  }

  onDownloadProgress(callback: (progress: UpdateProgress) => void): void {
    autoUpdater.on('download-progress', (progress) => {
      callback({
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total,
        bytesPerSecond: progress.bytesPerSecond,
      });
    });
  }

  onError(callback: (error: Error) => void): void {
    autoUpdater.on('error', callback);
  }

  /**
   * Extract release notes from update info
   */
  private extractReleaseNotes(releaseNotes?: string | any[] | null): string | undefined {
    if (!releaseNotes) {
      return undefined;
    }

    // Release notes can be a string, array, or HTML
    if (typeof releaseNotes === 'string') {
      // Strip HTML tags if present
      return releaseNotes.replace(/<[^>]*>/g, '').trim();
    }

    // Handle array of release notes
    if (Array.isArray(releaseNotes)) {
      return releaseNotes
        .map((note) => {
          if (typeof note === 'string') {
            return note.replace(/<[^>]*>/g, '').trim();
          }
          if (note && typeof note === 'object' && 'note' in note) {
            return String(note.note).replace(/<[^>]*>/g, '').trim();
          }
          return '';
        })
        .filter((note) => note.length > 0)
        .join('\n');
    }

    return undefined;
  }

  /**
   * Set update server URL (for custom update server)
   */
  setUpdateServerUrl(url: string): void {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: url,
    });
  }

  /**
   * Get update channel
   */
  getChannel(): string {
    return autoUpdater.channel || 'latest';
  }

  /**
   * Set update channel
   */
  setChannel(channel: 'latest' | 'beta'): void {
    autoUpdater.channel = channel;
    if (channel === 'beta') {
      autoUpdater.allowPrerelease = true;
    } else {
      autoUpdater.allowPrerelease = false;
    }
  }
}

