import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, MoreVertical, Search, CheckCircle, AlertTriangle, Clock, Zap, Globe, Users, Bot, Key } from 'lucide-react';

type RateLimitScope = 'global' | 'user' | 'ip' | 'api_key' | 'endpoint';
type RateLimitWindow = 'second' | 'minute' | 'hour' | 'day';
type RateLimitStatus = 'active' | 'disabled' | 'warning';

interface RateLimitRule {
  id: string;
  name: string;
  scope: RateLimitScope;
  endpoint?: string;
  limit: number;
  window: RateLimitWindow;
  burstLimit?: number;
  status: RateLimitStatus;
  currentUsage?: number;
  blockedRequests?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RateLimitStats {
  totalRules: number;
  activeRules: number;
  totalBlocked: number;
  avgUsage: number;
}

interface RateLimitConfigProps {
  rules: RateLimitRule[];
  stats: RateLimitStats;
  onCreateRule?: () => void;
  onEditRule?: (ruleId: string) => void;
  onDeleteRule?: (ruleId: string) => void;
  onToggleRule?: (ruleId: string) => void;
  className?: string;
}

interface RuleRowProps {
  rule: RateLimitRule;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
}

const SCOPE_CONFIG: Record<RateLimitScope, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  global: { label: 'Global', icon: <Globe size={14} />, color: '#ef4444' },
  user: { label: 'Per User', icon: <Users size={14} />, color: '#3b82f6' },
  ip: { label: 'Per IP', icon: <Shield size={14} />, color: '#8b5cf6' },
  api_key: { label: 'Per API Key', icon: <Key size={14} />, color: '#f59e0b' },
  endpoint: { label: 'Per Endpoint', icon: <Zap size={14} />, color: '#10b981' },
};

const WINDOW_CONFIG: Record<RateLimitWindow, { label: string; short: string }> = {
  second: { label: 'per second', short: '/s' },
  minute: { label: 'per minute', short: '/min' },
  hour: { label: 'per hour', short: '/hr' },
  day: { label: 'per day', short: '/day' },
};

const STATUS_CONFIG: Record<RateLimitStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  active: {
    label: 'Active',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  disabled: {
    label: 'Disabled',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
  warning: {
    label: 'Warning',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  tableContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tableTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
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
    width: '180px',
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
  ruleCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  ruleIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ruleName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  ruleEndpoint: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  scopeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  limitCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  limitValue: {
    fontWeight: '600',
    color: '#fff',
  },
  limitWindow: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  usageBar: {
    width: '80px',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  usageFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
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
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
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
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '22px',
    borderRadius: '11px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toggleKnob: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: '#fff',
    transition: 'transform 0.15s',
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

const RuleRow: React.FC<RuleRowProps> = ({
  rule,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const scopeConfig = SCOPE_CONFIG[rule.scope];
  const windowConfig = WINDOW_CONFIG[rule.window];
  const statusConfig = STATUS_CONFIG[rule.status];

  const usagePercent = rule.currentUsage !== undefined
    ? (rule.currentUsage / rule.limit) * 100
    : 0;

  const usageColor = usagePercent > 90 ? '#ef4444' : usagePercent > 70 ? '#f59e0b' : '#10b981';

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
        <div style={styles.ruleCell}>
          <div
            style={{
              ...styles.ruleIcon,
              background: `${scopeConfig.color}20`,
              color: scopeConfig.color,
            }}
          >
            {scopeConfig.icon}
          </div>
          <div>
            <div style={styles.ruleName}>{rule.name}</div>
            {rule.endpoint && (
              <div style={styles.ruleEndpoint}>{rule.endpoint}</div>
            )}
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.scopeBadge, color: scopeConfig.color }}>
          {scopeConfig.icon}
          {scopeConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.limitCell}>
          <span style={styles.limitValue}>
            {rule.limit.toLocaleString()}{windowConfig.short}
          </span>
          {rule.burstLimit && (
            <span style={styles.limitWindow}>
              Burst: {rule.burstLimit}
            </span>
          )}
        </div>
      </td>
      <td style={styles.td}>
        {rule.currentUsage !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={styles.usageBar}>
              <div
                style={{
                  ...styles.usageFill,
                  width: `${Math.min(usagePercent, 100)}%`,
                  background: usageColor,
                }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: usageColor }}>
              {usagePercent.toFixed(0)}%
            </span>
          </div>
        ) : (
          <span style={{ color: '#666' }}>-</span>
        )}
      </td>
      <td style={styles.td}>
        {rule.blockedRequests !== undefined ? (
          <span style={{ color: rule.blockedRequests > 0 ? '#ef4444' : '#888' }}>
            {rule.blockedRequests.toLocaleString()}
          </span>
        ) : (
          <span style={{ color: '#666' }}>-</span>
        )}
      </td>
      <td style={styles.td}>
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
      </td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <div style={styles.actionButtons}>
          {onToggle && (
            <button
              style={{
                ...styles.toggleButton,
                background: rule.status === 'active' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
              }}
              onClick={onToggle}
            >
              <div
                style={{
                  ...styles.toggleKnob,
                  transform: rule.status === 'active' ? 'translateX(9px)' : 'translateX(-9px)',
                }}
              />
            </button>
          )}
          <button
            style={styles.actionButton}
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>
        </div>
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

export const RateLimitConfig: React.FC<RateLimitConfigProps> = ({
  rules,
  stats,
  onCreateRule,
  onEditRule,
  onDeleteRule,
  onToggleRule,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRules = rules.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.endpoint?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Shield size={22} />
          Rate Limiting
        </h2>
        <div style={styles.headerActions}>
          {onCreateRule && (
            <button style={styles.createButton} onClick={onCreateRule}>
              <Plus size={14} />
              Add Rule
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Shield size={20} />
          </div>
          <div style={styles.statValue}>{stats.totalRules}</div>
          <div style={styles.statLabel}>Total Rules</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{stats.activeRules}</div>
          <div style={styles.statLabel}>Active Rules</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{stats.totalBlocked.toLocaleString()}</div>
          <div style={styles.statLabel}>Blocked Requests</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Zap size={20} />
          </div>
          <div style={styles.statValue}>{stats.avgUsage.toFixed(0)}%</div>
          <div style={styles.statLabel}>Avg Usage</div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Rate Limit Rules</span>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search rules..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredRules.length === 0 ? (
          <div style={styles.empty}>
            <Shield size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No rate limit rules found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rule</th>
                <th style={styles.th}>Scope</th>
                <th style={styles.th}>Limit</th>
                <th style={styles.th}>Usage</th>
                <th style={styles.th}>Blocked</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  onEdit={onEditRule ? () => onEditRule(rule.id) : undefined}
                  onDelete={onDeleteRule ? () => onDeleteRule(rule.id) : undefined}
                  onToggle={onToggleRule ? () => onToggleRule(rule.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RateLimitConfig;
