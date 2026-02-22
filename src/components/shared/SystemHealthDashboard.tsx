import React, { useState } from 'react';
import { Activity, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Server, Database, Cpu, HardDrive, Wifi, Zap, TrendingUp, TrendingDown } from 'lucide-react';

type ServiceHealth = 'healthy' | 'degraded' | 'down' | 'unknown';
type MetricTrend = 'up' | 'down' | 'stable';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  trend: MetricTrend;
  trendValue: number;
}

interface ServiceStatus {
  id: string;
  name: string;
  health: ServiceHealth;
  uptime: number;
  responseTime: number;
  lastCheck: Date;
  metrics: HealthMetric[];
  incidents?: number;
}

interface SystemHealthDashboardProps {
  services: ServiceStatus[];
  overallHealth: ServiceHealth;
  lastUpdated: Date;
  onRefresh?: () => void;
  onViewService?: (serviceId: string) => void;
  className?: string;
}

interface ServiceCardProps {
  service: ServiceStatus;
  onView?: () => void;
}

const HEALTH_CONFIG: Record<ServiceHealth, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  healthy: {
    label: 'Healthy',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={16} />,
  },
  degraded: {
    label: 'Degraded',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={16} />,
  },
  down: {
    label: 'Down',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={16} />,
  },
  unknown: {
    label: 'Unknown',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={16} />,
  },
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
  lastUpdated: {
    fontSize: '0.75rem',
    color: '#888',
  },
  refreshButton: {
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
  overallStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    borderRadius: '16px',
    textAlign: 'center',
  },
  overallContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  overallIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallLabel: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  overallSubtext: {
    fontSize: '0.875rem',
    color: '#888',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  },
  serviceCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  serviceCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  serviceCardHealthy: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  serviceCardDegraded: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  serviceCardDown: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  serviceHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  serviceTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  serviceIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  healthBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  serviceBody: {
    padding: '1rem 1.25rem',
  },
  metricsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  metricValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
  },
  metricLabel: {
    fontSize: '0.625rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  metricsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  metricBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  metricName: {
    fontSize: '0.75rem',
    color: '#888',
    minWidth: '80px',
  },
  metricTrack: {
    flex: 1,
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  metricValueSmall: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#e4e4e7',
    minWidth: '50px',
    textAlign: 'right',
  },
  metricTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.125rem',
    fontSize: '0.625rem',
    fontWeight: '600',
  },
  serviceFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
    fontSize: '0.6875rem',
    color: '#888',
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

const formatUptime = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};

const formatResponseTime = (ms: number): string => {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
};

