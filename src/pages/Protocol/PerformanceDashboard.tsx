/**
 * Performance Dashboard Page
 * Displays scaling surfaces, throughput, latency, benchmarks, and HA/DR
 */

import React, { useState, useEffect } from 'react';
import { 
  getScalingSurfaces, 
  getThroughputTargets, 
  getLatencyTargets,
  getPerformanceBenchmarks,
  getHADRArchitecture,
  getNationalBlueprint 
} from '@/api/dsidProtocol';
import styles from './ProtocolPages.module.css';

interface ScalingSurface {
  surface: string;
  name: string;
  requirements: string[];
  engineering_techniques: string[];
  throughput_targets: Record<string, string>;
  latency_targets: Record<string, string>;
}

interface ThroughputTarget {
  scale: string;
  events_per_second: string;
  description: string;
}

interface LatencyTarget {
  operation: string;
  target_ms: string;
  description: string;
}

interface PerformanceBenchmark {
  component: string;
  target: string;
}

const PerformanceDashboard: React.FC = () => {
  const [surfaces, setSurfaces] = useState<ScalingSurface[]>([]);
  const [throughput, setThroughput] = useState<ThroughputTarget[]>([]);
  const [latency, setLatency] = useState<LatencyTarget[]>([]);
  const [benchmarks, setBenchmarks] = useState<PerformanceBenchmark[]>([]);
  const [hadr, setHadr] = useState<Record<string, unknown> | null>(null);
  const [blueprint, setBlueprint] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surfacesRes, throughputRes, latencyRes, benchmarksRes, hadrRes, blueprintRes] = await Promise.all([
          getScalingSurfaces(),
          getThroughputTargets(),
          getLatencyTargets(),
          getPerformanceBenchmarks(),
          getHADRArchitecture(),
          getNationalBlueprint(),
        ]);
        setSurfaces(surfacesRes.surfaces || []);
        setThroughput(throughputRes.targets || []);
        setLatency(latencyRes.targets || []);
        setBenchmarks(benchmarksRes.benchmarks || []);
        setHadr(hadrRes.architecture as unknown as Record<string, unknown> || null);
        setBlueprint(blueprintRes.blueprint || null);
      } catch (err) {
        console.error('Failed to load performance data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Loading performance data...</div>;

  return (
    <div className={styles.dashboardContainer}>
      {/* Performance Benchmarks */}
      <section className={styles.section}>
        <h2>Performance Benchmarks</h2>
        <div className={styles.benchmarksGrid}>
          {benchmarks.map((b) => (
            <div key={b.component} className={styles.benchmarkCard}>
              <span className={styles.benchmarkValue}>{b.target}</span>
              <span className={styles.benchmarkLabel}>{b.component}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Throughput Targets */}
      <section className={styles.section}>
        <h2>Throughput Targets</h2>
        <div className={styles.throughputGrid}>
          {throughput.map((t) => (
            <div key={t.scale} className={`${styles.throughputCard} ${styles[`scale-${t.scale}`]}`}>
              <h3>{t.scale}</h3>
              <span className={styles.throughputValue}>{t.events_per_second}</span>
              <p>{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latency Targets */}
      <section className={styles.section}>
        <h2>Latency Targets</h2>
        <div className={styles.latencyGrid}>
          {latency.map((l) => (
            <div key={l.operation} className={styles.latencyCard}>
              <span className={styles.latencyValue}>{l.target_ms}</span>
              <span className={styles.latencyOperation}>{l.operation}</span>
              <p>{l.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scaling Surfaces */}
      <section className={styles.section}>
        <h2>Scaling Surfaces ({surfaces.length})</h2>
        <div className={styles.surfacesGrid}>
          {surfaces.map((surface) => (
            <div key={surface.surface} className={styles.surfaceCard}>
              <h3>{surface.name}</h3>
              <div className={styles.surfaceRequirements}>
                <h4>Requirements:</h4>
                <ul>
                  {surface.requirements?.slice(0, 3).map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.surfaceTechniques}>
                <h4>Engineering Techniques:</h4>
                <div className={styles.techniquesList}>
                  {surface.engineering_techniques?.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className={styles.techniqueTag}>{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HA/DR Architecture */}
      <section className={styles.section}>
        <h2>HA/DR Architecture</h2>
        <div className={styles.hadrGrid}>
          <div className={styles.hadrCard}>
            <h3>High Availability</h3>
            <ul>
              <li>Nodes per cluster: {(hadr as any)?.high_availability?.nodes_per_cluster || '3-7'}</li>
              <li>DAG replication: {(hadr as any)?.high_availability?.dag_replication || 'multi-region'}</li>
              <li>Compute grid: {(hadr as any)?.high_availability?.compute_grid || 'hot-standby'}</li>
            </ul>
          </div>
          <div className={styles.hadrCard}>
            <h3>Disaster Recovery</h3>
            <ul>
              <li>Replication: {(hadr as any)?.disaster_recovery?.replication || 'cross-region'}</li>
              <li>DAG snapshots: {(hadr as any)?.disaster_recovery?.dag_snapshots || 'periodic'}</li>
              <li>Failover: {(hadr as any)?.disaster_recovery?.failover || 'automated'}</li>
            </ul>
          </div>
          <div className={styles.hadrCard}>
            <h3>Recovery Objectives</h3>
            <div className={styles.recoveryObjectives}>
              <div className={styles.objective}>
                <span className={styles.objectiveValue}>{(hadr as any)?.recovery_objectives?.RTO || '<30s'}</span>
                <span className={styles.objectiveLabel}>RTO</span>
              </div>
              <div className={styles.objective}>
                <span className={styles.objectiveValue}>{(hadr as any)?.recovery_objectives?.RPO || '0-5s'}</span>
                <span className={styles.objectiveLabel}>RPO</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* National Scale Blueprint */}
      <section className={styles.section}>
        <h2>National Scale Blueprint</h2>
        <div className={styles.blueprintGrid}>
          <div className={styles.blueprintCard}>
            <span className={styles.blueprintValue}>{(blueprint as any)?.population || '30M'}</span>
            <span className={styles.blueprintLabel}>Population</span>
          </div>
          <div className={styles.blueprintCard}>
            <span className={styles.blueprintValue}>{(blueprint as any)?.agents || '5-50M'}</span>
            <span className={styles.blueprintLabel}>Agents</span>
          </div>
          <div className={styles.blueprintCard}>
            <span className={styles.blueprintValue}>{(blueprint as any)?.workflows_per_day || '100M-1B'}</span>
            <span className={styles.blueprintLabel}>Workflows/Day</span>
          </div>
          <div className={styles.blueprintCard}>
            <span className={styles.blueprintValue}>{(blueprint as any)?.registry_nodes || '5-9'}</span>
            <span className={styles.blueprintLabel}>Registry Nodes</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PerformanceDashboard;
