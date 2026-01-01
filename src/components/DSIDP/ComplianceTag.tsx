/**
 * ComplianceTag Component
 * Displays compliance framework tags (GDPR, HIPAA, EU AI Act, etc.)
 */

import React from 'react';
import styles from './DSIDPComponents.module.css';

export type ComplianceFramework = 'GDPR' | 'HIPAA' | 'EU_AI_ACT' | 'ISO_42001' | 'NIST_AI_RMF' | 'CCPA' | 'SOC2';

interface ComplianceTagProps {
  framework: ComplianceFramework;
  status?: 'compliant' | 'pending' | 'non_compliant';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FRAMEWORK_CONFIG: Record<ComplianceFramework, { label: string; color: string }> = {
  GDPR: { label: 'GDPR', color: '#3b82f6' },
  HIPAA: { label: 'HIPAA', color: '#ef4444' },
  EU_AI_ACT: { label: 'EU AI Act', color: '#8b5cf6' },
  ISO_42001: { label: 'ISO 42001', color: '#10b981' },
  NIST_AI_RMF: { label: 'NIST AI RMF', color: '#f59e0b' },
  CCPA: { label: 'CCPA', color: '#06b6d4' },
  SOC2: { label: 'SOC2', color: '#ec4899' },
};

const STATUS_ICON: Record<string, string> = {
  compliant: '✓',
  pending: '○',
  non_compliant: '✗',
};

export const ComplianceTag: React.FC<ComplianceTagProps> = ({
  framework,
  status = 'compliant',
  size = 'md',
  className = '',
}) => {
  const config = FRAMEWORK_CONFIG[framework];
  const icon = STATUS_ICON[status];

  return (
    <span
      className={`${styles.complianceTag} ${styles[`size-${size}`]} ${styles[`status-${status}`]} ${className}`}
      style={{ borderColor: config.color }}
      title={`${config.label}: ${status}`}
    >
      <span className={styles.complianceIcon} style={{ color: config.color }}>{icon}</span>
      <span className={styles.complianceLabel}>{config.label}</span>
    </span>
  );
};

export default ComplianceTag;
