import React, { useState, useCallback } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import styles from './DiffViewer.module.css';

export interface DiffFile {
  path: string;
  oldCode: string;
  newCode: string;
  language?: string;
}

interface DiffViewerProps {
  oldCode?: string;
  newCode?: string;
  files?: DiffFile[]; // Multi-file support
  onAccept?: (filePath?: string) => void;
  onReject?: (filePath?: string) => void;
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  fileName?: string;
  showLineNumbers?: boolean;
  splitView?: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  oldCode,
  newCode,
  files,
  onAccept,
  onReject,
  onAcceptAll,
  onRejectAll,
  fileName,
  showLineNumbers = true,
  splitView = true,
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [acceptedFiles, setAcceptedFiles] = useState<Set<string>>(new Set());
  const [rejectedFiles, setRejectedFiles] = useState<Set<string>>(new Set());

  // Determine if multi-file or single-file mode
  const isMultiFile = files && files.length > 0;
  const currentFile = isMultiFile ? files[selectedFileIndex] : null;
  const currentOldCode = isMultiFile ? currentFile?.oldCode : oldCode || '';
  const currentNewCode = isMultiFile ? currentFile?.newCode : newCode || '';
  const currentFileName = isMultiFile ? currentFile?.path : fileName || 'File Changes';

  const handleAccept = useCallback(() => {
    if (isMultiFile && currentFile) {
      setAcceptedFiles(prev => new Set(prev).add(currentFile.path));
      onAccept?.(currentFile.path);
    } else {
      onAccept?.();
    }
  }, [isMultiFile, currentFile, onAccept]);

  const handleReject = useCallback(() => {
    if (isMultiFile && currentFile) {
      setRejectedFiles(prev => new Set(prev).add(currentFile.path));
      onReject?.(currentFile.path);
    } else {
      onReject?.();
    }
  }, [isMultiFile, currentFile, onReject]);

  const handleAcceptAll = useCallback(() => {
    if (isMultiFile && files) {
      files.forEach(file => {
        setAcceptedFiles(prev => new Set(prev).add(file.path));
        onAccept?.(file.path);
      });
      onAcceptAll?.();
    } else {
      onAcceptAll?.();
    }
  }, [isMultiFile, files, onAccept, onAcceptAll]);

  const handleRejectAll = useCallback(() => {
    if (isMultiFile && files) {
      files.forEach(file => {
        setRejectedFiles(prev => new Set(prev).add(file.path));
        onReject?.(file.path);
      });
      onRejectAll?.();
    } else {
      onRejectAll?.();
    }
  }, [isMultiFile, files, onReject, onRejectAll]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onReject) {
        handleReject();
      }
      // Navigate between files with arrow keys
      if (isMultiFile && files) {
        if (e.key === 'ArrowRight' && selectedFileIndex < files.length - 1) {
          setSelectedFileIndex(prev => prev + 1);
        } else if (e.key === 'ArrowLeft' && selectedFileIndex > 0) {
          setSelectedFileIndex(prev => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMultiFile, files, selectedFileIndex, onReject, handleReject]);

  const getFileStatus = (filePath: string) => {
    if (acceptedFiles.has(filePath)) return 'accepted';
    if (rejectedFiles.has(filePath)) return 'rejected';
    return 'pending';
  };

  return (
    <div className={styles.diffContainer}>
      <div className={styles.diffHeader}>
        <div className={styles.diffHeaderLeft}>
          <h2 className={styles.diffTitle}>
            {isMultiFile ? `AI Changes (${files.length} files)` : `AI Changes: ${currentFileName}`}
          </h2>
          {isMultiFile && files && (
            <div className={styles.fileTabs}>
              {files.map((file, index) => {
                const status = getFileStatus(file.path);
                return (
                  <button
                    key={file.path}
                    className={`${styles.fileTab} ${index === selectedFileIndex ? styles.active : ''} ${styles[status]}`}
                    onClick={() => setSelectedFileIndex(index)}
                    title={file.path}
                  >
                    <span className={styles.fileTabName}>
                      {file.path.split('/').pop() || file.path}
                    </span>
                    {status === 'accepted' && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 6L5 9L10 3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {status === 'rejected' && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3L9 9M9 3L3 9" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className={styles.diffHeaderRight}>
          {isMultiFile && (onAcceptAll || onRejectAll) && (
            <div className={styles.bulkActions}>
              {onRejectAll && (
                <button
                  className={styles.rejectAllButton}
                  onClick={handleRejectAll}
                  title="Reject All (Cmd+Shift+R)"
                >
                  Reject All
                </button>
              )}
              {onAcceptAll && (
                <button
                  className={styles.acceptAllButton}
                  onClick={handleAcceptAll}
                  title="Accept All (Cmd+Shift+A)"
                >
                  Accept All
                </button>
              )}
            </div>
          )}
        {onReject && (
          <button
            className={styles.closeButton}
              onClick={handleReject}
            aria-label="Close diff viewer"
              title="Close (Esc)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4L12 12M12 4L4 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
        </div>
      </div>

      <div className={styles.diffContent}>
        <ReactDiffViewer
          oldValue={currentOldCode}
          newValue={currentNewCode}
          splitView={splitView}
          hideLineNumbers={!showLineNumbers}
          showDiffOnly={false}
          leftTitle="Original"
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
            codeFold: {
              backgroundColor: 'var(--ide-bg-primary, #0a0a0a)',
            },
            titleBlock: {
              backgroundColor: 'var(--ide-bg-secondary, #151515)',
              borderBottom: '1px solid var(--ide-border, #0a0a0a)',
            },
          }}
        />
      </div>

      {(onAccept || onReject) && (
        <div className={styles.diffActions}>
          <div className={styles.diffActionsLeft}>
            {isMultiFile && files && (
              <span className={styles.fileCounter}>
                File {selectedFileIndex + 1} of {files.length}
              </span>
            )}
          </div>
          <div className={styles.diffActionsRight}>
          {onReject && (
            <button
              className={styles.rejectButton}
                onClick={handleReject}
                title="Reject Changes (Esc)"
            >
              Reject Changes
            </button>
          )}
          {onAccept && (
            <button
              className={styles.acceptButton}
                onClick={handleAccept}
                title="Accept Changes (Enter)"
            >
                Accept Changes
            </button>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

