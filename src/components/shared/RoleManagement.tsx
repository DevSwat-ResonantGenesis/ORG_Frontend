import React, { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, MoreVertical, Search, CheckCircle, Users, Lock, Unlock, Eye, Settings, Key, Bot, CreditCard, BarChart3, Database } from 'lucide-react';

type PermissionCategory = 'users' | 'agents' | 'billing' | 'settings' | 'analytics' | 'system';
type PermissionLevel = 'none' | 'read' | 'write' | 'admin';

interface Permission {
  category: PermissionCategory;
  level: PermissionLevel;
}

interface RoleData {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface RoleManagementProps {
  roles: RoleData[];
  onCreateRole?: () => void;
  onEditRole?: (roleId: string) => void;
  onDeleteRole?: (roleId: string) => void;
  onViewUsers?: (roleId: string) => void;
  className?: string;
}

interface RoleCardProps {
  role: RoleData;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewUsers?: () => void;
}

const CATEGORY_CONFIG: Record<PermissionCategory, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  users: { label: 'Users', icon: <Users size={14} />, color: '#3b82f6' },
  agents: { label: 'Agents', icon: <Bot size={14} />, color: '#8b5cf6' },
  billing: { label: 'Billing', icon: <CreditCard size={14} />, color: '#10b981' },
  settings: { label: 'Settings', icon: <Settings size={14} />, color: '#f59e0b' },
  analytics: { label: 'Analytics', icon: <BarChart3 size={14} />, color: '#ec4899' },
  system: { label: 'System', icon: <Database size={14} />, color: '#ef4444' },
};

const LEVEL_CONFIG: Record<PermissionLevel, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  none: { label: 'None', color: '#666', bgColor: 'rgba(255, 255, 255, 0.03)' },
  read: { label: 'Read', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  write: { label: 'Write', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  admin: { label: 'Admin', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
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
    width: '180px',
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
    padding: '1rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  roleIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  roleName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  roleDescription: {
    fontSize: '0.75rem',
    color: '#888',
  },
  systemBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  cardBody: {
    padding: '1.25rem',
  },
  permissionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  permissionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
  },
  permissionCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  permissionLevel: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
  },
  userCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    color: '#888',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonPrimary: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
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
    padding: '3rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#666',
  },
};

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  onEdit,
  onDelete,
  onViewUsers,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>
          <div style={styles.roleIcon}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={styles.roleName}>{role.name}</span>
              {role.isSystem && (
                <span style={styles.systemBadge}>
                  <Lock size={10} />
                  System
                </span>
              )}
            </div>
            {role.description && (
              <span style={styles.roleDescription}>{role.description}</span>
            )}
          </div>
        </div>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.permissionsGrid}>
          {role.permissions.map((perm) => {
            const categoryConfig = CATEGORY_CONFIG[perm.category];
            const levelConfig = LEVEL_CONFIG[perm.level];
            return (
              <div key={perm.category} style={styles.permissionItem}>
                <span style={{ ...styles.permissionCategory, color: categoryConfig.color }}>
                  {categoryConfig.icon}
                  {categoryConfig.label}
                </span>
                <span
                  style={{
                    ...styles.permissionLevel,
                    background: levelConfig.bgColor,
                    color: levelConfig.color,
                  }}
                >
                  {levelConfig.label}
                </span>
              </div>
            );
          })}
        </div>

        <div style={styles.userCount}>
          <Users size={14} />
          <span style={{ fontWeight: '600', color: '#fff' }}>
            {role.userCount.toLocaleString()}
          </span>
          users with this role
        </div>
      </div>

      <div style={styles.cardActions}>
        {onViewUsers && (
          <button style={styles.actionButton} onClick={onViewUsers}>
            <Eye size={14} />
            View Users
          </button>
        )}
        {onEdit && !role.isSystem && (
          <button style={{ ...styles.actionButton, ...styles.actionButtonPrimary }} onClick={onEdit}>
            <Edit2 size={14} />
            Edit
          </button>
        )}
        {onDelete && !role.isSystem && (
          <button
            style={{ ...styles.actionButton, ...styles.actionButtonDanger }}
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export const RoleManagement: React.FC<RoleManagementProps> = ({
  roles,
  onCreateRole,
  onEditRole,
  onDeleteRole,
  onViewUsers,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);
  const systemRoles = roles.filter(r => r.isSystem).length;
  const customRoles = roles.filter(r => !r.isSystem).length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Shield size={22} />
          Role Management
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search roles..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateRole && (
            <button style={styles.createButton} onClick={onCreateRole}>
              <Plus size={14} />
              Create Role
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{roles.length}</span>
          <span style={styles.statLabel}>Total Roles</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#818cf8' }}>{systemRoles}</span>
          <span style={styles.statLabel}>System</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#10b981' }}>{customRoles}</span>
          <span style={styles.statLabel}>Custom</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{totalUsers.toLocaleString()}</span>
          <span style={styles.statLabel}>Total Users</span>
        </div>
      </div>

      {/* Grid */}
      {filteredRoles.length === 0 ? (
        <div style={styles.empty}>
          <Shield size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No roles found</span>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={onEditRole ? () => onEditRole(role.id) : undefined}
              onDelete={onDeleteRole ? () => onDeleteRole(role.id) : undefined}
              onViewUsers={onViewUsers ? () => onViewUsers(role.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
