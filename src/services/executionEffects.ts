// ============== EXECUTION EFFECTS SERVICE ==============
// Ensures user can SEE execution results - critical contract guarantee
// "No execution may complete unless the user can SEE the result"

import { fileSystemService } from './fileSystem';
import { notificationsService } from './notifications';

// ============== TYPES ==============
export interface ExecutionEffect {
  type: 'file_modified' | 'file_created' | 'file_deleted';
  path: string;
  visible: boolean;
  opened: boolean;
}

export interface PostExecutionResult {
  filesModified: string[];
  filesOpened: string[];
  filesNotVisible: string[];
  uiRefreshed: boolean;
}

export interface DiffDisplay {
  path: string;
  oldContent: string;
  newContent: string;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

// Event types for UI synchronization
type FileOpenHandler = (path: string) => void;
type UIRefreshHandler = () => void;
type DiffShowHandler = (diff: DiffDisplay) => void;

// ============== EXECUTION EFFECTS SERVICE ==============
class ExecutionEffectsService {
  private fileOpenHandlers = new Set<FileOpenHandler>();
  private uiRefreshHandlers = new Set<UIRefreshHandler>();
  private diffShowHandlers = new Set<DiffShowHandler>();
  private pendingEffects: ExecutionEffect[] = [];

  // ============== CORE CONTRACT: Visibility Guarantee ==============

  /**
   * CRITICAL: Ensures modified files are visible to user
   * Called after any file modification
   */
  async ensureVisibility(paths: string[]): Promise<PostExecutionResult> {
    const result: PostExecutionResult = {
      filesModified: paths,
      filesOpened: [],
      filesNotVisible: [],
      uiRefreshed: false,
    };

    for (const path of paths) {
      try {
        // Check if file exists
        const exists = await this.fileExists(path);
        
        if (!exists) {
          result.filesNotVisible.push(path);
          notificationsService.warning(`Modified file not found: ${path}`, {
            message: 'The file was modified but may not exist in the workspace',
            persistent: true,
            actions: [
              { label: 'Create File', action: () => this.createAndOpen(path) },
            ],
          });
          continue;
        }

        // Open the file in editor
        await this.openFile(path);
        result.filesOpened.push(path);

      } catch (error) {
        result.filesNotVisible.push(path);
        console.error(`Failed to ensure visibility for ${path}:`, error);
      }
    }

    // Force UI refresh
    await this.refreshUI();
    result.uiRefreshed = true;

    // Show notification with results
    if (result.filesOpened.length > 0) {
      notificationsService.success(`${result.filesOpened.length} file(s) modified`, {
        message: result.filesOpened.join(', '),
        duration: 5000,
        actions: [
          { label: 'View All', action: () => this.openAllFiles(result.filesOpened) },
        ],
      });
    }

    if (result.filesNotVisible.length > 0) {
      notificationsService.error(`${result.filesNotVisible.length} file(s) not visible`, {
        message: 'Some modifications could not be displayed',
        persistent: true,
      });
    }

    return result;
  }

  // ============== FILE EXISTENCE VALIDATION ==============

