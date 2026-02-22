import React, { useState } from 'react';
import { Flag, Plus, Edit2, Trash2, MoreVertical, Search, CheckCircle, XCircle, Users, Percent, Calendar, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

type FlagStatus = 'enabled' | 'disabled' | 'partial';
type FlagType = 'boolean' | 'percentage' | 'user_segment' | 'scheduled';

interface FeatureFlagData {
  id: string;
  key: string;
  name: string;
  description?: string;
  type: FlagType;
  status: FlagStatus;
  value: boolean | number | string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  environment: 'development' | 'staging' | 'production';
  rolloutPercentage?: number;
  targetUsers?: string[];
  scheduledAt?: Date;
}

interface FeatureFlagManagementProps {
  flags: FeatureFlagData[];
  onToggleFlag?: (flagId: string, enabled: boolean) => void;
  onEditFlag?: (flagId: string) => void;
  onDeleteFlag?: (flagId: string) => void;
  onCreateFlag?: () => void;
  className?: string;
}

interface FlagRowProps {
  flag: FeatureFlagData;
  onToggle?: (enabled: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<FlagStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  enabled: {
    label: 'Enabled',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  disabled: {
    label: 'Disabled',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <XCircle size={12} />,
  },
  partial: {
    label: 'Partial',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Percent size={12} />,
  },
};

const TYPE_CONFIG: Record<FlagType, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  boolean: { label: 'Boolean', color: '#3b82f6', icon: <ToggleRight size={14} /> },
  percentage: { label: 'Percentage', color: '#8b5cf6', icon: <Percent size={14} /> },
  user_segment: { label: 'User Segment', color: '#10b981', icon: <Users size={14} /> },
  scheduled: { label: 'Scheduled', color: '#f59e0b', icon: <Calendar size={14} /> },
};

const ENV_CONFIG: Record<string, { color: string; bgColor: string }> = {
  development: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  staging: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  production: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '200px',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '0.875rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statValue: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  tr: {
    transition: 'background 0.15s',
  },
  trHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  td: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.875rem',
    color: '#e4e4e7',
  },
  flagCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  flagIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flagName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  flagKey: {
    fontSize: '0.75rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  envBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  toggle: {
    position: 'relative',
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  toggleEnabled: {
    background: '#10b981',
  },
  toggleDisabled: {
    background: 'rgba(255, 255, 255, 0.1)',
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
  rolloutBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  rolloutProgress: {
    width: '60px',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  rolloutFill: {
    height: '100%',
    background: '#8b5cf6',
    borderRadius: '3px',
  },
  actionButton: {
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
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '0.25rem',
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.375rem',
    minWidth: '120px',
    zIndex: 100,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#e4e4e7',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'background 0.15s',
    textAlign: 'left',
  },
  dropdownItemDanger: {
    color: '#ef4444',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const FlagRow: React.FC<FlagRowProps> = ({
  flag,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = STATUS_CONFIG[flag.status];
  const typeConfig = TYPE_CONFIG[flag.type];
  const envConfig = ENV_CONFIG[flag.environment];
  const isEnabled = flag.status === 'enabled' || flag.status === 'partial';

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <td style={styles.td}>
        <div style={styles.flagCell}>
          <div
            style={{
              ...styles.flagIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Flag size={18} />
          </div>
          <div>
            <div style={styles.flagName}>{flag.name}</div>
            <div style={styles.flagKey}>{flag.key}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.typeBadge, color: typeConfig.color }}>
          {typeConfig.icon}
          {typeConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.envBadge,
            background: envConfig.bgColor,
            color: envConfig.color,
          }}
        >
          {flag.environment}
        </span>
      </td>
      <td style={styles.td}>
        {flag.type === 'percentage' && flag.rolloutPercentage !== undefined ? (
          <div style={styles.rolloutBar}>
            <div style={styles.rolloutProgress}>
              <div
                style={{
                  ...styles.rolloutFill,
                  width: `${flag.rolloutPercentage}%`,
                }}
              />
            </div>
            <span style={{ fontSize: '0.75rem' }}>{flag.rolloutPercentage}%</span>
          </div>
        ) : flag.type === 'user_segment' && flag.targetUsers ? (
          <span style={{ fontSize: '0.75rem', color: '#888' }}>
            {flag.targetUsers.length} users
          </span>
        ) : (
          <span style={{ color: '#666' }}>-</span>
        )}
      </td>
      <td style={styles.td}>
        {onToggle ? (
          <div
            style={{
              ...styles.toggle,
              ...(isEnabled ? styles.toggleEnabled : styles.toggleDisabled),
            }}
            onClick={() => onToggle(!isEnabled)}
            role="switch"
            aria-checked={isEnabled}
          >
            <div
              style={{
                ...styles.toggleKnob,
                left: isEnabled ? '22px' : '2px',
              }}
            />
          </div>
        ) : (
          <span
            style={{
              ...styles.statusBadge,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        )}
      </td>
      <td style={styles.td}>{formatDate(flag.updatedAt)}</td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <button
          style={styles.actionButton}
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={16} />
        </button>
        {showMenu && (
          <div style={styles.dropdown}>
            {onEdit && (
              <button style={styles.dropdownItem} onClick={onEdit}>
                <Edit2 size={14} />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                onClick={onDelete}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export const FeatureFlagManagement: React.FC<FeatureFlagManagementProps> = ({
  flags,
  onToggleFlag,
  onEditFlag,
  onDeleteFlag,
  onCreateFlag,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<string>('all');

  const filteredFlags = flags.filter(f => {
    if (envFilter !== 'all' && f.environment !== envFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(query) ||
        f.key.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const enabledCount = flags.filter(f => f.status === 'enabled').length;
  const partialCount = flags.filter(f => f.status === 'partial').length;

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Flag size={18} />
          Feature Flags
        </div>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search flags..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateFlag && (
            <button style={styles.createButton} onClick={onCreateFlag}>
              <Plus size={14} />
              Add Flag
            </button>
          )}
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{flags.length}</span>
          <span style={styles.statLabel}>Total Flags</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#10b981' }}>{enabledCount}</span>
          <span style={styles.statLabel}>Enabled</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#f59e0b' }}>{partialCount}</span>
          <span style={styles.statLabel}>Partial Rollout</span>
        </div>
      </div>

      {filteredFlags.length === 0 ? (
        <div style={styles.empty}>
          <Flag size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No feature flags found</span>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Flag</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Environment</th>
              <th style={styles.th}>Rollout</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Updated</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredFlags.map((flag) => (
              <FlagRow
                key={flag.id}
                flag={flag}
                onToggle={onToggleFlag ? (enabled) => onToggleFlag(flag.id, enabled) : undefined}
                onEdit={onEditFlag ? () => onEditFlag(flag.id) : undefined}
                onDelete={onDeleteFlag ? () => onDeleteFlag(flag.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FeatureFlagManagement;
