/**
 * Agent Metrics Component
 * Display performance metrics and analytics for an agent
 */
import React, { useState, useEffect } from 'react';
import { settingsApi } from '@/api/settings';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { logger } from '@/utils/logger';
import styles from './AgentMetrics.module.css';

interface AgentMetricsProps {
  agentId: string;
}

interface MetricsData {
  total_messages: number;
  messages_last_month: number;
  average_response_time_seconds: number;
  average_response_time_formatted: string;
  total_tokens_used: number;
  total_anchors: number;
  anchors_last_week: number;
  anchor_creation_rate_per_week: number;
  patch_statistics: Record<number, {
    enabled: boolean;
    execution_mode: string;
    executions: number;
    last_executed?: string;
  }>;
  enabled_patches_count: number;
  last_updated: string;
}

export const AgentMetrics: React.FC<AgentMetricsProps> = ({ agentId }) => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, [agentId]);

  const loadMetrics = async () => {
    try {
      setError(null);
      const data = await settingsApi.getAgentMetrics(agentId);
      setMetrics(data);
    } catch (err: any) {
      logger.error('Failed to load metrics', err);
      setError(err?.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading && !metrics) {
    return <LoadingState message="Loading metrics..." />;
  }

  if (error && !metrics) {
    return <ErrorState message={error} onRetry={loadMetrics} />;
  }

  if (!metrics) {
    return <div className={styles.emptyState}>No metrics available</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Agent Performance Metrics</h2>
          <p className={styles.subtitle}>
            Real-time analytics and performance data for this agent
          </p>
        </div>
        <button
          className={styles.refreshButton}
          onClick={loadMetrics}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <p>{error}</p>
        </div>
      )}

      <div className={styles.metricsGrid}>
        {/* Total Messages */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Total Messages</h3>
            <span className={styles.metricIcon}>💬</span>
          </div>
          <div className={styles.metricValue}>{formatNumber(metrics.total_messages)}</div>
          <div className={styles.metricSubtext}>
            {metrics.messages_last_month} in last 30 days
          </div>
        </div>

        {/* Average Response Time */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Avg Response Time</h3>
            <span className={styles.metricIcon}>⚡</span>
          </div>
          <div className={styles.metricValue}>
            {metrics.average_response_time_formatted}
          </div>
          <div className={styles.metricSubtext}>
            {metrics.average_response_time_seconds > 0
              ? `${metrics.average_response_time_seconds.toFixed(2)} seconds`
              : 'No data yet'}
          </div>
        </div>

        {/* Token Usage */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Token Usage</h3>
            <span className={styles.metricIcon}>🔢</span>
          </div>
          <div className={styles.metricValue}>{formatNumber(metrics.total_tokens_used)}</div>
          <div className={styles.metricSubtext}>
            Total tokens consumed
          </div>
        </div>

        {/* Memory Anchors */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Memory Anchors</h3>
            <span className={styles.metricIcon}>⚓</span>
          </div>
          <div className={styles.metricValue}>{formatNumber(metrics.total_anchors)}</div>
          <div className={styles.metricSubtext}>
            {metrics.anchors_last_week} created in last 7 days
          </div>
        </div>

        {/* Anchor Creation Rate */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Anchor Creation Rate</h3>
            <span className={styles.metricIcon}>📈</span>
          </div>
          <div className={styles.metricValue}>
            {metrics.anchor_creation_rate_per_week}/week
          </div>
          <div className={styles.metricSubtext}>
            Average per week
          </div>
        </div>

        {/* Enabled Patches */}
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <h3 className={styles.metricTitle}>Active Patches</h3>
            <span className={styles.metricIcon}>🔧</span>
          </div>
          <div className={styles.metricValue}>{metrics.enabled_patches_count}</div>
          <div className={styles.metricSubtext}>
            Patches currently enabled
          </div>
        </div>
      </div>

      {/* Patch Execution Statistics */}
      {metrics.enabled_patches_count > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Patch Execution Statistics</h3>
          <div className={styles.patchStatsGrid}>
            {Object.entries(metrics.patch_statistics).map(([patchNum, stats]) => (
              <div key={patchNum} className={styles.patchCard}>
                <div className={styles.patchHeader}>
                  <span className={styles.patchNumber}>Patch #{patchNum}</span>
                  <span className={`${styles.patchStatus} ${stats.enabled ? styles.enabled : styles.disabled}`}>
                    {stats.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className={styles.patchDetails}>
                  <div className={styles.patchDetail}>
                    <span className={styles.patchLabel}>Mode:</span>
                    <span className={styles.patchValue}>{stats.execution_mode}</span>
                  </div>
                  <div className={styles.patchDetail}>
                    <span className={styles.patchLabel}>Executions:</span>
                    <span className={styles.patchValue}>{formatNumber(stats.executions)}</span>
                  </div>
                  {stats.last_executed && (
                    <div className={styles.patchDetail}>
                      <span className={styles.patchLabel}>Last Run:</span>
                      <span className={styles.patchValue}>{formatDate(stats.last_executed)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className={styles.footer}>
        <p className={styles.lastUpdated}>
          Last updated: {formatDate(metrics.last_updated)}
        </p>
      </div>
    </div>
  );
};

