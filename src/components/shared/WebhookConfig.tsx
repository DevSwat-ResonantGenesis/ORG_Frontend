import React, { useState } from 'react';
import { Webhook, Plus, Trash2, Edit2, Check, X, Copy, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

type WebhookStatus = 'active' | 'inactive' | 'error' | 'pending';
type HttpMethod = 'POST' | 'PUT' | 'PATCH';

interface WebhookEvent {
  id: string;
  name: string;
  description?: string;
}

interface WebhookData {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  method?: HttpMethod;
  status: WebhookStatus;
  lastTriggered?: Date;
  failureCount?: number;
}

interface WebhookConfigProps {
  webhooks: WebhookData[];
  availableEvents: WebhookEvent[];
  onAdd?: (webhook: Omit<WebhookData, 'id' | 'status'>) => void;
  onEdit?: (id: string, webhook: Partial<WebhookData>) => void;
  onDelete?: (id: string) => void;
  onTest?: (id: string) => void;
  className?: string;
}

const STATUS_CONFIG: Record<WebhookStatus, {
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  label: string;
}> = {
  active: {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={14} />,
    label: 'Active',
  },
  inactive: {
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <AlertCircle size={14} />,
    label: 'Inactive',
  },
  error: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertCircle size={14} />,
    label: 'Error',
  },
  pending: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <RefreshCw size={14} />,
    label: 'Pending',
  },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  webhookCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    transition: 'all 0.15s',
  },
  webhookCardHover: {
    background: 'rgba(255, 255, 255, 0.05)',
  },
  webhookHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  webhookInfo: {
    flex: 1,
    minWidth: 0,
  },
  webhookName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 0.25rem 0',
  },
  webhookUrl: {
    fontSize: '0.75rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  webhookMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  metaItem: {
    fontSize: '0.75rem',
    color: '#666',
  },
  events: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    marginBottom: '0.75rem',
  },
  eventBadge: {
    padding: '0.25rem 0.5rem',
    background: 'rgba(99, 102, 241, 0.1)',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    color: '#818cf8',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonHover: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  actionButtonDanger: {
    color: '#ef4444',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  form: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  formTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    margin: '0 0 1rem 0',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formLabel: {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
    marginBottom: '0.375rem',
  },
  formInput: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 0.15s',
  },
  eventCheckboxes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  eventCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  eventCheckboxSelected: {
    background: 'rgba(99, 102, 241, 0.15)',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxSelected: {
    background: '#6366f1',
    borderColor: '#6366f1',
  },
  formActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.25rem',
  },
  cancelButton: {
    padding: '0.625rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '0.625rem 1.25rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    textAlign: 'center',
  },
  emptyIcon: {
    color: '#666',
    marginBottom: '1rem',
  },
  emptyText: {
    fontSize: '0.9375rem',
    color: '#888',
    marginBottom: '1rem',
  },
};

