/**
 * Governance Center Page
 * Displays ethical principles, oversight bodies, and governance contracts
 */

import React, { useState, useEffect } from 'react';
import { 
  getEthicalPrinciples, 
  getOversightBodies, 
  getGovernanceContracts 
} from '@/api/dsidProtocol';
import { GovernanceStatus } from '@/components/DSIDP';
import styles from './ProtocolPages.module.css';

interface EthicalPrinciple {
  principle_id: string;
  name: string;
  description: string;
  enforcement: string;
}

interface OversightBody {
  body_id: string;
  name: string;
  role: string;
  authority: string[];
}

interface GovernanceContract {
  contract_type: string;
  description: string;
  fields: string[];
}

const GovernanceCenter: React.FC = () => {
  const [principles, setPrinciples] = useState<EthicalPrinciple[]>([]);
  const [bodies, setBodies] = useState<OversightBody[]>([]);
  const [contracts, setContracts] = useState<GovernanceContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [principlesRes, bodiesRes, contractsRes] = await Promise.all([
          getEthicalPrinciples(),
          getOversightBodies(),
          getGovernanceContracts(),
        ]);
        setPrinciples(principlesRes.principles || []);
        setBodies(bodiesRes.bodies || []);
        setContracts(contractsRes.contracts || []);
      } catch (err) {
        console.error('Failed to load governance data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Loading governance data...</div>;

  return (
    <div className={styles.dashboardContainer}>
      {/* System Status */}
      <section className={styles.section}>
        <h2>Governance Status</h2>
        <div className={styles.statusGrid}>
          <div className={styles.statusCard}>
            <GovernanceStatus status="passed" size="lg" />
            <span className={styles.statusLabel}>Policy Engine</span>
          </div>
          <div className={styles.statusCard}>
            <GovernanceStatus status="passed" size="lg" />
            <span className={styles.statusLabel}>Ethics Monitor</span>
          </div>
          <div className={styles.statusCard}>
            <GovernanceStatus status="passed" size="lg" />
            <span className={styles.statusLabel}>Oversight Active</span>
          </div>
        </div>
      </section>

      {/* Ethical Principles */}
      <section className={styles.section}>
        <h2>Ethical Principles ({principles.length})</h2>
        <div className={styles.principlesGrid}>
          {principles.map((principle, idx) => (
            <div key={principle.principle_id} className={styles.principleCard}>
              <div className={styles.principleNumber}>{idx + 1}</div>
              <div className={styles.principleContent}>
                <h3>{principle.name}</h3>
                <p>{principle.description}</p>
                <div className={styles.enforcement}>
                  <strong>Enforcement:</strong> {principle.enforcement}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Oversight Bodies */}
      <section className={styles.section}>
        <h2>Oversight Bodies ({bodies.length})</h2>
        <div className={styles.bodiesGrid}>
          {bodies.map((body) => (
            <div key={body.body_id} className={styles.bodyCard}>
              <h3>{body.name}</h3>
              <p className={styles.bodyRole}>{body.role}</p>
              <div className={styles.bodyAuthority}>
                <h4>Authority:</h4>
                <ul>
                  {body.authority?.map((auth, idx) => (
                    <li key={idx}>{auth}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Governance Contracts */}
      <section className={styles.section}>
        <h2>Governance Contracts</h2>
        <div className={styles.contractsGrid}>
          {contracts.map((contract) => (
            <div key={contract.contract_type} className={styles.contractCard}>
              <h3>{contract.contract_type}</h3>
              <p>{contract.description}</p>
              <div className={styles.contractFields}>
                <h4>Fields:</h4>
                <div className={styles.fieldsList}>
                  {contract.fields?.map((field, idx) => (
                    <span key={idx} className={styles.fieldTag}>{field}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GovernanceCenter;
