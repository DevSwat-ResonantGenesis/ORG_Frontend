import React from 'react';
import titleStyles from '@/components/ui/Title.module.css';
import {
    AnimatedChainIcon,
    AnimatedHashSphereIcon,
    AnimatedSyncIcon,
    AnimatedChartIcon
} from '@/components/Icons/ServiceIcons';
import styles from '../HomeNew.module.css';

export const DifferentiatorsSection = () => {
    return (
        <section id="differentiators" className={styles.differentiators}>
            <div className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionBadge}>Why DevSwat</p>
                    <h2 className={titleStyles.sectionTitle}>Built Different. Built for Production.</h2>
                    <p className={styles.sectionDescription}>
                        The only AI platform where autonomy and accountability aren't tradeoffs.
                    </p>
                </div>
                <div className={styles.differentiatorsGrid}>
                    <div className={styles.differentiatorCard}>
                        <div className={styles.differentiatorIcon}>
                            <AnimatedChainIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Blockchain-Grade Proof</h3>
                        <p className={styles.differentiatorDescription}>
                            Every agent action gets a cryptographic receipt. Tamper-proof evidence for audits, disputes, and compliance.
                        </p>
                        <div className={styles.differentiatorBadge}>Tamper-Proof</div>
                    </div>
                    <div className={styles.differentiatorCard}>
                        <div className={styles.differentiatorIcon}>
                            <AnimatedHashSphereIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>AI That Remembers</h3>
                        <p className={styles.differentiatorDescription}>
                            Your AI retains context across conversations, sessions, and even different models. No more starting from scratch.
                        </p>
                        <div className={styles.differentiatorBadge}>Persistent Memory</div>
                    </div>
                    <div className={styles.differentiatorCard}>
                        <div className={styles.differentiatorIcon}>
                            <AnimatedSyncIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Any AI, One Platform</h3>
                        <p className={styles.differentiatorDescription}>
                            Switch between GPT-4, Claude, Gemini instantly. Same interface, same governance, no lock-in.
                        </p>
                        <div className={styles.differentiatorBadge}>Multi-Provider</div>
                    </div>
                    <div className={styles.differentiatorCard}>
                        <div className={styles.differentiatorIcon}>
                            <AnimatedChartIcon />
                        </div>
                        <h3 className={titleStyles.differentiatorTitle}>Enterprise from Day One</h3>
                        <p className={styles.differentiatorDescription}>
                            150+ APIs, SOC2-ready architecture, and infrastructure designed to scale. Not a demo.
                        </p>
                        <div className={styles.differentiatorBadge}>Production Ready</div>
                    </div>
                </div>

                {/* Final Positioning Statement */}
                <div className={styles.positioningStatement}>
                    <p>
                        Other platforms give you AI chat. We give you <strong>AI that works autonomously</strong> —
                        <br />
                        with the governance, memory, and audit trails to <em>use it in production</em>.
                    </p>
                </div>
            </div>
        </section>
    );
};
