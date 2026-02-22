import React, { useState } from 'react';
import { Download, Upload, FileText, Database, Users, Bot, CreditCard, Settings, Search, CheckCircle, Clock, XCircle, RefreshCw, Trash2, MoreVertical, Calendar, Filter, Archive } from 'lucide-react';

type ExportType = 'users' | 'agents' | 'sessions' | 'billing' | 'settings' | 'all';
type ExportStatus = 'completed' | 'processing' | 'failed' | 'pending';
type ExportFormat = 'json' | 'csv' | 'xlsx';

interface ExportJobData {
  id: string;
  name: string;
  type: ExportType;
  status: ExportStatus;
  format: ExportFormat;
  recordCount?: number;
  fileSize?: number;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  expiresAt?: Date;
  error?: string;
}

interface DataExportProps {
  exports: ExportJobData[];
  onCreateExport?: (type: ExportType, format: ExportFormat) => void;
  onDownloadExport?: (exportId: string) => void;
  onDeleteExport?: (exportId: string) => void;
  onRetryExport?: (exportId: string) => void;
  onImportData?: () => void;
  className?: string;
}

interface ExportRowProps {
  exportJob: ExportJobData;
  onDownload?: () => void;
  onDelete?: () => void;
  onRetry?: () => void;
}

const TYPE_CONFIG: Record<ExportType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  users: { label: 'Users', icon: <Users size={14} />, color: '#3b82f6' },
  agents: { label: 'Agents', icon: <Bot size={14} />, color: '#8b5cf6' },
  sessions: { label: 'Sessions', icon: <Database size={14} />, color: '#10b981' },
  billing: { label: 'Billing', icon: <CreditCard size={14} />, color: '#f59e0b' },
  settings: { label: 'Settings', icon: <Settings size={14} />, color: '#ec4899' },
  all: { label: 'Full Export', icon: <Archive size={14} />, color: '#ef4444' },
};

const STATUS_CONFIG: Record<ExportStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  completed: {
    label: 'Completed',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  processing: {
    label: 'Processing',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <RefreshCw size={12} />,
  },
  failed: {
    label: 'Failed',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
};

const FORMAT_CONFIG: Record<ExportFormat, { label: string; color: string }> = {
  json: { label: 'JSON', color: '#f59e0b' },
  csv: { label: 'CSV', color: '#10b981' },
  xlsx: { label: 'XLSX', color: '#3b82f6' },
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
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  importButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  exportOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  exportCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  exportCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  exportCardIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  exportCardTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  exportCardDescription: {
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '0.75rem',
  },
  formatButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  formatButton: {
    padding: '0.375rem 0.625rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.6875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s',
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
  exportCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  exportIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  exportName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  exportType: {
    fontSize: '0.75rem',
    color: '#888',
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
  formatBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '6px',
    color: '#10b981',
    fontSize: '0.75rem',
    fontWeight: '500',
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
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatSize = (bytes: number): string => {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const ExportRow: React.FC<ExportRowProps> = ({
  exportJob,
  onDownload,
  onDelete,
  onRetry,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = TYPE_CONFIG[exportJob.type];
  const statusConfig = STATUS_CONFIG[exportJob.status];
  const formatConfig = FORMAT_CONFIG[exportJob.format];

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
        <div style={styles.exportCell}>
          <div
            style={{
              ...styles.exportIcon,
              background: `${typeConfig.color}20`,
              color: typeConfig.color,
            }}
          >
            {typeConfig.icon}
          </div>
          <div>
            <div style={styles.exportName}>{exportJob.name}</div>
            <div style={styles.exportType}>{typeConfig.label}</div>
          </div>
        </div>
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
        <span style={{ ...styles.formatBadge, color: formatConfig.color }}>
          {formatConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        {exportJob.recordCount?.toLocaleString() || '-'}
      </td>
      <td style={styles.td}>
        {exportJob.fileSize ? formatSize(exportJob.fileSize) : '-'}
      </td>
      <td style={styles.td}>{formatDate(exportJob.createdAt)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {exportJob.status === 'completed' && onDownload && (
            <button style={styles.downloadButton} onClick={onDownload}>
              <Download size={12} />
              Download
            </button>
          )}
          {exportJob.status === 'failed' && onRetry && (
            <button style={styles.retryButton} onClick={onRetry}>
              <RefreshCw size={12} />
              Retry
            </button>
          )}
          {onDelete && (
            <button
              style={styles.actionButton}
              onClick={onDelete}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const DataExport: React.FC<DataExportProps> = ({
  exports,
  onCreateExport,
  onDownloadExport,
  onDeleteExport,
  onRetryExport,
  onImportData,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<ExportType | null>(null);

  const filteredExports = exports.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportTypes: { type: ExportType; description: string }[] = [
    { type: 'users', description: 'Export all user data and profiles' },
    { type: 'agents', description: 'Export agent configurations and data' },
    { type: 'sessions', description: 'Export session history and logs' },
    { type: 'billing', description: 'Export billing and transaction data' },
    { type: 'settings', description: 'Export system settings and config' },
    { type: 'all', description: 'Complete system data export' },
  ];

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Database size={22} />
          Data Export & Import
        </h2>
        <div style={styles.headerActions}>
          {onImportData && (
            <button style={styles.importButton} onClick={onImportData}>
              <Upload size={14} />
              Import Data
            </button>
          )}
        </div>
      </div>

      {/* Export Options */}
      {onCreateExport && (
        <div style={styles.exportOptions}>
          {exportTypes.map(({ type, description }) => {
            const config = TYPE_CONFIG[type];
            return (
              <div
                key={type}
                style={{
                  ...styles.exportCard,
                  ...(hoveredCard === type ? styles.exportCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(type)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div
                  style={{
                    ...styles.exportCardIcon,
                    background: `${config.color}20`,
                    color: config.color,
                  }}
                >
                  {config.icon}
                </div>
                <div style={styles.exportCardTitle}>{config.label}</div>
                <div style={styles.exportCardDescription}>{description}</div>
                <div style={styles.formatButtons}>
                  {(['json', 'csv', 'xlsx'] as ExportFormat[]).map((format) => (
                    <button
                      key={format}
                      style={{
                        ...styles.formatButton,
                        color: FORMAT_CONFIG[format].color,
                      }}
                      onClick={() => onCreateExport(type, format)}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Export History */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Export History</span>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search exports..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredExports.length === 0 ? (
          <div style={styles.empty}>
            <FileText size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No exports found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Export</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Format</th>
                <th style={styles.th}>Records</th>
                <th style={styles.th}>Size</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredExports.map((exportJob) => (
                <ExportRow
                  key={exportJob.id}
                  exportJob={exportJob}
                  onDownload={onDownloadExport ? () => onDownloadExport(exportJob.id) : undefined}
                  onDelete={onDeleteExport ? () => onDeleteExport(exportJob.id) : undefined}
                  onRetry={onRetryExport ? () => onRetryExport(exportJob.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DataExport;
