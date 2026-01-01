/**
 * Anchor Management Component
 * List, view, and manage memory anchors for an agent
 */
import React, { useState, useEffect } from 'react';
import { settingsApi, type Anchor } from '@/api/settings';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { logger } from '@/utils/logger';
import styles from './AnchorManagement.module.css';

interface AnchorManagementProps {
  agentId: string;
}

export const AnchorManagement: React.FC<AnchorManagementProps> = ({ agentId }) => {
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isolateAnchors, setIsolateAnchors] = useState<boolean | null>(null);
  const limit = 50;

  useEffect(() => {
    loadAgentInfo();
    loadAnchors();
  }, [agentId]);

  const loadAgentInfo = async () => {
    if (!agentId) return;
    
    try {
      const agent = await settingsApi.getAgent(agentId);
      setIsolateAnchors(agent.isolate_anchors !== undefined ? agent.isolate_anchors : true);
    } catch (err: any) {
      logger.error('Failed to load agent info', err);
    }
  };

  const loadAnchors = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setOffset(0);
      }
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const data = await settingsApi.listAgentAnchors(agentId, limit, currentOffset);
      
      if (reset) {
        setAnchors(data);
      } else {
        setAnchors((prev) => [...prev, ...data]);
      }
      
      setHasMore(data.length === limit);
      if (!reset) {
        setOffset(currentOffset + data.length);
      }
    } catch (err: any) {
      logger.error('Failed to load anchors', err);
      setError(err?.message || 'Failed to load anchors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (anchorId: string) => {
    if (!confirm('Are you sure you want to delete this anchor?')) {
      return;
    }

    try {
      await settingsApi.deleteAgentAnchor(agentId, anchorId);
      setAnchors((prev) => prev.filter((a) => a.id !== anchorId));
    } catch (err: any) {
      logger.error('Failed to delete anchor', err);
      alert(err?.message || 'Failed to delete anchor');
    }
  };

  const handleLoadMore = () => {
    loadAnchors();
  };

  if (loading && anchors.length === 0) {
    return <LoadingState message="Loading anchors..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Memory Anchors</h2>
          <p className={styles.subtitle}>
            Manage memory anchors extracted from conversations and code
          </p>
        </div>
        <button
          className={styles.refreshButton}
          onClick={() => loadAnchors(true)}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={() => loadAnchors(true)} />}

      {isolateAnchors !== null && (
        <div className={styles.isolationNotice}>
          <p>
            {isolateAnchors 
              ? "🔒 Anchors are isolated to this agent. Only this agent can see and use these anchors."
              : "🌐 Anchors are shared across all your agents. All agents can see and use these anchors."}
          </p>
        </div>
      )}

      {anchors.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No anchors found. Anchors will appear here as you use the agent.</p>
        </div>
      ) : (
        <>
          <div className={styles.anchorList}>
            {anchors.map((anchor) => (
              <div key={anchor.id} className={styles.anchorCard}>
                <div className={styles.anchorHeader}>
                  <div className={styles.anchorText}>{anchor.anchor_text}</div>
                  <span className={`${styles.anchorType} ${styles[anchor.anchor_type]}`}>
                    {anchor.anchor_type}
                  </span>
                </div>

                {anchor.context && (
                  <div className={styles.anchorContext}>{anchor.context}</div>
                )}

                <div className={styles.anchorMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Importance:</span>
                    <span className={styles.metaValue}>
                      {(anchor.importance_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  {anchor.xyz_x !== undefined && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Position:</span>
                      <span className={styles.metaValue}>
                        ({anchor.xyz_x?.toFixed(2)}, {anchor.xyz_y?.toFixed(2)}, {anchor.xyz_z?.toFixed(2)})
                      </span>
                    </div>
                  )}
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Hash:</span>
                    <code className={styles.hashValue}>{anchor.anchor_hash.slice(0, 16)}...</code>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Created:</span>
                    <span className={styles.metaValue}>
                      {new Date(anchor.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className={styles.anchorActions}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(anchor.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className={styles.loadMore}>
              <button
                className={styles.loadMoreButton}
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}

          <div className={styles.stats}>
            <p>Showing {anchors.length} anchor{anchors.length !== 1 ? 's' : ''}</p>
          </div>
        </>
      )}
    </div>
  );
};

