import React, { useState } from 'react';
import { Puzzle, Search, Download, CheckCircle, XCircle, Star, Settings, Eye, Trash2, RefreshCw, Filter, Grid, List, ExternalLink, Shield, Zap, Clock, User } from 'lucide-react';

type PluginStatus = 'installed' | 'available' | 'update_available' | 'incompatible';
type PluginCategory = 'integration' | 'analytics' | 'security' | 'ai' | 'automation' | 'utility';

interface PluginAuthor {
  name: string;
  verified: boolean;
  avatar?: string;
}

interface PluginVersion {
  version: string;
  releaseDate: Date;
  changelog?: string;
}

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: PluginCategory;
  status: PluginStatus;
  author: PluginAuthor;
  currentVersion: string;
  latestVersion?: string;
  rating: number;
  downloads: number;
  icon?: string;
  tags: string[];
  permissions: string[];
  installedAt?: Date;
  updatedAt?: Date;
}

interface PluginMarketplaceProps {
  plugins: Plugin[];
  onInstallPlugin?: (pluginId: string) => void;
  onUninstallPlugin?: (pluginId: string) => void;
  onUpdatePlugin?: (pluginId: string) => void;
  onViewPlugin?: (pluginId: string) => void;
  onConfigurePlugin?: (pluginId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface PluginCardProps {
  plugin: Plugin;
  onInstall?: () => void;
  onUninstall?: () => void;
  onUpdate?: () => void;
  onView?: () => void;
  onConfigure?: () => void;
}

const STATUS_CONFIG: Record<PluginStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  installed: {
    label: 'Installed',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    icon: <CheckCircle size={12} />,
  },
  available: {
    label: 'Available',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    icon: <Download size={12} />,
  },
  update_available: {
    label: 'Update Available',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    icon: <RefreshCw size={12} />,
  },
  incompatible: {
    label: 'Incompatible',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: <XCircle size={12} />,
  },
};

const CATEGORY_CONFIG: Record<PluginCategory, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  integration: { label: 'Integration', color: '#3b82f6', icon: <Puzzle size={14} /> },
  analytics: { label: 'Analytics', color: '#10b981', icon: <Zap size={14} /> },
  security: { label: 'Security', color: '#ef4444', icon: <Shield size={14} /> },
  ai: { label: 'AI', color: '#8b5cf6', icon: <Zap size={14} /> },
  automation: { label: 'Automation', color: '#f59e0b', icon: <Clock size={14} /> },
  utility: { label: 'Utility', color: '#888', icon: <Settings size={14} /> },
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
  categoryTabs: {
    display: 'flex',
    gap: '0.25rem',
    padding: '0.25rem',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '8px',
    overflowX: 'auto',
  },
  categoryTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  categoryTabActive: {
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#818cf8',
  },
  pluginsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
  },
  pluginCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  pluginCardHover: {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pluginHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  pluginIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '1.25rem',
  },
  pluginInfo: {
    flex: 1,
    minWidth: 0,
  },
  pluginName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.25rem',
  },
  pluginMeta: {
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
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: '600',
  },
  pluginBody: {
    padding: '1.25rem',
  },
  description: {
    fontSize: '0.8125rem',
    color: '#888',
    marginBottom: '1rem',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  pluginStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  ratingStars: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.125rem',
  },
  authorSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  authorAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.625rem',
    fontWeight: '600',
    color: '#818cf8',
  },
  authorName: {
    fontSize: '0.75rem',
    color: '#888',
  },
  verifiedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.625rem',
    color: '#10b981',
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  tag: {
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#888',
  },
  pluginFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  versionInfo: {
    fontSize: '0.6875rem',
    color: '#888',
    fontFamily: "'JetBrains Mono', monospace",
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
  installButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  updateButton: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  uninstallButton: {
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

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={10}
      fill={i < Math.floor(rating) ? '#f59e0b' : 'transparent'}
      color={i < Math.floor(rating) ? '#f59e0b' : '#888'}
    />
  ));
};

