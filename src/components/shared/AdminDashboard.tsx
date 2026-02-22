import React, { useState } from 'react';
import { LayoutDashboard, Users, Bot, Settings, Key, CreditCard, BarChart3, Terminal, Bell, Webhook, Plug, Gauge, Crown, Flag, Wrench, Database, Shield, ChevronRight, TrendingUp, TrendingDown, Activity, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

type NavItem = 'overview' | 'users' | 'agents' | 'settings' | 'api-keys' | 'billing' | 'analytics' | 'logs' | 'notifications' | 'webhooks' | 'integrations' | 'quotas' | 'tiers' | 'feature-flags' | 'maintenance' | 'backups' | 'security';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalAgents: number;
  activeAgents: number;
  totalSessions: number;
  totalTokens: number;
  revenue: number;
  revenueChange: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'agent' | 'system' | 'security';
  message: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error';
}

interface SystemHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency?: number;
  uptime?: number;
}

interface AdminDashboardProps {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  systemHealth: SystemHealth[];
  activeNav?: NavItem;
  onNavChange?: (nav: NavItem) => void;
  className?: string;
}

const NAV_ITEMS: { id: NavItem; label: string; icon: React.ReactNode; category: string }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} />, category: 'General' },
  { id: 'users', label: 'Users', icon: <Users size={18} />, category: 'General' },
  { id: 'agents', label: 'Agents', icon: <Bot size={18} />, category: 'General' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} />, category: 'General' },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} />, category: 'Configuration' },
  { id: 'api-keys', label: 'API Keys', icon: <Key size={18} />, category: 'Configuration' },
  { id: 'webhooks', label: 'Webhooks', icon: <Webhook size={18} />, category: 'Configuration' },
  { id: 'integrations', label: 'Integrations', icon: <Plug size={18} />, category: 'Configuration' },
  { id: 'feature-flags', label: 'Feature Flags', icon: <Flag size={18} />, category: 'Configuration' },
  { id: 'billing', label: 'Billing', icon: <CreditCard size={18} />, category: 'Business' },
  { id: 'tiers', label: 'Tiers', icon: <Crown size={18} />, category: 'Business' },
  { id: 'quotas', label: 'Quotas', icon: <Gauge size={18} />, category: 'Business' },
  { id: 'logs', label: 'Logs', icon: <Terminal size={18} />, category: 'Operations' },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} />, category: 'Operations' },
  { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={18} />, category: 'Operations' },
  { id: 'backups', label: 'Backups', icon: <Database size={18} />, category: 'Operations' },
  { id: 'security', label: 'Security', icon: <Shield size={18} />, category: 'Operations' },
];

