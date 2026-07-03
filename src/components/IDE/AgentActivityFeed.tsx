// ============== AGENT ACTIVITY FEED ==============
// Real-time feed of agent activities and actions

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './AgentActivityFeed.module.css';

interface Activity {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  action: string;
  target?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: Date;
  duration?: number;
  details?: Record<string, any>;
}

interface AgentActivityFeedProps {
  activities?: Activity[];
  maxItems?: number;
  showFilters?: boolean;
  onActivityClick?: (activity: Activity) => void;
  className?: string;
}

const AgentActivityFeedComponent: React.FC<AgentActivityFeedProps> = ({
  activities: initialActivities = [],
  maxItems = 50,
  showFilters = true,
  onActivityClick,
  className,
}) => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActivities(initialActivities.slice(-maxItems));
  }, [initialActivities, maxItems]);

  useEffect(() => {
    if (isAutoScroll && feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [activities, isAutoScroll]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    setIsAutoScroll(isAtBottom);
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (filter !== 'all' && activity.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        activity.agentName.toLowerCase().includes(query) ||
        activity.action.toLowerCase().includes(query) ||
        activity.target?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
    }
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('read') || actionLower.includes('fetch')) return '📖';
    if (actionLower.includes('write') || actionLower.includes('create')) return '✏️';
    if (actionLower.includes('delete') || actionLower.includes('remove')) return '🗑️';
    if (actionLower.includes('search') || actionLower.includes('find')) return '🔍';
    if (actionLower.includes('execute') || actionLower.includes('run')) return '▶️';
    if (actionLower.includes('analyze')) return '🔬';
    if (actionLower.includes('generate')) return '⚡';
    if (actionLower.includes('think') || actionLower.includes('plan')) return '🧠';
    return '🤖';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getAgentColor = (agentId: string) => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899'];
    const index = agentId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.icon}>📡</span>
          Agent Activity
        </h3>
        <div className={styles.stats}>
          <span className={styles.statItem}>
            <span className={styles.statDot} style={{ background: '#22c55e' }} />
            {activities.filter(a => a.status === 'completed').length}
          </span>
          <span className={styles.statItem}>
            <span className={styles.statDot} style={{ background: '#0ea5e9' }} />
            {activities.filter(a => a.status === 'running').length}
          </span>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filters}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search activities..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <div className={styles.filterTabs}>
            {(['all', 'running', 'completed', 'failed'] as const).map(f => (
              <button
                key={f}
                className={`${styles.filterTab} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.feed} ref={feedRef} onScroll={handleScroll}>
        {filteredActivities.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🤖</span>
            <p>No activities yet</p>
            <small>Agent activities will appear here</small>
          </div>
        ) : (
          filteredActivities.map(activity => (
            <div
              key={activity.id}
              className={`${styles.activityItem} ${styles[activity.status]}`}
              onClick={() => onActivityClick?.(activity)}
            >
              <div className={styles.activityAvatar}>
                {activity.agentAvatar ? (
                  <img src={activity.agentAvatar} alt={activity.agentName} />
                ) : (
                  <div
                    className={styles.avatarFallback}
                    style={{ background: getAgentColor(activity.agentId) }}
                  >
                    {activity.agentName.charAt(0)}
                  </div>
                )}
                <span className={`${styles.statusIndicator} ${styles[activity.status]}`} />
              </div>
              
              <div className={styles.activityContent}>
                <div className={styles.activityHeader}>
                  <span className={styles.agentName}>{activity.agentName}</span>
                  <span className={styles.activityTime}>{formatTime(activity.timestamp)}</span>
                </div>
                <div className={styles.activityAction}>
                  <span className={styles.actionIcon}>{getActionIcon(activity.action)}</span>
                  <span className={styles.actionText}>{activity.action}</span>
                  {activity.target && (
                    <span className={styles.actionTarget}>{activity.target}</span>
                  )}
                </div>
                {activity.duration !== undefined && (
                  <div className={styles.activityMeta}>
                    <span className={styles.statusIcon}>{getStatusIcon(activity.status)}</span>
                    <span className={styles.duration}>{formatDuration(activity.duration)}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!isAutoScroll && (
        <button
          className={styles.scrollToBottom}
          onClick={() => {
            setIsAutoScroll(true);
            if (feedRef.current) {
              feedRef.current.scrollTop = feedRef.current.scrollHeight;
            }
          }}
        >
          ↓ New activities
        </button>
      )}
    </div>
  );
};

export const AgentActivityFeed = memo(AgentActivityFeedComponent);
export default AgentActivityFeed;
