import React, { useState } from 'react';
import { MessageSquare, Clock, User, Bot, Play, Pause, Square, MoreVertical, ExternalLink } from 'lucide-react';

type SessionStatus = 'active' | 'paused' | 'completed' | 'error' | 'pending';

interface SessionCardProps {
  id: string;
  title?: string;
  agentName?: string;
  agentAvatar?: React.ReactNode;
  status?: SessionStatus;
  messageCount?: number;
  duration?: number;
  startedAt?: Date;
  lastActivity?: Date;
  preview?: string;
  onClick?: () => void;
  onResume?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onMore?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<SessionStatus, {
  color: string;
  bgColor: string;
  label: string;
  icon?: React.ReactNode;
}> = {
  active: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    label: 'Active',
  },
  paused: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Paused',
  },
  completed: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    label: 'Completed',
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    label: 'Error',
  },
  pending: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    label: 'Pending',
  },
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardActive: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    flexShrink: 0,
  },
  titleArea: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  agentName: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.125rem',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  preview: {
    fontSize: '0.8125rem',
    color: '#888',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#666',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginLeft: 'auto',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
};

export const SessionCard: React.FC<SessionCardProps> = ({
  id,
  title,
  agentName,
  agentAvatar,
  status = 'active',
  messageCount,
  duration,
  startedAt,
  lastActivity,
  preview,
  onClick,
  onResume,
  onPause,
  onStop,
  onMore,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const statusConfig = STATUS_CONFIG[status];

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const displayTitle = title || `Session ${id.slice(0, 8)}`;

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
        ...(status === 'active' ? styles.cardActive : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>
            {agentAvatar || <Bot size={20} />}
          </div>
          <div style={styles.titleArea}>
            <h3 style={styles.title}>{displayTitle}</h3>
            {agentName && <div style={styles.agentName}>{agentName}</div>}
          </div>
        </div>
        <span
          style={{
            ...styles.statusBadge,
            background: statusConfig.bgColor,
            color: statusConfig.color,
          }}
        >
          {status === 'active' && (
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: statusConfig.color,
                animation: 'pulse 2s infinite',
              }}
            />
          )}
          {statusConfig.label}
        </span>
      </div>

      {preview && <p style={styles.preview}>{preview}</p>}

      <div style={styles.meta}>
        {messageCount !== undefined && (
          <span style={styles.metaItem}>
            <MessageSquare size={12} />
            {messageCount} messages
          </span>
        )}
        {duration !== undefined && (
          <span style={styles.metaItem}>
            <Clock size={12} />
            {formatDuration(duration)}
          </span>
        )}
        {startedAt && (
          <span style={styles.metaItem}>
            Started {formatTime(startedAt)}
          </span>
        )}

        {(onResume || onPause || onStop || onMore) && (
          <div style={styles.actions}>
            {status === 'paused' && onResume && (
              <button
                style={{
                  ...styles.actionButton,
                  ...(hoveredAction === 'resume' ? styles.actionButtonHover : {}),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onResume();
                }}
                onMouseEnter={() => setHoveredAction('resume')}
                onMouseLeave={() => setHoveredAction(null)}
                title="Resume"
              >
                <Play size={14} />
              </button>
            )}
            {status === 'active' && onPause && (
              <button
                style={{
                  ...styles.actionButton,
                  ...(hoveredAction === 'pause' ? styles.actionButtonHover : {}),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPause();
                }}
                onMouseEnter={() => setHoveredAction('pause')}
                onMouseLeave={() => setHoveredAction(null)}
                title="Pause"
              >
                <Pause size={14} />
              </button>
            )}
            {(status === 'active' || status === 'paused') && onStop && (
              <button
                style={{
                  ...styles.actionButton,
                  ...(hoveredAction === 'stop' ? styles.actionButtonHover : {}),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStop();
                }}
                onMouseEnter={() => setHoveredAction('stop')}
                onMouseLeave={() => setHoveredAction(null)}
                title="Stop"
              >
                <Square size={14} />
              </button>
            )}
            {onMore && (
              <button
                style={{
                  ...styles.actionButton,
                  ...(hoveredAction === 'more' ? styles.actionButtonHover : {}),
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onMore();
                }}
                onMouseEnter={() => setHoveredAction('more')}
                onMouseLeave={() => setHoveredAction(null)}
                title="More options"
              >
                <MoreVertical size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Session list for sidebar
interface SessionListProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const SessionList: React.FC<SessionListProps> = ({
  children,
  title,
  className,
}) => (
  <div className={className}>
    {title && (
      <h3
        style={{
          fontSize: '0.6875rem',
          fontWeight: '600',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem',
          padding: '0 0.5rem',
        }}
      >
        {title}
      </h3>
    )}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {children}
    </div>
  </div>
);

// Compact session item for lists
interface SessionListItemProps {
  title: string;
  agentName?: string;
  status?: SessionStatus;
  lastActivity?: Date;
  onClick?: () => void;
  className?: string;
}

export const SessionListItem: React.FC<SessionListItemProps> = ({
  title,
  agentName,
  status = 'completed',
  lastActivity,
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const statusConfig = STATUS_CONFIG[status];

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 0.75rem',
        borderRadius: '8px',
        cursor: 'pointer',
        background: isHovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
        transition: 'background 0.15s',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: statusConfig.color,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '0.8125rem',
            fontWeight: '500',
            color: '#e4e4e7',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
        {agentName && (
          <div style={{ fontSize: '0.6875rem', color: '#666' }}>{agentName}</div>
        )}
      </div>
      {lastActivity && (
        <span style={{ fontSize: '0.6875rem', color: '#666', flexShrink: 0 }}>
          {formatRelativeTime(lastActivity)}
        </span>
      )}
    </div>
  );
};

export default SessionCard;
