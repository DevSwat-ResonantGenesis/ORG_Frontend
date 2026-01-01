import React from 'react';
import styles from './InlineActions.module.css';

interface InlineActionsProps {
  position: { x: number; y: number };
  onFix?: () => void;
  onExplain?: () => void;
  onRefactor?: () => void;
  onClose?: () => void;
}

export const InlineActions: React.FC<InlineActionsProps> = ({
  position,
  onFix,
  onExplain,
  onRefactor,
  onClose,
}) => {
  return (
    <div
      className={styles.inlineActions}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
    >
      {onFix && (
        <button
          className={styles.actionButton}
          onClick={onFix}
          title="Fix this code"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 2L9 6L13 7L9 8L7 12L5 8L1 7L5 6L7 2Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Fix
        </button>
      )}
      {onExplain && (
        <button
          className={styles.actionButton}
          onClick={onExplain}
          title="Explain this code"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5" />
            <path d="M7 5V7M7 9H7.01" strokeLinecap="round" />
          </svg>
          Explain
        </button>
      )}
      {onRefactor && (
        <button
          className={styles.actionButton}
          onClick={onRefactor}
          title="Refactor this code"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 7H11M7 3V11" strokeLinecap="round" />
          </svg>
          Refactor
        </button>
      )}
      {onClose && (
        <button
          className={styles.closeButton}
          onClick={onClose}
          title="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3L9 9M9 3L3 9" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
};

