import React, { useState } from 'react';
import { History, Search, Filter, Calendar, User, Settings, Shield, Database, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronRight, Eye, Download } from 'lucide-react';

type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'access' | 'export' | 'config';
type AuditSeverity = 'info' | 'warning' | 'critical';
type AuditResource = 'user' | 'agent' | 'billing' | 'settings' | 'api' | 'security' | 'data';

interface AuditChange {
  field: string;
  oldValue?: string;
  newValue?: string;
}

interface AuditEvent {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceName: string;
  severity: AuditSeverity;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  userAgent?: string;
  changes?: AuditChange[];
  metadata?: Record<string, unknown>;
  timestamp: Date;
  success: boolean;
}

interface AuditTrailProps {
  events: AuditEvent[];
  onViewDetails?: (eventId: string) => void;
  onExport?: () => void;
  onFilter?: (filters: Record<string, string>) => void;
  className?: string;
}

interface EventRowProps {
  event: AuditEvent;
  onViewDetails?: () => void;
}

const ACTION_CONFIG: Record<AuditAction, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  create: { label: 'Created', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  update: { label: 'Updated', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  delete: { label: 'Deleted', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  login: { label: 'Login', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  logout: { label: 'Logout', color: '#888', bgColor: 'rgba(255, 255, 255, 0.05)' },
  access: { label: 'Accessed', color: '#14b8a6', bgColor: 'rgba(20, 184, 166, 0.15)' },
  export: { label: 'Exported', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  config: { label: 'Configured', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.15)' },
};

const SEVERITY_CONFIG: Record<AuditSeverity, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  info: { label: 'Info', color: '#3b82f6', icon: <CheckCircle size={12} /> },
  warning: { label: 'Warning', color: '#f59e0b', icon: <AlertTriangle size={12} /> },
  critical: { label: 'Critical', color: '#ef4444', icon: <Shield size={12} /> },
};

const RESOURCE_CONFIG: Record<AuditResource, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  user: { label: 'User', icon: <User size={14} />, color: '#3b82f6' },
  agent: { label: 'Agent', icon: <Settings size={14} />, color: '#8b5cf6' },
  billing: { label: 'Billing', icon: <Database size={14} />, color: '#10b981' },
  settings: { label: 'Settings', icon: <Settings size={14} />, color: '#f59e0b' },
  api: { label: 'API', icon: <Shield size={14} />, color: '#14b8a6' },
  security: { label: 'Security', icon: <Shield size={14} />, color: '#ef4444' },
  data: { label: 'Data', icon: <Database size={14} />, color: '#ec4899' },
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
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filtersBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
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
    flex: 1,
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '100%',
  },
  filterSelect: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
  },
  dateGroup: {
    marginBottom: '1.5rem',
  },
  dateHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0',
    marginBottom: '0.75rem',
  },
  dateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    background: 'rgba(99, 102, 241, 0.15)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#818cf8',
  },
  dateLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  eventCard: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    marginBottom: '0.75rem',
    transition: 'all 0.15s',
  },
  eventCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  eventTimeline: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '40px',
    flexShrink: 0,
  },
  eventDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '2px solid',
  },
  eventLine: {
    flex: 1,
    width: '2px',
    background: 'rgba(255, 255, 255, 0.08)',
    marginTop: '0.5rem',
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  eventTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  resourceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  eventTime: {
    fontSize: '0.75rem',
    color: '#888',
  },
  eventDescription: {
    fontSize: '0.875rem',
    color: '#e4e4e7',
    marginBottom: '0.75rem',
  },
  eventMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  changesSection: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
  },
  changesTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  changeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem 0',
    fontSize: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  changeField: {
    fontWeight: '500',
    color: '#e4e4e7',
    minWidth: '100px',
  },
  changeOld: {
    color: '#ef4444',
    textDecoration: 'line-through',
  },
  changeNew: {
    color: '#10b981',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '6px',
    color: '#818cf8',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
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

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
};

const groupEventsByDate = (events: AuditEvent[]) => {
  const groups: Record<string, AuditEvent[]> = {};

  events.forEach((event) => {
    const dateKey = event.timestamp.toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(event);
  });

  return Object.entries(groups).map(([dateKey, events]) => ({
    date: new Date(dateKey),
    events: events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
  }));
};

