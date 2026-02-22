import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Play, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';

type TestStatus = 'passed' | 'failed' | 'pending' | 'running' | 'skipped';

interface TestResult {
  id: string;
  name: string;
  status: TestStatus;
  duration?: number;
  error?: string;
  assertions?: number;
  children?: TestResult[];
}

interface TestDataDisplayProps {
  results: TestResult[];
  title?: string;
  showSummary?: boolean;
  onRerun?: (testId: string) => void;
  onRunAll?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<TestStatus, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  label: string;
}> = {
  passed: {
    icon: <CheckCircle size={16} />,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    label: 'Passed',
  },
  failed: {
    icon: <XCircle size={16} />,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    label: 'Failed',
  },
  pending: {
    icon: <Clock size={16} />,
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    label: 'Pending',
  },
  running: {
    icon: <Play size={16} />,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    label: 'Running',
  },
  skipped: {
    icon: <AlertTriangle size={16} />,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Skipped',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#ccc',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.8125rem',
  },
  results: {
    padding: '0.5rem',
  },
  testItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '6px',
    transition: 'all 0.15s',
  },
  testItemHover: {
    background: 'rgba(255, 255, 255, 0.03)',
  },
  expandButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#666',
    cursor: 'pointer',
    flexShrink: 0,
  },
  statusIcon: {
    flexShrink: 0,
    marginTop: '0.125rem',
  },
  testContent: {
    flex: 1,
    minWidth: 0,
  },
  testName: {
    fontSize: '0.8125rem',
    color: '#e4e4e7',
    margin: 0,
  },
  testMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.25rem',
  },
  duration: {
    fontSize: '0.6875rem',
    color: '#666',
  },
  assertions: {
    fontSize: '0.6875rem',
    color: '#666',
  },
  error: {
    marginTop: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#ef4444',
    fontFamily: "'JetBrains Mono', monospace",
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  children: {
    marginLeft: '1.5rem',
    borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
    paddingLeft: '0.5rem',
  },
  rerunButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#666',
    cursor: 'pointer',
    opacity: 0,
    transition: 'all 0.15s',
  },
  rerunButtonVisible: {
    opacity: 1,
  },
};

const TestItem: React.FC<{
  result: TestResult;
  depth?: number;
  onRerun?: (testId: string) => void;
}> = ({ result, depth = 0, onRerun }) => {
  const [isExpanded, setIsExpanded] = useState(result.status === 'failed');
  const [isHovered, setIsHovered] = useState(false);
  const config = STATUS_CONFIG[result.status];
  const hasChildren = result.children && result.children.length > 0;

  return (
    <div>
      <div
        style={{
          ...styles.testItem,
          ...(isHovered ? styles.testItemHover : {}),
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasChildren ? (
          <button
            style={styles.expandButton}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div style={{ width: '20px' }} />
        )}

        <span style={{ ...styles.statusIcon, color: config.color }}>
          {config.icon}
        </span>

        <div style={styles.testContent}>
          <p style={styles.testName}>{result.name}</p>
          <div style={styles.testMeta}>
            {result.duration !== undefined && (
              <span style={styles.duration}>{result.duration}ms</span>
            )}
            {result.assertions !== undefined && (
              <span style={styles.assertions}>
                {result.assertions} assertion{result.assertions !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          {result.error && result.status === 'failed' && (
            <div style={styles.error}>{result.error}</div>
          )}
        </div>

        {onRerun && (
          <button
            style={{
              ...styles.rerunButton,
              ...(isHovered ? styles.rerunButtonVisible : {}),
            }}
            onClick={() => onRerun(result.id)}
            title="Rerun test"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div style={styles.children}>
          {result.children!.map((child) => (
            <TestItem key={child.id} result={child} depth={depth + 1} onRerun={onRerun} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TestDataDisplay: React.FC<TestDataDisplayProps> = ({
  results,
  title = 'Test Results',
  showSummary = true,
  onRerun,
  onRunAll,
  className,
}) => {
  const countByStatus = (items: TestResult[]): Record<TestStatus, number> => {
    const counts: Record<TestStatus, number> = {
      passed: 0,
      failed: 0,
      pending: 0,
      running: 0,
      skipped: 0,
    };

    const count = (list: TestResult[]) => {
      list.forEach((item) => {
        counts[item.status]++;
        if (item.children) count(item.children);
      });
    };

    count(items);
    return counts;
  };

  const counts = countByStatus(results);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        <div style={styles.actions}>
          {onRunAll && (
            <button style={styles.actionButton} onClick={onRunAll}>
              <Play size={12} />
              Run All
            </button>
          )}
        </div>
      </div>

      {showSummary && (
        <div style={styles.summary}>
          <span style={{ ...styles.summaryItem, color: '#888' }}>
            {total} tests
          </span>
          {counts.passed > 0 && (
            <span style={{ ...styles.summaryItem, color: STATUS_CONFIG.passed.color }}>
              {STATUS_CONFIG.passed.icon}
              {counts.passed} passed
            </span>
          )}
          {counts.failed > 0 && (
            <span style={{ ...styles.summaryItem, color: STATUS_CONFIG.failed.color }}>
              {STATUS_CONFIG.failed.icon}
              {counts.failed} failed
            </span>
          )}
          {counts.skipped > 0 && (
            <span style={{ ...styles.summaryItem, color: STATUS_CONFIG.skipped.color }}>
              {STATUS_CONFIG.skipped.icon}
              {counts.skipped} skipped
            </span>
          )}
        </div>
      )}

      <div style={styles.results}>
        {results.map((result) => (
          <TestItem key={result.id} result={result} onRerun={onRerun} />
        ))}
      </div>
    </div>
  );
};

// Test progress bar
interface TestProgressProps {
  passed: number;
  failed: number;
  pending: number;
  total: number;
  className?: string;
}

export const TestProgress: React.FC<TestProgressProps> = ({
  passed,
  failed,
  pending,
  total,
  className,
}) => {
  const passedPercent = (passed / total) * 100;
  const failedPercent = (failed / total) * 100;
  const pendingPercent = (pending / total) * 100;

  return (
    <div
      style={{
        display: 'flex',
        height: '8px',
        borderRadius: '4px',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.05)',
      }}
      className={className}
    >
      <div
        style={{
          width: `${passedPercent}%`,
          background: STATUS_CONFIG.passed.color,
          transition: 'width 0.3s',
        }}
      />
      <div
        style={{
          width: `${failedPercent}%`,
          background: STATUS_CONFIG.failed.color,
          transition: 'width 0.3s',
        }}
      />
      <div
        style={{
          width: `${pendingPercent}%`,
          background: STATUS_CONFIG.pending.color,
          transition: 'width 0.3s',
        }}
      />
    </div>
  );
};

export default TestDataDisplay;
