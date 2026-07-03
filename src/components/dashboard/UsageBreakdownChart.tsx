/**
 * Usage Breakdown Chart Component
 * Donut chart showing usage by service
 */
import React from 'react';
import { PieChart, MessageSquare, Bot, Code, Cpu, Database } from 'lucide-react';
import styles from './UsageBreakdownChart.module.css';

export interface ServiceUsage {
  service: string;
  credits: number;
  percentage: number;
  color?: string;
}

interface UsageBreakdownChartProps {
  data: ServiceUsage[];
  totalCredits: number | null;
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  chat: <MessageSquare size={14} />,
  agents: <Bot size={14} />,
  ide: <Code size={14} />,
  workflows: <Cpu size={14} />,
  memory: <Database size={14} />,
  code_visualizer: <Code size={14} />,
};

const SERVICE_COLORS: Record<string, string> = {
  chat: '#3b82f6',
  agents: '#0ea5e9',
  ide: '#22c55e',
  workflows: '#f59e0b',
  memory: '#14b8a6',
  code_visualizer: '#06b6d4',
  other: '#6b7280',
};

const SERVICE_LABELS: Record<string, string> = {
  code_visualizer: 'Code Visualizer',
};

export const UsageBreakdownChart: React.FC<UsageBreakdownChartProps> = ({
  data,
  totalCredits,
}) => {
  // Calculate donut segments
  const radius = 70;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const segments = data.map((item) => {
    const segmentLength = (item.percentage / 100) * circumference;
    const segment = {
      ...item,
      offset: currentOffset,
      length: segmentLength,
      color: SERVICE_COLORS[item.service] || SERVICE_COLORS.other,
    };
    currentOffset += segmentLength;
    return segment;
  });

  const formatNumber = (num: number | null): string => {
    if (num === null || num === undefined) return '—';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <PieChart className={styles.icon} size={20} />
        <span className={styles.title}>Usage Breakdown</span>
      </div>

      <div className={styles.chartContainer}>
        <svg viewBox="0 0 200 200" className={styles.chart}>
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth={strokeWidth}
          />
          
          {/* Segments */}
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.length} ${circumference - segment.length}`}
              strokeDashoffset={-segment.offset}
              transform="rotate(-90 100 100)"
              className={styles.segment}
            />
          ))}
          
          {/* Center text */}
          <text x="100" y="95" textAnchor="middle" className={styles.centerValue}>
            {formatNumber(totalCredits)}
          </text>
          <text x="100" y="115" textAnchor="middle" className={styles.centerLabel}>
            total used
          </text>
        </svg>
      </div>

      <div className={styles.legend}>
        {data.map((item, index) => (
          <div key={index} className={styles.legendItem}>
            <div 
              className={styles.legendColor} 
              style={{ backgroundColor: SERVICE_COLORS[item.service] || SERVICE_COLORS.other }}
            />
            <div className={styles.legendIcon}>
              {SERVICE_ICONS[item.service] || <PieChart size={14} />}
            </div>
            <span className={styles.legendLabel}>{SERVICE_LABELS[item.service] || item.service}</span>
            <span className={styles.legendValue}>{item.percentage}%</span>
            <span className={styles.legendCredits}>{formatNumber(item.credits)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsageBreakdownChart;
