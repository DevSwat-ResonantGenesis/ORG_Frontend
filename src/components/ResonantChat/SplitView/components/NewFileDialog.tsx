// NewFileDialog Component - Dialog for creating new files

import React from 'react';
import { CloseIcon } from '@/components/Icons/ResonantChatIcons';
import styles from '../EnhancedSplitView.module.css';

interface NewFileDialogProps {
  isOpen: boolean;
  fileName: string;
  language: string;
  onFileNameChange: (name: string) => void;
  onLanguageChange: (lang: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const LANGUAGE_OPTIONS = [
  { value: 'typescript', label: 'TypeScript (.ts/.tsx)' },
  { value: 'javascript', label: 'JavaScript (.js/.jsx)' },
  { value: 'python', label: 'Python (.py)' },
  { value: 'html', label: 'HTML (.html)' },
  { value: 'css', label: 'CSS (.css)' },
  { value: 'json', label: 'JSON (.json)' },
  { value: 'markdown', label: 'Markdown (.md)' },
];

export const NewFileDialog: React.FC<NewFileDialogProps> = ({
  isOpen,
  fileName,
  language,
  onFileNameChange,
  onLanguageChange,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim()) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className={styles.dialogOverlay} onClick={onClose}>
      <div 
        className={styles.dialogContent} 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.dialogHeader}>
          <h3>Create New File</h3>
          <button className={styles.dialogClose} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.dialogBody}>
            <div className={styles.formGroup}>
              <label htmlFor="fileName">File Name</label>
              <input
                id="fileName"
                type="text"
                value={fileName}
                onChange={(e) => onFileNameChange(e.target.value)}
                placeholder="e.g., src/components/Button.tsx"
                autoFocus
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className={styles.formSelect}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.dialogFooter}>
            <button type="button" className={styles.dialogButtonSecondary} onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.dialogButtonPrimary}
              disabled={!fileName.trim()}
            >
              Create File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFileDialog;
