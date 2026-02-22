import React, { useState } from 'react';
import { AlertTriangle, Plus, Search, Clock, CheckCircle, XCircle, AlertCircle, Users, MessageSquare, Calendar, ChevronRight, ChevronDown, Eye, Edit2, MoreVertical, Zap, Shield } from 'lucide-react';

type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
type IncidentStatus = 'open' | 'investigating' | 'identified' | 'monitoring' | 'resolved';
type IncidentType = 'outage' | 'degradation' | 'security' | 'data' | 'performance';

interface IncidentUpdate {
  id: string;
  message: string;
  status: IncidentStatus;
  createdAt: Date;
  createdBy: string;
}

interface IncidentData {
  id: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedServices: string[];
  assignees: string[];
  updates: IncidentUpdate[];
  createdAt: Date;
  resolvedAt?: Date;
  duration?: number;
}

interface IncidentManagementProps {
  incidents: IncidentData[];
  onCreateIncident?: () => void;
  onViewIncident?: (incidentId: string) => void;
  onUpdateIncident?: (incidentId: string) => void;
  onResolveIncident?: (incidentId: string) => void;
  className?: string;
}

interface IncidentCardProps {
  incident: IncidentData;
  onView?: () => void;
  onUpdate?: () => void;
  onResolve?: () => void;
}

const SEVERITY_CONFIG: Record<IncidentSeverity, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  critical: { label: 'Critical', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  high: { label: 'High', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  medium: { label: 'Medium', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  low: { label: 'Low', color: '#888', bgColor: 'rgba(255, 255, 255, 0.05)' },
};

const STATUS_CONFIG: Record<IncidentStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  open: {
    label: 'Open',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertCircle size={12} />,
  },
  investigating: {
    label: 'Investigating',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Search size={12} />,
  },
  identified: {
    label: 'Identified',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    icon: <Eye size={12} />,
  },
  monitoring: {
    label: 'Monitoring',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Clock size={12} />,
  },
  resolved: {
    label: 'Resolved',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
};

const TYPE_CONFIG: Record<IncidentType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  outage: { label: 'Outage', icon: <XCircle size={14} />, color: '#ef4444' },
  degradation: { label: 'Degradation', icon: <AlertTriangle size={14} />, color: '#f59e0b' },
  security: { label: 'Security', icon: <Shield size={14} />, color: '#8b5cf6' },
  data: { label: 'Data', icon: <AlertCircle size={14} />, color: '#3b82f6' },
  performance: { label: 'Performance', icon: <Zap size={14} />, color: '#14b8a6' },
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
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  incidentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  incidentCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  incidentCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  incidentHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  incidentTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  incidentIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  incidentInfo: {
    flex: 1,
  },
  incidentName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.375rem',
  },
  incidentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  severityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '700',
    textTransform: 'uppercase',
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
  incidentActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.625rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  resolveButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  incidentBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.875rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.6,
  },
  affectedServices: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    marginBottom: '1rem',
  },
  serviceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
  },
  timeline: {
    borderLeft: '2px solid rgba(255, 255, 255, 0.08)',
    paddingLeft: '1rem',
    marginLeft: '0.5rem',
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: '1rem',
  },
  timelineDot: {
    position: 'absolute',
    left: '-1.375rem',
    top: '0.25rem',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid',
    background: '#0d0d1a',
  },
  timelineContent: {
    fontSize: '0.8125rem',
    color: '#e4e4e7',
    marginBottom: '0.25rem',
  },
  timelineMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.6875rem',
    color: '#666',
  },
  assignees: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  assigneeAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#818cf8',
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

