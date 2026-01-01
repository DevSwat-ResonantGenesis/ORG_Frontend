/**
 * Control Plane Badge Strip
 * Read-only badges for Chat page showing trust, governance, compliance, and audit status
 * Clicking any badge opens Control Plane in context
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ControlPlaneBadgeStrip.module.css';

interface ControlPlaneBadgeStripProps {
  trustTier?: 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
  governanceStatus?: 'passed' | 'flagged' | 'blocked' | 'pending';
  complianceTags?: string[];
  auditVerified?: boolean;
  semanticCluster?: string;
  className?: string;
}

const trustColors: Record<string, string> = {
  T0: '#ef4444',
  T1: '#f59e0b',
  T2: '#3b82f6',
  T3: '#10b981',
  T4: '#8b5cf6',
};

const governanceIcons: Record<string, string> = {
  passed: '✓',
  flagged: '⚠',
  blocked: '✕',
  pending: '○',
};

const governanceColors: Record<string, string> = {
  passed: '#10b981',
  flagged: '#f59e0b',
  blocked: '#ef4444',
  pending: '#6b7280',
};

const ControlPlaneBadgeStrip: React.FC<ControlPlaneBadgeStripProps> = ({
  trustTier,
  governanceStatus,
  complianceTags,
  auditVerified,
  semanticCluster,
  className,
}) => {
  const navigate = useNavigate();

  const handleBadgeClick = (route: string) => {
    navigate(route);
  };

  // Don't render if no data
  if (!trustTier && !governanceStatus && !complianceTags?.length && !auditVerified && !semanticCluster) {
    return null;
  }

  return (
    <div className={`${styles.badgeStrip} ${className || ''}`}>
      {/* Trust Badge */}
      {trustTier && (
        <button
          className={styles.badge}
          onClick={() => handleBadgeClick('/control-plane/trust')}
          style={{ borderColor: trustColors[trustTier] }}
          title="View Trust Dashboard"
        >
          <span className={styles.badgeIcon} style={{ color: trustColors[trustTier] }}>●</span>
          <span className={styles.badgeLabel}>Trust:</span>
          <span className={styles.badgeValue} style={{ color: trustColors[trustTier] }}>{trustTier}</span>
        </button>
      )}

      {/* Governance Badge */}
      {governanceStatus && (
        <button
          className={styles.badge}
          onClick={() => handleBadgeClick('/control-plane/governance')}
          style={{ borderColor: governanceColors[governanceStatus] }}
          title="View Governance Center"
        >
          <span className={styles.badgeIcon} style={{ color: governanceColors[governanceStatus] }}>
            {governanceIcons[governanceStatus]}
          </span>
          <span className={styles.badgeLabel}>Governance:</span>
          <span className={styles.badgeValue} style={{ color: governanceColors[governanceStatus] }}>
            {governanceStatus.toUpperCase()}
          </span>
        </button>
      )}

      {/* Compliance Badge */}
      {complianceTags && complianceTags.length > 0 && (
        <button
          className={styles.badge}
          onClick={() => handleBadgeClick('/control-plane/compliance')}
          title="View Compliance Hub"
        >
          <span className={styles.badgeIcon} style={{ color: '#3b82f6' }}>◆</span>
          <span className={styles.badgeLabel}>Compliance:</span>
          <span className={styles.badgeValue} style={{ color: '#3b82f6' }}>
            {complianceTags.slice(0, 2).join(', ')}
            {complianceTags.length > 2 && ` +${complianceTags.length - 2}`}
          </span>
        </button>
      )}

      {/* Audit Badge */}
      {auditVerified !== undefined && (
        <button
          className={styles.badge}
          onClick={() => handleBadgeClick('/control-plane/security')}
          style={{ borderColor: auditVerified ? '#10b981' : '#6b7280' }}
          title="View Security Monitor"
        >
          <span className={styles.badgeIcon} style={{ color: auditVerified ? '#10b981' : '#6b7280' }}>
            {auditVerified ? '✓' : '○'}
          </span>
          <span className={styles.badgeLabel}>Audit:</span>
          <span className={styles.badgeValue} style={{ color: auditVerified ? '#10b981' : '#6b7280' }}>
            {auditVerified ? 'VERIFIED' : 'PENDING'}
          </span>
        </button>
      )}

      {/* Semantic Cluster Badge */}
      {semanticCluster && (
        <button
          className={styles.badge}
          onClick={() => handleBadgeClick('/control-plane/semantics')}
          title="View Semantic Explorer"
        >
          <span className={styles.badgeIcon} style={{ color: '#8b5cf6' }}>◎</span>
          <span className={styles.badgeLabel}>Cluster:</span>
          <span className={styles.badgeValue} style={{ color: '#8b5cf6' }}>{semanticCluster}</span>
        </button>
      )}
    </div>
  );
};

export default ControlPlaneBadgeStrip;
