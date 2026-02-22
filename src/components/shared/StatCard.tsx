import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type StatCardVariant = 'default' | 'compact' | 'detailed' | 'gradient';
type TrendDirection = 'up' | 'down' | 'neutral';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: TrendDirection;
    label?: string;
  };
  variant?: StatCardVariant;
  color?: string;
  onClick?: () => void;
  className?: string;
}

const TREND_CONFIG: Record<TrendDirection, {
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  up: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <TrendingUp size={14} />,
  },
  down: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <TrendingDown size={14} />,
  },
  neutral: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Minus size={14} />,
  },
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.2s',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    cursor: 'pointer',
  },
  cardCompact: {
    padding: '1rem',
  },
  cardGradient: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  iconWrapperCompact: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
  },
  value: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    lineHeight: 1.2,
    marginBottom: '0.5rem',
  },
  valueCompact: {
    fontSize: '1.5rem',
    marginBottom: '0.25rem',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
  },
  subtitle: {
    fontSize: '0.8125rem',
    color: '#666',
  },
  trend: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  detailedContent: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  color,
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const isCompact = variant === 'compact';
  const isGradient = variant === 'gradient';

  const trendConfig = trend ? TREND_CONFIG[trend.direction] : null;

  return (
    <div
      style={{
        ...styles.card,
        ...(isCompact ? styles.cardCompact : {}),
        ...(isGradient ? styles.cardGradient : {}),
        ...(isHovered && onClick ? styles.cardHover : {}),
      }}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        {icon && (
          <div
            style={{
              ...styles.iconWrapper,
              ...(isCompact ? styles.iconWrapperCompact : {}),
              ...(color ? { background: `${color}20`, color } : {}),
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        style={{
          ...styles.value,
          ...(isCompact ? styles.valueCompact : {}),
        }}
      >
        {value}
      </div>

      <div style={styles.footer}>
        {subtitle && <span style={styles.subtitle}>{subtitle}</span>}
        {trend && trendConfig && (
          <span
            style={{
              ...styles.trend,
              background: trendConfig.bgColor,
              color: trendConfig.color,
            }}
          >
            {trendConfig.icon}
            {trend.value > 0 ? '+' : ''}{trend.value}%
            {trend.label && <span style={{ marginLeft: '0.25rem', opacity: 0.8 }}>{trend.label}</span>}
          </span>
        )}
      </div>
    </div>
  );
};

// Stats grid for multiple cards
interface StatsGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  columns = 4,
  className,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '1rem',
    }}
    className={className}
  >
    {children}
  </div>
);

// Mini stat for inline display
interface MiniStatProps {
  label: string;
  value: string | number;
  trend?: TrendDirection;
  className?: string;
}

export const MiniStat: React.FC<MiniStatProps> = ({
  label,
  value,
  trend,
  className,
}) => {
  const trendConfig = trend ? TREND_CONFIG[trend] : null;
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
      className={className}
    >
      <span style={{ fontSize: '0.8125rem', color: '#888' }}>{label}:</span>
      <span
        style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: trendConfig?.color || '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '0.125rem',
        }}
      >
        {value}
        {TrendIcon && <TrendIcon size={14} />}
      </span>
    </div>
  );
};

// Comparison stat
interface ComparisonStatProps {
  title: string;
  current: number;
  previous: number;
  format?: (value: number) => string;
  className?: string;
}

export const ComparisonStat: React.FC<ComparisonStatProps> = ({
  title,
  current,
  previous,
  format = (v) => String(v),
  className,
}) => {
  const change = previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  const direction: TrendDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  const trendConfig = TREND_CONFIG[direction];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
      className={className}
    >
      <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>
        {title}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>
          {format(current)}
        </span>
        <span style={{ fontSize: '0.8125rem', color: '#666' }}>
          vs {format(previous)}
        </span>
      </div>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          color: trendConfig.color,
        }}
      >
        {trendConfig.icon}
        {Math.abs(change).toFixed(1)}% from previous
      </span>
    </div>
  );
};

export default StatCard;
