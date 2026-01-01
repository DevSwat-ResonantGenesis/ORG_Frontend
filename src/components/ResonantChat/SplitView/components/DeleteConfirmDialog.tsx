// DeleteConfirmDialog Component - Confirmation dialog for file deletion

import React from 'react';
import { CloseIcon } from '@/components/Icons/ResonantChatIcons';
import styles from '../EnhancedSplitView.module.css';

interface DeleteConfirmDialogProps {
  filePath: string | null;
  onConfirm: (path: string) => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  filePath,
  onConfirm,
  onCancel,
}) => {
  if (!filePath) return null;

  const fileName = filePath.split('/').pop() || filePath;

  return (
    <div className={styles.dialogOverlay} onClick={onCancel}>
      <div 
        className={styles.dialogContent} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHeader}>
          <h3>Delete File</h3>
          <button className={styles.dialogClose} onClick={onCancel}>
            <CloseIcon />
          </button>
        </div>
        <div className={styles.dialogBody}>
          <p>Are you sure you want to delete <strong>{fileName}</strong>?</p>
          <p className={styles.dialogWarning}>This action cannot be undone.</p>
        </div>
        <div className={styles.dialogFooter}>
          <button 
            type="button" 
            className={styles.dialogButtonSecondary} 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className={styles.dialogButtonDanger}
            onClick={() => onConfirm(filePath)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
