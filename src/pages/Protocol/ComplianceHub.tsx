/**
 * Compliance Hub Page
 * Displays regulatory frameworks, sector compliance, legal structures, and risk controls
 */

import React, { useState, useEffect } from 'react';
import { 
  getComplianceFrameworks, 
  getComplianceSectors, 
  getLegalStructures,
  getRiskControls 
} from '@/api/dsidProtocol';
import { ComplianceTag } from '@/components/DSIDP';
import styles from './ProtocolPages.module.css';

interface ComplianceFramework {
  framework_id: string;
  name: string;
  jurisdiction: string;
  requirements: string[];
  dsidp_alignment: string;
}

interface SectorCompliance {
  sector: string;
  frameworks: string[];
  special_requirements: string[];
}

interface LegalStructure {
  structure_id: string;
  name: string;
  description: string;
  binding_type: string;
}

interface RiskControl {
  control_id: string;
  name: string;
  description: string;
  implementation: string;
}

const ComplianceHub: React.FC = () => {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [sectors, setSectors] = useState<SectorCompliance[]>([]);
  const [structures, setStructures] = useState<LegalStructure[]>([]);
  const [controls, setControls] = useState<RiskControl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [frameworksRes, sectorsRes, structuresRes, controlsRes] = await Promise.all([
          getComplianceFrameworks(),
          getComplianceSectors(),
          getLegalStructures(),
          getRiskControls(),
        ]);
        setFrameworks(frameworksRes.frameworks || []);
        setSectors(sectorsRes.sectors || []);
        setStructures(structuresRes.structures || []);
        setControls(controlsRes.controls || []);
      } catch (err) {
        console.error('Failed to load compliance data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Loading compliance data...</div>;

  return (
    <div className={styles.dashboardContainer}>
      {/* Compliance Overview */}
      <section className={styles.section}>
        <h2>Active Compliance Frameworks</h2>
        <div className={styles.frameworkTags}>
          <ComplianceTag framework="GDPR" status="compliant" size="lg" />
          <ComplianceTag framework="HIPAA" status="compliant" size="lg" />
          <ComplianceTag framework="EU_AI_ACT" status="compliant" size="lg" />
          <ComplianceTag framework="ISO_42001" status="compliant" size="lg" />
          <ComplianceTag framework="NIST_AI_RMF" status="compliant" size="lg" />
          <ComplianceTag framework="CCPA" status="compliant" size="lg" />
        </div>
      </section>

      {/* Regulatory Frameworks */}
      <section className={styles.section}>
        <h2>Regulatory Frameworks ({frameworks.length})</h2>
        <div className={styles.frameworksGrid}>
          {frameworks.map((fw) => (
            <div key={fw.framework_id} className={styles.frameworkCard}>
              <div className={styles.frameworkHeader}>
                <h3>{fw.name}</h3>
                <span className={styles.jurisdiction}>{fw.jurisdiction}</span>
              </div>
              <p className={styles.alignment}>{fw.dsidp_alignment}</p>
              <div className={styles.requirements}>
                <h4>Key Requirements:</h4>
                <ul>
                  {fw.requirements?.slice(0, 4).map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sector Compliance */}
      <section className={styles.section}>
        <h2>Sector Compliance ({sectors.length})</h2>
        <div className={styles.sectorsGrid}>
          {sectors.map((sector) => (
            <div key={sector.sector} className={styles.sectorCard}>
              <h3>{sector.sector}</h3>
              <div className={styles.sectorFrameworks}>
                {sector.frameworks?.map((fw, idx) => (
                  <span key={idx} className={styles.sectorFrameworkTag}>{fw}</span>
                ))}
              </div>
              <div className={styles.specialReqs}>
                <h4>Special Requirements:</h4>
                <ul>
                  {sector.special_requirements?.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Legal Structures */}
      <section className={styles.section}>
        <h2>Legal Structures ({structures.length})</h2>
        <div className={styles.structuresGrid}>
          {structures.map((structure) => (
            <div key={structure.structure_id} className={styles.structureCard}>
              <h3>{structure.name}</h3>
              <span className={styles.bindingType}>{structure.binding_type}</span>
              <p>{structure.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Risk Controls */}
      <section className={styles.section}>
        <h2>Embedded Risk Controls ({controls.length})</h2>
        <div className={styles.controlsGrid}>
          {controls.map((control) => (
            <div key={control.control_id} className={styles.controlCard}>
              <h3>{control.name}</h3>
              <p>{control.description}</p>
              <div className={styles.implementation}>
                <strong>Implementation:</strong> {control.implementation}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ComplianceHub;
