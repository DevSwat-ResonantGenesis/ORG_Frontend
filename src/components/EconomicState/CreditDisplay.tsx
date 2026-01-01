/**
 * Credit Display Component
 * 
 * Shows the user's current credit balance with visual indicators.
 * Uses the EconomicStateContext for data.
 */

import React from 'react';
import { Coins, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { useEconomicState } from '../../context/EconomicStateContext';
import styles from './CreditDisplay.module.css';

interface CreditDisplayProps {
  variant?: 'compact' | 'full';
  showTrend?: boolean;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ 
  variant = 'compact',
  showTrend = false,
}) => {
  const { 
    creditBalance, 
    creditBalanceFormatted, 
    tier,
    tierDisplayName,
    tierColor,
    isDevOverride,
    loading,
  } = useEconomicState();

  if (loading) {
    return (
      <div className={`${styles.creditDisplay} ${styles[variant]}`}>
        <div className={styles.loading}>
          <div className={styles.skeleton} />
        </div>
      </div>
    );
  }

  // Determine credit status
  const isLow = creditBalance < 1000 && !isDevOverride;
  const isCritical = creditBalance < 100 && !isDevOverride;

  return (
    <div className={`${styles.creditDisplay} ${styles[variant]} ${isCritical ? styles.critical : isLow ? styles.low : ''}`}>
      <div className={styles.iconWrapper} style={{ backgroundColor: `${tierColor}20` }}>
        <Coins size={variant === 'compact' ? 16 : 20} style={{ color: tierColor }} />
      </div>
      
      <div className={styles.content}>
        <div className={styles.balance}>
          <span className={styles.amount}>{creditBalanceFormatted}</span>
          <span className={styles.label}>credits</span>
        </div>
        
        {variant === 'full' && (
          <div className={styles.tierBadge} style={{ backgroundColor: `${tierColor}20`, color: tierColor }}>
            {tierDisplayName}
            {isDevOverride && <Zap size={12} />}
          </div>
        )}
        
        {showTrend && (
          <div className={styles.trend}>
            {isLow ? (
              <TrendingDown size={14} className={styles.trendDown} />
            ) : (
              <TrendingUp size={14} className={styles.trendUp} />
            )}
          </div>
        )}
      </div>

      {isCritical && (
        <div className={styles.warning}>
          Low credits!
        </div>
      )}
    </div>
  );
};

export default CreditDisplay;
