/**
 * Feature Gate Component
 * 
 * Conditionally renders content based on feature access.
 * Shows upgrade prompt if feature is locked.
 */

import React, { ReactNode } from 'react';
import { Lock, Crown, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEconomicState } from '../../context/EconomicStateContext';
import { type Features } from '../../api/economicState';
import styles from './FeatureGate.module.css';

interface FeatureGateProps {
  feature: keyof Features;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  requiredTier?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  requiredTier = 'Plus',
}) => {
  const navigate = useNavigate();
  const { canAccessFeature, loading, tierDisplayName } = useEconomicState();

  if (loading) {
    return <div className={styles.loading}><div className={styles.skeleton} /></div>;
  }

  const hasAccess = canAccessFeature(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className={styles.lockedContainer}>
      <div className={styles.lockIcon}>
        <Lock size={24} />
      </div>
      <div className={styles.content}>
        <h4 className={styles.title}>Feature Locked</h4>
        <p className={styles.description}>
          This feature requires <strong>{requiredTier}</strong> or higher.
          You're currently on <strong>{tierDisplayName}</strong>.
        </p>
        <button 
          className={styles.upgradeButton}
          onClick={() => navigate('/billing')}
        >
          <Crown size={16} />
          Upgrade to {requiredTier}
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};

/**
 * IDE Feature Gate - specifically for IDE access
 */
export const IDEFeatureGate: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureGate feature="ide_access" requiredTier="Plus">
    {children}
  </FeatureGate>
);

/**
 * Code Execution Feature Gate
 */
export const CodeExecutionGate: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureGate feature="code_execution" requiredTier="Plus">
    {children}
  </FeatureGate>
);

/**
 * Blockchain Feature Gate
 */
export const BlockchainGate: React.FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureGate feature="blockchain_access" requiredTier="Pro">
    {children}
  </FeatureGate>
);

export default FeatureGate;
