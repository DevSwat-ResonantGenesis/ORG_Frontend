import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error' | 'reconnecting';

interface ConnectionStatusProps {
  state: ConnectionState;
  latency?: number;
  lastConnected?: Date;
  onReconnect?: () => void;
  showLatency?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface ConnectionIndicatorProps {
  state: ConnectionState;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

interface ConnectionBannerProps {
  state: ConnectionState;
  message?: string;
  onReconnect?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const STATE_CONFIG: Record<ConnectionState, {
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactNode;
}> = {
  connected: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    label: 'Connected',
    icon: <Wifi size={14} />,
  },
  connecting: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    label: 'Connecting',
    icon: <RefreshCw size={14} />,
  },
  disconnected: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    label: 'Disconnected',
    icon: <WifiOff size={14} />,
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    label: 'Connection Error',
    icon: <AlertCircle size={14} />,
  },
  reconnecting: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Reconnecting',
    icon: <RefreshCw size={14} />,
  },
};

const SIZE_CONFIG = {
  sm: { dotSize: 6, fontSize: '0.6875rem', iconSize: 12, padding: '0.25rem 0.5rem' },
  md: { dotSize: 8, fontSize: '0.75rem', iconSize: 14, padding: '0.375rem 0.625rem' },
  lg: { dotSize: 10, fontSize: '0.8125rem', iconSize: 16, padding: '0.5rem 0.75rem' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderRadius: '6px',
  },
  dot: {
    borderRadius: '50%',
    flexShrink: 0,
  },
  dotPulse: {
    animation: 'pulse 2s infinite',
  },
  label: {
    fontWeight: '500',
  },
  latency: {
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  reconnectButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    transition: 'all 0.15s',
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '0.625rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: '500',
  },
  bannerButton: {
    padding: '0.25rem 0.625rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '4px',
    color: 'inherit',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  bannerDismiss: {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    opacity: 0.7,
    cursor: 'pointer',
    padding: '0.25rem',
    marginLeft: '0.5rem',
  },
  statusCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
  },
  statusIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  statusMeta: {
    fontSize: '0.75rem',
    color: '#888',
  },
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  state,
  latency,
  lastConnected,
  onReconnect,
  showLatency = true,
  showLabel = true,
  size = 'md',
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = STATE_CONFIG[state];
  const sizeConfig = SIZE_CONFIG[size];

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatLastConnected = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  return (
    <div
      style={{
        ...styles.container,
        padding: sizeConfig.padding,
        background: config.bgColor,
        border: `1px solid ${config.color}33`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div
        style={{
          ...styles.dot,
          width: sizeConfig.dotSize,
          height: sizeConfig.dotSize,
          background: config.color,
          boxShadow: state === 'connected' ? `0 0 8px ${config.color}` : 'none',
        }}
      />

      {showLabel && (
        <span
          style={{
            ...styles.label,
            fontSize: sizeConfig.fontSize,
            color: config.color,
          }}
        >
          {config.label}
        </span>
      )}

      {showLatency && latency !== undefined && state === 'connected' && (
        <span style={{ ...styles.latency, fontSize: sizeConfig.fontSize }}>
          {formatLatency(latency)}
        </span>
      )}

      {state === 'disconnected' && lastConnected && (
        <span style={{ ...styles.latency, fontSize: sizeConfig.fontSize }}>
          {formatLastConnected(lastConnected)}
        </span>
      )}

      {(state === 'disconnected' || state === 'error') && onReconnect && isHovered && (
        <button
          style={styles.reconnectButton}
          onClick={onReconnect}
          title="Reconnect"
        >
          <RefreshCw size={sizeConfig.iconSize} />
        </button>
      )}
    </div>
  );
};

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  state,
  size = 'md',
  animate = true,
  className,
}) => {
  const config = STATE_CONFIG[state];
  const sizeConfig = SIZE_CONFIG[size];
  const isAnimating = animate && (state === 'connecting' || state === 'reconnecting');

  return (
    <div
      style={{
        ...styles.indicator,
        width: sizeConfig.dotSize * 2,
        height: sizeConfig.dotSize * 2,
      }}
      title={config.label}
      className={className}
    >
      <div
        style={{
          width: sizeConfig.dotSize,
          height: sizeConfig.dotSize,
          borderRadius: '50%',
          background: config.color,
          boxShadow: state === 'connected' ? `0 0 8px ${config.color}` : 'none',
          animation: isAnimating ? 'pulse 1.5s infinite' : 'none',
        }}
      />
    </div>
  );
};

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  state,
  message,
  onReconnect,
  onDismiss,
  className,
}) => {
  const config = STATE_CONFIG[state];

  if (state === 'connected') return null;

  const defaultMessages: Record<ConnectionState, string> = {
    connected: '',
    connecting: 'Establishing connection...',
    disconnected: 'You are currently offline',
    error: 'Connection error occurred',
    reconnecting: 'Attempting to reconnect...',
  };

  return (
    <div
      style={{
        ...styles.banner,
        background: config.bgColor,
        color: config.color,
        borderBottom: `1px solid ${config.color}33`,
      }}
      className={className}
    >
      {config.icon}
      {message || defaultMessages[state]}

      {(state === 'disconnected' || state === 'error') && onReconnect && (
        <button style={styles.bannerButton} onClick={onReconnect}>
          Reconnect
        </button>
      )}

      {onDismiss && (
        <button style={styles.bannerDismiss} onClick={onDismiss}>
          ✕
        </button>
      )}
    </div>
  );
};

