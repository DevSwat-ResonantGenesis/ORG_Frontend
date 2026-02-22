import React, { useState } from 'react';
import { Database, Plus, Search, Settings, Eye, Trash2, RefreshCw, Upload, Download, BarChart3, Zap, Clock, CheckCircle, AlertTriangle, XCircle, Layers, FileText, Link } from 'lucide-react';

type VectorStoreStatus = 'active' | 'indexing' | 'error' | 'offline';
type IndexStatus = 'ready' | 'building' | 'failed' | 'pending';
type EmbeddingModel = 'openai-ada' | 'openai-3-small' | 'openai-3-large' | 'cohere' | 'custom';

interface VectorIndex {
  id: string;
  name: string;
  status: IndexStatus;
  vectorCount: number;
  dimensions: number;
  embeddingModel: EmbeddingModel;
  similarity: 'cosine' | 'euclidean' | 'dot_product';
  createdAt: Date;
  lastUpdated: Date;
}

interface VectorStore {
  id: string;
  name: string;
  description?: string;
  status: VectorStoreStatus;
  indexes: VectorIndex[];
  totalVectors: number;
  totalSize: number;
  queryCount: number;
  avgLatency: number;
  createdAt: Date;
  updatedAt: Date;
}

interface VectorStoreManagerProps {
  stores: VectorStore[];
  onCreateStore?: () => void;
  onViewStore?: (storeId: string) => void;
  onEditStore?: (storeId: string) => void;
  onDeleteStore?: (storeId: string) => void;
  onCreateIndex?: (storeId: string) => void;
  onUploadVectors?: (storeId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface StoreCardProps {
  store: VectorStore;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateIndex?: () => void;
  onUpload?: () => void;
}

const STATUS_CONFIG: Record<VectorStoreStatus, {
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
  indexing: {
    label: 'Indexing',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <RefreshCw size={12} />,
  },
  error: {
    label: 'Error',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  offline: {
    label: 'Offline',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <AlertTriangle size={12} />,
  },
};

const INDEX_STATUS_CONFIG: Record<IndexStatus, {
  label: string;
  color: string;
}> = {
  ready: { label: 'Ready', color: '#10b981' },
  building: { label: 'Building', color: '#3b82f6' },
  failed: { label: 'Failed', color: '#ef4444' },
  pending: { label: 'Pending', color: '#888' },
};

const EMBEDDING_MODEL_CONFIG: Record<EmbeddingModel, {
  label: string;
  dimensions: number;
}> = {
  'openai-ada': { label: 'Ada-002', dimensions: 1536 },
  'openai-3-small': { label: 'Text-3-Small', dimensions: 1536 },
  'openai-3-large': { label: 'Text-3-Large', dimensions: 3072 },
  'cohere': { label: 'Cohere', dimensions: 1024 },
  'custom': { label: 'Custom', dimensions: 0 },
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
    width: '180px',
  },
  actionButton: {
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
  storesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1rem',
  },
  storeCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  storeCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  storeHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  storeTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  storeIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  storeMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
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
  storeBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  metricItem: {
    textAlign: 'center',
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
  },
  metricValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  metricLabel: {
    fontSize: '0.5625rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  indexesSection: {
    marginTop: '1rem',
  },
  sectionTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  indexesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  indexItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
  },
  indexInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  indexIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  indexName: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
  },
  indexMeta: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  indexStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  indexStatus: {
    fontSize: '0.5625rem',
    fontWeight: '600',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
  },
  storeFooter: {
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
  uploadButton: {
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

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const formatSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onView,
  onEdit,
  onDelete,
  onCreateIndex,
  onUpload,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[store.status];

  return (
    <div
      style={{
        ...styles.storeCard,
        ...(isHovered ? styles.storeCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.storeHeader}>
        <div style={styles.storeTitle}>
          <div
            style={{
              ...styles.storeIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <Database size={22} />
          </div>
          <div style={styles.storeInfo}>
            <div style={styles.storeName}>{store.name}</div>
            <div style={styles.storeMeta}>
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
              <span style={{ fontSize: '0.6875rem', color: '#888' }}>
                {store.indexes.length} indexes
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.storeBody}>
        {store.description && (
          <p style={styles.description}>{store.description}</p>
        )}

        <div style={styles.metricsGrid}>
          <div style={styles.metricItem}>
            <div style={styles.metricValue}>{formatNumber(store.totalVectors)}</div>
            <div style={styles.metricLabel}>Vectors</div>
          </div>
          <div style={styles.metricItem}>
            <div style={styles.metricValue}>{formatSize(store.totalSize)}</div>
            <div style={styles.metricLabel}>Size</div>
          </div>
          <div style={styles.metricItem}>
            <div style={styles.metricValue}>{formatNumber(store.queryCount)}</div>
            <div style={styles.metricLabel}>Queries</div>
          </div>
          <div style={styles.metricItem}>
            <div style={styles.metricValue}>{store.avgLatency}ms</div>
            <div style={styles.metricLabel}>Latency</div>
          </div>
        </div>

        {store.indexes.length > 0 && (
          <div style={styles.indexesSection}>
            <div style={styles.sectionTitle}>Indexes</div>
            <div style={styles.indexesList}>
              {store.indexes.slice(0, 3).map((index) => {
                const indexStatusConfig = INDEX_STATUS_CONFIG[index.status];
                const modelConfig = EMBEDDING_MODEL_CONFIG[index.embeddingModel];
                return (
                  <div key={index.id} style={styles.indexItem}>
                    <div style={styles.indexInfo}>
                      <div style={styles.indexIcon}>
                        <Layers size={14} />
                      </div>
                      <div>
                        <div style={styles.indexName}>{index.name}</div>
                        <div style={styles.indexMeta}>
                          {modelConfig.label} • {index.dimensions}d • {index.similarity}
                        </div>
                      </div>
                    </div>
                    <div style={styles.indexStats}>
                      <span>{formatNumber(index.vectorCount)} vectors</span>
                      <span
                        style={{
                          ...styles.indexStatus,
                          background: `${indexStatusConfig.color}20`,
                          color: indexStatusConfig.color,
                        }}
                      >
                        {indexStatusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              {store.indexes.length > 3 && (
                <div style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', padding: '0.5rem' }}>
                  +{store.indexes.length - 3} more indexes
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={styles.storeFooter}>
        <span style={styles.footerMeta}>Updated {formatTimeAgo(store.updatedAt)}</span>
        <div style={styles.actionButtons}>
          {onUpload && (
            <button style={{ ...styles.iconButton, ...styles.uploadButton }} onClick={onUpload} title="Upload Vectors">
              <Upload size={14} />
            </button>
          )}
          {onCreateIndex && (
            <button style={styles.iconButton} onClick={onCreateIndex} title="Create Index">
              <Plus size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={styles.iconButton} onClick={onEdit} title="Settings">
              <Settings size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const VectorStoreManager: React.FC<VectorStoreManagerProps> = ({
  stores,
  onCreateStore,
  onViewStore,
  onEditStore,
  onDeleteStore,
  onCreateIndex,
  onUploadVectors,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeStores = stores.filter(s => s.status === 'active').length;
  const totalVectors = stores.reduce((sum, s) => sum + s.totalVectors, 0);
  const totalQueries = stores.reduce((sum, s) => sum + s.queryCount, 0);
  const totalIndexes = stores.reduce((sum, s) => sum + s.indexes.length, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Database size={22} />
          Vector Store Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search stores..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onRefresh && (
            <button style={styles.actionButton} onClick={onRefresh}>
              <RefreshCw size={14} />
            </button>
          )}
          {onCreateStore && (
            <button style={styles.createButton} onClick={onCreateStore}>
              <Plus size={14} />
              New Store
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Database size={20} />
          </div>
          <div style={styles.statValue}>{activeStores}</div>
          <div style={styles.statLabel}>Active Stores</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Layers size={20} />
          </div>
          <div style={styles.statValue}>{totalIndexes}</div>
          <div style={styles.statLabel}>Total Indexes</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Zap size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalVectors)}</div>
          <div style={styles.statLabel}>Total Vectors</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <BarChart3 size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalQueries)}</div>
          <div style={styles.statLabel}>Total Queries</div>
        </div>
      </div>

      {/* Stores Grid */}
      {filteredStores.length === 0 ? (
        <div style={styles.empty}>
          <Database size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No vector stores found</span>
        </div>
      ) : (
        <div style={styles.storesGrid}>
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onView={onViewStore ? () => onViewStore(store.id) : undefined}
              onEdit={onEditStore ? () => onEditStore(store.id) : undefined}
              onDelete={onDeleteStore ? () => onDeleteStore(store.id) : undefined}
              onCreateIndex={onCreateIndex ? () => onCreateIndex(store.id) : undefined}
              onUpload={onUploadVectors ? () => onUploadVectors(store.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VectorStoreManager;
