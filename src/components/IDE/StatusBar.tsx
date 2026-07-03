import React from 'react';
import styles from './StatusBar.module.css';

interface StatusBarProps {
  activeFile?: string | null;
  lineNumber?: number;
  columnNumber?: number;
  language?: string;
  encoding?: string;
  lineEnding?: 'LF' | 'CRLF';
  gitBranch?: string;
  gitStatus?: 'clean' | 'modified' | 'conflict';
  errors?: number;
  warnings?: number;
  onBranchClick?: () => void;
  onErrorsClick?: () => void;
  onWarningsClick?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  activeFile,
  lineNumber = 1,
  columnNumber = 1,
  language = 'plaintext',
  encoding = 'UTF-8',
  lineEnding = 'LF',
  gitBranch,
  gitStatus,
  errors = 0,
  warnings = 0,
  onBranchClick,
  onErrorsClick,
  onWarningsClick,
}) => {
  const fileName = activeFile ? activeFile.split('/').pop() || 'Untitled' : 'No file open';
  const filePath = activeFile || '';

  return (
    <div className={styles.statusBar}>
      {/* Left Section - File Info */}
      <div className={styles.statusBarLeft}>
        {activeFile && (
          <>
            <button
              className={styles.statusItem}
              title={filePath}
              onClick={() => {
                // Could open file location in explorer
                console.log('File path:', filePath);
              }}
            >
              <span className={styles.statusText}>{fileName}</span>
            </button>
            <div className={styles.statusDivider} />
            <div className={styles.statusItem}>
              <span className={styles.statusText}>
                {lineNumber}:{columnNumber}
              </span>
            </div>
            <div className={styles.statusDivider} />
            <div className={styles.statusItem}>
              <span className={styles.statusText}>{language}</span>
            </div>
            <div className={styles.statusDivider} />
            <div className={styles.statusItem}>
              <span className={styles.statusText}>{encoding}</span>
            </div>
            <div className={styles.statusDivider} />
            <div className={styles.statusItem}>
              <span className={styles.statusText}>{lineEnding}</span>
            </div>
          </>
        )}
        {!activeFile && (
          <div className={styles.statusItem}>
            <span className={styles.statusTextMuted}>No file open</span>
          </div>
        )}
      </div>

      {/* Right Section - Git, Errors, Warnings */}
      <div className={styles.statusBarRight}>
        {gitBranch && (
          <>
            <button
              className={`${styles.statusItem} ${styles.statusItemClickable} ${gitStatus === 'modified' ? styles.statusItemWarning : ''} ${gitStatus === 'conflict' ? styles.statusItemError : ''}`}
              onClick={onBranchClick}
              title={`Git branch: ${gitBranch}${gitStatus === 'modified' ? ' (modified)' : ''}${gitStatus === 'conflict' ? ' (conflict)' : ''}`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: '4px' }}>
                <path d="M6 1C4.9 1 4 1.9 4 3C4 3.7 4.4 4.3 5 4.7V8.3C4.4 8.7 4 9.3 4 10C4 11.1 4.9 12 6 12C7.1 12 8 11.1 8 10C8 9.3 7.6 8.7 7 8.3V4.7C7.6 4.3 8 3.7 8 3C8 1.9 7.1 1 6 1Z" />
              </svg>
              <span className={styles.statusText}>{gitBranch}</span>
              {gitStatus === 'modified' && (
                <span className={styles.statusDot} style={{ backgroundColor: 'var(--ide-warning)' }} />
              )}
              {gitStatus === 'conflict' && (
                <span className={styles.statusDot} style={{ backgroundColor: 'var(--ide-error)' }} />
              )}
            </button>
            <div className={styles.statusDivider} />
          </>
        )}
        
        {errors > 0 && (
          <>
            <button
              className={`${styles.statusItem} ${styles.statusItemClickable} ${styles.statusItemError}`}
              onClick={onErrorsClick}
              title={`${errors} error${errors !== 1 ? 's' : ''}`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: '4px' }}>
                <circle cx="6" cy="6" r="4" />
                <path d="M6 3V6M6 8H6.01" strokeLinecap="round" />
              </svg>
              <span className={styles.statusText}>{errors}</span>
            </button>
            <div className={styles.statusDivider} />
          </>
        )}

        {warnings > 0 && (
          <>
            <button
              className={`${styles.statusItem} ${styles.statusItemClickable} ${styles.statusItemWarning}`}
              onClick={onWarningsClick}
              title={`${warnings} warning${warnings !== 1 ? 's' : ''}`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: '4px' }}>
                <path d="M6 1L1 11H11L6 1Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 4V7M6 9H6.01" strokeLinecap="round" />
              </svg>
              <span className={styles.statusText}>{warnings}</span>
            </button>
            <div className={styles.statusDivider} />
          </>
        )}

        {/* Theme indicator (optional) */}
        <div className={styles.statusItem}>
          <span className={styles.statusTextMuted}>Ready</span>
        </div>
      </div>
    </div>
  );
};

