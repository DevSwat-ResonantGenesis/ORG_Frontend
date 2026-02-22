import React, { useState } from 'react';
import { Sparkles, Plus, Search, Play, Pause, CheckCircle, XCircle, Clock, AlertTriangle, Settings, Eye, Trash2, Download, RefreshCw, BarChart3, Database, Zap, TrendingUp } from 'lucide-react';

type FineTuneStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
type DatasetStatus = 'ready' | 'processing' | 'error';

interface TrainingMetrics {
  loss: number;
  accuracy: number;
  epoch: number;
  totalEpochs: number;
  learningRate: number;
  batchSize: number;
}

interface FineTuneDataset {
  id: string;
  name: string;
  status: DatasetStatus;
  samples: number;
  size: number;
  createdAt: Date;
}

interface FineTuneJob {
  id: string;
  name: string;
  description?: string;
  status: FineTuneStatus;
  baseModelId: string;
  baseModelName: string;
  datasetId: string;
  datasetName: string;
  outputModelId?: string;
  outputModelName?: string;
  metrics?: TrainingMetrics;
  progress: number;
  estimatedTimeRemaining?: number;
  cost: number;
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface FineTuningManagerProps {
  jobs: FineTuneJob[];
  datasets: FineTuneDataset[];
  onCreateJob?: () => void;
  onViewJob?: (jobId: string) => void;
  onCancelJob?: (jobId: string) => void;
  onDeleteJob?: (jobId: string) => void;
  onDownloadModel?: (jobId: string) => void;
  onUploadDataset?: () => void;
  onRefresh?: () => void;
  className?: string;
}

interface JobCardProps {
  job: FineTuneJob;
  onView?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

const STATUS_CONFIG: Record<FineTuneStatus, {
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
  running: {
    label: 'Running',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Play size={12} />,
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
  cancelled: {
    label: 'Cancelled',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
};

const DATASET_STATUS_CONFIG: Record<DatasetStatus, {
  label: string;
  color: string;
}> = {
  ready: { label: 'Ready', color: '#10b981' },
  processing: { label: 'Processing', color: '#3b82f6' },
  error: { label: 'Error', color: '#ef4444' },
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
  actionButton: {
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
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '1.5rem',
  },
  jobsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  jobCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  jobCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  jobHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  jobTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  jobIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  jobInfo: {
    flex: 1,
  },
  jobName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  jobMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
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
  modelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#a78bfa',
  },
  jobBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  progressSection: {
    marginBottom: '1rem',
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  progressLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  progressValue: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#e4e4e7',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
  },
  metricItem: {
    textAlign: 'center',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
  },
  metricValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  metricLabel: {
    fontSize: '0.5625rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  jobFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  footerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.6875rem',
    color: '#888',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cancelButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  downloadButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  datasetsCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  datasetsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  datasetsTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  datasetsList: {
    padding: '0.5rem',
  },
  datasetItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '0.25rem',
    transition: 'background 0.15s',
  },
  datasetItemHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  datasetIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
  },
  datasetInfo: {
    flex: 1,
  },
  datasetName: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
    marginBottom: '0.125rem',
  },
  datasetMeta: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  datasetStatus: {
    fontSize: '0.5625rem',
    fontWeight: '600',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
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
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const JobCard: React.FC<JobCardProps> = ({
  job,
  onView,
  onCancel,
  onDelete,
  onDownload,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[job.status];

  return (
    <div
      style={{
        ...styles.jobCard,
        ...(isHovered ? styles.jobCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.jobHeader}>
        <div style={styles.jobTitle}>
          <div
            style={{
              ...styles.jobIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Sparkles size={22} />
          </div>
          <div style={styles.jobInfo}>
            <div style={styles.jobName}>{job.name}</div>
            <div style={styles.jobMeta}>
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
              <span style={styles.modelBadge}>{job.baseModelName}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.jobBody}>
        {job.description && (
          <p style={styles.description}>{job.description}</p>
        )}

        {job.status === 'running' && (
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <span style={styles.progressLabel}>Training Progress</span>
              <span style={styles.progressValue}>
                {job.progress.toFixed(1)}%
                {job.estimatedTimeRemaining && ` • ${formatDuration(job.estimatedTimeRemaining)} remaining`}
              </span>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${job.progress}%`,
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
                }}
              />
            </div>
          </div>
        )}

        {job.metrics && (
          <div style={styles.metricsGrid}>
            <div style={styles.metricItem}>
              <div style={styles.metricValue}>{job.metrics.loss.toFixed(4)}</div>
              <div style={styles.metricLabel}>Loss</div>
            </div>
            <div style={styles.metricItem}>
              <div style={styles.metricValue}>{(job.metrics.accuracy * 100).toFixed(1)}%</div>
              <div style={styles.metricLabel}>Accuracy</div>
            </div>
            <div style={styles.metricItem}>
              <div style={styles.metricValue}>{job.metrics.epoch}/{job.metrics.totalEpochs}</div>
              <div style={styles.metricLabel}>Epoch</div>
            </div>
            <div style={styles.metricItem}>
              <div style={styles.metricValue}>${job.cost.toFixed(2)}</div>
              <div style={styles.metricLabel}>Cost</div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.jobFooter}>
        <div style={styles.footerMeta}>
          <span>Dataset: {job.datasetName}</span>
          <span>By {job.createdBy}</span>
          <span>{formatTimeAgo(job.createdAt)}</span>
        </div>
        <div style={styles.actionButtons}>
          {job.status === 'running' && onCancel && (
            <button style={{ ...styles.iconButton, ...styles.cancelButton }} onClick={onCancel} title="Cancel">
              <Pause size={14} />
            </button>
          )}
          {job.status === 'completed' && onDownload && (
            <button style={{ ...styles.iconButton, ...styles.downloadButton }} onClick={onDownload} title="Download Model">
              <Download size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const FineTuningManager: React.FC<FineTuningManagerProps> = ({
  jobs,
  datasets,
  onCreateJob,
  onViewJob,
  onCancelJob,
  onDeleteJob,
  onDownloadModel,
  onUploadDataset,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs.filter(j =>
    j.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runningJobs = jobs.filter(j => j.status === 'running').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const totalCost = jobs.reduce((sum, j) => sum + j.cost, 0);
  const readyDatasets = datasets.filter(d => d.status === 'ready').length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Sparkles size={22} />
          Fine-Tuning Manager
        </h2>
        <div style={styles.headerActions}>
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
          {onRefresh && (
            <button style={styles.actionButton} onClick={onRefresh}>
              <RefreshCw size={14} />
            </button>
          )}
          {onCreateJob && (
            <button style={styles.createButton} onClick={onCreateJob}>
              <Plus size={14} />
              New Job
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Play size={20} />
          </div>
          <div style={styles.statValue}>{runningJobs}</div>
          <div style={styles.statLabel}>Running Jobs</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{completedJobs}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Database size={20} />
          </div>
          <div style={styles.statValue}>{readyDatasets}</div>
          <div style={styles.statLabel}>Datasets</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Zap size={20} />
          </div>
          <div style={styles.statValue}>${totalCost.toFixed(2)}</div>
          <div style={styles.statLabel}>Total Cost</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Jobs List */}
        <div style={styles.jobsSection}>
          {filteredJobs.length === 0 ? (
            <div style={styles.empty}>
              <Sparkles size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <span>No fine-tuning jobs found</span>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onView={onViewJob ? () => onViewJob(job.id) : undefined}
                onCancel={onCancelJob ? () => onCancelJob(job.id) : undefined}
                onDelete={onDeleteJob ? () => onDeleteJob(job.id) : undefined}
                onDownload={onDownloadModel ? () => onDownloadModel(job.id) : undefined}
              />
            ))
          )}
        </div>

        {/* Sidebar - Datasets */}
        <div style={styles.sidebar}>
          <div style={styles.datasetsCard}>
            <div style={styles.datasetsHeader}>
              <span style={styles.datasetsTitle}>Datasets</span>
              {onUploadDataset && (
                <button style={styles.uploadButton} onClick={onUploadDataset}>
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div style={styles.datasetsList}>
              {datasets.map((dataset) => {
                const statusConfig = DATASET_STATUS_CONFIG[dataset.status];
                return (
                  <div key={dataset.id} style={styles.datasetItem}>
                    <div style={styles.datasetIcon}>
                      <Database size={16} />
                    </div>
                    <div style={styles.datasetInfo}>
                      <div style={styles.datasetName}>{dataset.name}</div>
                      <div style={styles.datasetMeta}>
                        {dataset.samples.toLocaleString()} samples • {formatSize(dataset.size)}
                      </div>
                    </div>
                    <span
                      style={{
                        ...styles.datasetStatus,
                        background: `${statusConfig.color}20`,
                        color: statusConfig.color,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FineTuningManager;