const EventRow: React.FC<EventRowProps> = ({
  event,
  onViewDetails,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showChanges, setShowChanges] = useState(false);

  const actionConfig = ACTION_CONFIG[event.action];
  const resourceConfig = RESOURCE_CONFIG[event.resource];
  const severityConfig = SEVERITY_CONFIG[event.severity];

  return (
    <div
      style={{
        ...styles.eventCard,
        ...(isHovered ? styles.eventCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.eventTimeline}>
        <div
          style={{
            ...styles.eventDot,
            borderColor: severityConfig.color,
            background: event.success ? 'transparent' : severityConfig.color,
          }}
        />
        <div style={styles.eventLine} />
      </div>

      <div style={styles.eventContent}>
        <div style={styles.eventHeader}>
          <div style={styles.eventTitle}>
            <span
              style={{
                ...styles.actionBadge,
                background: actionConfig.bgColor,
                color: actionConfig.color,
              }}
            >
              {actionConfig.label}
            </span>
            <span style={{ ...styles.resourceBadge, color: resourceConfig.color }}>
              {resourceConfig.icon}
              {resourceConfig.label}
            </span>
          </div>
          <span style={styles.eventTime}>{formatTime(event.timestamp)}</span>
        </div>

        <div style={styles.eventDescription}>
          <strong>{event.userName}</strong> {actionConfig.label.toLowerCase()} {resourceConfig.label.toLowerCase()}{' '}
          <strong>{event.resourceName}</strong>
          {!event.success && (
            <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>(Failed)</span>
          )}
        </div>

        <div style={styles.eventMeta}>
          <span style={styles.metaItem}>
            <User size={12} />
            {event.userEmail}
          </span>
          <span style={styles.metaItem}>
            <Shield size={12} />
            {event.ipAddress}
          </span>
          {event.changes && event.changes.length > 0 && (
            <button
              style={{ ...styles.metaItem, cursor: 'pointer', background: 'none', border: 'none', color: '#818cf8' }}
              onClick={() => setShowChanges(!showChanges)}
            >
              {showChanges ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {event.changes.length} changes
            </button>
          )}
          {onViewDetails && (
            <button style={styles.viewButton} onClick={onViewDetails}>
              <Eye size={12} />
              Details
            </button>
          )}
        </div>

        {showChanges && event.changes && (
          <div style={styles.changesSection}>
            <div style={styles.changesTitle}>Changes</div>
            {event.changes.map((change, idx) => (
              <div key={idx} style={styles.changeItem}>
                <span style={styles.changeField}>{change.field}</span>
                {change.oldValue && (
                  <span style={styles.changeOld}>{change.oldValue}</span>
                )}
                <span>→</span>
                <span style={styles.changeNew}>{change.newValue || '(empty)'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const AuditTrail: React.FC<AuditTrailProps> = ({
  events,
  onViewDetails,
  onExport,
  onFilter,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | 'all'>('all');

  const filteredEvents = events.filter(e => {
    if (actionFilter !== 'all' && e.action !== actionFilter) return false;
    if (severityFilter !== 'all' && e.severity !== severityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        e.userName.toLowerCase().includes(query) ||
        e.resourceName.toLowerCase().includes(query) ||
        e.ipAddress.includes(query)
      );
    }
    return true;
  });

  const groupedEvents = groupEventsByDate(filteredEvents);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <History size={22} />
          Audit Trail
        </h2>
        <div style={styles.headerActions}>
          {onExport && (
            <button style={styles.exportButton} onClick={onExport}>
              <Download size={14} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersBar}>
        <div style={styles.searchInput}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Search by user, resource, or IP..."
            style={styles.input}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={styles.filterSelect}>
          <Filter size={14} />
          <select
            style={{ background: 'transparent', border: 'none', color: '#888', outline: 'none' }}
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as AuditAction | 'all')}
          >
            <option value="all">All Actions</option>
            {Object.entries(ACTION_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
        <div style={styles.filterSelect}>
          <Shield size={14} />
          <select
            style={{ background: 'transparent', border: 'none', color: '#888', outline: 'none' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as AuditSeverity | 'all')}
          >
            <option value="all">All Severity</option>
            {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      {groupedEvents.length === 0 ? (
        <div style={styles.empty}>
          <History size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No audit events found</span>
        </div>
      ) : (
        <div style={styles.timeline}>
          {groupedEvents.map(({ date, events }) => (
            <div key={date.toISOString()} style={styles.dateGroup}>
              <div style={styles.dateHeader}>
                <span style={styles.dateBadge}>
                  <Calendar size={12} />
                  {formatDate(date)}
                </span>
                <div style={styles.dateLine} />
              </div>
              {events.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  onViewDetails={onViewDetails ? () => onViewDetails(event.id) : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
