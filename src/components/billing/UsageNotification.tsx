import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X, Zap, TrendingUp, CreditCard } from 'lucide-react';
import { getUsageSummary, formatTokens } from '../../api/billing';

interface UsageNotificationProps {
  onDismiss?: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    zIndex: 1000,
    maxWidth: '380px',
    animation: 'slideIn 0.3s ease',
  },
  notification: {
    background: 'rgba(15, 15, 20, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '0.75rem',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'flex-start',
    flex: 1,
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#888',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  progressSection: {
    marginBottom: '1rem',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '0.35rem',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  button: {
    flex: 1,
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    color: '#fff',
  },
  secondaryBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
  },
  warning: {
    borderLeft: '3px solid #f59e0b',
  },
  danger: {
    borderLeft: '3px solid #ef4444',
  },
  success: {
    borderLeft: '3px solid #10b981',
  },
};

type NotificationType = 'warning' | 'danger' | 'success' | 'info';

export default function UsageNotification({ onDismiss }: UsageNotificationProps) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [usagePercent, setUsagePercent] = useState(0);
  const [tokensUsed, setTokensUsed] = useState(0);
  const [tokenLimit, setTokenLimit] = useState<number | 'unlimited'>(0);
  const [notificationType, setNotificationType] = useState<NotificationType>('info');

  useEffect(() => {
    checkUsage();
    // Check every 5 minutes
    const interval = setInterval(checkUsage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkUsage = async () => {
    try {
      const usage = await getUsageSummary();
      setUsagePercent(usage.usage_percent);
      setTokensUsed(usage.tokens_used);
      setTokenLimit(usage.token_limit);

      // Show notification based on usage level
      if (usage.usage_percent >= 90) {
        setNotificationType('danger');
        setVisible(true);
      } else if (usage.usage_percent >= 80) {
        setNotificationType('warning');
        setVisible(true);
      } else {
        setVisible(false);
      }
    } catch (error) {
      console.error('Failed to check usage:', error);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const getConfig = () => {
    switch (notificationType) {
      case 'danger':
        return {
          style: styles.danger,
          iconBg: 'rgba(239,68,68,0.15)',
          iconColor: '#ef4444',
          progressColor: '#ef4444',
          title: 'Token Limit Critical',
          subtitle: 'You may run out of tokens soon',
        };
      case 'warning':
        return {
          style: styles.warning,
          iconBg: 'rgba(245,158,11,0.15)',
          iconColor: '#f59e0b',
          progressColor: '#f59e0b',
          title: 'Token Usage High',
          subtitle: 'Consider upgrading or purchasing more',
        };
      default:
        return {
          style: {},
          iconBg: 'rgba(99,102,241,0.15)',
          iconColor: '#6366f1',
          progressColor: '#6366f1',
          title: 'Token Usage',
          subtitle: 'Your current usage status',
        };
    }
  };

  if (!visible) return null;

  const config = getConfig();

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
      <div style={{ ...styles.notification, ...config.style }}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div style={{ ...styles.iconWrapper, background: config.iconBg }}>
              <AlertTriangle size={20} color={config.iconColor} />
            </div>
            <div>
              <div style={styles.title}>{config.title}</div>
              <div style={styles.subtitle}>{config.subtitle}</div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={handleDismiss}>
            <X size={16} />
          </button>
        </div>

        <div style={styles.progressSection}>
          <div style={styles.progressLabel}>
            <span>{formatTokens(tokensUsed)} used</span>
            <span>{usagePercent.toFixed(1)}%</span>
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${Math.min(usagePercent, 100)}%`,
                background: config.progressColor,
              }}
            />
          </div>
          <div style={{ ...styles.progressLabel, marginTop: '0.35rem' }}>
            <span style={{ color: '#666' }}>
              {formatTokens(typeof tokenLimit === 'number' ? tokenLimit - tokensUsed : 0)} remaining
            </span>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            style={{ ...styles.button, ...styles.primaryBtn }}
            onClick={() => navigate('/pricing')}
          >
            <TrendingUp size={14} /> Upgrade
          </button>
          <button
            style={{ ...styles.button, ...styles.secondaryBtn }}
            onClick={() => navigate('/billing')}
          >
            <CreditCard size={14} /> Buy Tokens
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast-style notification for quick alerts
export function UsageToast({ 
  message, 
  type = 'info',
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'warning' | 'error' | 'info';
  onClose?: () => void;
}) {
  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: '#10b981', icon: '#10b981' },
    warning: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', icon: '#f59e0b' },
    error: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', icon: '#ef4444' },
    info: { bg: 'rgba(99,102,241,0.15)', border: '#6366f1', icon: '#6366f1' },
  };

  const config = colors[type];

  return (
    <div style={{
      position: 'fixed',
      top: '1.5rem',
      right: '1.5rem',
      zIndex: 1001,
      background: 'rgba(15,15,20,0.95)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${config.border}`,
      borderRadius: '12px',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      animation: 'slideIn 0.3s ease',
    }}>
      <Zap size={18} color={config.icon} />
      <span style={{ color: '#fff', fontSize: '0.875rem' }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            padding: '0.25rem',
            marginLeft: '0.5rem',
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// Hook for usage checking
export function useUsageCheck() {
  const [canExecute, setCanExecute] = useState(true);
  const [usagePercent, setUsagePercent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUsage();
  }, []);

  const checkUsage = async () => {
    setLoading(true);
    try {
      const usage = await getUsageSummary();
      setUsagePercent(usage.usage_percent);
      setCanExecute(usage.usage_percent < 100 || usage.overage_enabled);
    } catch (error) {
      console.error('Usage check failed:', error);
      setCanExecute(true); // Allow execution if check fails
    } finally {
      setLoading(false);
    }
  };

  return { canExecute, usagePercent, loading, refresh: checkUsage };
}
