import React, { useState } from 'react';
import { Settings, Users, Server, Database, Shield, Activity, AlertTriangle, CheckCircle, XCircle, RefreshCw, ChevronRight, MoreVertical } from 'lucide-react';

type ServiceStatus = 'running' | 'stopped' | 'error' | 'maintenance' | 'starting';

interface ServiceInfo {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime?: string;
  cpu?: number;
  memory?: number;
  requests?: number;
  errors?: number;
  lastRestart?: Date;
  version?: string;
}

interface ControlPanelCardProps {
  service: ServiceInfo;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onConfigure?: () => void;
  className?: string;
}

interface ControlPanelGridProps {
  services: ServiceInfo[];
  onServiceAction?: (serviceId: string, action: 'start' | 'stop' | 'restart' | 'configure') => void;
  className?: string;
}

interface SystemOverviewProps {
  totalServices: number;
  runningServices: number;
  errorServices: number;
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  avgResponseTime: number;
  className?: string;
}

const STATUS_CONFIG: Record<ServiceStatus, {
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactNode;
}> = {
  running: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    label: 'Running',
    icon: <CheckCircle size={14} />,
  },
  stopped: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    label: 'Stopped',
    icon: <XCircle size={14} />,
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    label: 'Error',
    icon: <AlertTriangle size={14} />,
  },
  maintenance: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Maintenance',
    icon: <Settings size={14} />,
  },
  starting: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    label: 'Starting',
    icon: <RefreshCw size={14} />,
  },
};

const styles: Record<string, React.CSSProperties> = {
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
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  version: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  metricLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  metricValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingTop: '0.75rem',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  },
  overview: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
  },
  overviewItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  overviewIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  overviewValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
  },
  overviewLabel: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.25rem',
  },
  menuButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};

export const ControlPanelCard: React.FC<ControlPanelCardProps> = ({
  service,
  onStart,
  onStop,
  onRestart,
  onConfigure,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const config = STATUS_CONFIG[service.status];

  const formatUptime = (uptime: string) => uptime;

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
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <div style={styles.icon}>
            <Server size={20} />
          </div>
          <div>
            <h3 style={styles.title}>{service.name}</h3>
            {service.version && (
              <span style={styles.version}>v{service.version}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              ...styles.statusBadge,
              background: config.bgColor,
              color: config.color,
            }}
          >
            {config.icon}
            {config.label}
          </span>
          <button
            style={styles.menuButton}
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div style={styles.metrics}>
        {service.uptime && (
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Uptime</span>
            <span style={styles.metricValue}>{formatUptime(service.uptime)}</span>
          </div>
        )}
        {service.cpu !== undefined && (
          <div style={styles.metric}>
            <span style={styles.metricLabel}>CPU</span>
            <span style={styles.metricValue}>{service.cpu}%</span>
          </div>
        )}
        {service.memory !== undefined && (
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Memory</span>
            <span style={styles.metricValue}>{service.memory}%</span>
          </div>
        )}
        {service.requests !== undefined && (
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Requests</span>
            <span style={styles.metricValue}>{service.requests.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div style={styles.actions}>
        {service.status === 'stopped' && onStart && (
          <button
            style={{ ...styles.actionButton, ...styles.actionButtonPrimary }}
            onClick={onStart}
          >
            <Activity size={14} />
            Start
          </button>
        )}
        {service.status === 'running' && onStop && (
          <button
            style={{ ...styles.actionButton, ...styles.actionButtonDanger }}
            onClick={onStop}
          >
            <XCircle size={14} />
            Stop
          </button>
        )}
        {service.status === 'running' && onRestart && (
          <button style={styles.actionButton} onClick={onRestart}>
            <RefreshCw size={14} />
            Restart
          </button>
        )}
        {onConfigure && (
          <button style={styles.actionButton} onClick={onConfigure}>
            <Settings size={14} />
            Configure
          </button>
        )}
      </div>
    </div>
  );
};

export const ControlPanelGrid: React.FC<ControlPanelGridProps> = ({
  services,
  onServiceAction,
  className,
}) => (
  <div style={styles.grid} className={className}>
    {services.map((service) => (
      <ControlPanelCard
        key={service.id}
        service={service}
        onStart={onServiceAction ? () => onServiceAction(service.id, 'start') : undefined}
        onStop={onServiceAction ? () => onServiceAction(service.id, 'stop') : undefined}
        onRestart={onServiceAction ? () => onServiceAction(service.id, 'restart') : undefined}
        onConfigure={onServiceAction ? () => onServiceAction(service.id, 'configure') : undefined}
      />
    ))}
  </div>
);

export const SystemOverview: React.FC<SystemOverviewProps> = ({
  totalServices,
  runningServices,
  errorServices,
  totalUsers,
  activeUsers,
  totalRequests,
  avgResponseTime,
  className,
}) => (
  <div style={styles.overview} className={className}>
    <div style={styles.overviewItem}>
      <div style={{ ...styles.overviewIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
        <Server size={24} />
      </div>
      <span style={styles.overviewValue}>{runningServices}/{totalServices}</span>
      <span style={styles.overviewLabel}>Services Running</span>
    </div>
    <div style={styles.overviewItem}>
      <div style={{ ...styles.overviewIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
        <Users size={24} />
      </div>
      <span style={styles.overviewValue}>{activeUsers.toLocaleString()}</span>
      <span style={styles.overviewLabel}>Active Users</span>
    </div>
    <div style={styles.overviewItem}>
      <div style={{ ...styles.overviewIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
        <Activity size={24} />
      </div>
      <span style={styles.overviewValue}>{totalRequests.toLocaleString()}</span>
      <span style={styles.overviewLabel}>Total Requests</span>
    </div>
    <div style={styles.overviewItem}>
      <div style={{ ...styles.overviewIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
        <AlertTriangle size={24} />
      </div>
      <span style={styles.overviewValue}>{avgResponseTime}ms</span>
      <span style={styles.overviewLabel}>Avg Response</span>
    </div>
  </div>
);

export default ControlPanelCard;
