import { useCallback, useMemo } from 'react';
import { useIDE } from '../context/IDEContext';
import { type FileNode } from '../CursorFileTree';
import {
  createProjectFile,
  deleteProjectFile,
  getGitStatus,
  listProjectFiles,
  moveProjectFile,
  readProjectFile,
  renameProjectFile,
  writeProjectFile,
} from '@/api/code';
import { logger } from '@/utils/logger';
import { getSessionData } from '@/utils/auth-cookies';

interface UseFileOperationsProps {
  projectId?: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function useFileOperations({ projectId, onSuccess, onError }: UseFileOperationsProps) {
  const { state, dispatch } = useIDE();
  const { files, openFiles, activeTabId, unsavedChanges } = state;

  const session = getSessionData();
  const userId = session?.userId || session?.email || 'guest';
  const projectFilesStorageKey = `ide-project-files-${userId}`;
  const projectNameStorageKey = `ide-project-name-${userId}`;

  // Build file tree from flat file list (with content support)
  const buildFileTree = useCallback((
    flatFiles: Array<string | { path: string; content?: string; type?: string; language?: string }>,
    gitStatusMap: Map<string, 'modified' | 'added' | 'deleted'>,
    contentMap?: Map<string, string>
  ): FileNode[] => {
    const tree: FileNode[] = [];
    const pathMap = new Map<string, FileNode>();
    const fileContentMap = contentMap || new Map<string, string>();

    // Build content map from file objects if they have content
    flatFiles.forEach((file) => {
      if (typeof file === 'object' && file.content) {
        fileContentMap.set(file.path, file.content);
      }
    });

    flatFiles.forEach((fileOrPath) => {
      const filePath = typeof fileOrPath === 'string' ? fileOrPath : fileOrPath.path;
      const parts = filePath.split('/');
      let currentPath = '';

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!pathMap.has(currentPath)) {
          const node: FileNode = {
            path: currentPath,
            name: part,
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
            gitStatus: gitStatusMap.get(currentPath) || null,
            content: isFile ? fileContentMap.get(currentPath) : undefined,
          };
          pathMap.set(currentPath, node);

          if (index === 0) {
            tree.push(node);
          } else {
            const parentPath = parts.slice(0, index).join('/');
            const parent = pathMap.get(parentPath);
            if (parent) {
              const children = Array.isArray(parent.children) ? parent.children : [];
              parent.children = children;
              children.push(node);
            }
          }
        }
      });
    });