const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  onInstall,
  onUninstall,
  onUpdate,
  onView,
  onConfigure,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusConfig = STATUS_CONFIG[plugin.status];
  const categoryConfig = CATEGORY_CONFIG[plugin.category];

  return (
    <div
      style={{
        ...styles.pluginCard,
        ...(isHovered ? styles.pluginCardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.pluginHeader}>
        <div
          style={{
            ...styles.pluginIcon,
            background: `${categoryConfig.color}20`,
            color: categoryConfig.color,
          }}
        >
          {categoryConfig.icon}
        </div>
        <div style={styles.pluginInfo}>
          <div style={styles.pluginName}>{plugin.name}</div>
          <div style={styles.pluginMeta}>
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
            <span
              style={{
                ...styles.categoryBadge,
                background: `${categoryConfig.color}20`,
                color: categoryConfig.color,
              }}
            >
              {categoryConfig.label}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.pluginBody}>
        <p style={styles.description}>{plugin.description}</p>

        <div style={styles.pluginStats}>
          <span style={styles.statItem}>
            <div style={styles.ratingStars}>{renderStars(plugin.rating)}</div>
            {plugin.rating.toFixed(1)}
          </span>
          <span style={styles.statItem}>
            <Download size={12} />
            {formatNumber(plugin.downloads)}
          </span>
        </div>

        <div style={styles.authorSection}>
          <div style={styles.authorAvatar}>
            {plugin.author.name.charAt(0).toUpperCase()}
          </div>
          <span style={styles.authorName}>{plugin.author.name}</span>
          {plugin.author.verified && (
            <span style={styles.verifiedBadge}>
              <CheckCircle size={10} />
              Verified
            </span>
          )}
        </div>

        {plugin.tags.length > 0 && (
          <div style={styles.tagsList}>
            {plugin.tags.slice(0, 4).map((tag) => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      <div style={styles.pluginFooter}>
        <span style={styles.versionInfo}>
          v{plugin.currentVersion}
          {plugin.latestVersion && plugin.latestVersion !== plugin.currentVersion && (
            <span style={{ color: '#f59e0b' }}> → v{plugin.latestVersion}</span>
          )}
        </span>
        <div style={styles.actionButtons}>
          {plugin.status === 'available' && onInstall && (
            <button style={styles.installButton} onClick={onInstall}>
              <Download size={12} />
              Install
            </button>
          )}
          {plugin.status === 'update_available' && onUpdate && (
            <button style={{ ...styles.installButton, ...styles.updateButton }} onClick={onUpdate}>
              <RefreshCw size={12} />
              Update
            </button>
          )}
          {plugin.status === 'installed' && onConfigure && (
            <button style={styles.iconButton} onClick={onConfigure} title="Configure">
              <Settings size={14} />
            </button>
          )}
          {onView && (
            <button style={styles.iconButton} onClick={onView} title="View Details">
              <Eye size={14} />
            </button>
          )}
          {plugin.status === 'installed' && onUninstall && (
            <button style={{ ...styles.iconButton, ...styles.uninstallButton }} onClick={onUninstall} title="Uninstall">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({
  plugins,
  onInstallPlugin,
  onUninstallPlugin,
  onUpdatePlugin,
  onViewPlugin,
  onConfigurePlugin,
  onRefresh,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all');

  const filteredPlugins = plugins.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const installedCount = plugins.filter(p => p.status === 'installed').length;
  const availableCount = plugins.filter(p => p.status === 'available').length;
  const updatesCount = plugins.filter(p => p.status === 'update_available').length;
  const totalDownloads = plugins.reduce((sum, p) => sum + p.downloads, 0);

  return (
    <div style={styles.container} className={className}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <Puzzle size={22} />
          Plugin Marketplace
        </h2>
        <div style={styles.headerActions}>
          <div style={styles.searchInput}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Search plugins..."
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
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle size={20} />
          </div>
          <div style={styles.statValue}>{installedCount}</div>
          <div style={styles.statLabel}>Installed</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Puzzle size={20} />
          </div>
          <div style={styles.statValue}>{availableCount}</div>
          <div style={styles.statLabel}>Available</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <RefreshCw size={20} />
          </div>
          <div style={styles.statValue}>{updatesCount}</div>
          <div style={styles.statLabel}>Updates</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
            <Download size={20} />
          </div>
          <div style={styles.statValue}>{formatNumber(totalDownloads)}</div>
          <div style={styles.statLabel}>Total Downloads</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={styles.categoryTabs}>
        <button
          style={{
            ...styles.categoryTab,
            ...(selectedCategory === 'all' ? styles.categoryTabActive : {}),
          }}
          onClick={() => setSelectedCategory('all')}
        >
          All
        </button>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <button
            key={key}
            style={{
              ...styles.categoryTab,
              ...(selectedCategory === key ? styles.categoryTabActive : {}),
            }}
            onClick={() => setSelectedCategory(key as PluginCategory)}
          >
            {config.icon}
            {config.label}
          </button>
        ))}
      </div>

      {/* Plugins Grid */}
      {filteredPlugins.length === 0 ? (
        <div style={styles.empty}>
          <Puzzle size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
          <span>No plugins found</span>
        </div>
      ) : (
        <div style={styles.pluginsGrid}>
          {filteredPlugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              onInstall={onInstallPlugin ? () => onInstallPlugin(plugin.id) : undefined}
              onUninstall={onUninstallPlugin ? () => onUninstallPlugin(plugin.id) : undefined}
              onUpdate={onUpdatePlugin ? () => onUpdatePlugin(plugin.id) : undefined}
              onView={onViewPlugin ? () => onViewPlugin(plugin.id) : undefined}
              onConfigure={onConfigurePlugin ? () => onConfigurePlugin(plugin.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PluginMarketplace;
