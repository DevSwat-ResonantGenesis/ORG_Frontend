/**
 * Security Monitor Page
 * Displays security layers, threats, controls, incident response, and hardening
 */

import React, { useState, useEffect } from 'react';
import { 
  getSecurityLayers, 
  getSecurityThreats, 
  getSecurityControls,
  getIncidentResponse,
  getHardeningDefaults 
} from '@/api/dsidProtocol';
import styles from './ProtocolPages.module.css';

interface SecurityLayer {
  layer: string;
  name: string;
  responsibility: string;
  controls: string[];
}

interface SecurityThreat {
  threat_id: string;
  name: string;
  category: string;
  severity: string;
  mitigations: string[];
}

interface SecurityControl {
  control_id: string;
  name: string;
  type: string;
  implementation: string;
}

interface IncidentStep {
  step: number;
  name: string;
  actions: string[];
}

interface HardeningDefault {
  setting: string;
  value: string;
  rationale: string;
}

const SecurityMonitor: React.FC = () => {
  const [layers, setLayers] = useState<SecurityLayer[]>([]);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [controls, setControls] = useState<SecurityControl[]>([]);
  const [incidentSteps, setIncidentSteps] = useState<IncidentStep[]>([]);
  const [hardening, setHardening] = useState<HardeningDefault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [layersRes, threatsRes, controlsRes, incidentRes, hardeningRes] = await Promise.all([
          getSecurityLayers(),
          getSecurityThreats(),
          getSecurityControls(),
          getIncidentResponse(),
          getHardeningDefaults(),
        ]);
        setLayers(layersRes.layers || []);
        setThreats(threatsRes.threats || []);
        setControls(controlsRes.controls || []);
        setIncidentSteps(incidentRes.procedure || []);
        setHardening(hardeningRes.defaults || []);
      } catch (err) {
        console.error('Failed to load security data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Loading security data...</div>;

  return (
    <div className={styles.dashboardContainer}>

      {/* Security Status */}
      <section className={styles.section}>
        <h2>Security Status</h2>
        <div className={styles.securityStatusGrid}>
          <div className={styles.statusCard}>
            <span className={styles.statusIndicator + ' ' + styles.active}>●</span>
            <span className={styles.statusLabel}>All Layers Active</span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusValue}>{threats.length}</span>
            <span className={styles.statusLabel}>Threats Cataloged</span>
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusValue}>{controls.length}</span>
            <span className={styles.statusLabel}>Controls Active</span>
          </div>
        </div>
      </section>

      {/* Security Layers */}
      <section className={styles.section}>
        <h2>Security Layers ({layers.length})</h2>
        <div className={styles.securityLayersGrid}>
          {layers.map((layer, idx) => (
            <div key={layer.layer} className={`${styles.securityLayerCard} ${styles[`layer-${idx + 1}`]}`}>
              <div className={styles.layerHeader}>
                <span className={styles.layerNumber}>L{idx + 1}</span>
                <h3>{layer.name}</h3>
              </div>
              <p className={styles.layerResponsibility}>{layer.responsibility}</p>
              <div className={styles.layerControls}>
                {layer.controls?.map((ctrl, i) => (
                  <span key={i} className={styles.controlTag}>{ctrl}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Threat Catalog */}
      <section className={styles.section}>
        <h2>Threat Catalog ({threats.length})</h2>
        <div className={styles.threatsGrid}>
          {threats.map((threat) => (
            <div key={threat.threat_id} className={`${styles.threatCard} ${styles[`severity-${threat.severity}`]}`}>
              <div className={styles.threatHeader}>
                <h3>{threat.name}</h3>
                <span className={styles.severityBadge}>{threat.severity}</span>
              </div>
              <span className={styles.threatCategory}>{threat.category}</span>
              <div className={styles.mitigations}>
                <h4>Mitigations:</h4>
                <ul>
                  {threat.mitigations?.map((mit, idx) => (
                    <li key={idx}>{mit}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security Controls */}
      <section className={styles.section}>
        <h2>Security Controls ({controls.length})</h2>
        <div className={styles.controlsGrid}>
          {controls.map((control) => (
            <div key={control.control_id} className={styles.securityControlCard}>
              <div className={styles.controlHeader}>
                <h3>{control.name}</h3>
                <span className={styles.controlType}>{control.type}</span>
              </div>
              <p>{control.implementation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Incident Response */}
      <section className={styles.section}>
        <h2>Incident Response Procedure</h2>
        <div className={styles.incidentSteps}>
          {incidentSteps.map((step) => (
            <div key={step.step} className={styles.incidentStep}>
              <div className={styles.stepNumber}>{step.step}</div>
              <div className={styles.stepContent}>
                <h3>{step.name}</h3>
                <ul>
                  {step.actions?.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hardening Defaults */}
      <section className={styles.section}>
        <h2>Hardening Defaults ({hardening.length})</h2>
        <div className={styles.hardeningGrid}>
          {hardening.map((h, idx) => (
            <div key={idx} className={styles.hardeningCard}>
              <div className={styles.hardeningHeader}>
                <span className={styles.hardeningSetting}>{h.setting}</span>
                <span className={styles.hardeningValue}>{h.value}</span>
              </div>
              <p className={styles.hardeningRationale}>{h.rationale}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SecurityMonitor;
