// ============== PROJECT EXPLORER ==============
// File tree navigator with search and actions

import React, { memo, useState, useCallback, useMemo } from 'react';
import styles from './ProjectExplorer.module.css';

interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  size?: number;
  modified?: Date;
  language?: string;
}

interface ProjectExplorerProps {
  files: FileNode[];
  selectedPath?: string;
  expandedPaths?: string[];
  onFileSelect?: (file: FileNode) => void;
  onFileOpen?: (file: FileNode) => void;
  onCreateFile?: (parentPath: string, type: 'file' | 'folder') => void;
  onDeleteFile?: (file: FileNode) => void;
  onRenameFile?: (file: FileNode, newName: string) => void;
  className?: string;
}

const ProjectExplorerComponent: React.FC<ProjectExplorerProps> = ({
  files,
  selectedPath,
  expandedPaths: initialExpanded = [],
  onFileSelect,
  onFileOpen,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  className,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(initialExpanded));
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileNode } | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleFileClick = useCallback((file: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.type === 'folder') {
      toggleExpand(file.path);
    }
    onFileSelect?.(file);
  }, [toggleExpand, onFileSelect]);

  const handleFileDoubleClick = useCallback((file: FileNode) => {
    if (file.type === 'file') {
      onFileOpen?.(file);
    }
  }, [onFileOpen]);

  const handleContextMenu = useCallback((e: React.MouseEvent, file: FileNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const startRename = useCallback((file: FileNode) => {
    setRenamingPath(file.path);
    setRenameValue(file.name);
    closeContextMenu();
  }, [closeContextMenu]);

  const confirmRename = useCallback((file: FileNode) => {
    if (renameValue && renameValue !== file.name) {
      onRenameFile?.(file, renameValue);
    }
    setRenamingPath(null);
    setRenameValue('');
  }, [renameValue, onRenameFile]);

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'folder') {
      return expandedPaths.has(file.path) ? '📂' : '📁';
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return '🔷';
      case 'js': case 'jsx': return '🟨';
      case 'py': return '🐍';
      case 'css': case 'scss': return '🎨';
      case 'html': return '🌐';
      case 'json': return '📋';
      case 'md': return '📝';
      case 'png': case 'jpg': case 'svg': return '🖼️';
      case 'git': case 'gitignore': return '📦';
      default: return '📄';
    }
  };

  const filterFiles = useCallback((nodes: FileNode[], query: string): FileNode[] => {
    if (!query) return nodes;
    
    return nodes.reduce<FileNode[]>((acc, node) => {
      if (node.name.toLowerCase().includes(query.toLowerCase())) {
        acc.push(node);
      } else if (node.children) {
        const filteredChildren = filterFiles(node.children, query);
        if (filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
      }
      return acc;
    }, []);
  }, []);

  const filteredFiles = useMemo(() => 
    filterFiles(files, searchQuery), [files, searchQuery, filterFiles]);

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = selectedPath === node.path;
    const isRenaming = renamingPath === node.path;

    return (
      <div key={node.id} className={styles.nodeWrapper}>
        <div
          className={`${styles.node} ${isSelected ? styles.selected : ''} ${node.type === 'folder' ? styles.folder : styles.file}`}
          style={{ paddingLeft: depth * 16 + 8 }}
          onClick={e => handleFileClick(node, e)}
          onDoubleClick={() => handleFileDoubleClick(node)}
          onContextMenu={e => handleContextMenu(e, node)}
        >
          {node.type === 'folder' && (
            <span className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}>▶</span>
          )}
          <span className={styles.icon}>{getFileIcon(node)}</span>
          {isRenaming ? (
            <input
              type="text"
              className={styles.renameInput}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onBlur={() => confirmRename(node)}
              onKeyDown={e => {
                if (e.key === 'Enter') confirmRename(node);
                if (e.key === 'Escape') setRenamingPath(null);
              }}
              autoFocus
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className={styles.name}>{node.name}</span>
          )}
        </div>
        {node.type === 'folder' && isExpanded && node.children && (
          <div className={styles.children}>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles.container} ${className || ''}`} onClick={closeContextMenu}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.titleIcon}>📁</span>
          Explorer
        </h3>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => onCreateFile?.('/', 'file')}
            title="New File"
          >
            +📄
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => onCreateFile?.('/', 'folder')}
            title="New Folder"
          >
            +📁
          </button>
        </div>
      </div>

      <div className={styles.search}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search files..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>×</button>
        )}
      </div>

      <div className={styles.tree}>
        {filteredFiles.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p>No files found</p>
          </div>
        ) : (
          filteredFiles.map(node => renderNode(node))
        )}
      </div>

      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { onFileOpen?.(contextMenu.file); closeContextMenu(); }}>
            Open
          </button>
          <button onClick={() => startRename(contextMenu.file)}>
            Rename
          </button>
          {contextMenu.file.type === 'folder' && (
            <>
              <button onClick={() => { onCreateFile?.(contextMenu.file.path, 'file'); closeContextMenu(); }}>
                New File
              </button>
              <button onClick={() => { onCreateFile?.(contextMenu.file.path, 'folder'); closeContextMenu(); }}>
                New Folder
              </button>
            </>
          )}
          <div className={styles.divider} />
          <button className={styles.danger} onClick={() => { onDeleteFile?.(contextMenu.file); closeContextMenu(); }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export const ProjectExplorer = memo(ProjectExplorerComponent);
export default ProjectExplorer;
