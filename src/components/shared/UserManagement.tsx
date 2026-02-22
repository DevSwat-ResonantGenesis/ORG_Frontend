import React, { useState } from 'react';
import { User, Shield, Mail, Calendar, MoreVertical, Search, Filter, UserPlus, Ban, CheckCircle, XCircle, Clock, Edit2, Trash2, Key } from 'lucide-react';

type UserRole = 'platform_owner' | 'admin' | 'developer' | 'user' | 'viewer';
type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLogin?: Date;
  credits?: number;
  tier?: string;
}

interface UserManagementTableProps {
  users: UserData[];
  onEditUser?: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onSuspendUser?: (userId: string) => void;
  onResetPassword?: (userId: string) => void;
  onChangeRole?: (userId: string, role: UserRole) => void;
  className?: string;
}

interface UserRowProps {
  user: UserData;
  onEdit?: () => void;
  onDelete?: () => void;
  onSuspend?: () => void;
  onResetPassword?: () => void;
  onChangeRole?: (role: UserRole) => void;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (user: Partial<UserData>) => void;
}

const ROLE_CONFIG: Record<UserRole, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  platform_owner: {
    label: 'Platform Owner',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  admin: {
    label: 'Admin',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  developer: {
    label: 'Developer',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  user: {
    label: 'User',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  viewer: {
    label: 'Viewer',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
  },
};

const STATUS_CONFIG: Record<UserStatus, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  active: {
    label: 'Active',
    color: '#10b981',
    icon: <CheckCircle size={12} />,
  },
  inactive: {
    label: 'Inactive',
    color: '#888',
    icon: <Clock size={12} />,
  },
  suspended: {
    label: 'Suspended',
    color: '#ef4444',
    icon: <Ban size={12} />,
  },
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    icon: <Clock size={12} />,
  },
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
  addButton: {
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
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  userName: {
    fontWeight: '500',
    color: '#fff',
  },
  userEmail: {
    fontSize: '0.75rem',
    color: '#888',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '500',
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
    minWidth: '160px',
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

const UserRow: React.FC<UserRowProps> = ({
  user,
  onEdit,
  onDelete,
  onSuspend,
  onResetPassword,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const roleConfig = ROLE_CONFIG[user.role];
  const statusConfig = STATUS_CONFIG[user.status];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
        <div style={styles.userCell}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} style={{ ...styles.avatar, objectFit: 'cover' }} />
          ) : (
            <div style={styles.avatar}>{getInitials(user.name)}</div>
          )}
          <div>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userEmail}>{user.email}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.roleBadge,
            background: roleConfig.bgColor,
            color: roleConfig.color,
          }}
        >
          {roleConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.statusBadge, color: statusConfig.color }}>
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </td>
      <td style={styles.td}>{user.tier || 'Free'}</td>
      <td style={styles.td}>{user.credits?.toLocaleString() || 0}</td>
      <td style={styles.td}>{formatDate(user.createdAt)}</td>
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
                Edit User
              </button>
            )}
            {onResetPassword && (
              <button style={styles.dropdownItem} onClick={onResetPassword}>
                <Key size={14} />
                Reset Password
              </button>
            )}
            {onSuspend && (
              <button
                style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                onClick={onSuspend}
              >
                <Ban size={14} />
                {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
              </button>
            )}
            {onDelete && (
              <button
                style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                onClick={onDelete}
              >
                <Trash2 size={14} />
                Delete User
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onEditUser,
  onDeleteUser,
  onSuspendUser,
  onResetPassword,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <span style={styles.title}>User Management</span>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search users..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button style={styles.addButton}>
            <UserPlus size={14} />
            Add User
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div style={styles.empty}>
          <User size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No users found</span>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Tier</th>
              <th style={styles.th}>Credits</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEdit={onEditUser ? () => onEditUser(user.id) : undefined}
                onDelete={onDeleteUser ? () => onDeleteUser(user.id) : undefined}
                onSuspend={onSuspendUser ? () => onSuspendUser(user.id) : undefined}
                onResetPassword={onResetPassword ? () => onResetPassword(user.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagementTable;
