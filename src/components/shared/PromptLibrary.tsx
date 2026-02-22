import React, { useState } from 'react';
import { FileText, Plus, Search, Tag, Copy, Edit2, Trash2, Eye, Star, StarOff, Clock, User, Filter, ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';

type PromptCategory = 'system' | 'user' | 'assistant' | 'function' | 'template';
type PromptStatus = 'active' | 'draft' | 'archived';

interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: string;
  description?: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  category: PromptCategory;
  status: PromptStatus;
  content: string;
  variables: PromptVariable[];
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

interface PromptLibraryProps {
  prompts: PromptTemplate[];
  onCreatePrompt?: () => void;
  onViewPrompt?: (promptId: string) => void;
  onEditPrompt?: (promptId: string) => void;
  onCopyPrompt?: (promptId: string) => void;
  onDeletePrompt?: (promptId: string) => void;
  onToggleFavorite?: (promptId: string) => void;
  className?: string;
}

interface PromptCardProps {
  prompt: PromptTemplate;
  onView?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
}

const CATEGORY_CONFIG: Record<PromptCategory, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  system: { label: 'System', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  user: { label: 'User', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  assistant: { label: 'Assistant', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  function: { label: 'Function', color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.15)' },
  template: { label: 'Template', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
};

const STATUS_CONFIG: Record<PromptStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  active: { label: 'Active', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  draft: { label: 'Draft', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  archived: { label: 'Archived', color: '#888', bgColor: 'rgba(255, 255, 255, 0.05)' },
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
  filterButton: {
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
    padding: '1rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  promptsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '1rem',
  },
  promptCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  promptCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  promptHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  promptTitle: {
    flex: 1,
  },
  promptName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.375rem',
  },
  promptMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  categoryBadge: {
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
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  favoriteButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.375rem',
    background: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  favoriteActive: {
    color: '#f59e0b',
  },
  promptBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  contentPreview: {
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    marginBottom: '1rem',
    maxHeight: '80px',
    overflow: 'hidden',
  },
  contentText: {
    fontSize: '0.75rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
  },
  variablesSection: {
    marginBottom: '1rem',
  },
  variablesTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  variablesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  variableBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  tagsSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  tagBadge: {
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
  promptFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  footerMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.6875rem',
    color: '#888',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
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
  copyButton: {
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

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  onView,
  onEdit,
  onCopy,
  onDelete,
  onToggleFavorite,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const categoryConfig = CATEGORY_CONFIG[prompt.category];
  const statusConfig = STATUS_CONFIG[prompt.status];

  return (
    <div
      style={{
        ...styles.promptCard,
        ...(isHovered ? styles.promptCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.promptHeader}>
        <div style={styles.promptTitle}>
          <div style={styles.promptName}>{prompt.name}</div>
          <div style={styles.promptMeta}>
            <span
              style={{
                ...styles.categoryBadge,
                background: categoryConfig.bgColor,
                color: categoryConfig.color,
              }}
            >
              {categoryConfig.label}
            </span>
            <span
              style={{
                ...styles.statusBadge,
                background: statusConfig.bgColor,
                color: statusConfig.color,
              }}
            >
              {statusConfig.label}
            </span>
            <span style={{ fontSize: '0.6875rem', color: '#888' }}>v{prompt.version}</span>
          </div>
        </div>
        {onToggleFavorite && (
          <button
            style={{
              ...styles.favoriteButton,
              ...(prompt.isFavorite ? styles.favoriteActive : {}),
            }}
            onClick={onToggleFavorite}
          >
            {prompt.isFavorite ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
          </button>
        )}
      </div>

      <div style={styles.promptBody}>
        {prompt.description && (
          <p style={styles.description}>{prompt.description}</p>
        )}

        <div style={styles.contentPreview}>
          <span style={styles.contentText}>
            {prompt.content.slice(0, 150)}
            {prompt.content.length > 150 ? '...' : ''}
          </span>
        </div>

        {prompt.variables.length > 0 && (
          <div style={styles.variablesSection}>
            <div style={styles.variablesTitle}>Variables ({prompt.variables.length})</div>
            <div style={styles.variablesList}>
              {prompt.variables.slice(0, 4).map((variable) => (
                <span key={variable.name} style={styles.variableBadge}>
                  {`{{${variable.name}}}`}
                  {variable.required && <span style={{ color: '#ef4444' }}>*</span>}
                </span>
              ))}
              {prompt.variables.length > 4 && (
                <span style={styles.variableBadge}>+{prompt.variables.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {prompt.tags.length > 0 && (
          <div style={styles.tagsSection}>
            {prompt.tags.slice(0, 4).map((tag) => (
              <span key={tag} style={styles.tagBadge}>
                <Tag size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={styles.promptFooter}>
        <div style={styles.footerMeta}>
          <span style={styles.metaItem}>
            <User size={12} />
            {prompt.createdBy}
          </span>
          <span style={styles.metaItem}>
            <Clock size={12} />
            {formatTimeAgo(prompt.updatedAt)}
          </span>
          <span style={styles.metaItem}>
            <CheckCircle size={12} />
            {prompt.usageCount} uses
          </span>
        </div>
        <div style={styles.actionButtons}>
          {onCopy && (
            <button style={{ ...styles.actionButton, ...styles.copyButton }} onClick={onCopy} title="Copy">
              <Copy size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.actionButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={styles.actionButton} onClick={onEdit} title="Edit">
              <Edit2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
  prompts,
  onCreatePrompt,
  onViewPrompt,
  onEditPrompt,
  onCopyPrompt,
  onDeletePrompt,
  onToggleFavorite,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PromptCategory | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredPrompts = prompts.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (showFavoritesOnly && !p.isFavorite) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const activePrompts = prompts.filter(p => p.status === 'active').length;
  const favoritePrompts = prompts.filter(p => p.isFavorite).length;
  const totalUsage = prompts.reduce((sum, p) => sum + p.usageCount, 0);
  const totalVariables = prompts.reduce((sum, p) => sum + p.variables.length, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <FileText size={22} />
          Prompt Library
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search prompts..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            style={{
              ...styles.filterButton,
              ...(showFavoritesOnly ? { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' } : {}),
            }}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Star size={14} />
            Favorites
          </button>
          {onCreatePrompt && (
            <button style={styles.createButton} onClick={onCreatePrompt}>
              <Plus size={14} />
              New Prompt
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#10b981' }}>{activePrompts}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#f59e0b' }}>{favoritePrompts}</div>
          <div style={styles.statLabel}>Favorites</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{totalUsage}</div>
          <div style={styles.statLabel}>Total Uses</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{prompts.length}</div>
          <div style={styles.statLabel}>Total Prompts</div>
        </div>
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <div style={styles.empty}>
          <FileText size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No prompts found</span>
        </div>
      ) : (
        <div style={styles.promptsGrid}>
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onView={onViewPrompt ? () => onViewPrompt(prompt.id) : undefined}
              onEdit={onEditPrompt ? () => onEditPrompt(prompt.id) : undefined}
              onCopy={onCopyPrompt ? () => onCopyPrompt(prompt.id) : undefined}
              onDelete={onDeletePrompt ? () => onDeletePrompt(prompt.id) : undefined}
              onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(prompt.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;
