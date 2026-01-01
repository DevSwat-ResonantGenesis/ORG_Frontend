/**
 * FileTree Module
 * 
 * Provides file tree functionality for the IDE including:
 * - File tree building and manipulation utilities
 * - File tree panel component with resizable interface
 * - File operations (create, rename, delete, move)
 */

export { FileTreePanel } from './FileTreePanel';
export type { FileTreePanelProps } from './FileTreePanel';

export {
    buildFileTree, checkIfFolderInTree, findFirstFile, findNodeInTree, flattenFiles, getParentPath, sortFileTree
} from './fileTreeUtils';

export { useFileOperations } from './useFileOperations';
export type { UseFileOperationsOptions, UseFileOperationsReturn } from './useFileOperations';

// Re-export FileNode type from CursorFileTree for convenience
export type { FileNode } from '../../CursorFileTree';
