import React, { useState } from 'react';
import { FileText, Plus, Download, Trash2, MoreVertical, Search, Clock, CheckCircle, XCircle, RefreshCw, Calendar, Filter, BarChart3, Users, Bot, CreditCard, Play, Pause } from 'lucide-react';

type ReportType = 'users' | 'agents' | 'billing' | 'analytics' | 'security' | 'custom';
type ReportStatus = 'completed' | 'generating' | 'failed' | 'scheduled';
type ReportFormat = 'pdf' | 'csv' | 'xlsx' | 'json';

interface ReportData {
  id: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  format: ReportFormat;
  dateRange: {
    start: Date;
    end: Date;
  };
  createdAt: Date;
  completedAt?: Date;
  fileSize?: number;
  downloadUrl?: string;
  scheduledFrequency?: 'daily' | 'weekly' | 'monthly';
  error?: string;
}

interface ReportGeneratorProps {
  reports: ReportData[];
  onGenerateReport?: () => void;
  onDownloadReport?: (reportId: string) => void;
  onDeleteReport?: (reportId: string) => void;
  onScheduleReport?: (reportId: string) => void;
  onRetryReport?: (reportId: string) => void;
  className?: string;
}

interface ReportRowProps {
  report: ReportData;
  onDownload?: () => void;
  onDelete?: () => void;
  onSchedule?: () => void;
  onRetry?: () => void;
}

const TYPE_CONFIG: Record<ReportType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  users: { label: 'Users', icon: <Users size={14} />, color: '#3b82f6' },
  agents: { label: 'Agents', icon: <Bot size={14} />, color: '#8b5cf6' },
  billing: { label: 'Billing', icon: <CreditCard size={14} />, color: '#10b981' },
  analytics: { label: 'Analytics', icon: <BarChart3 size={14} />, color: '#f59e0b' },
  security: { label: 'Security', icon: <FileText size={14} />, color: '#ef4444' },
  custom: { label: 'Custom', icon: <Filter size={14} />, color: '#ec4899' },
};

const STATUS_CONFIG: Record<ReportStatus, {
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
  generating: {
    label: 'Generating',
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
  scheduled: {
    label: 'Scheduled',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
};

const FORMAT_CONFIG: Record<ReportFormat, { label: string; color: string }> = {
  pdf: { label: 'PDF', color: '#ef4444' },
  csv: { label: 'CSV', color: '#10b981' },
  xlsx: { label: 'XLSX', color: '#3b82f6' },
  json: { label: 'JSON', color: '#f59e0b' },
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
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
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
  generateButton: {
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
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '0.875rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statValue: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
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
  reportCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  reportIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  reportName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  reportType: {
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
  dateRange: {
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
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '0.25rem',
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.375rem',
    minWidth: '140px',
    zIndex: 100,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#e4e4e7',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'background 0.15s',
    textAlign: 'left',
  },
  dropdownItemDanger: {
    color: '#ef4444',
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

const formatDateRange = (start: Date, end: Date) => {
  const format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${format(start)} - ${format(end)}`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const ReportRow: React.FC<ReportRowProps> = ({
  report,
  onDownload,
  onDelete,
  onSchedule,
  onRetry,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const typeConfig = TYPE_CONFIG[report.type];
  const statusConfig = STATUS_CONFIG[report.status];
  const formatConfig = FORMAT_CONFIG[report.format];

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <td style={styles.td}>
        <div style={styles.reportCell}>
          <div
            style={{
              ...styles.reportIcon,
              background: `${typeConfig.color}20`,
              color: typeConfig.color,
            }}
          >
            {typeConfig.icon}
          </div>
          <div>
            <div style={styles.reportName}>{report.name}</div>
            <div style={styles.reportType}>{typeConfig.label} Report</div>
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
        <span style={styles.dateRange}>
          {formatDateRange(report.dateRange.start, report.dateRange.end)}
        </span>
      </td>
      <td style={styles.td}>
        {report.fileSize ? formatSize(report.fileSize) : '-'}
      </td>
      <td style={styles.td}>{formatDate(report.createdAt)}</td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <div style={styles.actionButtons}>
          {report.status === 'completed' && onDownload && (
            <button style={styles.downloadButton} onClick={onDownload}>
              <Download size={12} />
              Download
            </button>
          )}
          {report.status === 'failed' && onRetry && (
            <button style={styles.retryButton} onClick={onRetry}>
              <RefreshCw size={12} />
              Retry
            </button>
          )}
          <button
            style={styles.actionButton}
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>
        </div>
        {showMenu && (
          <div style={styles.dropdown}>
            {onSchedule && report.status === 'completed' && (
              <button style={styles.dropdownItem} onClick={onSchedule}>
                <Calendar size={14} />
                Schedule
              </button>
            )}
            {onDelete && (
              <button
                style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                onClick={onDelete}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  reports,
  onGenerateReport,
  onDownloadReport,
  onDeleteReport,
  onScheduleReport,
  onRetryReport,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = reports.filter(r => r.status === 'completed').length;
  const generatingCount = reports.filter(r => r.status === 'generating').length;
  const scheduledCount = reports.filter(r => r.status === 'scheduled').length;

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.title}>
          <FileText size={18} />
          Report Generator
        </div>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search reports..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onGenerateReport && (
            <button style={styles.generateButton} onClick={onGenerateReport}>
              <Plus size={14} />
              Generate Report
            </button>
          )}
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{reports.length}</span>
          <span style={styles.statLabel}>Total Reports</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#10b981' }}>{completedCount}</span>
          <span style={styles.statLabel}>Completed</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#3b82f6' }}>{generatingCount}</span>
          <span style={styles.statLabel}>Generating</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#f59e0b' }}>{scheduledCount}</span>
          <span style={styles.statLabel}>Scheduled</span>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <div style={styles.empty}>
          <FileText size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No reports found</span>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Report</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Format</th>
              <th style={styles.th}>Date Range</th>
              <th style={styles.th}>Size</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onDownload={onDownloadReport ? () => onDownloadReport(report.id) : undefined}
                onDelete={onDeleteReport ? () => onDeleteReport(report.id) : undefined}
                onSchedule={onScheduleReport ? () => onScheduleReport(report.id) : undefined}
                onRetry={onRetryReport ? () => onRetryReport(report.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReportGenerator;
