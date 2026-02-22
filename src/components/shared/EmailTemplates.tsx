import React, { useState } from 'react';
import { Mail, Plus, Edit2, Trash2, MoreVertical, Search, Eye, Copy, Check, Send, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

type TemplateCategory = 'auth' | 'notification' | 'marketing' | 'transactional' | 'system';
type TemplateStatus = 'active' | 'draft' | 'archived';

interface EmailTemplateData {
  id: string;
  name: string;
  subject: string;
  category: TemplateCategory;
  status: TemplateStatus;
  description?: string;
  lastModified: Date;
  createdAt: Date;
  usageCount: number;
  variables: string[];
}

interface EmailTemplatesProps {
  templates: EmailTemplateData[];
  onCreateTemplate?: () => void;
  onEditTemplate?: (templateId: string) => void;
  onDeleteTemplate?: (templateId: string) => void;
  onPreviewTemplate?: (templateId: string) => void;
  onDuplicateTemplate?: (templateId: string) => void;
  onSendTest?: (templateId: string) => void;
  className?: string;
}

interface TemplateRowProps {
  template: EmailTemplateData;
  onEdit?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
  onDuplicate?: () => void;
  onSendTest?: () => void;
}

const CATEGORY_CONFIG: Record<TemplateCategory, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  auth: { label: 'Authentication', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  notification: { label: 'Notification', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  marketing: { label: 'Marketing', color: '#ec4899', bgColor: 'rgba(236, 72, 153, 0.15)' },
  transactional: { label: 'Transactional', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  system: { label: 'System', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
};

const STATUS_CONFIG: Record<TemplateStatus, {
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
  draft: {
    label: 'Draft',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
  archived: {
    label: 'Archived',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <AlertTriangle size={12} />,
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
  templateCell: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  templateIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  templateName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  templateSubject: {
    fontSize: '0.75rem',
    color: '#888',
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  categoryBadge: {
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
  variableBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.625rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
    marginRight: '0.25rem',
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
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const TemplateRow: React.FC<TemplateRowProps> = ({
  template,
  onEdit,
  onDelete,
  onPreview,
  onDuplicate,
  onSendTest,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[template.category];
  const statusConfig = STATUS_CONFIG[template.status];

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
        <div style={styles.templateCell}>
          <div
            style={{
              ...styles.templateIcon,
              background: categoryConfig.bgColor,
              color: categoryConfig.color,
            }}
          >
            <Mail size={18} />
          </div>
          <div>
            <div style={styles.templateName}>{template.name}</div>
            <div style={styles.templateSubject}>{template.subject}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.categoryBadge,
            background: categoryConfig.bgColor,
            color: categoryConfig.color,
          }}
        >
          {categoryConfig.label}
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
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {template.variables.slice(0, 3).map((v) => (
            <span key={v} style={styles.variableBadge}>{`{{${v}}}`}</span>
          ))}
          {template.variables.length > 3 && (
            <span style={styles.variableBadge}>+{template.variables.length - 3}</span>
          )}
        </div>
      </td>
      <td style={styles.td}>{template.usageCount.toLocaleString()}</td>
      <td style={styles.td}>{formatDate(template.lastModified)}</td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <div style={styles.actionButtons}>
          {onPreview && (
            <button style={styles.actionButton} onClick={onPreview} title="Preview">
              <Eye size={14} />
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
            {onDuplicate && (
              <button style={styles.dropdownItem} onClick={onDuplicate}>
                <Copy size={14} />
                Duplicate
              </button>
            )}
            {onSendTest && template.status === 'active' && (
              <button style={styles.dropdownItem} onClick={onSendTest}>
                <Send size={14} />
                Send Test
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

export const EmailTemplates: React.FC<EmailTemplatesProps> = ({
  templates,
  onCreateTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onPreviewTemplate,
  onDuplicateTemplate,
  onSendTest,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');

  const filteredTemplates = templates.filter(t => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(query) ||
        t.subject.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const activeCount = templates.filter(t => t.status === 'active').length;
  const draftCount = templates.filter(t => t.status === 'draft').length;
  const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);

  return (
    <div style={styles.container} className={className}>
      <div style={styles.header}>
        <div style={styles.title}>
          <Mail size={18} />
          Email Templates
        </div>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search templates..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateTemplate && (
            <button style={styles.createButton} onClick={onCreateTemplate}>
              <Plus size={14} />
              Create Template
            </button>
          )}
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{templates.length}</span>
          <span style={styles.statLabel}>Total Templates</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#10b981' }}>{activeCount}</span>
          <span style={styles.statLabel}>Active</span>
        </div>
        <div style={styles.stat}>
          <span style={{ ...styles.statValue, color: '#f59e0b' }}>{draftCount}</span>
          <span style={styles.statLabel}>Drafts</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>{totalUsage.toLocaleString()}</span>
          <span style={styles.statLabel}>Total Sent</span>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div style={styles.empty}>
          <Mail size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No templates found</span>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Template</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Variables</th>
              <th style={styles.th}>Usage</th>
              <th style={styles.th}>Modified</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredTemplates.map((template) => (
              <TemplateRow
                key={template.id}
                template={template}
                onEdit={onEditTemplate ? () => onEditTemplate(template.id) : undefined}
                onDelete={onDeleteTemplate ? () => onDeleteTemplate(template.id) : undefined}
                onPreview={onPreviewTemplate ? () => onPreviewTemplate(template.id) : undefined}
                onDuplicate={onDuplicateTemplate ? () => onDuplicateTemplate(template.id) : undefined}
                onSendTest={onSendTest ? () => onSendTest(template.id) : undefined}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmailTemplates;