const getMetricColor = (value: number, threshold?: number): string => {
  if (!threshold) return '#3b82f6';
  const percentage = (value / threshold) * 100;
  if (percentage >= 90) return '#ef4444';
  if (percentage >= 70) return '#f59e0b';
  return '#10b981';
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onView }) => {
  const [isHovered, setIsHovered] = useState(false);

  const healthConfig = HEALTH_CONFIG[service.health];

  return (
    <div
      style={{
        ...styles.serviceCard,
        ...(isHovered ? styles.serviceCardHover : {}),
        ...(service.health === 'healthy' ? styles.serviceCardHealthy : {}),
        ...(service.health === 'degraded' ? styles.serviceCardDegraded : {}),
        ...(service.health === 'down' ? styles.serviceCardDown : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
    >
      <div style={styles.serviceHeader}>
        <div style={styles.serviceTitle}>
          <div
            style={{
              ...styles.serviceIcon,
              background: healthConfig.bgColor,
              color: healthConfig.color,
            }}
          >
            <Server size={18} />
          </div>
          <span style={styles.serviceName}>{service.name}</span>
        </div>
        <span
          style={{
            ...styles.healthBadge,
            background: healthConfig.bgColor,
            color: healthConfig.color,
          }}
        >
          {healthConfig.icon}
          {healthConfig.label}
        </span>
      </div>

      <div style={styles.serviceBody}>
        <div style={styles.metricsRow}>
          <div style={styles.metricItem}>
            <span style={{ ...styles.metricValue, color: service.uptime >= 99.9 ? '#10b981' : service.uptime >= 99 ? '#f59e0b' : '#ef4444' }}>
              {formatUptime(service.uptime)}
            </span>
            <span style={styles.metricLabel}>Uptime</span>
          </div>
          <div style={styles.metricItem}>
            <span style={{ ...styles.metricValue, color: service.responseTime <= 100 ? '#10b981' : service.responseTime <= 500 ? '#f59e0b' : '#ef4444' }}>
              {formatResponseTime(service.responseTime)}
            </span>
            <span style={styles.metricLabel}>Response</span>
          </div>
          {service.incidents !== undefined && (
            <div style={styles.metricItem}>
              <span style={{ ...styles.metricValue, color: service.incidents === 0 ? '#10b981' : '#ef4444' }}>
                {service.incidents}
              </span>
              <span style={styles.metricLabel}>Incidents</span>
            </div>
          )}
        </div>

        <div style={styles.metricsList}>
          {service.metrics.slice(0, 3).map((metric) => (
            <div key={metric.id} style={styles.metricBar}>
              <span style={styles.metricName}>{metric.name}</span>
              <div style={styles.metricTrack}>
                <div
                  style={{
                    ...styles.metricFill,
                    width: `${Math.min(metric.value, 100)}%`,
                    background: getMetricColor(metric.value, metric.threshold),
                  }}
                />
              </div>
              <span style={styles.metricValueSmall}>
                {metric.value}{metric.unit}
              </span>
              <span
                style={{
                  ...styles.metricTrend,
                  color: metric.trend === 'up' ? '#ef4444' : metric.trend === 'down' ? '#10b981' : '#888',
                }}
              >
                {metric.trend === 'up' ? <TrendingUp size={10} /> : metric.trend === 'down' ? <TrendingDown size={10} /> : null}
                {metric.trendValue > 0 ? '+' : ''}{metric.trendValue}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.serviceFooter}>
        <span>Last check: {formatTimeAgo(service.lastCheck)}</span>
      </div>
    </div>
  );
};

export const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({
  services,
  overallHealth,
  lastUpdated,
  onRefresh,
  onViewService,
  className,
}) => {
  const overallConfig = HEALTH_CONFIG[overallHealth];

  const healthyServices = services.filter(s => s.health === 'healthy').length;
  const degradedServices = services.filter(s => s.health === 'degraded').length;
  const downServices = services.filter(s => s.health === 'down').length;
  const avgUptime = services.length > 0
    ? services.reduce((sum, s) => sum + s.uptime, 0) / services.length
    : 0;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Activity size={22} />
          System Health Dashboard
        </h2>
        <div style={styles.headerActions}>
          <span style={styles.lastUpdated}>
            Last updated: {formatTimeAgo(lastUpdated)}
          </span>
          {onRefresh && (
            <button style={styles.refreshButton} onClick={onRefresh}>
              <RefreshCw size={14} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Overall Status */}
      <div
        style={{
          ...styles.overallStatus,
          background: overallConfig.bgColor,
        }}
      >
        <div style={styles.overallContent}>
          <div
            style={{
              ...styles.overallIcon,
              background: `${overallConfig.color}30`,
              color: overallConfig.color,
            }}
          >
            {React.cloneElement(overallConfig.icon as React.ReactElement, { size: 32 })}
          </div>
          <span style={{ ...styles.overallLabel, color: overallConfig.color }}>
            System {overallConfig.label}
          </span>
          <span style={styles.overallSubtext}>
            {healthyServices} of {services.length} services operational
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{healthyServices}</div>
          <div style={styles.statLabel}>Healthy</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{degradedServices}</div>
          <div style={styles.statLabel}>Degraded</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <XCircle size={20} />
          </div>
          <div style={styles.statValue}>{downServices}</div>
          <div style={styles.statLabel}>Down</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Zap size={20} />
          </div>
          <div style={styles.statValue}>{avgUptime.toFixed(2)}%</div>
          <div style={styles.statLabel}>Avg Uptime</div>
        </div>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <div style={styles.empty}>
          <Activity size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No services configured</span>
        </div>
      ) : (
        <div style={styles.servicesGrid}>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onView={onViewService ? () => onViewService(service.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SystemHealthDashboard;
