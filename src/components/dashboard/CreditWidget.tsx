/**
 * Credit Widget Component
 * Shows credit balance, burn rate, and days remaining
 * Displays ONLY real data - shows loading/error states for null values
 */
import React from 'react';
import { Coins, AlertTriangle, Zap, Loader2, Rocket, Crown } from 'lucide-react';
import styles from './CreditWidget.module.css';

interface CreditWidgetProps {
  balance: number | null;
  limit: number | null;
  usedThisMonth: number | null;
  daysRemaining: number | null;
  burnRate: number | null;
  tier: string | null;
  unlimited?: boolean;
  onUpgrade?: () => void;
  onSubscribe?: (plan: string) => void;
  subscribeLoading?: string | null;
}

export const CreditWidget: React.FC<CreditWidgetProps> = ({
  balance,
  limit,
  usedThisMonth,
  daysRemaining,
  burnRate,
  tier,
  unlimited = false,
  onUpgrade,
  onSubscribe,
  subscribeLoading,
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

  const tierLower = (tier || '').toLowerCase();
  const isFree = tierLower === 'free' || tierLower === '';

  // FREE PLAN: show subscribe CTA instead of credit stats
  if (isFree && !unlimited) {
    return (
      <div className={styles.widget}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Coins className={styles.icon} size={20} />
            <span className={styles.title}>Credits</span>
          </div>
          <div className={`${styles.tierBadge} ${styles.tierBadgeFree}`}>
            Free
          </div>
        </div>

        <div className={styles.freeHero}>
          <p className={styles.freeHeading}>Subscribe to unlock all features</p>
          <p className={styles.freeSubtext}>Choose a plan to get AI credits and full platform access.</p>
        </div>

        <div className={styles.planCards}>
          <button className={styles.planCard} onClick={() => onSubscribe?.('developer')} disabled={!!subscribeLoading}>
            <div className={styles.planCardHeader}>
              <Rocket size={14} />
              <span className={styles.planName}>Plus</span>
            </div>
            <div className={styles.planPrice}>$29<span>/mo</span></div>
            <div className={styles.planCredits}>29,000 credits/mo</div>
            <div className={styles.planNote}>All features unlocked</div>
            <div className={styles.planCta}>{subscribeLoading === 'developer' ? 'Redirecting…' : 'Subscribe Now →'}</div>
          </button>
          <button className={`${styles.planCard} ${styles.planCardRecommended}`} onClick={() => onSubscribe?.('plus')} disabled={!!subscribeLoading}>
            <div className={styles.planCardHeader}>
              <Crown size={14} />
              <span className={styles.planName}>Business</span>
              <span className={styles.recommendedBadge}>Recommended</span>
            </div>
            <div className={styles.planPrice}>$499<span>/mo</span></div>
            <div className={styles.planCredits}>499,000 credits/mo</div>
            <div className={styles.planNote}>Rollover + Top-ups</div>
            <div className={styles.planCta}>{subscribeLoading === 'plus' ? 'Redirecting…' : 'Subscribe Now →'}</div>
          </button>
        </div>
      </div>
    );
  }

  // PAID / UNLIMITED PLAN: show credit stats
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
          <span className={styles.balanceValue}>{unlimited ? '∞' : formatNumber(balance)}</span>
          <span className={styles.balanceLabel}>{unlimited ? 'unlimited' : 'remaining'}</span>
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

      {/* Plan upgrade cards for paid users */}
      {!unlimited && (
        <div className={styles.planCards}>
          <a
            href="/pricing?plan=developer"
            className={`${styles.planCard} ${tierLower === 'developer' ? styles.planCardActive : ''}`}
          >
            <div className={styles.planCardHeader}>
              <Rocket size={14} />
              <span className={styles.planName}>Plus</span>
              {tierLower === 'developer' && <span className={styles.currentBadge}>Current</span>}
            </div>
            <div className={styles.planPrice}>$29<span>/mo</span></div>
            <div className={styles.planCredits}>29,000 credits/mo</div>
            <div className={styles.planNote}>No rollover</div>
          </a>
          <a
            href="/pricing?plan=plus"
            className={`${styles.planCard} ${styles.planCardRecommended} ${tierLower === 'plus' ? styles.planCardActive : ''}`}
          >
            <div className={styles.planCardHeader}>
              <Crown size={14} />
              <span className={styles.planName}>Business</span>
              {tierLower === 'plus' ? <span className={styles.currentBadge}>Current</span> : <span className={styles.recommendedBadge}>Recommended</span>}
            </div>
            <div className={styles.planPrice}>$499<span>/mo</span></div>
            <div className={styles.planCredits}>499,000 credits/mo</div>
            <div className={styles.planNote}>Rollover + Top-ups</div>
          </a>
        </div>
      )}
    </div>
  );
};

export default CreditWidget;
