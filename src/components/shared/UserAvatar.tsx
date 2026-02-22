import React, { useState } from 'react';
import { User, Crown, Shield, Star } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'dnd';
type UserRole = 'admin' | 'moderator' | 'verified' | 'premium';

interface UserAvatarProps {
  name?: string;
  image?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  role?: UserRole;
  showStatus?: boolean;
  showRole?: boolean;
  onClick?: () => void;
  className?: string;
}

const SIZE_CONFIG: Record<AvatarSize, {
  size: string;
  fontSize: string;
  statusSize: string;
  roleSize: string;
  iconSize: number;
}> = {
  xs: { size: '24px', fontSize: '0.625rem', statusSize: '6px', roleSize: '12px', iconSize: 12 },
  sm: { size: '32px', fontSize: '0.75rem', statusSize: '8px', roleSize: '14px', iconSize: 14 },
  md: { size: '40px', fontSize: '0.875rem', statusSize: '10px', roleSize: '16px', iconSize: 16 },
  lg: { size: '56px', fontSize: '1.125rem', statusSize: '12px', roleSize: '20px', iconSize: 20 },
  xl: { size: '80px', fontSize: '1.5rem', statusSize: '16px', roleSize: '24px', iconSize: 28 },
};

const STATUS_COLORS: Record<AvatarStatus, string> = {
  online: '#10b981',
  offline: '#666',
  away: '#f59e0b',
  busy: '#ef4444',
  dnd: '#ef4444',
};

const ROLE_CONFIG: Record<UserRole, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = {
  admin: {
    icon: <Crown size={10} />,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.2)',
  },
  moderator: {
    icon: <Shield size={10} />,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.2)',
  },
  verified: {
    icon: <Star size={10} />,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.2)',
  },
  premium: {
    icon: <Star size={10} />,
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.2)',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'inline-flex',
  },
  avatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    fontWeight: '600',
    overflow: 'hidden',
    cursor: 'default',
    transition: 'all 0.15s',
  },
  avatarClickable: {
    cursor: 'pointer',
  },
  avatarHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  status: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: '50%',
    border: '2px solid #0a0a0f',
  },
  role: {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: '2px solid #0a0a0f',
  },
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorFromName = (name: string): string => {
  const colors = [
    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  image,
  size = 'md',
  status,
  role,
  showStatus = true,
  showRole = true,
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const sizeConfig = SIZE_CONFIG[size];
  const roleConfig = role ? ROLE_CONFIG[role] : null;

  const displayInitials = name ? getInitials(name) : '';
  const bgColor = name ? getColorFromName(name) : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';

  return (
    <div style={styles.container} className={className}>
      <div
        style={{
          ...styles.avatar,
          ...(onClick ? styles.avatarClickable : {}),
          ...(isHovered && onClick ? styles.avatarHover : {}),
          width: sizeConfig.size,
          height: sizeConfig.size,
          fontSize: sizeConfig.fontSize,
          background: image && !imageError ? 'transparent' : bgColor,
        }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={name}
      >
        {image && !imageError ? (
          <img
            src={image}
            alt={name || 'User'}
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : name ? (
          displayInitials
        ) : (
          <User size={sizeConfig.iconSize} />
        )}
      </div>

      {showStatus && status && (
        <div
          style={{
            ...styles.status,
            width: sizeConfig.statusSize,
            height: sizeConfig.statusSize,
            background: STATUS_COLORS[status],
          }}
          title={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      )}

      {showRole && roleConfig && (
        <div
          style={{
            ...styles.role,
            width: sizeConfig.roleSize,
            height: sizeConfig.roleSize,
            background: roleConfig.bgColor,
            color: roleConfig.color,
          }}
          title={role?.charAt(0).toUpperCase() + role?.slice(1)}
        >
          {roleConfig.icon}
        </div>
      )}
    </div>
  );
};

// Avatar group for stacked avatars
interface AvatarGroupProps {
  users: { name?: string; image?: string }[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 4,
  size = 'sm',
  className,
}) => {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
      className={className}
    >
      {visibleUsers.map((user, index) => (
        <div
          key={index}
          style={{
            marginLeft: index > 0 ? `-${parseInt(sizeConfig.size) / 3}px` : 0,
            zIndex: visibleUsers.length - index,
          }}
        >
          <UserAvatar
            name={user.name}
            image={user.image}
            size={size}
            showStatus={false}
            showRole={false}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          style={{
            marginLeft: `-${parseInt(sizeConfig.size) / 3}px`,
            width: sizeConfig.size,
            height: sizeConfig.size,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid #0a0a0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: sizeConfig.fontSize,
            fontWeight: '600',
            color: '#888',
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

// User info with avatar
interface UserInfoProps {
  name: string;
  subtitle?: string;
  image?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  onClick?: () => void;
  className?: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({
  name,
  subtitle,
  image,
  size = 'md',
  status,
  onClick,
  className,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      cursor: onClick ? 'pointer' : 'default',
    }}
    onClick={onClick}
    className={className}
  >
    <UserAvatar name={name} image={image} size={size} status={status} />
    <div>
      <div
        style={{
          fontSize: size === 'lg' || size === 'xl' ? '1rem' : '0.875rem',
          fontWeight: '500',
          color: '#fff',
        }}
      >
        {name}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: size === 'lg' || size === 'xl' ? '0.8125rem' : '0.75rem',
            color: '#888',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  </div>
);

export default UserAvatar;
