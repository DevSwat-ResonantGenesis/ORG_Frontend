/**
 * TrustBadge Component
 * Displays agent trust tier (T0-T4) with visual indicator
 */

import React from 'react';
import styles from './DSIDPComponents.module.css';

export type TrustTierLevel = 'T0' | 'T1' | 'T2' | 'T3' | 'T4';

interface TrustBadgeProps {
  tier: TrustTierLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TIER_CONFIG: Record<TrustTierLevel, { name: string; color: string; bgColor: string }> = {
  T0: { name: 'Untrusted', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  T1: { name: 'Provisional', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  T2: { name: 'Standard', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  T3: { name: 'Verified', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  T4: { name: 'Sovereign', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
};

const SIZE_CONFIG = {
  sm: { fontSize: '10px', padding: '2px 6px' },
  md: { fontSize: '12px', padding: '4px 8px' },
  lg: { fontSize: '14px', padding: '6px 12px' },
};

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  tier,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const config = TIER_CONFIG[tier];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <span
      className={`${styles.trustBadge} ${className}`}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        borderColor: config.color,
        fontSize: sizeConfig.fontSize,
        padding: sizeConfig.padding,
      }}
      title={`Trust Tier: ${tier} - ${config.name}`}
    >
      <span className={styles.trustTierIcon}>●</span>
      <span className={styles.trustTierCode}>{tier}</span>
      {showLabel && <span className={styles.trustTierLabel}>{config.name}</span>}
    </span>
  );
};

export default TrustBadge;
