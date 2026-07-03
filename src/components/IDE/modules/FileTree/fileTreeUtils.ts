import { FileNode } from '../../CursorFileTree';

/**
 * Build a hierarchical file tree from a flat list of file paths
 * @param fileList - Array of file objects with path and optional language
 * @param gitStatusMap - Optional map of file paths to git status
 * @returns Hierarchical tree structure
 */
export const buildFileTree = (
    fileList: Array<{ path: string; language?: string }>,
    gitStatusMap?: Map<string, 'modified' | 'added' | 'deleted'>
): FileNode[] => {
    const tree: FileNode[] = [];
    const pathMap = new Map<string, FileNode>();

    fileList.forEach(file => {
        const parts = file.path.split('/');
        let currentPath = '';

        parts.forEach((part, index) => {
            const isLast = index === parts.length - 1;
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            if (!pathMap.has(currentPath)) {
                // Get git status for this file (only for files, not folders)
                const gitStatus = isLast && gitStatusMap ? gitStatusMap.get(file.path) : undefined;

                const node: FileNode = {
                    path: currentPath,
                    name: part,
                    type: isLast ? 'file' : 'folder',
                    language: isLast ? file.language : undefined,
                    gitStatus: gitStatus || null,
                    children: []
                };

                pathMap.set(currentPath, node);

                if (index === 0) {
                    tree.push(node);
                } else {
                    const parentPath = parts.slice(0, index).join('/');
                    const parent = pathMap.get(parentPath);
                    if (parent) {
                        parent.children = parent.children || [];
                        parent.children.push(node);
                    }
                }
            }
        });
    });

    return tree;
};

/**
 * Find a specific node in the file tree by path
 * @param nodes - Array of file tree nodes to search
 * @param targetPath - Path to search for
 * @returns The found node or null
 */
export const findNodeInTree = (nodes: FileNode[], targetPath: string): FileNode | null => {
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

/**
 * Find the first file in the tree (depth-first search)
 * @param nodes - Array of file tree nodes to search
 * @returns The first file found or null
 */
export const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
        if (node.type === 'file') {
            return node;
        }
        if (node.children && node.children.length > 0) {
            const found = findFirstFile(node.children);
            if (found) return found;
        }
    }
    return null;
};

/**
 * Flatten the file tree into a simple array
 * @param nodes - Array of file tree nodes to flatten
 * @returns Flat array of files and folders
 */
export const flattenFiles = (nodes: FileNode[]): Array<{ path: string; name: string; type: 'file' | 'folder' }> => {
    const result: Array<{ path: string; name: string; type: 'file' | 'folder' }> = [];
    const traverse = (node: FileNode) => {
        result.push({ path: node.path, name: node.name, type: node.type });
        if (node.children) {
            node.children.forEach(traverse);
        }
    };
    nodes.forEach(traverse);
    return result;
};

/**
 * Check if a path represents a folder by examining the file tree
 * @param nodes - Array of file tree nodes to search
 * @param folderPath - Path to check
 * @returns True if the path is a folder
 */
export const checkIfFolderInTree = (nodes: FileNode[], folderPath: string): boolean => {
    for (const node of nodes) {
        // If any file starts with folderPath + '/', it's a folder
        if (node.path.startsWith(folderPath + '/') && node.path !== folderPath) {
            return true;
        }
        if (node.children) {
            if (checkIfFolderInTree(node.children, folderPath)) return true;
        }
    }
    return false;
};

/**
 * Sort file tree nodes (folders first, then alphabetically)
 * @param nodes - Array of file tree nodes to sort
 * @returns Sorted array
 */
export const sortFileTree = (nodes: FileNode[]): FileNode[] => {
    return nodes.sort((a, b) => {
        // Folders come before files
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;

        // Alphabetical within same type
        return a.name.localeCompare(b.name);
    });
};

/**
 * Get parent path from a file path
 * @param path - File path
 * @returns Parent directory path
 */
export const getParentPath = (path: string): string => {
    const parts = path.split('/').filter(p => p);
    if (parts.length === 0) return '/';
    parts.pop();
    return parts.length === 0 ? '/' : '/' + parts.join('/');
};
