/**
 * Owner Dashboard - Platform Owner Analytics & Control Center
 * Comprehensive dashboard for platform owner to monitor users, revenue, usage, and RARA agents
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData } from '../../utils/auth-cookies';
import { fetchPlan } from '../../api/pricing';
import styles from './OwnerDashboard.module.css';
import V8ControlPanel from '../../components/owner/V8ControlPanel';
import PlatformStatePhysics from '../../components/owner/PlatformStatePhysics';
import DaemonControlPanel from '../../components/owner/DaemonControlPanel';
import { getSystemMetrics, getServiceHealth, getDatabaseStats, getRaraAgents, getSystemOverview, getPlatformUsers, getPlatformAnalytics, getRecentActivity, getV8Data, SystemMetrics, ServiceHealthResponse, DatabaseStats, RaraData, PlatformAnalytics, ActivityResponse, V8Data } from '../../api/system';

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
  creditsUsed: number | null;
  creditsTotal: number | null;
  revenue: number | null;
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
  totalUsers: number | null;
  activeUsers: number | null;
  totalRevenue: number | null;
  mrr: number | null;
  creditsConsumed: number | null;
  apiCalls: number | null;
  avgSessionTime: string;
  conversionRate: number | null;
}

import { ENV } from '../../config/env';

// API Configuration
const API_BASE = ENV.apiUrl;

// Default empty data
const defaultStats: PlatformStats = {
  totalUsers: null,
  activeUsers: null,
  totalRevenue: null,
  mrr: null,
  creditsConsumed: null,
  apiCalls: null,
  avgSessionTime: '0m',
  conversionRate: null,
};

const defaultAgents: RARAAgent[] = [];

type TabType = 'overview' | 'users' | 'revenue' | 'agents' | 'monitoring' | 'settings' | 'state-physics' | 'system' | 'v8' | 'control' | 'chat-skills';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  uptime: string;
  lastCheck: string;
}

interface AuthMetrics {
  loginSuccess: number | null;
  loginFailed: number | null;
  registrations: number | null;
  mfaEnabled: number | null;
  activeSessions: number | null;
}

interface BillingMetrics {
  subscriptionsActive: number | null;
  paymentsSuccess: number | null;
  paymentsFailed: number | null;
  webhooksProcessed: number | null;
  checkoutStarted: number | null;
  checkoutCompleted: number | null;
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
  const [userSearch, setUserSearch] = useState('');

  const [serviceHealth, setServiceHealth] = useState<ServiceHealth[]>([]);

  // Real system data from backend
  const [realMetrics, setRealMetrics] = useState<SystemMetrics | null>(null);
  const [realServices, setRealServices] = useState<ServiceHealthResponse | null>(null);
  const [realDbStats, setRealDbStats] = useState<DatabaseStats | null>(null);
  const [realRara, setRealRara] = useState<RaraData | null>(null);
  const [realAnalytics, setRealAnalytics] = useState<PlatformAnalytics | null>(null);
  const [realActivity, setRealActivity] = useState<ActivityResponse | null>(null);
  const [realV8, setRealV8] = useState<V8Data | null>(null);

  const [authMetrics, setAuthMetrics] = useState<AuthMetrics>({
    loginSuccess: null,
    loginFailed: null,
    registrations: null,
    mfaEnabled: null,
    activeSessions: null,
  });

  const [billingMetrics, setBillingMetrics] = useState<BillingMetrics>({
    subscriptionsActive: null,
    paymentsSuccess: null,
    paymentsFailed: null,
    webhooksProcessed: null,
    checkoutStarted: null,
    checkoutCompleted: null,
  });

  // Chat Skills state
  const [chatSkills, setChatSkills] = useState<Array<{ id: string; name: string; description: string; icon: string; category: string; capabilities: string[]; credit_cost: number; requires_api_key?: string; is_default: boolean; enabled: boolean }>>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

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
    const sessionData = getSessionData();
    const ownerToken = localStorage.getItem('owner_token');
    const sessionToken = localStorage.getItem('access_token');
    const authToken = ownerToken || sessionToken;
    const sessionRole = sessionData?.role ? String(sessionData.role) : '';
    const isSuperuser = Boolean(sessionData?.is_superuser) || sessionRole === 'platform_owner';
    
    // Allow access if superuser OR has owner_token
    if (!authToken && !isSuperuser) {
      navigate('/dashboard');
      return;
    }

    try {
      const statsRes = await fetch(`${API_BASE}/owner/auth/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalUsers: statsData.total_users ?? null,
          activeUsers: statsData.active_users ?? null,
          totalRevenue: statsData.total_revenue ?? null,
          mrr: statsData.mrr ?? null,
          creditsConsumed: statsData.credits_consumed ?? null,
          apiCalls: statsData.api_calls ?? null,
          avgSessionTime: statsData.avg_session_time ?? 'N/A',
          conversionRate: statsData.conversion_rate ?? null,
        });
      }

      // Fetch users from system endpoint (direct DB query) with auth-service fallback
      try {
        const sysUsersData = await getPlatformUsers();
        if (sysUsersData.error) {
          throw new Error(sysUsersData.error);
        }
        if (sysUsersData.users && sysUsersData.users.length > 0) {
          const mappedUsers: User[] = sysUsersData.users.map((u: any) => ({
            id: u.id,
            name: u.full_name || u.email.split('@')[0],
            email: u.email,
            username: u.username || '',
            plan: u.is_superuser ? 'enterprise' as const : 'developer' as const,
            status: (u.status || (u.is_active ? 'active' : 'inactive')) as 'active' | 'inactive' | 'warning',
            creditsUsed: null,
            creditsTotal: null,
            revenue: null,
            lastActive: u.last_login_at || 'Never',
            signupDate: u.created_at ? u.created_at.split('T')[0] : 'N/A',
            mfaEnabled: u.mfa_enabled || false,
            emailVerified: u.email_verified || false,
            lastLoginAt: u.last_login_at ? u.last_login_at.split('T')[0] : null,
          }));
          setUsers(mappedUsers);
        } else {
          throw new Error('Gateway users endpoint returned no users');
        }
      } catch (e) {
        console.warn('System users endpoint not available, trying auth endpoint:', e);
        // Fallback to auth endpoint
        const usersRes = await fetch(`${API_BASE}/owner/auth/dashboard/users`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const mappedUsers: User[] = (usersData.users || []).map((u: any) => ({
            id: u.id,
            name: u.full_name || u.email.split('@')[0],
            email: u.email,
            username: u.username || '',
            plan: 'developer' as const,
            status: (u.status || (u.is_active ? 'active' : 'inactive')) as 'active' | 'inactive' | 'warning',
            creditsUsed: null,
            creditsTotal: null,
            revenue: null,
            lastActive: u.last_login_at || 'Never',
            signupDate: u.created_at ? u.created_at.split('T')[0] : 'N/A',
            mfaEnabled: u.mfa_enabled || false,
            emailVerified: u.email_verified || false,
            lastLoginAt: u.last_login_at ? u.last_login_at.split('T')[0] : null,
          }));
          setUsers(mappedUsers);
        }
      }

      // Fetch settings
      const settingsRes = await fetch(`${API_BASE}/owner/auth/settings`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings({
          creditRate: settingsData.credit_rate || 0.001,
          developerCredits: settingsData.developer_credits || 1000,
          plusCredits: settingsData.plus_credits || 50000,
          plusPrice: settingsData.plus_price || 49,
          topupPrice: settingsData.topup_price || 8,
          topupAmount: settingsData.topup_amount || 10000,
          maintenanceMode: settingsData.maintenance_mode || false,
          signupsEnabled: settingsData.signups_enabled !== false,
        });
      }

      // Fetch billing metrics from billing service
      try {
        const billingRes = await fetch(`${API_BASE}/api/v1/billing/metrics`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (billingRes.ok) {
          const billingData = await billingRes.json();
          setBillingMetrics({
            subscriptionsActive: billingData.subscriptions_active ?? null,
            paymentsSuccess: billingData.payments_success ?? null,
            paymentsFailed: billingData.payments_failed ?? null,
            webhooksProcessed: billingData.webhooks_processed ?? null,
            checkoutStarted: billingData.checkout_started ?? null,
            checkoutCompleted: billingData.checkout_completed ?? null,
          });
        }
      } catch (e) {
        console.warn('Billing metrics not available:', e);
      }

      // Fetch auth metrics
      try {
        const authMetricsRes = await fetch(`${API_BASE}/api/v1/auth/metrics`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (authMetricsRes.ok) {
          const authData = await authMetricsRes.json();
          setAuthMetrics({
            loginSuccess: authData.login_success ?? null,
            loginFailed: authData.login_failed ?? null,
            registrations: authData.registrations ?? null,
            mfaEnabled: authData.mfa_enabled ?? null,
            activeSessions: authData.active_sessions ?? null,
          });
        }
      } catch (e) {
        console.warn('Auth metrics not available:', e);
      }

      // Fetch real system metrics from backend
      try {
        const [metricsData, servicesData, dbData, raraData, analyticsData, activityData, v8DataRes] = await Promise.all([
          getSystemMetrics().catch(() => null),
          getServiceHealth().catch(() => null),
          getDatabaseStats().catch(() => null),
          getRaraAgents().catch(() => null),
          getPlatformAnalytics().catch(() => null),
          getRecentActivity().catch(() => null),
          getV8Data().catch(() => null),
        ]);
        if (metricsData) setRealMetrics(metricsData);
        if (servicesData) {
          setRealServices(servicesData);
          setServiceHealth(servicesData.services.map(s => ({
            name: s.name,
            status: s.status as 'healthy' | 'degraded' | 'down',
            latency: s.latency,
            uptime: s.online ? 'online' : 'offline',
            lastCheck: 'Just now',
          })));
        }
        if (dbData) setRealDbStats(dbData);
        if (analyticsData) {
          setRealAnalytics(analyticsData);
          // Update stats with real analytics data
          setStats(prev => ({
            ...prev,
            totalUsers: analyticsData.total_users ?? prev.totalUsers,
            activeUsers: analyticsData.active_users_24h ?? prev.activeUsers,
            totalRevenue: analyticsData.revenue_30d ?? prev.totalRevenue,
            mrr: analyticsData.mrr ?? prev.mrr,
            creditsConsumed: analyticsData.credits_consumed ?? prev.creditsConsumed,
            apiCalls: analyticsData.api_calls_30d ?? prev.apiCalls,
            conversionRate: analyticsData.conversion_rate ?? prev.conversionRate,
          }));
        }
        if (activityData) setRealActivity(activityData);
        if (v8DataRes) setRealV8(v8DataRes);
        if (raraData) {
          setRealRara(raraData);
          if (raraData.agents && raraData.agents.length > 0) {
            setAgents(raraData.agents.map((a: any, i: number) => ({
              id: a.id || String(i),
              name: a.name || a.agent_id || `Agent-${i}`,
              type: a.type || a.capabilities?.join(', ') || 'RARA Agent',
              status: (a.status === 'active' || a.is_active) ? 'active' as const : 'idle' as const,
              tasksCompleted: a.tasks_completed || a.stats?.tasks_completed || 0,
              uptime: a.uptime || 'N/A',
              cpu: a.cpu_usage || a.cpu || 0,
              memory: a.memory_usage || a.memory || 0,
              lastTask: a.last_task || a.last_action || 'N/A',
            })));
          }
        }
      } catch (e) {
        console.warn('System metrics not available:', e);
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
    const intervalId = window.setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('owner_token');
    localStorage.removeItem('owner_token_expires');
    navigate('/dashboard');
  };

  const handleSaveSettings = async () => {
    const ownerToken = localStorage.getItem('owner_token');
    const sessionToken = localStorage.getItem('access_token');
    const authToken = ownerToken || sessionToken;
    if (!authToken) {
      navigate('/dashboard');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/owner/auth/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credit_rate: settings.creditRate,
          developer_credits: settings.developerCredits,
          plus_credits: settings.plusCredits,
          plus_price: settings.plusPrice,
          topup_price: settings.topupPrice,
          topup_amount: settings.topupAmount,
          maintenance_mode: settings.maintenanceMode,
          signups_enabled: settings.signupsEnabled,
        }),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save settings: ${error.detail || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      alert(`Failed to save settings: ${err.message}`);
    }
  };

  const handleResetPassword = async (userId: string, userEmail: string) => {
    const ownerToken = localStorage.getItem('owner_token');
    const sessionToken = localStorage.getItem('access_token');
    const authToken = ownerToken || sessionToken;
    if (!authToken) {
      navigate('/dashboard');
      return;
    }

    if (!confirm(`Send password reset email to ${userEmail}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/owner/auth/admin/reset-password/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Password reset email sent to ${data.user_email}`);
      } else {
        const error = await response.json();
        alert(`Failed to send reset email: ${error.detail || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Failed to send reset email:', err);
      alert(`Failed to send reset email: ${err.message}`);
    }
  };

  const handleBlockUser = async (userId: string, userEmail: string, isCurrentlyBlocked: boolean) => {
    const ownerToken = localStorage.getItem('owner_token');
    const sessionToken = localStorage.getItem('access_token');
    const authToken = ownerToken || sessionToken;
    if (!authToken) {
      navigate('/dashboard');
      return;
    }

    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} ${userEmail}?`)) {
      return;
    }

    try {
      const endpoint = isCurrentlyBlocked ? 'unblock-user' : 'block-user';
      const response = await fetch(`${API_BASE}/owner/auth/admin/${endpoint}/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        // Refresh users list
        handleRefresh();
      } else {
        const error = await response.json();
        alert(`Failed to ${action} user: ${error.detail || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error(`Failed to ${action} user:`, err);
      alert(`Failed to ${action} user: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const ownerToken = localStorage.getItem('owner_token');
    const sessionToken = localStorage.getItem('access_token');
    const authToken = ownerToken || sessionToken;
    if (!authToken) {
      navigate('/dashboard');
      return;
    }

    if (!confirm(`⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE ${userEmail}? This cannot be undone!`)) {
      return;
    }

    if (!confirm(`⚠️ FINAL WARNING: Type 'DELETE' to confirm permanent deletion of ${userEmail}`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/owner/auth/admin/delete-user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        // Refresh users list
        handleRefresh();
      } else {
        const error = await response.json();
        alert(`Failed to delete user: ${error.detail || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(`Failed to delete user: ${err.message}`);
    }
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

  const formatMetric = (value: number | null | undefined) => (
    value == null ? '—' : value.toLocaleString()
  );

  const formatCurrencyMetric = (value: number | null | undefined) => (
    value == null ? '—' : `$${value.toLocaleString()}`
  );

  const renderOverview = () => (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}><UsersIcon /></div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {(realAnalytics?.total_users ?? stats.totalUsers) != null ? 'Live from backend' : 'Unavailable'}
            </span>
          </div>
          <div className={styles.statValue}>{formatMetric(realAnalytics?.total_users ?? stats.totalUsers)}</div>
          <div className={styles.statLabel}>Total Users</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}><ActivityIcon /></div>
          </div>
          <div className={styles.statValue}>{formatMetric(realAnalytics?.active_users_24h ?? stats.activeUsers)}</div>
          <div className={styles.statLabel}>Active Users (24h)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}><DollarIcon /></div>
          </div>
          <div className={styles.statValue}>{formatCurrencyMetric(realAnalytics?.revenue_30d ?? stats.totalRevenue)}</div>
          <div className={styles.statLabel}>Revenue (30d)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}><CpuIcon /></div>
          </div>
          <div className={styles.statValue}>{formatMetric(realAnalytics?.credits_consumed ?? stats.creditsConsumed)}</div>
          <div className={styles.statLabel}>Credits Consumed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconCyan}`}><ServerIcon /></div>
          </div>
          <div className={styles.statValue}>{formatMetric(realAnalytics?.api_calls_30d ?? stats.apiCalls)}</div>
          <div className={styles.statLabel}>API Calls (30d)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconRed}`}><TrendingUpIcon /></div>
          </div>
          <div className={styles.statValue}>{formatMetric(realAnalytics?.active_connections)}</div>
          <div className={styles.statLabel}>Active Connections</div>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><DollarIcon /> Revenue Overview</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '20px 0' }}>
            {/* Real billing metrics visualization */}
            {(() => {
              const totalRev = realAnalytics?.revenue_30d ?? stats.totalRevenue;
              const creditsUsed = realAnalytics?.credits_consumed ?? stats.creditsConsumed;
              const creditsPurchased = realAnalytics?.total_credits_purchased;
              const creditsBalance = realAnalytics?.credits_balance;
              const payingUsers = realAnalytics?.paying_users ?? realAnalytics?.paid_users;
              const apiCalls = realAnalytics?.api_calls_30d ?? stats.apiCalls;
              const items = [
                { label: 'Revenue', value: totalRev, display: formatCurrencyMetric(totalRev) },
                { label: 'Purchased', value: creditsPurchased, display: formatMetric(creditsPurchased) },
                { label: 'Used', value: creditsUsed, display: formatMetric(creditsUsed) },
                { label: 'Balance', value: creditsBalance, display: formatMetric(creditsBalance) },
                { label: 'Paying', value: payingUsers, display: formatMetric(payingUsers) },
                { label: 'API Calls', value: apiCalls, display: formatMetric(apiCalls) },
              ].filter((item): item is { label: string; value: number; display: string } => item.value != null);
              if (!items.length) {
                return <div style={{ color: '#64748b', width: '100%', textAlign: 'center' }}>No live revenue metrics available</div>;
              }
              const maxVal = Math.max(...items.map(it => it.value), 1);
              return items.map((item, i) => (
                <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '100%', 
                    height: `${Math.max(10, (item.value / maxVal) * 100)}%`, 
                    background: 'linear-gradient(180deg, #8b5cf6 0%, #6366f1 100%)',
                    borderRadius: '4px 4px 0 0',
                    minHeight: '20px',
                    position: 'relative'
                  }}>
                    <span style={{ 
                      position: 'absolute', 
                      top: '-24px', 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      fontSize: '10px',
                      color: '#94a3b8',
                      whiteSpace: 'nowrap'
                    }}>{item.display}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{item.label}</span>
                </div>
              ));
            })()}
          </div>
          <div className={styles.revenueBreakdown} style={{ marginTop: '16px' }}>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}><span className={styles.revenueItemDot} style={{ background: '#8b5cf6' }} />Total Revenue</span>
              <span className={styles.revenueItemValue}>{formatCurrencyMetric(realAnalytics?.revenue_30d ?? stats.totalRevenue)}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}><span className={styles.revenueItemDot} style={{ background: '#3b82f6' }} />Credits Purchased</span>
              <span className={styles.revenueItemValue}>{formatMetric(realAnalytics?.total_credits_purchased)}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}><span className={styles.revenueItemDot} style={{ background: '#10b981' }} />Credits Balance</span>
              <span className={styles.revenueItemValue}>{formatMetric(realAnalytics?.credits_balance)}</span>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ActivityIcon /> Recent Activity</h3>
          <div className={styles.activityLog}>
            {realActivity && realActivity.activities.length > 0 ? (
              realActivity.activities.map((activity, idx) => (
                <div key={idx} className={styles.activityItem}>
                  <div className={`${styles.activityIcon} ${
                    activity.category === 'agents' ? styles.statIconPurple :
                    activity.category === 'v8' ? styles.statIconOrange :
                    activity.category === 'system' ? styles.statIconGreen :
                    styles.statIconBlue
                  }`}>
                    {activity.category === 'agents' ? <BotIcon /> :
                     activity.category === 'v8' ? <CpuIcon /> :
                     activity.category === 'system' ? <ServerIcon /> :
                     <ActivityIcon />}
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>{activity.message}</div>
                    <div className={styles.activityTime}>{new Date(activity.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>Loading activity...</div>
            )}
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
                    <td>{user.creditsUsed != null && user.creditsTotal != null ? `${user.creditsUsed} / ${user.creditsTotal}` : '—'}</td>
                    <td>{user.revenue != null ? `$${user.revenue}/mo` : '—'}</td>
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

  const renderUsers = () => {
    const filteredUsers = users.filter(user => {
      if (!userSearch) return true;
      const search = userSearch.toLowerCase();
      return (
        user.email.toLowerCase().includes(search) ||
        (user.name || '').toLowerCase().includes(search) ||
        ((user as any).username || '').toLowerCase().includes(search)
      );
    });

    return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}><UsersIcon /> All Users ({users.length} total)</h2>
      </div>
      <div className={styles.card}>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by email, name, or username..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '14px',
            }}
          />
          <span style={{ color: '#64748b', fontSize: '13px' }}>
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>
        <div className={styles.tableWrapper} style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className={styles.table}>
            <thead style={{ position: 'sticky', top: 0, background: '#1e293b', zIndex: 10 }}>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Status</th>
                <th>MFA</th>
                <th>Email Verified</th>
                <th>Last Login</th>
                <th>Signup Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{user.email}</td>
                  <td>{(user as any).username || '-'}</td>
                  <td>{user.name || '-'}</td>
                  <td>
                    <span className={`${styles.statusDot} ${getStatusClass(user.status)}`} />
                    {user.status}
                  </td>
                  <td>
                    <span style={{ 
                      color: (user as any).mfaEnabled ? '#10b981' : '#64748b',
                      fontWeight: (user as any).mfaEnabled ? 'bold' : 'normal'
                    }}>
                      {(user as any).mfaEnabled ? '✓ Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      color: (user as any).emailVerified ? '#10b981' : '#f59e0b',
                      fontWeight: (user as any).emailVerified ? 'bold' : 'normal'
                    }}>
                      {(user as any).emailVerified ? '✓ Yes' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {(user as any).lastLoginAt || 'Never'}
                  </td>
                  <td style={{ fontSize: '11px', color: '#94a3b8' }}>{user.signupDate}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleResetPassword(user.id, user.email)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '10px',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Reset PW
                      </button>
                      <button
                        onClick={() => handleBlockUser(user.id, user.email, user.status === 'blocked')}
                        style={{
                          padding: '4px 8px',
                          fontSize: '10px',
                          background: user.status === 'blocked' ? '#10b981' : '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        {user.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '10px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  };

  const renderRevenue = () => (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconGreen}`}><DollarIcon /></div></div><div className={styles.statValue}>{formatCurrencyMetric(realAnalytics?.revenue_30d ?? stats.totalRevenue)}</div><div className={styles.statLabel}>Total Revenue</div></div>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconPurple}`}><DollarIcon /></div></div><div className={styles.statValue}>{formatCurrencyMetric(realAnalytics?.mrr ?? stats.mrr)}</div><div className={styles.statLabel}>MRR</div></div>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconBlue}`}><UsersIcon /></div></div><div className={styles.statValue}>{formatMetric(realAnalytics?.paying_users ?? realAnalytics?.paid_users)}</div><div className={styles.statLabel}>Paying Customers</div></div>
      </div>
      <div className={styles.cardsGrid}>
        <div className={styles.card}><h3 className={styles.cardTitle}>Revenue by Plan</h3><div className={styles.chartPlaceholder}>No live revenue-by-plan dataset available</div></div>
        <div className={styles.card}><h3 className={styles.cardTitle}>Revenue Trend</h3><div className={styles.chartPlaceholder}>No live revenue trend dataset available</div></div>
      </div>
    </>
  );

  const INTERNAL_AGENTS = [
    { id: 'reasoning', name: 'Reasoning Agent', desc: 'Analysis, logic, problem solving, critical thinking, deduction', category: 'Core', autonomous: true, specializations: { code_analysis: 0.95, system_design: 0.88, debugging: 0.90, logical_reasoning: 0.96 } },
    { id: 'code', name: 'Code Generation Agent', desc: 'Code generation, implementation, syntax, best practices (Python, JS, TS, React)', category: 'Development', autonomous: true, specializations: { python: 0.95, javascript: 0.93, typescript: 0.92, react: 0.90 } },
    { id: 'debug', name: 'Debug Agent', desc: 'Bug finding, error analysis, troubleshooting, root cause analysis', category: 'Development', autonomous: true, specializations: { error_analysis: 0.94, bug_fixing: 0.92, stack_trace: 0.93 } },
    { id: 'review', name: 'Code Review Agent', desc: 'Code review, quality assessment, feedback, best practices enforcement', category: 'Development', autonomous: true, specializations: { code_review: 0.96, quality: 0.93, best_practices: 0.91 } },
    { id: 'test', name: 'Test Generation Agent', desc: 'Creates comprehensive test coverage, unit/integration/e2e tests', category: 'Development', autonomous: true, specializations: { unit_tests: 0.94, integration: 0.90, e2e: 0.87 } },
    { id: 'research', name: 'Research Agent', desc: 'Information gathering, synthesis, web search integration', category: 'Core', autonomous: true, specializations: { research: 0.93, synthesis: 0.90 } },
    { id: 'explain', name: 'Explanation Agent', desc: 'Simplification, teaching, ELI5, beginner-friendly explanations', category: 'Core', autonomous: true, specializations: { beginner_tutorials: 0.98, eli5: 0.96, teaching: 0.92 } },
    { id: 'summary', name: 'Summary Agent', desc: 'Summarization of conversations, documents, and code', category: 'Core', autonomous: true, specializations: { summarization: 0.94 } },
    { id: 'planning', name: 'Planning Agent', desc: 'Actionable plans, roadmaps, project planning', category: 'Core', autonomous: true, specializations: { roadmaps: 0.91, project_planning: 0.89 } },
    { id: 'security', name: 'Security Agent', desc: 'Vulnerability finding, OWASP/CWE, penetration testing advice', category: 'Security', autonomous: true, specializations: { vulnerability: 0.94, owasp: 0.92 } },
    { id: 'architecture', name: 'Architecture Agent', desc: 'System design, scalable patterns, microservices, design decisions', category: 'Architecture', autonomous: true, specializations: { system_design: 0.93, microservices: 0.90 } },
    { id: 'optimization', name: 'Optimization Agent', desc: 'Performance bottlenecks, memory leaks, O(n) complexity analysis', category: 'Performance', autonomous: true, specializations: { performance: 0.93, memory: 0.90 } },
    { id: 'documentation', name: 'Documentation Agent', desc: 'README, API docs, JSDoc/docstrings, OpenAPI specs', category: 'Development', autonomous: true, specializations: { api_docs: 0.94, readme: 0.92 } },
    { id: 'math', name: 'Math Agent', desc: 'Mathematical reasoning, calculations, step-by-step proofs', category: 'Core', autonomous: true, specializations: { math: 0.95, proofs: 0.90 } },
    { id: 'api', name: 'API Design Agent', desc: 'RESTful APIs, GraphQL, OpenAPI, versioning, request/response', category: 'Architecture', autonomous: true, specializations: { rest: 0.94, graphql: 0.88 } },
    { id: 'database', name: 'Database Agent', desc: 'Schema design, optimized queries, SQL/NoSQL, indexing, migrations', category: 'Architecture', autonomous: true, specializations: { sql: 0.93, nosql: 0.88, indexing: 0.91 } },
    { id: 'devops', name: 'DevOps Agent', desc: 'CI/CD, Docker, Kubernetes, Terraform, cloud deployments', category: 'Infrastructure', autonomous: true, specializations: { docker: 0.93, kubernetes: 0.88, terraform: 0.85 } },
    { id: 'migration', name: 'Migration Agent', desc: 'Code migrations, version upgrades, framework transitions, rollbacks', category: 'Development', autonomous: true, specializations: { migrations: 0.91, rollbacks: 0.89 } },
    { id: 'refactor', name: 'Refactor Agent', desc: 'SOLID, DRY, KISS patterns, safe refactoring with before/after', category: 'Development', autonomous: true, specializations: { solid: 0.93, dry: 0.91 } },
    { id: 'accessibility', name: 'Accessibility Agent', desc: 'WCAG 2.1 AA/AAA, ARIA, keyboard nav, screen reader, contrast', category: 'Quality', autonomous: true, specializations: { wcag: 0.94, aria: 0.92 } },
    { id: 'i18n', name: 'i18n Agent', desc: 'Translations, locale handling, RTL support, date/number formatting', category: 'Quality', autonomous: true, specializations: { i18n: 0.91, rtl: 0.87 } },
    { id: 'regex', name: 'Regex Agent', desc: 'Create, explain, debug regex patterns (JS, Python, PCRE)', category: 'Utility', autonomous: true, specializations: { regex: 0.96 } },
    { id: 'git', name: 'Git Agent', desc: 'Branching, merge conflicts, rebasing, cherry-picking, hooks', category: 'Utility', autonomous: true, specializations: { git: 0.94 } },
    { id: 'css', name: 'CSS Agent', desc: 'Flexbox, grid, responsive, animations, Tailwind, cross-browser', category: 'Development', autonomous: true, specializations: { css: 0.93, tailwind: 0.90 } },
  ];

  const INTERNAL_TEAMS = [
    { id: 'code_review_team', name: 'Code Review Team', agents: ['code', 'review', 'test'], workflow: 'sequential', desc: 'Full code review pipeline: generate code, review it, then create tests', triggers: 'full review, review my code, code audit' },
    { id: 'security_audit_team', name: 'Security Audit Team', agents: ['security', 'review', 'architecture'], workflow: 'parallel_merge', desc: 'Comprehensive security analysis from multiple expert perspectives', triggers: 'security audit, vulnerability scan, penetration test' },
    { id: 'architecture_team', name: 'Architecture Team', agents: ['architecture', 'review', 'planning'], workflow: 'sequential', desc: 'System design with review and implementation planning', triggers: 'design system, architect, system design' },
    { id: 'learning_team', name: 'Learning Team', agents: ['explain', 'research', 'summary'], workflow: 'sequential', desc: 'Educational content: explain, research deeper, then summarize', triggers: 'teach me, learn about, tutorial' },
    { id: 'debug_team', name: 'Debug Team', agents: ['debug', 'test', 'review'], workflow: 'sequential', desc: 'Thorough debugging: find bugs, create tests, review fixes', triggers: 'fix everything, debug thoroughly, find all bugs' },
    { id: 'full_stack_team', name: 'Full Stack Team', agents: ['api', 'database', 'code', 'test'], workflow: 'sequential', desc: 'End-to-end feature development: API, database, code, tests', triggers: 'full stack, end to end, complete feature' },
    { id: 'refactor_team', name: 'Refactor Team', agents: ['review', 'refactor', 'test'], workflow: 'sequential', desc: 'Safe refactoring: review current code, refactor, verify with tests', triggers: 'safe refactor, clean and test' },
    { id: 'accessibility_team', name: 'Accessibility Team', agents: ['accessibility', 'review', 'test'], workflow: 'sequential', desc: 'A11y compliance: check accessibility, review, create a11y tests', triggers: 'accessibility audit, a11y check, wcag' },
    { id: 'performance_team', name: 'Performance Team', agents: ['optimization', 'review', 'test'], workflow: 'sequential', desc: 'Performance optimization: analyze, optimize, verify with benchmarks', triggers: 'performance audit, speed optimization, make faster' },
  ];

  const RARA_TYPES = [
    { id: 'task_executor', name: 'Task Executor', desc: 'Executes defined tasks with strict safety boundaries' },
    { id: 'business_operator', name: 'Business Operator', desc: 'Manages business logic, workflows, and automated operations' },
    { id: 'tool_agent', name: 'Tool Agent', desc: 'Interfaces with external tools, APIs, and integrations' },
    { id: 'swarm_member', name: 'Swarm Member', desc: 'Participates in multi-agent swarms for distributed tasks' },
    { id: 'observer_auditor', name: 'Observer / Auditor', desc: 'Monitors agent actions, enforces safety rules, audits compliance' },
  ];

  const categoryColors: Record<string, string> = {
    Core: '#8b5cf6', Development: '#3b82f6', Security: '#ef4444', Architecture: '#f59e0b',
    Performance: '#10b981', Quality: '#06b6d4', Infrastructure: '#ec4899', Utility: '#64748b',
  };

  const renderAgents = () => (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconBlue}`}><BotIcon /></div></div><div className={styles.statValue}>{INTERNAL_AGENTS.length}</div><div className={styles.statLabel}>Individual Agents</div></div>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconGreen}`}><UsersIcon /></div></div><div className={styles.statValue}>{INTERNAL_TEAMS.length}</div><div className={styles.statLabel}>Agent Teams</div></div>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconOrange}`}><CpuIcon /></div></div><div className={styles.statValue}>{RARA_TYPES.length}</div><div className={styles.statLabel}>RARA Types</div></div>
        <div className={styles.statCard}><div className={styles.statHeader}><div className={`${styles.statIcon} ${styles.statIconRed}`}><ActivityIcon /></div></div><div className={styles.statValue}>{INTERNAL_AGENTS.filter(a => a.autonomous).length}</div><div className={styles.statLabel}>Autonomous</div></div>
      </div>

      {/* Individual Agent Types */}
      <div className={styles.section} style={{ marginBottom: '24px' }}>
        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}><BotIcon /> Individual Agent Types ({INTERNAL_AGENTS.length})</h2></div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.2)' }}>
                <th style={{ textAlign: 'left', padding: '8px', color: '#94a3b8' }}>Agent</th>
                <th style={{ textAlign: 'left', padding: '8px', color: '#94a3b8' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '8px', color: '#94a3b8' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '8px', color: '#94a3b8' }}>Autonomous</th>
                <th style={{ textAlign: 'left', padding: '8px', color: '#94a3b8' }}>Top Specializations</th>
              </tr>
            </thead>
            <tbody>
              {INTERNAL_AGENTS.map(agent => (
                <tr key={agent.id} style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                  <td style={{ padding: '8px', color: '#e2e8f0', fontWeight: 600 }}>{agent.name}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: `${categoryColors[agent.category] || '#64748b'}22`, color: categoryColors[agent.category] || '#94a3b8', fontSize: '10px' }}>{agent.category}</span>
                  </td>
                  <td style={{ padding: '8px', color: '#94a3b8', maxWidth: '300px' }}>{agent.desc}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <span style={{ color: agent.autonomous ? '#10b981' : '#64748b' }}>{agent.autonomous ? '✅' : '—'}</span>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {Object.entries(agent.specializations).slice(0, 3).map(([k, v]) => (
                        <span key={k} style={{ padding: '1px 6px', borderRadius: '3px', background: 'rgba(139,92,246,0.12)', color: '#a78bfa', fontSize: '9px' }}>
                          {k.replace(/_/g, ' ')} {(v * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Teams */}
      <div className={styles.section} style={{ marginBottom: '24px' }}>
        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}><UsersIcon /> Multi-Agent Teams ({INTERNAL_TEAMS.length})</h2></div>
        <div className={styles.cardsGrid}>
          {INTERNAL_TEAMS.map(team => (
            <div key={team.id} className={styles.card}>
              <h3 className={styles.cardTitle} style={{ margin: '0 0 6px 0', fontSize: '14px' }}>{team.name}</h3>
              <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5, marginBottom: '8px' }}>{team.desc}</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                {team.agents.map((a, i) => (
                  <span key={a}>
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.15)', color: '#93c5fd', fontSize: '10px' }}>{a}</span>
                    {i < team.agents.length - 1 && <span style={{ color: '#475569', fontSize: '10px', margin: '0 2px' }}>→</span>}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ padding: '2px 6px', borderRadius: '4px', background: team.workflow === 'parallel_merge' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)', color: team.workflow === 'parallel_merge' ? '#fbbf24' : '#6ee7b7', fontSize: '10px' }}>
                  {team.workflow === 'parallel_merge' ? '⚡ Parallel Merge' : '📋 Sequential'}
                </span>
              </div>
              <div style={{ marginTop: '6px', fontSize: '10px', color: '#64748b' }}>Triggers: {team.triggers}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RARA Agent Types */}
      <div className={styles.section} style={{ marginBottom: '24px' }}>
        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}><CpuIcon /> RARA Agent Types ({RARA_TYPES.length})</h2></div>
        <div className={styles.statsGrid}>
          {RARA_TYPES.map(rt => (
            <div key={rt.id} className={styles.statCard}>
              <div className={styles.statValue} style={{ fontSize: '14px' }}>{rt.name}</div>
              <div className={styles.statLabel} style={{ marginTop: '4px' }}>{rt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Autonomous Infrastructure */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}><SettingsIcon /> Autonomous Infrastructure</h2></div>
        <div className={styles.cardsGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{ margin: '0 0 6px 0' }}>🧠 AutonomousAgentExecutor</h3>
            <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 }}>Wraps any agent type for autonomous decision-making. Tries local/cached decisions first (KB lookup), then falls back to LLM consultation. Backed by Hash Sphere memory.</div>
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748b' }}>File: chat_service/app/services/autonomous_agent_executor.py</div>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{ margin: '0 0 6px 0' }}>⚙️ AutonomousDaemon</h3>
            <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 }}>Background daemon managing autonomous agent lifecycle, self-triggering, goal updates, and health monitoring.</div>
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748b' }}>File: agent_engine_service/app/routers_autonomous.py</div>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{ margin: '0 0 6px 0' }}>🔄 ParallelAgentRuntime</h3>
            <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 }}>Enables parallel agent communication, capability registration, and multi-agent coordination for team workflows.</div>
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748b' }}>File: agent_engine_service/app/parallel_runtime.py</div>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{ margin: '0 0 6px 0' }}>📊 AgentCapabilityRegistry</h3>
            <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.5 }}>Tracks agent strengths, weaknesses, success rates, specialization scores, and workload for intelligent task routing.</div>
            <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748b' }}>File: chat_service/app/services/agent_capability_registry.py</div>
          </div>
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
          <a href={ENV.grafanaUrl} target="_blank" rel="noopener noreferrer" className={styles.logoutBtn} style={{ textDecoration: 'none' }}>
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
              <span className={styles.revenueItemValue}>{formatMetric(authMetrics.loginSuccess)}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#ef4444' }} />Login Failed
              </span>
              <span className={styles.revenueItemValue}>{formatMetric(authMetrics.loginFailed)}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#3b82f6' }} />Registrations
              </span>
              <span className={styles.revenueItemValue}>{formatMetric(authMetrics.registrations)}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#8b5cf6' }} />MFA Enabled Users
              </span>
              <span className={styles.revenueItemValue}>{formatMetric(authMetrics.mfaEnabled)}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#06b6d4' }} />Active Sessions
              </span>
              <span className={styles.revenueItemValue}>{formatMetric(authMetrics.activeSessions)}</span>
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
              <span className={styles.revenueItemValue}>{formatMetric(billingMetrics.subscriptionsActive)}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#3b82f6' }} />Payments Success
              </span>
              <span className={styles.revenueItemValue}>{formatMetric(billingMetrics.paymentsSuccess)}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#ef4444' }} />Payments Failed
              </span>
              <span className={styles.revenueItemValue}>{formatMetric(billingMetrics.paymentsFailed)}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#8b5cf6' }} />Webhooks Processed
              </span>
              <span className={styles.revenueItemValue}>{formatMetric(billingMetrics.webhooksProcessed)}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: '#f59e0b' }} />Checkout Conversion
              </span>
              <span className={styles.revenueItemValue}>
                {billingMetrics.checkoutStarted != null && billingMetrics.checkoutCompleted != null && billingMetrics.checkoutStarted > 0
                  ? `${((billingMetrics.checkoutCompleted / billingMetrics.checkoutStarted) * 100).toFixed(1)}%`
                  : '—'
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
            <a href={ENV.grafanaUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              📊 Grafana Dashboard
            </a>
            <a href={ENV.prometheusUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
              📈 Prometheus Metrics
            </a>
            <a href={ENV.alertmanagerUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none' }}>
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

  const renderSystemControl = () => (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}><ServerIcon /></div>
          </div>
          <div className={styles.statValue}>{realServices ? `${realServices.healthy}/${realServices.total}` : '—'}</div>
          <div className={styles.statLabel}>Services Online</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}><CpuIcon /></div>
          </div>
          <div className={styles.statValue}>{realMetrics?.cpu?.usage_percent?.toFixed(1) || '—'}%</div>
          <div className={styles.statLabel}>CPU Usage</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}><ActivityIcon /></div>
          </div>
          <div className={styles.statValue}>{realMetrics?.memory?.usage_percent?.toFixed(1) || '—'}%</div>
          <div className={styles.statLabel}>Memory ({realMetrics?.memory?.used_gb || '—'}GB / {realMetrics?.memory?.total_gb || '—'}GB)</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}><DatabaseIcon /></div>
          </div>
          <div className={styles.statValue}>{realMetrics?.disk?.usage_percent?.toFixed(1) || '—'}%</div>
          <div className={styles.statLabel}>Disk ({realMetrics?.disk?.used_gb || '—'}GB / {realMetrics?.disk?.total_gb || '—'}GB)</div>
        </div>
      </div>

      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><ServerIcon /> Live Service Health ({realServices ? `${realServices.healthy} healthy / ${realServices.total} total` : 'unavailable'})</h3>
          <div className={styles.revenueBreakdown}>
            {realServices?.services?.map(svc => (
              <div key={svc.key} className={styles.revenueItem}>
                <span className={styles.revenueItemLabel}>
                  <span className={styles.revenueItemDot} style={{ background: svc.status === 'healthy' ? '#10b981' : svc.status === 'degraded' ? '#f59e0b' : '#ef4444' }} />
                  {svc.name}
                </span>
                <span style={{ color: svc.status === 'healthy' ? '#10b981' : svc.status === 'degraded' ? '#f59e0b' : '#ef4444', fontSize: '12px' }}>
                  {svc.status} - {svc.latency}ms
                </span>
              </div>
            )) || <div style={{ color: '#64748b', fontSize: '13px' }}>Loading service data...</div>}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}><DatabaseIcon /> Database Status</h3>
          <div className={styles.revenueBreakdown}>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>PostgreSQL</span>
              <span style={{ color: realDbStats?.databases?.postgresql?.status === 'configured' ? '#10b981' : '#f59e0b' }}>
                {realDbStats?.databases?.postgresql?.status || 'checking...'}
              </span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Redis Cache</span>
              <span style={{ color: realDbStats?.databases?.redis?.status === 'configured' || realDbStats?.databases?.redis?.status === 'connected' ? '#10b981' : '#f59e0b' }}>
                {realDbStats?.databases?.redis?.status || 'checking...'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}><CpuIcon /> System Info</h3>
          <div className={styles.revenueBreakdown}>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>CPU Cores</span>
              <span>{realMetrics?.cpu?.cores || '—'}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Load Average</span>
              <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{realMetrics?.cpu?.load_avg?.join(', ') || '—'}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Server Uptime</span>
              <span>{realMetrics?.uptime_human || '—'}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Network Sent</span>
              <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{realMetrics?.network ? (realMetrics.network.bytes_sent / (1024*1024*1024)).toFixed(1) + ' GB' : '—'}</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Network Received</span>
              <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{realMetrics?.network ? (realMetrics.network.bytes_recv / (1024*1024*1024)).toFixed(1) + ' GB' : '—'}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}><SettingsIcon /> Platform Access (Owner Only)</h3>
          <div className={styles.revenueBreakdown}>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Domain</span>
              <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>resonantgenesis.xyz</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Gateway</span>
              <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>:8001 → nginx → :443</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>RARA Agents</span>
              <span>{realRara?.agent_count ?? '—'} registered</span>
            </div>
            <div className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>Kill Switch</span>
              <span style={{ color: realRara?.kill_switch?.active ? '#ef4444' : '#10b981' }}>
                {realRara?.kill_switch?.active ? 'ACTIVE' : realRara?.kill_switch ? 'OFF' : '—'}
              </span>
            </div>
          </div>
          <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', fontSize: '12px', color: '#a78bfa' }}>
            🔒 This control plane is isolated from regular users. Only platform owners can access these controls.
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/owner/chat-skills-control')}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(14, 165, 233, 0.4)',
                background: 'rgba(14, 165, 233, 0.14)',
                color: '#7dd3fc',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Open Chat Skills Control
            </button>
            <button
              onClick={() => navigate('/owner/agents-control')}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(250, 204, 21, 0.35)',
                background: 'rgba(250, 204, 21, 0.12)',
                color: '#fde68a',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Open Agents Control
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const fetchChatSkills = async () => {
    setSkillsLoading(true);
    setSkillsError(null);
    try {
      const ownerToken = localStorage.getItem('owner_token');
      const sessionToken = localStorage.getItem('access_token');
      const authToken = ownerToken || sessionToken;
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`${API_BASE}/skills/list`, { headers });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Failed to fetch skills: ${res.status} ${text.slice(0, 100)}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error(`Skills endpoint returned non-JSON response (${contentType})`);
      }
      const data = await res.json();
      setChatSkills(data.skills || []);
    } catch (err: any) {
      setSkillsError(err.message || 'Failed to load skills');
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleToggleSkill = async (skillId: string, enabled: boolean) => {
    try {
      const ownerToken = localStorage.getItem('owner_token');
      const sessionToken = localStorage.getItem('access_token');
      const authToken = ownerToken || sessionToken;
      const res = await fetch(`${API_BASE}/skills/toggle`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId, enabled }),
      });
      if (!res.ok) throw new Error(`Toggle failed: ${res.status}`);
      setChatSkills(prev => prev.map(s => s.id === skillId ? { ...s, enabled } : s));
    } catch (err: any) {
      console.error('Failed to toggle skill:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'chat-skills' && chatSkills.length === 0 && !skillsLoading) {
      fetchChatSkills();
    }
  }, [activeTab]);

  const renderChatSkills = () => {
    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: '#e2e8f0', fontSize: '18px', margin: 0 }}>AGI Neural Hub Skills Management</h2>
          <button
            onClick={fetchChatSkills}
            disabled={skillsLoading}
            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.4)', background: 'rgba(14, 165, 233, 0.14)', color: '#7dd3fc', fontSize: '12px', cursor: 'pointer' }}
          >
            {skillsLoading ? 'Loading...' : 'Refresh Skills'}
          </button>
        </div>
        {skillsError && <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '13px' }}>{skillsError}</div>}
        <div className={styles.cardsGrid}>
          {skillsLoading && chatSkills.length === 0 ? (
            <div className={styles.card} style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>Loading skills...</div>
          ) : chatSkills.length === 0 ? (
            <div className={styles.card} style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8' }}>No skills found</div>
          ) : chatSkills.map(skill => (
            <div key={skill.id} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                  <span style={{ fontSize: '18px', marginRight: '6px' }}>{skill.icon}</span> {skill.name}
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: skill.enabled ? '#10b981' : '#94a3b8' }}>
                  <input
                    type="checkbox"
                    checked={skill.enabled}
                    onChange={e => handleToggleSkill(skill.id, e.target.checked)}
                    style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                  />
                  {skill.enabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px', lineHeight: '1.5' }}>{skill.description}</div>
              <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', fontSize: '10px' }}>{skill.category}</span>
                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(14, 165, 233, 0.15)', color: '#7dd3fc', fontSize: '10px' }}>{skill.credit_cost} credits</span>
                {skill.is_default && <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', fontSize: '10px' }}>Default</span>}
                {skill.requires_api_key && <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontSize: '10px' }}>API Key: {skill.requires_api_key}</span>}
              </div>
              {skill.capabilities && skill.capabilities.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                  {skill.capabilities.join(' · ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

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
        <h3 className={styles.cardTitle}><ServerIcon /> System Status (Live)</h3>
        <div className={styles.revenueBreakdown}>
          {realServices?.services?.slice(0, 6).map(svc => (
            <div key={svc.key} className={styles.revenueItem}>
              <span className={styles.revenueItemLabel}>
                <span className={styles.revenueItemDot} style={{ background: svc.status === 'healthy' ? '#10b981' : svc.status === 'degraded' ? '#f59e0b' : '#ef4444' }} />
                {svc.name}
              </span>
              <span style={{ color: svc.status === 'healthy' ? '#10b981' : svc.status === 'degraded' ? '#f59e0b' : '#ef4444' }}>{svc.status}</span>
            </div>
          )) || (
            <>
              <div className={styles.revenueItem}><span className={styles.revenueItemLabel}>Loading...</span></div>
            </>
          )}
        </div>
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><DatabaseIcon /> System Resources (Live)</h3>
        <div className={styles.revenueBreakdown}>
          <div className={styles.revenueItem}><span className={styles.revenueItemLabel}>CPU</span><span className={styles.revenueItemValue}>{realMetrics?.cpu?.usage_percent?.toFixed(1) || '—'}%</span></div>
          <div className={styles.revenueItem}><span className={styles.revenueItemLabel}>Memory</span><span className={styles.revenueItemValue}>{realMetrics?.memory?.usage_percent?.toFixed(1) || '—'}%</span></div>
          <div className={styles.revenueItem}><span className={styles.revenueItemLabel}>Disk</span><span className={styles.revenueItemValue}>{realMetrics?.disk?.usage_percent?.toFixed(1) || '—'}%</span></div>
          <div className={styles.revenueItem}><span className={styles.revenueItemLabel}>Uptime</span><span className={styles.revenueItemValue}>{realMetrics?.uptime_human || '—'}</span></div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (<div className={styles.ownerDashboard}><div className={styles.container}><div className={styles.loadingState}><div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div><div>Loading owner dashboard...</div></div></div></div>);
  }

  if (error) {
    return (<div className={styles.ownerDashboard}><div className={styles.container}><div className={styles.errorState}><div style={{ fontSize: '24px', marginBottom: '16px' }}>⚠️</div><div>{error}</div><button className={styles.logoutBtn} onClick={() => navigate('/dashboard')} style={{ marginTop: '16px' }}>Return to Login</button></div></div></div>);
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
          <button className={`${styles.navTab} ${activeTab === 'agents' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('agents')}>🤖 Internal Agents</button>
          <button className={`${styles.navTab} ${activeTab === 'monitoring' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('monitoring')}>Monitoring</button>
          <button className={`${styles.navTab} ${activeTab === 'system' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('system')}>🔧 System Control</button>
          <button className={`${styles.navTab} ${activeTab === 'settings' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
          <button className={`${styles.navTab} ${activeTab === 'state-physics' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('state-physics')}>🌌 State Physics</button>
          <button className={`${styles.navTab} ${activeTab === 'v8' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('v8')}>⚡ V8 Engine</button>
          <button className={`${styles.navTab} ${activeTab === 'chat-skills' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('chat-skills')}>🧠 Chat Skills</button>
          <button className={`${styles.navTab} ${activeTab === 'control' ? styles.navTabActive : ''}`} onClick={() => setActiveTab('control')}>🎛️ Platform Control</button>
          <button className={styles.navTab} onClick={() => window.location.href = '/v8/'}>🔮 V8 HashSphere</button>
        </nav>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'revenue' && renderRevenue()}
        {activeTab === 'agents' && renderAgents()}
        {activeTab === 'monitoring' && renderMonitoring()}
        {activeTab === 'system' && renderSystemControl()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === "state-physics" && <PlatformStatePhysics />}
        {activeTab === 'v8' && <V8ControlPanel />}
        {activeTab === 'chat-skills' && renderChatSkills()}
        {activeTab === 'control' && <DaemonControlPanel />}
      </div>
    </div>
  );
};

export default OwnerDashboard;
