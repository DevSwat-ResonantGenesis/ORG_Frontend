/**
 * Credit Display Component
 * Shows user's remaining credits for platform API key usage
 */

import React, { useState, useEffect } from 'react';
import { getCredits } from '../api/billing';
import styles from './CreditDisplay.module.css';

interface CreditDisplayProps {
  userId?: string;
  className?: string;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ userId, className }) => {
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchCredits = async () => {
      try {
        const balance = await getCredits();
        setCredits(balance.balance);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch credits:', err);
        setError('Failed to load credits');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchCredits, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  if (!userId) return null;

  const getCreditColor = () => {
    if (credits >= 500) return styles.high;
    if (credits >= 100) return styles.medium;
    return styles.low;
  };

  return (
    <div className={`${styles.creditDisplay} ${className || ''}`}>
      <div className={styles.creditIcon}>💳</div>
      <div className={styles.creditInfo}>
        <div className={styles.creditLabel}>Credits</div>
        <div className={`${styles.creditValue} ${getCreditColor()}`}>
          {isLoading ? '...' : error ? 'N/A' : credits.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default CreditDisplay;
