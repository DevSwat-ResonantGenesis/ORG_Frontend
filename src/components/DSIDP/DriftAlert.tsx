/**
 * DriftAlert Component
 * Displays semantic drift detection alert
 */

import React from 'react';
import styles from './DSIDPComponents.module.css';

interface DriftAlertProps {
  score: number;
  threshold?: number;
  cluster?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DriftAlert: React.FC<DriftAlertProps> = ({
  score,
  threshold = 0.7,
  cluster,
  size = 'md',
  className = '',
}) => {
  const isDrifting = score < threshold;
  const severity = score < 0.5 ? 'critical' : score < 0.7 ? 'warning' : 'normal';

  const severityConfig = {
    critical: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', icon: '⚠', label: 'Critical Drift' },
    warning: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', icon: '△', label: 'Drift Warning' },
    normal: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', icon: '●', label: 'Stable' },
  };

  const config = severityConfig[severity];

  if (!isDrifting && severity === 'normal') {
    return null;
  }

  return (
    <div
      className={`${styles.driftAlert} ${styles[`size-${size}`]} ${styles[`severity-${severity}`]} ${className}`}
      style={{ color: config.color, backgroundColor: config.bgColor, borderColor: config.color }}
    >
      <span className={styles.driftIcon}>{config.icon}</span>
      <span className={styles.driftLabel}>{config.label}</span>
      <span className={styles.driftScore}>{(score * 100).toFixed(0)}%</span>
      {cluster && <span className={styles.driftCluster}>({cluster})</span>}
    </div>
  );
};

export default DriftAlert;
