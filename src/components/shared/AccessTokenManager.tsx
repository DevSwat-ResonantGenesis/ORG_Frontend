import React, { useState } from 'react';
import { Key, Plus, Search, Eye, EyeOff, Copy, Trash2, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Shield, User, Calendar, Settings } from 'lucide-react';

type TokenStatus = 'active' | 'expired' | 'revoked' | 'pending';
type TokenType = 'access' | 'refresh' | 'api_key' | 'oauth' | 'personal';
type TokenScope = 'read' | 'write' | 'admin' | 'full';

interface AccessToken {
  id: string;
  name: string;
  type: TokenType;
  status: TokenStatus;
  token?: string;
  maskedToken: string;
  scopes: TokenScope[];
  userId?: string;
  userName?: string;
  clientId?: string;
  clientName?: string;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  ipRestrictions?: string[];
  createdAt: Date;
}

interface AccessTokenManagerProps {
  tokens: AccessToken[];
  onCreateToken?: () => void;
  onViewToken?: (tokenId: string) => void;
  onRevokeToken?: (tokenId: string) => void;
  onRefreshToken?: (tokenId: string) => void;
  onDeleteToken?: (tokenId: string) => void;
  onCopyToken?: (token: string) => void;
  className?: string;
}

interface TokenRowProps {
  token: AccessToken;
  onView?: () => void;
  onRevoke?: () => void;
  onRefresh?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
}

