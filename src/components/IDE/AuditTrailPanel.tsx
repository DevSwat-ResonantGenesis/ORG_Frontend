import React, { useState, useMemo } from 'react';
import { useAuditTrail, useAuditSummary, type AuditEntry, type AuditEntryType } from '../../services';
import styles from './AuditTrailPanel.module.css';

interface AuditTrailPanelProps {
  onClose?: () => void;
  filePath?: string;
}

export const AuditTrailPanel: React.FC<AuditTrailPanelProps> = ({ onClose, filePath }) => {
  const [filter, setFilter] = useState<AuditEntryType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showAIOnly, setShowAIOnly] = useState(false);

  const query = useMemo(() => ({
    types: filter === 'all' ? undefined : [filter],
    actorTypes: showAIOnly ? ['ai' as const] : undefined,
    targetPath: filePath,
    search: search || undefined,
    limit: 100,
  }), [filter, showAIOnly, filePath, search]);

  const { entries, summary } = useAuditTrail(query);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Activity Log</h3>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        )}
      </div>

      <SummaryBar summary={summary} />

      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select 
          className={styles.filterSelect}
          value={filter}
          onChange={(e) => setFilter(e.target.value as AuditEntryType | 'all')}
        >
          <option value="all">All Types</option>
          <option value="file_change">File Changes</option>
          <option value="code_execution">Code Execution</option>
          <option value="ai_action">AI Actions</option>
          <option value="git_operation">Git Operations</option>
          <option value="task_execution">Task Execution</option>
          <option value="user_action">User Actions</option>
        </select>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={showAIOnly}
            onChange={(e) => setShowAIOnly(e.target.checked)}
          />
          AI only
        </label>
      </div>

      <div className={styles.entriesList}>
        {entries.length === 0 ? (
          <div className={styles.emptyState}>
            <span>📋</span>
            <p>No activities found</p>
          </div>
        ) : (
          entries.map(entry => (
            <AuditEntryItem key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
};

interface SummaryBarProps {
  summary: {
    totalEntries: number;
    totalCost: number;
    totalTokens: number;
    successRate: number;
  } | null;
}

const SummaryBar: React.FC<SummaryBarProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className={styles.summaryBar}>
      <div className={styles.summaryItem}>
        <span className={styles.summaryValue}>{summary.totalEntries}</span>
        <span className={styles.summaryLabel}>Actions</span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.summaryValue}>${summary.totalCost.toFixed(4)}</span>
        <span className={styles.summaryLabel}>Cost</span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.summaryValue}>{summary.totalTokens.toLocaleString()}</span>
        <span className={styles.summaryLabel}>Tokens</span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.summaryValue}>{(summary.successRate * 100).toFixed(0)}%</span>
        <span className={styles.summaryLabel}>Success</span>
      </div>
    </div>
  );
};

interface AuditEntryItemProps {
  entry: AuditEntry;
}

const AuditEntryItem: React.FC<AuditEntryItemProps> = ({ entry }) => {
  const [expanded, setExpanded] = useState(false);

  const getIcon = (type: AuditEntryType) => {
    switch (type) {
      case 'file_change': return '📄';
      case 'code_execution': return '▶️';
      case 'ai_action': return '🤖';
      case 'git_operation': return '📝';
      case 'task_execution': return '⚡';
      case 'user_action': return '👤';
      case 'system_event': return '⚙️';
      default: return '•';
    }
  };

  const getActorColor = (type: string) => {
    switch (type) {
      case 'ai': return '#a855f7';
      case 'user': return '#3b82f6';
      case 'system': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`${styles.entryItem} ${entry.result.success ? '' : styles.failed}`}>
      <div className={styles.entryHeader} onClick={() => setExpanded(!expanded)}>
        <span className={styles.entryIcon}>{getIcon(entry.type)}</span>
        
        <div className={styles.entryMain}>
          <div className={styles.entryTitle}>
            <span 
              className={styles.actorBadge}
              style={{ backgroundColor: getActorColor(entry.actor.type) }}
            >
              {entry.actor.name}
            </span>
            <span className={styles.entryAction}>{entry.action}</span>
          </div>
          <span className={styles.entryDesc}>{entry.details.description}</span>
        </div>

        <div className={styles.entryMeta}>
          {entry.result.duration > 0 && (
            <span className={styles.duration}>{(entry.result.duration / 1000).toFixed(2)}s</span>
          )}
          <span className={styles.timestamp}>{formatTime(entry.timestamp)}</span>
          <span className={styles.expandIcon}>{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {expanded && (
        <div className={styles.entryDetails}>
          {entry.target.path && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Target:</span>
              <span className={styles.detailValue}>{entry.target.path}</span>
            </div>
          )}

          {entry.metadata.tokensUsed && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Tokens:</span>
              <span className={styles.detailValue}>{entry.metadata.tokensUsed.toLocaleString()}</span>
            </div>
          )}

          {entry.metadata.cost && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Cost:</span>
              <span className={styles.detailValue}>${entry.metadata.cost.toFixed(4)}</span>
            </div>
          )}

          {entry.details.prompt && (
            <div className={styles.detailSection}>
              <span className={styles.detailLabel}>Prompt:</span>
              <pre className={styles.codeBlock}>{entry.details.prompt}</pre>
            </div>
          )}

          {entry.details.output && (
            <div className={styles.detailSection}>
              <span className={styles.detailLabel}>Output:</span>
              <pre className={styles.codeBlock}>{entry.details.output}</pre>
            </div>
          )}

          {entry.details.diff && (
            <div className={styles.detailSection}>
              <span className={styles.detailLabel}>Changes:</span>
              <div className={styles.diffStats}>
                <span className={styles.additions}>+{entry.details.diff.additions}</span>
                <span className={styles.deletions}>-{entry.details.diff.deletions}</span>
              </div>
            </div>
          )}

          {!entry.result.success && entry.result.error && (
            <div className={styles.errorSection}>
              <span className={styles.detailLabel}>Error:</span>
              <pre className={styles.errorBlock}>{entry.result.error}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditTrailPanel;
