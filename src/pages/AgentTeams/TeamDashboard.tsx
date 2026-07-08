/**
 * Team Dashboard - Enterprise-Grade Multi-Agent Operator Console
 * 
 * This is where you become non-replaceable.
 * A control surface for coordinated, multi-agent autonomous systems.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useToastContext } from '@/context/ToastContext';
import { getAgentTeam, type AgentTeam } from '@/api/agentTeams';
import styles from './TeamDashboard.module.css';

// Types for Team Dashboard
type AgentState = 'running' | 'waiting' | 'failed' | 'paused' | 'blocked';
type TrustTier = 'T0' | 'T1' | 'T2' | 'T3' | 'T4';
type TeamRole = 'owner' | 'operator' | 'observer' | 'auditor';

interface TeamAgent {
  id: string;
  name: string;
  dsid: string;
  state: AgentState;
  trustTier: TrustTier;
  role: string;
  lastExecution?: string;
  executionCount: number;
  failureRate: number;
}

interface AgentDependency {
  from: string;
  to: string;
  type: 'triggers' | 'depends_on' | 'fallback';
  condition?: string;
}

interface SharedResource {
  id: string;
  type: 'memory_pool' | 'credential' | 'integration' | 'budget';
  name: string;
  accessLevel: 'read' | 'write' | 'admin';
  usedBy: string[];
  usage?: number;
  limit?: number;
}

interface OrchestrationRule {
  id: string;
  name: string;
  triggerAgent: string;
  targetAgent: string;
  condition: string;
  action: 'trigger' | 'fallback' | 'escalate';
  enabled: boolean;
}

interface TeamActivityEvent {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  task: string;
  outcome: 'success' | 'failure' | 'blocked';
  trustImpact: number;
  auditHash: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  permissions: {
    view: string[];
    mutate: string[];
    emergency: boolean;
  };
  joinedAt: string;
}

interface TeamDashboardData {
  // B1: Overview
  id: string;
  name: string;
  owner: { id: string; name: string };
  createdAt: string;
  totalAgents: number;
  activeAgents: number;
  blockedAgents: number;
  aggregateTrustScore: number;
  
  // B2: Agent Graph
  agents: TeamAgent[];
  dependencies: AgentDependency[];
  
  // B3: Shared Resources
  sharedResources: SharedResource[];
  
  // B4: Orchestration
  orchestrationRules: OrchestrationRule[];
  
  // B5: Activity Ledger
  activityLog: TeamActivityEvent[];
  
  // B6: Members & Roles
  members: TeamMember[];
}

// State indicator component
const StateIndicator: React.FC<{ state: AgentState; small?: boolean }> = ({ state, small }) => {
  const stateConfig = {
    running: { icon: '🟢', label: 'Running', color: '#10b981' },
    waiting: { icon: '🟡', label: 'Waiting', color: '#f59e0b' },
    failed: { icon: '🔴', label: 'Failed', color: '#ef4444' },
    paused: { icon: '⏸', label: 'Paused', color: '#6b7280' },
    blocked: { icon: '🔒', label: 'Blocked', color: '#dc2626' },
  };
  
  const config = stateConfig[state];
  return (
    <span className={`${styles.stateIndicator} ${small ? styles.stateSmall : ''}`} style={{ color: config.color }}>
      <span className={styles.stateIcon}>{config.icon}</span>
      {!small && <span className={styles.stateLabel}>{config.label}</span>}
    </span>
  );
};

// Trust tier badge
const TrustBadge: React.FC<{ tier: TrustTier; small?: boolean }> = ({ tier, small }) => {
  const tierColors: Record<TrustTier, string> = {
    T0: '#ef4444',
    T1: '#f59e0b',
    T2: '#eab308',
    T3: '#22c55e',
    T4: '#10b981',
  };
  
  return (
    <span className={`${styles.trustBadge} ${small ? styles.trustSmall : ''}`} style={{ background: tierColors[tier] }}>
      {tier}
    </span>
  );
};

// Role badge
const RoleBadge: React.FC<{ role: TeamRole }> = ({ role }) => {
  const roleColors: Record<TeamRole, string> = {
    owner: '#8b5cf6',
    operator: '#3b82f6',
    observer: '#6b7280',
    auditor: '#f59e0b',
  };
  
  return (
    <span className={styles.roleBadge} style={{ background: roleColors[role] }}>
      {role}
    </span>
  );
};

const TeamDashboard: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const toast = useToastContext();
  
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'resources' | 'orchestration' | 'ledger' | 'members'>('overview');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  // Load team data
  const loadTeam = useCallback(async () => {
    if (!teamId) return;
    
    setLoading(true);
    try {
      const teamData = await getAgentTeam(teamId);
      
      // Transform to dashboard format with mock data for missing fields
      const dashboardData: TeamDashboardData = {
        id: teamData.id,
        name: teamData.name,
        owner: { id: 'current', name: 'Current User' },
        createdAt: teamData.created_at || new Date().toISOString(),
        totalAgents: teamData.agents?.length || 0,
        activeAgents: teamData.agents?.filter((a: any) => a.status === 'active').length || 0,
        blockedAgents: 0,
        aggregateTrustScore: 72,
        
        agents: (teamData.agents || []).map((a: any, i: number) => ({
          id: a.id || `agent_${i}`,
          name: a.name || `Agent ${i + 1}`,
          dsid: `dsid_${(a.id || '').slice(0, 8)}`,
          state: a.status === 'active' ? 'running' : 'waiting',
          trustTier: (['T1', 'T2', 'T3'] as const)[i % 3] as TrustTier,
          role: a.role || 'worker',
          lastExecution: new Date(Date.now() - (i + 1) * 600000).toISOString(),
          executionCount: a.execution_count || ((i + 1) * 47 + 50),
          failureRate: a.failure_rate || ((i * 1.2) % 5),
        })),
        
        dependencies: [
          { from: 'agent_0', to: 'agent_1', type: 'triggers' },
          { from: 'agent_1', to: 'agent_2', type: 'depends_on' },
          { from: 'agent_0', to: 'agent_2', type: 'fallback' },
        ],
        
        sharedResources: [
          {
            id: 'res_1',
            type: 'memory_pool',
            name: 'Team Knowledge Base',
            accessLevel: 'write',
            usedBy: ['agent_0', 'agent_1'],
            usage: 512,
            limit: 2048,
          },
          {
            id: 'res_2',
            type: 'credential',
            name: 'API Credentials',
            accessLevel: 'read',
            usedBy: ['agent_0', 'agent_1', 'agent_2'],
          },
          {
            id: 'res_3',
            type: 'budget',
            name: 'Execution Budget',
            accessLevel: 'admin',
            usedBy: ['agent_0', 'agent_1', 'agent_2'],
            usage: 45,
            limit: 100,
          },
        ],
        
        orchestrationRules: [
          {
            id: 'orch_1',
            name: 'Data Processing Chain',
            triggerAgent: 'agent_0',
            targetAgent: 'agent_1',
            condition: 'on_success',
            action: 'trigger',
            enabled: true,
          },
          {
            id: 'orch_2',
            name: 'Failure Fallback',
            triggerAgent: 'agent_1',
            targetAgent: 'agent_2',
            condition: 'on_failure',
            action: 'fallback',
            enabled: true,
          },
          {
            id: 'orch_3',
            name: 'Escalation Chain',
            triggerAgent: 'agent_2',
            targetAgent: 'agent_0',
            condition: 'trust_below_T2',
            action: 'escalate',
            enabled: false,
          },
        ],
        
        activityLog: Array.from({ length: 30 }, (_, i) => ({
          id: `activity_${i}`,
          timestamp: new Date(Date.now() - i * 1800000).toISOString(),
          agentId: `agent_${i % 3}`,
          agentName: `Agent ${(i % 3) + 1}`,
          task: ['process_data', 'generate_report', 'send_notification', 'analyze_input'][i % 4],
          outcome: (['success', 'success', 'success', 'failure'] as const)[i % 4] as 'success' | 'failure' | 'blocked',
          trustImpact: i % 5 === 0 ? 0.1 : 0,
          auditHash: `0x${(i * 0x1a2b3c4d5e + 0xf6e5d4c3b2a1).toString(16).slice(0, 16)}`,
        })),
        
        members: [
          {
            id: 'member_1',
            name: 'Current User',
            email: 'user@example.com',
            role: 'owner',
            permissions: { view: ['all'], mutate: ['all'], emergency: true },
            joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          },
          {
            id: 'member_2',
            name: 'Team Operator',
            email: 'operator@example.com',
            role: 'operator',
            permissions: { view: ['all'], mutate: ['tasks', 'integrations'], emergency: false },
            joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
          },
          {
            id: 'member_3',
            name: 'Auditor',
            email: 'auditor@example.com',
            role: 'auditor',
            permissions: { view: ['logs', 'metrics'], mutate: [], emergency: false },
            joinedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
          },
        ],
      };
      
      setTeam(dashboardData);
    } catch (err) {
      console.error('Failed to load team:', err);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, [teamId, toast]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);


  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading team dashboard...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Team not found</div>
        <Button onClick={() => navigate('/agent-teams')}>Back to Teams</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={() => navigate('/agent-teams')}>
            ← Back
          </button>
          <div className={styles.headerTitle}>
            <h1>{team.name}</h1>
            <span className={styles.teamId}>Team ID: {team.id.slice(0, 12)}...</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.headerStat}>
            <span className={styles.headerStatValue}>{team.activeAgents}/{team.totalAgents}</span>
            <span className={styles.headerStatLabel}>Active Agents</span>
          </div>
          <div className={styles.headerStat}>
            <span className={styles.headerStatValue}>{team.aggregateTrustScore}%</span>
            <span className={styles.headerStatLabel}>Trust Score</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/agent-teams/${team.id}/edit`)}>
            Edit Team
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabs}>
        {(['overview', 'graph', 'resources', 'orchestration', 'ledger', 'members'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className={styles.content}>
        {/* B1: Team Overview */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            {/* Team Stats */}
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Team Overview</h2>
              <div className={styles.statsGrid}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Owner</span>
                  <span className={styles.statValue}>{team.owner.name}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Created</span>
                  <span className={styles.statValue}>{new Date(team.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Agents</span>
                  <span className={styles.statValue}>{team.totalAgents}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Active Agents</span>
                  <span className={styles.statValue} style={{ color: '#10b981' }}>{team.activeAgents}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Blocked Agents</span>
                  <span className={styles.statValue} style={{ color: team.blockedAgents > 0 ? '#ef4444' : 'inherit' }}>
                    {team.blockedAgents}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Aggregate Trust</span>
                  <span className={styles.statValue}>{team.aggregateTrustScore}%</span>
                </div>
              </div>
            </section>

            {/* Agent List */}
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Team Agents</h2>
              <div className={styles.agentsList}>
                {team.agents.map(agent => (
                  <div 
                    key={agent.id} 
                    className={styles.agentCard}
                    onClick={() => navigate(`/agents/${agent.id}`)}
                  >
                    <div className={styles.agentHeader}>
                      <h3 className={styles.agentName}>{agent.name}</h3>
                      <div className={styles.agentBadges}>
                        <StateIndicator state={agent.state} small />
                        <TrustBadge tier={agent.trustTier} small />
                      </div>
                    </div>
                    <div className={styles.agentStats}>
                      <span>Role: {agent.role}</span>
                      <span>Executions: {agent.executionCount}</span>
                      <span>Failure: {agent.failureRate.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Activity */}
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Recent Activity</h2>
              <div className={styles.activityPreview}>
                {team.activityLog.slice(0, 5).map(event => (
                  <div key={event.id} className={styles.activityItem}>
                    <span className={styles.activityTime}>
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={styles.activityAgent}>{event.agentName}</span>
                    <span className={styles.activityTask}>{event.task}</span>
                    <span className={`${styles.activityOutcome} ${styles[event.outcome]}`}>
                      {event.outcome}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('ledger')}>
                View Full Ledger →
              </Button>
            </section>
          </div>
        )}

        {/* B2: Agent Graph View */}
        {activeTab === 'graph' && (
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Agent Dependency Graph</h2>
            <p className={styles.panelDescription}>
              Visual DAG showing agents as nodes, dependencies as edges, trust tiers as colors, governance blocks as red edges.
            </p>
            
            <div className={styles.graphContainer}>
              {/* Simple text-based graph representation */}
              <div className={styles.graphLegend}>
                <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#10b981' }}></span> Running</span>
                <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#f59e0b' }}></span> Waiting</span>
                <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: '#ef4444' }}></span> Failed/Blocked</span>
                <span className={styles.legendItem}><span className={styles.legendLine}></span> Triggers</span>
                <span className={styles.legendItem}><span className={styles.legendLineDashed}></span> Fallback</span>
              </div>
              
              <div className={styles.graphNodes}>
                {team.agents.map((agent, i) => (
                  <div 
                    key={agent.id}
                    className={`${styles.graphNode} ${selectedAgent === agent.id ? styles.graphNodeSelected : ''}`}
                    style={{ 
                      left: `${20 + (i % 3) * 30}%`,
                      top: `${20 + Math.floor(i / 3) * 40}%`,
                    }}
                    onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
                  >
                    <StateIndicator state={agent.state} small />
                    <span className={styles.graphNodeName}>{agent.name}</span>
                    <TrustBadge tier={agent.trustTier} small />
                  </div>
                ))}
              </div>
              
              {/* Dependencies list */}
              <div className={styles.dependenciesList}>
                <h3>Dependencies</h3>
                {team.dependencies.map((dep, i) => (
                  <div key={i} className={styles.dependencyItem}>
                    <span>{team.agents.find(a => a.id === dep.from)?.name || dep.from}</span>
                    <span className={`${styles.depArrow} ${styles[dep.type]}`}>
                      {dep.type === 'triggers' && '→'}
                      {dep.type === 'depends_on' && '←'}
                      {dep.type === 'fallback' && '⤳'}
                    </span>
                    <span>{team.agents.find(a => a.id === dep.to)?.name || dep.to}</span>
                    <span className={styles.depType}>{dep.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* B3: Shared Resources */}
        {activeTab === 'resources' && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Shared Resources</h2>
              <Button variant="primary" size="sm">+ Add Resource</Button>
            </div>
            <p className={styles.panelDescription}>
              Shared memory pools, credentials, integrations, and budgets. Access controlled by role.
            </p>
            
            <div className={styles.resourcesGrid}>
              {team.sharedResources.map(resource => (
                <div key={resource.id} className={styles.resourceCard}>
                  <div className={styles.resourceHeader}>
                    <span className={styles.resourceIcon}>
                      {resource.type === 'memory_pool' && '🧠'}
                      {resource.type === 'credential' && '🔑'}
                      {resource.type === 'integration' && '🔗'}
                      {resource.type === 'budget' && '💰'}
                    </span>
                    <div className={styles.resourceInfo}>
                      <h3 className={styles.resourceName}>{resource.name}</h3>
                      <span className={styles.resourceType}>{resource.type.replace('_', ' ')}</span>
                    </div>
                    <span className={`${styles.accessBadge} ${styles[resource.accessLevel]}`}>
                      {resource.accessLevel}
                    </span>
                  </div>
                  
                  {resource.usage !== undefined && resource.limit !== undefined && (
                    <div className={styles.resourceUsage}>
                      <div className={styles.usageBar}>
                        <div 
                          className={styles.usageBarFill} 
                          style={{ width: `${(resource.usage / resource.limit) * 100}%` }}
                        />
                      </div>
                      <span className={styles.usageText}>
                        {resource.usage} / {resource.limit} {resource.type === 'budget' ? 'USD' : 'MB'}
                      </span>
                    </div>
                  )}
                  
                  <div className={styles.resourceUsedBy}>
                    <span className={styles.usedByLabel}>Used by:</span>
                    <span className={styles.usedByAgents}>
                      {resource.usedBy.map(id => team.agents.find(a => a.id === id)?.name || id).join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* B4: Team Task Orchestration */}
        {activeTab === 'orchestration' && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Task Orchestration</h2>
              <Button variant="primary" size="sm">+ Add Rule</Button>
            </div>
            <p className={styles.panelDescription}>
              Agent A triggers Agent B, conditional execution, fallback agents, escalation chains. This is multi-agent autonomy.
            </p>
            
            <div className={styles.orchestrationList}>
              {team.orchestrationRules.map(rule => (
                <div key={rule.id} className={`${styles.orchestrationCard} ${!rule.enabled ? styles.disabled : ''}`}>
                  <div className={styles.orchestrationHeader}>
                    <h3 className={styles.orchestrationName}>{rule.name}</h3>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={rule.enabled} onChange={() => {}} />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>
                  
                  <div className={styles.orchestrationFlow}>
                    <span className={styles.flowAgent}>
                      {team.agents.find(a => a.id === rule.triggerAgent)?.name || rule.triggerAgent}
                    </span>
                    <span className={`${styles.flowArrow} ${styles[rule.action]}`}>
                      {rule.action === 'trigger' && '→'}
                      {rule.action === 'fallback' && '⤳'}
                      {rule.action === 'escalate' && '↑'}
                    </span>
                    <span className={styles.flowAgent}>
                      {team.agents.find(a => a.id === rule.targetAgent)?.name || rule.targetAgent}
                    </span>
                  </div>
                  
                  <div className={styles.orchestrationDetails}>
                    <span className={styles.orchestrationCondition}>
                      Condition: <code>{rule.condition}</code>
                    </span>
                    <span className={`${styles.orchestrationAction} ${styles[rule.action]}`}>
                      Action: {rule.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* B5: Team Activity Ledger */}
        {activeTab === 'ledger' && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Team Activity Ledger</h2>
              <div className={styles.ledgerControls}>
                <Button variant="secondary" size="sm">Export</Button>
                <Button variant="secondary" size="sm">Filter</Button>
              </div>
            </div>
            <p className={styles.panelDescription}>
              Unified execution log. Filterable. Exportable. Immutable.
            </p>
            
            <div className={styles.ledgerTable}>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Agent</th>
                    <th>Task</th>
                    <th>Outcome</th>
                    <th>Trust Impact</th>
                    <th>Audit Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {team.activityLog.map(event => (
                    <tr key={event.id}>
                      <td className={styles.timeCell}>{new Date(event.timestamp).toLocaleString()}</td>
                      <td>
                        <button 
                          className={styles.agentLink}
                          onClick={() => navigate(`/agents/${event.agentId}`)}
                        >
                          {event.agentName}
                        </button>
                      </td>
                      <td>{event.task}</td>
                      <td>
                        <span className={`${styles.outcomeBadge} ${styles[event.outcome]}`}>
                          {event.outcome}
                        </span>
                      </td>
                      <td className={event.trustImpact > 0 ? styles.trustPositive : ''}>
                        {event.trustImpact > 0 ? `+${event.trustImpact.toFixed(2)}` : '—'}
                      </td>
                      <td className={styles.hashCell}>
                        <button
                          className={styles.copyButton}
                          onClick={() => {
                            navigator.clipboard.writeText(event.auditHash);
                            toast.success('Audit hash copied');
                          }}
                        >
                          {event.auditHash.slice(0, 10)}...
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* B6: Permissions & Roles */}
        {activeTab === 'members' && (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Team Members & Roles</h2>
              <Button variant="primary" size="sm">+ Invite Member</Button>
            </div>
            <p className={styles.panelDescription}>
              Owner, Operator, Observer, Auditor. Each role has view, mutation, and emergency permissions.
            </p>
            
            {/* Role Legend */}
            <div className={styles.roleLegend}>
              <div className={styles.roleInfo}>
                <RoleBadge role="owner" />
                <span>Full access, emergency controls</span>
              </div>
              <div className={styles.roleInfo}>
                <RoleBadge role="operator" />
                <span>Manage tasks & integrations</span>
              </div>
              <div className={styles.roleInfo}>
                <RoleBadge role="observer" />
                <span>View only</span>
              </div>
              <div className={styles.roleInfo}>
                <RoleBadge role="auditor" />
                <span>Logs & metrics access</span>
              </div>
            </div>
            
            <div className={styles.membersList}>
              {team.members.map(member => (
                <div key={member.id} className={styles.memberCard}>
                  <div className={styles.memberHeader}>
                    <div className={styles.memberAvatar}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.memberInfo}>
                      <h3 className={styles.memberName}>{member.name}</h3>
                      <span className={styles.memberEmail}>{member.email}</span>
                    </div>
                    <RoleBadge role={member.role} />
                  </div>
                  
                  <div className={styles.memberPermissions}>
                    <div className={styles.permissionGroup}>
                      <span className={styles.permissionLabel}>View:</span>
                      <span className={styles.permissionValue}>{member.permissions.view.join(', ')}</span>
                    </div>
                    <div className={styles.permissionGroup}>
                      <span className={styles.permissionLabel}>Mutate:</span>
                      <span className={styles.permissionValue}>
                        {member.permissions.mutate.length > 0 ? member.permissions.mutate.join(', ') : 'None'}
                      </span>
                    </div>
                    <div className={styles.permissionGroup}>
                      <span className={styles.permissionLabel}>Emergency:</span>
                      <span className={`${styles.permissionValue} ${member.permissions.emergency ? styles.hasEmergency : ''}`}>
                        {member.permissions.emergency ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.memberMeta}>
                    <span>Joined: {new Date(member.joinedAt).toLocaleDateString()}</span>
                    {member.role !== 'owner' && (
                      <Button variant="secondary" size="sm">Edit Role</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default TeamDashboard;