// Connection status card for settings/status pages
interface ConnectionStatusCardProps {
  state: ConnectionState;
  serviceName: string;
  endpoint?: string;
  latency?: number;
  lastChecked?: Date;
  onCheck?: () => void;
  className?: string;
}

export const ConnectionStatusCard: React.FC<ConnectionStatusCardProps> = ({
  state,
  serviceName,
  endpoint,
  latency,
  lastChecked,
  onCheck,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = STATE_CONFIG[state];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={styles.statusCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div
        style={{
          ...styles.statusIcon,
          background: config.bgColor,
          color: config.color,
        }}
      >
        {config.icon}
      </div>

      <div style={styles.statusInfo}>
        <div style={styles.statusLabel}>{serviceName}</div>
        <div style={styles.statusMeta}>
          {endpoint && <span>{endpoint}</span>}
          {latency !== undefined && state === 'connected' && (
            <span> • {latency}ms</span>
          )}
          {lastChecked && <span> • Checked {formatTime(lastChecked)}</span>}
        </div>
      </div>

      <ConnectionIndicator state={state} />

      {onCheck && isHovered && (
        <button
          style={{
            ...styles.reconnectButton,
            background: 'rgba(255, 255, 255, 0.05)',
          }}
          onClick={onCheck}
          title="Check connection"
        >
          <RefreshCw size={14} />
        </button>
      )}
    </div>
  );
};

// Hook for managing connection state
export const useConnectionStatus = (
  checkFn: () => Promise<boolean>,
  interval: number = 30000
) => {
  const [state, setState] = useState<ConnectionState>('connecting');
  const [latency, setLatency] = useState<number | undefined>();
  const [lastConnected, setLastConnected] = useState<Date | undefined>();

  const check = async () => {
    const start = Date.now();
    try {
      const connected = await checkFn();
      const elapsed = Date.now() - start;

      if (connected) {
        setState('connected');
        setLatency(elapsed);
        setLastConnected(new Date());
      } else {
        setState('disconnected');
      }
    } catch {
      setState('error');
    }
  };

  useEffect(() => {
    check();
    const timer = setInterval(check, interval);
    return () => clearInterval(timer);
  }, [interval]);

  const reconnect = () => {
    setState('reconnecting');
    check();
  };

  return { state, latency, lastConnected, reconnect, check };
};

export default ConnectionStatus;
