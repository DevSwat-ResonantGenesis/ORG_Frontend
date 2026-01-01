/**
 * Activity Grid Component
 * Shows key activity metrics in a grid layout
 * Displays ONLY real data - shows '—' for null values
 */
import React from 'react';
import { MessageSquare, Bot, Brain, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './ActivityGrid.module.css';

interface ActivityMetric {
  label: string;
  value: number | string | null;
  limit?: number | null;
  trend?: number;
  icon: 'messages' | 'agents' | 'memories' | 'sessions';
}

interface ActivityGridProps {
  metrics: ActivityMetric[];
}

const ICONS = {
  messages: MessageSquare,
  agents: Bot,
  memories: Brain,
  sessions: Activity,
};

const COLORS = {
  messages: '#3b82f6',
  agents: '#8b5cf6',
  memories: '#ec4899',
  sessions: '#22c55e',
};

export const ActivityGrid: React.FC<ActivityGridProps> = ({ metrics }) => {
  const formatNumber = (num: number | string | null): string => {
    if (num === null || num === undefined) return '—';
    if (typeof num === 'string') return num;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className={styles.grid}>
      {metrics.map((metric, index) => {
        const Icon = ICONS[metric.icon] || Activity;
        const color = COLORS[metric.icon] || '#6366f1';
        const hasValue = metric.value !== null && metric.value !== undefined;
        
        return (
          <div key={index} className={`${styles.card} ${!hasValue ? styles.noData : ''}`}>
            <div className={styles.iconWrapper} style={{ backgroundColor: `${color}20` }}>
              <Icon size={24} style={{ color }} />
            </div>
            <div className={styles.content}>
              <div className={styles.valueRow}>
                <span className={styles.value}>
                  {formatNumber(metric.value)}
                  {hasValue && metric.limit && metric.limit > 0 && (
                    <span className={styles.limit}>/ {formatNumber(metric.limit)}</span>
                  )}
                </span>
                {hasValue && metric.trend !== undefined && metric.trend !== 0 && (
                  <div className={`${styles.trend} ${metric.trend > 0 ? styles.up : styles.down}`}>
                    {metric.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{Math.abs(metric.trend)}%</span>
                  </div>
                )}
              </div>
              <span className={styles.label}>{metric.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityGrid;
