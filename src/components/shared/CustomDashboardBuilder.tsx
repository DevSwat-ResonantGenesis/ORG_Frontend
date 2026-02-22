import React, { useState } from 'react';
import { LayoutDashboard, Plus, Search, Settings, Eye, Edit2, Trash2, Copy, Save, Grid, Layers, BarChart3, LineChart, PieChart, Table, Clock, Users, Zap, Move, Maximize2, Minimize2 } from 'lucide-react';

type WidgetType = 'chart_line' | 'chart_bar' | 'chart_pie' | 'metric' | 'table' | 'list' | 'text' | 'clock';
type DashboardStatus = 'draft' | 'published' | 'archived';

interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataSource?: string;
  config?: Record<string, unknown>;
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  status: DashboardStatus;
  widgets: WidgetConfig[];
  columns: number;
  rows: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  sharedWith: string[];
}

interface CustomDashboardBuilderProps {
  dashboards: Dashboard[];
  onCreateDashboard?: () => void;
  onViewDashboard?: (dashboardId: string) => void;
  onEditDashboard?: (dashboardId: string) => void;
  onCloneDashboard?: (dashboardId: string) => void;
  onDeleteDashboard?: (dashboardId: string) => void;
  onSetDefault?: (dashboardId: string) => void;
  className?: string;
}

interface DashboardCardProps {
  dashboard: Dashboard;
  onView?: () => void;
  onEdit?: () => void;
  onClone?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}

