import React from 'react';
import styles from './UnifiedPageLayout.module.css';

interface UnifiedPageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

/**
 * Unified Page Layout Component
 * Standard layout for all rebuilt pages using HomeNew design system
 */
export const UnifiedPageLayout: React.FC<UnifiedPageLayoutProps> = ({
  title,
  subtitle,
  children,
  headerAction,
}) => {
  return (
    <div className={styles.page}>
      {/* Header removed - using unified Header component */}
      <div className={styles.content}>
        <div style={{ marginBottom: '24px' }}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {headerAction && <div className={styles.headerAction} style={{ marginBottom: '24px' }}>{headerAction}</div>}
        {children}
      </div>
    </div>
  );
};

