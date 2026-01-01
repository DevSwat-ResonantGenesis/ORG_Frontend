/**
 * Offline Mode Dashboard
 * 
 * Main interface for offline mode features:
 * - Online/offline status
 * - Sync queue status
 * - Cache statistics
 * - Quick actions
 */

import React, { useState, useEffect } from 'react';
import styles from './OfflineDashboard.module.css';

interface SyncStats {
  totalQueued: number;
  totalSynced: number;
  totalFailed: number;
  isOnline: boolean;
  lastSyncTime: number | null;
}

interface CacheStats {
  projectCount: number;
  totalFiles: number;
  totalSize: number;
}

export const OfflineDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!window.electron) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      try {
        // Get online status
        const statusResponse = await window.electron.sync.getStatus();
        if (statusResponse.success) {
          setIsOnline(statusResponse.isOnline || false);
        }

        // Get sync stats
        const syncResponse = await window.electron.sync.getStats();
        if (syncResponse.success) {
          setSyncStats({
            totalQueued: syncResponse.totalQueued || 0,
            totalSynced: syncResponse.totalSynced || 0,
            totalFailed: syncResponse.totalFailed || 0,
            isOnline: syncResponse.isOnline || false,
            lastSyncTime: syncResponse.lastSyncTime || null,
          });
        }

        // Get cache stats
        const cacheResponse = await window.electron.cache.getStats();
        if (cacheResponse.success) {
          setCacheStats({
            projectCount: cacheResponse.projectCount || 0,
            totalFiles: cacheResponse.totalFiles || 0,
            totalSize: cacheResponse.totalSize || 0,
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();

    // Listen to online/offline events
    const unsubscribeOnline = window.electron.sync.onOnline(() => {
      setIsOnline(true);
      loadStats();
    });

    const unsubscribeOffline = window.electron.sync.onOffline(() => {
      setIsOnline(false);
      loadStats();
    });

    // Refresh stats every 5 seconds
    const interval = setInterval(loadStats, 5000);

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
      clearInterval(interval);
    };
  }, []);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!window.electron) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.notElectron}>
          Offline mode is only available in the Electron desktop application.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2>Offline Mode</h2>
        <div className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`}>
          <span className={styles.statusDot}></span>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className={styles.statsGrid}>
        {/* Sync Stats */}
        <div className={styles.statCard}>
          <h3>Sync Queue</h3>
          <div className={styles.statValue}>{syncStats?.totalQueued || 0}</div>
          <div className={styles.statLabel}>Queued Actions</div>
          <div className={styles.statSub}>
            {syncStats?.totalSynced || 0} synced • {syncStats?.totalFailed || 0} failed
          </div>
        </div>

        {/* Cache Stats */}
        <div className={styles.statCard}>
          <h3>Project Cache</h3>
          <div className={styles.statValue}>{cacheStats?.projectCount || 0}</div>
          <div className={styles.statLabel}>Cached Projects</div>
          <div className={styles.statSub}>
            {cacheStats?.totalFiles || 0} files • {formatSize(cacheStats?.totalSize || 0)}
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h3>Quick Actions</h3>
        <div className={styles.actionsGrid}>
          <button
            className={styles.actionButton}
            onClick={async () => {
              if (window.electron) {
                await window.electron.sync.startSync();
              }
            }}
          >
            Sync Now
          </button>
          <button
            className={styles.actionButton}
            onClick={async () => {
              if (window.electron) {
                const response = await window.electron.sync.clearCompleted();
                if (response.success) {
                  window.location.reload();
                }
              }
            }}
          >
            Clear Completed
          </button>
        </div>
      </div>
    </div>
  );
};

