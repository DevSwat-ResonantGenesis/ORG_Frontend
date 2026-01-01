import { watch, FSWatcher } from 'chokidar';
import * as path from 'path';

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  timestamp: number;
}

export type FileChangeCallback = (event: FileChangeEvent) => void;

export class FileWatcherService {
  private watchers: Map<string, FSWatcher> = new Map();
  private callbacks: Map<string, FileChangeCallback[]> = new Map();

  /**
   * Watch a directory for changes
   */
  async watchDirectory(
    directoryPath: string,
    callback: FileChangeCallback
  ): Promise<{ success: boolean; message: string; watcherId?: string }> {
    try {
      const normalizedPath = path.normalize(directoryPath);
      const watcherId = normalizedPath;

      // Check if already watching
      if (this.watchers.has(watcherId)) {
        // Add callback to existing watcher
        const callbacks = this.callbacks.get(watcherId) || [];
        callbacks.push(callback);
        this.callbacks.set(watcherId, callbacks);
        return { success: true, message: 'Added callback to existing watcher', watcherId };
      }

      // Create new watcher
      const watcher = watch(normalizedPath, {
        ignored: [
          /(^|[\/\\])\../, // Ignore dotfiles
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/*.log',
        ],
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 50,
        },
      });

      // Store callbacks
      const callbacks = [callback];
      this.callbacks.set(watcherId, callbacks);

      // Set up event handlers
      watcher.on('add', (filePath) => {
        this.notifyCallbacks(watcherId, {
          type: 'add',
          path: filePath,
          timestamp: Date.now(),
        });
      });

      watcher.on('change', (filePath) => {
        this.notifyCallbacks(watcherId, {
          type: 'change',
          path: filePath,
          timestamp: Date.now(),
        });
      });

      watcher.on('unlink', (filePath) => {
        this.notifyCallbacks(watcherId, {
          type: 'unlink',
          path: filePath,
          timestamp: Date.now(),
        });
      });

      watcher.on('addDir', (dirPath) => {
        this.notifyCallbacks(watcherId, {
          type: 'addDir',
          path: dirPath,
          timestamp: Date.now(),
        });
      });

      watcher.on('unlinkDir', (dirPath) => {
        this.notifyCallbacks(watcherId, {
          type: 'unlinkDir',
          path: dirPath,
          timestamp: Date.now(),
        });
      });

      watcher.on('error', (error) => {
        console.error(`File watcher error for ${watcherId}:`, error);
      });

      this.watchers.set(watcherId, watcher);

      return { success: true, message: 'Watching directory', watcherId };
    } catch (error: any) {
      return { success: false, message: `Error watching directory: ${error.message}` };
    }
  }

  /**
   * Stop watching a directory
   */
  async unwatchDirectory(watcherId: string): Promise<{ success: boolean; message: string }> {
    const watcher = this.watchers.get(watcherId);
    if (!watcher) {
      return { success: false, message: 'Watcher not found' };
    }

    try {
      await watcher.close();
      this.watchers.delete(watcherId);
      this.callbacks.delete(watcherId);
      return { success: true, message: 'Stopped watching directory' };
    } catch (error: any) {
      return { success: false, message: `Error stopping watcher: ${error.message}` };
    }
  }

  /**
   * Notify all callbacks for a watcher
   */
  private notifyCallbacks(watcherId: string, event: FileChangeEvent): void {
    const callbacks = this.callbacks.get(watcherId);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in file change callback:', error);
        }
      });
    }
  }

  /**
   * Get all active watchers
   */
  getActiveWatchers(): string[] {
    return Array.from(this.watchers.keys());
  }

  /**
   * Stop all watchers
   */
  async stopAll(): Promise<void> {
    const promises = Array.from(this.watchers.keys()).map((id) => this.unwatchDirectory(id));
    await Promise.all(promises);
  }
}

