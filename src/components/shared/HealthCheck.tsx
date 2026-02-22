import React, { useState, useEffect } from 'react';
import { Heart, Activity, Server, Database, Cloud, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown' | 'checking';

interface ServiceHealth {
  name: string;
  status: HealthStatus;
  latency?: number;
  message?: string;
  lastChecked?: Date;
  icon?: React.ReactNode;
}

interface HealthCheckProps {
  services: ServiceHealth[];
  onRefresh?: () => void;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

interface HealthIndicatorProps {
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

interface HealthCardProps {
  service: ServiceHealth;
  onCheck?: () => void;
  className?: string;
}

const STATUS_CONFIG: Record<HealthStatus, {
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactNode;
}> = {
  healthy: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    label: 'Healthy',
    icon: <CheckCircle size={14} />,
  },
  degraded: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Degraded',
    icon: <AlertTriangle size={14} />,
  },
  unhealthy: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    label: 'Unhealthy',
    icon: <XCircle size={14} />,
  },
  unknown: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    label: 'Unknown',
    icon: <AlertTriangle size={14} />,
  },
  checking: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    label: 'Checking',
    icon: <RefreshCw size={14} />,
  },
};

const SIZE_CONFIG = {
  sm: { dotSize: 6, fontSize: '0.6875rem', iconSize: 12 },
  md: { dotSize: 8, fontSize: '0.75rem', iconSize: 14 },
  lg: { dotSize: 10, fontSize: '0.8125rem', iconSize: 16 },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '8px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  serviceList: {
    padding: '0.5rem',
  },
  serviceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '0.75rem',
    borderRadius: '8px',
    transition: 'background 0.15s',
  },
  serviceItemHover: {
    background: 'rgba(255, 255, 255, 0.03)',
  },
  serviceIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  serviceInfo: {
    flex: 1,
    minWidth: 0,
  },
  serviceName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#fff',
  },
  serviceMessage: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.125rem',
  },
  serviceMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.6875rem',
    color: '#666',
  },
  indicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  dot: {
    borderRadius: '50%',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    padding: '1rem',
    transition: 'all 0.15s',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  cardDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#888',
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
    alignItems: 'center',
    gap: '0.5rem',
  },
  summaryCount: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
};

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  status,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <span
      style={{
        ...styles.indicator,
        background: config.bgColor,
        border: `1px solid ${config.color}33`,
      }}
      className={className}
    >
      <span
        style={{
          ...styles.dot,
          width: sizeConfig.dotSize,
          height: sizeConfig.dotSize,
          background: config.color,
          boxShadow: status === 'healthy' ? `0 0 8px ${config.color}` : 'none',
          animation: status === 'checking' ? 'pulse 1.5s infinite' : 'none',
        }}
      />
      {showLabel && (
        <span style={{ fontSize: sizeConfig.fontSize, color: config.color, fontWeight: '500' }}>
          {config.label}
        </span>
      )}
    </span>
  );
};

export const HealthCard: React.FC<HealthCardProps> = ({
  service,
  onCheck,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = STATUS_CONFIG[service.status];

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>
          <div
            style={{
              ...styles.serviceIcon,
              background: config.bgColor,
              color: config.color,
            }}
          >
            {service.icon || <Server size={18} />}
          </div>
          <span style={styles.cardName}>{service.name}</span>
        </div>
        <HealthIndicator status={service.status} size="sm" />
      </div>

      {service.message && (
        <p style={{ fontSize: '0.8125rem', color: '#888', margin: '0 0 0.75rem 0' }}>
          {service.message}
        </p>
      )}

      <div style={styles.cardDetails}>
        {service.latency !== undefined && (
          <span>Latency: {formatLatency(service.latency)}</span>
        )}
        {service.lastChecked && (
          <span>Checked: {formatTime(service.lastChecked)}</span>
        )}
        {onCheck && isHovered && (
          <button
            style={{
              ...styles.refreshButton,
              width: '24px',
              height: '24px',
              marginLeft: 'auto',
            }}
            onClick={onCheck}
            title="Check now"
          >
            <RefreshCw size={12} />
          </button>
        )}
      </div>
    </div>
  );
};

export const HealthCheck: React.FC<HealthCheckProps> = ({
  services,
  onRefresh,
  autoRefresh = false,
  refreshInterval = 30000,
  className,
}) => {
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const degradedCount = services.filter((s) => s.status === 'degraded').length;
  const unhealthyCount = services.filter((s) => s.status === 'unhealthy').length;

  const overallStatus: HealthStatus =
    unhealthyCount > 0 ? 'unhealthy' :
    degradedCount > 0 ? 'degraded' :
    healthyCount === services.length ? 'healthy' : 'unknown';

  useEffect(() => {
    if (autoRefresh && onRefresh) {
      const timer = setInterval(onRefresh, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, refreshInterval, onRefresh]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <Activity size={18} />
          System Health
        </div>
        <div style={styles.headerStatus}>
          <HealthIndicator status={overallStatus} />
          {onRefresh && (
            <button
              style={{
                ...styles.refreshButton,
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
              onClick={handleRefresh}
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={styles.serviceList}>
        {services.map((service) => {
          const config = STATUS_CONFIG[service.status];
          const isHovered = hoveredService === service.name;

          return (
            <div
              key={service.name}
              style={{
                ...styles.serviceItem,
                ...(isHovered ? styles.serviceItemHover : {}),
              }}
              onMouseEnter={() => setHoveredService(service.name)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div
                style={{
                  ...styles.serviceIcon,
                  background: config.bgColor,
                  color: config.color,
                }}
              >
                {service.icon || <Server size={18} />}
              </div>

              <div style={styles.serviceInfo}>
                <div style={styles.serviceName}>{service.name}</div>
                {service.message && (
                  <div style={styles.serviceMessage}>{service.message}</div>
                )}
              </div>

              <div style={styles.serviceMeta}>
                {service.latency !== undefined && (
                  <span>{service.latency}ms</span>
                )}
                {service.lastChecked && (
                  <span>{formatTime(service.lastChecked)}</span>
                )}
              </div>

              <HealthIndicator status={service.status} size="sm" showLabel={false} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Health summary for dashboards
interface HealthSummaryProps {
  services: ServiceHealth[];
  className?: string;
}

export const HealthSummary: React.FC<HealthSummaryProps> = ({
  services,
  className,
}) => {
  const healthyCount = services.filter((s) => s.status === 'healthy').length;
  const degradedCount = services.filter((s) => s.status === 'degraded').length;
  const unhealthyCount = services.filter((s) => s.status === 'unhealthy').length;

  return (
    <div style={styles.summary} className={className}>
      <div style={styles.summaryItem}>
        <CheckCircle size={18} color="#10b981" />
        <span style={{ ...styles.summaryCount, color: '#10b981' }}>{healthyCount}</span>
        <span style={styles.summaryLabel}>Healthy</span>
      </div>
      <div style={styles.summaryItem}>
        <AlertTriangle size={18} color="#f59e0b" />
        <span style={{ ...styles.summaryCount, color: '#f59e0b' }}>{degradedCount}</span>
        <span style={styles.summaryLabel}>Degraded</span>
      </div>
      <div style={styles.summaryItem}>
        <XCircle size={18} color="#ef4444" />
        <span style={{ ...styles.summaryCount, color: '#ef4444' }}>{unhealthyCount}</span>
        <span style={styles.summaryLabel}>Unhealthy</span>
      </div>
    </div>
  );
};

export default HealthCheck;
