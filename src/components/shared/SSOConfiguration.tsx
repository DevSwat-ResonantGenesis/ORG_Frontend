import React, { useState } from 'react';
import { Shield, Plus, Search, Settings, Eye, Edit2, Trash2, CheckCircle, XCircle, AlertTriangle, Clock, Link, ExternalLink, Users, Key, RefreshCw, Play, Pause } from 'lucide-react';

type SSOProviderType = 'saml' | 'oidc' | 'oauth2' | 'ldap' | 'azure_ad' | 'google' | 'okta';
type SSOStatus = 'active' | 'inactive' | 'pending' | 'error';

interface SSOProvider {
  id: string;
  name: string;
  type: SSOProviderType;
  status: SSOStatus;
  domain?: string;
  clientId?: string;
  issuerUrl?: string;
  metadataUrl?: string;
  userCount: number;
  lastSync?: Date;
  autoProvision: boolean;
  defaultRole?: string;
  attributeMapping?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

interface SSOConfigurationProps {
  providers: SSOProvider[];
  onCreateProvider?: () => void;
  onViewProvider?: (providerId: string) => void;
  onEditProvider?: (providerId: string) => void;
  onToggleProvider?: (providerId: string) => void;
  onDeleteProvider?: (providerId: string) => void;
  onSyncProvider?: (providerId: string) => void;
  onTestProvider?: (providerId: string) => void;
  className?: string;
}

interface ProviderCardProps {
  provider: SSOProvider;
  onView?: () => void;
  onEdit?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  onSync?: () => void;
  onTest?: () => void;
}

const STATUS_CONFIG: Record<SSOStatus, {
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
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
  error: {
    label: 'Error',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
};

const PROVIDER_TYPE_CONFIG: Record<SSOProviderType, {
  label: string;
  color: string;
  icon: string;
}> = {
  saml: { label: 'SAML 2.0', color: '#3b82f6', icon: '🔐' },
  oidc: { label: 'OpenID Connect', color: '#10b981', icon: '🔑' },
  oauth2: { label: 'OAuth 2.0', color: '#8b5cf6', icon: '🔒' },
  ldap: { label: 'LDAP', color: '#f59e0b', icon: '📁' },
  azure_ad: { label: 'Azure AD', color: '#0078d4', icon: '☁️' },
  google: { label: 'Google Workspace', color: '#4285f4', icon: '🔵' },
  okta: { label: 'Okta', color: '#007dc1', icon: '🔷' },
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
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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
  providersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '1rem',
  },
  providerCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  providerCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  providerCardActive: {
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  providerHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  providerTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  providerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '1.5rem',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  providerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
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
  providerBody: {
    padding: '1.25rem',
  },
  configSection: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  configList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  configItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem 0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '6px',
  },
  configLabel: {
    fontSize: '0.75rem',
    color: '#888',
  },
  configValue: {
    fontSize: '0.75rem',
    color: '#e4e4e7',
    fontFamily: "'JetBrains Mono', monospace",
    maxWidth: '180px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  featuresList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  featureBadge: {
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
  featureEnabled: {
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
  },
  providerFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  footerMeta: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  iconButton: {
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
  syncButton: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
  },
  testButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  toggleButton: {
    background: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    color: '#f59e0b',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
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

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onView,
  onEdit,
  onToggle,
  onDelete,
  onSync,
  onTest,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[provider.status];
  const typeConfig = PROVIDER_TYPE_CONFIG[provider.type];

  return (
    <div
      style={{
        ...styles.providerCard,
        ...(isHovered ? styles.providerCardHover : {}),
        ...(provider.status === 'active' ? styles.providerCardActive : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.providerHeader}>
        <div style={styles.providerTitle}>
          <div
            style={{
              ...styles.providerIcon,
              background: `${typeConfig.color}20`,
            }}
          >
            {typeConfig.icon}
          </div>
          <div style={styles.providerInfo}>
            <div style={styles.providerName}>{provider.name}</div>
            <div style={styles.providerMeta}>
              <span
                style={{
                  ...styles.typeBadge,
                  background: `${typeConfig.color}20`,
                  color: typeConfig.color,
                }}
              >
                {typeConfig.label}
              </span>
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
          </div>
        </div>
      </div>

      <div style={styles.providerBody}>
        <div style={styles.configSection}>
          <div style={styles.sectionTitle}>Configuration</div>
          <div style={styles.configList}>
            {provider.domain && (
              <div style={styles.configItem}>
                <span style={styles.configLabel}>Domain</span>
                <span style={styles.configValue}>{provider.domain}</span>
              </div>
            )}
            {provider.issuerUrl && (
              <div style={styles.configItem}>
                <span style={styles.configLabel}>Issuer URL</span>
                <span style={styles.configValue}>{provider.issuerUrl}</span>
              </div>
            )}
            {provider.clientId && (
              <div style={styles.configItem}>
                <span style={styles.configLabel}>Client ID</span>
                <span style={styles.configValue}>{provider.clientId}</span>
              </div>
            )}
          </div>
        </div>

        <div style={styles.statsRow}>
          <span style={styles.statItem}>
            <Users size={12} />
            {provider.userCount.toLocaleString()} users
          </span>
          {provider.lastSync && (
            <span style={styles.statItem}>
              <RefreshCw size={12} />
              Synced {formatTimeAgo(provider.lastSync)}
            </span>
          )}
        </div>

        <div style={styles.featuresList}>
          <span
            style={{
              ...styles.featureBadge,
              ...(provider.autoProvision ? styles.featureEnabled : {}),
            }}
          >
            <CheckCircle size={10} />
            Auto Provision
          </span>
          {provider.defaultRole && (
            <span style={styles.featureBadge}>
              Default: {provider.defaultRole}
            </span>
          )}
        </div>
      </div>

      <div style={styles.providerFooter}>
        <span style={styles.footerMeta}>Updated {formatTimeAgo(provider.updatedAt)}</span>
        <div style={styles.actionButtons}>
          {onSync && provider.status === 'active' && (
            <button style={{ ...styles.iconButton, ...styles.syncButton }} onClick={onSync} title="Sync Users">
              <RefreshCw size={14} />
            </button>
          )}
          {onTest && (
            <button style={{ ...styles.iconButton, ...styles.testButton }} onClick={onTest} title="Test Connection">
              <Play size={14} />
            </button>
          )}
          {onToggle && (
            <button
              style={{
                ...styles.iconButton,
                ...(provider.status === 'active' ? styles.toggleButton : styles.testButton),
              }}
              onClick={onToggle}
              title={provider.status === 'active' ? 'Disable' : 'Enable'}
            >
              {provider.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={styles.iconButton} onClick={onEdit} title="Edit">
              <Settings size={14} />
            </button>
          )}
          {onDelete && (
            <button style={{ ...styles.iconButton, ...styles.deleteButton }} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const SSOConfiguration: React.FC<SSOConfigurationProps> = ({
  providers,
  onCreateProvider,
  onViewProvider,
  onEditProvider,
  onToggleProvider,
  onDeleteProvider,
  onSyncProvider,
  onTestProvider,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProviders = providers.filter(p => p.status === 'active').length;
  const totalUsers = providers.reduce((sum, p) => sum + p.userCount, 0);
  const errorProviders = providers.filter(p => p.status === 'error').length;
  const autoProvisionEnabled = providers.filter(p => p.autoProvision).length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Shield size={22} />
          SSO Configuration
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search providers..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateProvider && (
            <button style={styles.createButton} onClick={onCreateProvider}>
              <Plus size={14} />
              Add Provider
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{activeProviders}</div>
          <div style={styles.statLabel}>Active Providers</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Users size={20} />
          </div>
          <div style={styles.statValue}>{totalUsers.toLocaleString()}</div>
          <div style={styles.statLabel}>SSO Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Key size={20} />
          </div>
          <div style={styles.statValue}>{autoProvisionEnabled}</div>
          <div style={styles.statLabel}>Auto Provision</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{errorProviders}</div>
          <div style={styles.statLabel}>Errors</div>
        </div>
      </div>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <div style={styles.empty}>
          <Shield size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No SSO providers found</span>
        </div>
      ) : (
        <div style={styles.providersGrid}>
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onView={onViewProvider ? () => onViewProvider(provider.id) : undefined}
              onEdit={onEditProvider ? () => onEditProvider(provider.id) : undefined}
              onToggle={onToggleProvider ? () => onToggleProvider(provider.id) : undefined}
              onDelete={onDeleteProvider ? () => onDeleteProvider(provider.id) : undefined}
              onSync={onSyncProvider ? () => onSyncProvider(provider.id) : undefined}
              onTest={onTestProvider ? () => onTestProvider(provider.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SSOConfiguration;
