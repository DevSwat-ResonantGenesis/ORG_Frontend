import React, { useEffect, useRef } from 'react';
import styles from './InlineComment.module.css';

/**
 * Module C: Inline AI Comments (Copilot-Style)
 * Floating comment bubble for code explanations
 */
interface InlineCommentProps {
  top: number;
  left: number;
  message: string;
  onClose?: () => void;
  examples?: string[];
  relatedConcepts?: string[];
}

export const InlineComment: React.FC<InlineCommentProps> = ({
  top,
  left,
  message,
  onClose,
  examples,
  relatedConcepts,
}) => {
  const commentRef = useRef<HTMLDivElement>(null);

  // Position adjustment to keep within viewport
  useEffect(() => {
    if (commentRef.current) {
      const rect = commentRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust if going off-screen
      if (rect.right > viewportWidth) {
        commentRef.current.style.left = `${left - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        commentRef.current.style.top = `${top - rect.height}px`;
      }
    }
  }, [top, left]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={commentRef}
      className={styles.commentBubble}
      style={{ top: `${top}px`, left: `${left}px` }}
    >
      {onClose && (
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
          title="Close (Esc)"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3L9 9M9 3L3 9" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <div className={styles.message}>{message}</div>

      {examples && examples.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Examples:</div>
          {examples.map((example, idx) => (
            <div key={idx} className={styles.example}>
              <code>{example}</code>
            </div>
          ))}
        </div>
      )}

      {relatedConcepts && relatedConcepts.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Related Concepts:</div>
          <div className={styles.concepts}>
            {relatedConcepts.map((concept, idx) => (
              <span key={idx} className={styles.conceptTag}>
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

