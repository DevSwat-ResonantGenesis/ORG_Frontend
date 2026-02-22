import React, { useState } from 'react';
import { Database, Plus, Download, Upload, Trash2, MoreVertical, Search, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, HardDrive, Calendar, FileArchive } from 'lucide-react';

type BackupStatus = 'completed' | 'in_progress' | 'failed' | 'scheduled';
type BackupType = 'full' | 'incremental' | 'differential';

interface BackupData {
  id: string;
  name: string;
  type: BackupType;
  status: BackupStatus;
  size: number;
  createdAt: Date;
  completedAt?: Date;
  duration?: number;
  retentionDays: number;
  includedData: string[];
  errorMessage?: string;
}

interface BackupManagementProps {
  backups: BackupData[];
  isBackupInProgress: boolean;
  lastBackupTime?: Date;
  totalStorageUsed: number;
  storageLimit: number;
  onCreateBackup?: (type: BackupType) => void;
  onRestoreBackup?: (backupId: string) => void;
  onDeleteBackup?: (backupId: string) => void;
  onDownloadBackup?: (backupId: string) => void;
  className?: string;
}

interface BackupRowProps {
  backup: BackupData;
  onRestore?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
}

const STATUS_CONFIG: Record<BackupStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  completed: {
    label: 'Completed',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  in_progress: {
    label: 'In Progress',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <RefreshCw size={12} />,
  },
  failed: {
    label: 'Failed',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  scheduled: {
    label: 'Scheduled',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <Clock size={12} />,
  },
};

const TYPE_CONFIG: Record<BackupType, {
  label: string;
  color: string;
  description: string;
}> = {
  full: { label: 'Full', color: '#8b5cf6', description: 'Complete system backup' },
  incremental: { label: 'Incremental', color: '#3b82f6', description: 'Changes since last backup' },
  differential: { label: 'Differential', color: '#10b981', description: 'Changes since last full backup' },
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
  storageBar: {
    marginTop: '0.75rem',
  },
  storageProgress: {
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.375rem',
  },
  storageFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  storageText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.6875rem',
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
  backupCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  backupIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backupName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  backupMeta: {
    fontSize: '0.75rem',
    color: '#888',
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
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
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
    minWidth: '140px',
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
  backupTypeSelector: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.25rem',
    background: '#1a1a2e',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.5rem',
    minWidth: '200px',
    zIndex: 100,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  },
  backupTypeOption: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: '0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  backupTypeLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  backupTypeDesc: {
    fontSize: '0.75rem',
    color: '#888',
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
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatDuration = (seconds: number) => {
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${seconds}s`;
};

const BackupRow: React.FC<BackupRowProps> = ({
  backup,
  onRestore,
  onDelete,
  onDownload,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = STATUS_CONFIG[backup.status];
  const typeConfig = TYPE_CONFIG[backup.type];

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
        <div style={styles.backupCell}>
          <div
            style={{
              ...styles.backupIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <FileArchive size={18} />
          </div>
          <div>
            <div style={styles.backupName}>{backup.name}</div>
            <div style={styles.backupMeta}>
              {backup.includedData.slice(0, 2).join(', ')}
              {backup.includedData.length > 2 && ` +${backup.includedData.length - 2} more`}
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
      <td style={styles.td}>{formatSize(backup.size)}</td>
      <td style={styles.td}>
        {backup.duration ? formatDuration(backup.duration) : '-'}
      </td>
      <td style={styles.td}>{formatDate(backup.createdAt)}</td>
      <td style={{ ...styles.td, position: 'relative' }}>
        <div style={styles.actionButtons}>
          {onDownload && backup.status === 'completed' && (
            <button
              style={styles.actionButton}
              onClick={onDownload}
              title="Download"
            >
              <Download size={14} />
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
            {onRestore && backup.status === 'completed' && (
              <button style={styles.dropdownItem} onClick={onRestore}>
                <Upload size={14} />
                Restore
              </button>
            )}
            {onDownload && backup.status === 'completed' && (
              <button style={styles.dropdownItem} onClick={onDownload}>
                <Download size={14} />
                Download
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

export const BackupManagement: React.FC<BackupManagementProps> = ({
  backups,
  isBackupInProgress,
  lastBackupTime,
  totalStorageUsed,
  storageLimit,
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  onDownloadBackup,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackupTypes, setShowBackupTypes] = useState(false);

  const filteredBackups = backups.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = backups.filter(b => b.status === 'completed').length;
  const failedCount = backups.filter(b => b.status === 'failed').length;
  const storagePercent = (totalStorageUsed / storageLimit) * 100;

  const handleCreateBackup = (type: BackupType) => {
    setShowBackupTypes(false);
    onCreateBackup?.(type);
  };

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Database size={22} />
          Backup Management
        </h2>
        <div style={styles.headerActions}>
          {onCreateBackup && (
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  ...styles.createButton,
                  opacity: isBackupInProgress ? 0.5 : 1,
                }}
                onClick={() => setShowBackupTypes(!showBackupTypes)}
                disabled={isBackupInProgress}
              >
                {isBackupInProgress ? <RefreshCw size={14} /> : <Plus size={14} />}
                {isBackupInProgress ? 'Backup in Progress...' : 'Create Backup'}
              </button>
              {showBackupTypes && (
                <div style={styles.backupTypeSelector}>
                  {(Object.keys(TYPE_CONFIG) as BackupType[]).map((type) => (
                    <button
                      key={type}
                      style={styles.backupTypeOption}
                      onClick={() => handleCreateBackup(type)}
                    >
                      <span style={{ ...styles.backupTypeLabel, color: TYPE_CONFIG[type].color }}>
                        {TYPE_CONFIG[type].label} Backup
                      </span>
                      <span style={styles.backupTypeDesc}>{TYPE_CONFIG[type].description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{completedCount}</div>
          <div style={styles.statLabel}>Completed Backups</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{failedCount}</div>
          <div style={styles.statLabel}>Failed Backups</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Calendar size={20} />
          </div>
          <div style={styles.statValue}>
            {lastBackupTime ? formatDate(lastBackupTime).split(',')[0] : 'Never'}
          </div>
          <div style={styles.statLabel}>Last Backup</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <HardDrive size={20} />
          </div>
          <div style={styles.statValue}>{formatSize(totalStorageUsed)}</div>
          <div style={styles.statLabel}>Storage Used</div>
          <div style={styles.storageBar}>
            <div style={styles.storageProgress}>
              <div
                style={{
                  ...styles.storageFill,
                  width: `${Math.min(storagePercent, 100)}%`,
                  background: storagePercent > 90 ? '#ef4444' : storagePercent > 70 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
            <div style={styles.storageText}>
              <span>{storagePercent.toFixed(0)}% used</span>
              <span>{formatSize(storageLimit)} limit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Backup History</span>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search backups..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredBackups.length === 0 ? (
          <div style={styles.empty}>
            <Database size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <span>No backups found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Backup</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Size</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredBackups.map((backup) => (
                <BackupRow
                  key={backup.id}
                  backup={backup}
                  onRestore={onRestoreBackup ? () => onRestoreBackup(backup.id) : undefined}
                  onDelete={onDeleteBackup ? () => onDeleteBackup(backup.id) : undefined}
                  onDownload={onDownloadBackup ? () => onDownloadBackup(backup.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BackupManagement;