  /**
   * CRITICAL: Validate file exists before modification
   * Returns error if file doesn't exist for 'modify' operations
   */
  async validateBeforeModify(path: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const exists = await this.fileExists(path);
      
      if (!exists) {
        return {
          valid: false,
          error: `Target file does not exist: ${path}. Use 'create' instead of 'modify'.`,
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Cannot validate file: ${path}. ${error}`,
      };
    }
  }

  /**
   * Auto-convert modify to create if file doesn't exist
   */
  async resolveFileOperation(
    operation: 'create' | 'modify',
    path: string
  ): Promise<'create' | 'modify'> {
    const exists = await this.fileExists(path);

    if (operation === 'modify' && !exists) {
      console.warn(`File ${path} doesn't exist, converting modify → create`);
      return 'create';
    }

    if (operation === 'create' && exists) {
      console.warn(`File ${path} already exists, converting create → modify`);
      return 'modify';
    }

    return operation;
  }

  // ============== DIFF DISPLAY ==============

  /**
   * Generate and display diff for user confirmation
   */
  computeDiff(oldContent: string, newContent: string, path: string): DiffDisplay {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');

    const hunks: DiffHunk[] = [];
    let additions = 0;
    let deletions = 0;

    // Simple diff algorithm - find changed regions
    let i = 0, j = 0;
    let currentHunk: DiffHunk | null = null;

    while (i < oldLines.length || j < newLines.length) {
      if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
        // Context line
        if (currentHunk) {
          currentHunk.lines.push({
            type: 'context',
            content: oldLines[i],
            oldLineNumber: i + 1,
            newLineNumber: j + 1,
          });
        }
        i++;
        j++;
      } else {
        // Start new hunk if needed
        if (!currentHunk) {
          currentHunk = {
            oldStart: i + 1,
            oldLines: 0,
            newStart: j + 1,
            newLines: 0,
            lines: [],
          };
          hunks.push(currentHunk);
        }

        // Handle deletions
        if (i < oldLines.length && (j >= newLines.length || oldLines[i] !== newLines[j])) {
          currentHunk.lines.push({
            type: 'remove',
            content: oldLines[i],
            oldLineNumber: i + 1,
          });
          currentHunk.oldLines++;
          deletions++;
          i++;
        }

        // Handle additions
        if (j < newLines.length && (i >= oldLines.length || oldLines[i] !== newLines[j])) {
          currentHunk.lines.push({
            type: 'add',
            content: newLines[j],
            newLineNumber: j + 1,
          });
          currentHunk.newLines++;
          additions++;
          j++;
        }
      }

      // Close hunk after 3 consecutive context lines
      if (currentHunk && currentHunk.lines.length > 0) {
        const lastThree = currentHunk.lines.slice(-3);
        if (lastThree.length === 3 && lastThree.every(l => l.type === 'context')) {
          currentHunk = null;
        }
      }
    }

    return {
      path,
      oldContent,
      newContent,
      additions,
      deletions,
      hunks,
    };
  }

  /**
   * Show diff to user
   */
  showDiff(diff: DiffDisplay): void {
    this.diffShowHandlers.forEach(handler => handler(diff));
    
    // Also emit event for UI components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resonant:showDiff', { detail: diff }));
    }
  }

  // ============== UI SYNCHRONIZATION ==============

  /**
   * Force refresh of all UI components
   */
  async refreshUI(): Promise<void> {
    // Notify all refresh handlers
    this.uiRefreshHandlers.forEach(handler => handler());

    // Emit global refresh event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resonant:refreshUI'));
      window.dispatchEvent(new CustomEvent('resonant:refreshExplorer'));
      window.dispatchEvent(new CustomEvent('resonant:refreshEditor'));
    }

    // Small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Open file in editor
   */
  async openFile(path: string): Promise<void> {
    this.fileOpenHandlers.forEach(handler => handler(path));

    // Emit event for UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resonant:openFile', { detail: { path } }));
    }
  }

  /**
   * Open multiple files
   */
  async openAllFiles(paths: string[]): Promise<void> {
    for (const path of paths) {
      await this.openFile(path);
    }
  }

  // ============== SUBSCRIPTIONS ==============

  onFileOpen(handler: FileOpenHandler): () => void {
    this.fileOpenHandlers.add(handler);
    return () => this.fileOpenHandlers.delete(handler);
  }

  onUIRefresh(handler: UIRefreshHandler): () => void {
    this.uiRefreshHandlers.add(handler);
    return () => this.uiRefreshHandlers.delete(handler);
  }

  onDiffShow(handler: DiffShowHandler): () => void {
    this.diffShowHandlers.add(handler);
    return () => this.diffShowHandlers.delete(handler);
  }

  // ============== HELPERS ==============

  private async fileExists(path: string): Promise<boolean> {
    try {
      await fileSystemService.readFile(path);
      return true;
    } catch {
      return false;
    }
  }

  private async createAndOpen(path: string): Promise<void> {
    await fileSystemService.createFile(path, '');
    await this.openFile(path);
  }
}

// ============== SINGLETON ==============
export const executionEffectsService = new ExecutionEffectsService();

// ============== REACT HOOKS ==============
import { useEffect, useCallback, useState } from 'react';

export function useExecutionEffects() {
  const [lastDiff, setLastDiff] = useState<DiffDisplay | null>(null);

  useEffect(() => {
    const unsubDiff = executionEffectsService.onDiffShow((diff) => {
      setLastDiff(diff);
    });

    return unsubDiff;
  }, []);

  const ensureVisibility = useCallback(async (paths: string[]) => {
    return executionEffectsService.ensureVisibility(paths);
  }, []);

  const showDiff = useCallback((diff: DiffDisplay) => {
    executionEffectsService.showDiff(diff);
  }, []);

  return {
    lastDiff,
    ensureVisibility,
    showDiff,
    refreshUI: () => executionEffectsService.refreshUI(),
    openFile: (path: string) => executionEffectsService.openFile(path),
  };
}

export default executionEffectsService;
