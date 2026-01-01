// FileTree Component - Displays project file structure

import React from 'react';
import type { FileTreeNode, ProjectFile } from '../types';
import { getFileIcon } from '../constants';
import styles from '../EnhancedSplitView.module.css';

interface FileTreeProps {
  nodes: FileTreeNode[];
  selectedFile: ProjectFile | null;
  expandedFolders: Set<string>;
  onSelectFile: (file: ProjectFile) => void;
  onToggleFolder: (path: string) => void;
  onDeleteFile?: (path: string) => void;
  level?: number;
}

export const FileTree: React.FC<FileTreeProps> = ({
  nodes,
  selectedFile,
  expandedFolders,
  onSelectFile,
  onToggleFolder,
  onDeleteFile,
  level = 0,
}) => {
  return (
    <>
      {nodes.map((node) => {
        const isExpanded = expandedFolders.has(node.path);
        const isSelected = selectedFile?.path === node.path;

        if (node.type === 'folder') {
          return (
            <div key={node.path}>
              <div
                className={`${styles.treeNode} ${isExpanded ? styles.expanded : ''}`}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onClick={() => onToggleFolder(node.path)}
              >
                <span className={styles.folderIcon}>
                  {getFileIcon(node.path, true, isExpanded)}
                </span>
                <span className={styles.treeNodeName}>{node.name}</span>
              </div>
              {isExpanded && node.children && (
                <div className={styles.treeChildren}>
                  <FileTree
                    nodes={node.children}
                    selectedFile={selectedFile}
                    expandedFolders={expandedFolders}
                    onSelectFile={onSelectFile}
                    onToggleFolder={onToggleFolder}
                    onDeleteFile={onDeleteFile}
                    level={level + 1}
                  />
                </div>
              )}
            </div>
          );
        }

        return (
          <div
            key={node.path}
            className={`${styles.treeNode} ${styles.fileNode} ${isSelected ? styles.selected : ''}`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
            onClick={() => node.file && onSelectFile(node.file)}
          >
            <span className={styles.fileIcon}>
              {getFileIcon(node.path)}
            </span>
            <span className={styles.treeNodeName}>{node.name}</span>
            {onDeleteFile && (
              <button
                className={styles.deleteFileButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(node.path);
                }}
                title="Delete file"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </>
  );
};

export default FileTree;
