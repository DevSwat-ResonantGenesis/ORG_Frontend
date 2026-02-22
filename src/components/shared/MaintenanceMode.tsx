import React, { useState } from 'react';
import { Wrench, Calendar, Clock, AlertTriangle, CheckCircle, Play, Pause, Settings, Users, Globe, Shield, Bell, Save } from 'lucide-react';

type MaintenanceStatus = 'active' | 'scheduled' | 'completed' | 'cancelled';

interface MaintenanceWindow {
  id: string;
  title: string;
  description?: string;
  status: MaintenanceStatus;
  startTime: Date;
  endTime: Date;
  affectedServices: string[];
  notifyUsers: boolean;
  allowAdminAccess: boolean;
  createdBy?: string;
  createdAt: Date;
}

interface MaintenanceModeProps {
  isMaintenanceActive: boolean;
  currentMaintenance?: MaintenanceWindow;
  scheduledMaintenance: MaintenanceWindow[];
  pastMaintenance: MaintenanceWindow[];
  onToggleMaintenance?: (active: boolean) => void;
  onScheduleMaintenance?: () => void;
  onCancelMaintenance?: (id: string) => void;
  onEditMaintenance?: (id: string) => void;
  className?: string;
}

interface MaintenanceCardProps {
  maintenance: MaintenanceWindow;
  onCancel?: () => void;
  onEdit?: () => void;
}

const STATUS_CONFIG: Record<MaintenanceStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  active: {
    label: 'Active',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <Wrench size={12} />,
  },
  scheduled: {
    label: 'Scheduled',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Calendar size={12} />,
  },
  completed: {
    label: 'Completed',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
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
  scheduleButton: {
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
  statusCard: {
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid',
  },
  statusCardActive: {
    background: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusCardInactive: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  statusTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  statusIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#fff',
  },
  statusSubtext: {
    fontSize: '0.8125rem',
    color: '#888',
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.625rem 1rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toggleButtonActivate: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
  toggleButtonDeactivate: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
  },
  statusDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#888',
  },
  section: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  sectionTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  sectionContent: {
    padding: '1rem',
  },
  maintenanceCard: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    marginBottom: '0.75rem',
    transition: 'all 0.15s',
  },
  maintenanceCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  maintenanceDescription: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '0.75rem',
  },
  maintenanceMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#666',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
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
  serviceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
    marginRight: '0.25rem',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonDanger: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#666',
    fontSize: '0.875rem',
  },
  quickSettings: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    padding: '1rem',
  },
  settingItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
  },
  settingLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#e4e4e7',
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
};

