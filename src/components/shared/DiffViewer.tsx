import React, { useState, useMemo } from 'react';
import { Plus, Minus, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';

type DiffLineType = 'added' | 'removed' | 'unchanged' | 'header';

interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface DiffViewerProps {
  oldCode: string;
  newCode: string;
  oldTitle?: string;
  newTitle?: string;
  language?: string;
  showLineNumbers?: boolean;
  unified?: boolean;
  className?: string;
}

const TYPE_STYLES: Record<DiffLineType, {
  bg: string;
  color: string;
  lineNumBg: string;
}> = {
  added: {
    bg: 'rgba(16, 185, 129, 0.1)',
    color: '#7ee787',
    lineNumBg: 'rgba(16, 185, 129, 0.15)',
  },
  removed: {
    bg: 'rgba(239, 68, 68, 0.1)',
    color: '#ff7b72',
    lineNumBg: 'rgba(239, 68, 68, 0.15)',
  },
  unchanged: {
    bg: 'transparent',
    color: '#e4e4e7',
    lineNumBg: 'transparent',
  },
  header: {
    bg: 'rgba(99, 102, 241, 0.1)',
    color: '#818cf8',
    lineNumBg: 'rgba(99, 102, 241, 0.15)',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#0d1117',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  titles: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  title: {
    fontSize: '0.8125rem',
    color: '#888',
  },
  titleOld: {
    color: '#ff7b72',
  },
  titleNew: {
    color: '#7ee787',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.75rem',
  },
  statAdded: {
    color: '#7ee787',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  statRemoved: {
    color: '#ff7b72',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  body: {
    overflow: 'auto',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    lineHeight: 1.6,
  },
  line: {
    display: 'flex',
    minHeight: '1.6em',
  },
  lineNumber: {
    width: '40px',
    textAlign: 'right',
    padding: '0 0.5rem',
    color: '#666',
    userSelect: 'none',
    flexShrink: 0,
  },
  lineIndicator: {
    width: '20px',
    textAlign: 'center',
    flexShrink: 0,
    fontWeight: '600',
  },
  lineContent: {
    flex: 1,
    padding: '0 1rem 0 0.5rem',
    whiteSpace: 'pre',
  },
  splitView: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  splitPane: {
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
  },
  copyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    color: '#888',
    fontSize: '0.6875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  hunk: {
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  hunkHeader: {
    padding: '0.375rem 1rem',
    background: 'rgba(99, 102, 241, 0.05)',
    color: '#818cf8',
    fontSize: '0.6875rem',
  },
};

function computeDiff(oldLines: string[], newLines: string[]): DiffLine[] {
  const result: DiffLine[] = [];
  let oldIdx = 0;
  let newIdx = 0;

  // Simple LCS-based diff
  const lcs = (a: string[], b: string[]): number[][] => {
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    return dp;
  };

  const dp = lcs(oldLines, newLines);
  const backtrack = (i: number, j: number) => {
    if (i === 0 && j === 0) return;

    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      backtrack(i - 1, j - 1);
      result.push({
        type: 'unchanged',
        content: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      backtrack(i, j - 1);
      result.push({
        type: 'added',
        content: newLines[j - 1],
        newLineNumber: j,
      });
    } else if (i > 0) {
      backtrack(i - 1, j);
      result.push({
        type: 'removed',
        content: oldLines[i - 1],
        oldLineNumber: i,
      });
    }
  };

  backtrack(oldLines.length, newLines.length);
  return result;
}

const DiffLine: React.FC<{
  line: DiffLine;
  showLineNumbers: boolean;
}> = ({ line, showLineNumbers }) => {
  const typeStyle = TYPE_STYLES[line.type];
  const indicator = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';

  return (
    <div style={{ ...styles.line, background: typeStyle.bg }}>
      {showLineNumbers && (
        <>
          <span style={{ ...styles.lineNumber, background: typeStyle.lineNumBg }}>
            {line.oldLineNumber || ''}
          </span>
          <span style={{ ...styles.lineNumber, background: typeStyle.lineNumBg }}>
            {line.newLineNumber || ''}
          </span>
        </>
      )}
      <span style={{ ...styles.lineIndicator, color: typeStyle.color }}>
        {indicator}
      </span>
      <span style={{ ...styles.lineContent, color: typeStyle.color }}>
        {line.content}
      </span>
    </div>
  );
};

export const DiffViewer: React.FC<DiffViewerProps> = ({
  oldCode,
  newCode,
  oldTitle = 'Original',
  newTitle = 'Modified',
  language,
  showLineNumbers = true,
  unified = true,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const diffLines = useMemo(() => {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    return computeDiff(oldLines, newLines);
  }, [oldCode, newCode]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffLines.forEach((line) => {
      if (line.type === 'added') added++;
      if (line.type === 'removed') removed++;
    });
    return { added, removed };
  }, [diffLines]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.titles}>
          <span style={{ ...styles.title, ...styles.titleOld }}>{oldTitle}</span>
          <span style={styles.title}>→</span>
          <span style={{ ...styles.title, ...styles.titleNew }}>{newTitle}</span>
          {language && (
            <span style={{ ...styles.title, marginLeft: '0.5rem' }}>
              ({language})
            </span>
          )}
        </div>
        <div style={styles.stats}>
          <span style={styles.statAdded}>
            <Plus size={12} />
            {stats.added}
          </span>
          <span style={styles.statRemoved}>
            <Minus size={12} />
            {stats.removed}
          </span>
          <button
            style={{
              ...styles.copyButton,
              color: copied ? '#10b981' : '#888',
            }}
            onClick={handleCopy}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy new'}
          </button>
        </div>
      </div>

      <div style={styles.body}>
        {diffLines.map((line, index) => (
          <DiffLine key={index} line={line} showLineNumbers={showLineNumbers} />
        ))}
      </div>
    </div>
  );
};

// Inline diff for single line changes
interface InlineDiffProps {
  oldText: string;
  newText: string;
  className?: string;
}

export const InlineDiff: React.FC<InlineDiffProps> = ({
  oldText,
  newText,
  className,
}) => {
  if (oldText === newText) {
    return <span className={className}>{oldText}</span>;
  }

  return (
    <span className={className}>
      <span
        style={{
          background: 'rgba(239, 68, 68, 0.2)',
          color: '#ff7b72',
          textDecoration: 'line-through',
          padding: '0 0.25rem',
          borderRadius: '2px',
        }}
      >
        {oldText}
      </span>
      <span style={{ margin: '0 0.25rem', color: '#888' }}>→</span>
      <span
        style={{
          background: 'rgba(16, 185, 129, 0.2)',
          color: '#7ee787',
          padding: '0 0.25rem',
          borderRadius: '2px',
        }}
      >
        {newText}
      </span>
    </span>
  );
};

export default DiffViewer;
