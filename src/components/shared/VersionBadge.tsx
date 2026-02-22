import React, { useState } from 'react';
import { Tag, GitBranch, GitCommit, Clock, ExternalLink, Copy, Check } from 'lucide-react';

type VersionType = 'stable' | 'beta' | 'alpha' | 'rc' | 'dev';

interface VersionInfo {
  version: string;
  type?: VersionType;
  buildNumber?: string;
  commitHash?: string;
  branch?: string;
  buildDate?: Date;
  releaseNotes?: string;
}

interface VersionBadgeProps {
  version: string;
  type?: VersionType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

interface VersionInfoCardProps {
  info: VersionInfo;
  onViewReleaseNotes?: () => void;
  className?: string;
}

interface VersionHistoryProps {
  versions: {
    version: string;
    date: Date;
    type?: VersionType;
    current?: boolean;
  }[];
  onSelect?: (version: string) => void;
  className?: string;
}

const TYPE_CONFIG: Record<VersionType, {
  color: string;
  bgColor: string;
  label: string;
}> = {
  stable: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    label: 'Stable',
  },
  beta: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    label: 'Beta',
  },
  alpha: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Alpha',
  },
  rc: {
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    label: 'RC',
  },
  dev: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    label: 'Dev',
  },
};

const SIZE_CONFIG = {
  sm: { padding: '0.125rem 0.375rem', fontSize: '0.625rem', iconSize: 10 },
  md: { padding: '0.25rem 0.5rem', fontSize: '0.6875rem', iconSize: 12 },
  lg: { padding: '0.375rem 0.75rem', fontSize: '0.75rem', iconSize: 14 },
};

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    borderRadius: '4px',
    fontWeight: '600',
    fontFamily: "'JetBrains Mono', monospace",
    transition: 'all 0.15s',
  },
  badgeClickable: {
    cursor: 'pointer',
  },
  typeLabel: {
    marginLeft: '0.25rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  cardVersion: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  versionNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    fontFamily: "'JetBrains Mono', monospace",
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#888',
  },
  detailIcon: {
    color: '#666',
    flexShrink: 0,
  },
  detailValue: {
    color: '#e4e4e7',
    fontFamily: "'JetBrains Mono', monospace",
  },
  copyButton: {
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
    transition: 'all 0.15s',
    marginLeft: 'auto',
  },
  releaseNotesButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginTop: '1rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  history: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  historyItemHover: {
    background: 'rgba(255, 255, 255, 0.03)',
  },
  historyItemCurrent: {
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  historyVersion: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#fff',
    fontFamily: "'JetBrains Mono', monospace",
  },
  historyDate: {
    fontSize: '0.75rem',
    color: '#888',
    marginLeft: 'auto',
  },
  currentBadge: {
    padding: '0.125rem 0.375rem',
    background: 'rgba(99, 102, 241, 0.2)',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: '600',
    color: '#818cf8',
    textTransform: 'uppercase',
  },
};

export const VersionBadge: React.FC<VersionBadgeProps> = ({
  version,
  type,
  showIcon = true,
  size = 'md',
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const typeConfig = type ? TYPE_CONFIG[type] : null;
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <span
      style={{
        ...styles.badge,
        ...(onClick ? styles.badgeClickable : {}),
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        background: typeConfig?.bgColor || 'rgba(255, 255, 255, 0.05)',
        color: typeConfig?.color || '#888',
        border: `1px solid ${typeConfig?.color || 'rgba(255, 255, 255, 0.1)'}33`,
        transform: isHovered && onClick ? 'scale(1.05)' : 'scale(1)',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      {showIcon && <Tag size={sizeConfig.iconSize} />}
      v{version}
      {type && (
        <span style={{ ...styles.typeLabel, fontSize: `calc(${sizeConfig.fontSize} - 0.0625rem)` }}>
          {typeConfig?.label}
        </span>
      )}
    </span>
  );
};

export const VersionInfoCard: React.FC<VersionInfoCardProps> = ({
  info,
  onViewReleaseNotes,
  className,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const typeConfig = info.type ? TYPE_CONFIG[info.type] : null;

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.card} className={className}>
      <div style={styles.cardHeader}>
        <div style={styles.cardVersion}>
          <span style={styles.versionNumber}>v{info.version}</span>
          {info.type && (
            <span
              style={{
                padding: '0.25rem 0.5rem',
                background: typeConfig?.bgColor,
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: typeConfig?.color,
                textTransform: 'uppercase',
              }}
            >
              {typeConfig?.label}
            </span>
          )}
        </div>
      </div>

      <div style={styles.cardDetails}>
        {info.buildNumber && (
          <div style={styles.detailRow}>
            <Tag size={14} style={styles.detailIcon} />
            <span>Build</span>
            <span style={styles.detailValue}>{info.buildNumber}</span>
          </div>
        )}

        {info.commitHash && (
          <div style={styles.detailRow}>
            <GitCommit size={14} style={styles.detailIcon} />
            <span>Commit</span>
            <span style={styles.detailValue}>{info.commitHash.slice(0, 7)}</span>
            <button
              style={styles.copyButton}
              onClick={() => handleCopy(info.commitHash!, 'commit')}
              title="Copy commit hash"
            >
              {copiedField === 'commit' ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        )}

        {info.branch && (
          <div style={styles.detailRow}>
            <GitBranch size={14} style={styles.detailIcon} />
            <span>Branch</span>
            <span style={styles.detailValue}>{info.branch}</span>
          </div>
        )}

        {info.buildDate && (
          <div style={styles.detailRow}>
            <Clock size={14} style={styles.detailIcon} />
            <span>Built</span>
            <span style={styles.detailValue}>{formatDate(info.buildDate)}</span>
          </div>
        )}
      </div>

      {onViewReleaseNotes && (
        <button style={styles.releaseNotesButton} onClick={onViewReleaseNotes}>
          <ExternalLink size={14} />
          View Release Notes
        </button>
      )}
    </div>
  );
};

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  onSelect,
  className,
}) => {
  const [hoveredVersion, setHoveredVersion] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div style={styles.history} className={className}>
      {versions.map((v) => {
        const typeConfig = v.type ? TYPE_CONFIG[v.type] : null;
        const isHovered = hoveredVersion === v.version;

        return (
          <div
            key={v.version}
            style={{
              ...styles.historyItem,
              ...(isHovered ? styles.historyItemHover : {}),
              ...(v.current ? styles.historyItemCurrent : {}),
            }}
            onClick={() => onSelect?.(v.version)}
            onMouseEnter={() => setHoveredVersion(v.version)}
            onMouseLeave={() => setHoveredVersion(null)}
          >
            <span style={styles.historyVersion}>v{v.version}</span>
            {v.type && (
              <span
                style={{
                  padding: '0.125rem 0.375rem',
                  background: typeConfig?.bgColor,
                  borderRadius: '4px',
                  fontSize: '0.625rem',
                  fontWeight: '600',
                  color: typeConfig?.color,
                }}
              >
                {typeConfig?.label}
              </span>
            )}
            {v.current && <span style={styles.currentBadge}>Current</span>}
            <span style={styles.historyDate}>{formatDate(v.date)}</span>
          </div>
        );
      })}
    </div>
  );
};

export default VersionBadge;
