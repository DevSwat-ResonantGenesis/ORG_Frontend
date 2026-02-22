import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, Download, RefreshCw, Search, Filter, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

type CostCategory = 'compute' | 'storage' | 'network' | 'api' | 'support' | 'other';
type CostTrend = 'up' | 'down' | 'stable';
type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface CostBreakdown {
  category: CostCategory;
  amount: number;
  percentage: number;
  trend: CostTrend;
  trendPercent: number;
}

interface CostDataPoint {
  date: Date;
  amount: number;
  projected?: boolean;
}

interface CostAlert {
  id: string;
  type: 'budget_warning' | 'anomaly' | 'optimization';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  category?: CostCategory;
  potentialSavings?: number;
  createdAt: Date;
}

interface CostAnalyticsProps {
  totalCost: number;
  previousPeriodCost: number;
  projectedCost: number;
  budget: number;
  breakdown: CostBreakdown[];
  history: CostDataPoint[];
  alerts: CostAlert[];
  period: TimePeriod;
  onPeriodChange?: (period: TimePeriod) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  className?: string;
}

const CATEGORY_CONFIG: Record<CostCategory, {
  label: string;
  color: string;
}> = {
  compute: { label: 'Compute', color: '#3b82f6' },
  storage: { label: 'Storage', color: '#10b981' },
  network: { label: 'Network', color: '#8b5cf6' },
  api: { label: 'API Calls', color: '#f59e0b' },
  support: { label: 'Support', color: '#ec4899' },
  other: { label: 'Other', color: '#888' },
};

const PERIOD_CONFIG: Record<TimePeriod, { label: string }> = {
  day: { label: 'Today' },
  week: { label: 'This Week' },
  month: { label: 'This Month' },
  quarter: { label: 'This Quarter' },
  year: { label: 'This Year' },
};

