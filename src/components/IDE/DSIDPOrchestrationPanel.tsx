/**
 * DSID-P Agent Orchestration Panel
 * 
 * Real-time visualization of:
 * - Agent governance status
 * - Trust tiers (T0-T4)
 * - Ethical compliance (7 pillars)
 * - Security layers (7 layers)
 * - Tool execution with DSID-P controls
 */

import React, { memo, useState, useEffect, useCallback } from 'react';
import styles from './DSIDPOrchestrationPanel.module.css';

// Types
interface TrustStatus {
  tier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
  score: number;
  name: string;
  color: string;
}

interface EthicalPillar {
  id: string;
  name: string;
  status: 'compliant' | 'warning' | 'violation';
  icon: string;
}

interface SecurityLayer {
  id: string;
  name: string;
  status: 'secure' | 'alert' | 'critical';
  threats: number;
}

interface GovernanceDecision {
  id: string;
  action: string;
  result: 'allow' | 'deny' | 'escalate';
  rule: string;
  timestamp: Date;
}

interface AgentExecution {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'blocked';
  trustRequired: number;
  ethicalCheck: boolean;
  governanceApproved: boolean;
  gasUsed?: number;
  duration?: number;
}

interface DSIDPOrchestrationPanelProps {
  agentId?: string;
  sessionId?: string;
  onExecutionClick?: (execution: AgentExecution) => void;
  className?: string;
}

// Trust tier configuration
const TRUST_TIERS: Record<string, TrustStatus> = {
  T0: { tier: 'T0', score: 0, name: 'Restricted', color: '#ef4444' },
  T1: { tier: 'T1', score: 25, name: 'Probationary', color: '#f97316' },
  T2: { tier: 'T2', score: 50, name: 'Bronze', color: '#eab308' },
  T3: { tier: 'T3', score: 75, name: 'Silver', color: '#6b7280' },
  T4: { tier: 'T4', score: 90, name: 'Gold', color: '#22c55e' },
};

// Ethical pillars (Section 36)
const ETHICAL_PILLARS: EthicalPillar[] = [
  { id: 'human_oversight', name: 'Human Oversight', status: 'compliant', icon: '👁️' },
  { id: 'transparency', name: 'Transparency', status: 'compliant', icon: '🔍' },
  { id: 'privacy', name: 'Privacy', status: 'compliant', icon: '🔒' },
  { id: 'fairness', name: 'Fairness', status: 'compliant', icon: '⚖️' },
  { id: 'safety', name: 'Safety', status: 'compliant', icon: '🛡️' },
  { id: 'governance', name: 'Governance', status: 'compliant', icon: '📋' },
  { id: 'sovereignty', name: 'Sovereignty', status: 'compliant', icon: '🏛️' },
];

// Security layers (Section 40)
const SECURITY_LAYERS: SecurityLayer[] = [
  { id: 'l1_identity', name: 'Identity', status: 'secure', threats: 0 },
  { id: 'l2_data', name: 'Data/Memory', status: 'secure', threats: 0 },
  { id: 'l3_semantic', name: 'Semantic', status: 'secure', threats: 0 },
  { id: 'l4_governance', name: 'Governance', status: 'secure', threats: 0 },
  { id: 'l5_coordination', name: 'Coordination', status: 'secure', threats: 0 },
  { id: 'l6_registry', name: 'Registry', status: 'secure', threats: 0 },
  { id: 'l7_federation', name: 'Federation', status: 'secure', threats: 0 },
];

// Trust Tier Badge Component
const TrustBadge: React.FC<{ trust: TrustStatus }> = memo(({ trust }) => (
  <div className={styles.trustBadge} style={{ borderColor: trust.color }}>
    <span className={styles.trustTier} style={{ color: trust.color }}>{trust.tier}</span>
    <span className={styles.trustName}>{trust.name}</span>
    <div className={styles.trustBar}>
      <div 
        className={styles.trustFill} 
        style={{ width: `${trust.score}%`, backgroundColor: trust.color }}
      />
    </div>
    <span className={styles.trustScore}>{trust.score}%</span>
  </div>
));

TrustBadge.displayName = 'TrustBadge';

