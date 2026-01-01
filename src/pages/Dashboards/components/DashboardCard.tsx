import React from 'react';
import styles from './DashboardCard.module.css';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  className = '',
  headerAction,
}) => {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {headerAction && <div className={styles.headerAction}>{headerAction}</div>}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

