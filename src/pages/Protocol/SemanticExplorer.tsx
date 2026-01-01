/**
 * Semantic Explorer Page
 * Displays semantic domains, clusters, drift thresholds, and embedding config
 */

import React, { useState, useEffect } from 'react';
import { 
  getSemanticDomains, 
  getSemanticClusters, 
  getDriftThresholds,
  getEmbeddingConfig 
} from '@/api/dsidProtocol';
import { SemanticClusterLabel } from '@/components/DSIDP';
import styles from './ProtocolPages.module.css';

interface SemanticDomain {
  domain_id: string;
  name: string;
  description: string;
  cluster_count: number;
}

interface SemanticCluster {
  cluster_id: string;
  domain: string;
  name: string;
  description: string;
  keywords: string[];
  drift_threshold: number;
}

interface DriftThreshold {
  level: string;
  threshold: number;
  action: string;
}

const SemanticExplorer: React.FC = () => {
  const [domains, setDomains] = useState<SemanticDomain[]>([]);
  const [clusters, setClusters] = useState<SemanticCluster[]>([]);
  const [thresholds, setThresholds] = useState<DriftThreshold[]>([]);
  const [embeddingConfig, setEmbeddingConfig] = useState<Record<string, unknown> | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [domainsRes, clustersRes, thresholdsRes, configRes] = await Promise.all([
          getSemanticDomains(),
          getSemanticClusters(),
          getDriftThresholds(),
          getEmbeddingConfig(),
        ]);
        setDomains(domainsRes.domains || []);
        setClusters(clustersRes.clusters || []);
        setThresholds(thresholdsRes.thresholds || []);
        setEmbeddingConfig(configRes.config as unknown as Record<string, unknown> || null);
      } catch (err) {
        console.error('Failed to load semantic data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredClusters = selectedDomain 
    ? clusters.filter(c => c.domain === selectedDomain)
    : clusters;

  if (loading) return <div className={styles.loading}>Loading semantic data...</div>;

  return (
    <div className={styles.dashboardContainer}>
      {/* Embedding Config */}
      <section className={styles.section}>
        <h2>Embedding Configuration</h2>
        <div className={styles.configGrid}>
          <div className={styles.configCard}>
            <span className={styles.configValue}>{(embeddingConfig as any)?.dimensions || 768}</span>
            <span className={styles.configLabel}>Dimensions</span>
          </div>
          <div className={styles.configCard}>
            <span className={styles.configValue}>{(embeddingConfig as any)?.model || 'transformer'}</span>
            <span className={styles.configLabel}>Model</span>
          </div>
          <div className={styles.configCard}>
            <span className={styles.configValue}>{(embeddingConfig as any)?.normalization || 'L2'}</span>
            <span className={styles.configLabel}>Normalization</span>
          </div>
        </div>
      </section>

      {/* Drift Thresholds */}
      <section className={styles.section}>
        <h2>Drift Thresholds</h2>
        <div className={styles.thresholdsGrid}>
          {thresholds.map((t) => (
            <div key={t.level} className={`${styles.thresholdCard} ${styles[`drift-${t.level}`]}`}>
              <span className={styles.thresholdLevel}>{t.level}</span>
              <span className={styles.thresholdValue}>{(t.threshold * 100).toFixed(0)}%</span>
              <span className={styles.thresholdAction}>{t.action}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Domains */}
      <section className={styles.section}>
        <h2>Semantic Domains ({domains.length})</h2>
        <div className={styles.domainsGrid}>
          {domains.map((domain) => (
            <div 
              key={domain.domain_id} 
              className={`${styles.domainCard} ${selectedDomain === domain.domain_id ? styles.selected : ''}`}
              onClick={() => setSelectedDomain(selectedDomain === domain.domain_id ? null : domain.domain_id)}
            >
              <h3>{domain.name}</h3>
              <p>{domain.description}</p>
              <span className={styles.clusterCount}>{domain.cluster_count} clusters</span>
            </div>
          ))}
        </div>
      </section>

      {/* Clusters */}
      <section className={styles.section}>
        <h2>
          Semantic Clusters 
          {selectedDomain && <span className={styles.filterBadge}>Filtered: {selectedDomain}</span>}
        </h2>
        <div className={styles.clustersGrid}>
          {filteredClusters.map((cluster) => (
            <div key={cluster.cluster_id} className={styles.clusterCard}>
              <div className={styles.clusterHeader}>
                <SemanticClusterLabel cluster={`${cluster.domain}.${cluster.name}`} />
                <span className={styles.driftBadge}>{(cluster.drift_threshold * 100).toFixed(0)}%</span>
              </div>
              <p className={styles.clusterDescription}>{cluster.description}</p>
              <div className={styles.keywords}>
                {cluster.keywords?.slice(0, 5).map((kw, idx) => (
                  <span key={idx} className={styles.keyword}>{kw}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SemanticExplorer;
