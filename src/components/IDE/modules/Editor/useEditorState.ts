import { useCallback, useMemo, useState } from 'react';
import { writeProjectFile } from '../../../../api/code';
import { logger } from '../../../../utils/logger';

export interface Tab {
    id: string;
    path: string;
    name: string;
    isDirty: boolean;
}

export interface UseEditorStateOptions {
    projectId?: string;
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
    onFilesChanged?: () => Promise<void>;
}

export interface UseEditorStateReturn {
    // State
    openFiles: Map<string, string>;
    tabs: Tab[];
    activeTabId: string | null;
    unsavedChanges: Set<string>;
    loading: boolean;

    // File operations
    openFile: (path: string, content: string) => void;
    closeFile: (path: string) => void;
    setActiveFile: (path: string) => void;

    // Content operations
    updateFileContent: (path: string, content: string) => void;
    saveFile: (path?: string) => Promise<void>;
    saveAllFiles: () => Promise<void>;

    // Tab operations
    handleTabClick: (tabId: string) => void;
    handleTabClose: (tabId: string, e: React.MouseEvent) => void;

    // Editor change handler (debounced)
    handleEditorChange: (value: string | undefined) => void;

    // Getters
    getActiveFileContent: () => string;
    getFileContent: (path: string) => string | undefined;
    isFileDirty: (path: string) => boolean;
    hasUnsavedChanges: () => boolean;
}

/**
 * Hook for managing editor state including open files, tabs, and content
 * 
 * Provides:
 * - File opening/closing
 * - Tab management
 * - Content editing with debouncing
 * - Save operations
 * - Unsaved changes tracking
 */
export const useEditorState = ({
    projectId,
    onSuccess,
    onError,
    onFilesChanged,
}: UseEditorStateOptions): UseEditorStateReturn => {
    const [openFiles, setOpenFiles] = useState<Map<string, string>>(new Map());
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    // Open a file
    const openFile = useCallback((path: string, content: string) => {
        setOpenFiles(prev => {
            const newMap = new Map(prev);
            newMap.set(path, content);
            return newMap;
        });
        setActiveTabId(path);
    }, []);

    // Close a file
    const closeFile = useCallback((path: string) => {
        setOpenFiles(prev => {
            const newMap = new Map(prev);
            newMap.delete(path);
            return newMap;
        });

        setUnsavedChanges(prev => {
            const newSet = new Set(prev);
            newSet.delete(path);
            return newSet;
        });

        // If closing active file, switch to another tab
        setActiveTabId(current => {
            if (current === path) {
                const remainingTabs = Array.from(openFiles.keys()).filter(p => p !== path);
                return remainingTabs[0] || null;
            }
            return current;
        });
    }, [openFiles]);

    // Set active file
    const setActiveFile = useCallback((path: string) => {
        if (openFiles.has(path)) {
            setActiveTabId(path);
        }
    }, [openFiles]);

    // Update file content
    const updateFileContent = useCallback((path: string, content: string) => {
        setOpenFiles(prev => {
            const newMap = new Map(prev);
            newMap.set(path, content);
            return newMap;
        });
        setUnsavedChanges(prev => new Set(prev).add(path));
    }, []);

    // Save a specific file
    const saveFile = useCallback(async (path?: string) => {
        const filePath = path || activeTabId;
        if (!filePath || !projectId) return;

        const content = openFiles.get(filePath);
        if (content === undefined) return;

        setLoading(true);
        try {
            await writeProjectFile(filePath, content);
            setUnsavedChanges(prev => {
                const newSet = new Set(prev);
                newSet.delete(filePath);
                return newSet;
            });
            await onFilesChanged?.();
            onSuccess?.('File saved successfully');
        } catch (error) {
            logger.error('Failed to save file', error);
            onError?.('Failed to save file');
            throw error;
        } finally {
            setLoading(false);
        }
    }, [activeTabId, projectId, openFiles, onSuccess, onError, onFilesChanged]);

    // Save all files
    const saveAllFiles = useCallback(async () => {
        if (!projectId || unsavedChanges.size === 0) return;

        setLoading(true);
        const errors: string[] = [];

        try {
            for (const path of unsavedChanges) {
                const content = openFiles.get(path);
                if (content !== undefined) {
                    try {
                        await writeProjectFile(path, content);
                    } catch (error) {
                        logger.error(`Failed to save ${path}`, error);
                        errors.push(path);
                    }
                }
            }

            if (errors.length === 0) {
                setUnsavedChanges(new Set());
                await onFilesChanged?.();
                onSuccess?.('All files saved successfully');
            } else {
                onError?.(`Failed to save ${errors.length} file(s): ${errors.join(', ')}`);
            }
        } finally {
            setLoading(false);
        }
    }, [projectId, unsavedChanges, openFiles, onSuccess, onError, onFilesChanged]);

    // Handle tab click
    const handleTabClick = useCallback((tabId: string) => {
        setActiveTabId(tabId);
    }, []);

    // Handle tab close
    const handleTabClose = useCallback((tabId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        closeFile(tabId);
    }, [closeFile]);

    // Debounced editor change handler
    const handleEditorChange = useMemo(() => {
        let timeoutId: NodeJS.Timeout;
        return (value: string | undefined) => {
            if (!activeTabId) return;

            // Clear previous timeout
            clearTimeout(timeoutId);

            // Debounce the state update (150ms)
            timeoutId = setTimeout(() => {
                updateFileContent(activeTabId, value || '');
            }, 150);
        };
    }, [activeTabId, updateFileContent]);

    // Update tabs when openFiles or unsavedChanges change
    useMemo(() => {
        const newTabs: Tab[] = Array.from(openFiles.keys()).map(path => ({
            id: path,
            path,
            name: path.split('/').pop() || path,
            isDirty: unsavedChanges.has(path),
        }));
        setTabs(newTabs);

        // Set first tab as active if no active tab
        if (!activeTabId && newTabs.length > 0) {
            setActiveTabId(newTabs[0].id);
        }
    }, [openFiles, unsavedChanges, activeTabId]);

    // Getters
    const getActiveFileContent = useCallback(() => {
        return activeTabId ? openFiles.get(activeTabId) || '' : '';
    }, [activeTabId, openFiles]);

    const getFileContent = useCallback((path: string) => {
        return openFiles.get(path);
    }, [openFiles]);

    const isFileDirty = useCallback((path: string) => {
        return unsavedChanges.has(path);
    }, [unsavedChanges]);

    const hasUnsavedChanges = useCallback(() => {
        return unsavedChanges.size > 0;
    }, [unsavedChanges]);

    return {
        // State
        openFiles,
        tabs,
        activeTabId,
        unsavedChanges,
        loading,

        // File operations
        openFile,
        closeFile,
        setActiveFile,

        // Content operations
        updateFileContent,
        saveFile,
        saveAllFiles,

        // Tab operations
        handleTabClick,
        handleTabClose,

        // Editor change handler
        handleEditorChange,

        // Getters
        getActiveFileContent,
        getFileContent,
        isFileDirty,
        hasUnsavedChanges,
    };
};
