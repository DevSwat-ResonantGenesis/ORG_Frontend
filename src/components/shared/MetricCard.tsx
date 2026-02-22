import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info, MoreVertical } from 'lucide-react';

type MetricTrend = 'up' | 'down' | 'neutral';
type MetricSize = 'sm' | 'md' | 'lg';

interface MetricCardProps {
  label: string;
  value: string | number;
  previousValue?: string | number;
  trend?: MetricTrend;
  trendValue?: string;
  trendLabel?: string;
  icon?: React.ReactNode;
  size?: MetricSize;
  sparkline?: number[];
  info?: string;
  onClick?: () => void;
  className?: string;
}

const TREND_CONFIG: Record<MetricTrend, {
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

const SIZE_CONFIG: Record<MetricSize, {
  padding: string;
  labelSize: string;
  valueSize: string;
  iconSize: string;
}> = {
  sm: {
    padding: '0.875rem',
    labelSize: '0.6875rem',
    valueSize: '1.25rem',
    iconSize: '32px',
  },
  md: {
    padding: '1.125rem',
    labelSize: '0.75rem',
    valueSize: '1.75rem',
    iconSize: '40px',
  },
  lg: {
    padding: '1.5rem',
    labelSize: '0.8125rem',
    valueSize: '2.25rem',
    iconSize: '48px',
  },
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    transition: 'all 0.2s',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  label: {
    fontWeight: '500',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  value: {
    fontWeight: '700',
    color: '#fff',
    lineHeight: 1.2,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.75rem',
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
  trendLabel: {
    fontSize: '0.6875rem',
    color: '#666',
    marginLeft: '0.25rem',
  },
  previousValue: {
    fontSize: '0.75rem',
    color: '#666',
  },
  infoButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    background: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#666',
    cursor: 'pointer',
  },
  sparkline: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2px',
    height: '24px',
    marginTop: '0.75rem',
  },
  sparklineBar: {
    flex: 1,
    background: 'rgba(99, 102, 241, 0.3)',
    borderRadius: '2px',
    minWidth: '4px',
    transition: 'height 0.2s',
  },
};

const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div style={styles.sparkline}>
      {data.map((value, index) => {
        const height = ((value - min) / range) * 100;
        return (
          <div
            key={index}
            style={{
              ...styles.sparklineBar,
              height: `${Math.max(10, height)}%`,
            }}
          />
        );
      })}
    </div>
  );
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  previousValue,
  trend,
  trendValue,
  trendLabel,
  icon,
  size = 'md',
  sparkline,
  info,
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const sizeConfig = SIZE_CONFIG[size];
  const trendConfig = trend ? TREND_CONFIG[trend] : null;

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered && onClick ? styles.cardHover : {}),
        padding: sizeConfig.padding,
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div style={styles.header}>
        <span style={{ ...styles.label, fontSize: sizeConfig.labelSize }}>
          {label}
        </span>
        {icon && (
          <div
            style={{
              ...styles.iconWrapper,
              width: sizeConfig.iconSize,
              height: sizeConfig.iconSize,
            }}
          >
            {icon}
          </div>
        )}
        {info && !icon && (
          <button style={styles.infoButton} title={info}>
            <Info size={14} />
          </button>
        )}
      </div>

      <div style={{ ...styles.value, fontSize: sizeConfig.valueSize }}>
        {value}
      </div>

      {sparkline && sparkline.length > 0 && <Sparkline data={sparkline} />}

      {(trend || previousValue) && (
        <div style={styles.footer}>
          {trendConfig && (
            <span
              style={{
                ...styles.trend,
                background: trendConfig.bgColor,
                color: trendConfig.color,
              }}
            >
              {trendConfig.icon}
              {trendValue}
              {trendLabel && <span style={styles.trendLabel}>{trendLabel}</span>}
            </span>
          )}
          {previousValue && (
            <span style={styles.previousValue}>vs {previousValue}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Metric grid for multiple cards
interface MetricGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  gap?: string;
  className?: string;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
  children,
  columns = 4,
  gap = '1rem',
  className,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
    }}
    className={className}
  >
    {children}
  </div>
);

// Compact inline metric
interface InlineMetricProps {
  label: string;
  value: string | number;
  trend?: MetricTrend;
  className?: string;
}

export const InlineMetric: React.FC<InlineMetricProps> = ({
  label,
  value,
  trend,
  className,
}) => {
  const trendConfig = trend ? TREND_CONFIG[trend] : null;

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
          gap: '0.25rem',
        }}
      >
        {value}
        {trendConfig && trendConfig.icon}
      </span>
    </div>
  );
};

export default MetricCard;
