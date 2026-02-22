import React, { useState } from 'react';
import { Info, AlertCircle, CheckCircle, AlertTriangle, Lightbulb, X, ChevronDown, ChevronUp } from 'lucide-react';

type InfoCardVariant = 'info' | 'success' | 'warning' | 'error' | 'tip' | 'note';

interface InfoCardProps {
  variant?: InfoCardVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const VARIANT_CONFIG: Record<InfoCardVariant, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  info: {
    icon: <Info size={18} />,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  success: {
    icon: <CheckCircle size={18} />,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  error: {
    icon: <AlertCircle size={18} />,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  tip: {
    icon: <Lightbulb size={18} />,
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  note: {
    icon: <Info size={18} />,
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    borderRadius: '10px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
  },
  headerClickable: {
    cursor: 'pointer',
  },
  icon: {
    flexShrink: 0,
  },
  titleRow: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: 0,
  },
  title: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    flexShrink: 0,
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonHover: {
    color: '#fff',
    background: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: '0 1rem 0.875rem 2.75rem',
    fontSize: '0.8125rem',
    color: '#ccc',
    lineHeight: 1.6,
  },
  contentNoTitle: {
    padding: '0 1rem 0.875rem 1rem',
  },
  contentCollapsed: {
    display: 'none',
  },
};

export const InfoCard: React.FC<InfoCardProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  collapsible = false,
  defaultCollapsed = false,
  onDismiss,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const config = VARIANT_CONFIG[variant];

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
      }}
      className={className}
    >
      <div
        style={{
          ...styles.header,
          ...(collapsible ? styles.headerClickable : {}),
        }}
        onClick={handleToggle}
      >
        <span style={{ ...styles.icon, color: config.color }}>
          {icon || config.icon}
        </span>

        <div style={styles.titleRow}>
          {title && <h4 style={styles.title}>{title}</h4>}
          {!title && !collapsible && (
            <div style={{ ...styles.content, padding: 0 }}>{children}</div>
          )}
        </div>

        <div style={styles.actions}>
          {collapsible && (
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'collapse' ? styles.actionButtonHover : {}),
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              onMouseEnter={() => setHoveredAction('collapse')}
              onMouseLeave={() => setHoveredAction(null)}
            >
              {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
          {dismissible && (
            <button
              style={{
                ...styles.actionButton,
                ...(hoveredAction === 'dismiss' ? styles.actionButtonHover : {}),
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              onMouseEnter={() => setHoveredAction('dismiss')}
              onMouseLeave={() => setHoveredAction(null)}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {title && (
        <div
          style={{
            ...styles.content,
            ...(isCollapsed ? styles.contentCollapsed : {}),
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Callout variant for documentation
interface CalloutProps {
  type?: 'note' | 'tip' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Callout: React.FC<CalloutProps> = ({
  type = 'note',
  title,
  children,
  className,
}) => {
  const variantMap: Record<string, InfoCardVariant> = {
    note: 'note',
    tip: 'tip',
    warning: 'warning',
    danger: 'error',
  };

  const defaultTitles: Record<string, string> = {
    note: 'Note',
    tip: 'Tip',
    warning: 'Warning',
    danger: 'Danger',
  };

  return (
    <InfoCard
      variant={variantMap[type]}
      title={title || defaultTitles[type]}
      className={className}
    >
      {children}
    </InfoCard>
  );
};

// Feature highlight card
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        padding: '1.25rem',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        transition: 'all 0.2s',
        ...(isHovered ? { borderColor: 'rgba(99, 102, 241, 0.3)' } : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(99, 102, 241, 0.15)',
          borderRadius: '10px',
          color: '#818cf8',
          marginBottom: '1rem',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#fff',
          margin: '0 0 0.5rem 0',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.8125rem',
          color: '#888',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        {description}
      </p>
      {action && (
        <button
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '6px',
            color: '#818cf8',
            fontSize: '0.8125rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default InfoCard;
