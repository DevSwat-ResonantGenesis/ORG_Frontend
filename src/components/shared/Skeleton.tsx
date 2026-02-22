import React from 'react';

type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'block',
  },
  text: {
    borderRadius: '4px',
    height: '1em',
    width: '100%',
  },
  circular: {
    borderRadius: '50%',
  },
  rectangular: {
    borderRadius: '0',
  },
  rounded: {
    borderRadius: '8px',
  },
  pulse: {
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  },
  wave: {
    position: 'relative',
    overflow: 'hidden',
  },
};

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className,
}) => {
  const getVariantStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'circular':
        return styles.circular;
      case 'rectangular':
        return styles.rectangular;
      case 'rounded':
        return styles.rounded;
      default:
        return styles.text;
    }
  };

  const getAnimationStyle = (): React.CSSProperties => {
    if (animation === 'pulse') {
      return styles.pulse;
    }
    if (animation === 'wave') {
      return styles.wave;
    }
    return {};
  };

  const style: React.CSSProperties = {
    ...styles.base,
    ...getVariantStyle(),
    ...getAnimationStyle(),
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <span style={style} className={className} aria-hidden="true">
      {animation === 'wave' && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            animation: 'skeleton-wave 1.5s linear infinite',
          }}
        />
      )}
    </span>
  );
};

// Text skeleton with multiple lines
interface SkeletonTextProps {
  lines?: number;
  lineHeight?: string;
  gap?: string;
  lastLineWidth?: string;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lineHeight = '1em',
  gap = '0.5rem',
  lastLineWidth = '60%',
  animation = 'pulse',
  className,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }} className={className}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        height={lineHeight}
        width={index === lines - 1 ? lastLineWidth : '100%'}
        animation={animation}
      />
    ))}
  </div>
);

// Avatar skeleton
interface SkeletonAvatarProps {
  size?: number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 40,
  animation = 'pulse',
  className,
}) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
    animation={animation}
    className={className}
  />
);

// Card skeleton
interface SkeletonCardProps {
  hasImage?: boolean;
  imageHeight?: number;
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  hasImage = true,
  imageHeight = 200,
  lines = 3,
  animation = 'pulse',
  className,
}) => (
  <div
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    }}
    className={className}
  >
    {hasImage && (
      <Skeleton
        variant="rectangular"
        width="100%"
        height={imageHeight}
        animation={animation}
      />
    )}
    <div style={{ padding: '1rem' }}>
      <Skeleton
        variant="text"
        width="60%"
        height="1.25em"
        animation={animation}
      />
      <div style={{ marginTop: '0.75rem' }}>
        <SkeletonText lines={lines} animation={animation} />
      </div>
    </div>
  </div>
);

// Table row skeleton
interface SkeletonTableRowProps {
  columns?: number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonTableRow: React.FC<SkeletonTableRowProps> = ({
  columns = 4,
  animation = 'pulse',
  className,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '1rem',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }}
    className={className}
  >
    {Array.from({ length: columns }).map((_, index) => (
      <Skeleton
        key={index}
        variant="text"
        width={index === 0 ? '80%' : '60%'}
        animation={animation}
      />
    ))}
  </div>
);

// List item skeleton
interface SkeletonListItemProps {
  hasAvatar?: boolean;
  hasSecondaryText?: boolean;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const SkeletonListItem: React.FC<SkeletonListItemProps> = ({
  hasAvatar = true,
  hasSecondaryText = true,
  animation = 'pulse',
  className,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 0',
    }}
    className={className}
  >
    {hasAvatar && <SkeletonAvatar size={40} animation={animation} />}
    <div style={{ flex: 1 }}>
      <Skeleton variant="text" width="40%" height="1em" animation={animation} />
      {hasSecondaryText && (
        <Skeleton
          variant="text"
          width="70%"
          height="0.875em"
          animation={animation}
        />
      )}
    </div>
  </div>
);

export default Skeleton;
