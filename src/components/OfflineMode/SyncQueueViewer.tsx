/**
 * Sync Queue Viewer
 * 
 * View and manage sync queue:
 * - List queued actions
 * - View action status
 * - Retry failed actions
 * - Clear completed actions
 */

import React, { useState, useEffect } from 'react';
import styles from './SyncQueueViewer.module.css';

interface QueuedAction {
  id: string;
  type: string;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retries: number;
  error?: string;
  data?: any;
}

export const SyncQueueViewer: React.FC = () => {
  const [actions, setActions] = useState<QueuedAction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  useEffect(() => {
    if (!window.electron) {
      setLoading(false);
      return;
    }

    loadQueue();

    // Auto-refresh every 3 seconds if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(loadQueue, 3000);
    }

    // Listen to sync events
    const unsubscribeQueued = window.electron.sync.onActionQueued((action) => {
      loadQueue();
    });

    const unsubscribeCompleted = window.electron.sync.onActionCompleted(() => {
      loadQueue();
    });

    const unsubscribeFailed = window.electron.sync.onActionFailed(() => {
      loadQueue();
    });

    return () => {
      if (interval) clearInterval(interval);
      unsubscribeQueued();
      unsubscribeCompleted();
      unsubscribeFailed();
    };
  }, [autoRefresh]);

  const loadQueue = async () => {
    if (!window.electron) return;

    try {
      const response = await window.electron.sync.getQueue();
      if (response.success && response.actions) {
        setActions(response.actions);
      }
    } catch (error) {
      console.error('Failed to load queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCompleted = async () => {
    if (!window.electron) return;

    try {
      const response = await window.electron.sync.clearCompleted();
      if (response.success) {
        await loadQueue();
      }
    } catch (error) {
      console.error('Failed to clear completed:', error);
    }
  };

  const handleStartSync = async () => {
    if (!window.electron) return;

    try {
      await window.electron.sync.startSync();
      await loadQueue();
    } catch (error) {
      console.error('Failed to start sync:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'processing':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading queue...</div>
      </div>
    );
  }

  if (!window.electron) {
    return (
      <div className={styles.container}>
        <div className={styles.notElectron}>
          Sync queue viewer is only available in the Electron desktop application.
        </div>
      </div>
    );
  }

  const pendingCount = actions.filter(a => a.status === 'pending').length;
  const processingCount = actions.filter(a => a.status === 'processing').length;
  const completedCount = actions.filter(a => a.status === 'completed').length;
  const failedCount = actions.filter(a => a.status === 'failed').length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3>Sync Queue</h3>
          <p className={styles.subtitle}>View and manage queued sync actions</p>
        </div>
        <div className={styles.headerActions}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button onClick={handleStartSync} className={styles.syncButton}>
            Sync Now
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Pending:</span>
          <span className={styles.summaryValue}>{pendingCount}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Processing:</span>
          <span className={styles.summaryValue}>{processingCount}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Completed:</span>
          <span className={styles.summaryValue}>{completedCount}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Failed:</span>
          <span className={`${styles.summaryValue} ${styles.failed}`}>{failedCount}</span>
        </div>
      </div>

      {/* Actions List */}
      <div className={styles.actionsList}>
        {actions.length === 0 ? (
          <div className={styles.emptyState}>No actions in queue</div>
        ) : (
          actions.map((action) => (
            <div key={action.id} className={styles.actionItem}>
              <div className={styles.actionHeader}>
                <div className={styles.actionInfo}>
                  <span className={styles.actionType}>{action.type}</span>
                  <span className={styles.actionId}>#{action.id.substring(0, 8)}</span>
                </div>
                <span
                  className={`${styles.actionStatus} ${styles[getStatusColor(action.status)]}`}
                >
                  {action.status}
                </span>
              </div>
              <div className={styles.actionMeta}>
                <span>{formatTimestamp(action.timestamp)}</span>
                {action.retries > 0 && (
                  <span className={styles.retries}>Retries: {action.retries}</span>
                )}
              </div>
              {action.error && (
                <div className={styles.actionError}>
                  <strong>Error:</strong> {action.error}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {completedCount > 0 && (
        <div className={styles.footer}>
          <button onClick={handleClearCompleted} className={styles.clearButton}>
            Clear Completed ({completedCount})
          </button>
        </div>
      )}
    </div>
  );
};

