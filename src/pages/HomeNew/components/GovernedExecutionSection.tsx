import React from 'react';
import { useNavigate } from 'react-router-dom';
import titleStyles from '@/components/ui/Title.module.css';
import styles from '../HomeNew.module.css';

// SVG Icon Components
const PlayIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
    </svg>
);

const ShieldCheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
    </svg>
);

const GavelIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2l6 6-1.5 1.5-6-6L14.5 2z"/>
        <path d="M9.5 7l6 6-1.5 1.5-6-6L9.5 7z"/>
        <path d="M4.5 12l6 6-1.5 1.5-6-6L4.5 12z"/>
        <path d="M3 21h18"/>
    </svg>
);

const DatabaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
);

export const GovernedExecutionSection = () => {
    const navigate = useNavigate();

    return (
        <section id="governed-execution" className={styles.interfacesSection}>
            <div className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionBadge}>How It Works</p>
                    <h2 className={titleStyles.sectionTitle}>From Request to Governed Execution</h2>
                    <p className={styles.sectionDescription}>
                        Every AI action passes through our governance layer before execution.
                    </p>
                </div>

                {/* Grid - same layout as InterfacesSection */}
                <div className={styles.interfacesGrid}>
                    <div className={styles.interfaceCard}>
                        <div className={styles.differentiatorIcon}>
                            <PlayIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Your Agent Works</h3>
                        <p className={styles.differentiatorDescription}>Your AI completes real tasks: research, code, analyze, communicate</p>
                    </div>
                    <div className={styles.interfaceCard}>
                        <div className={styles.differentiatorIcon}>
                            <ShieldCheckIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>We Check the Rules</h3>
                        <p className={styles.differentiatorDescription}>Instantly validated against your policies, compliance rules, and security requirements</p>
                    </div>
                    <div className={styles.interfaceCard}>
                        <div className={styles.differentiatorIcon}>
                            <GavelIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Action Approved or Blocked</h3>
                        <p className={styles.differentiatorDescription}>Safe actions run. Risky ones get flagged. Violations blocked automatically.</p>
                    </div>
                    <div className={styles.interfaceCard}>
                        <div className={styles.differentiatorIcon}>
                            <DatabaseIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Permanent Proof Created</h3>
                        <p className={styles.differentiatorDescription}>Blockchain-grade proof for auditors, regulators, and your peace of mind</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
