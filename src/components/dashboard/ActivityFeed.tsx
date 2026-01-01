/**
 * Activity Feed Component
 * Shows recent activity in a timeline format
 */
import React from 'react';
import { MessageSquare, Bot, Brain, CreditCard, Zap, Clock } from 'lucide-react';
import styles from './ActivityFeed.module.css';

interface ActivityItem {
  type: 'chat' | 'agent' | 'memory' | 'credit' | 'usage';
  description: string;
  timestamp: string;
  amount?: number;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  maxItems?: number;
}

const ACTIVITY_ICONS = {
  chat: MessageSquare,
  agent: Bot,
  memory: Brain,
  credit: CreditCard,
  usage: Zap,
};

const ACTIVITY_COLORS = {
  chat: '#3b82f6',
  agent: '#8b5cf6',
  memory: '#ec4899',
  credit: '#22c55e',
  usage: '#f59e0b',
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, maxItems = 10 }) => {
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return (
      <div className={styles.widget}>
        <div className={styles.header}>
          <Clock className={styles.icon} size={20} />
          <span className={styles.title}>Recent Activity</span>
        </div>
        <div className={styles.empty}>
          <p>No recent activity</p>
          <span>Your activity will appear here</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <Clock className={styles.icon} size={20} />
        <span className={styles.title}>Recent Activity</span>
      </div>
      <div className={styles.feed}>
        {displayItems.map((item, index) => {
          const Icon = ACTIVITY_ICONS[item.type] || Zap;
          const color = ACTIVITY_COLORS[item.type] || '#6366f1';
          
          return (
            <div key={index} className={styles.item}>
              <div className={styles.iconWrapper} style={{ backgroundColor: `${color}20` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <div className={styles.content}>
                <span className={styles.description}>{item.description}</span>
                {item.amount !== undefined && (
                  <span className={styles.amount}>
                    {item.amount > 0 ? '+' : ''}{item.amount} credits
                  </span>
                )}
              </div>
              <span className={styles.time}>{formatTime(item.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
