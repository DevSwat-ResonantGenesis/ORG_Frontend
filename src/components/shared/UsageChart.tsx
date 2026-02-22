import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Download } from 'lucide-react';

type ChartType = 'line' | 'bar' | 'area';
type TimeRange = '24h' | '7d' | '30d' | '90d' | 'custom';

interface DataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

interface UsageChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  type?: ChartType;
  color?: string;
  showTrend?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  onExport?: () => void;
  className?: string;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
];

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 0.25rem 0',
  },
  subtitle: {
    fontSize: '0.75rem',
    color: '#888',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  timeRangeSelector: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '0.125rem',
  },
  timeRangeButton: {
    padding: '0.375rem 0.625rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  timeRangeButtonActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: 'none',
    borderRadius: '8px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  statLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
  },
  trend: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  trendUp: {
    color: '#10b981',
  },
  trendDown: {
    color: '#ef4444',
  },
  trendNeutral: {
    color: '#888',
  },
  chartArea: {
    position: 'relative',
    width: '100%',
  },
  svg: {
    width: '100%',
    overflow: 'visible',
  },
  gridLine: {
    stroke: 'rgba(255, 255, 255, 0.05)',
    strokeWidth: 1,
  },
  axisLabel: {
    fill: '#666',
    fontSize: '0.625rem',
  },
  tooltip: {
    position: 'absolute',
    padding: '0.5rem 0.75rem',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    pointerEvents: 'none',
    zIndex: 100,
  },
  tooltipLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    marginBottom: '0.25rem',
  },
  tooltipValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
  },
  legend: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
};

export const UsageChart: React.FC<UsageChartProps> = ({
  data,
  title,
  subtitle,
  type = 'area',
  color = '#6366f1',
  showTrend = true,
  showLegend = false,
  showGrid = true,
  height = 200,
  timeRange = '7d',
  onTimeRangeChange,
  onExport,
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const chartData = useMemo(() => {
    if (data.length === 0) return { points: [], min: 0, max: 0, total: 0, avg: 0, trend: 0 };

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;

    // Calculate trend (compare last half to first half)
    const midpoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midpoint);
    const secondHalf = values.slice(midpoint);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    return { points: data, min, max, total, avg, trend };
  }, [data]);

  const padding = { top: 10, right: 10, bottom: 30, left: 40 };
  const chartWidth = 100; // percentage
  const chartHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    return ((index / (data.length - 1)) * 100).toFixed(2) + '%';
  };

  const getY = (value: number) => {
    const range = chartData.max - chartData.min || 1;
    return chartHeight - ((value - chartData.min) / range) * chartHeight + padding.top;
  };

  const pathD = useMemo(() => {
    if (data.length < 2) return '';

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = getY(d.value);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [data, chartData]);

  const areaD = useMemo(() => {
    if (data.length < 2) return '';

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = getY(d.value);
      return `${x},${y}`;
    });

    return `M 0,${chartHeight + padding.top} L ${points.join(' L ')} L 100,${chartHeight + padding.top} Z`;
  }, [data, chartData]);

  const formatValue = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toFixed(0);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const TrendIcon = chartData.trend > 0 ? TrendingUp : chartData.trend < 0 ? TrendingDown : Minus;
  const trendStyle = chartData.trend > 0 ? styles.trendUp : chartData.trend < 0 ? styles.trendDown : styles.trendNeutral;

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.titleArea}>
          {title && <h3 style={styles.title}>{title}</h3>}
          {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
        </div>
        <div style={styles.controls}>
          {onTimeRangeChange && (
            <div style={styles.timeRangeSelector}>
              {TIME_RANGES.map((range) => (
                <button
                  key={range.value}
                  style={{
                    ...styles.timeRangeButton,
                    ...(timeRange === range.value ? styles.timeRangeButtonActive : {}),
                  }}
                  onClick={() => onTimeRangeChange(range.value)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
          {onExport && (
            <button style={styles.exportButton} onClick={onExport} title="Export data">
              <Download size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={styles.stats}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Total</span>
          <span style={styles.statValue}>{formatValue(chartData.total)}</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Average</span>
          <span style={styles.statValue}>{formatValue(chartData.avg)}</span>
        </div>
        {showTrend && (
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Trend</span>
            <span style={{ ...styles.trend, ...trendStyle }}>
              <TrendIcon size={14} />
              {Math.abs(chartData.trend).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div style={{ ...styles.chartArea, height }}>
        <svg
          style={styles.svg}
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          {showGrid && (
            <>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1="0"
                  y1={padding.top + chartHeight * ratio}
                  x2="100"
                  y2={padding.top + chartHeight * ratio}
                  style={styles.gridLine}
                />
              ))}
            </>
          )}

          {type === 'area' && (
            <path
              d={areaD}
              fill={`url(#gradient-${color.replace('#', '')})`}
              opacity={0.3}
            />
          )}

          {type === 'bar' ? (
            data.map((d, i) => {
              const barWidth = 80 / data.length;
              const x = (i / data.length) * 100 + barWidth / 4;
              const barHeight = ((d.value - chartData.min) / (chartData.max - chartData.min || 1)) * chartHeight;
              return (
                <rect
                  key={i}
                  x={`${x}%`}
                  y={chartHeight + padding.top - barHeight}
                  width={`${barWidth}%`}
                  height={barHeight}
                  fill={hoveredIndex === i ? color : `${color}88`}
                  rx={2}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })
          ) : (
            <>
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
              {data.map((d, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(d.value)}
                  r={hoveredIndex === i ? 5 : 3}
                  fill={hoveredIndex === i ? color : '#0a0a0f'}
                  stroke={color}
                  strokeWidth={2}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </>
          )}

          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
        </svg>

        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            style={{
              ...styles.tooltip,
              left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
              top: getY(data[hoveredIndex].value) - 50,
              transform: 'translateX(-50%)',
            }}
          >
            <div style={styles.tooltipLabel}>
              {formatDate(data[hoveredIndex].timestamp)}
            </div>
            <div style={styles.tooltipValue}>
              {formatValue(data[hoveredIndex].value)}
            </div>
          </div>
        )}
      </div>

      {showLegend && (
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: color }} />
            Usage
          </div>
        </div>
      )}
    </div>
  );
};

// Mini sparkline chart
interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = '#6366f1',
  width = 80,
  height = 24,
  className,
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className={className}>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UsageChart;
