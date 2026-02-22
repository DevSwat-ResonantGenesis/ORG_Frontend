import React, { useState } from 'react';
import { Activity, Server, Database, Globe, Zap, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw, TrendingUp, TrendingDown, Wifi, WifiOff, MoreVertical } from 'lucide-react';

type ServiceHealth = 'healthy' | 'degraded' | 'down' | 'maintenance';
type ServiceCategory = 'core' | 'database' | 'external' | 'infrastructure';

interface ServiceMetrics {
  uptime: number;
  latency: number;
  requestsPerMinute?: number;
  errorRate?: number;
}

interface ServiceIncident {
  id: string;
  message: string;
  severity: 'minor' | 'major' | 'critical';
  startedAt: Date;
  resolvedAt?: Date;
}

interface ServiceData {
  id: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  health: ServiceHealth;
  metrics: ServiceMetrics;
  endpoint?: string;
  lastChecked: Date;
  incidents: ServiceIncident[];
}

interface ServiceStatusProps {
  services: ServiceData[];
  overallHealth: ServiceHealth;
  lastUpdated: Date;
  onRefresh?: () => void;
  onViewDetails?: (serviceId: string) => void;
  onRestartService?: (serviceId: string) => void;
  className?: string;
}

interface ServiceCardProps {
  service: ServiceData;
  onViewDetails?: () => void;
  onRestart?: () => void;
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
    icon: <CheckCircle size={14} />,
  },
  degraded: {
    label: 'Degraded',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={14} />,
  },
  down: {
    label: 'Down',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={14} />,
  },
  maintenance: {
    label: 'Maintenance',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Clock size={14} />,
  },
};

const CATEGORY_CONFIG: Record<ServiceCategory, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  core: { label: 'Core', icon: <Zap size={16} />, color: '#8b5cf6' },
  database: { label: 'Database', icon: <Database size={16} />, color: '#3b82f6' },
  external: { label: 'External', icon: <Globe size={16} />, color: '#10b981' },
  infrastructure: { label: 'Infrastructure', icon: <Server size={16} />, color: '#f59e0b' },
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
    justifyContent: 'space-between',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid',
  },
  overallInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  overallIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallText: {
    display: 'flex',
    flexDirection: 'column',
  },
  overallLabel: {
    fontSize: '0.875rem',
    color: '#888',
    marginBottom: '0.25rem',
  },
  overallValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.15s',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  serviceIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  serviceCategory: {
    fontSize: '0.6875rem',
    color: '#888',
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
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.625rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
  },
  metricValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  metricLabel: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  incidentBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  actionButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonPrimary: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
  },
  actionButtonDanger: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
};

const formatUptime = (uptime: number) => {
  return `${uptime.toFixed(2)}%`;
};

const formatLatency = (latency: number) => {
  return `${latency}ms`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / 60000);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onViewDetails,
  onRestart,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const healthConfig = HEALTH_CONFIG[service.health];
  const categoryConfig = CATEGORY_CONFIG[service.category];
  const activeIncident = service.incidents.find(i => !i.resolvedAt);

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>
          <div
            style={{
              ...styles.serviceIcon,
              background: `${categoryConfig.color}20`,
              color: categoryConfig.color,
            }}
          >
            {categoryConfig.icon}
          </div>
          <div>
            <div style={styles.serviceName}>{service.name}</div>
            <div style={styles.serviceCategory}>{categoryConfig.label}</div>
          </div>
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

      <div style={styles.metricsGrid}>
        <div style={styles.metricItem}>
          <span style={styles.metricValue}>{formatUptime(service.metrics.uptime)}</span>
          <span style={styles.metricLabel}>Uptime</span>
        </div>
        <div style={styles.metricItem}>
          <span style={styles.metricValue}>{formatLatency(service.metrics.latency)}</span>
          <span style={styles.metricLabel}>Latency</span>
        </div>
        {service.metrics.requestsPerMinute !== undefined && (
          <div style={styles.metricItem}>
            <span style={styles.metricValue}>{service.metrics.requestsPerMinute}</span>
            <span style={styles.metricLabel}>Req/min</span>
          </div>
        )}
        {service.metrics.errorRate !== undefined && (
          <div style={styles.metricItem}>
            <span style={{ ...styles.metricValue, color: service.metrics.errorRate > 1 ? '#ef4444' : '#10b981' }}>
              {service.metrics.errorRate.toFixed(2)}%
            </span>
            <span style={styles.metricLabel}>Error Rate</span>
          </div>
        )}
      </div>

      {activeIncident && (
        <div
          style={{
            ...styles.incidentBanner,
            background: activeIncident.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: activeIncident.severity === 'critical' ? '#ef4444' : '#f59e0b',
          }}
        >
          <AlertTriangle size={12} />
          {activeIncident.message}
        </div>
      )}

      {(onViewDetails || onRestart) && (
        <div style={styles.cardActions}>
          {onViewDetails && (
            <button style={{ ...styles.actionButton, ...styles.actionButtonPrimary }} onClick={onViewDetails}>
              <Activity size={14} />
              Details
            </button>
          )}
          {onRestart && service.health !== 'healthy' && (
            <button style={{ ...styles.actionButton, ...styles.actionButtonDanger }} onClick={onRestart}>
              <RefreshCw size={14} />
              Restart
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const ServiceStatus: React.FC<ServiceStatusProps> = ({
  services,
  overallHealth,
  lastUpdated,
  onRefresh,
  onViewDetails,
  onRestartService,
  className,
}) => {
  const healthConfig = HEALTH_CONFIG[overallHealth];

  const healthyCount = services.filter(s => s.health === 'healthy').length;
  const degradedCount = services.filter(s => s.health === 'degraded').length;
  const downCount = services.filter(s => s.health === 'down').length;

  const avgUptime = services.reduce((sum, s) => sum + s.metrics.uptime, 0) / services.length;
  const avgLatency = services.reduce((sum, s) => sum + s.metrics.latency, 0) / services.length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Activity size={22} />
          Service Status
        </h2>
        <div style={styles.headerActions}>
          <span style={styles.lastUpdated}>Last updated: {formatTimeAgo(lastUpdated)}</span>
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
          background: healthConfig.bgColor,
          borderColor: `${healthConfig.color}40`,
        }}
      >
        <div style={styles.overallInfo}>
          <div
            style={{
              ...styles.overallIcon,
              background: `${healthConfig.color}30`,
              color: healthConfig.color,
            }}
          >
            {overallHealth === 'healthy' ? <Wifi size={28} /> : <WifiOff size={28} />}
          </div>
          <div style={styles.overallText}>
            <span style={styles.overallLabel}>System Status</span>
            <span style={{ ...styles.overallValue, color: healthConfig.color }}>
              {healthConfig.label}
            </span>
          </div>
        </div>
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#10b981' }}>{healthyCount}</span>
            <span style={styles.statLabel}>Healthy</span>
          </div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#f59e0b' }}>{degradedCount}</span>
            <span style={styles.statLabel}>Degraded</span>
          </div>
          <div style={styles.statItem}>
            <span style={{ ...styles.statValue, color: '#ef4444' }}>{downCount}</span>
            <span style={styles.statLabel}>Down</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{avgUptime.toFixed(2)}%</span>
            <span style={styles.statLabel}>Avg Uptime</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{avgLatency.toFixed(0)}ms</span>
            <span style={styles.statLabel}>Avg Latency</span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div style={styles.grid}>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onViewDetails={onViewDetails ? () => onViewDetails(service.id) : undefined}
            onRestart={onRestartService ? () => onRestartService(service.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceStatus;
