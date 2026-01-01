import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import styles from './PatchModal.module.css';

/**
 * Module B: AI Patch System Modal
 * Shows side-by-side diff of old vs new code with apply/cancel options
 */
interface PatchModalProps {
  oldCode: string;
  newCode: string;
  fileName?: string;
  onApply: () => void;
  onCancel: () => void;
  explanation?: string;
}

export const PatchModal: React.FC<PatchModalProps> = ({
  oldCode,
  newCode,
  fileName = 'File',
  onApply,
  onCancel,
  explanation,
}) => {
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        onApply();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onApply, onCancel]);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>AI Patch Preview: {fileName}</h2>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Close"
            title="Close (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4L12 12M12 4L4 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {explanation && (
          <div className={styles.explanation}>
            <strong>AI Explanation:</strong> {explanation}
          </div>
        )}

        <div className={styles.diffContainer}>
          <ReactDiffViewer
            oldValue={oldCode}
            newValue={newCode}
            splitView={true}
            hideLineNumbers={false}
            showDiffOnly={false}
            leftTitle="Original Code"
            rightTitle="AI Suggested Changes"
            useDarkTheme={true}
            styles={{
              diffContainer: {
                backgroundColor: '#1c1c1c',
                color: '#cccccc',
                fontFamily: 'var(--font-mono, "Fira Code", "Consolas", monospace)',
                fontSize: '13px',
                lineHeight: '1.6',
              },
              diffRemoved: {
                backgroundColor: 'rgba(255, 59, 48, 0.15)',
                color: '#ff6b6b',
                textDecoration: 'line-through',
              },
              diffAdded: {
                backgroundColor: 'rgba(52, 199, 89, 0.15)',
                color: '#51cf66',
              },
              lineNumber: {
                color: '#666666',
                userSelect: 'none',
              },
              gutter: {
                backgroundColor: '#151515',
                borderRight: '1px solid #0a0a0a',
              },
              wordAdded: {
                backgroundColor: 'rgba(52, 199, 89, 0.3)',
                color: '#51cf66',
              },
              wordRemoved: {
                backgroundColor: 'rgba(255, 59, 48, 0.3)',
                color: '#ff6b6b',
                textDecoration: 'line-through',
              },
            }}
          />
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            title="Cancel (Esc)"
          >
            Cancel
          </button>
          <button
            className={styles.applyButton}
            onClick={onApply}
            title="Apply Patch (Cmd+Enter)"
          >
            Apply Patch
          </button>
        </div>
      </div>
    </div>
  );
};