const STATUS_CONFIG: Record<TokenStatus, {
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
  expired: {
    label: 'Expired',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
  revoked: {
    label: 'Revoked',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  pending: {
    label: 'Pending',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
};

const TYPE_CONFIG: Record<TokenType, {
  label: string;
  color: string;
}> = {
  access: { label: 'Access Token', color: '#3b82f6' },
  refresh: { label: 'Refresh Token', color: '#10b981' },
  api_key: { label: 'API Key', color: '#8b5cf6' },
  oauth: { label: 'OAuth', color: '#f59e0b' },
  personal: { label: 'Personal', color: '#ec4899' },
};

const SCOPE_CONFIG: Record<TokenScope, {
  label: string;
  color: string;
}> = {
  read: { label: 'Read', color: '#10b981' },
  write: { label: 'Write', color: '#f59e0b' },
  admin: { label: 'Admin', color: '#ef4444' },
  full: { label: 'Full Access', color: '#8b5cf6' },
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
  tableContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  tableTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
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
  tokenCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  tokenIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tokenInfo: {
    flex: 1,
    minWidth: 0,
  },
  tokenName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  tokenMasked: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
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
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  scopesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  scopeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  userAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.5625rem',
    fontWeight: '600',
    color: '#3b82f6',
  },
  expiryCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  expiryDate: {
    fontSize: '0.8125rem',
    color: '#e4e4e7',
  },
  expiryStatus: {
    fontSize: '0.6875rem',
  },
  usageCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  usageCount: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  lastUsed: {
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
  copyButton: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    color: '#3b82f6',
  },
  refreshButton: {
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    color: '#10b981',
  },
  revokeButton: {
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

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getExpiryStatus = (expiresAt?: Date): { text: string; color: string } => {
  if (!expiresAt) return { text: 'Never', color: '#888' };

  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  const days = Math.floor(diff / 86400000);

  if (diff < 0) return { text: 'Expired', color: '#ef4444' };
  if (days <= 7) return { text: `${days}d left`, color: '#f59e0b' };
  if (days <= 30) return { text: `${days}d left`, color: '#10b981' };
  return { text: formatDate(expiresAt), color: '#888' };
};

const TokenRow: React.FC<TokenRowProps> = ({
  token,
  onView,
  onRevoke,
  onRefresh,
  onDelete,
  onCopy,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const statusConfig = STATUS_CONFIG[token.status];
  const typeConfig = TYPE_CONFIG[token.type];
  const expiryStatus = getExpiryStatus(token.expiresAt);

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
        <div style={styles.tokenCell}>
          <div
            style={{
              ...styles.tokenIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Key size={18} />
          </div>
          <div style={styles.tokenInfo}>
            <div style={styles.tokenName}>{token.name}</div>
            <div style={styles.tokenMasked}>
              {showToken && token.token ? token.token : token.maskedToken}
            </div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.typeBadge, color: typeConfig.color }}>
          {typeConfig.label}
        </span>
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
        <div style={styles.scopesList}>
          {token.scopes.map((scope) => {
            const scopeConfig = SCOPE_CONFIG[scope];
            return (
              <span
                key={scope}
                style={{
                  ...styles.scopeBadge,
                  background: `${scopeConfig.color}20`,
                  color: scopeConfig.color,
                }}
              >
                {scopeConfig.label}
              </span>
            );
          })}
        </div>
      </td>
      <td style={styles.td}>
        {token.userName ? (
          <div style={styles.userCell}>
            <div style={styles.userAvatar}>
              {token.userName.charAt(0).toUpperCase()}
            </div>
            <span>{token.userName}</span>
          </div>
        ) : token.clientName ? (
          <span style={{ color: '#888' }}>{token.clientName}</span>
        ) : (
          <span style={{ color: '#888' }}>—</span>
        )}
      </td>
      <td style={styles.td}>
        <div style={styles.expiryCell}>
          <span style={styles.expiryDate}>
            {token.expiresAt ? formatDate(token.expiresAt) : 'Never'}
          </span>
          <span style={{ ...styles.expiryStatus, color: expiryStatus.color }}>
            {expiryStatus.text}
          </span>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.usageCell}>
          <span style={styles.usageCount}>{token.usageCount.toLocaleString()}</span>
          {token.lastUsed && (
            <span style={styles.lastUsed}>{formatTimeAgo(token.lastUsed)}</span>
          )}
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          <button
            style={styles.iconButton}
            onClick={() => setShowToken(!showToken)}
            title={showToken ? 'Hide' : 'Show'}
          >
            {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          {onCopy && token.token && (
            <button style={{ ...styles.iconButton, ...styles.copyButton }} onClick={onCopy} title="Copy">
              <Copy size={14} />
            </button>
          )}
          {onRefresh && token.status === 'active' && (
            <button style={{ ...styles.iconButton, ...styles.refreshButton }} onClick={onRefresh} title="Refresh">
              <RefreshCw size={14} />
            </button>
          )}
          {onRevoke && token.status === 'active' && (
            <button style={{ ...styles.iconButton, ...styles.revokeButton }} onClick={onRevoke} title="Revoke">
              <XCircle size={14} />
            </button>
          )}
          {onDelete && (
            <button style={{ ...styles.iconButton, ...styles.deleteButton }} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const AccessTokenManager: React.FC<AccessTokenManagerProps> = ({
  tokens,
  onCreateToken,
  onViewToken,
  onRevokeToken,
  onRefreshToken,
  onDeleteToken,
  onCopyToken,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TokenStatus | 'all'>('all');

  const filteredTokens = tokens.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(query) ||
        t.userName?.toLowerCase().includes(query) ||
        t.clientName?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const activeTokens = tokens.filter(t => t.status === 'active').length;
  const expiredTokens = tokens.filter(t => t.status === 'expired').length;
  const revokedTokens = tokens.filter(t => t.status === 'revoked').length;
  const totalUsage = tokens.reduce((sum, t) => sum + t.usageCount, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Key size={22} />
          Access Token Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search tokens..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateToken && (
            <button style={styles.createButton} onClick={onCreateToken}>
              <Plus size={14} />
              New Token
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
          <div style={styles.statValue}>{activeTokens}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={20} />
          </div>
          <div style={styles.statValue}>{expiredTokens}</div>
          <div style={styles.statLabel}>Expired</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <XCircle size={20} />
          </div>
          <div style={styles.statValue}>{revokedTokens}</div>
          <div style={styles.statLabel}>Revoked</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Shield size={20} />
          </div>
          <div style={styles.statValue}>{totalUsage.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Usage</div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Tokens ({filteredTokens.length})</span>
        </div>
        {filteredTokens.length === 0 ? (
          <div style={styles.empty}>
            <Key size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No tokens found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Token</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Scopes</th>
                <th style={styles.th}>Owner</th>
                <th style={styles.th}>Expires</th>
                <th style={styles.th}>Usage</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.map((token) => (
                <TokenRow
                  key={token.id}
                  token={token}
                  onView={onViewToken ? () => onViewToken(token.id) : undefined}
                  onRevoke={onRevokeToken ? () => onRevokeToken(token.id) : undefined}
                  onRefresh={onRefreshToken ? () => onRefreshToken(token.id) : undefined}
                  onDelete={onDeleteToken ? () => onDeleteToken(token.id) : undefined}
                  onCopy={onCopyToken && token.token ? () => onCopyToken(token.token!) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AccessTokenManager;
