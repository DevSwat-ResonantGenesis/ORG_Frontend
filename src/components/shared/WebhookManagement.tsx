import React, { useState } from 'react';
import { Webhook, Plus, Trash2, Edit2, Play, Pause, MoreVertical, Search, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';

type WebhookStatus = 'active' | 'paused' | 'failing' | 'disabled';

interface WebhookEvent {
  id: string;
  name: string;
  description?: string;
}

interface WebhookData {
  id: string;
  name: string;
  url: string;
  status: WebhookStatus;
  events: string[];
  secret?: string;
  createdAt: Date;
  lastTriggered?: Date;
  successRate?: number;
  totalDeliveries: number;
  failedDeliveries: number;
}

interface WebhookManagementProps {
  webhooks: WebhookData[];
  availableEvents: WebhookEvent[];
  onCreateWebhook?: () => void;
  onEditWebhook?: (webhookId: string) => void;
  onDeleteWebhook?: (webhookId: string) => void;
  onToggleWebhook?: (webhookId: string, enabled: boolean) => void;
  onTestWebhook?: (webhookId: string) => void;
  className?: string;
}

interface WebhookRowProps {
  webhook: WebhookData;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: (enabled: boolean) => void;
  onTest?: () => void;
}

const STATUS_CONFIG: Record<WebhookStatus, {
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
  paused: {
    label: 'Paused',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Pause size={12} />,
  },
  failing: {
    label: 'Failing',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  disabled: {
    label: 'Disabled',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <XCircle size={12} />,
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
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
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
    width: '180px',
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
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '0.875rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statValue: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
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
  webhookCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  webhookIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#818cf8',
    flexShrink: 0,
  },
  webhookName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  webhookUrl: {
    fontSize: '0.75rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '250px',
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
  eventBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
    marginRight: '0.25rem',
    marginBottom: '0.25rem',
  },
  eventsCell: {
    display: 'flex',
    flexWrap: 'wrap',
    maxWidth: '200px',
  },
  successRate: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  successBar: {
    width: '60px',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  successFill: {
    height: '100%',
    borderRadius: '3px',
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
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    marginTop: '0.25rem',
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.375rem',
    minWidth: '150px',
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

const WebhookRow: React.FC<WebhookRowProps> = ({
  webhook,
  onEdit,
  onDelete,
  onToggle,
  onTest,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusConfig = STATUS_CONFIG[webhook.status];
  const successRate = webhook.totalDeliveries > 0
    ? ((webhook.totalDeliveries - webhook.failedDeliveries) / webhook.totalDeliveries) * 100
    : 100;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhook.url);
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
        <div style={styles.webhookCell}>
          <div style={styles.webhookIcon}>
            <Webhook size={18} />
          </div>
          <div>
            <div style={styles.webhookName}>{webhook.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={styles.webhookUrl}>{webhook.url}</span>
              <button
                style={{ ...styles.actionButton, width: '20px', height: '20px' }}
                onClick={handleCopyUrl}
                title="Copy URL"
              >
                {copied ? <Check size={10} /> : <Copy size={10} />}
              </button>
            </div>
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
        <div style={styles.eventsCell}>
          {webhook.events.slice(0, 3).map((event) => (
            <span key={event} style={styles.eventBadge}>{event}</span>
          ))}
          {webhook.events.length > 3 && (
            <span style={styles.eventBadge}>+{webhook.events.length - 3}</span>
          )}
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.successRate}>
          <div style={styles.successBar}>
            <div
              style={{
                ...styles.successFill,
                width: `${successRate}%`,
                background: successRate >= 90 ? '#10b981' : successRate >= 70 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
          <span style={{ fontSize: '0.75rem' }}>{successRate.toFixed(0)}%</span>
        </div>
      </td>
      <td style={styles.td}>
        {webhook.totalDeliveries.toLocaleString()}
      </td>
      <td style={styles.td}>
        {webhook.lastTriggered ? formatDate(webhook.lastTriggered) : 'Never'}
      </td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <div style={styles.actionButtons}>
          {onTest && (
            <button
              style={styles.actionButton}
              onClick={onTest}
              title="Test webhook"
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
            {onEdit && (
              <button style={styles.dropdownItem} onClick={onEdit}>
                <Edit2 size={14} />
                Edit
              </button>
            )}
            {onToggle && (
              <button
                style={styles.dropdownItem}
                onClick={() => onToggle(webhook.status !== 'active')}
              >
                {webhook.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                {webhook.status === 'active' ? 'Pause' : 'Enable'}
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

export const WebhookManagement: React.FC<WebhookManagementProps> = ({
  webhooks,
  onCreateWebhook,
  onEditWebhook,
  onDeleteWebhook,
  onToggleWebhook,
  onTestWebhook,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWebhooks = webhooks.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = webhooks.filter(w => w.status === 'active').length;
  const failingCount = webhooks.filter(w => w.status === 'failing').length;
  const totalDeliveries = webhooks.reduce((sum, w) => sum + w.totalDeliveries, 0);

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Webhook size={18} />
          Webhook Management
        </div>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search webhooks..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateWebhook && (
            <button style={styles.createButton} onClick={onCreateWebhook}>
              <Plus size={14} />
              Add Webhook
            </button>
          )}
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#10b981' }}>{activeCount}</span>
          <span style={styles.statLabel}>Active</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#ef4444' }}>{failingCount}</span>
          <span style={styles.statLabel}>Failing</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{totalDeliveries.toLocaleString()}</span>
          <span style={styles.statLabel}>Total Deliveries</span>
        </div>
      </div>

      {filteredWebhooks.length === 0 ? (
        <div style={styles.empty}>
          <Webhook size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No webhooks configured</span>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Webhook</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Events</th>
              <th style={styles.th}>Success Rate</th>
              <th style={styles.th}>Deliveries</th>
              <th style={styles.th}>Last Triggered</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredWebhooks.map((webhook) => (
              <WebhookRow
                key={webhook.id}
                webhook={webhook}
                onEdit={onEditWebhook ? () => onEditWebhook(webhook.id) : undefined}
                onDelete={onDeleteWebhook ? () => onDeleteWebhook(webhook.id) : undefined}
                onToggle={onToggleWebhook ? (enabled) => onToggleWebhook(webhook.id, enabled) : undefined}
                onTest={onTestWebhook ? () => onTestWebhook(webhook.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WebhookManagement;
