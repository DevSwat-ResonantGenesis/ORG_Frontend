import { useCallback, useState } from 'react';
import {
    createProjectFile,
    deleteProjectFile,
    renameProjectFile,
} from '../../../../api/code';
import { logger } from '../../../../utils/logger';
import { FileNode } from '../../CursorFileTree';

export interface UseFileOperationsOptions {
    projectId?: string;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
    onFilesChanged?: () => Promise<void>;
}

export interface UseFileOperationsReturn {
    loading: boolean;

    // File operations
    createFile: (filePath: string, content?: string) => Promise<void>;
    createFolder: (folderPath: string) => Promise<void>;
    renameFile: (oldPath: string, newPath: string) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;

    // Folder state management
    expandedFolders: Set<string>;
    toggleFolder: (path: string) => void;

    // Helper methods
    handleNewFile: (parentPath: string) => Promise<void>;
    handleNewFolder: (parentPath: string) => Promise<void>;
    handleRename: (path: string, files: FileNode[], newName?: string) => Promise<void>;
    handleDelete: (path: string, files: FileNode[]) => Promise<void>;
}

/**
 * Hook for managing file operations in the IDE
 * 
 * Provides:
 * - File CRUD operations (create, rename, delete)
 * - Folder expansion state management
 * - Loading states
 * - Error handling
 */
export const useFileOperations = ({
    projectId,
    onSuccess,
    onError,
    onFilesChanged,
}: UseFileOperationsOptions): UseFileOperationsReturn => {
    const [loading, setLoading] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    // Toggle folder expansion
    const toggleFolder = useCallback((path: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(path)) {
                newSet.delete(path);
            } else {
                newSet.add(path);
            }
            return newSet;
        });
    }, []);

    // Create a new file
    const createFile = useCallback(async (filePath: string, content: string = '') => {
        if (!projectId) {
            onError?.('No project selected');
            return;
        }

        setLoading(true);
        try {
            await createProjectFile(filePath, false, content);
            await onFilesChanged?.();
            onSuccess?.(`File created: ${filePath}`);
        } catch (error) {
            logger.error('Failed to create file', error);
            onError?.('Failed to create file');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [projectId, onSuccess, onError, onFilesChanged]);

    // Create a new folder
    const createFolder = useCallback(async (folderPath: string) => {
        if (!projectId) {
            onError?.('No project selected');
            return;
        }

        setLoading(true);
        try {
            await createProjectFile(folderPath, true, '');
            await onFilesChanged?.();
            onSuccess?.(`Folder created: ${folderPath}`);
        } catch (error) {
            logger.error('Failed to create folder', error);
            onError?.('Failed to create folder');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [projectId, onSuccess, onError, onFilesChanged]);

    // Rename a file or folder
    const renameFile = useCallback(async (oldPath: string, newPath: string) => {
        if (!projectId) {
            onError?.('No project selected');
            return;
        }

        setLoading(true);
        try {
            await renameProjectFile(oldPath, newPath);
            await onFilesChanged?.();
            onSuccess?.(`Renamed: ${oldPath} → ${newPath}`);
        } catch (error) {
            logger.error('Failed to rename file', error);
            onError?.('Failed to rename file');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [projectId, onSuccess, onError, onFilesChanged]);

    // Delete a file or folder
    const deleteFile = useCallback(async (path: string) => {
        if (!projectId) {
            onError?.('No project selected');
            return;
        }

        setLoading(true);
        try {
            await deleteProjectFile(path);
            await onFilesChanged?.();
            onSuccess?.(`Deleted: ${path}`);
        } catch (error) {
            logger.error('Failed to delete file', error);
            onError?.('Failed to delete file');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [projectId, onSuccess, onError, onFilesChanged]);

    // Helper to find node in tree
    const findNodeInTree = (nodes: FileNode[], targetPath: string): FileNode | null => {
        for (const node of nodes) {
            if (node.path === targetPath) {
                return node;
            }
            if (node.children) {
                const found = findNodeInTree(node.children, targetPath);
                if (found) return found;
            }
        }
        return null;
    };

    // Helper to check if path is a folder
    const checkIfFolderInTree = (nodes: FileNode[], folderPath: string): boolean => {
        for (const node of nodes) {
            if (node.path.startsWith(folderPath + '/') && node.path !== folderPath) {
                return true;
            }
            if (node.children) {
                if (checkIfFolderInTree(node.children, folderPath)) return true;
            }
        }
        return false;
    };

    // Handle new file with prompt
    const handleNewFile = useCallback(async (parentPath: string) => {
        const fileName = prompt('Enter file name:');
        if (!fileName) return;

        const filePath = parentPath === '/' ? `/${fileName}` : `${parentPath}/${fileName}`;
        await createFile(filePath);
    }, [createFile]);

    // Handle new folder with prompt
    const handleNewFolder = useCallback(async (parentPath: string) => {
        const folderName = prompt('Enter folder name:');
        if (!folderName) return;

        const folderPath = parentPath === '/' ? `/${folderName}` : `${parentPath}/${folderName}`;
        await createFolder(folderPath);
    }, [createFolder]);

    // Handle rename with prompt
    const handleRename = useCallback(async (path: string, files: FileNode[], newName?: string) => {
        const node = findNodeInTree(files, path);
        if (!node) return;

        // If newName is provided (from inline rename), use it; otherwise prompt
        let finalNewName: string | null = newName || null;
        if (!finalNewName) {
            finalNewName = prompt('Enter new name:', node.name);
        }
        if (!finalNewName || finalNewName === node.name) return;

        const parentPath = path.substring(0, path.length - node.name.length - 1) || '/';
        const newPath = parentPath === '/' ? `/${finalNewName}` : `${parentPath}/${finalNewName}`;

        await renameFile(path, newPath);
    }, [renameFile]);

    // Handle delete with confirmation
    const handleDelete = useCallback(async (path: string, files: FileNode[]) => {
        if (!path || path === '/' || path.trim() === '') {
            alert('Cannot delete root project folder. Please delete individual files or subfolders.');
            return;
        }

        const node = findNodeInTree(files, path);

        // Check if it's a folder
        const isFolderByNode = node && (node.type === 'folder' || (node.children && node.children.length > 0));
        const isFolderByTree = checkIfFolderInTree(files, path);
        const isFolder = isFolderByNode || isFolderByTree;

        let deletePath = path;
        if (isFolder) {
            deletePath = path.endsWith('/') ? path : `${path}/`;
        }

        if (!confirm(`Delete ${path}? This action cannot be undone.`)) return;

        await deleteFile(deletePath);
    }, [deleteFile]);

    return {
        loading,
        createFile,
        createFolder,
        renameFile,
        deleteFile,
        expandedFolders,
        toggleFolder,
        handleNewFile,
        handleNewFolder,
        handleRename,
        handleDelete,
    };
};
