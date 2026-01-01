/**
 * Tier Badge Component
 * 
 * Displays the user's subscription tier as a badge.
 */

import React from 'react';
import { Crown, Zap, Star, Sparkles } from 'lucide-react';
import { useEconomicState } from '../../context/EconomicStateContext';
import styles from './TierBadge.module.css';

interface TierBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ 
  size = 'md',
  showIcon = true,
}) => {
  const { tier, tierDisplayName, tierColor, isDevOverride, loading } = useEconomicState();

  if (loading) {
    return <div className={`${styles.badge} ${styles[size]} ${styles.loading}`} />;
  }

  const getIcon = () => {
    if (isDevOverride) return <Zap size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />;
    switch (tier) {
      case 'enterprise': return <Crown size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />;
      case 'pro': return <Star size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />;
      case 'plus': return <Sparkles size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} />;
      default: return null;
    }
  };

  return (
    <div 
      className={`${styles.badge} ${styles[size]} ${styles[tier]}`}
      style={{ 
        backgroundColor: `${tierColor}20`,
        color: tierColor,
        borderColor: `${tierColor}40`,
      }}
    >
      {showIcon && getIcon()}
      <span>{tierDisplayName}</span>
      {isDevOverride && <span className={styles.devLabel}>DEV</span>}
    </div>
  );
};

export default TierBadge;
