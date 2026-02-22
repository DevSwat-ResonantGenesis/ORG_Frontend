import React, { useState } from 'react';
import { Shield, Check, X, Minus, Search, ChevronRight, ChevronDown, Users, Lock, Eye, Edit2, Trash2, Plus, Settings } from 'lucide-react';

type PermissionLevel = 'full' | 'read' | 'write' | 'none' | 'custom';
type ResourceType = 'users' | 'agents' | 'billing' | 'settings' | 'analytics' | 'api' | 'logs' | 'security';

interface Permission {
  id: string;
  resource: ResourceType;
  action: string;
  description: string;
}

interface RolePermission {
  permissionId: string;
  level: PermissionLevel;
  conditions?: string[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  userCount: number;
  permissions: RolePermission[];
}

interface PermissionMatrixProps {
  roles: Role[];
  permissions: Permission[];
  onUpdatePermission?: (roleId: string, permissionId: string, level: PermissionLevel) => void;
  onEditRole?: (roleId: string) => void;
  onCreateRole?: () => void;
  className?: string;
}

const RESOURCE_CONFIG: Record<ResourceType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  users: { label: 'Users', icon: <Users size={14} />, color: '#3b82f6' },
  agents: { label: 'Agents', icon: <Settings size={14} />, color: '#8b5cf6' },
  billing: { label: 'Billing', icon: <Shield size={14} />, color: '#10b981' },
  settings: { label: 'Settings', icon: <Settings size={14} />, color: '#f59e0b' },
  analytics: { label: 'Analytics', icon: <Eye size={14} />, color: '#ec4899' },
  api: { label: 'API', icon: <Lock size={14} />, color: '#14b8a6' },
  logs: { label: 'Logs', icon: <Eye size={14} />, color: '#6366f1' },
  security: { label: 'Security', icon: <Shield size={14} />, color: '#ef4444' },
};

const LEVEL_CONFIG: Record<PermissionLevel, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  full: {
    label: 'Full',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <Check size={14} />,
  },
  read: {
    label: 'Read',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Eye size={14} />,
  },
  write: {
    label: 'Write',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Edit2 size={14} />,
  },
  none: {
    label: 'None',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <X size={14} />,
  },
  custom: {
    label: 'Custom',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    icon: <Minus size={14} />,
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
  legend: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '0.75rem 1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  legendIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'auto',
  },
  matrix: {
    display: 'grid',
    minWidth: '800px',
  },
  headerRow: {
    display: 'contents',
  },
  headerCell: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  cornerCell: {
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.04)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    position: 'sticky',
    top: 0,
    left: 0,
    zIndex: 20,
  },
  roleHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.375rem',
    minWidth: '100px',
  },
  roleName: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  roleUserCount: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  systemBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.5625rem',
    fontWeight: '600',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  permissionRow: {
    display: 'contents',
  },
  permissionCell: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
    position: 'sticky',
    left: 0,
    zIndex: 5,
  },
  permissionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  permissionIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  permissionName: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  permissionDescription: {
    fontSize: '0.6875rem',
    color: '#666',
  },
  valueCell: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  levelDropdown: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '0.25rem',
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.375rem',
    minWidth: '100px',
    zIndex: 100,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  levelOption: {
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
  resourceGroup: {
    marginBottom: '0.5rem',
  },
  resourceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.04)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    cursor: 'pointer',
  },
  resourceLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
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

interface PermissionCellProps {
  roleId: string;
  permissionId: string;
  level: PermissionLevel;
  onUpdate?: (level: PermissionLevel) => void;
}

