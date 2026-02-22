import React, { useState } from 'react';
import { Plug, Plus, Settings, Trash2, MoreVertical, Search, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, ExternalLink, Link2, Unlink } from 'lucide-react';

type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';
type IntegrationCategory = 'llm' | 'storage' | 'auth' | 'analytics' | 'communication' | 'payment';

interface IntegrationData {
  id: string;
  name: string;
  description?: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  icon?: string;
  connectedAt?: Date;
  lastSync?: Date;
  config?: Record<string, unknown>;
  usageCount?: number;
  errorMessage?: string;
}

interface IntegrationManagementProps {
  integrations: IntegrationData[];
  onConnect?: (integrationId: string) => void;
  onDisconnect?: (integrationId: string) => void;
  onConfigure?: (integrationId: string) => void;
  onRefresh?: (integrationId: string) => void;
  onAddNew?: () => void;
  className?: string;
}

interface IntegrationCardProps {
  integration: IntegrationData;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConfigure?: () => void;
  onRefresh?: () => void;
}

const STATUS_CONFIG: Record<IntegrationStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  connected: {
    label: 'Connected',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  disconnected: {
    label: 'Disconnected',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <XCircle size={12} />,
  },
  error: {
    label: 'Error',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
};

const CATEGORY_CONFIG: Record<IntegrationCategory, {
  label: string;
  color: string;
}> = {
  llm: { label: 'LLM Provider', color: '#8b5cf6' },
  storage: { label: 'Storage', color: '#3b82f6' },
  auth: { label: 'Authentication', color: '#f59e0b' },
  analytics: { label: 'Analytics', color: '#10b981' },
  communication: { label: 'Communication', color: '#ec4899' },
  payment: { label: 'Payment', color: '#14b8a6' },
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
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1rem 1.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.15s',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  integrationIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    fontSize: '1.25rem',
  },
  integrationName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
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
  cardDescription: {
    fontSize: '0.8125rem',
    color: '#888',
    lineHeight: 1.5,
    marginBottom: '1rem',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#666',
    marginBottom: '1rem',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  actionButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonPrimary: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
  },
  actionButtonDanger: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#ef4444',
    marginBottom: '1rem',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#666',
  },
};

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

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConnect,
  onDisconnect,
  onConfigure,
  onRefresh,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[integration.status];
  const categoryConfig = CATEGORY_CONFIG[integration.category];

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.cardTitle}>
          <div style={styles.integrationIcon}>
            {integration.icon ? (
              <img src={integration.icon} alt={integration.name} style={{ width: '24px', height: '24px' }} />
            ) : (
              <Plug size={22} />
            )}
          </div>
          <div>
            <div style={styles.integrationName}>{integration.name}</div>
            <span style={{ ...styles.categoryBadge, color: categoryConfig.color }}>
              {categoryConfig.label}
            </span>
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

      {integration.description && (
        <p style={styles.cardDescription}>{integration.description}</p>
      )}

      {integration.status === 'error' && integration.errorMessage && (
        <div style={styles.errorMessage}>
          <AlertTriangle size={12} />
          {integration.errorMessage}
        </div>
      )}

      <div style={styles.cardMeta}>
        {integration.connectedAt && (
          <span>Connected {formatDate(integration.connectedAt)}</span>
        )}
        {integration.lastSync && (
          <span>Synced {formatDate(integration.lastSync)}</span>
        )}
        {integration.usageCount !== undefined && (
          <span>{integration.usageCount.toLocaleString()} uses</span>
        )}
      </div>

      <div style={styles.cardActions}>
        {integration.status === 'connected' ? (
          <>
            {onConfigure && (
              <button style={styles.actionButton} onClick={onConfigure}>
                <Settings size={14} />
                Configure
              </button>
            )}
            {onRefresh && (
              <button style={styles.actionButton} onClick={onRefresh}>
                <RefreshCw size={14} />
                Sync
              </button>
            )}
            {onDisconnect && (
              <button
                style={{ ...styles.actionButton, ...styles.actionButtonDanger }}
                onClick={onDisconnect}
              >
                <Unlink size={14} />
                Disconnect
              </button>
            )}
          </>
        ) : (
          <>
            {onConnect && (
              <button
                style={{ ...styles.actionButton, ...styles.actionButtonPrimary }}
                onClick={onConnect}
              >
                <Link2 size={14} />
                Connect
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const IntegrationManagement: React.FC<IntegrationManagementProps> = ({
  integrations,
  onConnect,
  onDisconnect,
  onConfigure,
  onRefresh,
  onAddNew,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all');

  const filteredIntegrations = integrations.filter(i => {
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        i.name.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Plug size={22} />
          Integrations
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search integrations..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onAddNew && (
            <button style={styles.addButton} onClick={onAddNew}>
              <Plus size={14} />
              Add Integration
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{integrations.length}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#10b981' }}>{connectedCount}</span>
          <span style={styles.statLabel}>Connected</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#ef4444' }}>{errorCount}</span>
          <span style={styles.statLabel}>Errors</span>
        </div>
      </div>

      {/* Grid */}
      {filteredIntegrations.length === 0 ? (
        <div style={styles.empty}>
          <Plug size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No integrations found</span>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={onConnect ? () => onConnect(integration.id) : undefined}
              onDisconnect={onDisconnect ? () => onDisconnect(integration.id) : undefined}
              onConfigure={onConfigure ? () => onConfigure(integration.id) : undefined}
              onRefresh={onRefresh ? () => onRefresh(integration.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IntegrationManagement;
