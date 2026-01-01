// ============== FILE SYSTEM SERVICE ==============
// Virtual file system utilities for the IDE

// ============== TYPES ==============
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  content?: string;
  language?: string;
  size?: number;
  modified?: number;
  created?: number;
  children?: FileNode[];
  isOpen?: boolean;
  isModified?: boolean;
}

export interface FileChange {
  type: 'create' | 'update' | 'delete' | 'rename' | 'move';
  path: string;
  newPath?: string;
  content?: string;
  timestamp: number;
}

export interface SearchResult {
  file: string;
  line: number;
  column: number;
  match: string;
  context: string;
}

type FileChangeHandler = (change: FileChange) => void;

// ============== LANGUAGE DETECTION ==============
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescriptreact',
  '.js': 'javascript',
  '.jsx': 'javascriptreact',
  '.py': 'python',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.scala': 'scala',
  '.r': 'r',
  '.sql': 'sql',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.json': 'json',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.md': 'markdown',
  '.sh': 'shellscript',
  '.bash': 'shellscript',
  '.zsh': 'shellscript',
  '.dockerfile': 'dockerfile',
  '.vue': 'vue',
  '.svelte': 'svelte',
};

export function detectLanguage(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return EXTENSION_TO_LANGUAGE[ext] || 'plaintext';
}

// ============== FILE SYSTEM SERVICE ==============
class FileSystemService {
  private files = new Map<string, FileNode>();
  private changeHandlers = new Set<FileChangeHandler>();
  private undoStack: FileChange[] = [];
  private redoStack: FileChange[] = [];
  private maxUndoSize = 100;

  // Initialize with project structure
  async loadProject(projectPath: string): Promise<FileNode> {
    try {
      const response = await fetch(`http://localhost:8080/api/projects/tree?path=${encodeURIComponent(projectPath)}`);
      if (!response.ok) throw new Error('Failed to load project');
      
      const tree = await response.json();
      this.indexFiles(tree);
      return tree;
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    }
  }

  // Get file content
  async readFile(path: string): Promise<string> {
    const cached = this.files.get(path);
    if (cached?.content !== undefined) {
      return cached.content;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/files/read?path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error('Failed to read file');
      
      const data = await response.json();
      const content = data.content;

      // Update cache
      if (cached) {
        cached.content = content;
      }

      return content;
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  }

  // Write file content
  async writeFile(path: string, content: string): Promise<void> {
    const previousContent = this.files.get(path)?.content;

    try {
      const response = await fetch('http://localhost:8080/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content }),
      });

      if (!response.ok) throw new Error('Failed to write file');

      // Update cache
      const file = this.files.get(path);
      if (file) {
        file.content = content;
        file.modified = Date.now();
        file.isModified = false;
      }

      // Record change for undo
      this.pushUndo({
        type: 'update',
        path,
        content: previousContent,
        timestamp: Date.now(),
      });

      this.notifyChange({ type: 'update', path, content, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to write file:', error);
      throw error;
    }
  }

  // Create file
  async createFile(path: string, content = ''): Promise<FileNode> {
    try {
      const response = await fetch('http://localhost:8080/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content, type: 'file' }),
      });

      if (!response.ok) throw new Error('Failed to create file');

      const name = path.split('/').pop() || path;
      const node: FileNode = {
        id: this.generateId(),
        name,
        path,
        type: 'file',
        content,
        language: detectLanguage(name),
        created: Date.now(),
        modified: Date.now(),
      };

      this.files.set(path, node);
      this.pushUndo({ type: 'create', path, timestamp: Date.now() });
      this.notifyChange({ type: 'create', path, content, timestamp: Date.now() });

      return node;
    } catch (error) {
      console.error('Failed to create file:', error);
      throw error;
    }
  }

  // Create directory
  async createDirectory(path: string): Promise<FileNode> {
    try {
      const response = await fetch('http://localhost:8080/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, type: 'directory' }),
      });

      if (!response.ok) throw new Error('Failed to create directory');

      const name = path.split('/').pop() || path;
      const node: FileNode = {
        id: this.generateId(),
        name,
        path,
        type: 'directory',
        children: [],
        created: Date.now(),
      };

      this.files.set(path, node);
      this.notifyChange({ type: 'create', path, timestamp: Date.now() });

      return node;
    } catch (error) {
      console.error('Failed to create directory:', error);
      throw error;
    }
  }