const HEALTH_CONFIG: Record<string, { color: string; bgColor: string }> = {
  healthy: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  degraded: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  down: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0a0a0f',
  },
  sidebar: {
    width: '260px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '1.5rem 0',
    flexShrink: 0,
    overflowY: 'auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 1.5rem 1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '1rem',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  logoText: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#fff',
  },
  logoSubtext: {
    fontSize: '0.6875rem',
    color: '#888',
  },
  navCategory: {
    padding: '0.5rem 1.5rem',
    fontSize: '0.6875rem',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    borderRight: '2px solid #818cf8',
  },
  main: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#888',
    marginTop: '0.25rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  statLabel: {
    fontSize: '0.8125rem',
    color: '#888',
  },
  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  statTrendUp: {
    color: '#10b981',
  },
  statTrendDown: {
    color: '#ef4444',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
  },
  statMeta: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.25rem',
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  cardTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#fff',
  },
  cardContent: {
    padding: '1rem',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    transition: 'background 0.15s',
  },
  activityIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityMessage: {
    flex: 1,
    fontSize: '0.8125rem',
    color: '#e4e4e7',
  },
  activityTime: {
    fontSize: '0.6875rem',
    color: '#666',
  },
  healthItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  healthService: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#e4e4e7',
  },
  healthDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  healthMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#888',
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
  },
  quickAction: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    color: '#888',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  quickActionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  recentActivity,
  systemHealth,
  activeNav = 'overview',
  onNavChange,
  className,
}) => {
  const [hoveredNav, setHoveredNav] = useState<NavItem | null>(null);

  const categories = [...new Set(NAV_ITEMS.map(item => item.category))];

  const getActivityIcon = (type: string, status?: string) => {
    const color = status === 'error' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';
    const bgColor = status === 'error' ? 'rgba(239, 68, 68, 0.15)' : status === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    
    const icons: Record<string, React.ReactNode> = {
      user: <Users size={14} />,
      agent: <Bot size={14} />,
      system: <Settings size={14} />,
      security: <Shield size={14} />,
    };

    return (
      <div style={{ ...styles.activityIcon, background: bgColor, color }}>
        {icons[type] || <Activity size={14} />}
      </div>
    );
  };

  return (
    <div style={styles.container} className={className}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <LayoutDashboard size={20} />
          </div>
          <div>
            <div style={styles.logoText}>Admin Panel</div>
            <div style={styles.logoSubtext}>Genesis 2026</div>
          </div>
        </div>

        {categories.map(category => (
          <div key={category}>
            <div style={styles.navCategory}>{category}</div>
            {NAV_ITEMS.filter(item => item.category === category).map(item => (
              <button
                key={item.id}
                style={{
                  ...styles.navItem,
                  ...(activeNav === item.id ? styles.navItemActive : {}),
                  ...(hoveredNav === item.id && activeNav !== item.id ? { background: 'rgba(255, 255, 255, 0.03)', color: '#e4e4e7' } : {}),
                }}
                onClick={() => onNavChange?.(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard Overview</h1>
            <p style={styles.subtitle}>Welcome back! Here's what's happening with your platform.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Total Users</span>
              <span style={{ ...styles.statTrend, ...styles.statTrendUp }}>
                <TrendingUp size={12} />
                +12%
              </span>
            </div>
            <div style={styles.statValue}>{formatNumber(stats.totalUsers)}</div>
            <div style={styles.statMeta}>{formatNumber(stats.activeUsers)} active</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Total Agents</span>
              <span style={{ ...styles.statTrend, ...styles.statTrendUp }}>
                <TrendingUp size={12} />
                +8%
              </span>
            </div>
            <div style={styles.statValue}>{formatNumber(stats.totalAgents)}</div>
            <div style={styles.statMeta}>{formatNumber(stats.activeAgents)} running</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Total Sessions</span>
            </div>
            <div style={styles.statValue}>{formatNumber(stats.totalSessions)}</div>
            <div style={styles.statMeta}>{formatNumber(stats.totalTokens)} tokens</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statLabel}>Revenue</span>
              <span style={{
                ...styles.statTrend,
                ...(stats.revenueChange >= 0 ? styles.statTrendUp : styles.statTrendDown),
              }}>
                {stats.revenueChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange}%
              </span>
            </div>
            <div style={styles.statValue}>{formatCurrency(stats.revenue)}</div>
            <div style={styles.statMeta}>This month</div>
          </div>
        </div>

        {/* Activity & Health */}
        <div style={styles.gridRow}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Recent Activity</span>
              <button style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View All <ChevronRight size={12} />
              </button>
            </div>
            <div style={styles.cardContent}>
              {recentActivity.slice(0, 5).map(activity => (
                <div key={activity.id} style={styles.activityItem}>
                  {getActivityIcon(activity.type, activity.status)}
                  <div style={{ flex: 1 }}>
                    <div style={styles.activityMessage}>{activity.message}</div>
                    <div style={styles.activityTime}>{formatTimeAgo(activity.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>System Health</span>
            </div>
            <div style={styles.cardContent}>
              {systemHealth.map(service => {
                const config = HEALTH_CONFIG[service.status];
                return (
                  <div key={service.service} style={styles.healthItem}>
                    <div style={styles.healthService}>
                      <div style={{ ...styles.healthDot, background: config.color }} />
                      {service.service}
                    </div>
                    <div style={styles.healthMeta}>
                      {service.latency && <span>{service.latency}ms</span>}
                      {service.uptime && <span>{service.uptime}%</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>Quick Actions</span>
          </div>
          <div style={{ ...styles.cardContent, padding: '1.25rem' }}>
            <div style={styles.quickActions}>
              <button style={styles.quickAction} onClick={() => onNavChange?.('users')}>
                <div style={{ ...styles.quickActionIcon, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <Users size={18} />
                </div>
                Manage Users
              </button>
              <button style={styles.quickAction} onClick={() => onNavChange?.('agents')}>
                <div style={{ ...styles.quickActionIcon, background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                  <Bot size={18} />
                </div>
                Manage Agents
              </button>
              <button style={styles.quickAction} onClick={() => onNavChange?.('settings')}>
                <div style={{ ...styles.quickActionIcon, background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <Settings size={18} />
                </div>
                System Settings
              </button>
              <button style={styles.quickAction} onClick={() => onNavChange?.('security')}>
                <div style={{ ...styles.quickActionIcon, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <Shield size={18} />
                </div>
                Security Audit
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
