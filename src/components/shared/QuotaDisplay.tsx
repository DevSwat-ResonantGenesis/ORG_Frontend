import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Zap, Clock, RefreshCw } from 'lucide-react';

type QuotaStatus = 'normal' | 'warning' | 'critical' | 'exceeded';

interface QuotaData {
  name: string;
  used: number;
  limit: number;
  unit?: string;
  resetDate?: Date;
}

interface QuotaDisplayProps {
  quota: QuotaData;
  showPercentage?: boolean;
  showReset?: boolean;
  compact?: boolean;
  className?: string;
}

interface QuotaGridProps {
  quotas: QuotaData[];
  columns?: 2 | 3 | 4;
  className?: string;
}

interface QuotaAlertProps {
  quota: QuotaData;
  onUpgrade?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const getQuotaStatus = (used: number, limit: number): QuotaStatus => {
  const percentage = (used / limit) * 100;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 75) return 'warning';
  return 'normal';
};

const STATUS_CONFIG: Record<QuotaStatus, {
  color: string;
  bgColor: string;
  barColor: string;
}> = {
  normal: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    barColor: '#10b981',
  },
  warning: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    barColor: '#f59e0b',
  },
  critical: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    barColor: '#ef4444',
  },
  exceeded: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    barColor: '#ef4444',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '1rem',
  },
  containerCompact: {
    padding: '0.75rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.625rem',
  },
  name: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  usage: {
    fontSize: '0.75rem',
    color: '#888',
  },
  usageHighlight: {
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
    fontSize: '0.6875rem',
    color: '#666',
  },
  percentage: {
    fontWeight: '600',
  },
  reset: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  grid: {
    display: 'grid',
    gap: '0.75rem',
  },
  alert: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '10px',
  },
  alertIcon: {
    flexShrink: 0,
    marginTop: '0.125rem',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  alertMessage: {
    fontSize: '0.8125rem',
    color: '#888',
    lineHeight: 1.4,
  },
  alertActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  upgradeButton: {
    padding: '0.375rem 0.75rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  dismissButton: {
    padding: '0.375rem 0.75rem',
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  summaryLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  summaryValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  summaryUnit: {
    fontSize: '0.75rem',
    fontWeight: '400',
    color: '#888',
  },
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const formatResetDate = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return 'Soon';
};

export const QuotaDisplay: React.FC<QuotaDisplayProps> = ({
  quota,
  showPercentage = true,
  showReset = true,
  compact = false,
  className,
}) => {
  const status = getQuotaStatus(quota.used, quota.limit);
  const config = STATUS_CONFIG[status];
  const percentage = Math.min((quota.used / quota.limit) * 100, 100);

  return (
    <div
      style={{
        ...styles.container,
        ...(compact ? styles.containerCompact : {}),
      }}
      className={className}
    >
      <div style={styles.header}>
        <span style={styles.name}>{quota.name}</span>
        <span style={styles.usage}>
          <span style={{ ...styles.usageHighlight, color: config.color }}>
            {formatNumber(quota.used)}
          </span>
          {' / '}
          {formatNumber(quota.limit)}
          {quota.unit && ` ${quota.unit}`}
        </span>
      </div>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${percentage}%`,
            background: config.barColor,
          }}
        />
      </div>

      {(showPercentage || (showReset && quota.resetDate)) && (
        <div style={styles.footer}>
          {showPercentage && (
            <span style={{ ...styles.percentage, color: config.color }}>
              {percentage.toFixed(0)}% used
            </span>
          )}
          {showReset && quota.resetDate && (
            <span style={styles.reset}>
              <RefreshCw size={10} />
              Resets in {formatResetDate(quota.resetDate)}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const QuotaGrid: React.FC<QuotaGridProps> = ({
  quotas,
  columns = 2,
  className,
}) => (
  <div
    style={{
      ...styles.grid,
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
    }}
    className={className}
  >
    {quotas.map((quota, index) => (
      <QuotaDisplay key={index} quota={quota} />
    ))}
  </div>
);

export const QuotaAlert: React.FC<QuotaAlertProps> = ({
  quota,
  onUpgrade,
  onDismiss,
  className,
}) => {
  const status = getQuotaStatus(quota.used, quota.limit);
  const config = STATUS_CONFIG[status];

  if (status === 'normal') return null;

  const getMessage = () => {
    const percentage = Math.round((quota.used / quota.limit) * 100);
    if (status === 'exceeded') {
      return `You have exceeded your ${quota.name.toLowerCase()} limit. Upgrade your plan to continue.`;
    }
    if (status === 'critical') {
      return `You've used ${percentage}% of your ${quota.name.toLowerCase()}. Consider upgrading soon.`;
    }
    return `You've used ${percentage}% of your ${quota.name.toLowerCase()}.`;
  };

  return (
    <div
      style={{
        ...styles.alert,
        background: config.bgColor,
        border: `1px solid ${config.color}33`,
      }}
      className={className}
    >
      <AlertTriangle size={18} color={config.color} style={styles.alertIcon} />
      <div style={styles.alertContent}>
        <div style={styles.alertTitle}>
          {status === 'exceeded' ? 'Quota Exceeded' : 'Quota Warning'}
        </div>
        <div style={styles.alertMessage}>{getMessage()}</div>
        {(onUpgrade || onDismiss) && (
          <div style={styles.alertActions}>
            {onUpgrade && (
              <button style={styles.upgradeButton} onClick={onUpgrade}>
                <Zap size={12} style={{ marginRight: '0.25rem' }} />
                Upgrade Plan
              </button>
            )}
            {onDismiss && (
              <button style={styles.dismissButton} onClick={onDismiss}>
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Usage summary for dashboard
interface UsageSummaryProps {
  items: {
    label: string;
    value: number;
    unit?: string;
    trend?: number;
  }[];
  className?: string;
}

export const UsageSummary: React.FC<UsageSummaryProps> = ({
  items,
  className,
}) => (
  <div style={styles.summary} className={className}>
    {items.map((item, index) => (
      <div key={index} style={styles.summaryItem}>
        <span style={styles.summaryLabel}>{item.label}</span>
        <span style={styles.summaryValue}>
          {formatNumber(item.value)}
          {item.unit && <span style={styles.summaryUnit}> {item.unit}</span>}
        </span>
        {item.trend !== undefined && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.6875rem',
              color: item.trend >= 0 ? '#10b981' : '#ef4444',
            }}
          >
            <TrendingUp size={10} />
            {item.trend >= 0 ? '+' : ''}{item.trend}%
          </span>
        )}
      </div>
    ))}
  </div>
);

export default QuotaDisplay;
