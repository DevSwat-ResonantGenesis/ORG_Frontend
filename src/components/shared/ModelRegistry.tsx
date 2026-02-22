import React, { useState } from 'react';
import { Brain, Plus, Search, Settings, CheckCircle, AlertTriangle, Clock, Play, Pause, BarChart3, Zap, Server, Eye, Edit2, Trash2, RefreshCw, Download, Upload } from 'lucide-react';

type ModelStatus = 'active' | 'inactive' | 'training' | 'deprecated' | 'pending';
type ModelType = 'llm' | 'embedding' | 'classification' | 'generation' | 'custom';
type ModelProvider = 'openai' | 'anthropic' | 'google' | 'custom' | 'local';

interface ModelMetrics {
  requests: number;
  avgLatency: number;
  errorRate: number;
  tokensUsed: number;
}

interface ModelVersion {
  version: string;
  createdAt: Date;
  isActive: boolean;
}

interface ModelData {
  id: string;
  name: string;
  displayName: string;
  type: ModelType;
  provider: ModelProvider;
  status: ModelStatus;
  description?: string;
  contextWindow: number;
  maxTokens: number;
  costPerToken: number;
  metrics: ModelMetrics;
  versions: ModelVersion[];
  createdAt: Date;
  updatedAt: Date;
}

