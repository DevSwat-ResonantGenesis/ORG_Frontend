import React, { useMemo } from 'react';
import styles from './DiffViewer.module.css';

interface DiffViewerProps {
  oldCode: string;
  newCode: string;
  language?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldCode, newCode, language }) => {
  const diffLines = useMemo(() => {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    const maxLines = Math.max(oldLines.length, newLines.length);
    const diff: Array<{
      oldLine: string;
      newLine: string;
      type: 'unchanged' | 'added' | 'removed' | 'modified';
      oldLineNum: number | null;
      newLineNum: number | null;
    }> = [];

    // Simple line-by-line comparison
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';

      if (oldLine === newLine) {
        diff.push({
          oldLine,
          newLine,
          type: 'unchanged',
          oldLineNum: i + 1,
          newLineNum: i + 1,
        });
      } else if (!oldLine) {
        diff.push({
          oldLine: '',
          newLine,
          type: 'added',
          oldLineNum: null,
          newLineNum: i + 1,
        });
      } else if (!newLine) {
        diff.push({
          oldLine,
          newLine: '',
          type: 'removed',
          oldLineNum: i + 1,
          newLineNum: null,
        });
      } else {
        diff.push({
          oldLine,
          newLine,
          type: 'modified',
          oldLineNum: i + 1,
          newLineNum: i + 1,
        });
      }
    }

    return diff;
  }, [oldCode, newCode]);

  return (
    <div className={styles.diffContainer}>
      <div className={styles.diffHeader}>
        <div className={styles.oldHeader}>
          <span className={styles.headerLabel}>Old Code</span>
        </div>
        <div className={styles.newHeader}>
          <span className={styles.headerLabel}>New Code</span>
        </div>
      </div>
      <div className={styles.diffContent}>
        <div className={styles.oldCode}>
          {diffLines.map((line, idx) => (
            <div
              key={`old-${idx}`}
              className={`${styles.line} ${styles[`line${line.type.charAt(0).toUpperCase() + line.type.slice(1)}`]}`}
            >
              <span className={styles.lineNumber}>
                {line.oldLineNum || ' '}
              </span>
              <span className={styles.lineContent}>
                {line.oldLine || '\u00A0'}
              </span>
            </div>
          ))}
        </div>
        <div className={styles.newCode}>
          {diffLines.map((line, idx) => (
            <div
              key={`new-${idx}`}
              className={`${styles.line} ${styles[`line${line.type.charAt(0).toUpperCase() + line.type.slice(1)}`]}`}
            >
              <span className={styles.lineNumber}>
                {line.newLineNum || ' '}
              </span>
              <span className={styles.lineContent}>
                {line.newLine || '\u00A0'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

