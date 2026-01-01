/**
 * Usage Chart Component
 * Displays token/credit usage over time
 */
import React, { useEffect, useState } from 'react';
import { fetchTokenHistory } from '../../../api/usage';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './UsageChart.module.css';

interface UsageChartProps {
  days?: number;
  height?: number;
}

interface DailyUsage {
  date: string;
  tokens: number;
}

export const UsageChart: React.FC<UsageChartProps> = ({ days = 14, height = 120 }) => {
  const [data, setData] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const history = await fetchTokenHistory(days);
        setData(history);
      } catch (error) {
        console.error('Failed to load usage history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [days]);

  if (loading) {
    return (
      <div className={styles.container} style={{ height }}>
        <div className={styles.loading}>Loading usage data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.container} style={{ height }}>
        <div className={styles.empty}>No usage data yet</div>
      </div>
    );
  }

  const maxTokens = Math.max(...data.map(d => d.tokens), 1);
  const totalTokens = data.reduce((sum, d) => sum + d.tokens, 0);
  const avgTokens = Math.round(totalTokens / data.length);
  
  // Calculate trend (compare last 7 days to previous 7 days)
  const midpoint = Math.floor(data.length / 2);
  const recentSum = data.slice(midpoint).reduce((sum, d) => sum + d.tokens, 0);
  const previousSum = data.slice(0, midpoint).reduce((sum, d) => sum + d.tokens, 0);
  const trend = previousSum > 0 ? ((recentSum - previousSum) / previousSum) * 100 : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Token Usage</div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(totalTokens)}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{formatNumber(avgTokens)}</span>
            <span className={styles.statLabel}>Avg/day</span>
          </div>
          <div className={`${styles.trend} ${trend > 0 ? styles.trendUp : trend < 0 ? styles.trendDown : ''}`}>
            {trend > 0 ? <TrendingUp size={14} /> : trend < 0 ? <TrendingDown size={14} /> : <Minus size={14} />}
            <span>{Math.abs(Math.round(trend))}%</span>
          </div>
        </div>
      </div>
      
      <div className={styles.chart} style={{ height }}>
        {data.map((item, index) => {
          const barHeight = (item.tokens / maxTokens) * 100;
          const isHovered = hoveredIndex === index;
          
          return (
            <div
              key={item.date}
              className={styles.barContainer}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className={`${styles.bar} ${isHovered ? styles.barHovered : ''}`}
                style={{ height: `${Math.max(barHeight, 2)}%` }}
              />
              {isHovered && (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipDate}>{formatDate(item.date)}</div>
                  <div className={styles.tooltipValue}>{formatNumber(item.tokens)} tokens</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className={styles.xAxis}>
        <span>{formatDate(data[0]?.date)}</span>
        <span>{formatDate(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  );
};

export default UsageChart;
