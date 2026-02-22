import React, { useState } from 'react';
import { Check, X, Settings, ExternalLink, RefreshCw, Zap, Link2, Unlink } from 'lucide-react';

type IntegrationStatus = 'connected' | 'disconnected' | 'pending' | 'error';
type IntegrationCategory = 'communication' | 'storage' | 'analytics' | 'development' | 'ai' | 'other';

interface IntegrationData {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  logo?: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  connectedAt?: Date;
  lastSync?: Date;
  features?: string[];
}

interface IntegrationCardProps {
  integration: IntegrationData;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onConfigure?: () => void;
  onSync?: () => void;
  className?: string;
}

interface IntegrationGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const STATUS_CONFIG: Record<IntegrationStatus, {
  color: string;
  bgColor: string;
  label: string;
}> = {
  connected: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    label: 'Connected',
  },
  disconnected: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    label: 'Not Connected',
  },
  pending: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    label: 'Pending',
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    label: 'Error',
  },
};

const CATEGORY_CONFIG: Record<IntegrationCategory, {
  color: string;
  label: string;
}> = {
  communication: { color: '#3b82f6', label: 'Communication' },
  storage: { color: '#10b981', label: 'Storage' },
  analytics: { color: '#f59e0b', label: 'Analytics' },
  development: { color: '#8b5cf6', label: 'Development' },
  ai: { color: '#ec4899', label: 'AI' },
  other: { color: '#888', label: 'Other' },
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.2s',
  },
  cardHover: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardConnected: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.875rem',
    marginBottom: '0.875rem',
  },
  logo: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    flexShrink: 0,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 0.25rem 0',
  },
  category: {
    fontSize: '0.6875rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    lineHeight: 1.4,
    marginBottom: '0.875rem',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  features: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    marginBottom: '0.875rem',
  },
  featureBadge: {
    padding: '0.25rem 0.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    color: '#888',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.875rem',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.25rem 0.625rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  syncInfo: {
    fontSize: '0.6875rem',
    color: '#666',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: 'auto',
    paddingTop: '0.875rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  connectButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '0.625rem 1rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  disconnectButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    padding: '0.625rem 1rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  grid: {
    display: 'grid',
    gap: '1rem',
  },
};

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConnect,
  onDisconnect,
  onConfigure,
  onSync,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  
  const statusConfig = STATUS_CONFIG[integration.status];
  const categoryConfig = CATEGORY_CONFIG[integration.category];
  const isConnected = integration.status === 'connected';

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
        ...(isConnected ? styles.cardConnected : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div style={styles.header}>
        <div style={styles.logo}>
          {integration.logo ? (
            <img
              src={integration.logo}
              alt={integration.name}
              style={styles.logoImage}
            />
          ) : integration.icon ? (
            integration.icon
          ) : (
            <Zap size={24} color="#888" />
          )}
        </div>
        <div style={styles.info}>
          <h3 style={styles.name}>{integration.name}</h3>
          <span style={{ ...styles.category, color: categoryConfig.color }}>
            {categoryConfig.label}
          </span>
        </div>
      </div>

      {integration.description && (
        <p style={styles.description}>{integration.description}</p>
      )}

      {integration.features && integration.features.length > 0 && (
        <div style={styles.features}>
          {integration.features.slice(0, 3).map((feature) => (
            <span key={feature} style={styles.featureBadge}>
              {feature}
            </span>
          ))}
        </div>
      )}

      <div style={styles.statusRow}>
        <span
          style={{
            ...styles.statusBadge,
            background: statusConfig.bgColor,
            color: statusConfig.color,
          }}
        >
          {isConnected ? <Check size={12} /> : <X size={12} />}
          {statusConfig.label}
        </span>
        {integration.lastSync && (
          <span style={styles.syncInfo}>
            Synced {formatDate(integration.lastSync)}
          </span>
        )}
      </div>

      <div style={styles.actions}>
        {isConnected ? (
          <>
            {onDisconnect && (
              <button style={styles.disconnectButton} onClick={onDisconnect}>
                <Unlink size={14} />
                Disconnect
              </button>
            )}
            {onSync && (
              <button
                style={{
                  ...styles.actionButton,
                  ...(hoveredAction === 'sync' ? styles.actionButtonHover : {}),
                }}
                onClick={onSync}
                onMouseEnter={() => setHoveredAction('sync')}
                onMouseLeave={() => setHoveredAction(null)}
                title="Sync now"
              >
                <RefreshCw size={16} />
              </button>
            )}
            {onConfigure && (
              <button
                style={{
                  ...styles.actionButton,
                  ...(hoveredAction === 'configure' ? styles.actionButtonHover : {}),
                }}
                onClick={onConfigure}
                onMouseEnter={() => setHoveredAction('configure')}
                onMouseLeave={() => setHoveredAction(null)}
                title="Configure"
              >
                <Settings size={16} />
              </button>
            )}
          </>
        ) : (
          onConnect && (
            <button style={styles.connectButton} onClick={onConnect}>
              <Link2 size={14} />
              Connect
            </button>
          )
        )}
      </div>
    </div>
  );
};

export const IntegrationGrid: React.FC<IntegrationGridProps> = ({
  children,
  columns = 3,
  className,
}) => (
  <div
    style={{
      ...styles.grid,
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
    }}
    className={className}
  >
    {children}
  </div>
);

// Compact integration list item
interface IntegrationListItemProps {
  integration: IntegrationData;
  onClick?: () => void;
  className?: string;
}

export const IntegrationListItem: React.FC<IntegrationListItemProps> = ({
  integration,
  onClick,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const statusConfig = STATUS_CONFIG[integration.status];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem',
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        background: isHovered ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
        transition: 'background 0.15s',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
        }}
      >
        {integration.logo ? (
          <img
            src={integration.logo}
            alt={integration.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <Zap size={16} color="#888" />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#fff' }}>
          {integration.name}
        </div>
      </div>
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: statusConfig.color,
        }}
      />
    </div>
  );
};

export default IntegrationCard;
