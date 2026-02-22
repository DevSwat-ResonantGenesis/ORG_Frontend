import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const VARIANT_CONFIG: Record<AlertVariant, {
  icon: React.ReactNode;
  bg: string;
  border: string;
  iconColor: string;
  titleColor: string;
  textColor: string;
}> = {
  info: {
    icon: <Info size={20} />,
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    iconColor: '#3b82f6',
    titleColor: '#60a5fa',
    textColor: '#93c5fd',
  },
  success: {
    icon: <CheckCircle size={20} />,
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    iconColor: '#10b981',
    titleColor: '#34d399',
    textColor: '#6ee7b7',
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    iconColor: '#f59e0b',
    titleColor: '#fbbf24',
    textColor: '#fcd34d',
  },
  error: {
    icon: <AlertCircle size={20} />,
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
    iconColor: '#ef4444',
    titleColor: '#f87171',
    textColor: '#fca5a5',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '10px',
    border: '1px solid',
  },
  icon: {
    flexShrink: 0,
    marginTop: '0.125rem',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  text: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.75rem',
  },
  actionButton: {
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  },
  dismissButton: {
    background: 'transparent',
    border: 'none',
    padding: '0.25rem',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  showIcon = true,
  dismissible = false,
  onDismiss,
  action,
  className,
}) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      style={{
        ...styles.container,
        background: config.bg,
        borderColor: config.border,
      }}
      className={className}
      role="alert"
    >
      {showIcon && (
        <span style={{ ...styles.icon, color: config.iconColor }}>
          {icon || config.icon}
        </span>
      )}

      <div style={styles.content}>
        {title && (
          <div style={{ ...styles.title, color: config.titleColor }}>
            {title}
          </div>
        )}
        <div style={{ ...styles.text, color: config.textColor }}>
          {children}
        </div>

        {action && (
          <div style={styles.actions}>
            <button
              style={{
                ...styles.actionButton,
                background: config.iconColor,
                color: '#fff',
              }}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      {dismissible && onDismiss && (
        <button
          style={{ ...styles.dismissButton, color: config.textColor }}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

// Inline Alert for compact notifications
interface InlineAlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  variant = 'info',
  children,
  className,
}) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.75rem',
        borderRadius: '6px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        fontSize: '0.8125rem',
        color: config.textColor,
      }}
      className={className}
      role="alert"
    >
      <span style={{ color: config.iconColor, display: 'flex' }}>
        {React.cloneElement(config.icon as React.ReactElement, { size: 14 })}
      </span>
      {children}
    </div>
  );
};

// Banner Alert for full-width notifications
interface BannerAlertProps extends AlertProps {
  centered?: boolean;
}

export const BannerAlert: React.FC<BannerAlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  showIcon = true,
  dismissible = false,
  onDismiss,
  action,
  centered = false,
  className,
}) => {
  const config = VARIANT_CONFIG[variant];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: centered ? 'center' : 'flex-start',
        gap: '1rem',
        padding: '0.75rem 1rem',
        background: config.bg,
        borderBottom: `1px solid ${config.border}`,
      }}
      className={className}
      role="alert"
    >
      {showIcon && (
        <span style={{ color: config.iconColor, display: 'flex' }}>
          {icon || config.icon}
        </span>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        {title && (
          <span
            style={{
              fontWeight: '600',
              color: config.titleColor,
              fontSize: '0.875rem',
            }}
          >
            {title}
          </span>
        )}
        <span style={{ color: config.textColor, fontSize: '0.875rem' }}>
          {children}
        </span>
      </div>

      {action && (
        <button
          style={{
            ...styles.actionButton,
            background: 'transparent',
            border: `1px solid ${config.border}`,
            color: config.titleColor,
            marginLeft: 'auto',
          }}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}

      {dismissible && onDismiss && (
        <button
          style={{
            ...styles.dismissButton,
            color: config.textColor,
            marginLeft: action ? '0' : 'auto',
          }}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;
