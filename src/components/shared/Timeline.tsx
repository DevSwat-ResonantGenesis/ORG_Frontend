import React from 'react';
import { Check, X, Clock, AlertCircle, Circle } from 'lucide-react';

type TimelineVariant = 'default' | 'compact' | 'alternate';
type TimelineItemStatus = 'completed' | 'current' | 'pending' | 'error' | 'warning';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: TimelineItemStatus;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  variant?: TimelineVariant;
  showConnector?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<TimelineItemStatus, {
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  completed: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <Check size={14} />,
  },
  current: {
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    icon: <Circle size={14} />,
  },
  pending: {
    color: '#666',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={14} />,
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <X size={14} />,
  },
  warning: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertCircle size={14} />,
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    display: 'flex',
    position: 'relative',
  },
  itemAlternateLeft: {
    flexDirection: 'row-reverse',
    textAlign: 'right',
  },
  connector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: '1rem',
  },
  connectorAlternate: {
    marginRight: 0,
    marginLeft: 0,
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  dot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
  },
  dotCompact: {
    width: '24px',
    height: '24px',
  },
  line: {
    width: '2px',
    flex: 1,
    background: 'rgba(255, 255, 255, 0.1)',
    minHeight: '24px',
  },
  content: {
    flex: 1,
    paddingBottom: '1.5rem',
  },
  contentAlternate: {
    width: 'calc(50% - 24px)',
    paddingBottom: '1.5rem',
  },
  title: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    lineHeight: '1.5',
  },
  timestamp: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.375rem',
  },
  customContent: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
};

const TimelineItemComponent: React.FC<{
  item: TimelineItem;
  isLast: boolean;
  variant: TimelineVariant;
  showConnector: boolean;
  index: number;
}> = ({ item, isLast, variant, showConnector, index }) => {
  const status = item.status || 'pending';
  const config = STATUS_CONFIG[status];
  const isAlternate = variant === 'alternate';
  const isLeft = isAlternate && index % 2 === 0;
  const isCompact = variant === 'compact';

  return (
    <div
      style={{
        ...styles.item,
        ...(isLeft ? styles.itemAlternateLeft : {}),
      }}
    >
      <div
        style={{
          ...styles.connector,
          ...(isAlternate ? styles.connectorAlternate : {}),
        }}
      >
        <div
          style={{
            ...styles.dot,
            ...(isCompact ? styles.dotCompact : {}),
            background: config.bgColor,
            color: config.color,
          }}
        >
          {item.icon || config.icon}
        </div>
        {showConnector && !isLast && <div style={styles.line} />}
      </div>

      <div
        style={{
          ...styles.content,
          ...(isAlternate ? styles.contentAlternate : {}),
          ...(isAlternate && !isLeft ? { marginLeft: 'calc(50% + 24px)' } : {}),
        }}
      >
        <div style={styles.title}>{item.title}</div>
        {item.description && (
          <div style={styles.description}>{item.description}</div>
        )}
        {item.timestamp && (
          <div style={styles.timestamp}>{item.timestamp}</div>
        )}
        {item.content && (
          <div style={styles.customContent}>{item.content}</div>
        )}
      </div>
    </div>
  );
};

export const Timeline: React.FC<TimelineProps> = ({
  items,
  variant = 'default',
  showConnector = true,
  className,
}) => (
  <div style={styles.container} className={className}>
    {items.map((item, index) => (
      <TimelineItemComponent
        key={item.id}
        item={item}
        isLast={index === items.length - 1}
        variant={variant}
        showConnector={showConnector}
        index={index}
      />
    ))}
  </div>
);

// Activity feed variant
interface ActivityItem {
  id: string;
  user?: string;
  action: string;
  target?: string;
  timestamp: string;
  icon?: React.ReactNode;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  className,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}
    className={className}
  >
    {activities.map((activity) => (
      <div
        key={activity.id}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.75rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
            flexShrink: 0,
          }}
        >
          {activity.icon || <Circle size={12} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', color: '#ccc' }}>
            {activity.user && (
              <span style={{ fontWeight: '600', color: '#fff' }}>
                {activity.user}{' '}
              </span>
            )}
            {activity.action}
            {activity.target && (
              <span style={{ fontWeight: '500', color: '#818cf8' }}>
                {' '}{activity.target}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
            {activity.timestamp}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Timeline;