interface ModelRegistryProps {
  models: ModelData[];
  onCreateModel?: () => void;
  onViewModel?: (modelId: string) => void;
  onEditModel?: (modelId: string) => void;
  onToggleModel?: (modelId: string) => void;
  onDeleteModel?: (modelId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface ModelCardProps {
  model: ModelData;
  onView?: () => void;
  onEdit?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<ModelStatus, {
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
  training: {
    label: 'Training',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <RefreshCw size={12} />,
  },
  deprecated: {
    label: 'Deprecated',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  pending: {
    label: 'Pending',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
};

const TYPE_CONFIG: Record<ModelType, {
  label: string;
  color: string;
}> = {
  llm: { label: 'LLM', color: '#8b5cf6' },
  embedding: { label: 'Embedding', color: '#3b82f6' },
  classification: { label: 'Classification', color: '#10b981' },
  generation: { label: 'Generation', color: '#f59e0b' },
  custom: { label: 'Custom', color: '#ec4899' },
};

const PROVIDER_CONFIG: Record<ModelProvider, {
  label: string;
  color: string;
}> = {
  openai: { label: 'OpenAI', color: '#10b981' },
  anthropic: { label: 'Anthropic', color: '#f59e0b' },
  google: { label: 'Google', color: '#3b82f6' },
  custom: { label: 'Custom', color: '#8b5cf6' },
  local: { label: 'Local', color: '#888' },
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
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
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
  modelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  },
  modelCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  modelCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  modelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  modelTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  modelIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  modelMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  providerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '700',
    textTransform: 'uppercase',
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
  modelBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  specsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  specItem: {
    textAlign: 'center',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
  },
  specValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  specLabel: {
    fontSize: '0.5625rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
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
  modelFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  versionBadge: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
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
  toggleButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
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
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatContextWindow = (tokens: number): string => {
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`;
  return tokens.toString();
};

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  onView,
  onEdit,
  onToggle,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[model.status];
  const typeConfig = TYPE_CONFIG[model.type];
  const providerConfig = PROVIDER_CONFIG[model.provider];
  const activeVersion = model.versions.find(v => v.isActive);

  return (
    <div
      style={{
        ...styles.modelCard,
        ...(isHovered ? styles.modelCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.modelHeader}>
        <div style={styles.modelTitle}>
          <div
            style={{
              ...styles.modelIcon,
              background: `${typeConfig.color}20`,
              color: typeConfig.color,
            }}
          >
            <Brain size={22} />
          </div>
          <div style={styles.modelInfo}>
            <div style={styles.modelName}>{model.displayName}</div>
            <div style={styles.modelMeta}>
              <span style={{ ...styles.typeBadge, color: typeConfig.color }}>
                {typeConfig.label}
              </span>
              <span
                style={{
                  ...styles.providerBadge,
                  background: `${providerConfig.color}20`,
                  color: providerConfig.color,
                }}
              >
                {providerConfig.label}
              </span>
            </div>
          </div>
        </div>
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
      </div>

      <div style={styles.modelBody}>
        {model.description && (
          <p style={styles.description}>{model.description}</p>
        )}

        <div style={styles.specsGrid}>
          <div style={styles.specItem}>
            <div style={styles.specValue}>{formatContextWindow(model.contextWindow)}</div>
            <div style={styles.specLabel}>Context</div>
          </div>
          <div style={styles.specItem}>
            <div style={styles.specValue}>{formatContextWindow(model.maxTokens)}</div>
            <div style={styles.specLabel}>Max Tokens</div>
          </div>
          <div style={styles.specItem}>
            <div style={styles.specValue}>${model.costPerToken.toFixed(4)}</div>
            <div style={styles.specLabel}>Per Token</div>
          </div>
        </div>

        <div style={styles.metricsGrid}>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Requests</span>
            <span style={styles.metricValue}>{formatNumber(model.metrics.requests)}</span>
          </div>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Latency</span>
            <span style={styles.metricValue}>{model.metrics.avgLatency}ms</span>
          </div>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Error Rate</span>
            <span style={{ ...styles.metricValue, color: model.metrics.errorRate > 1 ? '#ef4444' : '#10b981' }}>
              {model.metrics.errorRate.toFixed(2)}%
            </span>
          </div>
          <div style={styles.metricItem}>
            <span style={styles.metricLabel}>Tokens Used</span>
            <span style={styles.metricValue}>{formatNumber(model.metrics.tokensUsed)}</span>
          </div>
        </div>
      </div>

      <div style={styles.modelFooter}>
        <span style={styles.versionBadge}>
          v{activeVersion?.version || '1.0.0'}
        </span>
        <div style={styles.actionButtons}>
          {onToggle && model.status !== 'training' && (
            <button
              style={{
                ...styles.actionButton,
                ...(model.status === 'active' ? {} : styles.toggleButton),
              }}
              onClick={onToggle}
              title={model.status === 'active' ? 'Deactivate' : 'Activate'}
            >
              {model.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
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

export const ModelRegistry: React.FC<ModelRegistryProps> = ({
  models,
  onCreateModel,
  onViewModel,
  onEditModel,
  onToggleModel,
  onDeleteModel,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ModelType | 'all'>('all');

  const filteredModels = models.filter(m => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(query) ||
        m.displayName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const activeModels = models.filter(m => m.status === 'active').length;
  const totalRequests = models.reduce((sum, m) => sum + m.metrics.requests, 0);
  const totalTokens = models.reduce((sum, m) => sum + m.metrics.tokensUsed, 0);
  const avgLatency = models.length > 0
    ? models.reduce((sum, m) => sum + m.metrics.avgLatency, 0) / models.length
    : 0;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Brain size={22} />
          Model Registry
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search models..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onRefresh && (
            <button style={styles.refreshButton} onClick={onRefresh}>
              <RefreshCw size={14} />
            </button>
          )}
          {onCreateModel && (
            <button style={styles.createButton} onClick={onCreateModel}>
              <Plus size={14} />
              Add Model
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Brain size={20} />
          </div>
          <div style={styles.statValue}>{activeModels}</div>
          <div style={styles.statLabel}>Active Models</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Zap size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalRequests)}</div>
          <div style={styles.statLabel}>Total Requests</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalTokens)}</div>
          <div style={styles.statLabel}>Tokens Used</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{avgLatency.toFixed(0)}ms</div>
          <div style={styles.statLabel}>Avg Latency</div>
        </div>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div style={styles.empty}>
          <Brain size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No models found</span>
        </div>
      ) : (
        <div style={styles.modelsGrid}>
          {filteredModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onView={onViewModel ? () => onViewModel(model.id) : undefined}
              onEdit={onEditModel ? () => onEditModel(model.id) : undefined}
              onToggle={onToggleModel ? () => onToggleModel(model.id) : undefined}
              onDelete={onDeleteModel ? () => onDeleteModel(model.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelRegistry;
