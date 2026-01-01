import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { getUsageSummary, formatTokens, UsageSummary } from '../../api/billing';

interface UsageIndicatorProps {
  compact?: boolean;
  showDropdown?: boolean;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonHover: {
    background: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  iconWrapper: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: '0.65rem',
    color: '#888',
    lineHeight: 1,
  },
  value: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff',
    lineHeight: 1.2,
  },
  progressMini: {
    width: '60px',
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '0.25rem',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '320px',
    background: 'rgba(15,15,20,0.98)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  dropdownTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  planBadge: {
    fontSize: '0.65rem',
    padding: '0.25rem 0.5rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    borderRadius: '12px',
    fontWeight: '500',
  },
  usageSection: {
    marginBottom: '1rem',
  },
  usageRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  usageLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  usageValue: {
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.35rem',
  },
  breakdown: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  breakdownItem: {
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '10px',
  },
  breakdownValue: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.15rem',
  },
  breakdownLabel: {
    fontSize: '0.65rem',
    color: '#666',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    flex: 1,
    padding: '0.625rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
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
  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '10px',
    marginBottom: '1rem',
    fontSize: '0.75rem',
  },
  alertWarning: {
    background: 'rgba(245,158,11,0.1)',
    border: '1px solid rgba(245,158,11,0.2)',
    color: '#f59e0b',
  },
  alertDanger: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#ef4444',
  },
};

export default function UsageIndicator({ compact = false, showDropdown = true }: UsageIndicatorProps) {
  const navigate = useNavigate();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    loadUsage();
    const interval = setInterval(loadUsage, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const planTier = usage?.plan_tier || 'free';
      if (!target.closest('[data-usage-indicator]')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadUsage = async () => {
    try {
      const data = await getUsageSummary();
      setUsage(data);
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 70) return '#f59e0b';
    return '#10b981';
  };

  const getIconColor = (percent: number) => {
    if (percent >= 90) return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' };
    if (percent >= 70) return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' };
    return { bg: 'rgba(99,102,241,0.15)', color: '#6366f1' };
  };

  if (!usage) return null;

  const iconConfig = getIconColor(usage?.usage_percent || 0);
  const progressColor = getProgressColor(usage?.usage_percent || 0);

  return (
    <div style={styles.container} data-usage-indicator>
      <button
        style={{
          ...styles.button,
          ...(isHovered ? styles.buttonHover : {}),
        }}
        onClick={() => showDropdown && setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ ...styles.iconWrapper, background: iconConfig.bg }}>
          <Zap size={16} color={iconConfig.color} />
        </div>
        
        {!compact && (
          <div style={styles.content}>
            <span style={styles.label}>Tokens</span>
            <span style={styles.value}>{formatTokens(usage?.tokens_used || 0)}</span>
            <div style={styles.progressMini}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(usage?.usage_percent || 0, 100)}%`,
                  background: progressColor,
                }}
              />
            </div>
          </div>
        )}

        {showDropdown && (
          <ChevronDown
            size={14}
            color="#888"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && showDropdown && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <span style={styles.dropdownTitle}>Usage Overview</span>
            <span style={styles.planBadge}>{usage?.plan_tier?.toUpperCase() || 'FREE'}</span>
          </div>

          {/* Alert if high usage */}
          {(usage?.usage_percent || 0) >= 80 && (
            <div style={{
              ...styles.alert,
              ...((usage?.usage_percent || 0) >= 90 ? styles.alertDanger : styles.alertWarning),
            }}>
              <AlertTriangle size={14} />
              {(usage?.usage_percent || 0) >= 90
                ? 'Critical: Token limit almost reached!'
                : 'Warning: High token usage'}
            </div>
          )}

          {/* Main Usage */}
          <div style={styles.usageSection}>
            <div style={styles.usageRow}>
              <span style={styles.usageLabel}>Platform Tokens</span>
              <span style={styles.usageValue}>
                {formatTokens(usage?.tokens_used || 0)} / {formatTokens(usage?.token_limit || 0)}
              </span>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(usage?.usage_percent || 0, 100)}%`,
                  background: progressColor,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#666' }}>
              <span>{(usage?.usage_percent || 0).toFixed(1)}% used</span>
              <span>{formatTokens(typeof usage?.token_limit === 'number' && typeof usage?.tokens_used === 'number' ? usage.token_limit - usage.tokens_used : 0)} remaining</span>
            </div>
          </div>

          {/* Breakdown */}
          <div style={styles.breakdown}>
            <div style={styles.breakdownItem}>
              <div style={styles.breakdownValue}>{(usage?.breakdown as any)?.agent_executions?.count || 0}</div>
              <div style={styles.breakdownLabel}>Executions</div>
            </div>
            <div style={styles.breakdownItem}>
              <div style={styles.breakdownValue}>{(usage?.breakdown as any)?.workflow_runs?.count || 0}</div>
              <div style={styles.breakdownLabel}>Workflows</div>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={{ ...styles.actionBtn, ...styles.primaryBtn }}
              onClick={() => { navigate('/pricing'); setIsOpen(false); }}
            >
              <TrendingUp size={14} /> Upgrade
            </button>
            <button
              style={{ ...styles.actionBtn, ...styles.secondaryBtn }}
              onClick={() => { navigate('/billing'); setIsOpen(false); }}
            >
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile/small screens
export function UsageIndicatorCompact() {
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const data = await getUsageSummary();
      setUsage(data);
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  if (!usage) return null;

  const getColor = (percent: number) => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 70) return '#f59e0b';
    return '#10b981';
  };

  const percentUsed = Math.min(100, ((usage?.tokens_used || 0) / (usage?.token_limit || 1)) * 100);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.35rem 0.75rem',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '20px',
    }}>
      <Zap size={12} color={getColor(usage?.usage_percent || 0)} />
      <span style={{ fontSize: '0.7rem', color: '#888' }}>{(usage?.usage_percent || 0).toFixed(1)}%</span>
      <div style={{
        width: '40px',
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(usage.usage_percent, 100)}%`,
          background: getColor(usage.usage_percent),
          borderRadius: '2px',
        }} />
      </div>
    </div>
  );
}

// Ring indicator for dashboards
export function UsageRing({ size = 60 }: { size?: number }) {
  const navigate = useNavigate();
  const [usage, setUsage] = useState<UsageSummary | null>(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const data = await getUsageSummary();
      setUsage(data);
    } catch (error) {
      console.error('Failed to load usage:', error);
    }
  };

  if (!usage) return null;

  const getColor = (percent: number) => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 70) return '#f59e0b';
    return '#6366f1';
  };

  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (usage.usage_percent / 100) * circumference;
  const color = getColor(usage.usage_percent);

  return (
    <div
      style={{ position: 'relative', width: size, height: size, cursor: 'pointer' }}
      onClick={() => navigate('/billing')}
      title={`${usage.usage_percent.toFixed(1)}% used`}
    >
      <svg viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={100 - (usage?.usage_percent || 0)}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: color }}>
          {formatTokens(usage?.tokens_used || 0)}
        </div>
      </div>
    </div>
  );
}
