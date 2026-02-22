/**
 * Autonomous Agent Dashboard
 * 
 * Dashboard for monitoring and managing autonomous AI agents
 * Shows agent status, execution history, and control options
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Activity,
  Play,
  Pause,
  Square,
  RefreshCw,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Target,
  TrendingUp,
  Shield,
  Eye,
  MoreVertical,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';

interface AutonomousAgent {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped' | 'error';
  type: string;
  lastExecution: string;
  executionCount: number;
  successRate: number;
  currentTask?: string;
  trustScore: number;
  resourceUsage: {
    cpu: number;
    memory: number;
  };
}

interface ExecutionEvent {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  status: 'success' | 'failure' | 'pending';
  timestamp: string;
  duration: number;
}

const AutonomousAgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<AutonomousAgent[]>([]);
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'running' | 'paused' | 'stopped' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading agents
    const mockAgents: AutonomousAgent[] = [
      {
        id: '1',
        name: 'Data Processor Alpha',
        status: 'running',
        type: 'Data Processing',
        lastExecution: '2 minutes ago',
        executionCount: 1247,
        successRate: 99.2,
        currentTask: 'Processing batch #4521',
        trustScore: 95,
        resourceUsage: { cpu: 45, memory: 62 }
      },
      {
        id: '2',
        name: 'Customer Support Bot',
        status: 'running',
        type: 'Customer Service',
        lastExecution: '30 seconds ago',
        executionCount: 8934,
        successRate: 97.8,
        currentTask: 'Handling ticket #12847',
        trustScore: 92,
        resourceUsage: { cpu: 23, memory: 41 }
      },
      {
        id: '3',
        name: 'Analytics Engine',
        status: 'paused',
        type: 'Analytics',
        lastExecution: '1 hour ago',
        executionCount: 562,
        successRate: 98.5,
        trustScore: 88,
        resourceUsage: { cpu: 0, memory: 15 }
      },
      {
        id: '4',
        name: 'Security Monitor',
        status: 'running',
        type: 'Security',
        lastExecution: '5 seconds ago',
        executionCount: 45621,
        successRate: 99.9,
        currentTask: 'Scanning network traffic',
        trustScore: 99,
        resourceUsage: { cpu: 12, memory: 28 }
      },
      {
        id: '5',
        name: 'Content Generator',
        status: 'error',
        type: 'Content',
        lastExecution: '15 minutes ago',
        executionCount: 234,
        successRate: 85.3,
        trustScore: 75,
        resourceUsage: { cpu: 0, memory: 8 }
      }
    ];

    const mockEvents: ExecutionEvent[] = [
      { id: '1', agentId: '1', agentName: 'Data Processor Alpha', action: 'Processed 500 records', status: 'success', timestamp: '2 min ago', duration: 1.2 },
      { id: '2', agentId: '4', agentName: 'Security Monitor', action: 'Threat scan completed', status: 'success', timestamp: '5 sec ago', duration: 0.3 },
      { id: '3', agentId: '2', agentName: 'Customer Support Bot', action: 'Resolved ticket #12846', status: 'success', timestamp: '1 min ago', duration: 45.2 },
      { id: '4', agentId: '5', agentName: 'Content Generator', action: 'Failed to generate article', status: 'failure', timestamp: '15 min ago', duration: 12.5 },
      { id: '5', agentId: '1', agentName: 'Data Processor Alpha', action: 'Started batch #4521', status: 'pending', timestamp: 'now', duration: 0 }
    ];

    setTimeout(() => {
      setAgents(mockAgents);
      setEvents(mockEvents);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredAgents = agents.filter(agent => {
    const matchesFilter = filter === 'all' || agent.status === filter;
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agent.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#10b981';
      case 'paused': return '#f59e0b';
      case 'stopped': return '#6b7280';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity size={16} />;
      case 'paused': return <Pause size={16} />;
      case 'stopped': return <Square size={16} />;
      case 'error': return <AlertTriangle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const stats = {
    total: agents.length,
    running: agents.filter(a => a.status === 'running').length,
    paused: agents.filter(a => a.status === 'paused').length,
    errors: agents.filter(a => a.status === 'error').length,
    avgSuccessRate: agents.length > 0 
      ? (agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length).toFixed(1)
      : '0'
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    header: {
      marginBottom: '24px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#111827',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '4px'
    },
    statValue: {
      fontSize: '32px',
      fontWeight: 700,
      color: '#111827'
    },
    controls: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap' as const
    },
    searchInput: {
      flex: 1,
      minWidth: '200px',
      padding: '10px 16px',
      paddingLeft: '40px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '14px',
      outline: 'none'
    },
    filterButton: {
      padding: '10px 16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      background: '#fff',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    filterButtonActive: {
      background: '#3b82f6',
      color: '#fff',
      borderColor: '#3b82f6'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '24px'
    },
    agentList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px'
    },
    agentCard: {
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    agentCardSelected: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
    },
    agentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    agentName: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#111827',
      marginBottom: '4px'
    },
    agentType: {
      fontSize: '13px',
      color: '#6b7280'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500
    },
    agentStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginTop: '12px'
    },
    agentStat: {
      textAlign: 'center' as const
    },
    agentStatValue: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#111827'
    },
    agentStatLabel: {
      fontSize: '11px',
      color: '#6b7280',
      textTransform: 'uppercase' as const
    },
    currentTask: {
      marginTop: '12px',
      padding: '10px',
      background: '#f3f4f6',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'
    },
    sidebarCard: {
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    },
    sidebarTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#111827',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    eventList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px'
    },
    eventItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px',
      background: '#f9fafb',
      borderRadius: '8px'
    },
    eventIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    eventContent: {
      flex: 1,
      minWidth: 0
    },
    eventAction: {
      fontSize: '13px',
      fontWeight: 500,
      color: '#111827',
      marginBottom: '2px'
    },
    eventMeta: {
      fontSize: '12px',
      color: '#6b7280'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: '16px'
    },
    actionButton: {
      flex: 1,
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    primaryButton: {
      background: '#3b82f6',
      color: '#fff'
    },
    secondaryButton: {
      background: '#f3f4f6',
      color: '#374151'
    },
    resourceBar: {
      height: '6px',
      background: '#e5e7eb',
      borderRadius: '3px',
      overflow: 'hidden',
      marginTop: '4px'
    },
    resourceFill: {
      height: '100%',
      borderRadius: '3px',
      transition: 'width 0.3s'
    }
  };

  if (isLoading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading autonomous agents...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Bot size={32} color="#3b82f6" />
          Autonomous Agents
        </h1>
        <p style={styles.subtitle}>
          Monitor and manage your autonomous AI agents in real-time
        </p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Agents</div>
          <div style={styles.statValue}>{stats.total}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Running</div>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{stats.running}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Paused</div>
          <div style={{ ...styles.statValue, color: '#f59e0b' }}>{stats.paused}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Errors</div>
          <div style={{ ...styles.statValue, color: '#ef4444' }}>{stats.errors}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Avg Success Rate</div>
          <div style={styles.statValue}>{stats.avgSuccessRate}%</div>
        </div>
      </div>

      <div style={styles.controls}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        {(['all', 'running', 'paused', 'error'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterButton,
              ...(filter === f ? styles.filterButtonActive : {})
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.mainContent}>
        <div style={styles.agentList}>
          {filteredAgents.map(agent => (
            <div
              key={agent.id}
              style={{
                ...styles.agentCard,
                ...(selectedAgent === agent.id ? styles.agentCardSelected : {})
              }}
              onClick={() => setSelectedAgent(agent.id)}
            >
              <div style={styles.agentHeader}>
                <div>
                  <div style={styles.agentName}>{agent.name}</div>
                  <div style={styles.agentType}>{agent.type}</div>
                </div>
                <div
                  style={{
                    ...styles.statusBadge,
                    background: `${getStatusColor(agent.status)}20`,
                    color: getStatusColor(agent.status)
                  }}
                >
                  {getStatusIcon(agent.status)}
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </div>
              </div>

              <div style={styles.agentStats}>
                <div style={styles.agentStat}>
                  <div style={styles.agentStatValue}>{agent.executionCount.toLocaleString()}</div>
                  <div style={styles.agentStatLabel}>Executions</div>
                </div>
                <div style={styles.agentStat}>
                  <div style={styles.agentStatValue}>{agent.successRate}%</div>
                  <div style={styles.agentStatLabel}>Success</div>
                </div>
                <div style={styles.agentStat}>
                  <div style={styles.agentStatValue}>{agent.trustScore}</div>
                  <div style={styles.agentStatLabel}>Trust Score</div>
                </div>
              </div>

              {agent.currentTask && (
                <div style={styles.currentTask}>
                  <Zap size={14} color="#f59e0b" />
                  {agent.currentTask}
                </div>
              )}

              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  <span>CPU: {agent.resourceUsage.cpu}%</span>
                  <span>Memory: {agent.resourceUsage.memory}%</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ ...styles.resourceBar, flex: 1 }}>
                    <div style={{ ...styles.resourceFill, width: `${agent.resourceUsage.cpu}%`, background: '#3b82f6' }} />
                  </div>
                  <div style={{ ...styles.resourceBar, flex: 1 }}>
                    <div style={{ ...styles.resourceFill, width: `${agent.resourceUsage.memory}%`, background: '#8b5cf6' }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <div style={styles.sidebarTitle}>
              <Activity size={18} color="#3b82f6" />
              Recent Activity
            </div>
            <div style={styles.eventList}>
              {events.slice(0, 5).map(event => (
                <div key={event.id} style={styles.eventItem}>
                  <div
                    style={{
                      ...styles.eventIcon,
                      background: event.status === 'success' ? '#dcfce7' : event.status === 'failure' ? '#fee2e2' : '#fef3c7'
                    }}
                  >
                    {event.status === 'success' ? (
                      <CheckCircle size={16} color="#10b981" />
                    ) : event.status === 'failure' ? (
                      <AlertTriangle size={16} color="#ef4444" />
                    ) : (
                      <Clock size={16} color="#f59e0b" />
                    )}
                  </div>
                  <div style={styles.eventContent}>
                    <div style={styles.eventAction}>{event.action}</div>
                    <div style={styles.eventMeta}>
                      {event.agentName} • {event.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <div style={styles.sidebarTitle}>
              <Settings size={18} color="#6b7280" />
              Quick Actions
            </div>
            <div style={styles.actionButtons}>
              <button style={{ ...styles.actionButton, ...styles.primaryButton }}>
                <Play size={16} />
                Start All
              </button>
              <button style={{ ...styles.actionButton, ...styles.secondaryButton }}>
                <Pause size={16} />
                Pause All
              </button>
            </div>
            <div style={{ ...styles.actionButtons, marginTop: '8px' }}>
              <button
                style={{ ...styles.actionButton, ...styles.secondaryButton }}
                onClick={() => navigate('/control-plane/autonomy')}
              >
                <Eye size={16} />
                Autonomy Dashboard
              </button>
            </div>
          </div>

          <div style={styles.sidebarCard}>
            <div style={styles.sidebarTitle}>
              <Shield size={18} color="#10b981" />
              Trust Overview
            </div>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', fontWeight: 700, color: '#10b981' }}>
                {agents.length > 0 
                  ? Math.round(agents.reduce((sum, a) => sum + a.trustScore, 0) / agents.length)
                  : 0}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Average Trust Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomousAgentDashboard;
