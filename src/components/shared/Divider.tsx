import React from 'react';

type DividerOrientation = 'horizontal' | 'vertical';
type DividerVariant = 'solid' | 'dashed' | 'dotted';

interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  color?: string;
  thickness?: number;
  spacing?: string;
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  horizontal: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  vertical: {
    height: '100%',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.1)',
  },
  lineVertical: {
    width: '1px',
    flex: 1,
    background: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    padding: '0 1rem',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  labelVertical: {
    padding: '0.5rem 0',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
  },
};

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'solid',
  color,
  thickness = 1,
  spacing = '1rem',
  label,
  labelPosition = 'center',
  className,
}) => {
  const isHorizontal = orientation === 'horizontal';

  const lineStyle: React.CSSProperties = {
    ...(isHorizontal ? styles.line : styles.lineVertical),
    background: color || 'rgba(255, 255, 255, 0.1)',
    height: isHorizontal ? `${thickness}px` : undefined,
    width: !isHorizontal ? `${thickness}px` : undefined,
    borderStyle: variant !== 'solid' ? variant : undefined,
    borderWidth: variant !== 'solid' ? `${thickness}px` : undefined,
    borderColor: variant !== 'solid' ? (color || 'rgba(255, 255, 255, 0.1)') : undefined,
    background: variant === 'solid' ? (color || 'rgba(255, 255, 255, 0.1)') : 'transparent',
  };

  const containerStyle: React.CSSProperties = {
    ...(isHorizontal ? styles.horizontal : styles.vertical),
    margin: isHorizontal ? `${spacing} 0` : `0 ${spacing}`,
  };

  if (!label) {
    return (
      <div style={containerStyle} className={className} role="separator">
        <div style={lineStyle} />
      </div>
    );
  }

  const labelStyle: React.CSSProperties = {
    ...styles.label,
    ...(!isHorizontal ? styles.labelVertical : {}),
  };

  if (isHorizontal) {
    return (
      <div style={containerStyle} className={className} role="separator">
        {labelPosition !== 'left' && <div style={lineStyle} />}
        <span style={labelStyle}>{label}</span>
        {labelPosition !== 'right' && <div style={lineStyle} />}
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className} role="separator">
      {labelPosition !== 'left' && <div style={lineStyle} />}
      <span style={labelStyle}>{label}</span>
      {labelPosition !== 'right' && <div style={lineStyle} />}
    </div>
  );
};

// Spacer component for adding space
interface SpacerProps {
  size?: string | number;
  axis?: 'horizontal' | 'vertical';
  className?: string;
}

export const Spacer: React.FC<SpacerProps> = ({
  size = '1rem',
  axis = 'vertical',
  className,
}) => {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      style={{
        width: axis === 'horizontal' ? sizeValue : '100%',
        height: axis === 'vertical' ? sizeValue : '100%',
        flexShrink: 0,
      }}
      className={className}
      aria-hidden="true"
    />
  );
};

// Section divider with title
interface SectionDividerProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  title,
  subtitle,
  action,
  className,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem 0 1rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '1rem',
    }}
    className={className}
  >
    <div>
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#fff',
          margin: 0,
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            fontSize: '0.8125rem',
            color: '#888',
            margin: '0.25rem 0 0',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Divider;
