import React, { useState, createContext, useContext } from 'react';
import { Flag, ToggleLeft, ToggleRight, Users, Percent, Calendar, Info } from 'lucide-react';

type FlagStatus = 'enabled' | 'disabled' | 'partial';
type RolloutType = 'all' | 'percentage' | 'users' | 'groups';

interface FeatureFlagData {
  id: string;
  name: string;
  description?: string;
  status: FlagStatus;
  rolloutType?: RolloutType;
  rolloutValue?: number | string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface FeatureFlagProps {
  flag: FeatureFlagData;
  onToggle?: (enabled: boolean) => void;
  onEdit?: () => void;
  showDetails?: boolean;
  className?: string;
}

interface FeatureFlagListProps {
  flags: FeatureFlagData[];
  onToggle?: (id: string, enabled: boolean) => void;
  onEdit?: (id: string) => void;
  className?: string;
}

interface FeatureFlagProviderProps {
  flags: Record<string, boolean>;
  children: React.ReactNode;
}

const STATUS_CONFIG: Record<FlagStatus, {
  color: string;
  bgColor: string;
  label: string;
}> = {
  enabled: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    label: 'Enabled',
  },
  disabled: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    label: 'Disabled',
  },
  partial: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Partial',
  },
};

const ROLLOUT_CONFIG: Record<RolloutType, {
  icon: React.ReactNode;
  label: string;
}> = {
  all: { icon: <Flag size={12} />, label: 'All users' },
  percentage: { icon: <Percent size={12} />, label: 'Percentage' },
  users: { icon: <Users size={12} />, label: 'Specific users' },
  groups: { icon: <Users size={12} />, label: 'User groups' },
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    transition: 'all 0.15s',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
  },
  toggle: {
    position: 'relative',
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    flexShrink: 0,
  },
  toggleEnabled: {
    background: '#10b981',
  },
  toggleDisabled: {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  togglePartial: {
    background: '#f59e0b',
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    width: '20px',
    height: '20px',
    background: '#fff',
    borderRadius: '50%',
    transition: 'left 0.2s',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  name: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    lineHeight: 1.4,
    marginBottom: '0.5rem',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#666',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  details: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.375rem',
    fontSize: '0.75rem',
  },
  detailLabel: {
    color: '#888',
    minWidth: '80px',
  },
  detailValue: {
    color: '#e4e4e7',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  listTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  listCount: {
    fontSize: '0.75rem',
    color: '#888',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#666',
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: '0.75rem',
    opacity: 0.5,
  },
};

export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  flag,
  onToggle,
  onEdit,
  showDetails = false,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const statusConfig = STATUS_CONFIG[flag.status];
  const rolloutConfig = flag.rolloutType ? ROLLOUT_CONFIG[flag.rolloutType] : null;

  const handleToggle = () => {
    if (onToggle) {
      onToggle(flag.status !== 'enabled');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
      <div
        style={{
          ...styles.toggle,
          ...(flag.status === 'enabled' ? styles.toggleEnabled : {}),
          ...(flag.status === 'disabled' ? styles.toggleDisabled : {}),
          ...(flag.status === 'partial' ? styles.togglePartial : {}),
        }}
        onClick={handleToggle}
        role="switch"
        aria-checked={flag.status === 'enabled'}
      >
        <div
          style={{
            ...styles.toggleKnob,
            left: flag.status === 'disabled' ? '2px' : '22px',
          }}
        />
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h4 style={styles.name}>{flag.name}</h4>
          <span
            style={{
              ...styles.statusBadge,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </span>
        </div>

        {flag.description && (
          <p style={styles.description}>{flag.description}</p>
        )}

        <div style={styles.meta}>
          {rolloutConfig && (
            <span style={styles.metaItem}>
              {rolloutConfig.icon}
              {rolloutConfig.label}
              {flag.rolloutType === 'percentage' && flag.rolloutValue && (
                <span>: {flag.rolloutValue}%</span>
              )}
            </span>
          )}
          {flag.updatedAt && (
            <span style={styles.metaItem}>
              <Calendar size={12} />
              Updated {formatDate(flag.updatedAt)}
            </span>
          )}
          {(flag.rolloutType || flag.createdAt) && (
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                padding: '0.125rem',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Info size={12} />
            </button>
          )}
        </div>

        {isExpanded && (
          <div style={styles.details}>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Flag ID</span>
              <span style={{ ...styles.detailValue, fontFamily: "'JetBrains Mono', monospace" }}>
                {flag.id}
              </span>
            </div>
            {flag.rolloutType && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Rollout</span>
                <span style={styles.detailValue}>
                  {rolloutConfig?.label}
                  {flag.rolloutType === 'percentage' && ` (${flag.rolloutValue}%)`}
                  {flag.rolloutType === 'users' && Array.isArray(flag.rolloutValue) && (
                    ` (${flag.rolloutValue.length} users)`
                  )}
                </span>
              </div>
            )}
            {flag.createdAt && (
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Created</span>
                <span style={styles.detailValue}>{formatDate(flag.createdAt)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const FeatureFlagList: React.FC<FeatureFlagListProps> = ({
  flags,
  onToggle,
  onEdit,
  className,
}) => {
  const enabledCount = flags.filter((f) => f.status === 'enabled').length;

  return (
    <div className={className}>
      <div style={styles.listHeader}>
        <span style={styles.listTitle}>Feature Flags</span>
        <span style={styles.listCount}>
          {enabledCount} of {flags.length} enabled
        </span>
      </div>

      {flags.length === 0 ? (
        <div style={styles.empty}>
          <Flag size={32} style={styles.emptyIcon} />
          <span>No feature flags configured</span>
        </div>
      ) : (
        <div style={styles.list}>
          {flags.map((flag) => (
            <FeatureFlag
              key={flag.id}
              flag={flag}
              onToggle={onToggle ? (enabled) => onToggle(flag.id, enabled) : undefined}
              onEdit={onEdit ? () => onEdit(flag.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Feature flag context for conditional rendering
const FeatureFlagContext = createContext<Record<string, boolean>>({});

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({
  flags,
  children,
}) => (
  <FeatureFlagContext.Provider value={flags}>
    {children}
  </FeatureFlagContext.Provider>
);

export const useFeatureFlag = (flagId: string): boolean => {
  const flags = useContext(FeatureFlagContext);
  return flags[flagId] ?? false;
};

// Conditional render component
interface FeatureProps {
  flag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Feature: React.FC<FeatureProps> = ({
  flag,
  children,
  fallback = null,
}) => {
  const isEnabled = useFeatureFlag(flag);
  return <>{isEnabled ? children : fallback}</>;
};

export default FeatureFlag;
