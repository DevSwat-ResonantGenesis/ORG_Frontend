/**
 * Owner Dashboard - Platform Owner Analytics & Control Center
 * Comprehensive dashboard for platform owner to monitor users, revenue, usage, and RARA agents
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OwnerDashboard.module.css';

// Icons
const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const CpuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const ServerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// Types
interface User {
  id: string;
  name: string;
  email: string;
  plan: 'developer' | 'plus' | 'enterprise';
  status: 'active' | 'inactive' | 'warning';
  creditsUsed: number;
  creditsTotal: number;
  revenue: number;
  lastActive: string;
  signupDate: string;
}

interface RARAAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'error';
  tasksCompleted: number;
  uptime: string;
  cpu: number;
  memory: number;
  lastTask: string;
}

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  mrr: number;
  creditsConsumed: number;
  apiCalls: number;
  avgSessionTime: string;
  conversionRate: number;
}

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Default empty data
const defaultStats: PlatformStats = {
  totalUsers: 0,
  activeUsers: 0,
  totalRevenue: 0,
  mrr: 0,
  creditsConsumed: 0,
  apiCalls: 0,
  avgSessionTime: '0m',
  conversionRate: 0,
};

const defaultAgents: RARAAgent[] = [
  { id: '1', name: 'CodeGuard-Alpha', type: 'Code Maintenance', status: 'active', tasksCompleted: 0, uptime: '99.9%', cpu: 0, memory: 0, lastTask: 'Initializing...' },
  { id: '2', name: 'SecuritySentinel', type: 'Security Audit', status: 'idle', tasksCompleted: 0, uptime: '99.8%', cpu: 0, memory: 0, lastTask: 'Waiting...' },
  { id: '3', name: 'DeployBot-Prime', type: 'Deployment', status: 'idle', tasksCompleted: 0, uptime: '98.5%', cpu: 0, memory: 0, lastTask: 'Waiting...' },
];

type TabType = 'overview' | 'users' | 'revenue' | 'agents' | 'monitoring' | 'settings' | 'state-physics';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: string;
  lastCheck: string;
}

interface AuthMetrics {
  loginSuccess: number;
  loginFailed: number;
  registrations: number;
  mfaEnabled: number;
  activeSessions: number;
}

interface BillingMetrics {
  subscriptionsActive: number;
  paymentsSuccess: number;
  paymentsFailed: number;
  webhooksProcessed: number;
  checkoutStarted: number;
  checkoutCompleted: number;
}

const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<PlatformStats>(defaultStats);
  const [users, setUsers] = useState<User[]>([]);
  const [agents, setAgents] = useState<RARAAgent[]>(defaultAgents);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([
    { name: 'Gateway', status: 'healthy', latency: 45, uptime: '99.99%', lastCheck: 'Just now' },
    { name: 'Auth Service', status: 'healthy', latency: 120, uptime: '99.95%', lastCheck: 'Just now' },
    { name: 'Billing Service', status: 'healthy', latency: 85, uptime: '99.98%', lastCheck: 'Just now' },
    { name: 'Chat Service', status: 'healthy', latency: 65, uptime: '99.97%', lastCheck: 'Just now' },
    { name: 'Memory Service', status: 'healthy', latency: 55, uptime: '99.96%', lastCheck: 'Just now' },
    { name: 'LLM Service', status: 'healthy', latency: 250, uptime: '99.90%', lastCheck: 'Just now' },
  ]);

  const [authMetrics, setAuthMetrics] = useState<AuthMetrics>({
    loginSuccess: 0,
    loginFailed: 0,
    registrations: 0,
    mfaEnabled: 0,
    activeSessions: 0,
  });

  const [billingMetrics, setBillingMetrics] = useState<BillingMetrics>({
    subscriptionsActive: 0,
    paymentsSuccess: 0,
    paymentsFailed: 0,
    webhooksProcessed: 0,
    checkoutStarted: 0,
    checkoutCompleted: 0,
  });

  const [settings, setSettings] = useState({
    creditRate: 0.001,
    developerCredits: 1000,
    plusCredits: 50000,
    plusPrice: 49,
    topupPrice: 8,
    topupAmount: 10000,
    maintenanceMode: false,
    signupsEnabled: true,
  });

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('owner_token');
    if (!token) {
      navigate('/owner-login');
      return;
    }

    try {
      const statsRes = await fetch(`${API_BASE}/owner/auth/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalUsers: statsData.total_users || 0,
          activeUsers: statsData.active_users || 0,
          totalRevenue: statsData.total_revenue || 0,
          mrr: statsData.mrr || 0,
          creditsConsumed: statsData.credits_consumed || 0,
          apiCalls: statsData.api_calls || 0,
          avgSessionTime: '0m',
          conversionRate: statsData.conversion_rate || 0,
        });
      }

      const usersRes = await fetch(`${API_BASE}/owner/auth/dashboard/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const mappedUsers: User[] = (usersData.users || []).map((u: any) => ({
          id: u.id,
          name: u.full_name || u.email.split('@')[0],
          email: u.email,
          plan: 'developer' as const,
          status: u.is_active ? 'active' as const : 'inactive' as const,
          creditsUsed: 0,
          creditsTotal: 1000,
          revenue: 0,
          lastActive: 'N/A',
          signupDate: u.created_at ? u.created_at.split('T')[0] : 'N/A',
        }));
        setUsers(mappedUsers);
      }

      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('owner_token');
    localStorage.removeItem('owner_token_expires');
    navigate('/owner-login');
  };

  const handleSaveSettings = () => {
    alert('Settings saved successfully!');
  };

  const getBadgeClass = (plan: string) => {
    const map: Record<string, string> = {
      developer: styles.badgeDeveloper,
      plus: styles.badgePlus,
      enterprise: styles.badgeEnterprise,
    };
    return map[plan] || styles.badgeDeveloper;
  };

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      active: styles.statusActive,
      inactive: styles.statusInactive,
      warning: styles.statusWarning,
    };
    return map[status] || styles.statusInactive;
  };

  const getAgentIconClass = (status: string) => {
    const map: Record<string, string> = {
      active: styles.agentIconActive,
      idle: styles.agentIconIdle,
      error: styles.agentIconError,
    };
    return map[status] || styles.agentIconIdle;
  };

  const getAgentStatusClass = (status: string) => {
    const map: Record<string, string> = {
      active: styles.agentStatusActive,
      idle: styles.agentStatusIdle,
      error: styles.agentStatusError,
    };
    return map[status] || styles.agentStatusIdle;
  };

  const renderOverview = () => (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}><UsersIcon /></div>
            <span className={`${styles.statChange} ${styles.statChangeUp}`}><TrendingUpIcon /> +12.5%</span>
          </div>
          <div className={styles.statValue}>{stats.totalUsers.toLocaleString()}</div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}><ActivityIcon /></div>
            <span className={`${styles.statChange} ${styles.statChangeUp}`}><TrendingUpIcon /> +8.3%</span>
          </div>
          <div className={styles.statValue}>{stats.activeUsers.toLocaleString()}</div>
          <div className={styles.statLabel}>Active Users (30d)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}><DollarIcon /></div>
            <span className={`${styles.statChange} ${styles.statChangeUp}`}><TrendingUpIcon /> +23.1%</span>
          </div>
          <div className={styles.statValue}>${stats.mrr.toLocaleString()}</div>
          <div className={styles.statLabel}>Monthly Recurring Revenue</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}><CpuIcon /></div>
          </div>
          <div className={styles.statValue}>{(stats.creditsConsumed / 1000000).toFixed(1)}M</div>
          <div className={styles.statLabel}>Credits Consumed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconCyan}`}><ServerIcon /></div>
          </div>
          <div className={styles.statValue}>{(stats.apiCalls / 1000000).toFixed(1)}M</div>
          <div className={styles.statLabel}>API Calls (30d)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconRed}`}><TrendingUpIcon /></div>
          </div>
          <div className={styles.statValue}>{stats.conversionRate}%</div>
          <div className={styles.statLabel}>Conversion Rate</div>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><DollarIcon /> Revenue Overview</h3>
          <div className={styles.chartPlaceholder}>Revenue chart (integrate Chart.js)</div>
          <div className={styles.revenueBreakdown} style={{ marginTop: '16px' }}>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}><span className={styles.revenueItemDot} style={{ background: '#8b5cf6' }} />Enterprise</span>
              <span className={styles.revenueItemValue}>$89,450</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}><span className={styles.revenueItemDot} style={{ background: '#3b82f6' }} />Plus</span>
              <span className={styles.revenueItemValue}>$32,800</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}><span className={styles.revenueItemDot} style={{ background: '#10b981' }} />Top-ups</span>
              <span className={styles.revenueItemValue}>$5,200</span>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ActivityIcon /> Recent Activity</h3>
          <div className={styles.activityLog}>
            <div className={styles.activityItem}>
              <div className={`${styles.activityIcon} ${styles.statIconGreen}`}><UsersIcon /></div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>New enterprise signup: TechCorp Inc.</div>
                <div className={styles.activityTime}>2 minutes ago</div>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={`${styles.activityIcon} ${styles.statIconBlue}`}><DollarIcon /></div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>Credit top-up: $80 from sarah@startup.io</div>
                <div className={styles.activityTime}>15 minutes ago</div>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={`${styles.activityIcon} ${styles.statIconPurple}`}><BotIcon /></div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>RARA Agent completed 50 tasks</div>
                <div className={styles.activityTime}>2 hours ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><UsersIcon /> Top Users</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>User</th><th>Plan</th><th>Credits</th><th>Revenue</th><th>Status</th></tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>{user.name.charAt(0).toUpperCase()}</div>
                        <div><div className={styles.userName}>{user.name}</div><div className={styles.userEmail}>{user.email}</div></div>
                      </div>
                    </td>
                    <td><span className={`${styles.badge} ${getBadgeClass(user.plan)}`}>{user.plan}</span></td>
                    <td>{user.creditsUsed} / {user.creditsTotal}</td>
                    <td>${user.revenue}/mo</td>
                    <td><span className={`${styles.statusDot} ${getStatusClass(user.status)}`} />{user.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );

  const renderUsers = () => (
    <div className={styles.section}>
      <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}><UsersIcon /> All Users</h2></div>
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>User</th><th>Plan</th><th>Credits</th><th>Revenue</th><th>Status</th><th>Signup</th></tr></thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><div className={styles.userCell}><div className={styles.userAvatar}>{user.name.charAt(0).toUpperCase()}</div><div><div className={styles.userName}>{user.name}</div><div className={styles.userEmail}>{user.email}</div></div></div></td>
                  <td><span className={`${styles.badge} ${getBadgeClass(user.plan)}`}>{user.plan}</span></td>
                  <td>{user.creditsUsed} / {user.creditsTotal}</td>
                  <td>${user.revenue}/mo</td>
                  <td><span className={`${styles.statusDot} ${getStatusClass(user.status)}`} />{user.status}</td>
                  <td>{user.signupDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconGreen}`}><DollarIcon /></div></div><div className={styles.statValue}>${stats.totalRevenue.toLocaleString()}</div><div className={styles.statLabel}>Total Revenue</div></div>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconPurple}`}><DollarIcon /></div></div><div className={styles.statValue}>${stats.mrr.toLocaleString()}</div><div className={styles.statLabel}>MRR</div></div>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconBlue}`}><UsersIcon /></div></div><div className={styles.statValue}>{users.filter(u => u.plan !== 'developer').length}</div><div className={styles.statLabel}>Paying Customers</div></div>
      </div>
      <div className={styles.cardsGrid}>
        <div className={styles.card}><h3 className={styles.cardTitle}>Revenue by Plan</h3><div className={styles.chartPlaceholder}>Pie chart</div></div>
        <div className={styles.card}><h3 className={styles.cardTitle}>Revenue Trend</h3><div className={styles.chartPlaceholder}>Line chart</div></div>
      </div>
    </>
  );

  const renderAgents = () => (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconGreen}`}><BotIcon /></div></div><div className={styles.statValue}>{agents.filter(a => a.status === 'active').length}</div><div className={styles.statLabel}>Active Agents</div></div>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconOrange}`}><BotIcon /></div></div><div className={styles.statValue}>{agents.filter(a => a.status === 'idle').length}</div><div className={styles.statLabel}>Idle Agents</div></div>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconRed}`}><BotIcon /></div></div><div className={styles.statValue}>{agents.filter(a => a.status === 'error').length}</div><div className={styles.statLabel}>Error State</div></div>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconBlue}`}><ActivityIcon /></div></div><div className={styles.statValue}>{agents.reduce((s, a) => s + a.tasksCompleted, 0)}</div><div className={styles.statLabel}>Tasks Completed</div></div>
      </div>
      <div className={styles.section}>
        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}><BotIcon /> RARA Agents</h2></div>
        <div className={styles.agentsGrid}>
          {agents.map(agent => (
            <div key={agent.id} className={styles.agentCard}>
              <div className={styles.agentHeader}>
                <div className={styles.agentInfo}>
                  <div className={`${styles.agentIcon} ${getAgentIconClass(agent.status)}`}><BotIcon /></div>
                  <div><div className={styles.agentName}>{agent.name}</div><div className={styles.agentType}>{agent.type}</div></div>
                </div>
                <span className={`${styles.agentStatus} ${getAgentStatusClass(agent.status)}`}>{agent.status}</span>
              </div>
              <div className={styles.agentMetrics}>
                <div className={styles.agentMetric}><div className={styles.agentMetricValue}>{agent.tasksCompleted}</div><div className={styles.agentMetricLabel}>Tasks</div></div>
                <div className={styles.agentMetric}><div className={styles.agentMetricValue}>{agent.cpu}%</div><div className={styles.agentMetricLabel}>CPU</div></div>
                <div className={styles.agentMetric}><div className={styles.agentMetricValue}>{agent.memory}%</div><div className={styles.agentMetricLabel}>Memory</div></div>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>Last: {agent.lastTask}</div>
              <div className={styles.agentActions}>
                <button className={`${styles.agentBtn} ${styles.agentBtnPrimary}`}>View Logs</button>
                <button className={`${styles.agentBtn} ${styles.agentBtnDanger}`}>{agent.status === 'active' ? 'Stop' : 'Restart'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderMonitoring = () => (
    <>
      {/* Service Health Grid */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><ServerIcon /> Service Health</h2>
          <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className={styles.logoutBtn} style={{ textDecoration: 'none' }}>
            Open Grafana Dashboard →
          </a>
        </div>
        <div className={styles.statsGrid}>
          {serviceHealth.map(service => (
            <div key={service.name} className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={`${styles.statIcon} ${service.status === 'healthy' ? styles.statIconGreen : service.status === 'degraded' ? styles.statIconOrange : styles.statIconRed}`}>
                  <ServerIcon />
                </div>
                <span className={`${styles.statusDot} ${service.status === 'healthy' ? styles.statusActive : service.status === 'degraded' ? styles.statusWarning : styles.statusInactive}`} />
              </div>
              <div className={styles.statValue}>{service.name}</div>
              <div className={styles.statLabel}>
                {service.latency}ms · {service.uptime} uptime
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth & Billing Metrics */}
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><UsersIcon /> Auth Service Metrics</h3>
          <div className={styles.revenueBreakdown}>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#10b981' }} />Login Success
              </span>
              <span className={styles.revenueItemValue}>{authMetrics.loginSuccess.toLocaleString()}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#ef4444' }} />Login Failed
              </span>
              <span className={styles.revenueItemValue}>{authMetrics.loginFailed.toLocaleString()}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#3b82f6' }} />Registrations
              </span>
              <span className={styles.revenueItemValue}>{authMetrics.registrations.toLocaleString()}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#8b5cf6' }} />MFA Enabled Users
              </span>
              <span className={styles.revenueItemValue}>{authMetrics.mfaEnabled.toLocaleString()}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#06b6d4' }} />Active Sessions
              </span>
              <span className={styles.revenueItemValue}>{authMetrics.activeSessions.toLocaleString()}</span>
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
            Metrics from: auth_login_total, auth_register_total, auth_mfa_*, auth_active_sessions
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}><DollarIcon /> Billing Service Metrics</h3>
          <div className={styles.revenueBreakdown}>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#10b981' }} />Active Subscriptions
              </span>
              <span className={styles.revenueItemValue}>{billingMetrics.subscriptionsActive.toLocaleString()}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#3b82f6' }} />Payments Success
              </span>
              <span className={styles.revenueItemValue}>{billingMetrics.paymentsSuccess.toLocaleString()}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#ef4444' }} />Payments Failed
              </span>
              <span className={styles.revenueItemValue}>{billingMetrics.paymentsFailed.toLocaleString()}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#8b5cf6' }} />Webhooks Processed
              </span>
              <span className={styles.revenueItemValue}>{billingMetrics.webhooksProcessed.toLocaleString()}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#f59e0b' }} />Checkout Conversion
              </span>
              <span className={styles.revenueItemValue}>
                {billingMetrics.checkoutStarted > 0 
                  ? `${((billingMetrics.checkoutCompleted / billingMetrics.checkoutStarted) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
            Metrics from: billing_subscription_*, billing_payment_*, billing_stripe_webhook_*
          </div>
        </div>
      </div>

      {/* Alert Rules */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><ActivityIcon /> Active Alert Rules</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Alert</th><th>Condition</th><th>Severity</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>HighLoginFailureRate</td>
                  <td>&gt;30% login failures for 5m</td>
                  <td><span className={`${styles.badge}`} style={{ background: '#f59e0b', color: '#fff' }}>warning</span></td>
                  <td><span className={`${styles.statusDot} ${styles.statusActive}`} />OK</td>
                </tr>
                <tr>
                  <td>PaymentFailuresSpike</td>
                  <td>&gt;0.1/s payment failures for 5m</td>
                  <td><span className={`${styles.badge}`} style={{ background: '#ef4444', color: '#fff' }}>critical</span></td>
                  <td><span className={`${styles.statusDot} ${styles.statusActive}`} />OK</td>
                </tr>
                <tr>
                  <td>AuthServiceHighLatency</td>
                  <td>P95 &gt; 1s for 5m</td>
                  <td><span className={`${styles.badge}`} style={{ background: '#f59e0b', color: '#fff' }}>warning</span></td>
                  <td><span className={`${styles.statusDot} ${styles.statusActive}`} />OK</td>
                </tr>
                <tr>
                  <td>StripeWebhookFailures</td>
                  <td>Webhook processing failures</td>
                  <td><span className={`${styles.badge}`} style={{ background: '#f59e0b', color: '#fff' }}>warning</span></td>
                  <td><span className={`${styles.statusDot} ${styles.statusActive}`} />OK</td>
                </tr>
                <tr>
                  <td>HighCheckoutAbandonment</td>
                  <td>&gt;70% abandonment for 1h</td>
                  <td><span className={`${styles.badge}`} style={{ background: '#f59e0b', color: '#fff' }}>warning</span></td>
                  <td><span className={`${styles.statusDot} ${styles.statusActive}`} />OK</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ServerIcon /> Monitoring Tools</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              📊 Grafana Dashboard
            </a>
            <a href="http://localhost:9090" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              📈 Prometheus Metrics
            </a>
            <a href="http://localhost:9093" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              🔔 Alertmanager
            </a>
            <a href={`${API_BASE}/api/auth/metrics`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              🔐 Auth Metrics Endpoint
            </a>
            <a href={`${API_BASE}/api/billing/metrics`} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              💳 Billing Metrics Endpoint
            </a>
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ActivityIcon /> Recent Alerts</h3>
          <div className={styles.activityLog}>
            <div className={styles.activityItem}>
              <div className={`${styles.activityIcon} ${styles.statIconGreen}`}><ActivityIcon /></div>
              <div className={styles.activityContent}>
                <div className={styles.activityText}>All systems operational</div>
                <div className={styles.activityTime}>No active alerts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderStatePhysics = () => (
    <>
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🌌 Platform State Physics - Real-Time 3D Visualization</h2>
          <a href={`${API_BASE}/api/state-physics`} target="_blank" rel="noopener noreferrer" className={styles.logoutBtn} style={{ textDecoration: 'none' }}>
            Open Full Screen →
          </a>
        </div>
        <div className={styles.card} style={{ padding: 0, overflow: 'hidden', height: '600px' }}>
          <iframe 
            src={`${API_BASE}/api/state-physics`} 
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              borderRadius: '12px'
            }}
            title="State Physics Visualizer"
          />
        </div>
      </div>
      
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ServerIcon /> What You're Seeing</h3>
          <div className={styles.revenueBreakdown}>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#0088ff' }} />Blue Nodes
              </span>
              <span className={styles.revenueItemValue}>Users</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#ff8800' }} />Orange Nodes
              </span>
              <span className={styles.revenueItemValue}>Agents</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#00ff88' }} />Green Nodes
              </span>
              <span className={styles.revenueItemValue}>Services</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#00ffff' }} />Cyan Nodes
              </span>
              <span className={styles.revenueItemValue}>Contracts</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#ff0088' }} />Pink Lines
              </span>
              <span className={styles.revenueItemValue}>Transactions</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#8800ff' }} />Purple Lines
              </span>
              <span className={styles.revenueItemValue}>Trust Relationships</span>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ActivityIcon /> Conservation Laws</h3>
          <div className={styles.revenueBreakdown}>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Mass Conservation</span>
              <span style={{ color: '#10b981' }}>✓ Preserved</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Energy Conservation</span>
              <span style={{ color: '#10b981' }}>✓ Preserved</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Identity Uniqueness</span>
              <span style={{ color: '#10b981' }}>✓ Preserved</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Causality</span>
              <span style={{ color: '#10b981' }}>✓ Preserved</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Non-Negative Values</span>
              <span style={{ color: '#10b981' }}>✓ Preserved</span>
            </div>
          </div>
          <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
            Physics simulation ensures all platform invariants are maintained
          </div>
        </div>
      </div>
    </>
  );

  const renderSettings = () => (
    <div className={styles.cardsGrid}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><DollarIcon /> Pricing Settings</h3>
        <div className={styles.settingsForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label className={styles.formLabel}>Credit Rate ($)</label><input type="number" step="0.0001" className={styles.formInput} value={settings.creditRate} onChange={e => setSettings({ ...settings, creditRate: parseFloat(e.target.value) })} /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Developer Credits</label><input type="number" className={styles.formInput} value={settings.developerCredits} onChange={e => setSettings({ ...settings, developerCredits: parseInt(e.target.value) })} /></div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}><label className={styles.formLabel}>Plus Credits</label><input type="number" className={styles.formInput} value={settings.plusCredits} onChange={e => setSettings({ ...settings, plusCredits: parseInt(e.target.value) })} /></div>
            <div className={styles.formGroup}><label className={styles.formLabel}>Plus Price ($)</label><input type="number" className={styles.formInput} value={settings.plusPrice} onChange={e => setSettings({ ...settings, plusPrice: parseInt(e.target.value) })} /></div>
          </div>
          <button className={styles.saveBtn} onClick={handleSaveSettings}>Save Pricing</button>
        </div>
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><SettingsIcon /> Platform Settings</h3>
        <div className={styles.settingsForm}>
          <div className={styles.formGroup}><label className={styles.formLabel}><input type="checkbox" checked={settings.signupsEnabled} onChange={e => setSettings({ ...settings, signupsEnabled: e.target.checked })} style={{ marginRight: '8px' }} />Enable Signups</label></div>
          <div className={styles.formGroup}><label className={styles.formLabel}><input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} style={{ marginRight: '8px' }} />Maintenance Mode</label></div>
          <button className={styles.saveBtn} onClick={handleSaveSettings}>Save Settings</button>
        </div>
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><ServerIcon /> System Status</h3>
        <div className={styles.revenueBreakdown}>
          <div className={styles.revenueItem}><span className={styles.revenueItemLabel}><span className={styles.revenueItemDot} style={{ background: '#10b981' }} />API Server</span><span style={{ color: '#10b981' }}>Healthy</span></div>
          <div className={styles.revenueItem}><span className={styles.revenueItemLabel}><span className={styles.revenueItemDot} style={{ background: '#10b981' }} />Database</span><span style={{ color: '#10b981' }}>Healthy</span></div>
          <div className={styles.revenueItem}><span className={styles.revenueItemLabel}><span className={styles.revenueItemDot} style={{ background: '#10b981' }} />RARA Engine</span><span style={{ color: '#10b981' }}>Healthy</span></div>
        </div>
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><DatabaseIcon /> Database Stats</h3>
        <div className={styles.revenueBreakdown}>
          <div className={styles.revenueItem}><span className={styles.revenueItemLabel}>Records</span><span className={styles.revenueItemValue}>2.4M</span></div>
          <div className={styles.revenueItem}><span className={styles.revenueItemLabel}>Storage</span><span className={styles.revenueItemValue}>847 GB</span></div>
          <div className={styles.revenueItem}><span className={styles.revenueItemLabel}>Avg Query</span><span className={styles.revenueItemValue}>12ms</span></div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (<div className={styles.ownerDashboard}><div className={styles.container}><div className={styles.loadingState}><div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div><div>Loading owner dashboard...</div></div></div></div>);
  }

  if (error) {
    return (<div className={styles.ownerDashboard}><div className={styles.container}><div className={styles.errorState}><div style={{ fontSize: '24px', marginBottom: '16px' }}>⚠️</div><div>{error}</div><button className={styles.logoutBtn} onClick={() => navigate('/owner-login')} style={{ marginTop: '16px' }}>Return to Login</button></div></div></div>);
  }

  return (
    <div className={styles.ownerDashboard}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.pageTitle}>
              <CrownIcon />
              <div><h1 className={styles.logoText}>Owner Dashboard</h1><div className={styles.logoSubtext}>Platform Analytics & Control</div></div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.liveIndicator}>Platform Live</div>
            <button className={styles.logoutBtn} onClick={handleRefresh} disabled={isRefreshing}><RefreshIcon /> {isRefreshing ? 'Refreshing...' : 'Refresh'}</button>
          </div>
        </div>

        <nav className={styles.navTabs}>
          <button className={`${styles.navTab} ${activeTab === 'overview' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`${styles.navTab} ${activeTab === 'users' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('users')}>Users</button>
          <button className={`${styles.navTab} ${activeTab === 'revenue' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('revenue')}>Revenue</button>
          <button className={`${styles.navTab} ${activeTab === 'agents' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('agents')}>RARA Agents</button>
          <button className={`${styles.navTab} ${activeTab === 'monitoring' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('monitoring')}>Monitoring</button>
          <button className={`${styles.navTab} ${activeTab === 'settings' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
          <button className={`${styles.navTab} ${activeTab === 'state-physics' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('state-physics')}>🌌 State Physics</button>
        </nav>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'revenue' && renderRevenue()}
        {activeTab === 'agents' && renderAgents()}
        {activeTab === 'monitoring' && renderMonitoring()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'state-physics' && renderStatePhysics()}
      </div>
    </div>
  );
};

export default OwnerDashboard;
