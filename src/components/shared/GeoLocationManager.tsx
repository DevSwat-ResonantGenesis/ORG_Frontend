import React, { useState } from 'react';
import { MapPin, Plus, Search, Settings, Eye, Edit2, Trash2, CheckCircle, XCircle, AlertTriangle, Globe, Users, Shield, Clock, Filter, ChevronRight, ChevronDown } from 'lucide-react';

type RegionStatus = 'active' | 'restricted' | 'blocked' | 'pending';
type RestrictionType = 'allow' | 'deny' | 'require_verification';

interface GeoRegion {
  id: string;
  name: string;
  code: string;
  type: 'country' | 'region' | 'city' | 'custom';
  status: RegionStatus;
  restrictionType: RestrictionType;
  userCount: number;
  requestCount: number;
  blockedCount: number;
  rules?: string[];
  parentId?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: Date;
  updatedAt: Date;
}

interface GeoRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  regions: string[];
  action: RestrictionType;
  conditions?: string[];
  priority: number;
}

interface GeoLocationManagerProps {
  regions: GeoRegion[];
  rules: GeoRule[];
  onCreateRegion?: () => void;
  onViewRegion?: (regionId: string) => void;
  onEditRegion?: (regionId: string) => void;
  onDeleteRegion?: (regionId: string) => void;
  onCreateRule?: () => void;
  onEditRule?: (ruleId: string) => void;
  onToggleRule?: (ruleId: string) => void;
  className?: string;
}

