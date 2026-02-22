import React, { useState } from 'react';
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff, Calendar, Shield, AlertTriangle, MoreVertical, RefreshCw } from 'lucide-react';

type KeyStatus = 'active' | 'expired' | 'revoked';
type KeyPermission = 'read' | 'write' | 'admin';

interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  status: KeyStatus;
  permissions: KeyPermission[];
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  usageCount: number;
  rateLimit?: number;
}

interface ApiKeyManagementProps {
  keys: ApiKeyData[];
  onCreateKey?: () => void;
  onRevokeKey?: (keyId: string) => void;
  onDeleteKey?: (keyId: string) => void;
  onRegenerateKey?: (keyId: string) => void;
  className?: string;
}

interface ApiKeyRowProps {
  apiKey: ApiKeyData;
  onRevoke?: () => void;
  onDelete?: () => void;
  onRegenerate?: () => void;
}

interface NewKeyModalProps {
  isOpen: boolean;
  newKey?: string;
  onClose: () => void;
}

const STATUS_CONFIG: Record<KeyStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  active: {
    label: 'Active',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  expired: {
    label: 'Expired',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  revoked: {
    label: 'Revoked',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
};

const PERMISSION_CONFIG: Record<KeyPermission, {
  label: string;
  color: string;
}> = {
  read: { label: 'Read', color: '#3b82f6' },
  write: { label: 'Write', color: '#f59e0b' },
  admin: { label: 'Admin', color: '#ef4444' },
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
    gap: '0.75rem',
  },
  keyIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#818cf8',
  },
  keyName: {
    fontWeight: '500',
    color: '#fff',
  },
  keyPrefix: {
    fontSize: '0.75rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  permissionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
    marginRight: '0.25rem',
    background: 'rgba(255, 255, 255, 0.05)',
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
  newKeyModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    maxWidth: '500px',
    width: '100%',
  },
  modalTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '1rem',
  },
  keyDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.875rem',
    color: '#10b981',
    marginBottom: '1rem',
  },
  warning: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(245, 158, 11, 0.15)',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    color: '#f59e0b',
    marginBottom: '1rem',
  },
  modalButton: {
    width: '100%',
    padding: '0.625rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const ApiKeyRow: React.FC<ApiKeyRowProps> = ({
  apiKey,
  onRevoke,
  onDelete,
  onRegenerate,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusConfig = STATUS_CONFIG[apiKey.status];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.keyPrefix + '...');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
        <div style={styles.keyCell}>
          <div style={styles.keyIcon}>
            <Key size={18} />
          </div>
          <div>
            <div style={styles.keyName}>{apiKey.name}</div>
            <div style={styles.keyPrefix}>{apiKey.keyPrefix}...</div>
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
          {statusConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        {apiKey.permissions.map((perm) => (
          <span
            key={perm}
            style={{
              ...styles.permissionBadge,
              color: PERMISSION_CONFIG[perm].color,
            }}
          >
            {PERMISSION_CONFIG[perm].label}
          </span>
        ))}
      </td>
      <td style={styles.td}>{formatNumber(apiKey.usageCount)}</td>
      <td style={styles.td}>
        {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
      </td>
      <td style={styles.td}>
        {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : 'Never'}
      </td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            style={styles.actionButton}
            onClick={handleCopy}
            title="Copy key prefix"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            style={styles.actionButton}
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={16} />
          </button>
        </div>
        {showMenu && (
          <div style={styles.dropdown}>
            {onRegenerate && apiKey.status === 'active' && (
              <button style={styles.dropdownItem} onClick={onRegenerate}>
                <RefreshCw size={14} />
                Regenerate
              </button>
            )}
            {onRevoke && apiKey.status === 'active' && (
              <button
                style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                onClick={onRevoke}
              >
                <Shield size={14} />
                Revoke
              </button>
            )}
            {onDelete && (
              <button
                style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                onClick={onDelete}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export const NewKeyModal: React.FC<NewKeyModalProps> = ({
  isOpen,
  newKey,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (newKey) {
      try {
        await navigator.clipboard.writeText(newKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div style={styles.newKeyModal} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.modalTitle}>API Key Created</h3>
        
        <div style={styles.keyDisplay}>
          <span style={{ flex: 1, wordBreak: 'break-all' }}>{newKey}</span>
          <button
            style={{ ...styles.actionButton, color: copied ? '#10b981' : '#888' }}
            onClick={handleCopy}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        <div style={styles.warning}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <span>
            Make sure to copy your API key now. You won't be able to see it again!
          </span>
        </div>

        <button style={styles.modalButton} onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};

export const ApiKeyManagement: React.FC<ApiKeyManagementProps> = ({
  keys,
  onCreateKey,
  onRevokeKey,
  onDeleteKey,
  onRegenerateKey,
  className,
}) => {
  const activeCount = keys.filter((k) => k.status === 'active').length;

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div>
          <span style={styles.title}>API Keys</span>
          <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: '#888' }}>
            {activeCount} active
          </span>
        </div>
        {onCreateKey && (
          <button style={styles.createButton} onClick={onCreateKey}>
            <Plus size={14} />
            Create Key
          </button>
        )}
      </div>

      {keys.length === 0 ? (
        <div style={styles.empty}>
          <Key size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No API keys created</span>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Permissions</th>
              <th style={styles.th}>Usage</th>
              <th style={styles.th}>Last Used</th>
              <th style={styles.th}>Expires</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <ApiKeyRow
                key={key.id}
                apiKey={key}
                onRevoke={onRevokeKey ? () => onRevokeKey(key.id) : undefined}
                onDelete={onDeleteKey ? () => onDeleteKey(key.id) : undefined}
                onRegenerate={onRegenerateKey ? () => onRegenerateKey(key.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ApiKeyManagement;