const ALERT_SEVERITY_CONFIG: Record<string, { color: string; bgColor: string }> = {
  info: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  warning: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  critical: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
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
  exportButton: {
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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  summaryCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  summaryLabel: {
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '0.5rem',
  },
  summaryValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.375rem',
  },
  summaryTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
  },
  budgetBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '0.75rem',
  },
  budgetFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1rem',
  },
  chartCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  chartHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  chartTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  chartArea: {
    height: '200px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    padding: '1rem 0',
  },
  chartBar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s ease',
    minWidth: '8px',
  },
  breakdownCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  breakdownTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '1rem',
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  breakdownDot: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
    flexShrink: 0,
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownCategory: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
    marginBottom: '0.125rem',
  },
  breakdownBar: {
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: '2px',
  },
  breakdownAmount: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    textAlign: 'right',
  },
  breakdownPercent: {
    fontSize: '0.6875rem',
    color: '#888',
    textAlign: 'right',
  },
  alertsSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  alertsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  alertsTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  alertsList: {
    padding: '0.5rem',
  },
  alertItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    transition: 'background 0.15s',
  },
  alertIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: '0.8125rem',
    color: '#e4e4e7',
    marginBottom: '0.25rem',
  },
  alertMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.6875rem',
    color: '#888',
  },
  savingsBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#666',
  },
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const CostAnalytics: React.FC<CostAnalyticsProps> = ({
  totalCost,
  previousPeriodCost,
  projectedCost,
  budget,
  breakdown,
  history,
  alerts,
  period,
  onPeriodChange,
  onExport,
  onRefresh,
  className,
}) => {
  const costChange = previousPeriodCost > 0
    ? ((totalCost - previousPeriodCost) / previousPeriodCost) * 100
    : 0;
  const budgetUsed = (totalCost / budget) * 100;
  const budgetColor = budgetUsed > 90 ? '#ef4444' : budgetUsed > 75 ? '#f59e0b' : '#10b981';

  const maxHistoryValue = Math.max(...history.map(h => h.amount), 1);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <DollarSign size={22} />
          Cost Analytics
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
            <button style={styles.exportButton} onClick={onExport}>
              <Download size={14} />
              Export
            </button>
          )}
          {onRefresh && (
            <button style={styles.exportButton} onClick={onRefresh}>
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Spend</div>
          <div style={styles.summaryValue}>{formatCurrency(totalCost)}</div>
          <div
            style={{
              ...styles.summaryTrend,
              color: costChange > 0 ? '#ef4444' : '#10b981',
            }}
          >
            {costChange > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(costChange).toFixed(1)}% vs last period
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Projected</div>
          <div style={styles.summaryValue}>{formatCurrency(projectedCost)}</div>
          <div style={{ ...styles.summaryTrend, color: '#888' }}>
            <Minus size={14} />
            End of period estimate
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Budget</div>
          <div style={styles.summaryValue}>{formatCurrency(budget)}</div>
          <div style={styles.budgetBar}>
            <div
              style={{
                ...styles.budgetFill,
                width: `${Math.min(budgetUsed, 100)}%`,
                background: budgetColor,
              }}
            />
          </div>
          <div style={{ ...styles.summaryTrend, color: budgetColor, marginTop: '0.5rem' }}>
            {budgetUsed.toFixed(1)}% used
          </div>
        </div>

        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Remaining</div>
          <div style={{ ...styles.summaryValue, color: budget - totalCost > 0 ? '#10b981' : '#ef4444' }}>
            {formatCurrency(Math.max(budget - totalCost, 0))}
          </div>
          <div style={{ ...styles.summaryTrend, color: '#888' }}>
            Until budget limit
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Cost Trend Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <span style={styles.chartTitle}>Cost Trend</span>
            <BarChart3 size={16} style={{ color: '#888' }} />
          </div>
          <div style={styles.chartArea}>
            {history.map((point, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.chartBar,
                  height: `${(point.amount / maxHistoryValue) * 100}%`,
                  background: point.projected
                    ? 'rgba(99, 102, 241, 0.3)'
                    : 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
                  opacity: point.projected ? 0.6 : 1,
                }}
                title={`${formatCurrency(point.amount)}`}
              />
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div style={styles.breakdownCard}>
          <div style={styles.breakdownTitle}>Cost Breakdown</div>
          <div style={styles.breakdownList}>
            {breakdown.map((item) => {
              const config = CATEGORY_CONFIG[item.category];
              return (
                <div key={item.category} style={styles.breakdownItem}>
                  <div style={{ ...styles.breakdownDot, background: config.color }} />
                  <div style={styles.breakdownInfo}>
                    <div style={styles.breakdownCategory}>{config.label}</div>
                    <div style={styles.breakdownBar}>
                      <div
                        style={{
                          ...styles.breakdownFill,
                          width: `${item.percentage}%`,
                          background: config.color,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div style={styles.breakdownAmount}>{formatCurrency(item.amount)}</div>
                    <div style={styles.breakdownPercent}>{item.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div style={styles.alertsSection}>
        <div style={styles.alertsHeader}>
          <span style={styles.alertsTitle}>Cost Alerts ({alerts.length})</span>
        </div>
        {alerts.length === 0 ? (
          <div style={styles.empty}>
            <DollarSign size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <span>No cost alerts</span>
          </div>
        ) : (
          <div style={styles.alertsList}>
            {alerts.map((alert) => {
              const severityConfig = ALERT_SEVERITY_CONFIG[alert.severity];
              return (
                <div
                  key={alert.id}
                  style={{
                    ...styles.alertItem,
                    background: severityConfig.bgColor,
                  }}
                >
                  <div
                    style={{
                      ...styles.alertIcon,
                      background: severityConfig.bgColor,
                      color: severityConfig.color,
                    }}
                  >
                    <DollarSign size={16} />
                  </div>
                  <div style={styles.alertContent}>
                    <div style={styles.alertMessage}>{alert.message}</div>
                    <div style={styles.alertMeta}>
                      <span>{formatTimeAgo(alert.createdAt)}</span>
                      {alert.category && (
                        <span>{CATEGORY_CONFIG[alert.category].label}</span>
                      )}
                      {alert.potentialSavings && (
                        <span style={styles.savingsBadge}>
                          Save {formatCurrency(alert.potentialSavings)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CostAnalytics;
