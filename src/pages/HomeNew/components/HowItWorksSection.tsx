/**
 * How the System Operates Section
 * 
 * Enterprise-grade explanation of the governed execution pipeline.
 * NOT a tutorial or demo - this is operational documentation.
 * 
 * Placement: Homepage → "How It Works" (high-level, non-interactive)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import titleStyles from '@/components/ui/Title.module.css';
import styles from '../HomeNew.module.css';

// SVG Icons for each step
const IdentityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <path d="M12 11v4"/>
        <path d="M9 18h6"/>
    </svg>
);

const SemanticIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16v16H4z"/>
        <path d="M4 9h16"/>
        <path d="M9 4v16"/>
        <path d="M14 12h4"/>
        <path d="M14 16h4"/>
    </svg>
);

const GovernanceIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
    </svg>
);

const TrustIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
);

const LedgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
    </svg>
);

const pipelineSteps = [
    {
        number: '01',
        title: 'Identity Binding',
        description: 'Every user and agent operates under a cryptographic identity (DSID). No anonymous execution exists.',
        icon: IdentityIcon,
        detail: 'Persistent, verifiable, non-transferable',
    },
    {
        number: '02',
        title: 'Semantic Classification',
        description: 'Each request is classified into a regulated semantic domain (e.g. finance, healthcare, legal, engineering).',
        icon: SemanticIcon,
        detail: 'Domain-aware policy routing',
    },
    {
        number: '03',
        title: 'Governance Evaluation',
        description: 'Policies are evaluated before execution — not after. Actions can be approved, flagged, or blocked.',
        icon: GovernanceIcon,
        detail: 'Pre-execution enforcement',
    },
    {
        number: '04',
        title: 'Trust & Permission Check',
        description: 'Agent capability depends on its earned trust tier. Autonomy is gradual, measurable, and revocable.',
        icon: TrustIcon,
        detail: 'T0 → T4 progression',
    },
    {
        number: '05',
        title: 'Immutable Recording',
        description: 'The outcome is written to an execution ledger — including who acted, under which rules, and with what result.',
        icon: LedgerIcon,
        detail: 'Deterministic, auditable, reproducible',
    },
];

export const HowItWorksSection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section id="how-it-works" className={styles.interfacesSection}>
            <div className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionBadge}>How the System Operates</p>
                    <h2 className={titleStyles.sectionTitle}>From Request to Governed Execution</h2>
                    <p className={styles.sectionDescription}>
                        Resonant Genesis is not a chat interface and not a traditional blockchain.
                        It is a governed execution system for AI agents.
                    </p>
                </div>

                {/* Grid - same layout as InterfacesSection */}
                <div className={styles.interfacesGrid}>
                    {pipelineSteps.slice(0, 4).map((step) => (
                        <div key={step.number} className={styles.interfaceCard}>
                            <div className={styles.differentiatorIcon}>
                                <step.icon />
                            </div>
                            <h3 className={titleStyles.differentiatorTitle}>{step.title}</h3>
                            <p className={styles.differentiatorDescription}>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
