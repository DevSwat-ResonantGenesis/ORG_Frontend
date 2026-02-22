import React, { useState } from 'react';
import { HardDrive, Folder, File, Trash2, Download, Search, MoreVertical, Image, FileText, Video, Music, Archive, Code, Database, RefreshCw, Upload, ChevronRight, ChevronDown } from 'lucide-react';

type FileType = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'code' | 'data' | 'other';
type StorageTier = 'hot' | 'warm' | 'cold' | 'archive';

interface StorageFile {
  id: string;
  name: string;
  path: string;
  type: FileType;
  size: number;
  mimeType: string;
  tier: StorageTier;
  createdAt: Date;
  lastAccessed: Date;
  downloads: number;
  isPublic: boolean;
}

interface StorageBucket {
  id: string;
  name: string;
  fileCount: number;
  totalSize: number;
  isPublic: boolean;
}

interface StorageStats {
  totalSize: number;
  usedSize: number;
  fileCount: number;
  bucketCount: number;
  bandwidthUsed: number;
  bandwidthLimit: number;
}

interface StorageManagementProps {
  files: StorageFile[];
  buckets: StorageBucket[];
  stats: StorageStats;
  currentBucket?: string;
  onSelectBucket?: (bucketId: string) => void;
  onUploadFile?: () => void;
  onDownloadFile?: (fileId: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onCreateBucket?: () => void;
  onRefresh?: () => void;
  className?: string;
}

interface FileRowProps {
  file: StorageFile;
  onDownload?: () => void;
  onDelete?: () => void;
}

const FILE_TYPE_CONFIG: Record<FileType, {
  icon: React.ReactNode;
  color: string;
  label: string;
}> = {
  image: { icon: <Image size={16} />, color: '#ec4899', label: 'Image' },
  document: { icon: <FileText size={16} />, color: '#3b82f6', label: 'Document' },
  video: { icon: <Video size={16} />, color: '#8b5cf6', label: 'Video' },
  audio: { icon: <Music size={16} />, color: '#f59e0b', label: 'Audio' },
  archive: { icon: <Archive size={16} />, color: '#10b981', label: 'Archive' },
  code: { icon: <Code size={16} />, color: '#ef4444', label: 'Code' },
  data: { icon: <Database size={16} />, color: '#14b8a6', label: 'Data' },
  other: { icon: <File size={16} />, color: '#888', label: 'Other' },
};

const TIER_CONFIG: Record<StorageTier, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  hot: { label: 'Hot', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  warm: { label: 'Warm', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  cold: { label: 'Cold', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.15)' },
  archive: { label: 'Archive', color: '#888', bgColor: 'rgba(255, 255, 255, 0.05)' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '1.5rem',
  },
  sidebar: {
    width: '260px',
    flexShrink: 0,
  },
  sidebarCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  sidebarTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.75rem',
  },
  storageBar: {
    marginBottom: '0.75rem',
  },
  storageProgress: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  storageFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  storageText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#888',
  },
  bucketList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  bucketItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.625rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
  },
  bucketItemActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
  },
  bucketIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  bucketInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  bucketName: {
    fontWeight: '500',
    color: '#e4e4e7',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  bucketMeta: {
    fontSize: '0.6875rem',
    color: '#666',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
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
  uploadButton: {
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
  refreshButton: {
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
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  tableContainer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    flex: 1,
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
  fileCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  fileIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fileName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  filePath: {
    fontSize: '0.6875rem',
    color: '#666',
    fontFamily: "'JetBrains Mono', monospace",
  },
  tierBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  publicBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    fontSize: '0.5625rem',
    fontWeight: '600',
    background: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
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
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#666',
  },
};

const formatSize = (bytes: number): string => {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const FileRow: React.FC<FileRowProps> = ({
  file,
  onDownload,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = FILE_TYPE_CONFIG[file.type];
  const tierConfig = TIER_CONFIG[file.tier];

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
        <div style={styles.fileCell}>
          <div
            style={{
              ...styles.fileIcon,
              background: `${typeConfig.color}20`,
              color: typeConfig.color,
            }}
          >
            {typeConfig.icon}
          </div>
          <div>
            <div style={styles.fileName} title={file.name}>{file.name}</div>
            <div style={styles.filePath}>{file.path}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}>{typeConfig.label}</td>
      <td style={styles.td}>{formatSize(file.size)}</td>
      <td style={styles.td}>
        <span
          style={{
            ...styles.tierBadge,
            background: tierConfig.bgColor,
            color: tierConfig.color,
          }}
        >
          {tierConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        {file.isPublic && <span style={styles.publicBadge}>Public</span>}
      </td>
      <td style={styles.td}>{formatDate(file.lastAccessed)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {onDownload && (
            <button style={styles.actionButton} onClick={onDownload} title="Download">
              <Download size={14} />
            </button>
          )}
          {onDelete && (
            <button style={styles.actionButton} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const StorageManagement: React.FC<StorageManagementProps> = ({
  files,
  buckets,
  stats,
  currentBucket,
  onSelectBucket,
  onUploadFile,
  onDownloadFile,
  onDeleteFile,
  onCreateBucket,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const usagePercent = (stats.usedSize / stats.totalSize) * 100;
  const bandwidthPercent = (stats.bandwidthUsed / stats.bandwidthLimit) * 100;

  return (
    <div style={styles.container} className={className}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarCard}>
          <div style={styles.sidebarTitle}>Storage Usage</div>
          <div style={styles.storageBar}>
            <div style={styles.storageProgress}>
              <div
                style={{
                  ...styles.storageFill,
                  width: `${Math.min(usagePercent, 100)}%`,
                  background: usagePercent > 90 ? '#ef4444' : usagePercent > 70 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
            <div style={styles.storageText}>
              <span>{formatSize(stats.usedSize)}</span>
              <span>{formatSize(stats.totalSize)}</span>
            </div>
          </div>
          <div style={styles.sidebarTitle}>Bandwidth</div>
          <div style={styles.storageBar}>
            <div style={styles.storageProgress}>
              <div
                style={{
                  ...styles.storageFill,
                  width: `${Math.min(bandwidthPercent, 100)}%`,
                  background: bandwidthPercent > 90 ? '#ef4444' : bandwidthPercent > 70 ? '#f59e0b' : '#3b82f6',
                }}
              />
            </div>
            <div style={styles.storageText}>
              <span>{formatSize(stats.bandwidthUsed)}</span>
              <span>{formatSize(stats.bandwidthLimit)}</span>
            </div>
          </div>
        </div>

        <div style={styles.sidebarCard}>
          <div style={styles.sidebarTitle}>Buckets</div>
          <div style={styles.bucketList}>
            {buckets.map((bucket) => (
              <button
                key={bucket.id}
                style={{
                  ...styles.bucketItem,
                  ...(currentBucket === bucket.id ? styles.bucketItemActive : {}),
                }}
                onClick={() => onSelectBucket?.(bucket.id)}
              >
                <div style={styles.bucketIcon}>
                  <Folder size={14} />
                </div>
                <div style={styles.bucketInfo}>
                  <div style={styles.bucketName}>{bucket.name}</div>
                  <div style={styles.bucketMeta}>
                    {bucket.fileCount} files · {formatSize(bucket.totalSize)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            <HardDrive size={22} />
            Storage Management
          </h2>
          <div style={styles.headerActions}>
            {onRefresh && (
              <button style={styles.refreshButton} onClick={onRefresh}>
                <RefreshCw size={14} />
                Refresh
              </button>
            )}
            {onUploadFile && (
              <button style={styles.uploadButton} onClick={onUploadFile}>
                <Upload size={14} />
                Upload Files
              </button>
            )}
          </div>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.fileCount.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Files</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.bucketCount}</div>
            <div style={styles.statLabel}>Buckets</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{usagePercent.toFixed(0)}%</div>
            <div style={styles.statLabel}>Storage Used</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{bandwidthPercent.toFixed(0)}%</div>
            <div style={styles.statLabel}>Bandwidth Used</div>
          </div>
        </div>

        <div style={styles.tableContainer}>
          <div style={styles.tableHeader}>
            <span style={styles.tableTitle}>Files ({filteredFiles.length})</span>
            <div style={styles.searchInput}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search files..."
                style={styles.input}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div style={styles.empty}>
              <HardDrive size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <span>No files found</span>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>File</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Size</th>
                  <th style={styles.th}>Tier</th>
                  <th style={styles.th}>Access</th>
                  <th style={styles.th}>Last Accessed</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    onDownload={onDownloadFile ? () => onDownloadFile(file.id) : undefined}
                    onDelete={onDeleteFile ? () => onDeleteFile(file.id) : undefined}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default StorageManagement;
