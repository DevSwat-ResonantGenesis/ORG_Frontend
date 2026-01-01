/**
 * Guided Execution Scenarios
 * 
 * Control Plane page for understanding governed AI behavior safely.
 * Shows both real and simulated executions with clear labeling.
 * 
 * Placement: Control Plane → "Try the System" (guided, read-only + gated actions)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth-cookies';
import styles from './ControlPlane.module.css';

// Execution Source Labels
type ExecutionSource = 'user' | 'autonomous' | 'system' | 'simulated';

interface ScenarioEvent {
    id: string;
    dsid: string;
    action: string;
    domain: string;
    policy: string;
    result: 'passed' | 'flagged' | 'blocked';
    trustBefore: number;
    trustAfter: number;
    source: ExecutionSource;
    timestamp: string;
    reason?: string;
}

const sourceLabels: Record<ExecutionSource, { label: string; description: string; color: string }> = {
    user: { label: 'User-Initiated', description: 'Authenticated human request', color: '#22c55e' },
    autonomous: { label: 'Autonomous', description: 'Agent-initiated execution', color: '#8b5cf6' },
    system: { label: 'System', description: 'Governance or infrastructure', color: '#3b82f6' },
    simulated: { label: 'Simulated', description: 'Demo or test data', color: '#6b7280' },
};

const scenarios = [
    {
        id: 'regulated-refusal',
        title: 'Scenario 1 — Regulated Refusal',
        description: 'What you\'ll see: A request classified as healthcare.clinical is blocked by governance.',
        proves: 'The system can legally refuse to act.',
        events: [
            {
                id: 'evt-001',
                dsid: 'DSID-K9M1X7P2',
                action: 'execute',
                domain: 'healthcare.clinical',
                policy: 'HIPAA-COMPLIANCE-v2.1',
                result: 'blocked' as const,
                trustBefore: 2,
                trustAfter: 2,
                source: 'simulated' as const,
                timestamp: '2024-12-14T10:45:32Z',
                reason: 'Agent lacks clinical certification. Trust tier T2 insufficient for healthcare.clinical domain.',
            },
        ],
    },
    {
        id: 'multi-agent',
        title: 'Scenario 2 — Multi-Agent Decision',
        description: 'What you\'ll see: Multiple agents evaluate the same request, governance resolves disagreement.',
        proves: 'Decisions are structural, not opinion-based.',
        events: [
            {
                id: 'evt-002a',
                dsid: 'DSID-A7X2Q9R4',
                action: 'analyze',
                domain: 'finance.audit',
                policy: 'MULTI-AGENT-CONSENSUS-v1.0',
                result: 'passed' as const,
                trustBefore: 3,
                trustAfter: 3,
                source: 'simulated' as const,
                timestamp: '2024-12-14T10:46:01Z',
            },
            {
                id: 'evt-002b',
                dsid: 'DSID-B3Y5S1T8',
                action: 'validate',
                domain: 'finance.audit',
                policy: 'MULTI-AGENT-CONSENSUS-v1.0',
                result: 'flagged' as const,
                trustBefore: 2,
                trustAfter: 2,
                source: 'simulated' as const,
                timestamp: '2024-12-14T10:46:02Z',
                reason: 'Confidence below threshold. Escalated to human review.',
            },
            {
                id: 'evt-002c',
                dsid: 'DSID-C6Z8U4V2',
                action: 'resolve',
                domain: 'finance.audit',
                policy: 'MULTI-AGENT-CONSENSUS-v1.0',
                result: 'passed' as const,
                trustBefore: 4,
                trustAfter: 4,
                source: 'simulated' as const,
                timestamp: '2024-12-14T10:46:05Z',
            },
        ],
    },
    {
        id: 'trust-progression',
        title: 'Scenario 3 — Trust Progression',
        description: 'What you\'ll see: An agent\'s trust tier changes over time through earned behavior.',
        proves: 'Autonomy is earned, not claimed.',
        events: [
            {
                id: 'evt-003a',
                dsid: 'DSID-P3Q8W6X1',
                action: 'validate',
                domain: 'legal.compliance',
                policy: 'TRUST-PROGRESSION-v1.2',
                result: 'passed' as const,
                trustBefore: 1,
                trustAfter: 1,
                source: 'simulated' as const,
                timestamp: '2024-12-14T10:40:00Z',
            },
            {
                id: 'evt-003b',
                dsid: 'DSID-P3Q8W6X1',
                action: 'analyze',
                domain: 'legal.compliance',
                policy: 'TRUST-PROGRESSION-v1.2',
                result: 'passed' as const,
                trustBefore: 1,
                trustAfter: 2,
                source: 'simulated' as const,
                timestamp: '2024-12-14T10:42:00Z',
            },
            {
                id: 'evt-003c',
                dsid: 'DSID-P3Q8W6X1',
                action: 'execute',
                domain: 'legal.compliance',
                policy: 'TRUST-PROGRESSION-v1.2',
                result: 'passed' as const,
                trustBefore: 2,
                trustAfter: 3,
                source: 'simulated' as const,
                timestamp: '2024-12-14T10:47:00Z',
            },
        ],
    },
];

const GuidedScenarios: React.FC = () => {
    const navigate = useNavigate();
    const [activeScenario, setActiveScenario] = useState(scenarios[0].id);
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

    // Redirect to signup if not logged in
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/signup', { replace: true });
        }
    }, [navigate]);

    const currentScenario = scenarios.find(s => s.id === activeScenario) || scenarios[0];

    return (
        <div className={styles.pageContainer}>
            <main className={styles.mainContent}>
                {/* Warning Banner */}
                <div className={styles.warningBanner}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>
                        This environment shows both real and simulated executions.
                        <strong> Simulated events are clearly labeled and do not count as usage.</strong>
                    </span>
                </div>

                {/* Scenario Tabs */}
                <div className={styles.scenarioTabs}>
                    {scenarios.map(scenario => (
                        <button
                            key={scenario.id}
                            className={`${styles.scenarioTab} ${activeScenario === scenario.id ? styles.activeTab : ''}`}
                            onClick={() => setActiveScenario(scenario.id)}
                        >
                            {scenario.title.split(' — ')[0]}
                        </button>
                    ))}
                </div>

                {/* Scenario Content */}
                <div className={styles.scenarioContent}>
                    <div className={styles.scenarioHeader}>
                        <h2 className={styles.scenarioTitle}>{currentScenario.title}</h2>
                        <p className={styles.scenarioDescription}>{currentScenario.description}</p>
                        <div className={styles.scenarioProves}>
                            <strong>What this proves:</strong> {currentScenario.proves}
                        </div>
                    </div>

                    {/* Events Table */}
                    <div className={styles.eventsTable}>
                        <div className={styles.eventsHeader}>
                            <span>Agent DSID</span>
                            <span>Action</span>
                            <span>Domain</span>
                            <span>Policy</span>
                            <span>Result</span>
                            <span>Trust</span>
                            <span>Source</span>
                        </div>
                        {currentScenario.events.map(event => (
                            <div key={event.id}>
                                <div 
                                    className={`${styles.eventRow} ${expandedEvent === event.id ? styles.expandedRow : ''}`}
                                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                >
                                    <span className={styles.dsidCell}>
                                        <code>{event.dsid}</code>
                                    </span>
                                    <span>{event.action}</span>
                                    <span className={styles.domainCell}>{event.domain}</span>
                                    <span className={styles.policyCell}>{event.policy}</span>
                                    <span className={`${styles.resultCell} ${styles[event.result]}`}>
                                        {event.result.toUpperCase()}
                                    </span>
                                    <span className={styles.trustCell}>
                                        T{event.trustBefore}
                                        {event.trustBefore !== event.trustAfter && (
                                            <span className={event.trustAfter > event.trustBefore ? styles.trustUp : styles.trustDown}>
                                                → T{event.trustAfter}
                                            </span>
                                        )}
                                    </span>
                                    <span 
                                        className={styles.sourceCell}
                                        style={{ color: sourceLabels[event.source].color }}
                                    >
                                        {event.source === 'simulated' && (
                                            <span className={styles.simulatedBadge}>SIM</span>
                                        )}
                                        {sourceLabels[event.source].label}
                                    </span>
                                </div>
                                {expandedEvent === event.id && event.reason && (
                                    <div className={styles.eventDetails}>
                                        <div className={styles.eventReason}>
                                            <strong>Reason:</strong> {event.reason}
                                        </div>
                                        <div className={styles.eventMeta}>
                                            <span><strong>Timestamp:</strong> {new Date(event.timestamp).toLocaleString()}</span>
                                            <span><strong>Source:</strong> {sourceLabels[event.source].description}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Triggering Real Executions */}
                <div className={styles.infoSection}>
                    <h3 className={styles.infoTitle}>Triggering Real Executions</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoCard}>
                            <h4>Real executions occur when:</h4>
                            <ul>
                                <li>A user submits a request through Chat or IDE</li>
                                <li>An autonomous agent runs under governance</li>
                                <li>A valid authorization token is present</li>
                            </ul>
                        </div>
                        <div className={styles.infoCard}>
                            <h4>Simulated executions are used only for:</h4>
                            <ul>
                                <li>UI demonstrations</li>
                                <li>Onboarding walkthroughs</li>
                                <li>Non-production testing</li>
                            </ul>
                        </div>
                    </div>
                    <p className={styles.infoNote}>Both are visible — never mixed.</p>
                </div>

                {/* Source Taxonomy */}
                <div className={styles.taxonomySection}>
                    <h3 className={styles.taxonomyTitle}>Execution Source Labels</h3>
                    <div className={styles.taxonomyTable}>
                        <div className={styles.taxonomyHeader}>
                            <span>Label</span>
                            <span>Meaning</span>
                            <span>Counts as Real?</span>
                        </div>
                        {Object.entries(sourceLabels).map(([key, value]) => (
                            <div key={key} className={styles.taxonomyRow}>
                                <span style={{ color: value.color, fontWeight: 600 }}>{value.label}</span>
                                <span>{value.description}</span>
                                <span className={key === 'user' || key === 'autonomous' ? styles.realUsage : styles.notRealUsage}>
                                    {key === 'user' || key === 'autonomous' ? '✓ Yes' : '✗ No'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className={styles.taxonomyNote}>
                        Only <strong>User-Initiated</strong> and <strong>Autonomous</strong> executions count as real usage.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default GuidedScenarios;
