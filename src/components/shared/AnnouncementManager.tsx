import React, { useState } from 'react';
import { Megaphone, Plus, Search, Eye, Edit2, Trash2, CheckCircle, Clock, AlertTriangle, Send, Calendar, Users, Target, Bell, X } from 'lucide-react';

type AnnouncementStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'archived';
type AnnouncementType = 'info' | 'warning' | 'success' | 'error' | 'maintenance';
type TargetAudience = 'all' | 'admins' | 'users' | 'premium' | 'custom';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  targetAudience: TargetAudience;
  dismissible: boolean;
  sticky: boolean;
  viewCount: number;
  dismissCount: number;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AnnouncementManagerProps {
  announcements: Announcement[];
  onCreateAnnouncement?: () => void;
  onViewAnnouncement?: (announcementId: string) => void;
  onEditAnnouncement?: (announcementId: string) => void;
  onPublishAnnouncement?: (announcementId: string) => void;
  onArchiveAnnouncement?: (announcementId: string) => void;
  onDeleteAnnouncement?: (announcementId: string) => void;
  className?: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  onView?: () => void;
  onEdit?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<AnnouncementStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  draft: {
    label: 'Draft',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Edit2 size={12} />,
  },
  scheduled: {
    label: 'Scheduled',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
  active: {
    label: 'Active',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  expired: {
    label: 'Expired',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  archived: {
    label: 'Archived',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
};

const TYPE_CONFIG: Record<AnnouncementType, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  info: { label: 'Info', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  warning: { label: 'Warning', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  success: { label: 'Success', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  error: { label: 'Error', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  maintenance: { label: 'Maintenance', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
};

const AUDIENCE_CONFIG: Record<TargetAudience, {
  label: string;
  color: string;
}> = {
  all: { label: 'All Users', color: '#10b981' },
  admins: { label: 'Admins', color: '#ef4444' },
  users: { label: 'Users', color: '#3b82f6' },
  premium: { label: 'Premium', color: '#f59e0b' },
  custom: { label: 'Custom', color: '#8b5cf6' },
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
  createButton: {
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
  announcementsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  announcementCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  announcementCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  announcementCardActive: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  announcementHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  announcementTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  announcementIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  announcementInfo: {
    flex: 1,
  },
  announcementName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  announcementMeta: {
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
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  audienceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  announcementBody: {
    padding: '1.25rem',
  },
  message: {
    fontSize: '0.875rem',
    color: '#e4e4e7',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  previewBanner: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  previewIcon: {
    flexShrink: 0,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    marginBottom: '0.125rem',
  },
  previewMessage: {
    fontSize: '0.75rem',
    opacity: 0.9,
  },
  previewDismiss: {
    padding: '0.25rem',
    background: 'rgba(0, 0, 0, 0.2)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.7,
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  dateRange: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  announcementFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  footerMeta: {
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
  publishButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  archiveButton: {
    background: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    color: '#f59e0b',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
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

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onView,
  onEdit,
  onPublish,
  onArchive,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[announcement.status];
  const typeConfig = TYPE_CONFIG[announcement.type];
  const audienceConfig = AUDIENCE_CONFIG[announcement.targetAudience];

  return (
    <div
      style={{
        ...styles.announcementCard,
        ...(isHovered ? styles.announcementCardHover : {}),
        ...(announcement.status === 'active' ? styles.announcementCardActive : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.announcementHeader}>
        <div style={styles.announcementTitle}>
          <div
            style={{
              ...styles.announcementIcon,
              background: typeConfig.bgColor,
              color: typeConfig.color,
            }}
          >
            <Megaphone size={22} />
          </div>
          <div style={styles.announcementInfo}>
            <div style={styles.announcementName}>{announcement.title}</div>
            <div style={styles.announcementMeta}>
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
              <span
                style={{
                  ...styles.typeBadge,
                  background: typeConfig.bgColor,
                  color: typeConfig.color,
                }}
              >
                {typeConfig.label}
              </span>
              <span style={{ ...styles.audienceBadge, color: audienceConfig.color }}>
                <Users size={10} />
                {audienceConfig.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.announcementBody}>
        {/* Preview Banner */}
        <div
          style={{
            ...styles.previewBanner,
            background: typeConfig.bgColor,
            color: typeConfig.color,
          }}
        >
          <Bell size={18} style={styles.previewIcon} />
          <div style={styles.previewContent}>
            <div style={styles.previewTitle}>{announcement.title}</div>
            <div style={styles.previewMessage}>{announcement.message}</div>
          </div>
          {announcement.dismissible && (
            <button style={styles.previewDismiss}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={styles.statsRow}>
          <span style={styles.statItem}>
            <Eye size={12} />
            {formatNumber(announcement.viewCount)} views
          </span>
          <span style={styles.statItem}>
            <X size={12} />
            {formatNumber(announcement.dismissCount)} dismissed
          </span>
          {announcement.sticky && (
            <span style={{ ...styles.statItem, color: '#f59e0b' }}>
              📌 Sticky
            </span>
          )}
        </div>

        {(announcement.startDate || announcement.endDate) && (
          <div style={styles.dateRange}>
            <Calendar size={12} />
            {announcement.startDate && formatDate(announcement.startDate)}
            {announcement.startDate && announcement.endDate && ' → '}
            {announcement.endDate && formatDate(announcement.endDate)}
          </div>
        )}
      </div>

      <div style={styles.announcementFooter}>
        <span style={styles.footerMeta}>By {announcement.createdBy}</span>
        <div style={styles.actionButtons}>
          {announcement.status === 'draft' && onPublish && (
            <button style={{ ...styles.iconButton, ...styles.publishButton }} onClick={onPublish} title="Publish">
              <Send size={14} />
            </button>
          )}
          {announcement.status === 'active' && onArchive && (
            <button style={{ ...styles.iconButton, ...styles.archiveButton }} onClick={onArchive} title="Archive">
              <Clock size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && announcement.status === 'draft' && (
            <button style={styles.iconButton} onClick={onEdit} title="Edit">
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button style={{ ...styles.iconButton, ...styles.deleteButton }} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const AnnouncementManager: React.FC<AnnouncementManagerProps> = ({
  announcements,
  onCreateAnnouncement,
  onViewAnnouncement,
  onEditAnnouncement,
  onPublishAnnouncement,
  onArchiveAnnouncement,
  onDeleteAnnouncement,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeAnnouncements = announcements.filter(a => a.status === 'active').length;
  const scheduledAnnouncements = announcements.filter(a => a.status === 'scheduled').length;
  const totalViews = announcements.reduce((sum, a) => sum + a.viewCount, 0);
  const draftAnnouncements = announcements.filter(a => a.status === 'draft').length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Megaphone size={22} />
          Announcement Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search announcements..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateAnnouncement && (
            <button style={styles.createButton} onClick={onCreateAnnouncement}>
              <Plus size={14} />
              New Announcement
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{activeAnnouncements}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{scheduledAnnouncements}</div>
          <div style={styles.statLabel}>Scheduled</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Eye size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalViews)}</div>
          <div style={styles.statLabel}>Total Views</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Edit2 size={20} />
          </div>
          <div style={styles.statValue}>{draftAnnouncements}</div>
          <div style={styles.statLabel}>Drafts</div>
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div style={styles.empty}>
          <Megaphone size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No announcements found</span>
        </div>
      ) : (
        <div style={styles.announcementsList}>
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onView={onViewAnnouncement ? () => onViewAnnouncement(announcement.id) : undefined}
              onEdit={onEditAnnouncement ? () => onEditAnnouncement(announcement.id) : undefined}
              onPublish={onPublishAnnouncement ? () => onPublishAnnouncement(announcement.id) : undefined}
              onArchive={onArchiveAnnouncement ? () => onArchiveAnnouncement(announcement.id) : undefined}
              onDelete={onDeleteAnnouncement ? () => onDeleteAnnouncement(announcement.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementManager;