const PermissionCell: React.FC<PermissionCellProps> = ({
  roleId,
  permissionId,
  level,
  onUpdate,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const levelConfig = LEVEL_CONFIG[level];

  const handleSelect = (newLevel: PermissionLevel) => {
    onUpdate?.(newLevel);
    setShowDropdown(false);
  };

  return (
    <div style={{ ...styles.valueCell, position: 'relative' }}>
      <button
        style={{
          ...styles.levelButton,
          background: levelConfig.bgColor,
          color: levelConfig.color,
        }}
        onClick={() => setShowDropdown(!showDropdown)}
        title={levelConfig.label}
      >
        {levelConfig.icon}
      </button>
      {showDropdown && (
        <div style={styles.levelDropdown}>
          {Object.entries(LEVEL_CONFIG).map(([key, config]) => (
            <button
              key={key}
              style={styles.levelOption}
              onClick={() => handleSelect(key as PermissionLevel)}
            >
              <span style={{ color: config.color }}>{config.icon}</span>
              {config.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  roles,
  permissions,
  onUpdatePermission,
  onEditRole,
  onCreateRole,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedResources, setExpandedResources] = useState<Set<ResourceType>>(
    new Set(Object.keys(RESOURCE_CONFIG) as ResourceType[])
  );

  const filteredPermissions = permissions.filter(p =>
    p.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedPermissions = filteredPermissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<ResourceType, Permission[]>);

  const toggleResource = (resource: ResourceType) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resource)) {
      newExpanded.delete(resource);
    } else {
      newExpanded.add(resource);
    }
    setExpandedResources(newExpanded);
  };

  const getPermissionLevel = (role: Role, permissionId: string): PermissionLevel => {
    const perm = role.permissions.find(p => p.permissionId === permissionId);
    return perm?.level || 'none';
  };

  const gridColumns = `250px repeat(${roles.length}, 120px)`;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Shield size={22} />
          Permission Matrix
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search permissions..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateRole && (
            <button style={styles.createButton} onClick={onCreateRole}>
              <Plus size={14} />
              Add Role
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        {Object.entries(LEVEL_CONFIG).map(([key, config]) => (
          <div key={key} style={styles.legendItem}>
            <div
              style={{
                ...styles.legendIcon,
                background: config.bgColor,
                color: config.color,
              }}
            >
              {config.icon}
            </div>
            {config.label}
          </div>
        ))}
      </div>

      {/* Matrix */}
      <div style={styles.matrixContainer}>
        <div style={{ ...styles.matrix, gridTemplateColumns: gridColumns }}>
          {/* Header Row */}
          <div style={styles.cornerCell}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#888' }}>
              PERMISSIONS
            </span>
          </div>
          {roles.map((role) => (
            <div key={role.id} style={styles.headerCell}>
              <div style={styles.roleHeader}>
                <span style={styles.roleName}>{role.name}</span>
                {role.isSystem && <span style={styles.systemBadge}>System</span>}
                <span style={styles.roleUserCount}>{role.userCount} users</span>
              </div>
            </div>
          ))}

          {/* Permission Rows by Resource */}
          {Object.entries(groupedPermissions).map(([resource, perms]) => {
            const resourceConfig = RESOURCE_CONFIG[resource as ResourceType];
            const isExpanded = expandedResources.has(resource as ResourceType);

            return (
              <React.Fragment key={resource}>
                {/* Resource Header */}
                <div
                  style={{
                    ...styles.resourceHeader,
                    gridColumn: `1 / -1`,
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleResource(resource as ResourceType)}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: `${resourceConfig.color}20`,
                      color: resourceConfig.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {resourceConfig.icon}
                  </div>
                  <span style={styles.resourceLabel}>{resourceConfig.label}</span>
                  <span style={{ fontSize: '0.6875rem', color: '#666', marginLeft: 'auto' }}>
                    {perms.length} permissions
                  </span>
                </div>

                {/* Permission Rows */}
                {isExpanded && perms.map((perm) => (
                  <React.Fragment key={perm.id}>
                    <div style={styles.permissionCell}>
                      <div style={styles.permissionInfo}>
                        <div>
                          <div style={styles.permissionName}>{perm.action}</div>
                          <div style={styles.permissionDescription}>{perm.description}</div>
                        </div>
                      </div>
                    </div>
                    {roles.map((role) => (
                      <PermissionCell
                        key={`${role.id}-${perm.id}`}
                        roleId={role.id}
                        permissionId={perm.id}
                        level={getPermissionLevel(role, perm.id)}
                        onUpdate={
                          onUpdatePermission
                            ? (level) => onUpdatePermission(role.id, perm.id, level)
                            : undefined
                        }
                      />
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PermissionMatrix;
