/**
 * Autonomy Mode Switcher Component
 * 
 * Allows switching between UNBOUNDED and GOVERNED autonomy modes.
 * UNBOUNDED: Full autonomy, no restrictions (admin/research only)
 * GOVERNED: Bounded autonomy, enterprise-safe (default)
 */

import React, { useState } from 'react';
import { useToastContext } from '@/context/ToastContext';
import styles from './ModeSwitcher.module.css';

export type AutonomyMode = 'unbounded' | 'governed';

interface ModeSwitcherProps {
  agentId: string;
  currentMode: AutonomyMode;
  canSwitchToUnbounded: boolean;
  onModeChange: (mode: AutonomyMode) => Promise<void>;
  compact?: boolean;
}

// SVG Icons
const UnlockedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
  </svg>
);

const LockedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
  agentId,
  currentMode,
  canSwitchToUnbounded,
  onModeChange,
  compact = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const toast = useToastContext();

  const handleModeSwitch = async (newMode: AutonomyMode) => {
    if (newMode === currentMode) return;
    
    if (newMode === 'unbounded') {
      if (!canSwitchToUnbounded) {
        toast.error('You do not have permission to enable UNBOUNDED mode');
        return;
      }
      setShowConfirm(true);
      return;
    }

    await switchMode(newMode);
  };

  const switchMode = async (newMode: AutonomyMode) => {
    setLoading(true);
    try {
      await onModeChange(newMode);
      toast.success(`Switched to ${newMode.toUpperCase()} mode`);
    } catch (error) {
      toast.error(`Failed to switch mode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <span className={`${styles.compactBadge} ${styles[currentMode]}`}>
          {currentMode === 'unbounded' ? <UnlockedIcon /> : <LockedIcon />}
          <span>{currentMode.toUpperCase()}</span>
        </span>
        <button
          className={styles.compactToggle}
          onClick={() => handleModeSwitch(currentMode === 'governed' ? 'unbounded' : 'governed')}
          disabled={loading || (currentMode === 'governed' && !canSwitchToUnbounded)}
          title={currentMode === 'governed' ? 'Switch to UNBOUNDED' : 'Switch to GOVERNED'}
        >
          {loading ? '...' : 'Switch'}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Current Mode Indicator */}
      <div className={styles.modeIndicator}>
        <span className={styles.label}>Autonomy Mode:</span>
        <span className={`${styles.badge} ${styles[currentMode]}`}>
          {currentMode === 'unbounded' ? <UnlockedIcon /> : <LockedIcon />}
          <span>{currentMode === 'unbounded' ? 'UNBOUNDED' : 'GOVERNED'}</span>
        </span>
      </div>

      {/* Mode Switcher Buttons */}
      <div className={styles.switcher}>
        <button
          className={`${styles.modeButton} ${currentMode === 'governed' ? styles.active : ''}`}
          onClick={() => handleModeSwitch('governed')}
          disabled={loading || currentMode === 'governed'}
        >
          <span className={styles.modeIcon}><LockedIcon /></span>
          <div className={styles.modeInfo}>
            <span className={styles.modeName}>GOVERNED</span>
            <span className={styles.modeDesc}>Bounded, Enterprise-Safe</span>
          </div>
          {currentMode === 'governed' && (
            <span className={styles.activeIndicator}><CheckIcon /></span>
          )}
        </button>

        <button
          className={`${styles.modeButton} ${currentMode === 'unbounded' ? styles.active : ''} ${!canSwitchToUnbounded ? styles.disabled : ''}`}
          onClick={() => handleModeSwitch('unbounded')}
          disabled={loading || currentMode === 'unbounded' || !canSwitchToUnbounded}
        >
          <span className={styles.modeIcon}><UnlockedIcon /></span>
          <div className={styles.modeInfo}>
            <span className={styles.modeName}>UNBOUNDED</span>
            <span className={styles.modeDesc}>Full Autonomy, Research</span>
          </div>
          {currentMode === 'unbounded' && (
            <span className={styles.activeIndicator}><CheckIcon /></span>
          )}
          {!canSwitchToUnbounded && currentMode !== 'unbounded' && (
            <span className={styles.lockedBadge}>Admin Only</span>
          )}
        </button>
      </div>

      {/* Mode Features */}
      <div className={styles.featuresSection}>
        {currentMode === 'unbounded' ? (
          <div className={styles.unboundedFeatures}>
            <h4>UNBOUNDED Features Active</h4>
            <ul>
              <li><CheckIcon /> Goal Generation</li>
              <li><CheckIcon /> Self-Governance</li>
              <li><CheckIcon /> Unlimited Wallet</li>
              <li><CheckIcon /> No Approval Gates</li>
              <li><CheckIcon /> Binding Contracts</li>
            </ul>
            <p className={styles.warning}>
              <WarningIcon /> Use only for internal research and testing
            </p>
          </div>
        ) : (
          <div className={styles.governedFeatures}>
            <h4>GOVERNED Limits Active</h4>
            <ul>
              <li><LockedIcon /> Daily Budget: $100</li>
              <li><LockedIcon /> Transaction Limit: $50</li>
              <li><LockedIcon /> Approval Required: High-risk actions</li>
              <li><LockedIcon /> Audit Trail: Enabled</li>
              <li><LockedIcon /> Contract Approval: Required</li>
            </ul>
          </div>
        )}
      </div>

      {/* Confirmation Modal for UNBOUNDED */}
      {showConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmHeader}>
              <WarningIcon />
              <h3>Enable UNBOUNDED Mode?</h3>
            </div>
            <div className={styles.confirmContent}>
              <p>This will give the agent:</p>
              <ul>
                <li>No spending limits</li>
                <li>No approval requirements</li>
                <li>Self-governance capabilities</li>
                <li>Goal generation autonomy</li>
                <li>Binding contract creation</li>
              </ul>
              <p className={styles.confirmWarning}>
                <strong>Warning:</strong> Only use for internal research and testing.
                Not recommended for production or customer-facing agents.
              </p>
            </div>
            <div className={styles.confirmActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={() => switchMode('unbounded')}
                disabled={loading}
              >
                {loading ? 'Switching...' : 'Enable UNBOUNDED'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeSwitcher;
