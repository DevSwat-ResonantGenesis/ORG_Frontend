import React, { useState } from 'react';
import { Bot, Star, Users, Clock, Play, MoreVertical, Shield, Zap, Globe } from 'lucide-react';

type AgentStatus = 'active' | 'inactive' | 'pending' | 'error';
type TrustTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4';

interface AgentCardProps {
  id: string;
  name: string;
  description?: string;
  avatar?: React.ReactNode;
  status?: AgentStatus;
  trustTier?: TrustTier;
  rating?: number;
  usageCount?: number;
  lastActive?: Date;
  tags?: string[];
  isPublic?: boolean;
  onClick?: () => void;
  onRun?: () => void;
  onMore?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<AgentStatus, {
  color: string;
  bgColor: string;
  label: string;
}> = {
  active: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    label: 'Active',
  },
  inactive: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    label: 'Inactive',
  },
  pending: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Pending',
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    label: 'Error',
  },
};

const TIER_CONFIG: Record<TrustTier, {
  color: string;
  label: string;
}> = {
  T0: { color: '#888', label: 'Tier 0' },
  T1: { color: '#3b82f6', label: 'Tier 1' },
  T2: { color: '#8b5cf6', label: 'Tier 2' },
  T3: { color: '#f59e0b', label: 'Tier 3' },
  T4: { color: '#10b981', label: 'Tier 4' },
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.875rem',
    marginBottom: '0.875rem',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    flexShrink: 0,
  },
  headerContent: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  name: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: '600',
  },
  tierBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '0.875rem',
    paddingTop: '0.875rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#666',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    marginTop: '0.75rem',
  },
  tag: {
    padding: '0.125rem 0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    color: '#888',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  runButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    background: '#6366f1',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  moreButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '8px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};

export const AgentCard: React.FC<AgentCardProps> = ({
  id,
  name,
  description,
  avatar,
  status = 'active',
  trustTier,
  rating,
  usageCount,
  lastActive,
  tags,
  isPublic,
  onClick,
  onRun,
  onMore,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const statusConfig = STATUS_CONFIG[status];
  const tierConfig = trustTier ? TIER_CONFIG[trustTier] : null;

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div style={styles.header}>
        <div style={styles.avatar}>
          {avatar || <Bot size={24} />}
        </div>
        <div style={styles.headerContent}>
          <div style={styles.titleRow}>
            <h3 style={styles.name}>{name}</h3>
            {isPublic && <Globe size={14} color="#888" />}
          </div>
          <div style={styles.badges}>
            <span
              style={{
                ...styles.statusBadge,
                background: statusConfig.bgColor,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </span>
            {tierConfig && (
              <span style={{ ...styles.tierBadge, color: tierConfig.color }}>
                <Shield size={10} />
                {tierConfig.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {description && <p style={styles.description}>{description}</p>}

      {tags && tags.length > 0 && (
        <div style={styles.tags}>
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} style={styles.tag}>{tag}</span>
          ))}
          {tags.length > 3 && (
            <span style={styles.tag}>+{tags.length - 3}</span>
          )}
        </div>
      )}

      <div style={styles.meta}>
        {rating !== undefined && (
          <span style={styles.metaItem}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            {rating.toFixed(1)}
          </span>
        )}
        {usageCount !== undefined && (
          <span style={styles.metaItem}>
            <Users size={12} />
            {usageCount.toLocaleString()}
          </span>
        )}
        {lastActive && (
          <span style={styles.metaItem}>
            <Clock size={12} />
            {formatLastActive(lastActive)}
          </span>
        )}
      </div>

      {(onRun || onMore) && (
        <div style={styles.actions}>
          {onRun && (
            <button
              style={styles.runButton}
              onClick={(e) => {
                e.stopPropagation();
                onRun();
              }}
            >
              <Play size={14} />
              Run
            </button>
          )}
          {onMore && (
            <button
              style={styles.moreButton}
              onClick={(e) => {
                e.stopPropagation();
                onMore();
              }}
            >
              <MoreVertical size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Agent grid layout
interface AgentGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  gap?: string;
  className?: string;
}

export const AgentGrid: React.FC<AgentGridProps> = ({
  children,
  columns = 3,
  gap = '1rem',
  className,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
    }}
    className={className}
  >
    {children}
  </div>
);

// Compact agent list item
interface AgentListItemProps {
  name: string;
  description?: string;
  status?: AgentStatus;
  onClick?: () => void;
  className?: string;
}

export const AgentListItem: React.FC<AgentListItemProps> = ({
  name,
  description,
  status = 'active',
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const statusConfig = STATUS_CONFIG[status];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        background: isHovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
        transition: 'background 0.15s',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(99, 102, 241, 0.15)',
          color: '#818cf8',
        }}
      >
        <Bot size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#fff' }}>
          {name}
        </div>
        {description && (
          <div
            style={{
              fontSize: '0.75rem',
              color: '#666',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {description}
          </div>
        )}
      </div>
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: statusConfig.color,
        }}
      />
    </div>
  );
};

export default AgentCard;
