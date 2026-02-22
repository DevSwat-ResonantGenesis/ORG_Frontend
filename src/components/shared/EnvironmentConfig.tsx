import React, { useState } from 'react';
import { Server, Plus, Edit2, Trash2, MoreVertical, Search, CheckCircle, AlertTriangle, Copy, Check, Eye, EyeOff, Lock, Globe, Database, Zap, Settings } from 'lucide-react';

type EnvironmentType = 'development' | 'staging' | 'production';
type VariableType = 'string' | 'number' | 'boolean' | 'secret' | 'url';

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  type: VariableType;
  description?: string;
  isSecret: boolean;
  isRequired: boolean;
  lastModified: Date;
}

interface EnvironmentData {
  id: string;
  name: string;
  type: EnvironmentType;
  url?: string;
  isActive: boolean;
  variables: EnvironmentVariable[];
  lastDeployed?: Date;
}

interface EnvironmentConfigProps {
  environments: EnvironmentData[];
  activeEnvironment?: string;
  onSwitchEnvironment?: (envId: string) => void;
  onAddVariable?: (envId: string) => void;
  onEditVariable?: (envId: string, varId: string) => void;
  onDeleteVariable?: (envId: string, varId: string) => void;
  onCreateEnvironment?: () => void;
  className?: string;
}

interface VariableRowProps {
  variable: EnvironmentVariable;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ENV_CONFIG: Record<EnvironmentType, {
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  development: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Settings size={16} />,
  },
  staging: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Database size={16} />,
  },
  production: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <Globe size={16} />,
  },
};

const TYPE_CONFIG: Record<VariableType, { label: string; color: string }> = {
  string: { label: 'String', color: '#888' },
  number: { label: 'Number', color: '#3b82f6' },
  boolean: { label: 'Boolean', color: '#8b5cf6' },
  secret: { label: 'Secret', color: '#ef4444' },
  url: { label: 'URL', color: '#10b981' },
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
  createButton: {
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
  envTabs: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  envTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  envTabActive: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
  },
  envIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  envInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  envName: {
    fontWeight: '600',
  },
  envUrl: {
    fontSize: '0.6875rem',
    color: '#666',
  },
  variablesSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  sectionTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  sectionActions: {
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
    width: '180px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(99, 102, 241, 0.15)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '8px',
    color: '#818cf8',
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
  keyCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  keyName: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: '500',
    color: '#fff',
  },
  requiredBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.5625rem',
    fontWeight: '600',
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
  valueCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  valueText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8125rem',
    color: '#888',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  secretValue: {
    letterSpacing: '0.1em',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
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
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const VariableRow: React.FC<VariableRowProps> = ({
  variable,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const [copied, setCopied] = useState(false);

  const typeConfig = TYPE_CONFIG[variable.type];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(variable.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const displayValue = variable.isSecret && !showValue
    ? '••••••••••••'
    : variable.value;

  return (
    <tr
      style={{
        ...styles.tr,
        ...(isHovered ? styles.trHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <td style={styles.td}>
        <div style={styles.keyCell}>
          <span style={styles.keyName}>{variable.key}</span>
          {variable.isRequired && (
            <span style={styles.requiredBadge}>Required</span>
          )}
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.valueCell}>
          <span
            style={{
              ...styles.valueText,
              ...(variable.isSecret && !showValue ? styles.secretValue : {}),
            }}
          >
            {displayValue}
          </span>
          {variable.isSecret && (
            <button
              style={styles.actionButton}
              onClick={() => setShowValue(!showValue)}
              title={showValue ? 'Hide' : 'Show'}
            >
              {showValue ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}
          <button
            style={styles.actionButton}
            onClick={handleCopy}
            title="Copy"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.typeBadge, color: typeConfig.color }}>
          {variable.isSecret && <Lock size={10} style={{ marginRight: '0.25rem' }} />}
          {typeConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {onEdit && (
            <button style={styles.actionButton} onClick={onEdit} title="Edit">
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && (
            <button style={styles.actionButton} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const EnvironmentConfig: React.FC<EnvironmentConfigProps> = ({
  environments,
  activeEnvironment,
  onSwitchEnvironment,
  onAddVariable,
  onEditVariable,
  onDeleteVariable,
  onCreateEnvironment,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const currentEnv = environments.find(e => e.id === activeEnvironment) || environments[0];

  const filteredVariables = currentEnv?.variables.filter(v =>
    v.key.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Server size={22} />
          Environment Configuration
        </h2>
        {onCreateEnvironment && (
          <button style={styles.createButton} onClick={onCreateEnvironment}>
            <Plus size={14} />
            New Environment
          </button>
        )}
      </div>

      {/* Environment Tabs */}
      <div style={styles.envTabs}>
        {environments.map((env) => {
          const config = ENV_CONFIG[env.type];
          const isActive = env.id === (activeEnvironment || environments[0]?.id);
          return (
            <button
              key={env.id}
              style={{
                ...styles.envTab,
                ...(isActive ? styles.envTabActive : {}),
              }}
              onClick={() => onSwitchEnvironment?.(env.id)}
            >
              <div
                style={{
                  ...styles.envIcon,
                  background: config.bgColor,
                  color: config.color,
                }}
              >
                {config.icon}
              </div>
              <div style={styles.envInfo}>
                <span style={styles.envName}>{env.name}</span>
                {env.url && <span style={styles.envUrl}>{env.url}</span>}
              </div>
              {env.isActive && (
                <CheckCircle size={14} style={{ color: '#10b981', marginLeft: '0.5rem' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Variables Section */}
      {currentEnv && (
        <div style={styles.variablesSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>
              Environment Variables ({currentEnv.variables.length})
            </span>
            <div style={styles.sectionActions}>
              <div style={styles.searchInput}>
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search variables..."
                  style={styles.input}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {onAddVariable && (
                <button
                  style={styles.addButton}
                  onClick={() => onAddVariable(currentEnv.id)}
                >
                  <Plus size={14} />
                  Add Variable
                </button>
              )}
            </div>
          </div>

          {filteredVariables.length === 0 ? (
            <div style={styles.empty}>
              <Zap size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <span>No variables found</span>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Key</th>
                  <th style={styles.th}>Value</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredVariables.map((variable) => (
                  <VariableRow
                    key={variable.id}
                    variable={variable}
                    onEdit={onEditVariable ? () => onEditVariable(currentEnv.id, variable.id) : undefined}
                    onDelete={onDeleteVariable ? () => onDeleteVariable(currentEnv.id, variable.id) : undefined}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default EnvironmentConfig;
