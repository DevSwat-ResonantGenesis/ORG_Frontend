/**
 * Credit Widget Component
 * Shows credit balance, burn rate, and days remaining
 * Displays ONLY real data - shows loading/error states for null values
 */
import React from 'react';
import { Coins, AlertTriangle, Zap, Loader2 } from 'lucide-react';
import styles from './CreditWidget.module.css';

interface CreditWidgetProps {
  balance: number | null;
  limit: number | null;
  usedThisMonth: number | null;
  daysRemaining: number | null;
  burnRate: number | null;
  tier: string | null;
  onUpgrade?: () => void;
}

export const CreditWidget: React.FC<CreditWidgetProps> = ({
  balance,
  limit,
  usedThisMonth,
  daysRemaining,
  burnRate,
  tier,
  onUpgrade,
}) => {
  // Check if we have real data
  const hasData = balance !== null && limit !== null;
  
  // Calculate derived values only if we have real data
  const usagePercent = hasData && limit > 0 ? Math.round(((limit - balance) / limit) * 100) : 0;
  const daysUntilEmpty = hasData && burnRate && burnRate > 0 ? Math.floor(balance / burnRate) : null;
  const isLow = hasData && balance < limit * 0.2;
  const isCritical = hasData && balance < limit * 0.1;

  const formatNumber = (num: number | null): string => {
    if (num === null) return '—';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 100000) return `${(num / 1000).toFixed(0)}K`;
    if (num >= 10000) return `${(num / 1000).toFixed(1)}K`;
    // Show exact numbers below 10K for precision
    return num.toLocaleString();
  };

  // Show loading state if no data
  if (!hasData) {
    return (
      <div className={`${styles.widget} ${styles.loading}`}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Coins className={styles.icon} size={20} />
            <span className={styles.title}>Credits</span>
          </div>
        </div>
        <div className={styles.loadingContent}>
          <Loader2 className={styles.spinner} size={24} />
          <p>Loading credit data...</p>
          <p className={styles.hint}>Please ensure you're logged in</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.widget} ${isCritical ? styles.critical : isLow ? styles.low : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Coins className={styles.icon} size={20} />
          <span className={styles.title}>Credits</span>
        </div>
        {tier && (
          <div className={styles.tierBadge}>
            <Zap size={12} />
            {tier}
          </div>
        )}
      </div>

      <div className={styles.balanceSection}>
        <div className={styles.balanceMain}>
          <span className={styles.balanceValue}>{formatNumber(balance)}</span>
          <span className={styles.balanceLabel}>remaining</span>
        </div>
        <div className={styles.balanceSecondary}>
          of {formatNumber(limit)} monthly
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${100 - usagePercent}%` }}
        />
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{formatNumber(usedThisMonth)}</span>
          <span className={styles.statLabel}>used this period</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{burnRate !== null && burnRate > 0 ? `~${formatNumber(burnRate)}` : '—'}</span>
          <span className={styles.statLabel}>credits/day</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {daysRemaining !== null ? `${daysRemaining}d` : '—'}
          </span>
          <span className={styles.statLabel}>days left</span>
        </div>
      </div>

      {(isLow || isCritical) && (
        <div className={styles.alertBar}>
          <AlertTriangle size={14} />
          <span>{isCritical ? 'Credits critically low!' : 'Credits running low'}</span>
          {onUpgrade && (
            <button className={styles.upgradeBtn} onClick={onUpgrade}>
              Buy Credits
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditWidget;
