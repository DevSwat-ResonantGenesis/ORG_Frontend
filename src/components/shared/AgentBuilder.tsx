import React, { useState } from 'react';
import { Bot, Plus, Search, Settings, Zap, Brain, MessageSquare, Code, Eye, Edit2, Trash2, Play, Pause, Copy, Save, ChevronRight, ChevronDown, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

type AgentStatus = 'active' | 'inactive' | 'draft' | 'testing';
type AgentCapability = 'chat' | 'code' | 'analysis' | 'search' | 'custom';
type ToolType = 'function' | 'api' | 'database' | 'file' | 'web';

interface AgentTool {
  id: string;
  name: string;
  type: ToolType;
  description: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

interface AgentConfig {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  status: AgentStatus;
  capabilities: AgentCapability[];
  modelId: string;
  modelName: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: AgentTool[];
  version: string;
  createdAt: Date;
  updatedAt: Date;
  deployedAt?: Date;
  metrics?: {
    conversations: number;
    avgRating: number;
    avgLatency: number;
  };
}

interface AgentBuilderProps {
  agents: AgentConfig[];
  onCreateAgent?: () => void;
  onViewAgent?: (agentId: string) => void;
  onEditAgent?: (agentId: string) => void;
  onCloneAgent?: (agentId: string) => void;
  onToggleAgent?: (agentId: string) => void;
  onDeleteAgent?: (agentId: string) => void;
  onTestAgent?: (agentId: string) => void;
  className?: string;
}

interface AgentCardProps {
  agent: AgentConfig;
  onView?: () => void;
  onEdit?: () => void;
  onClone?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  onTest?: () => void;
}

const STATUS_CONFIG: Record<AgentStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  active: {
    label: 'Active',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  inactive: {
    label: 'Inactive',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Pause size={12} />,
  },
  draft: {
    label: 'Draft',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Edit2 size={12} />,
  },
  testing: {
    label: 'Testing',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Play size={12} />,
  },
};

const CAPABILITY_CONFIG: Record<AgentCapability, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  chat: { label: 'Chat', icon: <MessageSquare size={12} />, color: '#3b82f6' },
  code: { label: 'Code', icon: <Code size={12} />, color: '#10b981' },
  analysis: { label: 'Analysis', icon: <Brain size={12} />, color: '#8b5cf6' },
  search: { label: 'Search', icon: <Search size={12} />, color: '#f59e0b' },
  custom: { label: 'Custom', icon: <Zap size={12} />, color: '#ec4899' },
};

const TOOL_TYPE_CONFIG: Record<ToolType, { label: string; color: string }> = {
  function: { label: 'Function', color: '#3b82f6' },
  api: { label: 'API', color: '#10b981' },
  database: { label: 'Database', color: '#8b5cf6' },
  file: { label: 'File', color: '#f59e0b' },
  web: { label: 'Web', color: '#ec4899' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  searchInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
  },
  input: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#fff',
    fontSize: '0.8125rem',
    width: '200px',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  statIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  agentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '1rem',
  },
  agentCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  agentCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  agentHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  agentTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  agentIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  agentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  versionBadge: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  agentBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  capabilitiesSection: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  capabilitiesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  capabilityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
  },
  configSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  configItem: {
    textAlign: 'center',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
  },
  configValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  configLabel: {
    fontSize: '0.5625rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  toolsSection: {
    marginBottom: '1rem',
  },
  toolsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  toolBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  metricsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
  },
  metricItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
  },
  metricLabel: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  metricValue: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#e4e4e7',
  },
  agentFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  modelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(139, 92, 246, 0.15)',
    color: '#a78bfa',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  testButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  toggleButton: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatNumber = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onView,
  onEdit,
  onClone,
  onToggle,
  onDelete,
  onTest,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[agent.status];
  const enabledTools = agent.tools.filter(t => t.enabled);

  return (
    <div
      style={{
        ...styles.agentCard,
        ...(isHovered ? styles.agentCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.agentHeader}>
        <div style={styles.agentTitle}>
          <div
            style={{
              ...styles.agentIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Bot size={24} />
          </div>
          <div style={styles.agentInfo}>
            <div style={styles.agentName}>{agent.displayName}</div>
            <div style={styles.agentMeta}>
              <span
                style={{
                  ...styles.statusBadge,
                  background: statusConfig.bgColor,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.icon}
                {statusConfig.label}
              </span>
              <span style={styles.versionBadge}>v{agent.version}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.agentBody}>
        {agent.description && (
          <p style={styles.description}>{agent.description}</p>
        )}

        <div style={styles.capabilitiesSection}>
          <div style={styles.sectionTitle}>Capabilities</div>
          <div style={styles.capabilitiesList}>
            {agent.capabilities.map((cap) => {
              const config = CAPABILITY_CONFIG[cap];
              return (
                <span
                  key={cap}
                  style={{
                    ...styles.capabilityBadge,
                    background: `${config.color}20`,
                    color: config.color,
                  }}
                >
                  {config.icon}
                  {config.label}
                </span>
              );
            })}
          </div>
        </div>

        <div style={styles.configSection}>
          <div style={styles.configItem}>
            <div style={styles.configValue}>{agent.temperature}</div>
            <div style={styles.configLabel}>Temperature</div>
          </div>
          <div style={styles.configItem}>
            <div style={styles.configValue}>{formatNumber(agent.maxTokens)}</div>
            <div style={styles.configLabel}>Max Tokens</div>
          </div>
          <div style={styles.configItem}>
            <div style={styles.configValue}>{enabledTools.length}</div>
            <div style={styles.configLabel}>Tools</div>
          </div>
        </div>

        {enabledTools.length > 0 && (
          <div style={styles.toolsSection}>
            <div style={styles.sectionTitle}>Tools ({enabledTools.length})</div>
            <div style={styles.toolsList}>
              {enabledTools.slice(0, 4).map((tool) => {
                const typeConfig = TOOL_TYPE_CONFIG[tool.type];
                return (
                  <span key={tool.id} style={{ ...styles.toolBadge, color: typeConfig.color }}>
                    {tool.name}
                  </span>
                );
              })}
              {enabledTools.length > 4 && (
                <span style={styles.toolBadge}>+{enabledTools.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {agent.metrics && (
          <div style={styles.metricsSection}>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Chats</span>
              <span style={styles.metricValue}>{formatNumber(agent.metrics.conversations)}</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Rating</span>
              <span style={styles.metricValue}>{agent.metrics.avgRating.toFixed(1)}⭐</span>
            </div>
            <div style={styles.metricItem}>
              <span style={styles.metricLabel}>Latency</span>
              <span style={styles.metricValue}>{agent.metrics.avgLatency}ms</span>
            </div>
          </div>
        )}
      </div>

      <div style={styles.agentFooter}>
        <span style={styles.modelBadge}>
          <Brain size={12} />
          {agent.modelName}
        </span>
        <div style={styles.actionButtons}>
          {onTest && agent.status !== 'active' && (
            <button style={{ ...styles.actionButton, ...styles.testButton }} onClick={onTest} title="Test">
              <Play size={14} />
            </button>
          )}
          {onToggle && (
            <button
              style={{
                ...styles.actionButton,
                ...(agent.status === 'active' ? {} : styles.toggleButton),
              }}
              onClick={onToggle}
              title={agent.status === 'active' ? 'Deactivate' : 'Activate'}
            >
              {agent.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
            </button>
          )}
          {onClone && (
            <button style={styles.actionButton} onClick={onClone} title="Clone">
              <Copy size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.actionButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={styles.actionButton} onClick={onEdit} title="Edit">
              <Settings size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const AgentBuilder: React.FC<AgentBuilderProps> = ({
  agents,
  onCreateAgent,
  onViewAgent,
  onEditAgent,
  onCloneAgent,
  onToggleAgent,
  onDeleteAgent,
  onTestAgent,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');

  const filteredAgents = agents.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(query) ||
        a.displayName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const activeAgents = agents.filter(a => a.status === 'active').length;
  const draftAgents = agents.filter(a => a.status === 'draft').length;
  const totalConversations = agents.reduce((sum, a) => sum + (a.metrics?.conversations || 0), 0);
  const avgRating = agents.length > 0
    ? agents.reduce((sum, a) => sum + (a.metrics?.avgRating || 0), 0) / agents.filter(a => a.metrics).length
    : 0;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Bot size={22} />
          Agent Builder
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search agents..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateAgent && (
            <button style={styles.createButton} onClick={onCreateAgent}>
              <Plus size={14} />
              Create Agent
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Bot size={20} />
          </div>
          <div style={styles.statValue}>{activeAgents}</div>
          <div style={styles.statLabel}>Active Agents</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Edit2 size={20} />
          </div>
          <div style={styles.statValue}>{draftAgents}</div>
          <div style={styles.statLabel}>Drafts</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <MessageSquare size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalConversations)}</div>
          <div style={styles.statLabel}>Conversations</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Zap size={20} />
          </div>
          <div style={styles.statValue}>{avgRating.toFixed(1)}⭐</div>
          <div style={styles.statLabel}>Avg Rating</div>
        </div>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <div style={styles.empty}>
          <Bot size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No agents found</span>
        </div>
      ) : (
        <div style={styles.agentsGrid}>
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onView={onViewAgent ? () => onViewAgent(agent.id) : undefined}
              onEdit={onEditAgent ? () => onEditAgent(agent.id) : undefined}
              onClone={onCloneAgent ? () => onCloneAgent(agent.id) : undefined}
              onToggle={onToggleAgent ? () => onToggleAgent(agent.id) : undefined}
              onDelete={onDeleteAgent ? () => onDeleteAgent(agent.id) : undefined}
              onTest={onTestAgent ? () => onTestAgent(agent.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentBuilder;
