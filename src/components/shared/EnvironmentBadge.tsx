import React, { useState } from 'react';
import { Server, Cloud, Code, AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react';

type Environment = 'production' | 'staging' | 'development' | 'local' | 'preview';

interface EnvironmentBadgeProps {
  environment: Environment;
  version?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

interface EnvironmentSelectorProps {
  environments: { id: Environment; label: string; url?: string }[];
  current: Environment;
  onChange: (env: Environment) => void;
  className?: string;
}

interface EnvironmentBannerProps {
  environment: Environment;
  message?: string;
  showDismiss?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const ENV_CONFIG: Record<Environment, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}> = {
  production: {
    label: 'Production',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    icon: <CheckCircle size={14} />,
  },
  staging: {
    label: 'Staging',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    icon: <Server size={14} />,
  },
  development: {
    label: 'Development',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    icon: <Code size={14} />,
  },
  local: {
    label: 'Local',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    icon: <Code size={14} />,
  },
  preview: {
    label: 'Preview',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    icon: <Cloud size={14} />,
  },
};

const SIZE_CONFIG = {
  sm: { padding: '0.125rem 0.375rem', fontSize: '0.625rem', iconSize: 10 },
  md: { padding: '0.25rem 0.5rem', fontSize: '0.6875rem', iconSize: 12 },
  lg: { padding: '0.375rem 0.75rem', fontSize: '0.75rem', iconSize: 14 },
};

const styles: Record<string, React.CSSProperties> = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    borderRadius: '4px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    transition: 'all 0.15s',
  },
  badgeClickable: {
    cursor: 'pointer',
  },
  version: {
    opacity: 0.7,
    fontWeight: '500',
    marginLeft: '0.25rem',
  },
  selector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  selectorOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 0.875rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  selectorOptionHover: {
    background: 'rgba(255, 255, 255, 0.05)',
  },
  selectorOptionActive: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    background: 'rgba(99, 102, 241, 0.1)',
  },
  selectorIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorInfo: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#fff',
  },
  selectorUrl: {
    fontSize: '0.75rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  selectorCheck: {
    color: '#6366f1',
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
    fontWeight: '500',
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
  indicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
  },
  indicatorDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  indicatorLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  indicatorValue: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#fff',
  },
};

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({
  environment,
  version,
  showIcon = true,
  size = 'md',
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const config = ENV_CONFIG[environment];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <span
      style={{
        ...styles.badge,
        ...(onClick ? styles.badgeClickable : {}),
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        background: config.bgColor,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
        transform: isHovered && onClick ? 'scale(1.05)' : 'scale(1)',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      {showIcon && config.icon}
      {config.label}
      {version && <span style={styles.version}>v{version}</span>}
    </span>
  );
};

export const EnvironmentSelector: React.FC<EnvironmentSelectorProps> = ({
  environments,
  current,
  onChange,
  className,
}) => {
  const [hoveredEnv, setHoveredEnv] = useState<Environment | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyUrl = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div style={styles.selector} className={className}>
      {environments.map((env) => {
        const config = ENV_CONFIG[env.id];
        const isActive = env.id === current;
        const isHovered = env.id === hoveredEnv;

        return (
          <div
            key={env.id}
            style={{
              ...styles.selectorOption,
              ...(isHovered ? styles.selectorOptionHover : {}),
              ...(isActive ? styles.selectorOptionActive : {}),
            }}
            onClick={() => onChange(env.id)}
            onMouseEnter={() => setHoveredEnv(env.id)}
            onMouseLeave={() => setHoveredEnv(null)}
          >
            <div
              style={{
                ...styles.selectorIcon,
                background: config.bgColor,
                color: config.color,
              }}
            >
              {config.icon}
            </div>
            <div style={styles.selectorInfo}>
              <div style={styles.selectorLabel}>{env.label}</div>
              {env.url && (
                <div style={styles.selectorUrl}>
                  {env.url}
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      padding: '0 0.25rem',
                      marginLeft: '0.25rem',
                    }}
                    onClick={(e) => handleCopyUrl(env.url!, e)}
                    title="Copy URL"
                  >
                    {copiedUrl === env.url ? <Check size={10} /> : <Copy size={10} />}
                  </button>
                </div>
              )}
            </div>
            {isActive && (
              <span style={styles.selectorCheck}>
                <CheckCircle size={16} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const EnvironmentBanner: React.FC<EnvironmentBannerProps> = ({
  environment,
  message,
  showDismiss = false,
  onDismiss,
  className,
}) => {
  const config = ENV_CONFIG[environment];

  if (environment === 'production') return null;

  const defaultMessages: Record<Environment, string> = {
    production: '',
    staging: 'You are viewing the staging environment',
    development: 'You are viewing the development environment',
    local: 'You are running locally',
    preview: 'You are viewing a preview deployment',
  };

  return (
    <div
      style={{
        ...styles.banner,
        background: config.bgColor,
        color: config.color,
        borderBottom: `1px solid ${config.borderColor}`,
      }}
      className={className}
    >
      <AlertTriangle size={14} />
      {message || defaultMessages[environment]}
      {showDismiss && onDismiss && (
        <button style={styles.bannerDismiss} onClick={onDismiss}>
          ✕
        </button>
      )}
    </div>
  );
};

// Environment indicator for status displays
interface EnvironmentIndicatorProps {
  environment: Environment;
  label?: string;
  className?: string;
}

export const EnvironmentIndicator: React.FC<EnvironmentIndicatorProps> = ({
  environment,
  label = 'Environment',
  className,
}) => {
  const config = ENV_CONFIG[environment];

  return (
    <div style={styles.indicator} className={className}>
      <div style={{ ...styles.indicatorDot, background: config.color }} />
      <span style={styles.indicatorLabel}>{label}:</span>
      <span style={styles.indicatorValue}>{config.label}</span>
    </div>
  );
};

export default EnvironmentBadge;
