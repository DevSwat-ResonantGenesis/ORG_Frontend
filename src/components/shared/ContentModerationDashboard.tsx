import React, { useState } from 'react';
import { Shield, Search, Filter, Eye, CheckCircle, XCircle, AlertTriangle, Clock, Flag, MessageSquare, Image, FileText, User, ThumbsUp, ThumbsDown, MoreVertical, RefreshCw, BarChart3 } from 'lucide-react';

type ContentType = 'text' | 'image' | 'file' | 'message' | 'profile';
type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'auto_flagged';
type ViolationType = 'spam' | 'harassment' | 'hate_speech' | 'violence' | 'adult' | 'misinformation' | 'other';
type Severity = 'low' | 'medium' | 'high' | 'critical';

interface ContentItem {
  id: string;
  type: ContentType;
  content: string;
  preview?: string;
  status: ModerationStatus;
  violations: ViolationType[];
  severity: Severity;
  confidence: number;
  userId: string;
  userName: string;
  reportCount: number;
  reportedBy?: string[];
  moderatedBy?: string;
  moderatedAt?: Date;
  createdAt: Date;
}

interface ModerationStats {
  pending: number;
  approved: number;
  rejected: number;
  escalated: number;
  autoFlagged: number;
  avgResponseTime: number;
}

