import React, { useState } from 'react';
import { BookOpen, Plus, Search, Folder, FileText, Upload, Download, Eye, Edit2, Trash2, Clock, User, Tag, ChevronRight, ChevronDown, MoreVertical, Link, ExternalLink } from 'lucide-react';

type DocumentStatus = 'published' | 'draft' | 'archived' | 'processing';
type DocumentType = 'article' | 'guide' | 'faq' | 'policy' | 'reference';

interface KnowledgeDocument {
  id: string;
  title: string;
  slug: string;
  type: DocumentType;
  status: DocumentStatus;
  content?: string;
  excerpt?: string;
  categoryId: string;
  tags: string[];
  author: string;
  views: number;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

interface KnowledgeCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  documentCount: number;
  parentId?: string;
  order: number;
}

interface KnowledgeBaseProps {
  categories: KnowledgeCategory[];
  documents: KnowledgeDocument[];
  onCreateDocument?: () => void;
  onCreateCategory?: () => void;
  onViewDocument?: (documentId: string) => void;
  onEditDocument?: (documentId: string) => void;
  onDeleteDocument?: (documentId: string) => void;
  onEditCategory?: (categoryId: string) => void;
  className?: string;
}

interface DocumentRowProps {
  document: KnowledgeDocument;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<DocumentStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  published: { label: 'Published', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  draft: { label: 'Draft', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  archived: { label: 'Archived', color: '#888', bgColor: 'rgba(255, 255, 255, 0.05)' },
  processing: { label: 'Processing', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
};

const TYPE_CONFIG: Record<DocumentType, {
  label: string;
  color: string;
}> = {
  article: { label: 'Article', color: '#3b82f6' },
  guide: { label: 'Guide', color: '#10b981' },
  faq: { label: 'FAQ', color: '#8b5cf6' },
  policy: { label: 'Policy', color: '#ef4444' },
  reference: { label: 'Reference', color: '#f59e0b' },
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
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '1.5rem',
  },
  sidebar: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  sidebarTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
  },
  addCategoryButton: {
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
  categoryList: {
    padding: '0.5rem',
  },
  categoryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: '0.25rem',
  },
  categoryItemActive: {
    background: 'rgba(99, 102, 241, 0.15)',
  },
  categoryIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
    marginBottom: '0.125rem',
  },
  categoryCount: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  documentsSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  documentsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  documentsTitle: {
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
  documentCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  documentIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  documentSlug: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
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
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  statsCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  tagsCell: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  tagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
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
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const DocumentRow: React.FC<DocumentRowProps> = ({
  document,
  onView,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = TYPE_CONFIG[document.type];
  const statusConfig = STATUS_CONFIG[document.status];

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
        <div style={styles.documentCell}>
          <div
            style={{
              ...styles.documentIcon,
              background: `${typeConfig.color}20`,
              color: typeConfig.color,
            }}
          >
            <FileText size={18} />
          </div>
          <div style={styles.documentInfo}>
            <div style={styles.documentTitle}>{document.title}</div>
            <div style={styles.documentSlug}>/{document.slug}</div>
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
          {statusConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.statsCell}>
          <span style={styles.statItem}>
            <Eye size={12} />
            {formatNumber(document.views)}
          </span>
          <span style={{ ...styles.statItem, color: '#10b981' }}>
            👍 {document.helpful}
          </span>
        </div>
      </td>
      <td style={styles.td}>
        <div style={styles.tagsCell}>
          {document.tags.slice(0, 2).map((tag) => (
            <span key={tag} style={styles.tagBadge}>
              {tag}
            </span>
          ))}
          {document.tags.length > 2 && (
            <span style={styles.tagBadge}>+{document.tags.length - 2}</span>
          )}
        </div>
      </td>
      <td style={styles.td}>{formatTimeAgo(document.updatedAt)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
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
      </td>
    </tr>
  );
};

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  categories,
  documents,
  onCreateDocument,
  onCreateCategory,
  onViewDocument,
  onEditDocument,
  onDeleteDocument,
  onEditCategory,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredDocuments = documents.filter(d => {
    if (selectedCategory && d.categoryId !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(query) ||
        d.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const publishedDocs = documents.filter(d => d.status === 'published').length;
  const totalViews = documents.reduce((sum, d) => sum + d.views, 0);
  const totalHelpful = documents.reduce((sum, d) => sum + d.helpful, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <BookOpen size={22} />
          Knowledge Base
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search documents..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateDocument && (
            <button style={styles.createButton} onClick={onCreateDocument}>
              <Plus size={14} />
              New Document
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <FileText size={20} />
          </div>
          <div style={styles.statValue}>{publishedDocs}</div>
          <div style={styles.statLabel}>Published</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Folder size={20} />
          </div>
          <div style={styles.statValue}>{categories.length}</div>
          <div style={styles.statLabel}>Categories</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Eye size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalViews)}</div>
          <div style={styles.statLabel}>Total Views</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <BookOpen size={20} />
          </div>
          <div style={styles.statValue}>{documents.length}</div>
          <div style={styles.statLabel}>Total Docs</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>Categories</span>
            {onCreateCategory && (
              <button style={styles.addCategoryButton} onClick={onCreateCategory}>
                <Plus size={14} />
              </button>
            )}
          </div>
          <div style={styles.categoryList}>
            <div
              style={{
                ...styles.categoryItem,
                ...(selectedCategory === null ? styles.categoryItemActive : {}),
              }}
              onClick={() => setSelectedCategory(null)}
            >
              <div style={styles.categoryIcon}>
                <Folder size={14} />
              </div>
              <div style={styles.categoryInfo}>
                <div style={styles.categoryName}>All Documents</div>
                <div style={styles.categoryCount}>{documents.length} docs</div>
              </div>
            </div>
            {categories.map((category) => (
              <div
                key={category.id}
                style={{
                  ...styles.categoryItem,
                  ...(selectedCategory === category.id ? styles.categoryItemActive : {}),
                }}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div style={styles.categoryIcon}>
                  <Folder size={14} />
                </div>
                <div style={styles.categoryInfo}>
                  <div style={styles.categoryName}>{category.name}</div>
                  <div style={styles.categoryCount}>{category.documentCount} docs</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Table */}
        <div style={styles.documentsSection}>
          <div style={styles.documentsHeader}>
            <span style={styles.documentsTitle}>
              Documents ({filteredDocuments.length})
            </span>
          </div>
          {filteredDocuments.length === 0 ? (
            <div style={styles.empty}>
              <FileText size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <span>No documents found</span>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Document</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Stats</th>
                  <th style={styles.th}>Tags</th>
                  <th style={styles.th}>Updated</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <DocumentRow
                    key={document.id}
                    document={document}
                    onView={onViewDocument ? () => onViewDocument(document.id) : undefined}
                    onEdit={onEditDocument ? () => onEditDocument(document.id) : undefined}
                    onDelete={onDeleteDocument ? () => onDeleteDocument(document.id) : undefined}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
