import React from 'react';
import titleStyles from '@/components/ui/Title.module.css';
import {
    MLOpsIcon,
    IntegrationIcon,
    ComplianceIcon,
    AnimatedSyncIcon
} from '@/components/Icons/ServiceIcons';
import styles from '../HomeNew.module.css';

export const UseCasesSection = () => {
    return (
        <section id="use-cases" className={styles.useCases}>
            <div className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionBadge}>What You Can Do</p>
                    <h2 className={titleStyles.sectionTitle}>Platform Capabilities</h2>
                    <p className={styles.sectionDescription}>
                        Real capabilities available today in the ResonantGenesis platform.
                    </p>
                </div>
                
                <div className={styles.useCasesGrid}>
                    {/* Use Case 1: Governed Chat & IDE */}
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseIcon}>
                            <MLOpsIcon />
                        </div>
                        <h3 className={titleStyles.useCaseTitle}>Governed Chat & IDE</h3>
                        <p className={styles.useCaseSummary}>
                            AI-assisted conversations and code execution under <strong>full governance control</strong>.
                        </p>
                        
                        <div className={styles.useCaseBody}>
                            <p>Every interaction through Chat or IDE is governed:</p>
                            <ul className={styles.useCaseList}>
                                <li>Semantic classification of each request</li>
                                <li>Trust tier evaluation before execution</li>
                                <li>Policy enforcement (pass/flag/block)</li>
                                <li>Immutable recording to execution ledger</li>
                                <li>Multi-provider routing (GPT, Claude, Gemini)</li>
                                <li>Persistent context across sessions</li>
                            </ul>
                            <p className={styles.useCaseHighlight}>
                                Not a free-form chatbot. Every action is <em>evaluated</em>, <em>logged</em>, and <em>auditable</em>.
                            </p>
                        </div>
                        
                        <div className={styles.useCaseOutcome}>
                            <span className={styles.outcomeLabel}>Available:</span> /resonant-chat, /ide
                        </div>
                    </div>

                    {/* Use Case 2: Agent Teams & Marketplace */}
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseIcon}>
                            <IntegrationIcon />
                        </div>
                        <h3 className={titleStyles.useCaseTitle}>Agent Teams & Marketplace</h3>
                        <p className={styles.useCaseSummary}>
                            Deploy and coordinate <strong>multi-agent workflows</strong> with cryptographic identity.
                        </p>
                        
                        <div className={styles.useCaseBody}>
                            <p>Create, manage, and orchestrate AI agents:</p>
                            <ul className={styles.useCaseList}>
                                <li>Persistent DSID identity per agent</li>
                                <li>Trust tier progression (T0→T4)</li>
                                <li>Team coordination with shared memory</li>
                                <li>Marketplace for agents and workflows</li>
                                <li>Dual-layer isolation (execution + governance)</li>
                                <li>All transactions cryptographically signed</li>
                            </ul>
                            <p className={styles.useCaseHighlight}>
                                Agents earn autonomy through <em>verifiable behavior</em>, not configuration.
                            </p>
                        </div>
                        
                        <div className={styles.useCaseOutcome}>
                            <span className={styles.outcomeLabel}>Available:</span> /agents, /agent-teams, /marketplace
                        </div>
                    </div>

                    {/* Use Case 3: Control Plane & Monitoring */}
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseIcon}>
                            <ComplianceIcon />
                        </div>
                        <h3 className={titleStyles.useCaseTitle}>Control Plane & Monitoring</h3>
                        <p className={styles.useCaseSummary}>
                            Real-time visibility into <strong>every AI execution</strong> with governance dashboards.
                        </p>
                        
                        <div className={styles.useCaseBody}>
                            <p>Full operator console for governed AI:</p>
                            <ul className={styles.useCaseList}>
                                <li>Live execution ledger (real-time)</li>
                                <li>Semantic domain explorer</li>
                                <li>Trust tier dashboard</li>
                                <li>Governance policy center</li>
                                <li>Compliance hub with audit trails</li>
                                <li>Security monitoring and alerts</li>
                            </ul>
                            <p className={styles.useCaseHighlight}>
                                <em>Nothing executes outside governance.</em> Every action is visible and verifiable.
                            </p>
                        </div>
                        
                        <div className={styles.useCaseOutcome}>
                            <span className={styles.outcomeLabel}>Available:</span> /control-plane/*
                        </div>
                    </div>

                    {/* Use Case 4: API & Integration */}
                    <div className={styles.useCaseCard}>
                        <div className={styles.useCaseIcon}>
                            <AnimatedSyncIcon />
                        </div>
                        <h3 className={titleStyles.useCaseTitle}>API & Integration</h3>
                        <p className={styles.useCaseSummary}>
                            <strong>150+ production-ready endpoints</strong> for governed AI operations.
                        </p>
                        
                        <div className={styles.useCaseBody}>
                            <p>Full REST API for programmatic access:</p>
                            <ul className={styles.useCaseList}>
                                <li>DSID-P protocol endpoints</li>
                                <li>Execution ledger queries</li>
                                <li>Agent management APIs</li>
                                <li>Governance policy configuration</li>
                                <li>Trust tier management</li>
                                <li>Webhook integrations</li>
                            </ul>
                            <p className={styles.useCaseHighlight}>
                                Authentication, rate limiting, and <em>audit hooks</em> on every endpoint.
                            </p>
                        </div>
                        
                        <div className={styles.useCaseOutcome}>
                            <span className={styles.outcomeLabel}>Available:</span> /api/docs
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
