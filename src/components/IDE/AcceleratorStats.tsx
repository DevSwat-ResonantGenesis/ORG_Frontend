/**
 * DSID-P Accelerator Stats Display
 * Shows real-time metrics: cache hits, speedup, node connection
 */

import React, { useState, useEffect } from 'react';
import { ideAccelerator } from '@/services/dsidp';
import styles from './AcceleratorStats.module.css';

interface AcceleratorStatsProps {
  compact?: boolean;
  className?: string;
}

export const AcceleratorStats: React.FC<AcceleratorStatsProps> = ({ 
  compact = false,
  className = ''
}) => {
  const [stats, setStats] = useState({
    cacheSize: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    totalOperations: 0,
    avgLatencyMs: 0,
    parallelSpeedup: 1,
    resonantNodeConnected: false,
  });

  useEffect(() => {
    const updateStats = () => {
      const currentStats = ideAccelerator.getStats();
      setStats(prev => ({ ...prev, ...currentStats }));
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    ideAccelerator.checkResonantNode().then((connected) => {
      setStats(prev => ({ ...prev, resonantNodeConnected: connected }));
    });
  }, []);

  if (compact) {
    return (
      <div className={`${styles.compactStats} ${className}`}>
        <span className={styles.statItem}>
          <span className={styles.statIcon}>📦</span>
          {stats.cacheSize}
        </span>
        <span className={styles.statItem}>
          <span className={styles.statIcon}>🎯</span>
          {(stats.hitRate * 100).toFixed(0)}%
        </span>
        <span className={styles.statItem}>
          <span className={styles.statIcon}>⚡</span>
          {stats.parallelSpeedup.toFixed(1)}x
        </span>
        <span className={`${styles.statItem} ${stats.resonantNodeConnected ? styles.connected : styles.disconnected}`}>
          <span className={styles.statusDot}>●</span>
          Node
        </span>
      </div>
    );
  }

  return (
    <div className={`${styles.statsPanel} ${className}`}>
      <div className={styles.header}>
        <h4 className={styles.title}>DSID-P Accelerator</h4>
        <span className={`${styles.connectionStatus} ${stats.resonantNodeConnected ? styles.connected : styles.disconnected}`}>
          {stats.resonantNodeConnected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Cache</span>
          <span className={styles.statValue}>{stats.cacheSize}</span>
          <span className={styles.statUnit}>entries</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Hit Rate</span>
          <span className={`${styles.statValue} ${styles.success}`}>
            {(stats.hitRate * 100).toFixed(1)}%
          </span>
          <span className={styles.statUnit}>{stats.cacheHits}/{stats.cacheHits + stats.cacheMisses}</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Speedup</span>
          <span className={`${styles.statValue} ${styles.accent}`}>
            {stats.parallelSpeedup.toFixed(1)}x
          </span>
          <span className={styles.statUnit}>faster</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Operations</span>
          <span className={styles.statValue}>{stats.totalOperations}</span>
          <span className={styles.statUnit}>total</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Avg Latency</span>
          <span className={styles.statValue}>{stats.avgLatencyMs.toFixed(0)}</span>
          <span className={styles.statUnit}>ms</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statLabel}>Resonant Node</span>
          <span className={`${styles.statValue} ${stats.resonantNodeConnected ? styles.success : styles.error}`}>
            {stats.resonantNodeConnected ? 'Online' : 'Offline'}
          </span>
          <span className={styles.statUnit}>:8081</span>
        </div>
      </div>
    </div>
  );
};

export default AcceleratorStats;
