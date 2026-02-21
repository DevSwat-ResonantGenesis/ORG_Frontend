import React from 'react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
  value: number | string;
  label: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  icon,
  color = 'primary',
  trend,
}) => {
  const colorMap = {
    primary: 'var(--color-primary-500)',
    success: 'var(--color-success-500)',
    warning: 'var(--color-warning-500)',
    error: 'var(--color-error-500)',
  };

  return (
    <div className={styles.statsCard}>
      {icon && (
        <div className={styles.iconContainer}>
          <span className={styles.icon}>{icon}</span>
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.value} style={{ color: colorMap[color] }}>
          {value}
        </div>
        <div className={styles.label}>{label}</div>
        {trend && (
          <div className={styles.trend}>
            <span className={trend.direction === 'up' ? styles.trendUp : styles.trendDown}>
              {trend.direction === 'up' ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
