import React from 'react';
import { User, Bot } from 'lucide-react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarShape = 'circle' | 'rounded';
type StatusType = 'online' | 'offline' | 'busy' | 'away';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: StatusType;
  isAgent?: boolean;
  className?: string;
  onClick?: () => void;
}

const SIZE_CONFIG: Record<AvatarSize, {
  container: string;
  fontSize: string;
  iconSize: number;
  statusSize: string;
  statusOffset: string;
}> = {
  xs: {
    container: '24px',
    fontSize: '0.625rem',
    iconSize: 12,
    statusSize: '8px',
    statusOffset: '-1px',
  },
  sm: {
    container: '32px',
    fontSize: '0.75rem',
    iconSize: 14,
    statusSize: '10px',
    statusOffset: '-2px',
  },
  md: {
    container: '40px',
    fontSize: '0.875rem',
    iconSize: 18,
    statusSize: '12px',
    statusOffset: '-2px',
  },
  lg: {
    container: '56px',
    fontSize: '1.125rem',
    iconSize: 24,
    statusSize: '14px',
    statusOffset: '-3px',
  },
  xl: {
    container: '80px',
    fontSize: '1.5rem',
    iconSize: 32,
    statusSize: '16px',
    statusOffset: '-4px',
  },
};

const STATUS_COLORS: Record<StatusType, string> = {
  online: '#10b981',
  offline: '#6b7280',
  busy: '#ef4444',
  away: '#f59e0b',
};

const GRADIENT_COLORS = [
  ['#6366f1', '#8b5cf6'],
  ['#ec4899', '#f43f5e'],
  ['#14b8a6', '#06b6d4'],
  ['#f59e0b', '#eab308'],
  ['#10b981', '#34d399'],
  ['#3b82f6', '#60a5fa'],
];

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const getGradient = (name: string): string[] => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENT_COLORS[hash % GRADIENT_COLORS.length];
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
  },
  avatar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontWeight: '600',
    color: '#fff',
    transition: 'all 0.2s',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  status: {
    position: 'absolute',
    borderRadius: '50%',
    border: '2px solid #1a1a24',
  },
  clickable: {
    cursor: 'pointer',
  },
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  isAgent = false,
  className,
  onClick,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const [imageError, setImageError] = React.useState(false);

  const borderRadius = shape === 'circle' ? '50%' : '12px';
  const gradient = name ? getGradient(name) : GRADIENT_COLORS[0];

  const renderContent = () => {
    if (src && !imageError) {
      return (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          style={styles.image as React.CSSProperties}
          onError={() => setImageError(true)}
        />
      );
    }

    if (name) {
      return <span>{getInitials(name)}</span>;
    }

    if (isAgent) {
      return <Bot size={sizeConfig.iconSize} />;
    }

    return <User size={sizeConfig.iconSize} />;
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(onClick ? styles.clickable : {}),
      }}
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div
        style={{
          ...styles.avatar,
          width: sizeConfig.container,
          height: sizeConfig.container,
          borderRadius,
          fontSize: sizeConfig.fontSize,
          background: src && !imageError
            ? '#2a2a3a'
            : `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        }}
      >
        {renderContent()}
      </div>

      {status && (
        <span
          style={{
            ...styles.status,
            width: sizeConfig.statusSize,
            height: sizeConfig.statusSize,
            bottom: sizeConfig.statusOffset,
            right: sizeConfig.statusOffset,
            background: STATUS_COLORS[status],
          }}
          title={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      )}
    </div>
  );
};

// Avatar Group for showing multiple avatars
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    isAgent?: boolean;
  }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'sm',
  className,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
      className={className}
    >
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          style={{
            marginLeft: index === 0 ? 0 : `-${parseInt(sizeConfig.container) / 3}px`,
            zIndex: visibleAvatars.length - index,
          }}
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            isAgent={avatar.isAgent}
            size={size}
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          style={{
            marginLeft: `-${parseInt(sizeConfig.container) / 3}px`,
            width: sizeConfig.container,
            height: sizeConfig.container,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '2px solid #1a1a24',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: sizeConfig.fontSize,
            color: '#888',
            fontWeight: '500',
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;
