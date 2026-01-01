import React, { Suspense } from 'react';
import titleStyles from '@/components/ui/Title.module.css';
import styles from '../HomeNew.module.css';

// Lazy load the heavy Three.js component - NEW 3D version
const GovernanceFlow3D = React.lazy(() => import('./GovernanceFlow3D'));

// SVG Icon Components
const NetworkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="3"/>
        <circle cx="5" cy="19" r="3"/>
        <circle cx="19" cy="19" r="3"/>
        <path d="M12 8v4"/>
        <path d="M8.5 14.5L5.5 16.5"/>
        <path d="M15.5 14.5l3 2"/>
    </svg>
);

const BlocksIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
);

const LockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        <circle cx="12" cy="16" r="1"/>
    </svg>
);

export const BlockchainSection = () => {
    return (
        <section id="blockchain" className={styles.blockchainSection}>
            <div className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionBadge}>Dual-Layer Architecture</p>
                    <h2 className={titleStyles.sectionTitle}>Blockchain-Backed AI Control</h2>
                    <p className={styles.sectionDescription}>
                        Not a financial blockchain. An execution blockchain for governed AI behavior.
                    </p>
                </div>

                {/* Dual Layer Diagram */}
                <div className={styles.dualLayerDiagram}>
                    <div className={styles.layerCard}>
                        <div className={styles.differentiatorIcon}>
                            <NetworkIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Execution DAG</h3>
                        <div className={styles.differentiatorBadge}>Coordination Layer</div>
                        <p className={styles.differentiatorDescription}>
                            Records every AI action — who executed, what action, which domain, governance rules applied, pass/flag/block decisions. Optimized for high-frequency AI events.
                        </p>
                    </div>

                    <div className={styles.layerConnector}>
                        <div className={styles.connectorLine}></div>
                        <span className={styles.connectorLabel}>Anchors</span>
                        <div className={styles.connectorLine}></div>
                    </div>

                    <div className={styles.layerCard}>
                        <div className={styles.differentiatorIcon}>
                            <BlocksIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Registry Blockchain</h3>
                        <div className={styles.differentiatorBadge}>Settlement Layer</div>
                        <p className={styles.differentiatorDescription}>
                            Anchors execution events immutably — hashes of DAG segments, agent identity states, governance versions, trust tier transitions. Long-term integrity.
                        </p>
                    </div>
                </div>

                {/* 3D Governance Flow Visualization */}
                <div className={styles.comparisonSection}>
                    <h3 className={styles.comparisonTitle}>Governance Flow</h3>
                    <Suspense fallback={<div className={styles.governanceFlow3DContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>Loading 3D visualization...</div>}>
                        <GovernanceFlow3D />
                    </Suspense>
                </div>

                {/* Encryption Note */}
                <div className={styles.encryptionNote}>
                    <div className={styles.differentiatorIcon}>
                        <LockIcon />
                    </div>
                    <div className={styles.encryptionContent}>
                        <h3 className={titleStyles.differentiatorTitle}>Cryptographic Security</h3>
                        <p className={styles.differentiatorDescription}>Every entity has a DSID backed by public/private key pairs. All payloads are encrypted at rest, signed at execution, and hashed into the ledger.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