interface RegionRowProps {
  region: GeoRegion;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<RegionStatus, {
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
  restricted: {
    label: 'Restricted',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <AlertTriangle size={12} />,
  },
  blocked: {
    label: 'Blocked',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
  pending: {
    label: 'Pending',
    color: '#888',
    bgColor: 'rgba(255, 255, 255, 0.05)',
    icon: <Clock size={12} />,
  },
};

const RESTRICTION_CONFIG: Record<RestrictionType, {
  label: string;
  color: string;
}> = {
  allow: { label: 'Allow', color: '#10b981' },
  deny: { label: 'Deny', color: '#ef4444' },
  require_verification: { label: 'Verify', color: '#f59e0b' },
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
    gridTemplateColumns: '1fr 320px',
    gap: '1.5rem',
  },
  regionsSection: {
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
  regionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  regionIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontWeight: '500',
    color: '#fff',
    marginBottom: '0.125rem',
  },
  regionCode: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
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
  restrictionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  statsCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.75rem',
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
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
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  rulesCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  rulesHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  rulesTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  addRuleButton: {
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
  rulesList: {
    padding: '0.5rem',
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '0.25rem',
    transition: 'background 0.15s',
  },
  ruleItemHover: {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  ruleToggle: {
    width: '36px',
    height: '20px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  ruleToggleActive: {
    background: 'rgba(16, 185, 129, 0.5)',
  },
  ruleToggleKnob: {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.15s',
  },
  ruleToggleKnobActive: {
    left: '18px',
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: '#e4e4e7',
    marginBottom: '0.125rem',
  },
  ruleMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.6875rem',
    color: '#888',
  },
  ruleActionBadge: {
    fontSize: '0.5625rem',
    fontWeight: '600',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
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

const RegionRow: React.FC<RegionRowProps> = ({
  region,
  onView,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[region.status];
  const restrictionConfig = RESTRICTION_CONFIG[region.restrictionType];

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
        <div style={styles.regionCell}>
          <div
            style={{
              ...styles.regionIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <MapPin size={18} />
          </div>
          <div style={styles.regionInfo}>
            <div style={styles.regionName}>{region.name}</div>
            <div style={styles.regionCode}>{region.code}</div>
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
        <span style={{ ...styles.restrictionBadge, color: restrictionConfig.color }}>
          {restrictionConfig.label}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.statsCell}>
          <span style={styles.statRow}>
            <Users size={12} />
            {formatNumber(region.userCount)} users
          </span>
          <span style={styles.statRow}>
            <Globe size={12} />
            {formatNumber(region.requestCount)} requests
          </span>
        </div>
      </td>
      <td style={styles.td}>
        <span style={{ color: '#ef4444', fontWeight: '500' }}>
          {formatNumber(region.blockedCount)}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.actionButtons}>
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={styles.iconButton} onClick={onEdit} title="Edit">
              <Settings size={14} />
            </button>
          )}
          {onDelete && (
            <button style={{ ...styles.iconButton, ...styles.deleteButton }} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export const GeoLocationManager: React.FC<GeoLocationManagerProps> = ({
  regions,
  rules,
  onCreateRegion,
  onViewRegion,
  onEditRegion,
  onDeleteRegion,
  onCreateRule,
  onEditRule,
  onToggleRule,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRegions = regions.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRegions = regions.filter(r => r.status === 'active').length;
  const blockedRegions = regions.filter(r => r.status === 'blocked').length;
  const totalUsers = regions.reduce((sum, r) => sum + r.userCount, 0);
  const totalBlocked = regions.reduce((sum, r) => sum + r.blockedCount, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <MapPin size={22} />
          Geo Location Manager
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search regions..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateRegion && (
            <button style={styles.createButton} onClick={onCreateRegion}>
              <Plus size={14} />
              Add Region
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Globe size={20} />
          </div>
          <div style={styles.statValue}>{activeRegions}</div>
          <div style={styles.statLabel}>Active Regions</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <Shield size={20} />
          </div>
          <div style={styles.statValue}>{blockedRegions}</div>
          <div style={styles.statLabel}>Blocked</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Users size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalUsers)}</div>
          <div style={styles.statLabel}>Total Users</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalBlocked)}</div>
          <div style={styles.statLabel}>Blocked Requests</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Regions Table */}
        <div style={styles.regionsSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTitle}>Regions ({filteredRegions.length})</span>
          </div>
          {filteredRegions.length === 0 ? (
            <div style={styles.empty}>
              <MapPin size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <span>No regions found</span>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Region</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Restriction</th>
                  <th style={styles.th}>Activity</th>
                  <th style={styles.th}>Blocked</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRegions.map((region) => (
                  <RegionRow
                    key={region.id}
                    region={region}
                    onView={onViewRegion ? () => onViewRegion(region.id) : undefined}
                    onEdit={onEditRegion ? () => onEditRegion(region.id) : undefined}
                    onDelete={onDeleteRegion ? () => onDeleteRegion(region.id) : undefined}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sidebar - Rules */}
        <div style={styles.sidebar}>
          <div style={styles.rulesCard}>
            <div style={styles.rulesHeader}>
              <span style={styles.rulesTitle}>Geo Rules</span>
              {onCreateRule && (
                <button style={styles.addRuleButton} onClick={onCreateRule}>
                  <Plus size={14} />
                </button>
              )}
            </div>
            <div style={styles.rulesList}>
              {rules.map((rule) => {
                const actionConfig = RESTRICTION_CONFIG[rule.action];
                return (
                  <div
                    key={rule.id}
                    style={styles.ruleItem}
                    onClick={onEditRule ? () => onEditRule(rule.id) : undefined}
                  >
                    <div
                      style={{
                        ...styles.ruleToggle,
                        ...(rule.enabled ? styles.ruleToggleActive : {}),
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRule?.(rule.id);
                      }}
                    >
                      <div
                        style={{
                          ...styles.ruleToggleKnob,
                          ...(rule.enabled ? styles.ruleToggleKnobActive : {}),
                        }}
                      />
                    </div>
                    <div style={styles.ruleInfo}>
                      <div style={styles.ruleName}>{rule.name}</div>
                      <div style={styles.ruleMeta}>
                        <span>{rule.regions.length} regions</span>
                        <span
                          style={{
                            ...styles.ruleActionBadge,
                            background: `${actionConfig.color}20`,
                            color: actionConfig.color,
                          }}
                        >
                          {actionConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeoLocationManager;