const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  onView,
  onUpdate,
  onResolve,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const severityConfig = SEVERITY_CONFIG[incident.severity];
  const statusConfig = STATUS_CONFIG[incident.status];
  const typeConfig = TYPE_CONFIG[incident.type];

  return (
    <div
      style={{
        ...styles.incidentCard,
        ...(isHovered ? styles.incidentCardHover : {}),
        borderLeftWidth: '4px',
        borderLeftColor: severityConfig.color,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.incidentHeader}>
        <div style={styles.incidentTitle}>
          <div
            style={{
              ...styles.incidentIcon,
              background: severityConfig.bgColor,
              color: severityConfig.color,
            }}
          >
            {typeConfig.icon}
          </div>
          <div style={styles.incidentInfo}>
            <div style={styles.incidentName}>{incident.title}</div>
            <div style={styles.incidentMeta}>
              <span
                style={{
                  ...styles.severityBadge,
                  background: severityConfig.bgColor,
                  color: severityConfig.color,
                }}
              >
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
              <span style={{ ...styles.typeBadge, color: typeConfig.color }}>
                {typeConfig.label}
              </span>
              <span>
                <Clock size={12} style={{ marginRight: '0.25rem' }} />
                {formatTimeAgo(incident.createdAt)}
              </span>
              {incident.duration && (
                <span>Duration: {formatDuration(incident.duration)}</span>
              )}
            </div>
          </div>
        </div>
        <div style={styles.incidentActions}>
          {onUpdate && incident.status !== 'resolved' && (
            <button style={styles.actionButton} onClick={onUpdate}>
              <Edit2 size={12} />
              Update
            </button>
          )}
          {onResolve && incident.status !== 'resolved' && (
            <button style={{ ...styles.actionButton, ...styles.resolveButton }} onClick={onResolve}>
              <CheckCircle size={12} />
              Resolve
            </button>
          )}
          {onView && (
            <button style={styles.actionButton} onClick={onView}>
              <Eye size={12} />
              View
            </button>
          )}
        </div>
      </div>

      <div style={styles.incidentBody}>
        <p style={styles.description}>{incident.description}</p>

        {incident.affectedServices.length > 0 && (
          <div style={styles.affectedServices}>
            <span style={{ fontSize: '0.6875rem', color: '#888', marginRight: '0.5rem' }}>
              Affected:
            </span>
            {incident.affectedServices.map((service) => (
              <span key={service} style={styles.serviceBadge}>
                {service}
              </span>
            ))}
          </div>
        )}

        {incident.updates.length > 0 && (
          <>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: 'none',
                border: 'none',
                color: '#818cf8',
                fontSize: '0.75rem',
                cursor: 'pointer',
                marginBottom: '0.75rem',
              }}
              onClick={() => setShowTimeline(!showTimeline)}
            >
              {showTimeline ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {incident.updates.length} updates
            </button>

            {showTimeline && (
              <div style={styles.timeline}>
                {incident.updates.slice(0, 5).map((update) => {
                  const updateStatusConfig = STATUS_CONFIG[update.status];
                  return (
                    <div key={update.id} style={styles.timelineItem}>
                      <div
                        style={{
                          ...styles.timelineDot,
                          borderColor: updateStatusConfig.color,
                        }}
                      />
                      <div style={styles.timelineContent}>{update.message}</div>
                      <div style={styles.timelineMeta}>
                        <span>{update.createdBy}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(update.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {incident.assignees.length > 0 && (
          <div style={styles.assignees}>
            <Users size={14} style={{ color: '#888' }} />
            {incident.assignees.map((assignee, idx) => (
              <div key={idx} style={styles.assigneeAvatar}>
                {assignee.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const IncidentManagement: React.FC<IncidentManagementProps> = ({
  incidents,
  onCreateIncident,
  onViewIncident,
  onUpdateIncident,
  onResolveIncident,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');

  const filteredIncidents = incidents.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        i.title.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const investigatingIncidents = incidents.filter(i => i.status === 'investigating').length;
  const monitoringIncidents = incidents.filter(i => i.status === 'monitoring').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <AlertTriangle size={22} />
          Incident Management
          {criticalIncidents > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                marginLeft: '0.5rem',
              }}
            >
              {criticalIncidents} Critical
            </span>
          )}
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search incidents..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateIncident && (
            <button style={styles.createButton} onClick={onCreateIncident}>
              <Plus size={14} />
              Report Incident
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#ef4444' }}>{openIncidents}</div>
          <div style={styles.statLabel}>Open</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#f59e0b' }}>{investigatingIncidents}</div>
          <div style={styles.statLabel}>Investigating</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#3b82f6' }}>{monitoringIncidents}</div>
          <div style={styles.statLabel}>Monitoring</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{resolvedIncidents}</div>
          <div style={styles.statLabel}>Resolved</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{incidents.length}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div style={styles.empty}>
          <AlertTriangle size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No incidents found</span>
        </div>
      ) : (
        <div style={styles.incidentsList}>
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onView={onViewIncident ? () => onViewIncident(incident.id) : undefined}
              onUpdate={onUpdateIncident ? () => onUpdateIncident(incident.id) : undefined}
              onResolve={onResolveIncident ? () => onResolveIncident(incident.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentManagement;