const STATUS_CONFIG: Record<DashboardStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  draft: { label: 'Draft', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  published: { label: 'Published', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  archived: { label: 'Archived', color: '#888', bgColor: 'rgba(255, 255, 255, 0.05)' },
};

const WIDGET_TYPE_CONFIG: Record<WidgetType, {
  label: string;
  icon: React.ReactNode;
  color: string;
}> = {
  chart_line: { label: 'Line Chart', icon: <LineChart size={14} />, color: '#3b82f6' },
  chart_bar: { label: 'Bar Chart', icon: <BarChart3 size={14} />, color: '#10b981' },
  chart_pie: { label: 'Pie Chart', icon: <PieChart size={14} />, color: '#8b5cf6' },
  metric: { label: 'Metric', icon: <Zap size={14} />, color: '#f59e0b' },
  table: { label: 'Table', icon: <Table size={14} />, color: '#ec4899' },
  list: { label: 'List', icon: <Layers size={14} />, color: '#14b8a6' },
  text: { label: 'Text', icon: <Edit2 size={14} />, color: '#888' },
  clock: { label: 'Clock', icon: <Clock size={14} />, color: '#6366f1' },
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
  dashboardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '1rem',
  },
  dashboardCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  dashboardCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  dashboardCardDefault: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
  },
  dashboardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  dashboardTitle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  dashboardIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dashboardInfo: {
    flex: 1,
  },
  dashboardName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  defaultBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.5625rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
  },
  dashboardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  dashboardBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: '4px',
    height: '80px',
    marginBottom: '1rem',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '8px',
    padding: '8px',
  },
  previewWidget: {
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetsSummary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
    marginBottom: '1rem',
  },
  widgetBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  sharedSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sharedAvatars: {
    display: 'flex',
    alignItems: 'center',
  },
  sharedAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.5625rem',
    fontWeight: '600',
    color: '#3b82f6',
    border: '2px solid rgba(0, 0, 0, 0.3)',
    marginLeft: '-8px',
  },
  sharedCount: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  dashboardFooter: {
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
  editButton: {
    background: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    color: '#818cf8',
  },
  deleteButton: {
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
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

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getWidgetTypeCounts = (widgets: WidgetConfig[]) => {
  const counts: Record<string, number> = {};
  widgets.forEach(w => {
    counts[w.type] = (counts[w.type] || 0) + 1;
  });
  return counts;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  dashboard,
  onView,
  onEdit,
  onClone,
  onDelete,
  onSetDefault,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[dashboard.status];
  const widgetCounts = getWidgetTypeCounts(dashboard.widgets);

  return (
    <div
      style={{
        ...styles.dashboardCard,
        ...(isHovered ? styles.dashboardCardHover : {}),
        ...(dashboard.isDefault ? styles.dashboardCardDefault : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.dashboardHeader}>
        <div style={styles.dashboardTitle}>
          <div
            style={{
              ...styles.dashboardIcon,
              background: statusConfig.bgColor,
              color: statusConfig.color,
            }}
          >
            <LayoutDashboard size={22} />
          </div>
          <div style={styles.dashboardInfo}>
            <div style={styles.dashboardName}>
              {dashboard.name}
              {dashboard.isDefault && <span style={styles.defaultBadge}>Default</span>}
            </div>
            <div style={styles.dashboardMeta}>
              <span
                style={{
                  ...styles.statusBadge,
                  background: statusConfig.bgColor,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </span>
              <span style={{ fontSize: '0.6875rem', color: '#888' }}>
                {dashboard.widgets.length} widgets
              </span>
              <span style={{ fontSize: '0.6875rem', color: '#888' }}>
                {dashboard.columns}x{dashboard.rows} grid
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.dashboardBody}>
        {dashboard.description && (
          <p style={styles.description}>{dashboard.description}</p>
        )}

        {/* Mini Preview Grid */}
        <div style={styles.previewGrid}>
          {dashboard.widgets.slice(0, 6).map((widget) => {
            const config = WIDGET_TYPE_CONFIG[widget.type];
            return (
              <div
                key={widget.id}
                style={{
                  ...styles.previewWidget,
                  background: `${config.color}30`,
                  color: config.color,
                  gridColumn: `span ${Math.min(widget.width, 2)}`,
                  gridRow: `span ${Math.min(widget.height, 1)}`,
                }}
              >
                {config.icon}
              </div>
            );
          })}
        </div>

        {/* Widget Type Summary */}
        <div style={styles.widgetsSummary}>
          {Object.entries(widgetCounts).slice(0, 4).map(([type, count]) => {
            const config = WIDGET_TYPE_CONFIG[type as WidgetType];
            return (
              <span key={type} style={{ ...styles.widgetBadge, color: config.color }}>
                {config.icon}
                {count}x {config.label}
              </span>
            );
          })}
        </div>

        {/* Shared With */}
        {dashboard.sharedWith.length > 0 && (
          <div style={styles.sharedSection}>
            <div style={styles.sharedAvatars}>
              {dashboard.sharedWith.slice(0, 3).map((user, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.sharedAvatar,
                    marginLeft: idx === 0 ? 0 : '-8px',
                  }}
                >
                  {user.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <span style={styles.sharedCount}>
              Shared with {dashboard.sharedWith.length} user{dashboard.sharedWith.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div style={styles.dashboardFooter}>
        <div style={styles.footerMeta}>
          <span>By {dashboard.createdBy}</span>
          <span>Updated {formatTimeAgo(dashboard.updatedAt)}</span>
        </div>
        <div style={styles.actionButtons}>
          {!dashboard.isDefault && onSetDefault && (
            <button style={styles.iconButton} onClick={onSetDefault} title="Set as Default">
              <Grid size={14} />
            </button>
          )}
          {onClone && (
            <button style={styles.iconButton} onClick={onClone} title="Clone">
              <Copy size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View">
              <Eye size={14} />
            </button>
          )}
          {onEdit && (
            <button style={{ ...styles.iconButton, ...styles.editButton }} onClick={onEdit} title="Edit">
              <Edit2 size={14} />
            </button>
          )}
          {onDelete && !dashboard.isDefault && (
            <button style={{ ...styles.iconButton, ...styles.deleteButton }} onClick={onDelete} title="Delete">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const CustomDashboardBuilder: React.FC<CustomDashboardBuilderProps> = ({
  dashboards,
  onCreateDashboard,
  onViewDashboard,
  onEditDashboard,
  onCloneDashboard,
  onDeleteDashboard,
  onSetDefault,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DashboardStatus | 'all'>('all');

  const filteredDashboards = dashboards.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return d.name.toLowerCase().includes(query);
    }
    return true;
  });

  const publishedCount = dashboards.filter(d => d.status === 'published').length;
  const draftCount = dashboards.filter(d => d.status === 'draft').length;
  const totalWidgets = dashboards.reduce((sum, d) => sum + d.widgets.length, 0);
  const sharedCount = dashboards.filter(d => d.sharedWith.length > 0).length;

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <LayoutDashboard size={22} />
          Custom Dashboard Builder
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search dashboards..."
              style={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {onCreateDashboard && (
            <button style={styles.createButton} onClick={onCreateDashboard}>
              <Plus size={14} />
              New Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <LayoutDashboard size={20} />
          </div>
          <div style={styles.statValue}>{publishedCount}</div>
          <div style={styles.statLabel}>Published</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Edit2 size={20} />
          </div>
          <div style={styles.statValue}>{draftCount}</div>
          <div style={styles.statLabel}>Drafts</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Layers size={20} />
          </div>
          <div style={styles.statValue}>{totalWidgets}</div>
          <div style={styles.statLabel}>Total Widgets</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Users size={20} />
          </div>
          <div style={styles.statValue}>{sharedCount}</div>
          <div style={styles.statLabel}>Shared</div>
        </div>
      </div>

      {/* Dashboards Grid */}
      {filteredDashboards.length === 0 ? (
        <div style={styles.empty}>
          <LayoutDashboard size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No dashboards found</span>
        </div>
      ) : (
        <div style={styles.dashboardsGrid}>
          {filteredDashboards.map((dashboard) => (
            <DashboardCard
              key={dashboard.id}
              dashboard={dashboard}
              onView={onViewDashboard ? () => onViewDashboard(dashboard.id) : undefined}
              onEdit={onEditDashboard ? () => onEditDashboard(dashboard.id) : undefined}
              onClone={onCloneDashboard ? () => onCloneDashboard(dashboard.id) : undefined}
              onDelete={onDeleteDashboard ? () => onDeleteDashboard(dashboard.id) : undefined}
              onSetDefault={onSetDefault ? () => onSetDefault(dashboard.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDashboardBuilder;
