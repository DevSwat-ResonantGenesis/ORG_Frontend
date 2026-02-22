import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Bot, Zap, Clock, Calendar, Download, RefreshCw, ChevronDown } from 'lucide-react';

type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';
type MetricTrend = 'up' | 'down' | 'neutral';

interface MetricData {
  label: string;
  value: number;
  previousValue?: number;
  unit?: string;
  trend?: MetricTrend;
  trendValue?: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
  previousValue?: number;
}

interface AnalyticsDashboardProps {
  metrics: MetricData[];
  chartData: ChartDataPoint[];
  topAgents?: { name: string; sessions: number; tokens: number }[];
  topUsers?: { name: string; email: string; usage: number }[];
  onTimeRangeChange?: (range: TimeRange) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
];

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
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  timeRangeSelect: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.875rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  metricLabel: {
    fontSize: '0.8125rem',
    color: '#888',
  },
  metricTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  metricTrendUp: {
    color: '#10b981',
  },
  metricTrendDown: {
    color: '#ef4444',
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
  },
  metricUnit: {
    fontSize: '0.875rem',
    fontWeight: '400',
    color: '#888',
    marginLeft: '0.25rem',
  },
  chartContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
  },
  chartTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
  },
  chart: {
    height: '250px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.5rem',
    paddingBottom: '2rem',
    position: 'relative',
  },
  chartBar: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  bar: {
    width: '100%',
    maxWidth: '40px',
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s ease',
  },
  barLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    position: 'absolute',
    bottom: 0,
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  listCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  listTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  listItemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  listItemIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemName: {
    fontWeight: '500',
    color: '#fff',
    fontSize: '0.875rem',
  },
  listItemMeta: {
    fontSize: '0.75rem',
    color: '#888',
  },
  listItemValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    fontFamily: "'JetBrains Mono', monospace",
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#666',
    fontSize: '0.875rem',
  },
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  metrics,
  chartData,
  topAgents = [],
  topUsers = [],
  onTimeRangeChange,
  onExport,
  onRefresh,
  loading = false,
  className,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    setShowTimeDropdown(false);
    onTimeRangeChange?.(range);
  };

  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Analytics Dashboard</h2>
        <div style={styles.headerActions}>
          <div style={{ position: 'relative' }}>
            <button
              style={styles.timeRangeSelect}
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            >
              <Calendar size={14} />
              {TIME_RANGES.find((r) => r.value === timeRange)?.label}
              <ChevronDown size={14} />
            </button>
            {showTimeDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.25rem',
                  background: '#1a1a2e',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0.375rem',
                  minWidth: '160px',
                  zIndex: 100,
                }}
              >
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      background: range.value === timeRange ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: range.value === timeRange ? '#818cf8' : '#e4e4e7',
                      fontSize: '0.8125rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleTimeRangeChange(range.value)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {onRefresh && (
            <button
              style={{
                ...styles.button,
                animation: loading ? 'spin 1s linear infinite' : 'none',
              }}
              onClick={onRefresh}
            >
              <RefreshCw size={14} />
            </button>
          )}
          {onExport && (
            <button style={styles.button} onClick={onExport}>
              <Download size={14} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <div key={index} style={styles.metricCard}>
            <div style={styles.metricHeader}>
              <span style={styles.metricLabel}>{metric.label}</span>
              {metric.trend && metric.trendValue !== undefined && (
                <span
                  style={{
                    ...styles.metricTrend,
                    ...(metric.trend === 'up' ? styles.metricTrendUp : {}),
                    ...(metric.trend === 'down' ? styles.metricTrendDown : {}),
                  }}
                >
                  {metric.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {metric.trendValue}%
                </span>
              )}
            </div>
            <div style={styles.metricValue}>
              {formatNumber(metric.value)}
              {metric.unit && <span style={styles.metricUnit}>{metric.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={styles.chartContainer}>
        <div style={styles.chartHeader}>
          <span style={styles.chartTitle}>Usage Over Time</span>
        </div>
        <div style={styles.chart}>
          {chartData.map((point, index) => (
            <div key={index} style={styles.chartBar}>
              <div
                style={{
                  ...styles.bar,
                  height: `${(point.value / maxChartValue) * 200}px`,
                  background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
                }}
                title={`${point.label}: ${formatNumber(point.value)}`}
              />
              <span style={styles.barLabel}>{point.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Lists */}
      <div style={styles.gridRow}>
        {/* Top Agents */}
        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <span style={styles.listTitle}>Top Agents</span>
          </div>
          {topAgents.length === 0 ? (
            <div style={styles.empty}>No agent data available</div>
          ) : (
            topAgents.slice(0, 5).map((agent, index) => (
              <div key={index} style={styles.listItem}>
                <div style={styles.listItemInfo}>
                  <div
                    style={{
                      ...styles.listItemIcon,
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                    }}
                  >
                    <Bot size={18} />
                  </div>
                  <div>
                    <div style={styles.listItemName}>{agent.name}</div>
                    <div style={styles.listItemMeta}>{formatNumber(agent.sessions)} sessions</div>
                  </div>
                </div>
                <span style={styles.listItemValue}>{formatNumber(agent.tokens)} tokens</span>
              </div>
            ))
          )}
        </div>

        {/* Top Users */}
        <div style={styles.listCard}>
          <div style={styles.listHeader}>
            <span style={styles.listTitle}>Top Users</span>
          </div>
          {topUsers.length === 0 ? (
            <div style={styles.empty}>No user data available</div>
          ) : (
            topUsers.slice(0, 5).map((user, index) => (
              <div key={index} style={styles.listItem}>
                <div style={styles.listItemInfo}>
                  <div
                    style={{
                      ...styles.listItemIcon,
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#10b981',
                    }}
                  >
                    <Users size={18} />
                  </div>
                  <div>
                    <div style={styles.listItemName}>{user.name}</div>
                    <div style={styles.listItemMeta}>{user.email}</div>
                  </div>
                </div>
                <span style={styles.listItemValue}>{formatNumber(user.usage)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