// Ethical Pillar Component
const EthicalPillarItem: React.FC<{ pillar: EthicalPillar }> = memo(({ pillar }) => {
  const statusColor = {
    compliant: '#22c55e',
    warning: '#eab308',
    violation: '#ef4444',
  }[pillar.status];

  return (
    <div className={styles.pillarItem}>
      <span className={styles.pillarIcon}>{pillar.icon}</span>
      <span className={styles.pillarName}>{pillar.name}</span>
      <span 
        className={styles.pillarStatus}
        style={{ backgroundColor: statusColor }}
      >
        {pillar.status === 'compliant' ? '✓' : pillar.status === 'warning' ? '!' : '✗'}
      </span>
    </div>
  );
});

EthicalPillarItem.displayName = 'EthicalPillarItem';

// Security Layer Component
const SecurityLayerItem: React.FC<{ layer: SecurityLayer }> = memo(({ layer }) => {
  const statusColor = {
    secure: '#22c55e',
    alert: '#eab308',
    critical: '#ef4444',
  }[layer.status];

  return (
    <div className={styles.securityItem}>
      <div className={styles.securityDot} style={{ backgroundColor: statusColor }} />
      <span className={styles.securityName}>{layer.name}</span>
      {layer.threats > 0 && (
        <span className={styles.threatCount}>{layer.threats}</span>
      )}
    </div>
  );
});

SecurityLayerItem.displayName = 'SecurityLayerItem';

// Governance Decision Component
const GovernanceDecisionItem: React.FC<{ decision: GovernanceDecision }> = memo(({ decision }) => {
  const resultIcon = {
    allow: '✅',
    deny: '❌',
    escalate: '⚠️',
  }[decision.result];

  const resultColor = {
    allow: '#22c55e',
    deny: '#ef4444',
    escalate: '#eab308',
  }[decision.result];

  return (
    <div className={styles.decisionItem}>
      <span className={styles.decisionIcon} style={{ color: resultColor }}>{resultIcon}</span>
      <div className={styles.decisionContent}>
        <span className={styles.decisionAction}>{decision.action}</span>
        <span className={styles.decisionRule}>{decision.rule}</span>
      </div>
      <span className={styles.decisionTime}>
        {decision.timestamp.toLocaleTimeString()}
      </span>
    </div>
  );
});

GovernanceDecisionItem.displayName = 'GovernanceDecisionItem';

// Execution Item Component
const ExecutionItem: React.FC<{ 
  execution: AgentExecution;
  onClick?: () => void;
}> = memo(({ execution, onClick }) => {
  const statusColor = {
    pending: '#6b7280',
    running: '#0ea5e9',
    completed: '#22c55e',
    blocked: '#ef4444',
  }[execution.status];

  return (
    <div className={styles.executionItem} onClick={onClick}>
      <div className={styles.executionHeader}>
        <span className={styles.executionStatus} style={{ backgroundColor: statusColor }}>
          {execution.status === 'running' ? '●' : execution.status === 'completed' ? '✓' : 
           execution.status === 'blocked' ? '✗' : '○'}
        </span>
        <span className={styles.executionAction}>{execution.action}</span>
        <span className={styles.executionAgent}>{execution.agentName}</span>
      </div>
      <div className={styles.executionChecks}>
        <span className={`${styles.check} ${execution.ethicalCheck ? styles.passed : styles.failed}`}>
          Ethics {execution.ethicalCheck ? '✓' : '✗'}
        </span>
        <span className={`${styles.check} ${execution.governanceApproved ? styles.passed : styles.failed}`}>
          Gov {execution.governanceApproved ? '✓' : '✗'}
        </span>
        <span className={styles.trustReq}>T{Math.floor(execution.trustRequired / 25)}</span>
      </div>
      {execution.gasUsed !== undefined && (
        <div className={styles.executionMetrics}>
          <span>Gas: {execution.gasUsed}</span>
          {execution.duration && <span>{execution.duration}ms</span>}
        </div>
      )}
    </div>
  );
});

ExecutionItem.displayName = 'ExecutionItem';