const formatDateTime = (date: Date) => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDuration = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  maintenance,
  onCancel,
  onEdit,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const statusConfig = STATUS_CONFIG[maintenance.status];

  return (
    <div
      style={{
        ...styles.maintenanceCard,
        ...(isHovered ? styles.maintenanceCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.maintenanceInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <span style={styles.maintenanceTitle}>{maintenance.title}</span>
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
        {maintenance.description && (
          <p style={styles.maintenanceDescription}>{maintenance.description}</p>
        )}
        <div style={styles.maintenanceMeta}>
          <div style={styles.metaItem}>
            <Clock size={12} />
            {formatDateTime(maintenance.startTime)} - {formatDateTime(maintenance.endTime)}
          </div>
          <div style={styles.metaItem}>
            <Calendar size={12} />
            {formatDuration(maintenance.startTime, maintenance.endTime)}
          </div>
          <div>
            {maintenance.affectedServices.slice(0, 3).map((service) => (
              <span key={service} style={styles.serviceBadge}>{service}</span>
            ))}
            {maintenance.affectedServices.length > 3 && (
              <span style={styles.serviceBadge}>+{maintenance.affectedServices.length - 3}</span>
            )}
          </div>
        </div>
      </div>
      {(onCancel || onEdit) && maintenance.status === 'scheduled' && (
        <div style={styles.actionButtons}>
          {onEdit && (
            <button style={styles.actionButton} onClick={onEdit}>
              Edit
            </button>
          )}
          {onCancel && (
            <button
              style={{ ...styles.actionButton, ...styles.actionButtonDanger }}
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const MaintenanceMode: React.FC<MaintenanceModeProps> = ({
  isMaintenanceActive,
  currentMaintenance,
  scheduledMaintenance,
  pastMaintenance,
  onToggleMaintenance,
  onScheduleMaintenance,
  onCancelMaintenance,
  onEditMaintenance,
  className,
}) => {
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [allowAdminAccess, setAllowAdminAccess] = useState(true);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Wrench size={22} />
          Maintenance Mode
        </h2>
        {onScheduleMaintenance && (
          <button style={styles.scheduleButton} onClick={onScheduleMaintenance}>
            <Calendar size={14} />
            Schedule Maintenance
          </button>
        )}
      </div>

      {/* Current Status */}
      <div
        style={{
          ...styles.statusCard,
          ...(isMaintenanceActive ? styles.statusCardActive : styles.statusCardInactive),
        }}
      >
        <div style={styles.statusHeader}>
          <div style={styles.statusTitle}>
            <div
              style={{
                ...styles.statusIcon,
                background: isMaintenanceActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                color: isMaintenanceActive ? '#ef4444' : '#10b981',
              }}
            >
              {isMaintenanceActive ? <Wrench size={24} /> : <CheckCircle size={24} />}
            </div>
            <div>
              <div style={styles.statusText}>
                {isMaintenanceActive ? 'Maintenance Mode Active' : 'System Operational'}
              </div>
              <div style={styles.statusSubtext}>
                {isMaintenanceActive
                  ? currentMaintenance?.title || 'Manual maintenance in progress'
                  : 'All services are running normally'}
              </div>
            </div>
          </div>
          {onToggleMaintenance && (
            <button
              style={{
                ...styles.toggleButton,
                ...(isMaintenanceActive ? styles.toggleButtonDeactivate : styles.toggleButtonActivate),
              }}
              onClick={() => onToggleMaintenance(!isMaintenanceActive)}
            >
              {isMaintenanceActive ? <Play size={14} /> : <Pause size={14} />}
              {isMaintenanceActive ? 'End Maintenance' : 'Start Maintenance'}
            </button>
          )}
        </div>

        {isMaintenanceActive && currentMaintenance && (
          <div style={styles.statusDetails}>
            <div style={styles.detailItem}>
              <Clock size={14} />
              Started: {formatDateTime(currentMaintenance.startTime)}
            </div>
            <div style={styles.detailItem}>
              <Calendar size={14} />
              Expected End: {formatDateTime(currentMaintenance.endTime)}
            </div>
            <div style={styles.detailItem}>
              <Globe size={14} />
              {currentMaintenance.affectedServices.length} services affected
            </div>
            <div style={styles.detailItem}>
              <Users size={14} />
              {currentMaintenance.notifyUsers ? 'Users notified' : 'Silent mode'}
            </div>
          </div>
        )}
      </div>

      {/* Quick Settings */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Quick Settings</span>
        </div>
        <div style={styles.quickSettings}>
          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>
              <Bell size={14} />
              Notify users during maintenance
            </span>
            <div
              style={{
                ...styles.toggle,
                ...(notifyUsers ? styles.toggleEnabled : styles.toggleDisabled),
              }}
              onClick={() => setNotifyUsers(!notifyUsers)}
            >
              <div style={{ ...styles.toggleKnob, left: notifyUsers ? '22px' : '2px' }} />
            </div>
          </div>
          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>
              <Shield size={14} />
              Allow admin access during maintenance
            </span>
            <div
              style={{
                ...styles.toggle,
                ...(allowAdminAccess ? styles.toggleEnabled : styles.toggleDisabled),
              }}
              onClick={() => setAllowAdminAccess(!allowAdminAccess)}
            >
              <div style={{ ...styles.toggleKnob, left: allowAdminAccess ? '22px' : '2px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Scheduled Maintenance */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Scheduled Maintenance</span>
          <span style={{ fontSize: '0.75rem', color: '#888' }}>
            {scheduledMaintenance.length} upcoming
          </span>
        </div>
        <div style={styles.sectionContent}>
          {scheduledMaintenance.length === 0 ? (
            <div style={styles.empty}>
              <Calendar size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              No scheduled maintenance
            </div>
          ) : (
            scheduledMaintenance.map((m) => (
              <MaintenanceCard
                key={m.id}
                maintenance={m}
                onCancel={onCancelMaintenance ? () => onCancelMaintenance(m.id) : undefined}
                onEdit={onEditMaintenance ? () => onEditMaintenance(m.id) : undefined}
              />
            ))
          )}
        </div>
      </div>

      {/* Past Maintenance */}
      {pastMaintenance.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>Past Maintenance</span>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>
              Last {Math.min(pastMaintenance.length, 5)}
            </span>
          </div>
          <div style={styles.sectionContent}>
            {pastMaintenance.slice(0, 5).map((m) => (
              <MaintenanceCard key={m.id} maintenance={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceMode;
