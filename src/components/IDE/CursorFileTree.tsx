import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './CursorFileTree.module.css';
import { FileContextMenu } from './FileContextMenu';
import { FileIcon } from './FileIcon';

export interface FileNode {
  path: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
  gitStatus?: 'modified' | 'added' | 'deleted' | null;
  content?: string;
}

interface CursorFileTreeProps {
  files: FileNode[];
  onFileClick: (path: string) => void;
  onFileDoubleClick?: (path: string) => void;
  expandedFolders?: Set<string>;
  onToggleFolder?: (path: string) => void;
  activeFile?: string | null;
  onNewFile?: (parentPath: string) => void;
  onNewFolder?: (parentPath: string) => void;
  onRename?: (path: string, newName?: string) => void;
  onDelete?: (path: string) => void;
  onArchive?: (path: string) => void;  // Archive project (for folders)
  onMove?: (sourcePath: string, targetPath: string) => void;
  onClearProject?: () => void;
  projectId?: string;
}

export const CursorFileTree: React.FC<CursorFileTreeProps> = React.memo(({
  files,
  onFileClick,
  onFileDoubleClick,
  expandedFolders = new Set(),
  onToggleFolder,
  activeFile,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  onArchive,
  onMove,
  onClearProject,
  projectId,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    path: string;
    isFile: boolean;
  } | null>(null);
  const [draggedPath, setDraggedPath] = useState<string | null>(null);
  const [dragOverPath, setDragOverPath] = useState<string | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const activeFileRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active file
  useEffect(() => {
    if (activeFile && activeFileRef.current) {
      activeFileRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeFile]);

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️ Right-click detected on:', node.path, 'Type:', node.type);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      path: node.path,
      isFile: node.type === 'file',
    });
    console.log('📋 Context menu opened for:', node.path);
  };

  const handleDragStart = (e: React.DragEvent, node: FileNode) => {
    if (node.type === 'file' || node.type === 'folder') {
      setDraggedPath(node.path);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', node.path);
    }
  };

  const handleDragOver = (e: React.DragEvent, node: FileNode) => {
    if (draggedPath && draggedPath !== node.path && node.type === 'folder') {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverPath(node.path);
    }
  };

  const handleDragLeave = () => {
    setDragOverPath(null);
  };

  const handleDrop = (e: React.DragEvent, targetNode: FileNode) => {
    e.preventDefault();
    if (draggedPath && targetNode.type === 'folder' && onMove) {
      const targetPath = targetNode.path === '/' ? targetNode.path : `${targetNode.path}/`;
      const fileName = draggedPath.split('/').pop() || '';
      const newPath = targetNode.path === '/' ? fileName : `${targetNode.path}/${fileName}`;
      onMove(draggedPath, newPath);
    }
    setDraggedPath(null);
    setDragOverPath(null);
  };

  const handleRename = (path: string) => {
    const node = findNode(files, path);
    if (node) {
      setRenamingPath(path);
      setRenameValue(node.name);
    }
    setContextMenu(null);
  };

  const handleRenameSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && renamingPath && onRename && renameValue.trim()) {
      onRename(renamingPath, renameValue.trim());
      setRenamingPath(null);
      setRenameValue('');
    } else if (e.key === 'Escape') {
      setRenamingPath(null);
      setRenameValue('');
    }
  };

  const findNode = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findNode(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const getParentPath = (path: string): string => {
    const parts = path.split('/').filter(p => p);
    if (parts.length === 0) return '/';
    parts.pop();
    return parts.length === 0 ? '/' : '/' + parts.join('/');
  };

  const renderFileIcon = (node: FileNode) => {
    if (node.type === 'folder') {
      const isExpanded = expandedFolders.has(node.path);
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          {isExpanded ? (
            <path d="M2 4C2 3.44772 2.44772 3 3 3H5.58579C5.851 3 6.10536 3.10536 6.29289 3.29289L8.70711 5.70711C8.89464 5.89464 9.149 6 9.41421 6H11C11.5523 6 12 6.44772 12 7V10C12 10.5523 11.5523 11 11 11H3C2.44772 11 2 10.5523 2 10V4Z" />
          ) : (
            <path d="M2 4C2 3.44772 2.44772 3 3 3H5.58579C5.851 3 6.10536 3.10536 6.29289 3.29289L8.70711 5.70711C8.89464 5.89464 9.149 6 9.41421 6H11C11.5523 6 12 6.44772 12 7V10C12 10.5523 11.5523 11 11 11H3C2.44772 11 2 10.5523 2 10V4Z" />
          )}
        </svg>
      );
    }
    
    return <FileIcon fileName={node.name} />;
  };

  const renderGitStatus = (node: FileNode) => {
    if (!node.gitStatus) return null;
    
    const statusColors = {
      modified: '#ffa500',
      added: '#4ec9b0',
      deleted: '#f48771',
    };
    
    return (
      <span
        className={styles.gitStatus}
        style={{ color: statusColors[node.gitStatus] }}
        title={node.gitStatus.charAt(0).toUpperCase() + node.gitStatus.slice(1)}
      >
        ●
      </span>
    );
  };

  const renderNode = (node: FileNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    const isActive = activeFile === node.path;
    const isDragging = draggedPath === node.path;
    const isDragOver = dragOverPath === node.path;
    const isRenaming = renamingPath === node.path;

    return (
      <div
        key={node.path}
        className={styles.node}
        ref={isActive ? activeFileRef : null}
      >
        <div
          className={`${styles.nodeRow} ${node.type === 'file' ? styles.fileRow : styles.folderRow} ${isActive ? styles.active : ''} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (isRenaming) return;
            if (node.type === 'folder' && onToggleFolder) {
              onToggleFolder(node.path);
            } else {
              onFileClick(node.path);
            }
          }}
          onDoubleClick={() => {
            if (isRenaming) return;
            if (node.type === 'file' && onFileDoubleClick) {
              onFileDoubleClick(node.path);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
          draggable={!!onMove}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
        >
          {node.type === 'folder' && (
            <span className={styles.expandIcon}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <path d="M4 3L8 6L4 9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          {node.type === 'file' && <span className={styles.expandIcon} />}
          <span className={styles.fileIcon}>{renderFileIcon(node)}</span>
          {isRenaming ? (
            <input
              className={styles.renameInput}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameSubmit}
              onBlur={() => {
                setRenamingPath(null);
                setRenameValue('');
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={styles.fileName} title={node.path}>
              <span className={styles.fileNameBase}>
                {node.type === 'file' && node.name.includes('.') 
                  ? node.name.substring(0, node.name.lastIndexOf('.'))
                  : node.name}
              </span>
              {node.type === 'file' && node.name.includes('.') && (
                <span className={styles.fileExtension}>
                  .{node.name.split('.').pop()}
                </span>
              )}
            </span>
          )}
          {!isRenaming && renderGitStatus(node)}
        </div>
        {node.type === 'folder' && isExpanded && hasChildren && (
          <div className={styles.children}>
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className={styles.fileTree}>
        <div className={styles.treeHeader}>
          <span className={styles.headerTitle}>Explorer</span>
          <div className={styles.headerButtons}>
            {onNewFile && (
              <button
                className={styles.headerButton}
                onClick={() => onNewFile('/')}
                title="New File"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 2V12M2 7H12" strokeLinecap="round" />
                </svg>
              </button>
            )}
            {onNewFolder && (
              <button
                className={styles.headerButton}
                onClick={() => onNewFolder('/')}
                title="New Folder"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 4C2 3.44772 2.44772 3 3 3H5.58579C5.851 3 6.10536 3.10536 6.29289 3.29289L8.70711 5.70711C8.89464 5.89464 9.149 6 9.41421 6H11C11.5523 6 12 6.44772 12 7V10C12 10.5523 11.5523 11 11 11H3C2.44772 11 2 10.5523 2 10V4Z" />
                </svg>
              </button>
            )}
            {onClearProject && projectId && (
              <button
                className={styles.headerButton}
                onClick={onClearProject}
                title="Clear Project (Upload New)"
                style={{ color: '#f48771' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3L11 11M11 3L3 11" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className={styles.treeContent}>
          {files.length === 0 ? (
            <div className={styles.emptyTree}>
              <p>No files</p>
              <p className={styles.emptyHint}>Upload a project to get started</p>
              {onClearProject && projectId && (
                <button
                  className={styles.clearButton}
                  onClick={onClearProject}
                  style={{
                    marginTop: '12px',
                    padding: '6px 12px',
                    background: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: '#cccccc',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Clear Project
                </button>
              )}
            </div>
          ) : (
            <>
              {files.map((file) => renderNode(file))}
              <div style={{ 
                padding: '8px 12px', 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.4)', 
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#3b82f6', flexShrink: 0 }}>
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Right-click files/folders to delete, rename, or create new items
              </div>
            </>
          )}
        </div>
      </div>
      {contextMenu && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isFile={contextMenu.isFile}
          onNewFile={() => {
            if (onNewFile) {
              onNewFile(contextMenu.isFile ? getParentPath(contextMenu.path) : contextMenu.path);
            }
            setContextMenu(null);
          }}
          onNewFolder={() => {
            if (onNewFolder) {
              onNewFolder(contextMenu.isFile ? getParentPath(contextMenu.path) : contextMenu.path);
            }
            setContextMenu(null);
          }}
          onRename={() => handleRename(contextMenu.path)}
          onArchive={() => {
            if (onArchive && !contextMenu.isFile) {
              console.log('📦 Context menu archive clicked:', contextMenu.path);
              onArchive(contextMenu.path);
            }
            setContextMenu(null);
          }}
          onDelete={() => {
            console.log('🗑️ Context menu delete clicked:', contextMenu.path, 'onDelete exists:', !!onDelete);
            if (onDelete) {
              console.log('🗑️ Calling onDelete handler with path:', contextMenu.path);
              onDelete(contextMenu.path);
            } else {
              console.error('❌ onDelete handler is not provided!');
            }
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
});