// Main Component
export const DSIDPOrchestrationPanel: React.FC<DSIDPOrchestrationPanelProps> = memo(({
  agentId,
  sessionId,
  onExecutionClick,
  className,
}) => {
  const [trust, setTrust] = useState<TrustStatus>(TRUST_TIERS.T3);
  const [pillars, setPillars] = useState<EthicalPillar[]>(ETHICAL_PILLARS);
  const [security, setSecurity] = useState<SecurityLayer[]>(SECURITY_LAYERS);
  const [decisions, setDecisions] = useState<GovernanceDecision[]>([]);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'ethics' | 'security' | 'governance'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch DSID-P status from backend
  const fetchStatus = useCallback(async () => {
    if (!agentId) return;
    
    setIsLoading(true);
    try {
      // Fetch compliance status
      const complianceRes = await fetch('/api/agents/agents/dsidp/compliance/status');
      if (complianceRes.ok) {
        const data = await complianceRes.json();
        // Update pillars based on compliance
        if (data.compliance) {
          const updatedPillars = pillars.map(p => ({
            ...p,
            status: 'compliant' as const,
          }));
          setPillars(updatedPillars);
        }
      }

      // Fetch security status
      const securityRes = await fetch('/api/agents/agents/dsidp/security/threats');
      if (securityRes.ok) {
        const data = await securityRes.json();
        if (data.security_layers) {
          const updatedSecurity = security.map(s => ({
            ...s,
            status: data.security_layers[s.id]?.status || 'secure',
            threats: data.security_layers[s.id]?.threats_detected || 0,
          }));
          setSecurity(updatedSecurity);
        }
      }
    } catch (error) {
      console.error('Failed to fetch DSID-P status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, pillars, security]);

  useEffect(() => {
    fetchStatus();
    // Poll every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Add mock execution for demo
  useEffect(() => {
    const mockExecutions: AgentExecution[] = [
      {
        id: '1',
        agentId: agentId || 'demo',
        agentName: 'Code Assistant',
        action: 'read_file',
        status: 'completed',
        trustRequired: 25,
        ethicalCheck: true,
        governanceApproved: true,
        gasUsed: 150,
        duration: 45,
      },
      {
        id: '2',
        agentId: agentId || 'demo',
        agentName: 'Code Assistant',
        action: 'analyze_code',
        status: 'running',
        trustRequired: 50,
        ethicalCheck: true,
        governanceApproved: true,
      },
    ];
    setExecutions(mockExecutions);

    const mockDecisions: GovernanceDecision[] = [
      {
        id: '1',
        action: 'read_file',
        result: 'allow',
        rule: 'AllowReadOnly',
        timestamp: new Date(),
      },
      {
        id: '2',
        action: 'write_file',
        result: 'escalate',
        rule: 'EscalateLargeTransaction',
        timestamp: new Date(),
      },
    ];
    setDecisions(mockDecisions);
  }, [agentId]);

  const overallStatus = security.every(s => s.status === 'secure') && 
                        pillars.every(p => p.status === 'compliant') 
                        ? 'healthy' : 'attention';

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.dsidpLogo}>◈</span>
          DSID-P Orchestration
        </h3>
        <div className={styles.statusIndicator}>
          <span 
            className={styles.statusDot}
            style={{ backgroundColor: overallStatus === 'healthy' ? '#22c55e' : '#eab308' }}
          />
          {overallStatus === 'healthy' ? 'Healthy' : 'Attention'}
        </div>
      </div>

      {/* Trust Badge */}
      <TrustBadge trust={trust} />

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['overview', 'ethics', 'security', 'governance'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.section}>
              <h4>Recent Executions</h4>
              {executions.map(exec => (
                <ExecutionItem 
                  key={exec.id} 
                  execution={exec}
                  onClick={() => onExecutionClick?.(exec)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ethics' && (
          <div className={styles.ethicsGrid}>
            {pillars.map(pillar => (
              <EthicalPillarItem key={pillar.id} pillar={pillar} />
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className={styles.securityList}>
            {security.map(layer => (
              <SecurityLayerItem key={layer.id} layer={layer} />
            ))}
          </div>
        )}

        {activeTab === 'governance' && (
          <div className={styles.governanceList}>
            {decisions.length === 0 ? (
              <div className={styles.empty}>No governance decisions yet</div>
            ) : (
              decisions.map(decision => (
                <GovernanceDecisionItem key={decision.id} decision={decision} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.footerText}>
          DSID-P v1.0 • {isLoading ? 'Syncing...' : 'Live'}
        </span>
        <button className={styles.refreshBtn} onClick={fetchStatus} disabled={isLoading}>
          ↻
        </button>
      </div>
    </div>
  );
});

DSIDPOrchestrationPanel.displayName = 'DSIDPOrchestrationPanel';

export default DSIDPOrchestrationPanel;
