import React from 'react';
import titleStyles from '@/components/ui/Title.module.css';
import styles from '../HomeNew.module.css';

// SVG Icon Components
const MemoryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 13a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6z"/>
        <path d="M12 6v4"/>
    </svg>
);

const RouterIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="14" width="20" height="7" rx="2"/>
        <path d="M6 18h.01M10 18h.01"/>
        <path d="M12 3v5"/>
        <path d="M6 8l6-5 6 5"/>
    </svg>
);

const PolicyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
    </svg>
);

const GraphIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3"/>
        <circle cx="18" cy="6" r="3"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="18" r="3"/>
        <path d="M6 9v6M18 9v6M9 6h6M9 18h6"/>
    </svg>
);

const ApiIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17l6-6-6-6"/>
        <path d="M12 19h8"/>
    </svg>
);

const VerifyIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
);

export const ArchitectureSection = () => {
    return (
        <section id="architecture" className={styles.architecture}>
            <div className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionBadge}>Platform Architecture</p>
                    <h2 className={titleStyles.sectionTitle}>Built for Enterprise Scale</h2>
                    <p className={styles.sectionDescription}>
                        This platform is built for operators, enterprises, and regulators—not hobby usage.
                    </p>
                </div>
                <div className={styles.architectureGrid}>
                    <div className={styles.architectureViz}>
                        <div className={styles.differentiatorIcon}>
                            <MemoryIcon />
                        </div>
                        <h3 className={titleStyles.architectureTitle}>Intelligent Memory Core</h3>
                        <p className={styles.architectureDescription}>
                            Persistent, semantic, governed context—not chat history. Context survives models and sessions.
                        </p>
                    </div>
                    <div className={styles.architectureViz}>
                        <div className={styles.differentiatorIcon}>
                            <RouterIcon />
                        </div>
                        <h3 className={titleStyles.architectureTitle}>Multi-Provider AI Router</h3>
                        <p className={styles.architectureDescription}>
                            Automatic routing with consistency enforcement. No vendor lock-in across GPT, Claude, Gemini, Mistral, Groq.
                        </p>
                    </div>
                    <div className={styles.architectureViz}>
                        <div className={styles.differentiatorIcon}>
                            <PolicyIcon />
                        </div>
                        <h3 className={titleStyles.architectureTitle}>Policy & Compliance Engine</h3>
                        <p className={styles.architectureDescription}>
                            Real-time rule evaluation, not post-hoc review. Governance happens before execution.
                        </p>
                    </div>
                    <div className={styles.architectureViz}>
                        <div className={styles.differentiatorIcon}>
                            <GraphIcon />
                        </div>
                        <h3 className={titleStyles.architectureTitle}>Evidence Graph Engine</h3>
                        <p className={styles.architectureDescription}>
                            Every decision forms a verifiable causal chain. Full traceability of agent reasoning.
                        </p>
                    </div>
                    <div className={styles.architectureViz}>
                        <div className={styles.differentiatorIcon}>
                            <ApiIcon />
                        </div>
                        <h3 className={titleStyles.architectureTitle}>REST API Gateway</h3>
                        <p className={styles.architectureDescription}>
                            Production-ready APIs with authentication, rate limiting, and audit hooks. 150+ endpoints.
                        </p>
                    </div>
                    <div className={styles.architectureViz}>
                        <div className={styles.differentiatorIcon}>
                            <VerifyIcon />
                        </div>
                        <h3 className={titleStyles.architectureTitle}>Advanced Verification</h3>
                        <p className={styles.architectureDescription}>
                            Immutable execution proofs. Tamper-proof audit trails for compliance and security.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};
