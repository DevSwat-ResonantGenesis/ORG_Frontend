import React, { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, Users, Zap, Clock, BarChart3, RefreshCw, Search, Calendar, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type MetricType = 'requests' | 'users' | 'tokens' | 'latency' | 'errors' | 'sessions';
type TimePeriod = 'hour' | 'day' | 'week' | 'month';
type TrendDirection = 'up' | 'down' | 'stable';

interface MetricDataPoint {
  timestamp: Date;
  value: number;
}

interface UsageMetric {
  id: string;
  type: MetricType;
  name: string;
  currentValue: number;
  previousValue: number;
  unit: string;
  trend: TrendDirection;
  trendPercent: number;
  history: MetricDataPoint[];
  breakdown?: { label: string; value: number; color: string }[];
}

interface TopUser {
  id: string;
  name: string;
  email: string;
  requests: number;
  tokens: number;
  lastActive: Date;
}

interface UsageMetricsProps {
  metrics: UsageMetric[];
  topUsers: TopUser[];
  period: TimePeriod;
  onPeriodChange?: (period: TimePeriod) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  onViewUser?: (userId: string) => void;
  className?: string;
}

const METRIC_TYPE_CONFIG: Record<MetricType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  requests: { label: 'API Requests', icon: <Zap size={18} />, color: '#3b82f6' },
  users: { label: 'Active Users', icon: <Users size={18} />, color: '#10b981' },
  tokens: { label: 'Tokens Used', icon: <Activity size={18} />, color: '#8b5cf6' },
  latency: { label: 'Avg Latency', icon: <Clock size={18} />, color: '#f59e0b' },
  errors: { label: 'Error Rate', icon: <Activity size={18} />, color: '#ef4444' },
  sessions: { label: 'Sessions', icon: <Users size={18} />, color: '#14b8a6' },
};

const PERIOD_CONFIG: Record<TimePeriod, { label: string }> = {
  hour: { label: 'Last Hour' },
  day: { label: 'Last 24h' },
  week: { label: 'Last 7 Days' },
  month: { label: 'Last 30 Days' },
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
  periodSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
  },
  periodButton: {
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  periodButtonActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
  },
  actionButton: {
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
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.15s',
  },
  metricCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  metricIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricName: {
    fontSize: '0.75rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  metricUnit: {
    fontSize: '0.875rem',
    color: '#888',
    marginLeft: '0.25rem',
  },
  metricTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    marginBottom: '1rem',
  },
  sparkline: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2px',
    height: '40px',
  },
  sparklineBar: {
    flex: 1,
    borderRadius: '2px',
    minWidth: '4px',
    transition: 'height 0.3s ease',
  },
  breakdownSection: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  breakdownLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  breakdownDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  breakdownValue: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#e4e4e7',
  },
  topUsersSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  sectionTitle: {
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
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#818cf8',
  },
  userName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  userEmail: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '6px',
    color: '#818cf8',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
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

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

interface MetricCardProps {
  metric: UsageMetric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const [isHovered, setIsHovered] = useState(false);

  const config = METRIC_TYPE_CONFIG[metric.type];
  const trendColor = metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#888';
  const TrendIcon = metric.trend === 'up' ? ArrowUpRight : metric.trend === 'down' ? ArrowDownRight : Activity;

  const maxValue = Math.max(...metric.history.map(h => h.value), 1);

  return (
    <div
      style={{
        ...styles.metricCard,
        ...(isHovered ? styles.metricCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.metricHeader}>
        <div
          style={{
            ...styles.metricIcon,
            background: `${config.color}20`,
            color: config.color,
          }}
        >
          {config.icon}
        </div>
        <span style={styles.metricName}>{config.label}</span>
      </div>

      <div style={styles.metricValue}>
        {formatNumber(metric.currentValue)}
        <span style={styles.metricUnit}>{metric.unit}</span>
      </div>

      <div style={{ ...styles.metricTrend, color: trendColor }}>
        <TrendIcon size={14} />
        {metric.trendPercent > 0 ? '+' : ''}{metric.trendPercent.toFixed(1)}% vs previous
      </div>

      <div style={styles.sparkline}>
        {metric.history.slice(-20).map((point, idx) => (
          <div
            key={idx}
            style={{
              ...styles.sparklineBar,
              height: `${(point.value / maxValue) * 100}%`,
              background: config.color,
              opacity: 0.3 + (idx / 20) * 0.7,
            }}
          />
        ))}
      </div>

      {metric.breakdown && metric.breakdown.length > 0 && (
        <div style={styles.breakdownSection}>
          {metric.breakdown.map((item, idx) => (
            <div key={idx} style={styles.breakdownItem}>
              <span style={styles.breakdownLabel}>
                <span style={{ ...styles.breakdownDot, background: item.color }} />
                {item.label}
              </span>
              <span style={styles.breakdownValue}>{formatNumber(item.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface UserRowProps {
  user: TopUser;
  rank: number;
  onView?: () => void;
}

const UserRow: React.FC<UserRowProps> = ({ user, rank, onView }) => {
  const [isHovered, setIsHovered] = useState(false);

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
        <span style={{ color: '#888', fontWeight: '600' }}>#{rank}</span>
      </td>
      <td style={styles.td}>
        <div style={styles.userCell}>
          <div style={styles.userAvatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userEmail}>{user.email}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}>{formatNumber(user.requests)}</td>
      <td style={styles.td}>{formatNumber(user.tokens)}</td>
      <td style={styles.td}>{formatTimeAgo(user.lastActive)}</td>
      <td style={styles.td}>
        {onView && (
          <button style={styles.viewButton} onClick={onView}>
            View
          </button>
        )}
      </td>
    </tr>
  );
};

export const UsageMetrics: React.FC<UsageMetricsProps> = ({
  metrics,
  topUsers,
  period,
  onPeriodChange,
  onExport,
  onRefresh,
  onViewUser,
  className,
}) => {
  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Activity size={22} />
          Usage Metrics
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.periodSelector}>
            {Object.entries(PERIOD_CONFIG).map(([key, config]) => (
              <button
                key={key}
                style={{
                  ...styles.periodButton,
                  ...(period === key ? styles.periodButtonActive : {}),
                }}
                onClick={() => onPeriodChange?.(key as TimePeriod)}
              >
                {config.label}
              </button>
            ))}
          </div>
          {onExport && (
            <button style={styles.actionButton} onClick={onExport}>
              <Download size={14} />
              Export
            </button>
          )}
          {onRefresh && (
            <button style={styles.actionButton} onClick={onRefresh}>
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Top Users */}
      <div style={styles.topUsersSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Top Users</span>
        </div>
        {topUsers.length === 0 ? (
          <div style={styles.empty}>
            <Users size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <span>No user data available</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rank</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Requests</th>
                <th style={styles.th}>Tokens</th>
                <th style={styles.th}>Last Active</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, idx) => (
                <UserRow
                  key={user.id}
                  user={user}
                  rank={idx + 1}
                  onView={onViewUser ? () => onViewUser(user.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UsageMetrics;
