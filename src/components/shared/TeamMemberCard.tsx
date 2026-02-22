import React, { useState } from 'react';
import { User, Mail, Shield, MoreVertical, Crown, UserMinus, Edit2, Key } from 'lucide-react';

type MemberRole = 'owner' | 'admin' | 'member' | 'viewer' | 'pending';
type MemberStatus = 'active' | 'invited' | 'suspended';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt?: Date;
  lastActive?: Date;
}

interface TeamMemberCardProps {
  member: TeamMember;
  currentUserRole?: MemberRole;
  onChangeRole?: (role: MemberRole) => void;
  onRemove?: () => void;
  onResendInvite?: () => void;
  className?: string;
}

interface TeamMemberListProps {
  members: TeamMember[];
  currentUserRole?: MemberRole;
  onChangeRole?: (id: string, role: MemberRole) => void;
  onRemove?: (id: string) => void;
  onResendInvite?: (id: string) => void;
  className?: string;
}

const ROLE_CONFIG: Record<MemberRole, {
  label: string;
  color: string;
  bgColor: string;
  icon?: React.ReactNode;
}> = {
  owner: {
    label: 'Owner',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Crown size={12} />,
  },
  admin: {
    label: 'Admin',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    icon: <Shield size={12} />,
  },
  member: {
    label: 'Member',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  viewer: {
    label: 'Viewer',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
  },
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
};

const STATUS_CONFIG: Record<MemberStatus, {
  color: string;
  label: string;
}> = {
  active: { color: '#10b981', label: 'Active' },
  invited: { color: '#f59e0b', label: 'Invited' },
  suspended: { color: '#ef4444', label: 'Suspended' },
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '10px',
    transition: 'all 0.15s',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    fontWeight: '600',
    fontSize: '1rem',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  email: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.125rem',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  actions: {
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
  actionButtonHover: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.25rem',
    minWidth: '160px',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    zIndex: 100,
    overflow: 'hidden',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.8125rem',
    color: '#e4e4e7',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  dropdownItemHover: {
    background: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemDanger: {
    color: '#ef4444',
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.06)',
    margin: '0.25rem 0',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  listTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  memberCount: {
    fontSize: '0.75rem',
    color: '#666',
  },
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  currentUserRole,
  onChangeRole,
  onRemove,
  onResendInvite,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [hoveredDropdownItem, setHoveredDropdownItem] = useState<string | null>(null);

  const roleConfig = ROLE_CONFIG[member.role];
  const statusConfig = STATUS_CONFIG[member.status];
  const canManage = currentUserRole === 'owner' || (currentUserRole === 'admin' && member.role !== 'owner');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowDropdown(false);
      }}
      className={className}
    >
      <div style={styles.avatar}>
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} style={styles.avatarImage} />
        ) : (
          getInitials(member.name)
        )}
      </div>

      <div style={styles.info}>
        <h4 style={styles.name}>
          {member.name}
          <span
            style={{
              ...styles.roleBadge,
              background: roleConfig.bgColor,
              color: roleConfig.color,
            }}
          >
            {roleConfig.icon}
            {roleConfig.label}
          </span>
        </h4>
        <div style={styles.email}>{member.email}</div>
      </div>

      <div
        style={{
          ...styles.statusDot,
          background: statusConfig.color,
        }}
        title={statusConfig.label}
      />

      {canManage && (
        <div style={{ position: 'relative' }}>
          <button
            style={{
              ...styles.actionButton,
              ...(hoveredAction === 'more' ? styles.actionButtonHover : {}),
            }}
            onClick={() => setShowDropdown(!showDropdown)}
            onMouseEnter={() => setHoveredAction('more')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <MoreVertical size={16} />
          </button>

          {showDropdown && (
            <div style={styles.dropdown}>
              {member.status === 'invited' && onResendInvite && (
                <div
                  style={{
                    ...styles.dropdownItem,
                    ...(hoveredDropdownItem === 'resend' ? styles.dropdownItemHover : {}),
                  }}
                  onClick={() => {
                    onResendInvite();
                    setShowDropdown(false);
                  }}
                  onMouseEnter={() => setHoveredDropdownItem('resend')}
                  onMouseLeave={() => setHoveredDropdownItem(null)}
                >
                  <Mail size={14} />
                  Resend Invite
                </div>
              )}

              {onChangeRole && member.role !== 'owner' && (
                <>
                  <div
                    style={{
                      ...styles.dropdownItem,
                      ...(hoveredDropdownItem === 'role' ? styles.dropdownItemHover : {}),
                    }}
                    onClick={() => {
                      onChangeRole(member.role === 'admin' ? 'member' : 'admin');
                      setShowDropdown(false);
                    }}
                    onMouseEnter={() => setHoveredDropdownItem('role')}
                    onMouseLeave={() => setHoveredDropdownItem(null)}
                  >
                    <Shield size={14} />
                    {member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </div>
                  <div style={styles.dropdownDivider} />
                </>
              )}

              {onRemove && member.role !== 'owner' && (
                <div
                  style={{
                    ...styles.dropdownItem,
                    ...styles.dropdownItemDanger,
                    ...(hoveredDropdownItem === 'remove' ? styles.dropdownItemHover : {}),
                  }}
                  onClick={() => {
                    onRemove();
                    setShowDropdown(false);
                  }}
                  onMouseEnter={() => setHoveredDropdownItem('remove')}
                  onMouseLeave={() => setHoveredDropdownItem(null)}
                >
                  <UserMinus size={14} />
                  Remove Member
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  currentUserRole,
  onChangeRole,
  onRemove,
  onResendInvite,
  className,
}) => {
  const activeMembers = members.filter((m) => m.status === 'active');
  const pendingMembers = members.filter((m) => m.status === 'invited');

  return (
    <div className={className}>
      {activeMembers.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={styles.listHeader}>
            <span style={styles.listTitle}>Team Members</span>
            <span style={styles.memberCount}>{activeMembers.length}</span>
          </div>
          <div style={styles.list}>
            {activeMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                currentUserRole={currentUserRole}
                onChangeRole={onChangeRole ? (role) => onChangeRole(member.id, role) : undefined}
                onRemove={onRemove ? () => onRemove(member.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {pendingMembers.length > 0 && (
        <div>
          <div style={styles.listHeader}>
            <span style={styles.listTitle}>Pending Invites</span>
            <span style={styles.memberCount}>{pendingMembers.length}</span>
          </div>
          <div style={styles.list}>
            {pendingMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                currentUserRole={currentUserRole}
                onRemove={onRemove ? () => onRemove(member.id) : undefined}
                onResendInvite={onResendInvite ? () => onResendInvite(member.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberCard;
