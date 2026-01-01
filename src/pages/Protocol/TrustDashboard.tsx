/**
 * Trust & Reputation Dashboard
 * Displays trust tiers (T0-T4), factors, decay, and penalties
 */

import React, { useState, useEffect } from 'react';
import { 
  getTrustTiers, 
  getTrustFactors, 
  getReputationDecay,
  getPenalties 
} from '@/api/dsidProtocol';
import { TrustBadge } from '@/components/DSIDP';
import styles from './ProtocolPages.module.css';

interface TrustTier {
  tier: string;
  name: string;
  description: string;
  min_score: number;
  max_score: number;
  capabilities: string[];
}

interface TrustFactor {
  factor_id: string;
  name: string;
  weight: number;
  description: string;
}

interface Penalty {
  penalty_id: string;
  name: string;
  severity: string;
  score_impact: number;
  duration_days: number;
}

const TrustDashboard: React.FC = () => {
  const [tiers, setTiers] = useState<TrustTier[]>([]);
  const [factors, setFactors] = useState<TrustFactor[]>([]);
  const [decay, setDecay] = useState<Record<string, unknown> | null>(null);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiersRes, factorsRes, decayRes, penaltiesRes] = await Promise.all([
          getTrustTiers(),
          getTrustFactors(),
          getReputationDecay(),
          getPenalties(),
        ]);
        setTiers(tiersRes.tiers || []);
        setFactors(factorsRes.factors || []);
        setDecay(decayRes.decay as unknown as Record<string, unknown> || null);
        setPenalties(penaltiesRes.penalties || []);
      } catch (err) {
        console.error('Failed to load trust data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Loading trust data...</div>;

  return (
    <div className={styles.dashboardContainer}>
      {/* Trust Tiers */}
      <section className={styles.section}>
        <h2>Trust Tiers (T0-T4)</h2>
        <div className={styles.tiersGrid}>
          {tiers.map((tier) => (
            <div key={tier.tier} className={`${styles.tierCard} ${styles[`tier-${tier.tier}`]}`}>
              <div className={styles.tierHeader}>
                <TrustBadge tier={tier.tier as any} size="lg" />
                <span className={styles.tierRange}>
                  {(tier.min_score * 100).toFixed(0)}% - {(tier.max_score * 100).toFixed(0)}%
                </span>
              </div>
              <h3>{tier.name}</h3>
              <p className={styles.tierDescription}>{tier.description}</p>
              <div className={styles.tierCapabilities}>
                <h4>Capabilities:</h4>
                <ul>
                  {tier.capabilities?.map((cap, idx) => (
                    <li key={idx}>{cap}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Factors */}
      <section className={styles.section}>
        <h2>Trust Factors</h2>
        <div className={styles.factorsGrid}>
          {factors.map((factor) => (
            <div key={factor.factor_id} className={styles.factorCard}>
              <div className={styles.factorHeader}>
                <h3>{factor.name}</h3>
                <span className={styles.factorWeight}>Weight: {(factor.weight * 100).toFixed(0)}%</span>
              </div>
              <p>{factor.description}</p>
              <div className={styles.weightBar}>
                <div 
                  className={styles.weightFill} 
                  style={{ width: `${factor.weight * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Decay Configuration */}
      <section className={styles.section}>
        <h2>Reputation Decay</h2>
        <div className={styles.decayGrid}>
          <div className={styles.decayCard}>
            <span className={styles.decayValue}>{(decay as any)?.base_rate || 0.01}</span>
            <span className={styles.decayLabel}>Base Rate</span>
          </div>
          <div className={styles.decayCard}>
            <span className={styles.decayValue}>{(decay as any)?.half_life_days || 30}</span>
            <span className={styles.decayLabel}>Half-Life (days)</span>
          </div>
          <div className={styles.decayCard}>
            <span className={styles.decayValue}>{(decay as any)?.min_score || 0.0}</span>
            <span className={styles.decayLabel}>Min Score</span>
          </div>
        </div>
      </section>

      {/* Penalties */}
      <section className={styles.section}>
        <h2>Penalty System</h2>
        <div className={styles.penaltiesGrid}>
          {penalties.map((penalty) => (
            <div key={penalty.penalty_id} className={`${styles.penaltyCard} ${styles[`severity-${penalty.severity}`]}`}>
              <div className={styles.penaltyHeader}>
                <h3>{penalty.name}</h3>
                <span className={styles.severityBadge}>{penalty.severity}</span>
              </div>
              <div className={styles.penaltyDetails}>
                <span>Impact: -{(penalty.score_impact * 100).toFixed(0)}%</span>
                <span>Duration: {penalty.duration_days} days</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TrustDashboard;
