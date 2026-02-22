import React, { useState } from 'react';
import { Bell, Plus, Search, Settings, Eye, Edit2, Trash2, Play, Pause, CheckCircle, XCircle, AlertTriangle, Clock, Zap, Mail, MessageSquare, Webhook, Filter, ChevronRight, ChevronDown } from 'lucide-react';

type AlertSeverity = 'critical' | 'warning' | 'info';
type AlertStatus = 'active' | 'inactive' | 'triggered' | 'muted';
type ConditionOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains' | 'not_contains';
type NotificationChannel = 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';

interface AlertCondition {
  metric: string;
  operator: ConditionOperator;
  threshold: number | string;
  duration?: number;
}

interface AlertNotification {
  channel: NotificationChannel;
  target: string;
  enabled: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  description?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  conditions: AlertCondition[];
  notifications: AlertNotification[];
  cooldown: number;
  triggeredCount: number;
  lastTriggered?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AlertRulesManagerProps {
  rules: AlertRule[];
  onCreateRule?: () => void;
  onViewRule?: (ruleId: string) => void;
  onEditRule?: (ruleId: string) => void;
  onToggleRule?: (ruleId: string) => void;
  onDeleteRule?: (ruleId: string) => void;
  onTestRule?: (ruleId: string) => void;
  className?: string;
}

interface RuleCardProps {
  rule: AlertRule;
  onView?: () => void;
  onEdit?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  onTest?: () => void;
}

const SEVERITY_CONFIG: Record<AlertSeverity, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  critical: {
    label: 'Critical',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  warning: {
    label: 'Warning',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  info: {
    label: 'Info',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Bell size={12} />,
  },
};

const STATUS_CONFIG: Record<AlertStatus, {
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
  inactive: {
    label: 'Inactive',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Pause size={12} />,
  },
  triggered: {
    label: 'Triggered',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <Zap size={12} />,
  },
  muted: {
    label: 'Muted',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Bell size={12} />,
  },
};

const OPERATOR_CONFIG: Record<ConditionOperator, string> = {
  gt: '>',
  lt: '<',
  eq: '=',
  gte: '>=',
  lte: '<=',
  contains: 'contains',
  not_contains: 'not contains',
};

const CHANNEL_CONFIG: Record<NotificationChannel, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  email: { label: 'Email', icon: <Mail size={12} />, color: '#3b82f6' },
  slack: { label: 'Slack', icon: <MessageSquare size={12} />, color: '#10b981' },
  webhook: { label: 'Webhook', icon: <Webhook size={12} />, color: '#8b5cf6' },
  sms: { label: 'SMS', icon: <MessageSquare size={12} />, color: '#f59e0b' },
  pagerduty: { label: 'PagerDuty', icon: <Bell size={12} />, color: '#ec4899' },
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
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '1rem',
  },
  ruleCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  ruleCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  ruleCardTriggered: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  ruleHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  ruleTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  ruleIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  ruleMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  severityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
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
  ruleBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  conditionsSection: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  conditionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  conditionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#e4e4e7',
  },
  conditionMetric: {
    color: '#818cf8',
  },
  conditionOperator: {
    color: '#f59e0b',
  },
  conditionThreshold: {
    color: '#10b981',
  },
  notificationsSection: {
    marginBottom: '1rem',
  },
  channelsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  channelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  ruleFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  footerMeta: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toggleButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  testButton: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
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

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const formatCooldown = (minutes: number): string => {
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h`;
  return `${minutes}m`;
};

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  onView,
  onEdit,
  onToggle,
  onDelete,
  onTest,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const severityConfig = SEVERITY_CONFIG[rule.severity];
  const statusConfig = STATUS_CONFIG[rule.status];
  const enabledChannels = rule.notifications.filter(n => n.enabled);

  return (
    <div
      style={{
        ...styles.ruleCard,
        ...(isHovered ? styles.ruleCardHover : {}),
        ...(rule.status === 'triggered' ? styles.ruleCardTriggered : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.ruleHeader}>
        <div style={styles.ruleTitle}>
          <div
            style={{
              ...styles.ruleIcon,
              background: severityConfig.bgColor,
              color: severityConfig.color,
            }}
          >
            <Bell size={22} />
          </div>
          <div style={styles.ruleInfo}>
            <div style={styles.ruleName}>{rule.name}</div>
            <div style={styles.ruleMeta}>
              <span
                style={{
                  ...styles.severityBadge,
                  background: severityConfig.bgColor,
                  color: severityConfig.color,
                }}
              >
                {severityConfig.icon}
                {severityConfig.label}
              </span>
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
            </div>
          </div>
        </div>
      </div>

      <div style={styles.ruleBody}>
        {rule.description && (
          <p style={styles.description}>{rule.description}</p>
        )}

        <div style={styles.conditionsSection}>
          <div style={styles.sectionTitle}>Conditions</div>
          <div style={styles.conditionsList}>
            {rule.conditions.map((condition, idx) => (
              <div key={idx} style={styles.conditionItem}>
                <span style={styles.conditionMetric}>{condition.metric}</span>
                <span style={styles.conditionOperator}>{OPERATOR_CONFIG[condition.operator]}</span>
                <span style={styles.conditionThreshold}>{condition.threshold}</span>
                {condition.duration && (
                  <span style={{ color: '#888' }}>for {condition.duration}m</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.notificationsSection}>
          <div style={styles.sectionTitle}>Notifications ({enabledChannels.length})</div>
          <div style={styles.channelsList}>
            {enabledChannels.map((notification, idx) => {
              const channelConfig = CHANNEL_CONFIG[notification.channel];
              return (
                <span
                  key={idx}
                  style={{
                    ...styles.channelBadge,
                    color: channelConfig.color,
                  }}
                >
                  {channelConfig.icon}
                  {channelConfig.label}
                </span>
              );
            })}
          </div>
        </div>

        <div style={styles.statsRow}>
          <span style={styles.statItem}>
            <Zap size={12} />
            {rule.triggeredCount} triggers
          </span>
          <span style={styles.statItem}>
            <Clock size={12} />
            {formatCooldown(rule.cooldown)} cooldown
          </span>
          {rule.lastTriggered && (
            <span style={styles.statItem}>
              Last: {formatTimeAgo(rule.lastTriggered)}
            </span>
          )}
        </div>
      </div>

      <div style={styles.ruleFooter}>
        <span style={styles.footerMeta}>By {rule.createdBy}</span>
        <div style={styles.actionButtons}>
          {onTest && (
            <button style={{ ...styles.iconButton, ...styles.testButton }} onClick={onTest} title="Test Rule">
              <Play size={14} />
            </button>
          )}
          {onToggle && (
            <button
              style={{
                ...styles.iconButton,
                ...(rule.status === 'active' ? {} : styles.toggleButton),
              }}
              onClick={onToggle}
              title={rule.status === 'active' ? 'Disable' : 'Enable'}
            >
              {rule.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={styles.iconButton} onClick={onEdit} title="Edit">
              <Settings size={14} />
            </button>
          )}
          {onDelete && (
            <button style={{ ...styles.iconButton, ...styles.deleteButton }} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const AlertRulesManager: React.FC<AlertRulesManagerProps> = ({
  rules,
  onCreateRule,
  onViewRule,
  onEditRule,
  onToggleRule,
  onDeleteRule,
  onTestRule,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');

  const filteredRules = rules.filter(r => {
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(query);
    }
    return true;
  });

  const activeRules = rules.filter(r => r.status === 'active').length;
  const triggeredRules = rules.filter(r => r.status === 'triggered').length;
  const criticalRules = rules.filter(r => r.severity === 'critical').length;
  const totalTriggers = rules.reduce((sum, r) => sum + r.triggeredCount, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Bell size={22} />
          Alert Rules Manager
        </h2>
        <div style={styles.headerActions}>
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
          {onCreateRule && (
            <button style={styles.createButton} onClick={onCreateRule}>
              <Plus size={14} />
              New Rule
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{activeRules}</div>
          <div style={styles.statLabel}>Active Rules</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Zap size={20} />
          </div>
          <div style={styles.statValue}>{triggeredRules}</div>
          <div style={styles.statLabel}>Triggered</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{criticalRules}</div>
          <div style={styles.statLabel}>Critical</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Bell size={20} />
          </div>
          <div style={styles.statValue}>{totalTriggers}</div>
          <div style={styles.statLabel}>Total Triggers</div>
        </div>
      </div>

      {/* Rules Grid */}
      {filteredRules.length === 0 ? (
        <div style={styles.empty}>
          <Bell size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No alert rules found</span>
        </div>
      ) : (
        <div style={styles.rulesGrid}>
          {filteredRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onView={onViewRule ? () => onViewRule(rule.id) : undefined}
              onEdit={onEditRule ? () => onEditRule(rule.id) : undefined}
              onToggle={onToggleRule ? () => onToggleRule(rule.id) : undefined}
              onDelete={onDeleteRule ? () => onDeleteRule(rule.id) : undefined}
              onTest={onTestRule ? () => onTestRule(rule.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertRulesManager;
