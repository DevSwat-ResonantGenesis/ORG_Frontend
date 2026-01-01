/**
 * Loading skeleton components for better UX
 */
import React from 'react';
import styles from './LoadingSkeleton.module.css';

export const LoadingSkeleton: React.FC<{ height?: string; width?: string }> = ({ 
  height = '20px', 
  width = '100%' 
}) => (
  <div className={styles.skeleton} style={{ height, width }} />
);

export const CardSkeleton: React.FC = () => (
  <div className={styles.cardSkeleton}>
    <LoadingSkeleton height="24px" width="60%" />
    <LoadingSkeleton height="16px" width="80%" />
    <LoadingSkeleton height="16px" width="70%" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className={styles.tableSkeleton}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={styles.tableRow}>
        <LoadingSkeleton height="16px" width="20%" />
        <LoadingSkeleton height="16px" width="30%" />
        <LoadingSkeleton height="16px" width="25%" />
        <LoadingSkeleton height="16px" width="15%" />
      </div>
    ))}
  </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className={styles.listSkeleton}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className={styles.listItem}>
        <LoadingSkeleton height="40px" width="40px" />
        <div className={styles.listContent}>
          <LoadingSkeleton height="16px" width="60%" />
          <LoadingSkeleton height="14px" width="40%" />
        </div>
      </div>
    ))}
  </div>
);
