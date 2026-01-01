/**
 * AuditTrailLink Component
 * Displays link to audit entry with hash reference
 */

import React from 'react';
import styles from './DSIDPComponents.module.css';

interface AuditTrailLinkProps {
  hash: string;
  timestamp?: string;
  onClick?: (hash: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AuditTrailLink: React.FC<AuditTrailLinkProps> = ({
  hash,
  timestamp,
  onClick,
  size = 'md',
  className = '',
}) => {
  const shortHash = hash.length > 12 ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : hash;

  const handleClick = () => {
    if (onClick) {
      onClick(hash);
    }
  };

  return (
    <span
      className={`${styles.auditLink} ${styles[`size-${size}`]} ${className}`}
      onClick={handleClick}
      title={`Audit Hash: ${hash}${timestamp ? `\nTimestamp: ${timestamp}` : ''}`}
      role="button"
      tabIndex={0}
    >
      <span className={styles.auditIcon}>📋</span>
      <span className={styles.auditHash}>{shortHash}</span>
    </span>
  );
};

export default AuditTrailLink;
