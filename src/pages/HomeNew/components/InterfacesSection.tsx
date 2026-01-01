import React from 'react';
import { useNavigate } from 'react-router-dom';
import titleStyles from '@/components/ui/Title.module.css';
import styles from '../HomeNew.module.css';

// SVG Icon Components
const ChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const CodeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
    </svg>
);

const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    </svg>
);

const StoreIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
        <path d="M3 9l2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.79 1.1L21 9" />
    </svg>
);

export const InterfacesSection = () => {
    const navigate = useNavigate();

    return (
        <section id="interfaces" className={styles.interfacesSection}>
            <div className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionBadge}>One System, Multiple Entry Points</p>
                    <h2 className={titleStyles.sectionTitle}>Interfaces Built on Governance</h2>
                    <p className={styles.sectionDescription}>
                        All interfaces operate under the same Control Plane, trust system, and audit ledger.
                    </p>
                </div>

                <div className={styles.interfacesGrid}>
                    {/* Chat */}
                    <div className={styles.interfaceCard} onClick={() => navigate('/resonant-chat')}>
                        <div className={styles.differentiatorIcon}>
                            <ChatIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Chat</h3>
                        <div className={styles.differentiatorBadge}>Governed Agent Actions</div>
                        <p className={styles.differentiatorDescription}>
                            Interface to trigger governed agent actions. <strong>Not a free-form chatbot.</strong> Every action evaluated, logged, and auditable.
                        </p>
                    </div>

                    {/* IDE */}
                    <div className={styles.interfaceCard} onClick={() => navigate('/ide')}>
                        <div className={styles.differentiatorIcon}>
                            <CodeIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>IDE</h3>
                        <div className={styles.differentiatorBadge}>Governed Execution</div>
                        <p className={styles.differentiatorDescription}>
                            Agent-driven software execution environment. <strong>Every action governed and logged.</strong> Full traceability of code changes.
                        </p>
                    </div>

                    {/* Marketplace */}
                    <div className={styles.interfaceCard} onClick={() => navigate('/marketplace')}>
                        <div className={styles.differentiatorIcon}>
                            <StoreIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Marketplace</h3>
                        <div className={styles.differentiatorBadge}>Dual-Layer Isolation</div>
                        <p className={styles.differentiatorDescription}>
                            Agents, workflows, and policies. Dual-layer isolation (execution + governance). <strong>All transactions cryptographically signed and auditable.</strong>
                        </p>
                    </div>

                    {/* Agents */}
                    <div className={styles.interfaceCard} onClick={() => navigate('/agents')}>
                        <div className={styles.differentiatorIcon}>
                            <UsersIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Agents & Teams</h3>
                        <div className={styles.differentiatorBadge}>Persistent DSID</div>
                        <p className={styles.differentiatorDescription}>
                            Persistent cryptographic identities. Trust tier progression (T0→T4). Coordinated multi-agent workflows with full lineage.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