interface ContentModerationDashboardProps {
  items: ContentItem[];
  stats: ModerationStats;
  onApprove?: (itemId: string) => void;
  onReject?: (itemId: string) => void;
  onEscalate?: (itemId: string) => void;
  onViewItem?: (itemId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface ContentRowProps {
  item: ContentItem;
  onApprove?: () => void;
  onReject?: () => void;
  onEscalate?: () => void;
  onView?: () => void;
}

const STATUS_CONFIG: Record<ModerationStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
  approved: {
    label: 'Approved',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  escalated: {
    label: 'Escalated',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  auto_flagged: {
    label: 'Auto-Flagged',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Flag size={12} />,
  },
};

const CONTENT_TYPE_CONFIG: Record<ContentType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  text: { label: 'Text', icon: <FileText size={14} />, color: '#3b82f6' },
  image: { label: 'Image', icon: <Image size={14} />, color: '#10b981' },
  file: { label: 'File', icon: <FileText size={14} />, color: '#8b5cf6' },
  message: { label: 'Message', icon: <MessageSquare size={14} />, color: '#f59e0b' },
  profile: { label: 'Profile', icon: <User size={14} />, color: '#ec4899' },
};

const VIOLATION_CONFIG: Record<ViolationType, {
  label: string;
  color: string;
}> = {
  spam: { label: 'Spam', color: '#888' },
  harassment: { label: 'Harassment', color: '#ef4444' },
  hate_speech: { label: 'Hate Speech', color: '#dc2626' },
  violence: { label: 'Violence', color: '#b91c1c' },
  adult: { label: 'Adult', color: '#ec4899' },
  misinformation: { label: 'Misinfo', color: '#f59e0b' },
  other: { label: 'Other', color: '#888' },
};

const SEVERITY_CONFIG: Record<Severity, {
  label: string;
  color: string;
}> = {
  low: { label: 'Low', color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
  critical: { label: 'Critical', color: '#dc2626' },
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
    width: '200px',
  },
  filterButton: {
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
    gridTemplateColumns: 'repeat(5, 1fr)',
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
  contentCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  contentIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  contentInfo: {
    flex: 1,
    minWidth: 0,
  },
  contentPreview: {
    fontSize: '0.8125rem',
    color: '#e4e4e7',
    marginBottom: '0.25rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.4,
  },
  contentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.6875rem',
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
  violationsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  violationBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  severityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  confidenceBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  confidenceTrack: {
    flex: 1,
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: '3px',
  },
  confidenceValue: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#e4e4e7',
    minWidth: '36px',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.625rem',
    fontWeight: '600',
    color: '#3b82f6',
  },
  reportCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#ef4444',
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
  approveButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  rejectButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  escalateButton: {
    background: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    color: '#8b5cf6',
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

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return '#ef4444';
  if (confidence >= 0.7) return '#f59e0b';
  if (confidence >= 0.5) return '#10b981';
  return '#888';
};

const ContentRow: React.FC<ContentRowProps> = ({
  item,
  onApprove,
  onReject,
  onEscalate,
  onView,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[item.status];
  const typeConfig = CONTENT_TYPE_CONFIG[item.type];
  const severityConfig = SEVERITY_CONFIG[item.severity];

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
        <div style={styles.contentCell}>
          <div
            style={{
              ...styles.contentIcon,
              background: `${typeConfig.color}20`,
              color: typeConfig.color,
            }}
          >
            {typeConfig.icon}
          </div>
          <div style={styles.contentInfo}>
            <div style={styles.contentPreview}>
              {item.preview || item.content}
            </div>
            <div style={styles.contentMeta}>
              <span>{typeConfig.label}</span>
              <span>•</span>
              <span>{formatTimeAgo(item.createdAt)}</span>
            </div>
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
        <div style={styles.violationsList}>
          {item.violations.slice(0, 2).map((violation) => {
            const config = VIOLATION_CONFIG[violation];
            return (
              <span
                key={violation}
                style={{
                  ...styles.violationBadge,
                  background: `${config.color}20`,
                  color: config.color,
                }}
              >
                {config.label}
              </span>
            );
          })}
          {item.violations.length > 2 && (
            <span style={{ ...styles.violationBadge, background: 'rgba(255, 255, 255, 0.05)', color: '#888' }}>
              +{item.violations.length - 2}
            </span>
          )}
        </div>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.severityBadge,
            background: `${severityConfig.color}20`,
            color: severityConfig.color,
          }}
        >
          {severityConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.confidenceBar}>
          <div style={styles.confidenceTrack}>
            <div
              style={{
                ...styles.confidenceFill,
                width: `${item.confidence * 100}%`,
                background: getConfidenceColor(item.confidence),
              }}
            />
          </div>
          <span style={styles.confidenceValue}>{(item.confidence * 100).toFixed(0)}%</span>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.userCell}>
          <div style={styles.userAvatar}>
            {item.userName.charAt(0).toUpperCase()}
          </div>
          <span>{item.userName}</span>
        </div>
      </td>
      <td style={styles.td}>
        {item.reportCount > 0 && (
          <span style={styles.reportCount}>
            <Flag size={12} />
            {item.reportCount}
          </span>
        )}
      </td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {item.status === 'pending' || item.status === 'auto_flagged' ? (
            <>
              {onApprove && (
                <button style={{ ...styles.iconButton, ...styles.approveButton }} onClick={onApprove} title="Approve">
                  <ThumbsUp size={14} />
                </button>
              )}
              {onReject && (
                <button style={{ ...styles.iconButton, ...styles.rejectButton }} onClick={onReject} title="Reject">
                  <ThumbsDown size={14} />
                </button>
              )}
              {onEscalate && (
                <button style={{ ...styles.iconButton, ...styles.escalateButton }} onClick={onEscalate} title="Escalate">
                  <AlertTriangle size={14} />
                </button>
              )}
            </>
          ) : null}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const ContentModerationDashboard: React.FC<ContentModerationDashboardProps> = ({
  items,
  stats,
  onApprove,
  onReject,
  onEscalate,
  onViewItem,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | 'all'>('all');

  const filteredItems = items.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.content.toLowerCase().includes(query) ||
        item.userName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Shield size={22} />
          Content Moderation
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search content..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button style={styles.filterButton}>
            <Filter size={14} />
            Filter
          </button>
          {onRefresh && (
            <button style={styles.refreshButton} onClick={onRefresh}>
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{stats.approved}</div>
          <div style={styles.statLabel}>Approved</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <XCircle size={20} />
          </div>
          <div style={styles.statValue}>{stats.rejected}</div>
          <div style={styles.statLabel}>Rejected</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{stats.escalated}</div>
          <div style={styles.statLabel}>Escalated</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{stats.avgResponseTime}m</div>
          <div style={styles.statLabel}>Avg Response</div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Content Queue ({filteredItems.length})</span>
        </div>
        {filteredItems.length === 0 ? (
          <div style={styles.empty}>
            <Shield size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No content to moderate</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Content</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Violations</th>
                <th style={styles.th}>Severity</th>
                <th style={styles.th}>Confidence</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Reports</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <ContentRow
                  key={item.id}
                  item={item}
                  onApprove={onApprove ? () => onApprove(item.id) : undefined}
                  onReject={onReject ? () => onReject(item.id) : undefined}
                  onEscalate={onEscalate ? () => onEscalate(item.id) : undefined}
                  onView={onViewItem ? () => onViewItem(item.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ContentModerationDashboard;
