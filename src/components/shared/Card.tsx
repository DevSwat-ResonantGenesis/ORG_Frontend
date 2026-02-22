import React from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  clickable?: boolean;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const VARIANT_STYLES: Record<CardVariant, React.CSSProperties> = {
  default: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  elevated: {
    background: '#1e1e2a',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  outlined: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  filled: {
    background: 'rgba(99, 102, 241, 0.1)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
};

const PADDING_VALUES: Record<CardPadding, string> = {
  none: '0',
  sm: '0.75rem',
  md: '1.25rem',
  lg: '1.75rem',
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  },
  hoverable: {
    cursor: 'default',
  },
  hoverableHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  },
  clickable: {
    cursor: 'pointer',
  },
  selected: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
  },
  header: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  body: {},
  footer: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  selected = false,
  className,
  onClick,
  header,
  footer,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const paddingValue = PADDING_VALUES[padding];

  return (
    <div
      style={{
        ...styles.card,
        ...VARIANT_STYLES[variant],
        ...(hoverable ? styles.hoverable : {}),
        ...(clickable || onClick ? styles.clickable : {}),
        ...(selected ? styles.selected : {}),
        ...(isHovered && hoverable ? styles.hoverableHover : {}),
      }}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {header && (
        <div style={{ ...styles.header, padding: paddingValue }}>
          {header}
        </div>
      )}
      <div style={{ ...styles.body, padding: paddingValue }}>
        {children}
      </div>
      {footer && (
        <div style={{ ...styles.footer, padding: paddingValue }}>
          {footer}
        </div>
      )}
    </div>
  );
};

// Card Header component
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {icon && (
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1',
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.125rem' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

// Card Footer component
interface CardFooterProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  align = 'right',
}) => {
  const alignStyles: Record<string, React.CSSProperties> = {
    left: { justifyContent: 'flex-start' },
    center: { justifyContent: 'center' },
    right: { justifyContent: 'flex-end' },
    between: { justifyContent: 'space-between' },
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        ...alignStyles[align],
      }}
    >
      {children}
    </div>
  );
};

// Card Grid for layouts
interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = 3,
  gap = 'md',
  className,
}) => {
  const gapValues = { sm: '0.75rem', md: '1rem', lg: '1.5rem' };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${300 / columns * (columns - 1)}px, 1fr))`,
        gap: gapValues[gap],
      }}
      className={className}
    >
      {children}
    </div>
  );
};

export default Card;
