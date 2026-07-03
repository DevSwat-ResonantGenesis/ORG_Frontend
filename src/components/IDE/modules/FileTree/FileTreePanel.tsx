import React from 'react';
import { CursorFileTree, type FileNode } from '../../CursorFileTree';
import { ResizablePanel } from '../../ResizablePanel';
import styles from './FileTreePanel.module.css';

export interface FileTreePanelProps {
    // File tree data
    files: FileNode[];
    expandedFolders: Set<string>;
    activeFile: string | null;

    // Dimensions
    width: number;
    onResize: (width: number) => void;

    // File operations
    onFileClick: (path: string) => void;
    onFileDoubleClick?: (path: string) => void;
    onToggleFolder: (path: string) => void;

    // CRUD operations
    onNewFile: (parentPath: string) => void;
    onNewFolder: (parentPath: string) => void;
    onRename: (path: string, newName?: string) => void;
    onDelete: (path: string) => void;
    onMove?: (sourcePath: string, targetPath: string) => void;

    // Project operations
    onArchive?: (path: string) => void;
    onClearProject?: () => void;
    projectId?: string;

    // UI state
    loading?: boolean;
}

/**
 * FileTreePanel - Encapsulates the file explorer panel with all file tree operations
 * 
 * This component provides:
 * - File tree visualization with expand/collapse
 * - File and folder CRUD operations
 * - Drag and drop support
 * - Context menu for file operations
 * - Resizable panel
 */
export const FileTreePanel: React.FC<FileTreePanelProps> = ({
    files,
    expandedFolders,
    activeFile,
    width,
    onResize,
    onFileClick,
    onFileDoubleClick,
    onToggleFolder,
    onNewFile,
    onNewFolder,
    onRename,
    onDelete,
    onMove,
    onArchive,
    onClearProject,
    projectId,
    loading = false,
}) => {
    return (
        <ResizablePanel
            direction="horizontal"
            defaultSize={width}
            minSize={200}
            maxSize={500}
            onResize={onResize}
            handlePosition="right"
        >
            <div className={styles.fileTreePanel}>
                {loading && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.spinner} />
                    </div>
                )}
                <CursorFileTree
                    files={files}
                    onFileClick={onFileClick}
                    onFileDoubleClick={onFileDoubleClick}
                    expandedFolders={expandedFolders}
                    onToggleFolder={onToggleFolder}
                    activeFile={activeFile}
                    onNewFile={onNewFile}
                    onNewFolder={onNewFolder}
                    onRename={onRename}
                    onDelete={onDelete}
                    onArchive={onArchive}
                    onMove={onMove}
                    onClearProject={onClearProject}
                    projectId={projectId}
                />
            </div>
        </ResizablePanel>
    );
};
