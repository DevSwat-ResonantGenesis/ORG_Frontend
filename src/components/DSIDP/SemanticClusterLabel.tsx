/**
 * SemanticClusterLabel Component
 * Displays semantic cluster classification (e.g., "finance.trading")
 */

import React from 'react';
import styles from './DSIDPComponents.module.css';

interface SemanticClusterLabelProps {
  cluster: string;
  domain?: string;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DOMAIN_COLORS: Record<string, string> = {
  finance: '#10b981',
  healthcare: '#ef4444',
  legal: '#8b5cf6',
  technology: '#3b82f6',
  education: '#f59e0b',
  government: '#6366f1',
  logistics: '#14b8a6',
  energy: '#f97316',
  telecom: '#06b6d4',
  retail: '#ec4899',
  manufacturing: '#84cc16',
  research: '#a855f7',
};

export const SemanticClusterLabel: React.FC<SemanticClusterLabelProps> = ({
  cluster,
  domain,
  confidence,
  size = 'md',
  className = '',
}) => {
  const extractedDomain = domain || cluster.split('.')[0] || 'unknown';
  const color = DOMAIN_COLORS[extractedDomain.toLowerCase()] || '#6b7280';

  return (
    <span
      className={`${styles.semanticCluster} ${styles[`size-${size}`]} ${className}`}
      style={{ borderColor: color }}
      title={confidence ? `Confidence: ${(confidence * 100).toFixed(1)}%` : undefined}
    >
      <span className={styles.semanticIcon} style={{ backgroundColor: color }}>◆</span>
      <span className={styles.semanticLabel}>{cluster}</span>
      {confidence !== undefined && (
        <span className={styles.semanticConfidence}>{(confidence * 100).toFixed(0)}%</span>
      )}
    </span>
  );
};

export default SemanticClusterLabel;
