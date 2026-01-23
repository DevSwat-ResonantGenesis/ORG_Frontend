/**
 * Usage Trend Chart Component
 * Area chart showing usage over time with trend line
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './UsageTrendChart.module.css';

interface DailyUsage {
  date: string;
  tokens: number;
}

interface UsageTrendChartProps {
  data: DailyUsage[];
  height?: number;
}

export const UsageTrendChart: React.FC<UsageTrendChartProps> = ({
  data,
  height = 200,
}) => {
  // Ensure data is an array and has valid entries
  const validData = Array.isArray(data) ? data : [];
  
  if (validData.length < 2) {
    return (
      <div className={styles.widget}>
        <div className={styles.header}>
          <TrendingUp className={styles.icon} size={20} />
          <span className={styles.title}>Usage Trends</span>
        </div>
        <div className={styles.empty}>
          <p>No usage data yet</p>
          <span>Start using the platform to see your trends</span>
        </div>
      </div>
    );
  }

  const maxTokens = Math.max(...validData.map(d => d.tokens), 1);
  const totalTokens = validData.reduce((sum, d) => sum + d.tokens, 0);
  const avgTokens = Math.round(totalTokens / validData.length);
  
  // Calculate trend
  const midpoint = Math.floor(validData.length / 2);
  const recentSum = validData.slice(midpoint).reduce((sum, d) => sum + d.tokens, 0);
  const previousSum = validData.slice(0, midpoint).reduce((sum, d) => sum + d.tokens, 0);
  const trend = previousSum > 0 ? ((recentSum - previousSum) / previousSum) * 100 : 0;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Generate SVG path for area chart
  const chartWidth = 100;
  const chartHeight = 100;
  const padding = 5;
  
  const points = validData.map((d, i) => {
    const x = padding + (i / (validData.length - 1)) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - (d.tokens / maxTokens) * (chartHeight - 2 * padding);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <TrendingUp className={styles.icon} size={20} />
          <span className={styles.title}>Usage Trends</span>
          <span className={styles.period}>Last {validData.length} days</span>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total</span>
            <span className={styles.statValue}>{formatNumber(totalTokens)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Avg/day</span>
            <span className={styles.statValue}>{formatNumber(avgTokens)}</span>
          </div>
          <div className={`${styles.trend} ${trend > 0 ? styles.up : trend < 0 ? styles.down : ''}`}>
            {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
            <span>{Math.abs(Math.round(trend))}%</span>
          </div>
        </div>
      </div>

      <div className={styles.chartContainer} style={{ height }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className={styles.chart}>
          {/* Grid lines */}
          <line x1={padding} y1={chartHeight * 0.25} x2={chartWidth - padding} y2={chartHeight * 0.25} className={styles.gridLine} />
          <line x1={padding} y1={chartHeight * 0.5} x2={chartWidth - padding} y2={chartHeight * 0.5} className={styles.gridLine} />
          <line x1={padding} y1={chartHeight * 0.75} x2={chartWidth - padding} y2={chartHeight * 0.75} className={styles.gridLine} />
          
          {/* Area fill */}
          <path d={areaPath} className={styles.area} />
          
          {/* Line */}
          <path d={linePath} className={styles.line} />
          
          {/* Data points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" className={styles.point} />
          ))}
        </svg>
        
        {/* Y-axis labels */}
        <div className={styles.yAxis}>
          <span>{formatNumber(maxTokens)}</span>
          <span>{formatNumber(maxTokens / 2)}</span>
          <span>0</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className={styles.xAxis}>
        <span>{formatDate(validData[0]?.date)}</span>
        <span>{formatDate(validData[Math.floor(validData.length / 2)]?.date)}</span>
        <span>{formatDate(validData[validData.length - 1]?.date)}</span>
      </div>
    </div>
  );
};

export default UsageTrendChart;
