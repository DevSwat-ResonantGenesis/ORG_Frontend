/**
 * Modern Page Layout Component - 2025 Design System
 * Provides consistent page structure with header, content, and actions
 */

import React, { ReactNode } from 'react';
import styles from './ModernPageLayout.module.css';

export interface ModernPageLayoutProps {
  title: string;
  subtitle?: string;
  description?: string;
  headerActions?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const ModernPageLayout: React.FC<ModernPageLayoutProps> = ({
  title,
  subtitle,
  headerActions,
  children,
  maxWidth = 'xl',
  loading = false,
  error = null,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={`${styles.contentWrapper} ${styles[maxWidth]}`}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={`${styles.contentWrapper} ${styles[maxWidth]}`}>
          <div className={styles.errorState}>
            <p>{error}</p>
            {onRetry && (
              <button onClick={onRetry} className={styles.retryButton}>
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.contentWrapper} ${styles[maxWidth]}`}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>{title}</h1>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {headerActions && (
              <div className={styles.headerActions}>
                {headerActions}
              </div>
            )}
          </div>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModernPageLayout;

