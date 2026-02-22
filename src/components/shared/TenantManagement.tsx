import React, { useState } from 'react';
import { Building2, Plus, Search, Settings, Users, Database, Shield, CheckCircle, AlertTriangle, Clock, MoreVertical, Eye, Edit2, Trash2, Key, BarChart3 } from 'lucide-react';

type TenantStatus = 'active' | 'suspended' | 'trial' | 'pending';
type TenantTier = 'free' | 'starter' | 'professional' | 'enterprise';

interface TenantUsage {
  users: number;
  usersLimit: number;
  storage: number;
  storageLimit: number;
  apiCalls: number;
  apiCallsLimit: number;
}

interface TenantData {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  status: TenantStatus;
  tier: TenantTier;
  usage: TenantUsage;
  owner: {
    name: string;
    email: string;
  };
  createdAt: Date;
  lastActiveAt: Date;
  settings?: {
    ssoEnabled: boolean;
    mfaRequired: boolean;
    customBranding: boolean;
  };
}

interface TenantManagementProps {
  tenants: TenantData[];
  onCreateTenant?: () => void;
  onViewTenant?: (tenantId: string) => void;
  onEditTenant?: (tenantId: string) => void;
  onSuspendTenant?: (tenantId: string) => void;
  onDeleteTenant?: (tenantId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface TenantRowProps {
  tenant: TenantData;
  onView?: () => void;
  onEdit?: () => void;
  onSuspend?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<TenantStatus, {
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
  suspended: {
    label: 'Suspended',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  trial: {
    label: 'Trial',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
  pending: {
    label: 'Pending',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
};

const TIER_CONFIG: Record<TenantTier, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  free: { label: 'Free', color: '#888', bgColor: 'rgba(255, 255, 255, 0.05)' },
  starter: { label: 'Starter', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  professional: { label: 'Professional', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  enterprise: { label: 'Enterprise', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
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
  tenantCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  tenantIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#818cf8',
    fontSize: '0.875rem',
    fontWeight: '700',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  tenantSlug: {
    fontSize: '0.6875rem',
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
  tierBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  usageCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  usageItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  usageLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    width: '50px',
  },
  usageBar: {
    flex: 1,
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    minWidth: '60px',
  },
  usageFill: {
    height: '100%',
    borderRadius: '2px',
  },
  usageValue: {
    fontSize: '0.6875rem',
    color: '#e4e4e7',
    width: '60px',
    textAlign: 'right',
  },
  ownerCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  ownerName: {
    fontWeight: '500',
    color: '#e4e4e7',
    marginBottom: '0.125rem',
  },
  ownerEmail: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  settingsBadges: {
    display: 'flex',
    gap: '0.375rem',
  },
  settingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    fontSize: '0.6875rem',
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
    padding: '0.375rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
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

const getUsageColor = (percent: number) => {
  if (percent >= 90) return '#ef4444';
  if (percent >= 75) return '#f59e0b';
  return '#10b981';
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const TenantRow: React.FC<TenantRowProps> = ({
  tenant,
  onView,
  onEdit,
  onSuspend,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[tenant.status];
  const tierConfig = TIER_CONFIG[tenant.tier];

  const usersPercent = (tenant.usage.users / tenant.usage.usersLimit) * 100;
  const storagePercent = (tenant.usage.storage / tenant.usage.storageLimit) * 100;
  const apiPercent = (tenant.usage.apiCalls / tenant.usage.apiCallsLimit) * 100;

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={styles.td}>
        <div style={styles.tenantCell}>
          <div style={styles.tenantIcon}>
            {tenant.name.charAt(0).toUpperCase()}
          </div>
          <div style={styles.tenantInfo}>
            <div style={styles.tenantName}>{tenant.name}</div>
            <div style={styles.tenantSlug}>{tenant.slug}</div>
          </div>
        </div>
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
      <td style={styles.td}>
        <span
          style={{
            ...styles.tierBadge,
            background: tierConfig.bgColor,
            color: tierConfig.color,
          }}
        >
          {tierConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.usageCell}>
          <div style={styles.usageItem}>
            <span style={styles.usageLabel}>Users</span>
            <div style={styles.usageBar}>
              <div
                style={{
                  ...styles.usageFill,
                  width: `${usersPercent}%`,
                  background: getUsageColor(usersPercent),
                }}
              />
            </div>
            <span style={styles.usageValue}>
              {tenant.usage.users}/{tenant.usage.usersLimit}
            </span>
          </div>
          <div style={styles.usageItem}>
            <span style={styles.usageLabel}>Storage</span>
            <div style={styles.usageBar}>
              <div
                style={{
                  ...styles.usageFill,
                  width: `${storagePercent}%`,
                  background: getUsageColor(storagePercent),
                }}
              />
            </div>
            <span style={styles.usageValue}>
              {(tenant.usage.storage / 1024).toFixed(1)}GB
            </span>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.ownerCell}>
          <span style={styles.ownerName}>{tenant.owner.name}</span>
          <span style={styles.ownerEmail}>{tenant.owner.email}</span>
        </div>
      </td>
      <td style={styles.td}>
        {tenant.settings && (
          <div style={styles.settingsBadges}>
            {tenant.settings.ssoEnabled && (
              <span
                style={{
                  ...styles.settingBadge,
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                }}
                title="SSO Enabled"
              >
                <Key size={12} />
              </span>
            )}
            {tenant.settings.mfaRequired && (
              <span
                style={{
                  ...styles.settingBadge,
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                }}
                title="MFA Required"
              >
                <Shield size={12} />
              </span>
            )}
          </div>
        )}
      </td>
      <td style={styles.td}>{formatTimeAgo(tenant.lastActiveAt)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {onView && (
            <button style={styles.actionButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={styles.actionButton} onClick={onEdit} title="Edit">
              <Settings size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const TenantManagement: React.FC<TenantManagementProps> = ({
  tenants,
  onCreateTenant,
  onViewTenant,
  onEditTenant,
  onSuspendTenant,
  onDeleteTenant,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTenants = tenants.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const trialTenants = tenants.filter(t => t.status === 'trial').length;
  const totalUsers = tenants.reduce((sum, t) => sum + t.usage.users, 0);
  const enterpriseTenants = tenants.filter(t => t.tier === 'enterprise').length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Building2 size={22} />
          Tenant Management
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search tenants..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateTenant && (
            <button style={styles.createButton} onClick={onCreateTenant}>
              <Plus size={14} />
              Add Tenant
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Building2 size={20} />
          </div>
          <div style={styles.statValue}>{activeTenants}</div>
          <div style={styles.statLabel}>Active Tenants</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{trialTenants}</div>
          <div style={styles.statLabel}>On Trial</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Users size={20} />
          </div>
          <div style={styles.statValue}>{totalUsers}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{enterpriseTenants}</div>
          <div style={styles.statLabel}>Enterprise</div>
        </div>
      </div>

      {/* Tenants Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>All Tenants ({filteredTenants.length})</span>
        </div>
        {filteredTenants.length === 0 ? (
          <div style={styles.empty}>
            <Building2 size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No tenants found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tenant</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Tier</th>
                <th style={styles.th}>Usage</th>
                <th style={styles.th}>Owner</th>
                <th style={styles.th}>Settings</th>
                <th style={styles.th}>Last Active</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <TenantRow
                  key={tenant.id}
                  tenant={tenant}
                  onView={onViewTenant ? () => onViewTenant(tenant.id) : undefined}
                  onEdit={onEditTenant ? () => onEditTenant(tenant.id) : undefined}
                  onSuspend={onSuspendTenant ? () => onSuspendTenant(tenant.id) : undefined}
                  onDelete={onDeleteTenant ? () => onDeleteTenant(tenant.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TenantManagement;