const WebhookCard: React.FC<{
  webhook: WebhookData;
  onEdit?: () => void;
  onDelete?: () => void;
  onTest?: () => void;
}> = ({ webhook, onEdit, onDelete, onTest }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const statusConfig = STATUS_CONFIG[webhook.status];

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
        ...styles.webhookCard,
        ...(isHovered ? styles.webhookCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.webhookHeader}>
        <div style={styles.webhookInfo}>
          <h4 style={styles.webhookName}>{webhook.name}</h4>
          <div style={styles.webhookUrl}>{webhook.url}</div>
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

      <div style={styles.webhookMeta}>
        <span style={styles.metaItem}>{webhook.method || 'POST'}</span>
        {webhook.lastTriggered && (
          <span style={styles.metaItem}>
            Last triggered: {formatDate(webhook.lastTriggered)}
          </span>
        )}
        {webhook.failureCount !== undefined && webhook.failureCount > 0 && (
          <span style={{ ...styles.metaItem, color: '#ef4444' }}>
            {webhook.failureCount} failures
          </span>
        )}
      </div>

      <div style={styles.events}>
        {webhook.events.slice(0, 4).map((event) => (
          <span key={event} style={styles.eventBadge}>
            {event}
          </span>
        ))}
        {webhook.events.length > 4 && (
          <span style={styles.eventBadge}>+{webhook.events.length - 4} more</span>
        )}
      </div>

      <div style={styles.actions}>
        {onTest && (
          <button
            style={{
              ...styles.actionButton,
              ...(hoveredAction === 'test' ? styles.actionButtonHover : {}),
            }}
            onClick={onTest}
            onMouseEnter={() => setHoveredAction('test')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <RefreshCw size={12} />
            Test
          </button>
        )}
        {onEdit && (
          <button
            style={{
              ...styles.actionButton,
              ...(hoveredAction === 'edit' ? styles.actionButtonHover : {}),
            }}
            onClick={onEdit}
            onMouseEnter={() => setHoveredAction('edit')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <Edit2 size={12} />
            Edit
          </button>
        )}
        {onDelete && (
          <button
            style={{
              ...styles.actionButton,
              ...styles.actionButtonDanger,
              ...(hoveredAction === 'delete' ? { background: 'rgba(239, 68, 68, 0.15)' } : {}),
            }}
            onClick={onDelete}
            onMouseEnter={() => setHoveredAction('delete')}
            onMouseLeave={() => setHoveredAction(null)}
          >
            <Trash2 size={12} />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export const WebhookConfig: React.FC<WebhookConfigProps> = ({
  webhooks,
  availableEvents,
  onAdd,
  onEdit,
  onDelete,
  onTest,
  className,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
  });

  const handleSubmit = () => {
    if (formData.name && formData.url && formData.events.length > 0) {
      onAdd?.(formData);
      setFormData({ name: '', url: '', events: [] });
      setShowForm(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter((e) => e !== eventId)
        : [...prev.events, eventId],
    }));
  };

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <h3 style={styles.title}>Webhooks</h3>
        {onAdd && !showForm && (
          <button style={styles.addButton} onClick={() => setShowForm(true)}>
            <Plus size={14} />
            Add Webhook
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.form}>
          <h4 style={styles.formTitle}>New Webhook</h4>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Webhook"
              style={styles.formInput}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/webhook"
              style={styles.formInput}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Events</label>
            <div style={styles.eventCheckboxes}>
              {availableEvents.map((event) => {
                const isSelected = formData.events.includes(event.id);
                return (
                  <div
                    key={event.id}
                    style={{
                      ...styles.eventCheckbox,
                      ...(isSelected ? styles.eventCheckboxSelected : {}),
                    }}
                    onClick={() => toggleEvent(event.id)}
                  >
                    <div
                      style={{
                        ...styles.checkbox,
                        ...(isSelected ? styles.checkboxSelected : {}),
                      }}
                    >
                      {isSelected && <Check size={10} color="#fff" />}
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: '#e4e4e7' }}>
                      {event.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={styles.formActions}>
            <button style={styles.cancelButton} onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button style={styles.saveButton} onClick={handleSubmit}>
              Create Webhook
            </button>
          </div>
        </div>
      )}

      {webhooks.length === 0 && !showForm ? (
        <div style={styles.empty}>
          <Webhook size={40} style={styles.emptyIcon} />
          <p style={styles.emptyText}>No webhooks configured</p>
          {onAdd && (
            <button style={styles.addButton} onClick={() => setShowForm(true)}>
              <Plus size={14} />
              Add Your First Webhook
            </button>
          )}
        </div>
      ) : (
        webhooks.map((webhook) => (
          <WebhookCard
            key={webhook.id}
            webhook={webhook}
            onEdit={onEdit ? () => onEdit(webhook.id, webhook) : undefined}
            onDelete={onDelete ? () => onDelete(webhook.id) : undefined}
            onTest={onTest ? () => onTest(webhook.id) : undefined}
          />
        ))
      )}
    </div>
  );
};

export default WebhookConfig;
