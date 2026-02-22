import React, { useState } from 'react';
import { FileText, Plus, Search, Eye, Edit2, Trash2, CheckCircle, Clock, AlertTriangle, Calendar, Tag, GitBranch, ExternalLink, Send, Archive, Star } from 'lucide-react';

type ReleaseStatus = 'draft' | 'scheduled' | 'published' | 'archived';
type ChangeType = 'feature' | 'improvement' | 'bugfix' | 'security' | 'breaking' | 'deprecated';

interface ChangeItem {
  id: string;
  type: ChangeType;
  title: string;
  description?: string;
  issueId?: string;
  prId?: string;
}

interface Release {
  id: string;
  version: string;
  title: string;
  description?: string;
  status: ReleaseStatus;
  changes: ChangeItem[];
  publishedAt?: Date;
  scheduledAt?: Date;
  author: string;
  isHighlighted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ChangelogManagerProps {
  releases: Release[];
  onCreateRelease?: () => void;
  onViewRelease?: (releaseId: string) => void;
  onEditRelease?: (releaseId: string) => void;
  onPublishRelease?: (releaseId: string) => void;
  onArchiveRelease?: (releaseId: string) => void;
  onDeleteRelease?: (releaseId: string) => void;
  className?: string;
}

interface ReleaseCardProps {
  release: Release;
  onView?: () => void;
  onEdit?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<ReleaseStatus, {
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
  published: {
    label: 'Published',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  archived: {
    label: 'Archived',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Archive size={12} />,
  },
};

const CHANGE_TYPE_CONFIG: Record<ChangeType, {
  label: string;
  color: string;
  emoji: string;
}> = {
  feature: { label: 'Feature', color: '#10b981', emoji: '✨' },
  improvement: { label: 'Improvement', color: '#3b82f6', emoji: '🚀' },
  bugfix: { label: 'Bug Fix', color: '#f59e0b', emoji: '🐛' },
  security: { label: 'Security', color: '#ef4444', emoji: '🔒' },
  breaking: { label: 'Breaking', color: '#dc2626', emoji: '💥' },
  deprecated: { label: 'Deprecated', color: '#888', emoji: '⚠️' },
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
  releasesTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  releaseCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  releaseCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  releaseCardHighlighted: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  releaseHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  releaseTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  versionBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    fontSize: '0.875rem',
    fontWeight: '700',
    fontFamily: "'JetBrains Mono', monospace",
  },
  releaseInfo: {
    flex: 1,
  },
  releaseName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  highlightBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#f59e0b',
  },
  releaseMeta: {
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
  dateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  releaseBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  changesSection: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  changesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  changeItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '6px',
  },
  changeEmoji: {
    fontSize: '0.875rem',
    flexShrink: 0,
  },
  changeContent: {
    flex: 1,
  },
  changeTitle: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
    marginBottom: '0.125rem',
  },
  changeDescription: {
    fontSize: '0.6875rem',
    color: '#888',
    lineHeight: 1.4,
  },
  changeTypeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  changeSummary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  summaryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  releaseFooter: {
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

const getChangeTypeCounts = (changes: ChangeItem[]) => {
  const counts: Record<string, number> = {};
  changes.forEach(c => {
    counts[c.type] = (counts[c.type] || 0) + 1;
  });
  return counts;
};

const ReleaseCard: React.FC<ReleaseCardProps> = ({
  release,
  onView,
  onEdit,
  onPublish,
  onArchive,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = STATUS_CONFIG[release.status];
  const changeTypeCounts = getChangeTypeCounts(release.changes);

  return (
    <div
      style={{
        ...styles.releaseCard,
        ...(isHovered ? styles.releaseCardHover : {}),
        ...(release.isHighlighted ? styles.releaseCardHighlighted : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.releaseHeader}>
        <div style={styles.releaseTitle}>
          <div style={styles.versionBadge}>v{release.version}</div>
          <div style={styles.releaseInfo}>
            <div style={styles.releaseName}>
              {release.title}
              {release.isHighlighted && (
                <span style={styles.highlightBadge}>
                  <Star size={10} />
                  Featured
                </span>
              )}
            </div>
            <div style={styles.releaseMeta}>
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
              {release.publishedAt && (
                <span style={styles.dateBadge}>
                  <Calendar size={10} />
                  {formatDate(release.publishedAt)}
                </span>
              )}
              {release.scheduledAt && release.status === 'scheduled' && (
                <span style={styles.dateBadge}>
                  <Clock size={10} />
                  Scheduled: {formatDate(release.scheduledAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={styles.releaseBody}>
        {release.description && (
          <p style={styles.description}>{release.description}</p>
        )}

        {/* Change Summary */}
        <div style={styles.changeSummary}>
          {Object.entries(changeTypeCounts).map(([type, count]) => {
            const config = CHANGE_TYPE_CONFIG[type as ChangeType];
            return (
              <span
                key={type}
                style={{
                  ...styles.summaryBadge,
                  color: config.color,
                }}
              >
                {config.emoji} {count} {config.label}{count > 1 ? 's' : ''}
              </span>
            );
          })}
        </div>

        {/* Expanded Changes */}
        {isExpanded && release.changes.length > 0 && (
          <div style={{ ...styles.changesSection, marginTop: '1rem' }}>
            <div style={styles.sectionTitle}>Changes ({release.changes.length})</div>
            <div style={styles.changesList}>
              {release.changes.map((change) => {
                const config = CHANGE_TYPE_CONFIG[change.type];
                return (
                  <div key={change.id} style={styles.changeItem}>
                    <span style={styles.changeEmoji}>{config.emoji}</span>
                    <div style={styles.changeContent}>
                      <div style={styles.changeTitle}>{change.title}</div>
                      {change.description && (
                        <div style={styles.changeDescription}>{change.description}</div>
                      )}
                    </div>
                    <span
                      style={{
                        ...styles.changeTypeBadge,
                        background: `${config.color}20`,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {release.changes.length > 0 && (
          <button
            style={{
              ...styles.iconButton,
              marginTop: '0.75rem',
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
            }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide Changes' : `Show ${release.changes.length} Changes`}
          </button>
        )}
      </div>

      <div style={styles.releaseFooter}>
        <span style={styles.footerMeta}>By {release.author}</span>
        <div style={styles.actionButtons}>
          {release.status === 'draft' && onPublish && (
            <button style={{ ...styles.iconButton, ...styles.publishButton }} onClick={onPublish} title="Publish">
              <Send size={14} />
            </button>
          )}
          {release.status === 'published' && onArchive && (
            <button style={{ ...styles.iconButton, ...styles.archiveButton }} onClick={onArchive} title="Archive">
              <Archive size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && release.status === 'draft' && (
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

export const ChangelogManager: React.FC<ChangelogManagerProps> = ({
  releases,
  onCreateRelease,
  onViewRelease,
  onEditRelease,
  onPublishRelease,
  onArchiveRelease,
  onDeleteRelease,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReleases = releases.filter(r =>
    r.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedReleases = releases.filter(r => r.status === 'published').length;
  const draftReleases = releases.filter(r => r.status === 'draft').length;
  const totalChanges = releases.reduce((sum, r) => sum + r.changes.length, 0);
  const featuredReleases = releases.filter(r => r.isHighlighted).length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <FileText size={22} />
          Changelog Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search releases..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateRelease && (
            <button style={styles.createButton} onClick={onCreateRelease}>
              <Plus size={14} />
              New Release
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
          <div style={styles.statValue}>{publishedReleases}</div>
          <div style={styles.statLabel}>Published</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Edit2 size={20} />
          </div>
          <div style={styles.statValue}>{draftReleases}</div>
          <div style={styles.statLabel}>Drafts</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Tag size={20} />
          </div>
          <div style={styles.statValue}>{totalChanges}</div>
          <div style={styles.statLabel}>Total Changes</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Star size={20} />
          </div>
          <div style={styles.statValue}>{featuredReleases}</div>
          <div style={styles.statLabel}>Featured</div>
        </div>
      </div>

      {/* Releases Timeline */}
      {filteredReleases.length === 0 ? (
        <div style={styles.empty}>
          <FileText size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No releases found</span>
        </div>
      ) : (
        <div style={styles.releasesTimeline}>
          {filteredReleases.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              onView={onViewRelease ? () => onViewRelease(release.id) : undefined}
              onEdit={onEditRelease ? () => onEditRelease(release.id) : undefined}
              onPublish={onPublishRelease ? () => onPublishRelease(release.id) : undefined}
              onArchive={onArchiveRelease ? () => onArchiveRelease(release.id) : undefined}
              onDelete={onDeleteRelease ? () => onDeleteRelease(release.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChangelogManager;
