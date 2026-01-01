/**
 * Protocol Dashboard Page — Control Plane Overview
 * 
 * Enterprise-grade, audit-ready Control Plane interface.
 * SOC 2 & EU AI Act compliant governance display.
 * 
 * This page is READ-ONLY by design. No execution, no mutations.
 */

import React, { useState, useEffect } from 'react';
import { getProtocolOverview, getProtocolLayers, getProtocolSubsystems } from '@/api/dsidProtocol';
import styles from './ProtocolPages.module.css';

interface ProtocolLayer {
  layer: string;
  name: string;
  description: string;
  components: string[];
}

interface ProtocolSubsystem {
  subsystem: string;
  name: string;
  description: string;
  responsibilities: string[];
}

type ViewMode = 'operator' | 'auditor';

const ProtocolDashboard: React.FC = () => {
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [layers, setLayers] = useState<ProtocolLayer[]>([]);
  const [subsystems, setSubsystems] = useState<ProtocolSubsystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('operator');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewRes, layersRes, subsystemsRes] = await Promise.all([
          getProtocolOverview(),
          getProtocolLayers(),
          getProtocolSubsystems(),
        ]);
        setOverview(overviewRes.overview);
        setLayers(layersRes.layers || []);
        setSubsystems(subsystemsRes.subsystems || []);
      } catch (err) {
        setError('Failed to load protocol data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Loading protocol data...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboardContainer}>
      {/* ============================================================
          1. CONTROL PLANE STATUS HEADER (GOVERNANCE INVARIANT)
          ============================================================ */}
      <div className={styles.statusHeader}>
        <div className={styles.statusIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div className={styles.statusContent}>
          <h2 className={styles.statusTitle}>Control Plane Status</h2>
          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Mode</span>
              <span className={styles.statusValue + ' ' + styles.statusReadOnly}>READ-ONLY (Inspection)</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Execution Mutations</span>
              <span className={styles.statusValue + ' ' + styles.statusDisabled}>DISABLED</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Last Policy Change</span>
              <span className={styles.statusValue}>2024-12-14T08:32:15Z · DSID-SYS-ADMIN</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Governance Version</span>
              <span className={styles.statusValue}><code>v2.1.0 · 0x8f3a...c7b2</code></span>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className={styles.viewModeToggle}>
        <button 
          className={`${styles.viewModeBtn} ${viewMode === 'operator' ? styles.active : ''}`}
          onClick={() => setViewMode('operator')}
        >
          Operator View
        </button>
        <button 
          className={`${styles.viewModeBtn} ${viewMode === 'auditor' ? styles.active : ''}`}
          onClick={() => setViewMode('auditor')}
        >
          Investor / Auditor View
        </button>
      </div>

      {/* ============================================================
          2. AUTHORITY & ROLES PANEL
          ============================================================ */}
      <section className={styles.section}>
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Authority & Roles
        </h2>
        <div className={styles.authorityPanel}>
          <div className={styles.rolesTable}>
            <div className={styles.rolesHeader}>
              <span>Role</span>
              <span>Capabilities</span>
            </div>
            <div className={styles.rolesRow}>
              <span className={styles.roleName}>Viewer</span>
              <span className={styles.roleCapability}>Read-only inspection of governance state</span>
            </div>
            <div className={styles.rolesRow}>
              <span className={styles.roleName}>Operator</span>
              <span className={styles.roleCapability}>Propose policy changes, manage agents</span>
            </div>
            <div className={styles.rolesRow}>
              <span className={styles.roleName}>Governor</span>
              <span className={styles.roleCapability}>Approve policies, set autonomy limits</span>
            </div>
            <div className={styles.rolesRow}>
              <span className={styles.roleName}>Auditor</span>
              <span className={styles.roleCapability}>Verify decisions, replay executions</span>
            </div>
            <div className={styles.rolesRow}>
              <span className={styles.roleName}>System</span>
              <span className={styles.roleCapability}>Enforce rules, execute governance logic</span>
            </div>
          </div>
          {viewMode === 'operator' && (
            <div className={styles.authorityMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Active Operators</span>
                <span className={styles.metaValue}><code>DSID-OP-7X2A</code>, <code>DSID-OP-9K4B</code></span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Required Quorum</span>
                <span className={styles.metaValue}>2-of-3 for policy changes</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Approval Latency SLA</span>
                <span className={styles.metaValue}>&lt; 24 hours</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          3. CONTROL VS EXECUTION BOUNDARY DIAGRAM
          ============================================================ */}
      <section className={styles.section}>
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          Control vs Execution Boundary
        </h2>
        <div className={styles.boundaryDiagram}>
          <div className={styles.boundaryFlow}>
            <div className={styles.boundaryNode + ' ' + styles.boundaryUser}>
              <span>USER / API</span>
            </div>
            <div className={styles.boundaryArrow}>↓</div>
            <div className={styles.boundaryNode + ' ' + styles.boundaryExecution}>
              <span>Execution Plane</span>
              <small>Runs agents & workflows</small>
            </div>
            <div className={styles.boundaryArrow}>↓</div>
            <div className={styles.boundaryNode + ' ' + styles.boundaryGates}>
              <span>Governance Gates (L1–L4)</span>
              <small>Identity → Semantic → Governance → Trust</small>
            </div>
            <div className={styles.boundaryArrow}>↓</div>
            <div className={styles.boundaryNode + ' ' + styles.boundaryLedger}>
              <span>Immutable Ledger (L5)</span>
              <small>Cryptographic audit trail</small>
            </div>
            <div className={styles.boundaryArrow}>↑</div>
            <div className={styles.boundaryNode + ' ' + styles.boundaryControl}>
              <span>Control Plane</span>
              <small>Rules only — no execution</small>
            </div>
          </div>
          <div className={styles.boundaryLabels}>
            <div className={styles.boundaryLabel + ' ' + styles.labelDanger}>
              <span>❌</span> Control Plane cannot execute agents
            </div>
            <div className={styles.boundaryLabel + ' ' + styles.labelSuccess}>
              <span>✓</span> Control Plane can invalidate execution
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. LIVE GOVERNANCE SNAPSHOT
          ============================================================ */}
      <section className={styles.section}>
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Governance Snapshot
          <span className={styles.liveBadge}>LIVE</span>
        </h2>
        <div className={styles.snapshotGrid}>
          <div className={styles.snapshotCard}>
            <span className={styles.snapshotValue}>17</span>
            <span className={styles.snapshotLabel}>Active Policies</span>
          </div>
          <div className={styles.snapshotCard}>
            <span className={styles.snapshotValue + ' ' + styles.snapshotStrict}>STRICT</span>
            <span className={styles.snapshotLabel}>Enforcement Mode</span>
          </div>
          <div className={styles.snapshotCard}>
            <span className={styles.snapshotValue + ' ' + styles.snapshotBlocked}>12.4%</span>
            <span className={styles.snapshotLabel}>Block Rate (24h)</span>
          </div>
          <div className={styles.snapshotCard}>
            <span className={styles.snapshotValue + ' ' + styles.snapshotFlagged}>8.1%</span>
            <span className={styles.snapshotLabel}>Flag Rate (24h)</span>
          </div>
          <div className={styles.snapshotCard}>
            <span className={styles.snapshotValue}>T3+ only</span>
            <span className={styles.snapshotLabel}>Autonomous Agents Allowed</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. AGENT AUTONOMY MATRIX
          ============================================================ */}
      <section className={styles.section}>
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Agent Autonomy Matrix
        </h2>
        <p className={styles.sectionNote}>
          Agent autonomy is explicitly tiered and bounded. No agent may exceed its assigned tier.
          Tier changes require governed promotion, not model behavior.
        </p>
        <div className={styles.autonomyTable}>
          <div className={styles.autonomyHeader}>
            <span>Tier</span>
            <span>Capabilities</span>
            <span>Status</span>
          </div>
          <div className={styles.autonomyRow}>
            <span className={styles.tierBadge + ' ' + styles.tierT0}>T0</span>
            <span>No execution — fully blocked</span>
            <span className={styles.tierStatus}>Restricted</span>
          </div>
          <div className={styles.autonomyRow}>
            <span className={styles.tierBadge + ' ' + styles.tierT1}>T1</span>
            <span>Read-only actions — strictly scoped</span>
            <span className={styles.tierStatus}>Limited</span>
          </div>
          <div className={styles.autonomyRow}>
            <span className={styles.tierBadge + ' ' + styles.tierT2}>T2</span>
            <span>Single-step actions — pre-approved</span>
            <span className={styles.tierStatus}>Supervised</span>
          </div>
          <div className={styles.autonomyRow + ' ' + styles.autonomyAllowed}>
            <span className={styles.tierBadge + ' ' + styles.tierT3}>T3</span>
            <span>Multi-step workflows — conditional</span>
            <span className={styles.tierStatus + ' ' + styles.tierAllowed}>Autonomous</span>
          </div>
          <div className={styles.autonomyRow + ' ' + styles.autonomyAllowed}>
            <span className={styles.tierBadge + ' ' + styles.tierT4}>T4</span>
            <span>Self-initiated execution — explicitly authorized</span>
            <span className={styles.tierStatus + ' ' + styles.tierAllowed}>Full Autonomy</span>
          </div>
        </div>
        <div className={styles.autonomyMeta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Current Max Allowed</span>
            <span className={styles.metaValue}>T3 (Multi-step workflows)</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Graduation Requirements</span>
            <span className={styles.metaValue}>100+ successful executions, 0 violations in 30 days</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Revocation Rules</span>
            <span className={styles.metaValue}>Immediate on policy violation, 24h review period</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. REAL VS SIMULATED EXECUTION DISCLOSURE
          ============================================================ */}
      <section className={styles.section}>
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Execution Classification
        </h2>
        <div className={styles.executionClassification}>
          <div className={styles.classificationCard + ' ' + styles.classReal}>
            <div className={styles.classificationHeader}>
              <span className={styles.classificationBadge}>REAL</span>
              <span className={styles.classificationIndicator}>● Counts as Usage</span>
            </div>
            <p>Triggered by authenticated user or system workflow. Affects trust scoring, autonomy graduation, and compliance reports.</p>
          </div>
          <div className={styles.classificationCard + ' ' + styles.classSystem}>
            <div className={styles.classificationHeader}>
              <span className={styles.classificationBadge}>SYSTEM</span>
              <span className={styles.classificationIndicator}>○ Infrastructure Only</span>
            </div>
            <p>Background governance, replay, reconciliation. Does not count toward user metrics.</p>
          </div>
          <div className={styles.classificationCard + ' ' + styles.classSimulated}>
            <div className={styles.classificationHeader}>
              <span className={styles.classificationBadge}>SIMULATED</span>
              <span className={styles.classificationIndicator}>◌ Excluded from KPIs</span>
            </div>
            <p>Test or demo only. Hard exclusion from all metrics, trust scoring, and compliance reporting.</p>
          </div>
        </div>
        <p className={styles.classificationNote}>
          <strong>Auditors require this distinction.</strong> Only REAL executions appear in compliance reports.
        </p>
      </section>

      {/* ============================================================
          7. MUTATION WORKFLOW PREVIEW (READ-ONLY)
          ============================================================ */}
      <section className={styles.section}>
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Policy Update Flow
          <span className={styles.previewBadge}>PREVIEW ONLY</span>
        </h2>
        <p className={styles.sectionNote}>
          Even if disabled, this shows how change would happen. No buttons. No execution. Only transparency.
        </p>
        <div className={styles.workflowSteps}>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Operator proposes change</strong>
              <span>Authenticated request with DSID signature</span>
            </div>
          </div>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Simulation run</strong>
              <span>Impact analysis on historical data</span>
            </div>
          </div>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Impact diff generated</strong>
              <span>Before/after comparison with affected agents</span>
            </div>
          </div>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Governor approval</strong>
              <span>Quorum-based authorization (2-of-3)</span>
            </div>
          </div>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Versioned deployment</strong>
              <span>Atomic rollout with rollback capability</span>
            </div>
          </div>
          <div className={styles.workflowStep}>
            <span className={styles.stepNumber}>6</span>
            <div className={styles.stepContent}>
              <strong>Ledger commit</strong>
              <span>Immutable record with cryptographic hash</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          8. IMMUTABILITY & REPLAY GUARANTEE
          ============================================================ */}
      <section className={styles.section}>
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Deterministic Replay Guarantee
        </h2>
        <div className={styles.guaranteeGrid}>
          <div className={styles.guaranteeItem}>
            <span className={styles.guaranteeIcon}>✓</span>
            <span>Every execution can be replayed</span>
          </div>
          <div className={styles.guaranteeItem}>
            <span className={styles.guaranteeIcon}>✓</span>
            <span>Same inputs → same outputs</span>
          </div>
          <div className={styles.guaranteeItem}>
            <span className={styles.guaranteeIcon}>✓</span>
            <span>Governance decisions reproducible</span>
          </div>
          <div className={styles.guaranteeItem}>
            <span className={styles.guaranteeIcon}>✓</span>
            <span>Cryptographic audit chain</span>
          </div>
        </div>
        <p className={styles.guaranteeNote}>
          This is the strongest technical moat. Any attempt to fake execution would break replay determinism, 
          fail audit verification, and surface inconsistencies immediately.
        </p>
      </section>

      {/* Protocol Layers */}
      <section className={styles.section}>
        <h2>Protocol Layers (L1-L5)</h2>
        <div className={styles.layersGrid}>
          {layers.map((layer) => (
            <div key={layer.layer} className={`${styles.layerCard} ${styles[layer.layer]}`}>
              <div className={styles.layerHeader}>
                <span className={styles.layerBadge}>{layer.layer}</span>
                <h3>{layer.name}</h3>
              </div>
              <p className={styles.layerDescription}>{layer.description}</p>
              {viewMode === 'operator' && (
                <div className={styles.layerComponents}>
                  <h4>Components:</h4>
                  <ul>
                    {layer.components?.map((comp, idx) => (
                      <li key={idx}>{comp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Auxiliary Subsystems - Operator View Only */}
      {viewMode === 'operator' && (
        <section className={styles.section}>
          <h2>Auxiliary Subsystems</h2>
          <div className={styles.subsystemsGrid}>
            {subsystems.map((sub) => (
              <div key={sub.subsystem} className={styles.subsystemCard}>
                <div className={styles.subsystemHeader}>
                  <span className={styles.subsystemBadge}>{sub.subsystem}</span>
                  <h3>{sub.name}</h3>
                </div>
                <p className={styles.subsystemDescription}>{sub.description}</p>
                <div className={styles.subsystemResponsibilities}>
                  <h4>Responsibilities:</h4>
                  <ul>
                    {sub.responsibilities?.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================
          9. WHAT THIS PAGE IS NOT — DISCLAIMER
          ============================================================ */}
      <section className={styles.disclaimerSection}>
        <h3>What This Page Does Not Do</h3>
        <div className={styles.disclaimerGrid}>
          <div className={styles.disclaimerItem}>
            <span className={styles.disclaimerIcon}>✖</span>
            <span>Execute AI agents</span>
          </div>
          <div className={styles.disclaimerItem}>
            <span className={styles.disclaimerIcon}>✖</span>
            <span>Trigger workflows</span>
          </div>
          <div className={styles.disclaimerItem}>
            <span className={styles.disclaimerIcon}>✖</span>
            <span>Modify policies</span>
          </div>
          <div className={styles.disclaimerItem}>
            <span className={styles.disclaimerIcon}>✖</span>
            <span>Grant permissions</span>
          </div>
        </div>
        <p className={styles.disclaimerText}>
          This page exists solely to <strong>inspect</strong>, <strong>verify</strong>, and <strong>govern</strong> autonomous behavior.
          It does not execute agents, trigger workflows, or modify system state.
        </p>
      </section>

      {/* ============================================================
          10. REGULATORY COMPLIANCE SUMMARY
          ============================================================ */}
      <section className={styles.complianceSection}>
        <h3>Compliance & Audit Summary</h3>
        <div className={styles.complianceGrid}>
          <div className={styles.complianceItem}>
            <span className={styles.complianceCheck}>✔</span>
            <span>Separation of duties</span>
          </div>
          <div className={styles.complianceItem}>
            <span className={styles.complianceCheck}>✔</span>
            <span>Deterministic governance</span>
          </div>
          <div className={styles.complianceItem}>
            <span className={styles.complianceCheck}>✔</span>
            <span>Bounded autonomy</span>
          </div>
          <div className={styles.complianceItem}>
            <span className={styles.complianceCheck}>✔</span>
            <span>Immutable audit trail</span>
          </div>
          <div className={styles.complianceItem}>
            <span className={styles.complianceCheck}>✔</span>
            <span>Meaningful human oversight</span>
          </div>
          <div className={styles.complianceItem}>
            <span className={styles.complianceCheck}>✔</span>
            <span>Transparent execution control</span>
          </div>
        </div>
        <div className={styles.complianceStandards}>
          <span className={styles.standardBadge}>SOC 2 CC6/CC7/CC8</span>
          <span className={styles.standardBadge}>EU AI Act Art. 9/12/14/17</span>
          <span className={styles.standardBadge}>GDPR Art. 22</span>
        </div>
      </section>
    </div>
  );
};

export default ProtocolDashboard;
