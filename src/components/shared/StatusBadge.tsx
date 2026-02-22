import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader, Wifi, WifiOff } from 'lucide-react';

type StatusType = 'online' | 'offline' | 'pending' | 'error' | 'success' | 'warning' | 'loading' | 'idle';
type BadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showDot?: boolean;
  showIcon?: boolean;
  size?: BadgeSize;
  pulse?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  defaultLabel: string;
}> = {
  online: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    icon: <Wifi size={12} />,
    defaultLabel: 'Online',
  },
  offline: {
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.3)',
    icon: <WifiOff size={12} />,
    defaultLabel: 'Offline',
  },
  pending: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    icon: <Clock size={12} />,
    defaultLabel: 'Pending',
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    icon: <XCircle size={12} />,
    defaultLabel: 'Error',
  },
  success: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    icon: <CheckCircle size={12} />,
    defaultLabel: 'Success',
  },
  warning: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    icon: <AlertCircle size={12} />,
    defaultLabel: 'Warning',
  },
  loading: {
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    icon: <Loader size={12} className="animate-spin" />,
    defaultLabel: 'Loading',
  },
  idle: {
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.1)',
    borderColor: 'rgba(156, 163, 175, 0.3)',
    icon: <Clock size={12} />,
    defaultLabel: 'Idle',
  },
};

const SIZE_CONFIG: Record<BadgeSize, {
  padding: string;
  fontSize: string;
  dotSize: string;
  iconSize: number;
  gap: string;
}> = {
  sm: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.7rem',
    dotSize: '6px',
    iconSize: 10,
    gap: '0.25rem',
  },
  md: {
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    dotSize: '8px',
    iconSize: 12,
    gap: '0.375rem',
  },
  lg: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    dotSize: '10px',
    iconSize: 14,
    gap: '0.5rem',
  },
};

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '9999px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  dot: {
    borderRadius: '50%',
    flexShrink: 0,
  },
  dotPulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  icon: {
    flexShrink: 0,
  },
  label: {
    whiteSpace: 'nowrap',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showDot = true,
  showIcon = false,
  size = 'md',
  pulse = false,
  className,
}) => {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];

  const shouldPulse = pulse || status === 'loading' || status === 'pending';

  return (
    <span
      style={{
        ...styles.badge,
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        gap: sizeConfig.gap,
        color: config.color,
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
      className={className}
      role="status"
      aria-label={label || config.defaultLabel}
    >
      {showDot && !showIcon && (
        <span
          style={{
            ...styles.dot,
            ...(shouldPulse ? styles.dotPulse : {}),
            width: sizeConfig.dotSize,
            height: sizeConfig.dotSize,
            background: config.color,
            boxShadow: shouldPulse ? `0 0 0 2px ${config.bgColor}` : 'none',
          }}
        />
      )}
      {showIcon && (
        <span style={styles.icon}>
          {React.cloneElement(config.icon as React.ReactElement, {
            size: sizeConfig.iconSize,
          })}
        </span>
      )}
      <span style={styles.label}>{label || config.defaultLabel}</span>
    </span>
  );
};

// Dot-only variant for compact displays
export const StatusDot: React.FC<{
  status: StatusType;
  size?: BadgeSize;
  pulse?: boolean;
  title?: string;
}> = ({ status, size = 'md', pulse = false, title }) => {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const shouldPulse = pulse || status === 'loading' || status === 'pending';

  return (
    <span
      style={{
        ...styles.dot,
        ...(shouldPulse ? styles.dotPulse : {}),
        width: sizeConfig.dotSize,
        height: sizeConfig.dotSize,
        background: config.color,
        boxShadow: shouldPulse ? `0 0 0 2px ${config.bgColor}` : 'none',
        display: 'inline-block',
      }}
      title={title || config.defaultLabel}
      role="status"
      aria-label={title || config.defaultLabel}
    />
  );
};

export default StatusBadge;
