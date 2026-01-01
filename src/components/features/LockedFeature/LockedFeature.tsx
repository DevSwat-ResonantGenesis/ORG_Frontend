/**
 * Locked Feature Component
 * Shows a lock overlay on features not available in the user's plan
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Crown } from 'lucide-react';
import styles from './LockedFeature.module.css';

interface LockedFeatureProps {
  featureName: string;
  requiredPlan: 'plus' | 'enterprise';
  children: React.ReactNode;
  showOverlay?: boolean;
  compact?: boolean;
}

export const LockedFeature: React.FC<LockedFeatureProps> = ({
  featureName,
  requiredPlan,
  children,
  showOverlay = true,
  compact = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
      <div className={styles.content}>
        {children}
      </div>
      {showOverlay && (
        <div className={styles.overlay}>
          <div className={styles.lockIcon}>
            <Lock size={compact ? 20 : 28} />
          </div>
          <div className={styles.info}>
            <h4>{featureName}</h4>
            <p>Available on {requiredPlan === 'plus' ? 'Plus' : 'Enterprise'} plan</p>
          </div>
          <button 
            className={styles.upgradeBtn}
            onClick={() => navigate('/pricing')}
          >
            <Crown size={14} />
            {requiredPlan === 'plus' ? 'Upgrade to Plus' : 'Contact Sales'}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Hook to check if a feature is available for the current plan
 */
export const useFeatureAccess = (currentPlan: string) => {
  const isFeatureAvailable = (requiredPlan: 'developer' | 'plus' | 'enterprise'): boolean => {
    const planHierarchy = ['developer', 'plus', 'enterprise'];
    const currentIndex = planHierarchy.indexOf(currentPlan.toLowerCase());
    const requiredIndex = planHierarchy.indexOf(requiredPlan);
    return currentIndex >= requiredIndex;
  };

  return {
    isFeatureAvailable,
    canAccessPlus: isFeatureAvailable('plus'),
    canAccessEnterprise: isFeatureAvailable('enterprise'),
  };
};

export default LockedFeature;