    return tree;
  }, []);

  // Load project files
  const loadProjectFiles = useCallback(async (projectIdToLoad?: string): Promise<number> => {
    const idToUse = projectIdToLoad || projectId;
    if (!idToUse) return 0;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [filesResponse, gitStatusResponse] = await Promise.allSettled([
        listProjectFiles(idToUse),
        getGitStatus(idToUse).catch(() => null),
      ]);

      const response = filesResponse.status === 'fulfilled' ? filesResponse.value : null;
      const gitStatus = gitStatusResponse.status === 'fulfilled' ? gitStatusResponse.value : null;

      if (response?.files && Array.isArray(response.files) && response.files.length > 0) {
        // Create git status map
        const gitStatusMap = new Map<string, 'modified' | 'added' | 'deleted'>();
        if (gitStatus?.files) {
          gitStatus.files.forEach((change: { status: string; file: string }) => {
            if (change.status === 'modified' || change.status === 'renamed') {
              gitStatusMap.set(change.file, 'modified');
            } else if (change.status === 'added' || change.status === 'untracked') {
              gitStatusMap.set(change.file, 'added');
            } else if (change.status === 'deleted') {
              gitStatusMap.set(change.file, 'deleted');
            }
          });
        }

        // Update git state
        if (gitStatus) {
          dispatch({ type: 'SET_GIT_BRANCH', payload: gitStatus.branch || 'main' });
          const hasModified = gitStatus.files && gitStatus.files.length > 0;
          const hasConflict = gitStatus.files?.some((f: any) => f.status === 'conflict');
          dispatch({
            type: 'SET_GIT_STATUS',
            payload: hasConflict ? 'conflict' : hasModified ? 'modified' : 'clean',
          });
        }

        // Pass full file objects to buildFileTree to preserve content
        const fileTree = buildFileTree(response.files, gitStatusMap);
        dispatch({ type: 'SET_FILES', payload: fileTree });
        
        // Also populate openFiles map with content for files that have it
        response.files.forEach((f: any) => {
          if (typeof f === 'object' && f.content && f.path) {
            dispatch({ type: 'OPEN_FILE', payload: { path: f.path, content: f.content } });
          }
        });
        
        return response.files.length;
      } else {
        // Don't clear files if backend returns empty - keep existing local files
        logger.info('Backend returned no files, keeping existing local files');
        return 0;
      }
    } catch (error: any) {
      // Don't clear files on error - keep existing local files
      logger.error('Failed to load project files', error);
      return 0;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [projectId, dispatch, buildFileTree]);

  // Open a file
  const handleFileClick = useCallback(async (filePath: string) => {
    if (openFiles.has(filePath)) {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: filePath });
      return;
    }

    // Check if file content exists in the files state (from Build navigation)
    const findFileContent = (nodes: FileNode[], path: string): string | null => {
      for (const node of nodes) {
        if (node.path === path && node.type === 'file') {
          return (node as any).content || null;
        }
        if (node.children) {
          const found = findFileContent(node.children, path);
          if (found !== null) return found;
        }
      }
      return null;
    };

    const localContent = findFileContent(files, filePath);
    if (localContent !== null) {
      dispatch({ type: 'OPEN_FILE', payload: { path: filePath, content: localContent } });
      dispatch({ type: 'ADD_TO_HISTORY', payload: filePath });
      return;
    }

    // If no local content, try to read from backend
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await readProjectFile(filePath);
      if (response.exists) {
        dispatch({ type: 'OPEN_FILE', payload: { path: filePath, content: response.content } });
        dispatch({ type: 'ADD_TO_HISTORY', payload: filePath });
      } else {
        // File doesn't exist on backend - open with empty content
        dispatch({ type: 'OPEN_FILE', payload: { path: filePath, content: '' } });
        dispatch({ type: 'ADD_TO_HISTORY', payload: filePath });
      }
    } catch (error) {
      logger.error('Failed to read file from backend, opening with empty content', error);
      // Open file with empty content instead of showing error
      dispatch({ type: 'OPEN_FILE', payload: { path: filePath, content: '' } });
      dispatch({ type: 'ADD_TO_HISTORY', payload: filePath });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [openFiles, files, dispatch]);

  // Save current file
  const handleSave = useCallback(async () => {
    if (!activeTabId) return;

    const content = openFiles.get(activeTabId);
    if (!content) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await writeProjectFile(activeTabId, content, undefined, projectId);
      dispatch({ type: 'MARK_SAVED', payload: activeTabId });
      await loadProjectFiles();
      onSuccess?.('File saved successfully');
    } catch (error) {
      logger.error('Failed to save file', error);
      onError?.('Failed to save file');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [activeTabId, openFiles, dispatch, loadProjectFiles, onSuccess, onError]);

  // Create new file
  const handleNewFile = useCallback(async (parentPath: string) => {
    const fileName = prompt('Enter file name:');
    if (!fileName || !projectId) return;

    const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await createProjectFile(fullPath, false, '', projectId);
      await loadProjectFiles();
      dispatch({ type: 'OPEN_FILE', payload: { path: fullPath, content: '' } });
      onSuccess?.('File created successfully');
    } catch (error) {
      logger.error('Failed to create file', error);
      onError?.('Failed to create file');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [projectId, dispatch, loadProjectFiles, onSuccess, onError]);

  // Create new folder
  const handleNewFolder = useCallback(async (parentPath: string) => {
    const folderName = prompt('Enter folder name:');
    if (!folderName || !projectId) return;

    const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await createProjectFile(fullPath, true, '', projectId);
      await loadProjectFiles();
      onSuccess?.('Folder created successfully');
    } catch (error) {
      logger.error('Failed to create folder', error);
      onError?.('Failed to create folder');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [projectId, dispatch, loadProjectFiles, onSuccess, onError]);

  // Rename file/folder
  const handleRename = useCallback(async (path: string, newName?: string) => {
    const name = newName || prompt('Enter new name:', path.split('/').pop());
    if (!name) return;

    const parentPath = path.split('/').slice(0, -1).join('/');
    const newPath = parentPath ? `${parentPath}/${name}` : name;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await renameProjectFile(path, newPath);
      await loadProjectFiles();
      
      // Update open file if renamed
      if (openFiles.has(path)) {
        const content = openFiles.get(path) || '';
        dispatch({ type: 'CLOSE_FILE', payload: path });
        dispatch({ type: 'OPEN_FILE', payload: { path: newPath, content } });
      }
      
      onSuccess?.('Renamed successfully');
    } catch (error) {
      logger.error('Failed to rename', error);
      onError?.('Failed to rename');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, loadProjectFiles, openFiles, onSuccess, onError]);

  // Delete file/folder
  const handleDelete = useCallback(async (path: string) => {
    if (!confirm(`Are you sure you want to delete "${path}"?`)) return;

    console.log('🗑️ Deleting path:', path);
    
    // FIRST: Clear localStorage immediately to prevent reload issues
    try {
      const savedFiles = localStorage.getItem(projectFilesStorageKey) || localStorage.getItem('ide-project-files');
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles);
        if (!Array.isArray(parsedFiles)) return;
        
        // Recursively remove from tree structure
        const removeFromTree = (nodes: any[]): any[] => {
          return nodes
            .filter((node: any) => {
              const shouldRemove = node.path === path || node.path.startsWith(path + '/');
              if (shouldRemove) console.log('  🗑️ Removing:', node.path);
              return !shouldRemove;
            })
            .map((node: any) => {
              if (node.children && node.children.length > 0) {
                return { ...node, children: removeFromTree(node.children) };
              }
              return node;
            });
        };
        
        const filteredFiles = removeFromTree(parsedFiles);
        console.log('  💾 Files remaining:', filteredFiles.length);
        
        if (filteredFiles.length === 0) {
          localStorage.removeItem(projectFilesStorageKey);
          localStorage.removeItem(projectNameStorageKey);
          localStorage.removeItem('ide-project-files');
          localStorage.removeItem('ide-project-name');
          console.log('  💾 localStorage cleared');
        } else {
          localStorage.setItem(projectFilesStorageKey, JSON.stringify(filteredFiles));
        }
      }
    } catch (e) {
      console.error('Failed to update localStorage:', e);
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Try backend delete if we have a projectId
      if (projectId) {
        try {
          await deleteProjectFile(path, projectId);
        } catch (backendErr) {
          logger.warn('Backend delete failed, removing from local state only', backendErr as Record<string, unknown>);
        }
      }
      
      // Close file if open
      if (openFiles.has(path)) {
        dispatch({ type: 'CLOSE_FILE', payload: path });
      }
      
      // Remove from local state
      dispatch({ type: 'DELETE_FILE', payload: path });
      
      onSuccess?.('Deleted successfully');
    } catch (error) {
      logger.error('Failed to delete', error);
      onError?.('Failed to delete');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [projectId, dispatch, openFiles, onSuccess, onError]);

  // Move file/folder
  const handleMove = useCallback(async (sourcePath: string, targetPath: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await moveProjectFile(sourcePath, targetPath);
      await loadProjectFiles();
      
      // Update open file if moved
      if (openFiles.has(sourcePath)) {
        const content = openFiles.get(sourcePath) || '';
        dispatch({ type: 'CLOSE_FILE', payload: sourcePath });
        dispatch({ type: 'OPEN_FILE', payload: { path: targetPath, content } });
      }
      
      onSuccess?.('Moved successfully');
    } catch (error) {
      logger.error('Failed to move', error);
      onError?.('Failed to move');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, loadProjectFiles, openFiles, onSuccess, onError]);

  // Clear project - delete all files
  const handleClearProject = useCallback(() => {
    if (!confirm('Are you sure you want to clear ALL files? This cannot be undone.')) return;
    
    // Clear from state
    dispatch({ type: 'CLEAR_PROJECT' });
    
    // Clear from localStorage
    try {
      localStorage.removeItem(projectFilesStorageKey);
      localStorage.removeItem(projectNameStorageKey);
      localStorage.removeItem('ide-project-files');
      localStorage.removeItem('ide-project-name');
    } catch (e) {
      logger.warn('Failed to clear localStorage', e as Record<string, unknown>);
    }
    
    onSuccess?.('All files cleared');
  }, [dispatch, onSuccess]);

  // Flatten files for search
  const flattenFiles = useCallback((nodes: FileNode[]): string[] => {
    const result: string[] = [];
    const traverse = (items: FileNode[]) => {
      for (const item of items) {
        if (item.type === 'file') {
          result.push(item.path);
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    };
    traverse(nodes);
    return result;
  }, []);

  // Find first file in tree
  const findFirstFile = useCallback((nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') return node;
      if (node.children?.length) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  return {
    // State
    files,
    openFiles,
    activeTabId,
    unsavedChanges,
    
    // Actions
    loadProjectFiles,
    handleFileClick,
    handleSave,
    handleNewFile,
    handleNewFolder,
    handleRename,
    handleDelete,
    handleMove,
    handleClearProject,
    
    // Utilities
    flattenFiles,
    findFirstFile,
    buildFileTree,
  };
}
