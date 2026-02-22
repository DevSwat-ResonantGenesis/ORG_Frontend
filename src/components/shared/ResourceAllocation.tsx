import React, { useState } from 'react';
import { Cpu, HardDrive, MemoryStick, Wifi, Server, Plus, Settings, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw, Search, BarChart3, Layers } from 'lucide-react';

type ResourceType = 'cpu' | 'memory' | 'storage' | 'network' | 'gpu';
type ResourceStatus = 'healthy' | 'warning' | 'critical' | 'offline';
type AllocationStatus = 'active' | 'pending' | 'suspended';

interface ResourceUsage {
  current: number;
  limit: number;
  unit: string;
}

interface ResourcePool {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  usage: ResourceUsage;
  allocated: number;
  available: number;
  reservations: number;
}

interface ResourceAllocationData {
  id: string;
  name: string;
  service: string;
  status: AllocationStatus;
  resources: {
    type: ResourceType;
    requested: number;
    allocated: number;
    used: number;
    unit: string;
  }[];
  priority: number;
  createdAt: Date;
  expiresAt?: Date;
}

interface ResourceAllocationProps {
  pools: ResourcePool[];
  allocations: ResourceAllocationData[];
  onCreateAllocation?: () => void;
  onEditAllocation?: (allocationId: string) => void;
  onDeleteAllocation?: (allocationId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

const RESOURCE_TYPE_CONFIG: Record<ResourceType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  cpu: { label: 'CPU', icon: <Cpu size={16} />, color: '#3b82f6' },
  memory: { label: 'Memory', icon: <MemoryStick size={16} />, color: '#8b5cf6' },
  storage: { label: 'Storage', icon: <HardDrive size={16} />, color: '#10b981' },
  network: { label: 'Network', icon: <Wifi size={16} />, color: '#f59e0b' },
  gpu: { label: 'GPU', icon: <Layers size={16} />, color: '#ec4899' },
};

const STATUS_CONFIG: Record<ResourceStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  healthy: {
    label: 'Healthy',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  warning: {
    label: 'Warning',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  critical: {
    label: 'Critical',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  offline: {
    label: 'Offline',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Server size={12} />,
  },
};

const ALLOCATION_STATUS_CONFIG: Record<AllocationStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  active: { label: 'Active', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  pending: { label: 'Pending', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  suspended: { label: 'Suspended', color: '#888', bgColor: 'rgba(255, 255, 255, 0.05)' },
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
  poolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  poolCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.15s',
  },
  poolCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  poolHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  poolIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poolName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  poolType: {
    fontSize: '0.6875rem',
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
  usageBar: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  usageFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  poolStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
    textAlign: 'center',
  },
  poolStat: {
    padding: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '6px',
  },
  poolStatValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#fff',
  },
  poolStatLabel: {
    fontSize: '0.5625rem',
    color: '#888',
    textTransform: 'uppercase',
  },
  allocationsSection: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  sectionTitle: {
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
  allocationName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  allocationService: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  resourceBars: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    minWidth: '150px',
  },
  resourceBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  resourceBarLabel: {
    fontSize: '0.6875rem',
    color: '#888',
    width: '40px',
  },
  resourceBarTrack: {
    flex: 1,
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  resourceBarFill: {
    height: '100%',
    borderRadius: '3px',
  },
  resourceBarValue: {
    fontSize: '0.6875rem',
    color: '#e4e4e7',
    width: '50px',
    textAlign: 'right',
  },
  priorityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
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

const getUsageColor = (percent: number) => {
  if (percent >= 90) return '#ef4444';
  if (percent >= 75) return '#f59e0b';
  return '#10b981';
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

interface PoolCardProps {
  pool: ResourcePool;
}

const PoolCard: React.FC<PoolCardProps> = ({ pool }) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = RESOURCE_TYPE_CONFIG[pool.type];
  const statusConfig = STATUS_CONFIG[pool.status];
  const usagePercent = (pool.usage.current / pool.usage.limit) * 100;
  const usageColor = getUsageColor(usagePercent);

  return (
    <div
      style={{
        ...styles.poolCard,
        ...(isHovered ? styles.poolCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.poolHeader}>
        <div
          style={{
            ...styles.poolIcon,
            background: `${typeConfig.color}20`,
            color: typeConfig.color,
          }}
        >
          {typeConfig.icon}
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

      <div style={styles.poolName}>{pool.name}</div>
      <div style={styles.poolType}>{typeConfig.label}</div>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <span style={{ fontSize: '0.6875rem', color: '#888' }}>Usage</span>
          <span style={{ fontSize: '0.6875rem', color: usageColor, fontWeight: '600' }}>
            {usagePercent.toFixed(1)}%
          </span>
        </div>
        <div style={styles.usageBar}>
          <div
            style={{
              ...styles.usageFill,
              width: `${usagePercent}%`,
              background: usageColor,
            }}
          />
        </div>
      </div>

      <div style={styles.poolStats}>
        <div style={styles.poolStat}>
          <div style={styles.poolStatValue}>{pool.allocated}</div>
          <div style={styles.poolStatLabel}>Allocated</div>
        </div>
        <div style={styles.poolStat}>
          <div style={styles.poolStatValue}>{pool.available}</div>
          <div style={styles.poolStatLabel}>Available</div>
        </div>
        <div style={styles.poolStat}>
          <div style={styles.poolStatValue}>{pool.reservations}</div>
          <div style={styles.poolStatLabel}>Reserved</div>
        </div>
      </div>
    </div>
  );
};

interface AllocationRowProps {
  allocation: ResourceAllocationData;
  onEdit?: () => void;
  onDelete?: () => void;
}

const AllocationRow: React.FC<AllocationRowProps> = ({
  allocation,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = ALLOCATION_STATUS_CONFIG[allocation.status];

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
        <div style={styles.allocationName}>{allocation.name}</div>
        <div style={styles.allocationService}>{allocation.service}</div>
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
        <div style={styles.resourceBars}>
          {allocation.resources.map((resource) => {
            const typeConfig = RESOURCE_TYPE_CONFIG[resource.type];
            const usagePercent = (resource.used / resource.allocated) * 100;

            return (
              <div key={resource.type} style={styles.resourceBar}>
                <span style={{ ...styles.resourceBarLabel, color: typeConfig.color }}>
                  {typeConfig.label}
                </span>
                <div style={styles.resourceBarTrack}>
                  <div
                    style={{
                      ...styles.resourceBarFill,
                      width: `${usagePercent}%`,
                      background: typeConfig.color,
                    }}
                  />
                </div>
                <span style={styles.resourceBarValue}>
                  {resource.used}/{resource.allocated}{resource.unit}
                </span>
              </div>
            );
          })}
        </div>
      </td>
      <td style={styles.td}>
        <span style={styles.priorityBadge}>{allocation.priority}</span>
      </td>
      <td style={styles.td}>{formatTimeAgo(allocation.createdAt)}</td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {onEdit && (
            <button style={styles.actionButton} onClick={onEdit}>
              <Settings size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const ResourceAllocation: React.FC<ResourceAllocationProps> = ({
  pools,
  allocations,
  onCreateAllocation,
  onEditAllocation,
  onDeleteAllocation,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAllocations = allocations.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Layers size={22} />
          Resource Allocation
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search allocations..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onRefresh && (
            <button style={styles.refreshButton} onClick={onRefresh}>
              <RefreshCw size={14} />
            </button>
          )}
          {onCreateAllocation && (
            <button style={styles.createButton} onClick={onCreateAllocation}>
              <Plus size={14} />
              New Allocation
            </button>
          )}
        </div>
      </div>

      {/* Resource Pools */}
      <div style={styles.poolsGrid}>
        {pools.map((pool) => (
          <PoolCard key={pool.id} pool={pool} />
        ))}
      </div>

      {/* Allocations Table */}
      <div style={styles.allocationsSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTitle}>Active Allocations ({filteredAllocations.length})</span>
        </div>
        {filteredAllocations.length === 0 ? (
          <div style={styles.empty}>
            <Layers size={24} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
            <span>No allocations found</span>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Allocation</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Resources</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filteredAllocations.map((allocation) => (
                <AllocationRow
                  key={allocation.id}
                  allocation={allocation}
                  onEdit={onEditAllocation ? () => onEditAllocation(allocation.id) : undefined}
                  onDelete={onDeleteAllocation ? () => onDeleteAllocation(allocation.id) : undefined}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ResourceAllocation;
