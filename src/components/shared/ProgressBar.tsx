import React from 'react';

type ProgressVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
  className?: string;
}

const VARIANT_COLORS: Record<ProgressVariant, {
  bg: string;
  fill: string;
}> = {
  default: {
    bg: 'rgba(99, 102, 241, 0.2)',
    fill: '#6366f1',
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.2)',
    fill: '#10b981',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.2)',
    fill: '#f59e0b',
  },
  error: {
    bg: 'rgba(239, 68, 68, 0.2)',
    fill: '#ef4444',
  },
  info: {
    bg: 'rgba(59, 130, 246, 0.2)',
    fill: '#3b82f6',
  },
};

const SIZE_CONFIG: Record<ProgressSize, {
  height: string;
  borderRadius: string;
  fontSize: string;
}> = {
  sm: {
    height: '4px',
    borderRadius: '2px',
    fontSize: '0.7rem',
  },
  md: {
    height: '8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
  },
  lg: {
    height: '12px',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  labelText: {
    color: '#ccc',
  },
  percentage: {
    color: '#888',
    fontWeight: '500',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    transition: 'width 0.3s ease',
    position: 'relative',
  },
  striped: {
    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
    backgroundSize: '1rem 1rem',
  },
  animated: {
    animation: 'progress-stripes 1s linear infinite',
  },
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const colors = VARIANT_COLORS[variant];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div style={styles.container} className={className}>
      {(showLabel || label) && (
        <div style={{ ...styles.labelRow, fontSize: sizeConfig.fontSize }}>
          <span style={styles.labelText}>{label || 'Progress'}</span>
          <span style={styles.percentage}>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        style={{
          ...styles.track,
          height: sizeConfig.height,
          borderRadius: sizeConfig.borderRadius,
          background: colors.bg,
        }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          style={{
            ...styles.fill,
            ...(striped ? styles.striped : {}),
            ...(animated && striped ? styles.animated : {}),
            width: `${percentage}%`,
            background: colors.fill,
            borderRadius: sizeConfig.borderRadius,
          }}
        />
      </div>
    </div>
  );
};

// Circular progress variant
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const colors = VARIANT_COLORS[variant];
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className={className}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.bg}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.fill}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      {showLabel && (
        <span
          style={{
            position: 'absolute',
            fontSize: size * 0.25,
            fontWeight: '600',
            color: '#fff',
          }}
        >
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
