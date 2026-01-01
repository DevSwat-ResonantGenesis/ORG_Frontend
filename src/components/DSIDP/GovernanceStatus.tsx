/**
 * GovernanceStatus Component
 * Displays governance check status (passed, flagged, blocked)
 */

import React from 'react';
import styles from './DSIDPComponents.module.css';

export type GovernanceStatusType = 'passed' | 'flagged' | 'blocked' | 'pending';

interface GovernanceStatusProps {
  status: GovernanceStatusType;
  reason?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STATUS_CONFIG: Record<GovernanceStatusType, { icon: string; label: string; color: string; bgColor: string }> = {
  passed: { icon: '✓', label: 'Passed', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  flagged: { icon: '⚠', label: 'Flagged', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  blocked: { icon: '✗', label: 'Blocked', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  pending: { icon: '○', label: 'Pending', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
};

export const GovernanceStatus: React.FC<GovernanceStatusProps> = ({
  status,
  reason,
  size = 'md',
  className = '',
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`${styles.governanceStatus} ${styles[`size-${size}`]} ${className}`}
      style={{ color: config.color, backgroundColor: config.bgColor, borderColor: config.color }}
      title={reason || `Governance: ${config.label}`}
    >
      <span className={styles.governanceIcon}>{config.icon}</span>
      <span className={styles.governanceLabel}>{config.label}</span>
    </span>
  );
};

export default GovernanceStatus;
