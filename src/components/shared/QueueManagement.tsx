import React, { useState } from 'react';
import { ListOrdered, Play, Pause, Trash2, RefreshCw, Search, CheckCircle, XCircle, Clock, AlertTriangle, MoreVertical, Zap, Timer, BarChart3 } from 'lucide-react';

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
type JobPriority = 'low' | 'normal' | 'high' | 'critical';
type QueueType = 'default' | 'email' | 'notifications' | 'analytics' | 'exports';

interface JobData {
  id: string;
  name: string;
  queue: QueueType;
  status: JobStatus;
  priority: JobPriority;
  attempts: number;
  maxAttempts: number;
  progress?: number;
  payload?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  scheduledFor?: Date;
}

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  throughput: number;
  avgProcessingTime: number;
}

interface QueueManagementProps {
  jobs: JobData[];
  stats: QueueStats;
  isPaused: boolean;
  onPauseQueue?: () => void;
  onResumeQueue?: () => void;
  onRetryJob?: (jobId: string) => void;
  onDeleteJob?: (jobId: string) => void;
  onClearCompleted?: () => void;
  onClearFailed?: () => void;
  onRefresh?: () => void;
  className?: string;
}

interface JobRowProps {
  job: JobData;
  onRetry?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<JobStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  pending: {
    label: 'Pending',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
  processing: {
    label: 'Processing',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <RefreshCw size={12} />,
  },
  completed: {
    label: 'Completed',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  failed: {
    label: 'Failed',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  retrying: {
    label: 'Retrying',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
};

const PRIORITY_CONFIG: Record<JobPriority, {
  label: string;
  color: string;
}> = {
  low: { label: 'Low', color: '#888' },
  normal: { label: 'Normal', color: '#3b82f6' },
  high: { label: 'High', color: '#f59e0b' },
  critical: { label: 'Critical', color: '#ef4444' },
};

const QUEUE_CONFIG: Record<QueueType, {
  label: string;
  color: string;
}> = {
  default: { label: 'Default', color: '#888' },
  email: { label: 'Email', color: '#3b82f6' },
  notifications: { label: 'Notifications', color: '#8b5cf6' },
  analytics: { label: 'Analytics', color: '#10b981' },
  exports: { label: 'Exports', color: '#f59e0b' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  pauseButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '8px',
    color: '#f59e0b',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  resumeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  tableContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tableTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  tableActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '180px',
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  tr: {
    transition: 'background 0.15s',
  },
  trHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  td: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.875rem',
    color: '#e4e4e7',
  },
  jobCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  jobName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  jobId: {
    fontSize: '0.6875rem',
    color: '#666',
    fontFamily: "'JetBrains Mono', monospace",
  },
  queueBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  priorityDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  progressBar: {
    width: '60px',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#3b82f6',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  attempts: {
    fontSize: '0.8125rem',
    color: '#888',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  retryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(245, 158, 11, 0.15)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '6px',
    color: '#f59e0b',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatDuration = (ms: number): string => {
  if (ms >= 60000) return `${(ms / 60000).toFixed(1)}m`;
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
};

const JobRow: React.FC<JobRowProps> = ({
  job,
  onRetry,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[job.status];
  const priorityConfig = PRIORITY_CONFIG[job.priority];
  const queueConfig = QUEUE_CONFIG[job.queue];

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={styles.td}>
        <div style={styles.jobCell}>
          <span style={styles.jobName}>{job.name}</span>
          <span style={styles.jobId}>{job.id.slice(0, 8)}</span>
        </div>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.queueBadge, color: queueConfig.color }}>
          {queueConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.statusBadge,
            background: statusConfig.bgColor,
            color: statusConfig.color,
          }}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={{ ...styles.priorityDot, background: priorityConfig.color }} title={priorityConfig.label} />
      </td>
      <td style={styles.td}>
        {job.progress !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${job.progress}%` }} />
            </div>
            <span style={{ fontSize: '0.75rem' }}>{job.progress}%</span>
          </div>
        ) : (
          <span style={{ color: '#666' }}>-</span>
        )}
      </td>
      <td style={styles.td}>
        <span style={styles.attempts}>
          {job.attempts}/{job.maxAttempts}
        </span>
      </td>
      <td style={styles.td}>{formatTimeAgo(job.createdAt)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {job.status === 'failed' && onRetry && (
            <button style={styles.retryButton} onClick={onRetry}>
              <RefreshCw size={12} />
              Retry
            </button>
          )}
          {onDelete && (
            <button style={styles.actionButton} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const QueueManagement: React.FC<QueueManagementProps> = ({
  jobs,
  stats,
  isPaused,
  onPauseQueue,
  onResumeQueue,
  onRetryJob,
  onDeleteJob,
  onClearCompleted,
  onClearFailed,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  const filteredJobs = jobs.filter(j => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    if (searchQuery) {
      return j.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.id.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <ListOrdered size={22} />
          Queue Management
          {isPaused && (
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', marginLeft: '0.5rem' }}>
              (Paused)
            </span>
          )}
        </h2>
        <div style={styles.headerActions}>
          {onRefresh && (
            <button style={styles.refreshButton} onClick={onRefresh}>
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
          {isPaused ? (
            onResumeQueue && (
              <button style={styles.resumeButton} onClick={onResumeQueue}>
                <Play size={14} />
                Resume Queue
              </button>
            )
          ) : (
            onPauseQueue && (
              <button style={styles.pauseButton} onClick={onPauseQueue}>
                <Pause size={14} />
                Pause Queue
              </button>
            )
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#888' }}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#3b82f6' }}>{stats.processing}</div>
          <div style={styles.statLabel}>Processing</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{stats.completed}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#ef4444' }}>{stats.failed}</div>
          <div style={styles.statLabel}>Failed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.throughput}/min</div>
          <div style={styles.statLabel}>Throughput</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{formatDuration(stats.avgProcessingTime)}</div>
          <div style={styles.statLabel}>Avg Time</div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Jobs ({filteredJobs.length})</span>
          <div style={styles.tableActions}>
            <div style={styles.searchInput}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search jobs..."
                style={styles.input}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {onClearCompleted && (
              <button style={styles.clearButton} onClick={onClearCompleted}>
                Clear Completed
              </button>
            )}
            {onClearFailed && (
              <button style={styles.clearButton} onClick={onClearFailed}>
                Clear Failed
              </button>
            )}
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div style={styles.empty}>
            <ListOrdered size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No jobs in queue</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Job</th>
                <th style={styles.th}>Queue</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Progress</th>
                <th style={styles.th}>Attempts</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  onRetry={onRetryJob ? () => onRetryJob(job.id) : undefined}
                  onDelete={onDeleteJob ? () => onDeleteJob(job.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default QueueManagement;
