import React from 'react';
import styles from './FileContextMenu.module.css';

interface FileContextMenuProps {
  x: number;
  y: number;
  isFile: boolean;
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;  // Archive project (for folders)
  onClose: () => void;
}

export const FileContextMenu: React.FC<FileContextMenuProps> = ({
  x,
  y,
  isFile,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  onArchive,
  onClose,
}) => {
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking inside the context menu
      const target = e.target as HTMLElement;
      if (target.closest(`.${styles.contextMenu}`)) {
        return;
      }
      onClose();
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Use a small delay to allow button clicks to process first
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className={styles.contextMenu}
      style={{ top: `${y}px`, left: `${x}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      {!isFile && (
        <>
          <button className={styles.menuItem} onClick={onNewFile}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 2V12M2 7H12" strokeLinecap="round" />
            </svg>
            New File
          </button>
          <button className={styles.menuItem} onClick={onNewFolder}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4C2 3.44772 2.44772 3 3 3H5.58579C5.851 3 6.10536 3.10536 6.29289 3.29289L8.70711 5.70711C8.89464 5.89464 9.149 6 9.41421 6H11C11.5523 6 12 6.44772 12 7V10C12 10.5523 11.5523 11 11 11H3C2.44772 11 2 10.5523 2 10V4Z" />
            </svg>
            New Folder
          </button>
          <div className={styles.separator} />
        </>
      )}
      <button className={styles.menuItem} onClick={onRename}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2L12 6M11 1L13 3L10 6L7 3L11 1Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Rename
      </button>
      {!isFile && onArchive && (
        <button 
          className={styles.menuItem} 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📦 Archive button clicked in FileContextMenu');
            if (onArchive) {
              onArchive();
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 4C2 3.44772 2.44772 3 3 3H5.58579C5.851 3 6.10536 3.10536 6.29289 3.29289L8.70711 5.70711C8.89464 5.89464 9.149 6 9.41421 6H11C11.5523 6 12 6.44772 12 7V10C12 10.5523 11.5523 11 11 11H3C2.44772 11 2 10.5523 2 10V4Z" />
            <path d="M4 7L6 9L10 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Archive Project
        </button>
      )}
      <button 
        className={`${styles.menuItem} ${styles.danger}`} 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🗑️ Delete button clicked in FileContextMenu');
          if (onDelete) {
            onDelete();
          } else {
            console.error('❌ onDelete is not provided to FileContextMenu!');
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3L11 11M11 3L3 11" strokeLinecap="round" />
        </svg>
        Delete
      </button>
    </div>
  );
};