  // Delete file or directory
  async delete(path: string): Promise<void> {
    const file = this.files.get(path);
    
    try {
      const response = await fetch('http://localhost:8080/api/files/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });

      if (!response.ok) throw new Error('Failed to delete');

      // Store for undo
      if (file) {
        this.pushUndo({
          type: 'delete',
          path,
          content: file.content,
          timestamp: Date.now(),
        });
      }

      this.files.delete(path);
      this.notifyChange({ type: 'delete', path, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to delete:', error);
      throw error;
    }
  }

  // Rename file or directory
  async rename(oldPath: string, newPath: string): Promise<void> {
    try {
      const response = await fetch('http://localhost:8080/api/files/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPath, newPath }),
      });

      if (!response.ok) throw new Error('Failed to rename');

      const file = this.files.get(oldPath);
      if (file) {
        file.path = newPath;
        file.name = newPath.split('/').pop() || newPath;
        this.files.delete(oldPath);
        this.files.set(newPath, file);
      }

      this.pushUndo({ type: 'rename', path: newPath, newPath: oldPath, timestamp: Date.now() });
      this.notifyChange({ type: 'rename', path: oldPath, newPath, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to rename:', error);
      throw error;
    }
  }

  // Move file or directory
  async move(sourcePath: string, destPath: string): Promise<void> {
    try {
      const response = await fetch('http://localhost:8080/api/files/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePath, destPath }),
      });

      if (!response.ok) throw new Error('Failed to move');

      const file = this.files.get(sourcePath);
      if (file) {
        file.path = destPath;
        this.files.delete(sourcePath);
        this.files.set(destPath, file);
      }

      this.pushUndo({ type: 'move', path: destPath, newPath: sourcePath, timestamp: Date.now() });
      this.notifyChange({ type: 'move', path: sourcePath, newPath: destPath, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to move:', error);
      throw error;
    }
  }

  // Search files
  async search(query: string, options?: { 
    regex?: boolean; 
    caseSensitive?: boolean;
    includePattern?: string;
    excludePattern?: string;
  }): Promise<SearchResult[]> {
    try {
      const response = await fetch('http://localhost:8080/api/files/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, ...options }),
      });

      if (!response.ok) throw new Error('Search failed');
      return response.json();
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  // Find files by name
  async findFiles(pattern: string): Promise<string[]> {
    const results: string[] = [];
    const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');

    for (const [path] of this.files) {
      if (regex.test(path)) {
        results.push(path);
      }
    }

    return results;
  }

  // Get file info
  getFile(path: string): FileNode | undefined {
    return this.files.get(path);
  }

  // Check if file exists
  exists(path: string): boolean {
    return this.files.has(path);
  }

  // Mark file as modified
  markModified(path: string, modified = true): void {
    const file = this.files.get(path);
    if (file) {
      file.isModified = modified;
    }
  }

  // Undo last change
  async undo(): Promise<boolean> {
    const change = this.undoStack.pop();
    if (!change) return false;

    try {
      switch (change.type) {
        case 'create':
          await this.delete(change.path);
          break;
        case 'update':
          if (change.content !== undefined) {
            await this.writeFile(change.path, change.content);
          }
          break;
        case 'delete':
          if (change.content !== undefined) {
            await this.createFile(change.path, change.content);
          }
          break;
        case 'rename':
        case 'move':
          if (change.newPath) {
            await this.rename(change.path, change.newPath);
          }
          break;
      }

      this.redoStack.push(change);
      return true;
    } catch {
      this.undoStack.push(change);
      return false;
    }
  }

  // Redo last undone change
  async redo(): Promise<boolean> {
    const change = this.redoStack.pop();
    if (!change) return false;

    try {
      switch (change.type) {
        case 'create':
          await this.createFile(change.path, change.content || '');
          break;
        case 'update':
          if (change.content !== undefined) {
            await this.writeFile(change.path, change.content);
          }
          break;
        case 'delete':
          await this.delete(change.path);
          break;
        case 'rename':
        case 'move':
          if (change.newPath) {
            await this.rename(change.newPath, change.path);
          }
          break;
      }

      this.undoStack.push(change);
      return true;
    } catch {
      this.redoStack.push(change);
      return false;
    }
  }

  // Subscribe to file changes
  onChange(handler: FileChangeHandler): () => void {
    this.changeHandlers.add(handler);
    return () => this.changeHandlers.delete(handler);
  }

  // Get all open files
  getOpenFiles(): FileNode[] {
    return Array.from(this.files.values()).filter(f => f.isOpen);
  }

  // Get modified files
  getModifiedFiles(): FileNode[] {
    return Array.from(this.files.values()).filter(f => f.isModified);
  }

  private indexFiles(node: FileNode, parentPath = ''): void {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;
    node.path = path;
    node.language = node.type === 'file' ? detectLanguage(node.name) : undefined;
    this.files.set(path, node);

    if (node.children) {
      for (const child of node.children) {
        this.indexFiles(child, path);
      }
    }
  }

  private pushUndo(change: FileChange): void {
    this.undoStack.push(change);
    if (this.undoStack.length > this.maxUndoSize) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  private notifyChange(change: FileChange): void {
    this.changeHandlers.forEach(handler => handler(change));
  }

  private generateId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON ==============
export const fileSystemService = new FileSystemService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useFileSystem() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadProject = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await fileSystemService.loadProject(path);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load project'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    loadProject,
    readFile: fileSystemService.readFile.bind(fileSystemService),
    writeFile: fileSystemService.writeFile.bind(fileSystemService),
    createFile: fileSystemService.createFile.bind(fileSystemService),
    createDirectory: fileSystemService.createDirectory.bind(fileSystemService),
    delete: fileSystemService.delete.bind(fileSystemService),
    rename: fileSystemService.rename.bind(fileSystemService),
    move: fileSystemService.move.bind(fileSystemService),
    search: fileSystemService.search.bind(fileSystemService),
    undo: fileSystemService.undo.bind(fileSystemService),
    redo: fileSystemService.redo.bind(fileSystemService),
  };
}

export function useFileContent(path: string | null) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setContent(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fileSystemService.readFile(path)
      .then(setContent)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [path]);

  const save = useCallback(async (newContent: string) => {
    if (!path) return;
    await fileSystemService.writeFile(path, newContent);
    setContent(newContent);
  }, [path]);

  return { content, isLoading, error, save };
}

export function useFileChanges() {
  const [changes, setChanges] = useState<FileChange[]>([]);

  useEffect(() => {
    return fileSystemService.onChange((change) => {
      setChanges(prev => [...prev.slice(-99), change]);
    });
  }, []);

  return changes;
}

export default fileSystemService;
