/**
 * Trial Banner Component
 * Shows trial status, days remaining, and upgrade prompts
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { fetchTrialStatus, type TrialStatus } from '@/api/userApiKeys';
import styles from './TrialBanner.module.css';

interface TrialBannerProps {
  onUpgrade?: () => void;
  showAlways?: boolean;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({
  onUpgrade,
  showAlways = false,
}) => {
  const navigate = useNavigate();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const loadTrialStatus = async () => {
      try {
        const status = await fetchTrialStatus();
        setTrialStatus(status);
      } catch (err) {
        console.error('Failed to load trial status:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTrialStatus();
  }, []);

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/pricing');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in session storage (resets on new session)
    sessionStorage.setItem('trial-banner-dismissed', 'true');
  };

  // Don't show if loading, dismissed, or not a trial user
  if (loading) return null;
  if (dismissed && !trialStatus?.isExpired) return null;
  if (!trialStatus?.isTrialUser && !showAlways) return null;

  // Trial expired - show blocking modal
  if (trialStatus?.isExpired && trialStatus?.requiresUpgrade) {
    return (
      <div className={styles.expiredOverlay}>
        <div className={styles.expiredModal}>
          <div className={styles.expiredIcon}>⏰</div>
          <h2>Your Free Trial Has Expired</h2>
          <p>
            Your 7-day free trial has ended. To continue using ResonantGenesis,
            please upgrade to a paid plan.
          </p>
          <div className={styles.expiredFeatures}>
            <div className={styles.featureItem}>✓ Keep all your agents and teams</div>
            <div className={styles.featureItem}>✓ Access to platform tokens</div>
            <div className={styles.featureItem}>✓ No more API key required</div>
            <div className={styles.featureItem}>✓ Priority support</div>
          </div>
          <div className={styles.expiredActions}>
            <Button variant="primary" size="lg" onClick={handleUpgrade}>
              Upgrade Now
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/pricing')}>
              View Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No API key warning
  if (trialStatus?.isTrialUser && !trialStatus?.hasApiKey) {
    return (
      <div className={`${styles.banner} ${styles.warning}`}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerIcon}>🔑</div>
          <div className={styles.bannerText}>
            <strong>API Key Required</strong>
            <span>Add your OpenAI, Anthropic, or other API key to start using the platform.</span>
          </div>
        </div>
        <div className={styles.bannerActions}>
          <Button variant="primary" size="sm" onClick={() => navigate('/profile')}>
            Add API Key
          </Button>
        </div>
      </div>
    );
  }

  // Trial ending soon (3 days or less)
  if (trialStatus?.isTrialUser && trialStatus.daysRemaining <= 3 && trialStatus.daysRemaining > 0) {
    return (
      <div className={`${styles.banner} ${styles.urgent}`}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerIcon}>⚠️</div>
          <div className={styles.bannerText}>
            <strong>Trial Ending Soon</strong>
            <span>
              {trialStatus.daysRemaining === 1
                ? 'Your trial ends tomorrow!'
                : `Only ${trialStatus.daysRemaining} days left in your trial.`}
              {' '}Upgrade now to keep your work.
            </span>
          </div>
        </div>
        <div className={styles.bannerActions}>
          <Button variant="primary" size="sm" onClick={handleUpgrade}>
            Upgrade Now
          </Button>
          <button className={styles.dismissButton} onClick={handleDismiss}>
            Remind me later
          </button>
        </div>
      </div>
    );
  }

  // Normal trial status (more than 3 days remaining)
  if (trialStatus?.isTrialUser && trialStatus.daysRemaining > 3) {
    return (
      <div className={`${styles.banner} ${styles.info}`}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerIcon}>🎉</div>
          <div className={styles.bannerText}>
            <strong>Free Trial</strong>
            <span>{trialStatus.daysRemaining} days remaining • Using your own API keys</span>
          </div>
        </div>
        <div className={styles.bannerActions}>
          <Button variant="secondary" size="sm" onClick={handleUpgrade}>
            Upgrade for Platform Tokens
          </Button>
          <button className={styles.dismissButton} onClick={handleDismiss}>
            ×
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TrialBanner;
