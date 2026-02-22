import React, { useState } from 'react';
import { Bot, Play, Pause, Trash2, Settings, MoreVertical, Search, Plus, Activity, Clock, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

type AgentStatus = 'running' | 'paused' | 'stopped' | 'error' | 'deploying';

interface AgentData {
  id: string;
  name: string;
  description?: string;
  status: AgentStatus;
  model: string;
  createdAt: Date;
  lastActive?: Date;
  totalSessions: number;
  totalTokens: number;
  avgResponseTime?: number;
  errorRate?: number;
  owner?: string;
}

interface AgentManagementTableProps {
  agents: AgentData[];
  onStartAgent?: (agentId: string) => void;
  onPauseAgent?: (agentId: string) => void;
  onDeleteAgent?: (agentId: string) => void;
  onConfigureAgent?: (agentId: string) => void;
  onViewLogs?: (agentId: string) => void;
  className?: string;
}

interface AgentRowProps {
  agent: AgentData;
  onStart?: () => void;
  onPause?: () => void;
  onDelete?: () => void;
  onConfigure?: () => void;
  onViewLogs?: () => void;
}

const STATUS_CONFIG: Record<AgentStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  running: {
    label: 'Running',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <Activity size={12} />,
  },
  paused: {
    label: 'Paused',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Pause size={12} />,
  },
  stopped: {
    label: 'Stopped',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
  error: {
    label: 'Error',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  deploying: {
    label: 'Deploying',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <RefreshCw size={12} />,
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  title: {
    fontSize: '1rem',
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
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.875rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  tr: {
    transition: 'background 0.15s',
  },
  trHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  td: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    fontSize: '0.875rem',
    color: '#e4e4e7',
  },
  agentCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  agentIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  agentName: {
    fontWeight: '500',
    color: '#fff',
  },
  agentModel: {
    fontSize: '0.75rem',
    color: '#888',
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
  metric: {
    display: 'flex',
    flexDirection: 'column',
  },
  metricValue: {
    fontWeight: '500',
    color: '#fff',
  },
  metricLabel: {
    fontSize: '0.6875rem',
    color: '#888',
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
    width: '32px',
    height: '32px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonHover: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '0.25rem',
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.375rem',
    minWidth: '160px',
    zIndex: 100,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#e4e4e7',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'background 0.15s',
    textAlign: 'left',
  },
  dropdownItemDanger: {
    color: '#ef4444',
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
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const AgentRow: React.FC<AgentRowProps> = ({
  agent,
  onStart,
  onPause,
  onDelete,
  onConfigure,
  onViewLogs,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = STATUS_CONFIG[agent.status];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <td style={styles.td}>
        <div style={styles.agentCell}>
          <div style={styles.agentIcon}>
            <Bot size={20} />
          </div>
          <div>
            <div style={styles.agentName}>{agent.name}</div>
            <div style={styles.agentModel}>{agent.model}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
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
      </td>
      <td style={styles.td}>
        <div style={styles.metric}>
          <span style={styles.metricValue}>{formatNumber(agent.totalSessions)}</span>
          <span style={styles.metricLabel}>sessions</span>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.metric}>
          <span style={styles.metricValue}>{formatNumber(agent.totalTokens)}</span>
          <span style={styles.metricLabel}>tokens</span>
        </div>
      </td>
      <td style={styles.td}>
        {agent.avgResponseTime ? `${agent.avgResponseTime}ms` : '-'}
      </td>
      <td style={styles.td}>
        {agent.lastActive ? formatDate(agent.lastActive) : 'Never'}
      </td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <div style={styles.actionButtons}>
          {agent.status === 'running' && onPause && (
            <button
              style={styles.actionButton}
              onClick={onPause}
              title="Pause"
            >
              <Pause size={14} />
            </button>
          )}
          {(agent.status === 'paused' || agent.status === 'stopped') && onStart && (
            <button
              style={styles.actionButton}
              onClick={onStart}
              title="Start"
            >
              <Play size={14} />
            </button>
          )}
          <button
            style={styles.actionButton}
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>
        </div>
        {showMenu && (
          <div style={styles.dropdown}>
            {onConfigure && (
              <button style={styles.dropdownItem} onClick={onConfigure}>
                <Settings size={14} />
                Configure
              </button>
            )}
            {onViewLogs && (
              <button style={styles.dropdownItem} onClick={onViewLogs}>
                <Activity size={14} />
                View Logs
              </button>
            )}
            {onDelete && (
              <button
                style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                onClick={onDelete}
              >
                <Trash2 size={14} />
                Delete Agent
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export const AgentManagementTable: React.FC<AgentManagementTableProps> = ({
  agents,
  onStartAgent,
  onPauseAgent,
  onDeleteAgent,
  onConfigureAgent,
  onViewLogs,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runningCount = agents.filter(a => a.status === 'running').length;

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div>
          <span style={styles.title}>Agent Management</span>
          <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#888' }}>
            {runningCount} of {agents.length} running
          </span>
        </div>
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
          <button style={styles.addButton}>
            <Plus size={14} />
            Create Agent
          </button>
        </div>
      </div>

      {filteredAgents.length === 0 ? (
        <div style={styles.empty}>
          <Bot size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No agents found</span>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Agent</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Sessions</th>
              <th style={styles.th}>Tokens</th>
              <th style={styles.th}>Avg Response</th>
              <th style={styles.th}>Last Active</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredAgents.map((agent) => (
              <AgentRow
                key={agent.id}
                agent={agent}
                onStart={onStartAgent ? () => onStartAgent(agent.id) : undefined}
                onPause={onPauseAgent ? () => onPauseAgent(agent.id) : undefined}
                onDelete={onDeleteAgent ? () => onDeleteAgent(agent.id) : undefined}
                onConfigure={onConfigureAgent ? () => onConfigureAgent(agent.id) : undefined}
                onViewLogs={onViewLogs ? () => onViewLogs(agent.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AgentManagementTable;
