/**
 * Owner Dashboard - Platform Owner Analytics & Control Center
 * Comprehensive dashboard for platform owner to monitor users, revenue, usage, and RARA agents
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users as UsersLucideIcon, DollarSign, Bot as BotLucideIcon, Activity as ActivityLucideIcon,
  Server as ServerLucideIcon, Settings as SettingsLucideIcon, Orbit, Cpu as CpuLucideIcon, BarChart3, Sparkles,
  SlidersHorizontal, LogOut, RefreshCw, Crown,
} from 'lucide-react';
import { getSessionData } from '../../utils/auth-cookies';
import { fetchPlan } from '../../api/pricing';
import styles from './OwnerDashboard.module.css';
import V8ControlPanel from '../../components/owner/V8ControlPanel';
import PlatformStatePhysics from '../../components/owner/PlatformStatePhysics';
import DaemonControlPanel from '../../components/owner/DaemonControlPanel';
import { getSystemMetrics, getServiceHealth, getDatabaseStats, getRaraAgents, getSystemOverview, getPlatformUsers, getPlatformAnalytics, getRecentActivity, getV8Data, getUsageAnalytics, SystemMetrics, ServiceHealthResponse, DatabaseStats, RaraData, PlatformAnalytics, ActivityResponse, V8Data, UsageAnalytics } from '../../api/system';
type AdminLocStats = null;
type LiveLocStats = null;

// Icons (content icons used inline within panels/stat tiles)
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

// Types
interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
  plan: string;
  orgName?: string;
  status: 'active' | 'inactive' | 'warning';
  creditsUsed: number | null;
  creditsTotal: number | null;
  revenue: number | null;
  lastActive: string;
  signupDate: string;
  isSuperuser?: boolean;
  mfaEnabled?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string | null;
  unlimitedCredits?: boolean;
  trialStatus?: string | null;
  trialExpiresAt?: string | null;
  chatCount?: number;
  messageCount?: number;
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

type TabType = 'overview' | 'users' | 'revenue' | 'agents' | 'monitoring' | 'settings' | 'state-physics' | 'system' | 'v8' | 'control' | 'chat-skills' | 'usage';

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
  const [locAdminStats, setLocAdminStats] = useState<AdminLocStats | null>(null);
  const [liveLoc, setLiveLoc] = useState<LiveLocStats | null>(null);
  const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics | null>(null);

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
    const sessionRole = sessionData?.role ? String(sessionData.role) : '';
    const isSuperuser = Boolean(sessionData?.is_superuser) || sessionRole === 'platform_owner';

    // Allow access if superuser OR has owner_token
    if (!isSuperuser && !ownerToken) {
      navigate('/dashboard');
      return;
    }

    try {
      const fetchOpts: RequestInit = { credentials: 'include' };
      if (ownerToken) {
        fetchOpts.headers = { 'Authorization': `Bearer ${ownerToken}` };
      }
      const statsRes = await fetch(`${API_BASE}/owner/auth/dashboard/stats`, fetchOpts);
      if (statsRes.status === 401 || statsRes.status === 403) {
        localStorage.removeItem('owner_token');
        return;
      }
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
            role: u.role || 'user',
            plan: (u.plan || 'free') as 'developer' | 'plus' | 'enterprise',
            orgName: u.org_name || '',
            status: (u.status || (u.is_active ? 'active' : 'inactive')) as 'active' | 'inactive' | 'warning',
            creditsUsed: null,
            creditsTotal: null,
            revenue: null,
            lastActive: u.last_login_at || 'Never',
            signupDate: u.created_at ? u.created_at.split('T')[0] : 'N/A',
            mfaEnabled: u.mfa_enabled || false,
            emailVerified: u.email_verified || false,
            lastLoginAt: u.last_login_at ? u.last_login_at.split('T')[0] : null,
            isSuperuser: u.is_superuser || false,
            unlimitedCredits: u.unlimited_credits || false,
            trialStatus: u.trial_status || null,
            trialExpiresAt: u.trial_expires_at || null,
            chatCount: u.chat_count || 0,
            messageCount: u.message_count || 0,
          }));
          setUsers(mappedUsers);
        } else {
          throw new Error('Gateway users endpoint returned no users');
        }
      } catch (e) {
        console.warn('System users endpoint not available, trying auth endpoint:', e);
        // Fallback to auth endpoint
        const usersRes = await fetch(`${API_BASE}/owner/auth/dashboard/users`, {
          credentials: 'include',
          ...(ownerToken ? { headers: { 'Authorization': `Bearer ${ownerToken}` } } : {}),
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          const mappedUsers: User[] = (usersData.users || []).map((u: any) => ({
            id: u.id,
            name: u.full_name || u.email.split('@')[0],
            email: u.email,
            username: u.username || '',
            role: u.role || 'user',
            plan: u.plan || 'free',
            orgName: u.org_name || '',
            status: (u.status || (u.is_active ? 'active' : 'inactive')) as 'active' | 'inactive' | 'warning',
            creditsUsed: null,
            creditsTotal: null,
            revenue: null,
            lastActive: u.last_login_at || 'Never',
            signupDate: u.created_at ? u.created_at.split('T')[0] : 'N/A',
            isSuperuser: u.is_superuser || false,
            mfaEnabled: u.mfa_enabled || false,
            emailVerified: u.email_verified || false,
            lastLoginAt: u.last_login_at ? u.last_login_at.split('T')[0] : null,
          }));
          setUsers(mappedUsers);
        }
      }

      // Fetch settings
      const settingsRes = await fetch(`${API_BASE}/owner/auth/settings`, {
        credentials: 'include',
        ...(ownerToken ? { headers: { 'Authorization': `Bearer ${ownerToken}` } } : {}),
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings({
          creditRate: settingsData.credit_rate || 0.001,
          developerCredits: settingsData.developer_credits || 15000,
          plusCredits: settingsData.plus_credits || 499000,
          plusPrice: settingsData.plus_price || 499,
          topupPrice: settingsData.topup_price || 8,
          topupAmount: settingsData.topup_amount || 10000,
          maintenanceMode: settingsData.maintenance_mode || false,
          signupsEnabled: settingsData.signups_enabled !== false,
        });
      }

      // Fetch billing metrics from billing service
      try {
        const billingRes = await fetch(`${API_BASE}/api/v1/billing/metrics`, {
          credentials: 'include',
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
          credentials: 'include',
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

      // LOC admin stats removed — IDE service killed
      try {
        // no-op
      } catch (e) {
        console.warn('LOC stats not available:', e);
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
        // Fetch usage analytics
        try {
          const usageData = await getUsageAnalytics();
          if (usageData && !usageData.error) setUsageAnalytics(usageData);
        } catch (e) {
          console.warn('Usage analytics not available:', e);
        }
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
    if (!confirm(`Send password reset email to ${userEmail}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/owner/auth/admin/reset-password/${userId}`, {
        method: 'POST',
        credentials: 'include',
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
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} ${userEmail}?`)) {
      return;
    }

    try {
      const endpoint = isCurrentlyBlocked ? 'unblock-user' : 'block-user';
      const response = await fetch(`${API_BASE}/owner/auth/admin/${endpoint}/${userId}`, {
        method: 'POST',
        credentials: 'include',
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
    if (!confirm(`⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE ${userEmail}? This cannot be undone!`)) {
      return;
    }

    if (!confirm(`⚠️ FINAL WARNING: Type 'DELETE' to confirm permanent deletion of ${userEmail}`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/owner/auth/admin/delete-user/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
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
      developer: 'badge',
      plus: 'badge badgePrimary',
      enterprise: 'badge badgeWarning',
    };
    return map[plan] || 'badge';
  };

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      active: 'badge badgeSuccess',
      inactive: 'badge',
      warning: 'badge badgeWarning',
    };
    return map[status] || 'badge';
  };

  const formatMetric = (value: number | null | undefined) => (
    value == null ? '—' : value.toLocaleString()
  );

  const formatCurrencyMetric = (value: number | null | undefined) => (
    value == null ? '—' : `$${value.toLocaleString()}`
  );

  const renderOverview = () => (
    <>
      <div className="statGrid dashSection">
        <div className="statTile">
          <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconBlue}`}><UsersIcon /></span>Total Users</div>
          <div className="statTileValue">{formatMetric(realAnalytics?.total_users ?? stats.totalUsers)}</div>
          <div className="statTileMeta">{(realAnalytics?.total_users ?? stats.totalUsers) != null ? 'Live from backend' : 'Unavailable'}</div>
        </div>
        <div className="statTile">
          <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconGreen}`}><ActivityIcon /></span>Active Users (24h)</div>
          <div className="statTileValue">{formatMetric(realAnalytics?.active_users_24h ?? stats.activeUsers)}</div>
        </div>
        <div className="statTile">
          <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconTeal}`}><DollarIcon /></span>Revenue (30d)</div>
          <div className="statTileValue">{formatCurrencyMetric(realAnalytics?.revenue_30d ?? stats.totalRevenue)}</div>
        </div>
        <div className="statTile">
          <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconOrange}`}><CpuIcon /></span>Credits Consumed</div>
          <div className="statTileValue">{formatMetric(realAnalytics?.credits_consumed ?? stats.creditsConsumed)}</div>
        </div>
        <div className="statTile">
          <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconCyan}`}><ServerIcon /></span>API Calls (30d)</div>
          <div className="statTileValue">{formatMetric(realAnalytics?.api_calls_30d ?? stats.apiCalls)}</div>
        </div>
        <div className="statTile">
          <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconRed}`}><TrendingUpIcon /></span>Active Connections</div>
          <div className="statTileValue">{formatMetric(realAnalytics?.active_connections)}</div>
        </div>
      </div>

      <div className="panelGrid dashSection">
        <div className="panel">
          <h3 className={styles.panelTitle}><DollarIcon /> Revenue Overview</h3>
          <div className={styles.revenueChart}>
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
                return <div className="emptyState">No live revenue metrics available</div>;
              }
              const maxVal = Math.max(...items.map(it => it.value), 1);
              return items.map((item) => (
                <div key={item.label} className={styles.revenueChartCol}>
                  <div className={styles.revenueChartBar} style={{ height: `${Math.max(10, (item.value / maxVal) * 100)}%` }}>
                    <span className={styles.revenueChartValue}>{item.display}</span>
                  </div>
                  <span className={styles.revenueChartLabel}>{item.label}</span>
                </div>
              ));
            })()}
          </div>
          <div className={`rowList ${styles.mt4}`}>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}><span className={`${styles.dot} ${styles.dotPrimary}`} />Total Revenue</span>
              <span className={styles.rowValue}>{formatCurrencyMetric(realAnalytics?.revenue_30d ?? stats.totalRevenue)}</span>
            </div>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}><span className={`${styles.dot} ${styles.dotBlue}`} />Credits Purchased</span>
              <span className={styles.rowValue}>{formatMetric(realAnalytics?.total_credits_purchased)}</span>
            </div>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}><span className={`${styles.dot} ${styles.dotSuccess}`} />Credits Balance</span>
              <span className={styles.rowValue}>{formatMetric(realAnalytics?.credits_balance)}</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <h3 className={styles.panelTitle}><ActivityIcon /> Recent Activity</h3>
          <div className="rowList">
            {realActivity && realActivity.activities.length > 0 ? (
              realActivity.activities.map((activity, idx) => (
                <div key={idx} className="row">
                  <div className={styles.iconRow}>
                    <span className={`${styles.statIcon} ${
                      activity.category === 'agents' ? styles.statIconTeal :
                      activity.category === 'v8' ? styles.statIconOrange :
                      activity.category === 'system' ? styles.statIconGreen :
                      styles.statIconBlue
                    }`}>
                      {activity.category === 'agents' ? <BotIcon /> :
                       activity.category === 'v8' ? <CpuIcon /> :
                       activity.category === 'system' ? <ServerIcon /> :
                       <ActivityIcon />}
                    </span>
                    <div>
                      <div className="rowLabel">{activity.message}</div>
                      <div className="rowDesc">{new Date(activity.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="emptyState">Loading activity...</div>
            )}
          </div>
        </div>
      </div>

      {/* Resonant AI — LOC Stats (Admin) */}
      <div className="dashSection">
        <div className="dashSectionHead">
          <h2 className="dashSectionTitle"><ActivityIcon /> Resonant AI — Lines of Code</h2>
          {liveLoc && (
            <span className={`${styles.muted} ${styles.iconRow} ${styles.valueActive}`}>
              <span className={`${styles.dot} ${styles.dotSm} ${styles.dotSuccess}`} />
              {liveLoc.lines_today.toLocaleString()} lines today &middot; {liveLoc.active_users_today} active
            </span>
          )}
        </div>
        <div className="panel">
          <div className={`statGrid ${styles.mb4}`}>
            <div className="statTile">
              <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconGreen}`}><ActivityIcon /></span>Lines Written</div>
              <div className="statTileValue">{locAdminStats ? locAdminStats.total_lines_written.toLocaleString() : '—'}</div>
            </div>
            <div className="statTile">
              <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconBlue}`}><ActivityIcon /></span>Lines Edited</div>
              <div className="statTileValue">{locAdminStats ? locAdminStats.total_lines_edited.toLocaleString() : '—'}</div>
            </div>
            <div className="statTile">
              <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconTeal}`}><ActivityIcon /></span>Net Lines</div>
              <div className="statTileValue">{locAdminStats ? locAdminStats.total_net_lines.toLocaleString() : '—'}</div>
            </div>
            <div className="statTile">
              <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconOrange}`}><CpuIcon /></span>Total Tool Calls</div>
              <div className="statTileValue">{locAdminStats ? locAdminStats.total_tool_calls.toLocaleString() : '—'}</div>
            </div>
            <div className="statTile">
              <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconCyan}`}><UsersIcon /></span>IDE Users</div>
              <div className="statTileValue">{locAdminStats ? locAdminStats.total_users : '—'}</div>
            </div>
            <div className="statTile">
              <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconRed}`}><TrendingUpIcon /></span>All-Time LOC</div>
              <div className="statTileValue">{liveLoc ? liveLoc.total_lines_all_time.toLocaleString() : '—'}</div>
            </div>
          </div>
          {locAdminStats && locAdminStats.users.length > 0 && (
            <div className="dashTableWrap">
              <table className="dashTable">
                <thead>
                  <tr><th>User</th><th className={styles.tblRight}>Written</th><th className={styles.tblRight}>Edited</th><th className={styles.tblRight}>Net</th><th className={styles.tblRight}>Tool Calls</th><th>Languages</th><th>Last Active</th></tr>
                </thead>
                <tbody>
                  {locAdminStats.users.slice(0, 10).map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.user_email || u.user_id}</td>
                      <td className={`${styles.mono} ${styles.textRight}`}>{u.total_lines_written.toLocaleString()}</td>
                      <td className={`${styles.mono} ${styles.textRight}`}>{u.total_lines_edited.toLocaleString()}</td>
                      <td className={`${styles.mono} ${styles.textRight}`}>{u.total_net_lines.toLocaleString()}</td>
                      <td className={`${styles.mono} ${styles.textRight}`}>{u.total_tool_calls.toLocaleString()}</td>
                      <td className={styles.muted}>{Object.keys(u.languages || {}).slice(0, 3).join(', ') || '—'}</td>
                      <td className={styles.muted}>{u.last_active ? new Date(u.last_active).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="dashSection">
        <div className="dashSectionHead">
          <h2 className="dashSectionTitle"><UsersIcon /> Top Users</h2>
        </div>
        <div className="panel">
          <div className="dashTableWrap">
            <table className="dashTable">
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
                    <td><span className={getBadgeClass(user.plan)}>{user.plan}</span></td>
                    <td>{user.creditsUsed != null && user.creditsTotal != null ? `${user.creditsUsed} / ${user.creditsTotal}` : '—'}</td>
                    <td>{user.revenue != null ? `$${user.revenue}/mo` : '—'}</td>
                    <td><span className={getStatusClass(user.status)}>{user.status}</span></td>
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
    <div className="dashSection">
      <div className="dashSectionHead">
        <h2 className="dashSectionTitle"><UsersIcon /> All Users ({users.length} total)</h2>
      </div>
      <div className="panel">
        <div className={styles.toolbar}>
          <input
            type="text"
            className={`input ${styles.grow}`}
            placeholder="Search by email, name, or username..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <span className={styles.toolbarMeta}>
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>
        <div className={`dashTableWrap ${styles.tableScrollLg}`}>
          <table className="dashTable">
            <thead>
              <tr className={styles.stickyHead}>
                <th>Email</th>
                <th>Username</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Trial</th>
                <th>Usage</th>
                <th>Last Login</th>
                <th>Signup</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className={`${styles.mono} ${styles.font12}`}>{user.email}</td>
                  <td>{(user as any).username || '-'}</td>
                  <td>
                    <span className={getStatusClass(user.status)}>{user.status}</span>
                    {(user as any).unlimitedCredits && <span className={`${styles.flagUnlimited} ${styles.ml4}`}>∞</span>}
                  </td>
                  <td>
                    <span className={`badge ${(user as any).emailVerified ? 'badgeSuccess' : 'badgeWarning'}`}>
                      {(user as any).emailVerified ? '✓ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                  <td>
                    {(user as any).trialStatus ? (
                      <span className={`badge ${(user as any).trialStatus.startsWith('active') ? 'badgeSuccess' : 'badgeError'}`}>
                        {(user as any).trialStatus}
                      </span>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td className={styles.font11}>
                    <span className={(user as any).chatCount > 0 ? styles.valueActive : styles.valueMuted}>
                      {(user as any).chatCount || 0} chats
                    </span>
                    <span className={styles.muted}>·</span>
                    <span className={(user as any).messageCount > 0 ? styles.valueInfo : styles.valueMuted}>
                      {(user as any).messageCount || 0} msgs
                    </span>
                  </td>
                  <td className={styles.muted}>
                    {(user as any).lastLoginAt || 'Never'}
                  </td>
                  <td className={styles.muted}>{user.signupDate}</td>
                  <td>
                    <div className={styles.tagRow}>
                      <button className="btn btnPrimary btnSm" onClick={() => handleResetPassword(user.id, user.email)}>
                        Reset PW
                      </button>
                      <button
                        className="btn btnSm"
                        style={{
                          background: user.status === 'blocked' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: user.status === 'blocked' ? 'var(--color-success)' : 'var(--color-warning)',
                        }}
                        onClick={() => handleBlockUser(user.id, user.email, user.status === 'blocked')}
                      >
                        {user.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>
                      <button className="btn btnDanger btnSm" onClick={() => handleDeleteUser(user.id, user.email)}>
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
      <div className="statGrid dashSection">
        <div className="statTile"><div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconGreen}`}><DollarIcon /></span>Total Revenue</div><div className="statTileValue">{formatCurrencyMetric(realAnalytics?.revenue_30d ?? stats.totalRevenue)}</div></div>
        <div className="statTile"><div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconTeal}`}><DollarIcon /></span>MRR</div><div className="statTileValue">{formatCurrencyMetric(realAnalytics?.mrr ?? stats.mrr)}</div></div>
        <div className="statTile"><div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconBlue}`}><UsersIcon /></span>Paying Customers</div><div className="statTileValue">{formatMetric(realAnalytics?.paying_users ?? realAnalytics?.paid_users)}</div></div>
      </div>
      <div className="panelGrid">
        <div className="panel"><h3 className={styles.panelTitle}>Revenue by Plan</h3><div className="emptyState">No live revenue-by-plan dataset available</div></div>
        <div className="panel"><h3 className={styles.panelTitle}>Revenue Trend</h3><div className="emptyState">No live revenue trend dataset available</div></div>
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
    Core: '#14b8a6', Development: '#3b82f6', Security: '#ef4444', Architecture: '#f59e0b',
    Performance: '#10b981', Quality: '#06b6d4', Infrastructure: '#ec4899', Utility: '#64748b',
  };

  const renderAgents = () => (
    <>
      <div className="statGrid dashSection">
        <div className="statTile"><div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconBlue}`}><BotIcon /></span>Individual Agents</div><div className="statTileValue">{INTERNAL_AGENTS.length}</div></div>
        <div className="statTile"><div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconGreen}`}><UsersIcon /></span>Agent Teams</div><div className="statTileValue">{INTERNAL_TEAMS.length}</div></div>
        <div className="statTile"><div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconOrange}`}><CpuIcon /></span>RARA Types</div><div className="statTileValue">{RARA_TYPES.length}</div></div>
        <div className="statTile"><div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconRed}`}><ActivityIcon /></span>Autonomous</div><div className="statTileValue">{INTERNAL_AGENTS.filter(a => a.autonomous).length}</div></div>
      </div>

      {/* Individual Agent Types */}
      <div className="dashSection">
        <div className="dashSectionHead"><h2 className="dashSectionTitle"><BotIcon /> Individual Agent Types ({INTERNAL_AGENTS.length})</h2></div>
        <div className="panel">
          <div className="dashTableWrap">
            <table className="dashTable">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className={styles.tblCenter}>Autonomous</th>
                  <th>Top Specializations</th>
                </tr>
              </thead>
              <tbody>
                {INTERNAL_AGENTS.map(agent => (
                  <tr key={agent.id}>
                    <td className={styles.semibold}>{agent.name}</td>
                    <td>
                      <span className={styles.categoryTag} style={{ background: `${categoryColors[agent.category] || '#64748b'}22`, color: categoryColors[agent.category] || 'var(--text-secondary)' }}>{agent.category}</span>
                    </td>
                    <td className={`${styles.muted} ${styles.descCol}`}>{agent.desc}</td>
                    <td className={styles.tblCenter}>
                      {agent.autonomous ? <span className="badge badgeSuccess">✅</span> : <span className={styles.muted}>—</span>}
                    </td>
                    <td>
                      <div className={styles.tagRowTight}>
                        {Object.entries(agent.specializations).slice(0, 3).map(([k, v]) => (
                          <span key={k} className={styles.specTag}>
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
      </div>

      {/* Agent Teams */}
      <div className="dashSection">
        <div className="dashSectionHead"><h2 className="dashSectionTitle"><UsersIcon /> Multi-Agent Teams ({INTERNAL_TEAMS.length})</h2></div>
        <div className="panelGrid">
          {INTERNAL_TEAMS.map(team => (
            <div key={team.id} className="panel">
              <h3 className={styles.miniCardTitle}>{team.name}</h3>
              <div className={styles.miniCardDesc}>{team.desc}</div>
              <div className={`${styles.tagRowTight} ${styles.mb2}`}>
                {team.agents.map((a, i) => (
                  <span key={a}>
                    <span className={styles.chip}>{a}</span>
                    {i < team.agents.length - 1 && <span className={styles.chipArrow}>→</span>}
                  </span>
                ))}
              </div>
              <div>
                <span className={`${styles.workflowTag} ${team.workflow === 'parallel_merge' ? styles.workflowParallel : styles.workflowSequential}`}>
                  {team.workflow === 'parallel_merge' ? '⚡ Parallel Merge' : '📋 Sequential'}
                </span>
              </div>
              <div className={`${styles.muted} ${styles.mt2}`}>Triggers: {team.triggers}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RARA Agent Types */}
      <div className="dashSection">
        <div className="dashSectionHead"><h2 className="dashSectionTitle"><CpuIcon /> RARA Agent Types ({RARA_TYPES.length})</h2></div>
        <div className="panelGrid">
          {RARA_TYPES.map(rt => (
            <div key={rt.id} className="panel">
              <div className={styles.miniCardTitle}>{rt.name}</div>
              <div className={`${styles.miniCardDesc} ${styles.mb0}`}>{rt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Autonomous Infrastructure */}
      <div className="dashSection">
        <div className="dashSectionHead"><h2 className="dashSectionTitle"><SettingsIcon /> Autonomous Infrastructure</h2></div>
        <div className="panelGrid">
          <div className="panel">
            <h3 className={styles.miniCardTitle}>🧠 AutonomousAgentExecutor</h3>
            <div className={`${styles.miniCardDesc} ${styles.mb0}`}>Wraps any agent type for autonomous decision-making. Tries local/cached decisions first (KB lookup), then falls back to LLM consultation. Backed by Hash Sphere memory.</div>
            <div className={styles.infraFile}>File: chat_service/app/services/autonomous_agent_executor.py</div>
          </div>
          <div className="panel">
            <h3 className={styles.miniCardTitle}>⚙️ AutonomousDaemon</h3>
            <div className={`${styles.miniCardDesc} ${styles.mb0}`}>Background daemon managing autonomous agent lifecycle, self-triggering, goal updates, and health monitoring.</div>
            <div className={styles.infraFile}>File: agent_engine_service/app/routers_autonomous.py</div>
          </div>
          <div className="panel">
            <h3 className={styles.miniCardTitle}>🔄 ParallelAgentRuntime</h3>
            <div className={`${styles.miniCardDesc} ${styles.mb0}`}>Enables parallel agent communication, capability registration, and multi-agent coordination for team workflows.</div>
            <div className={styles.infraFile}>File: agent_engine_service/app/parallel_runtime.py</div>
          </div>
          <div className="panel">
            <h3 className={styles.miniCardTitle}>📊 AgentCapabilityRegistry</h3>
            <div className={`${styles.miniCardDesc} ${styles.mb0}`}>Tracks agent strengths, weaknesses, success rates, specialization scores, and workload for intelligent task routing.</div>
            <div className={styles.infraFile}>File: chat_service/app/services/agent_capability_registry.py</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderMonitoring = () => (
    <>
      {/* Service Health Grid */}
      <div className="dashSection">
        <div className="dashSectionHead">
          <h2 className="dashSectionTitle"><ServerIcon /> Service Health</h2>
          <a href={ENV.grafanaUrl} target="_blank" rel="noopener noreferrer" className="btn btnGhost btnSm">
            Open Grafana Dashboard →
          </a>
        </div>
        <div className="statGrid">
          {serviceHealth.map(service => (
            <div key={service.name} className="statTile">
              <div className="statTileLabel">
                <span className={`${styles.statIcon} ${service.status === 'healthy' ? styles.statIconGreen : service.status === 'degraded' ? styles.statIconOrange : styles.statIconRed}`}>
                  <ServerIcon />
                </span>
                {service.name}
              </div>
              <div className={getStatusClass(service.status === 'healthy' ? 'active' : service.status === 'degraded' ? 'warning' : 'inactive')}>
                {service.status}
              </div>
              <div className="statTileMeta">{service.latency}ms · {service.uptime} uptime</div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth & Billing Metrics */}
      <div className="panelGrid dashSection">
        <div className="panel">
          <h3 className={styles.panelTitle}><UsersIcon /> Auth Service Metrics</h3>
          <div className="rowList">
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={`${styles.dot} ${styles.dotSuccess}`} />Login Success
              </span>
              <span className={styles.rowValue}>{formatMetric(authMetrics.loginSuccess)}</span>
            </div>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={`${styles.dot} ${styles.dotError}`} />Login Failed
              </span>
              <span className={styles.rowValue}>{formatMetric(authMetrics.loginFailed)}</span>
            </div>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={`${styles.dot} ${styles.dotBlue}`} />Registrations
              </span>
              <span className={styles.rowValue}>{formatMetric(authMetrics.registrations)}</span>
            </div>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={`${styles.dot} ${styles.dotTeal}`} />MFA Enabled Users
              </span>
              <span className={styles.rowValue}>{formatMetric(authMetrics.mfaEnabled)}</span>
            </div>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={`${styles.dot} ${styles.dotCyan}`} />Active Sessions
              </span>
              <span className={styles.rowValue}>{formatMetric(authMetrics.activeSessions)}</span>
            </div>
          </div>
          <div className={`${styles.muted} ${styles.mt4}`}>
            Metrics from: auth_login_total, auth_register_total, auth_mfa_*, auth_active_sessions
          </div>
        </div>

        <div className="panel">
          <h3 className={styles.panelTitle}><DollarIcon /> Billing Service Metrics</h3>
          <div className="rowList">
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={`${styles.dot} ${styles.dotSuccess}`} />Active Subscriptions
              </span>
              <span className={styles.rowValue}>{formatMetric(billingMetrics.subscriptionsActive)}</span>
            </div>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={`${styles.dot} ${styles.dotBlue}`} />Payments Success
              </span>
              <span className={styles.rowValue}>{formatMetric(billingMetrics.paymentsSuccess)}</span>
            </div>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={`${styles.dot} ${styles.dotError}`} />Payments Failed
              </span>
              <span className={styles.rowValue}>{formatMetric(billingMetrics.paymentsFailed)}</span>
            </div>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={`${styles.dot} ${styles.dotTeal}`} />Webhooks Processed
              </span>
              <span className={styles.rowValue}>{formatMetric(billingMetrics.webhooksProcessed)}</span>
            </div>
            <div className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={`${styles.dot} ${styles.dotWarning}`} />Checkout Conversion
              </span>
              <span className={styles.rowValue}>
                {billingMetrics.checkoutStarted != null && billingMetrics.checkoutCompleted != null && billingMetrics.checkoutStarted > 0
                  ? `${((billingMetrics.checkoutCompleted / billingMetrics.checkoutStarted) * 100).toFixed(1)}%`
                  : '—'
                }
              </span>
            </div>
          </div>
          <div className={`${styles.muted} ${styles.mt4}`}>
            Metrics from: billing_subscription_*, billing_payment_*, billing_stripe_webhook_*
          </div>
        </div>
      </div>

      {/* Alert Rules */}
      <div className="dashSection">
        <div className="dashSectionHead">
          <h2 className="dashSectionTitle"><ActivityIcon /> Active Alert Rules</h2>
        </div>
        <div className="panel">
          <div className="dashTableWrap">
            <table className="dashTable">
              <thead>
                <tr><th>Alert</th><th>Condition</th><th>Severity</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>HighLoginFailureRate</td>
                  <td>&gt;30% login failures for 5m</td>
                  <td><span className="badge badgeWarning">warning</span></td>
                  <td><span className="badge badgeSuccess">OK</span></td>
                </tr>
                <tr>
                  <td>PaymentFailuresSpike</td>
                  <td>&gt;0.1/s payment failures for 5m</td>
                  <td><span className="badge badgeError">critical</span></td>
                  <td><span className="badge badgeSuccess">OK</span></td>
                </tr>
                <tr>
                  <td>AuthServiceHighLatency</td>
                  <td>P95 &gt; 1s for 5m</td>
                  <td><span className="badge badgeWarning">warning</span></td>
                  <td><span className="badge badgeSuccess">OK</span></td>
                </tr>
                <tr>
                  <td>StripeWebhookFailures</td>
                  <td>Webhook processing failures</td>
                  <td><span className="badge badgeWarning">warning</span></td>
                  <td><span className="badge badgeSuccess">OK</span></td>
                </tr>
                <tr>
                  <td>HighCheckoutAbandonment</td>
                  <td>&gt;70% abandonment for 1h</td>
                  <td><span className="badge badgeWarning">warning</span></td>
                  <td><span className="badge badgeSuccess">OK</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="panelGrid">
        <div className="panel">
          <h3 className={styles.panelTitle}><ServerIcon /> Monitoring Tools</h3>
          <div className={styles.linkList}>
            <a href={ENV.grafanaUrl} target="_blank" rel="noopener noreferrer">📊 Grafana Dashboard</a>
            <a href={ENV.prometheusUrl} target="_blank" rel="noopener noreferrer">📈 Prometheus Metrics</a>
            <a href={ENV.alertmanagerUrl} target="_blank" rel="noopener noreferrer">🔔 Alertmanager</a>
            <a href={`${API_BASE}/api/auth/metrics`} target="_blank" rel="noopener noreferrer">🔐 Auth Metrics Endpoint</a>
            <a href={`${API_BASE}/api/billing/metrics`} target="_blank" rel="noopener noreferrer">💳 Billing Metrics Endpoint</a>
          </div>
        </div>
        <div className="panel">
          <h3 className={styles.panelTitle}><ActivityIcon /> Recent Alerts</h3>
          <div className="rowList">
            <div className="row">
              <div className={styles.iconRow}>
                <span className={`${styles.statIcon} ${styles.statIconGreen}`}><ActivityIcon /></span>
                <div>
                  <div className="rowLabel">All systems operational</div>
                  <div className="rowDesc">No active alerts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSystemControl = () => (
    <>
      <div className="statGrid dashSection">
        <div className="statTile">
          <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconGreen}`}><ServerIcon /></span>Services Online</div>
          <div className="statTileValue">{realServices ? `${realServices.healthy}/${realServices.total}` : '—'}</div>
        </div>
        <div className="statTile">
          <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconTeal}`}><CpuIcon /></span>CPU Usage</div>
          <div className="statTileValue">{realMetrics?.cpu?.usage_percent?.toFixed(1) || '—'}<span>%</span></div>
        </div>
        <div className="statTile">
          <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconOrange}`}><ActivityIcon /></span>Memory</div>
          <div className="statTileValue">{realMetrics?.memory?.usage_percent?.toFixed(1) || '—'}<span>%</span></div>
          <div className="statTileMeta">{realMetrics?.memory?.used_gb || '—'}GB / {realMetrics?.memory?.total_gb || '—'}GB</div>
        </div>
        <div className="statTile">
          <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconBlue}`}><DatabaseIcon /></span>Disk</div>
          <div className="statTileValue">{realMetrics?.disk?.usage_percent?.toFixed(1) || '—'}<span>%</span></div>
          <div className="statTileMeta">{realMetrics?.disk?.used_gb || '—'}GB / {realMetrics?.disk?.total_gb || '—'}GB</div>
        </div>
      </div>

      <div className="panelGrid">
        <div className="panel">
          <h3 className={styles.panelTitle}><ServerIcon /> Live Service Health ({realServices ? `${realServices.healthy} healthy / ${realServices.total} total` : 'unavailable'})</h3>
          <div className="rowList">
            {realServices?.services?.map(svc => (
              <div key={svc.key} className="row">
                <span className={`rowLabel ${styles.dotLabel}`}>
                  <span className={styles.dot} style={{ background: svc.status === 'healthy' ? 'var(--color-success)' : svc.status === 'degraded' ? 'var(--color-warning)' : 'var(--color-error)' }} />
                  {svc.name}
                </span>
                <span className={styles.font12} style={{ color: svc.status === 'healthy' ? 'var(--color-success)' : svc.status === 'degraded' ? 'var(--color-warning)' : 'var(--color-error)' }}>
                  {svc.status} - {svc.latency}ms
                </span>
              </div>
            )) || <div className="emptyState">Loading service data...</div>}
          </div>
        </div>

        <div className="panel">
          <h3 className={styles.panelTitle}><DatabaseIcon /> Database Status</h3>
          <div className="rowList">
            <div className="row">
              <span className="rowLabel">PostgreSQL</span>
              <span style={{ color: realDbStats?.databases?.postgresql?.status === 'configured' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {realDbStats?.databases?.postgresql?.status || 'checking...'}
              </span>
            </div>
            <div className="row">
              <span className="rowLabel">Redis Cache</span>
              <span style={{ color: realDbStats?.databases?.redis?.status === 'configured' || realDbStats?.databases?.redis?.status === 'connected' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {realDbStats?.databases?.redis?.status || 'checking...'}
              </span>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3 className={styles.panelTitle}><CpuIcon /> System Info</h3>
          <div className="rowList">
            <div className="row">
              <span className="rowLabel">CPU Cores</span>
              <span>{realMetrics?.cpu?.cores || '—'}</span>
            </div>
            <div className="row">
              <span className="rowLabel">Load Average</span>
              <span className={`${styles.mono} ${styles.font11}`}>{realMetrics?.cpu?.load_avg?.join(', ') || '—'}</span>
            </div>
            <div className="row">
              <span className="rowLabel">Server Uptime</span>
              <span>{realMetrics?.uptime_human || '—'}</span>
            </div>
            <div className="row">
              <span className="rowLabel">Network Sent</span>
              <span className={`${styles.mono} ${styles.font11}`}>{realMetrics?.network ? (realMetrics.network.bytes_sent / (1024 * 1024 * 1024)).toFixed(1) + ' GB' : '—'}</span>
            </div>
            <div className="row">
              <span className="rowLabel">Network Received</span>
              <span className={`${styles.mono} ${styles.font11}`}>{realMetrics?.network ? (realMetrics.network.bytes_recv / (1024 * 1024 * 1024)).toFixed(1) + ' GB' : '—'}</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <h3 className={styles.panelTitle}><SettingsIcon /> Platform Access (Owner Only)</h3>
          <div className="rowList">
            <div className="row">
              <span className="rowLabel">Domain</span>
              <span className={`${styles.mono} ${styles.font10}`}>resonant.dev-swat.com</span>
            </div>
            <div className="row">
              <span className="rowLabel">Gateway</span>
              <span className={`${styles.mono} ${styles.font10}`}>:8001 → nginx → :443</span>
            </div>
            <div className="row">
              <span className="rowLabel">RARA Agents</span>
              <span>{realRara?.agent_count ?? '—'} registered</span>
            </div>
            <div className="row">
              <span className="rowLabel">Kill Switch</span>
              <span style={{ color: realRara?.kill_switch?.active ? 'var(--color-error)' : 'var(--color-success)' }}>
                {realRara?.kill_switch?.active ? 'ACTIVE' : realRara?.kill_switch ? 'OFF' : '—'}
              </span>
            </div>
          </div>
          <div className={styles.noticeBox}>
            🔒 This control plane is isolated from regular users. Only platform owners can access these controls.
          </div>
          <div className={styles.btnRow}>
            <button className="btn btnSecondary btnSm" onClick={() => navigate('/owner/chat-skills-control')}>
              Open Chat Skills Control
            </button>
            <button className="btn btnSecondary btnSm" onClick={() => navigate('/owner/agents-control')}>
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
      <div className="dashSection">
        <div className="dashSectionHead">
          <h2 className="dashSectionTitle">AGI Neural Hub Skills Management</h2>
          <button className="btn btnSecondary btnSm" onClick={fetchChatSkills} disabled={skillsLoading}>
            {skillsLoading ? 'Loading...' : 'Refresh Skills'}
          </button>
        </div>
        {skillsError && <div className={styles.inlineError}>{skillsError}</div>}
        <div className="panelGrid">
          {skillsLoading && chatSkills.length === 0 ? (
            <div className={`panel emptyState ${styles.spanAll}`}>Loading skills...</div>
          ) : chatSkills.length === 0 ? (
            <div className={`panel emptyState ${styles.spanAll}`}>No skills found</div>
          ) : chatSkills.map(skill => (
            <div key={skill.id} className="panel">
              <div className={styles.skillCardHead}>
                <h3 className={`${styles.panelTitle} ${styles.mb0}`}>
                  <span className={styles.skillIcon}>{skill.icon}</span>{skill.name}
                </h3>
                <label className={styles.skillToggleLabel} style={{ color: skill.enabled ? 'var(--color-success)' : 'var(--text-tertiary)' }}>
                  <span className="toggle">
                    <input type="checkbox" checked={skill.enabled} onChange={e => handleToggleSkill(skill.id, e.target.checked)} />
                    <span className="toggleSlider" />
                  </span>
                  {skill.enabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>
              <div className={styles.skillDesc}>{skill.description}</div>
              <div className={styles.skillTags}>
                <span className="badge">{skill.category}</span>
                <span className="badge badgePrimary">{skill.credit_cost} credits</span>
                {skill.is_default && <span className="badge badgeSuccess">Default</span>}
                {skill.requires_api_key && <span className="badge badgeWarning">API Key: {skill.requires_api_key}</span>}
              </div>
              {skill.capabilities && skill.capabilities.length > 0 && (
                <div className={styles.skillCaps}>
                  {skill.capabilities.join(' · ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUsageAnalytics = () => {
    const ua = usageAnalytics;
    if (!ua) return <div className="panel emptyState">Loading usage analytics...</div>;

    const pt = ua.platform_totals;
    return (
      <>
        {/* Platform Totals */}
        <div className="statGrid dashSection">
          <div className="statTile">
            <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconBlue}`}><ActivityIcon /></span>Total Messages</div>
            <div className="statTileValue">{pt.total_messages.toLocaleString()}</div>
          </div>
          <div className="statTile">
            <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconGreen}`}><UsersIcon /></span>Total Chats</div>
            <div className="statTileValue">{pt.total_chats.toLocaleString()}</div>
          </div>
          <div className="statTile">
            <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconTeal}`}><DollarIcon /></span>Credits Used</div>
            <div className="statTileValue">{pt.total_credits_used.toLocaleString()}</div>
          </div>
          <div className="statTile">
            <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconOrange}`}><TrendingUpIcon /></span>Total Logins</div>
            <div className="statTileValue">{pt.total_logins.toLocaleString()}</div>
          </div>
          <div className="statTile">
            <div className="statTileLabel"><span className={`${styles.statIcon} ${styles.statIconCyan}`}><UsersIcon /></span>Active Users (7d)</div>
            <div className="statTileValue">{pt.active_users_7d}</div>
          </div>
        </div>

        <div className="panelGrid dashSection">
          {/* AI Provider / Model Usage */}
          <div className="panel">
            <h3 className={styles.panelTitle}><CpuIcon /> AI Agent / Model Usage</h3>
            <div className={styles.scroll320}>
              {ua.ai_provider_usage.length > 0 ? ua.ai_provider_usage.map((p, i) => {
                const maxMsgs = ua.ai_provider_usage[0]?.messages || 1;
                return (
                  <div key={p.provider} className={styles.usageBarRow}>
                    <span className={styles.usageBarRank}>{i + 1}</span>
                    <div className={styles.grow}>
                      <div className={styles.usageRowHead}>
                        <span className={`${styles.mono} ${styles.font12}`}>{p.provider}</span>
                        <span className={styles.muted}>{p.messages.toLocaleString()} msgs</span>
                      </div>
                      <div className={styles.usageBarTrack}>
                        <div className={styles.usageBarFill} style={{ width: `${(p.messages / maxMsgs) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              }) : <div className="emptyState">No AI usage data</div>}
            </div>
          </div>

          {/* Service Usage (Credit Breakdown) */}
          <div className="panel">
            <h3 className={styles.panelTitle}><ServerIcon /> Service Usage (Credits)</h3>
            {ua.service_usage.length > 0 ? (
              <div>
                {ua.service_usage.map(s => (
                  <div key={s.service} className={styles.serviceUsageRow}>
                    <span className={styles.font13}>
                      {s.service === 'chat_message' ? 'Chat Messages' :
                       s.service === 'memory_store' ? 'Memory Storage' :
                       s.service === 'code_analysis' ? 'Code Analysis' :
                       s.service === 'code_visualizer_analysis' ? 'Code Visualizer' :
                       s.service}
                    </span>
                    <div className={styles.textRight}>
                      <div className={styles.valuePrimaryStrong}>{s.credits_spent.toLocaleString()} credits</div>
                      <div className={styles.muted}>{s.transactions.toLocaleString()} transactions</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="emptyState">No service usage data</div>}
          </div>
        </div>

        <div className="panelGrid dashSection">
          {/* Top Users by Chat */}
          <div className="panel">
            <h3 className={styles.panelTitle}><UsersIcon /> Top Users by Chat Activity</h3>
            <div className={`dashTableWrap ${styles.tableScrollMd}`}>
              <table className="dashTable">
                <thead>
                  <tr className={styles.stickyHead}><th>#</th><th>User</th><th className={styles.tblRight}>Messages</th><th className={styles.tblRight}>Chats</th></tr>
                </thead>
                <tbody>
                  {ua.top_users_by_chat.map((u, i) => (
                    <tr key={u.email}>
                      <td className={`${styles.muted} ${styles.rankCol}`}>{i + 1}</td>
                      <td>
                        <div className={styles.cellName}>{u.name}</div>
                        <div className={`${styles.mono} ${styles.cellSub}`}>{u.email}</div>
                      </td>
                      <td className={`${styles.mono} ${styles.textRight} ${styles.valueInfo}`}>{u.messages.toLocaleString()}</td>
                      <td className={`${styles.mono} ${styles.textRight} ${styles.valueActive}`}>{u.chats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Users by Credit Spend */}
          <div className="panel">
            <h3 className={styles.panelTitle}><DollarIcon /> Top Users by Credit Spend</h3>
            <div className={`dashTableWrap ${styles.tableScrollMd}`}>
              <table className="dashTable">
                <thead>
                  <tr className={styles.stickyHead}><th>#</th><th>User</th><th className={styles.tblRight}>Credits Spent</th><th className={styles.tblRight}>Transactions</th></tr>
                </thead>
                <tbody>
                  {ua.top_users_by_credits.map((u, i) => (
                    <tr key={u.email}>
                      <td className={`${styles.muted} ${styles.rankCol}`}>{i + 1}</td>
                      <td>
                        <div className={styles.cellName}>{u.name}</div>
                        <div className={`${styles.mono} ${styles.cellSub}`}>{u.email}</div>
                      </td>
                      <td className={`${styles.mono} ${styles.valuePrimary} ${styles.textRight}`}>{u.credits_spent.toLocaleString()}</td>
                      <td className={`${styles.mono} ${styles.textRight} ${styles.valueMuted}`}>{u.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Per-User Detailed Stats */}
        <div className="dashSection">
          <div className="dashSectionHead">
            <h2 className="dashSectionTitle"><UsersIcon /> Per-User Usage Details ({ua.per_user_stats.length} users)</h2>
          </div>
          <div className="panel">
            <div className={`dashTableWrap ${styles.tableScrollLg}`}>
              <table className="dashTable">
                <thead>
                  <tr className={styles.stickyHead}>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Plan</th>
                    <th className={styles.tblRight}>Chats</th>
                    <th className={styles.tblRight}>Messages</th>
                    <th className={styles.tblRight}>Credits Spent</th>
                    <th className={styles.tblRight}>Credits Received</th>
                    <th>Flags</th>
                    <th>Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {ua.per_user_stats.map(u => (
                    <tr key={u.id}>
                      <td className={`${styles.mono} ${styles.font11}`}>{u.email}</td>
                      <td><span className="badge">{u.role}</span></td>
                      <td><span className={getBadgeClass(u.plan)}>{u.plan}</span></td>
                      <td className={`${styles.mono} ${u.chat_count > 0 ? styles.valueActive : styles.valueMuted} ${styles.textRight}`}>{u.chat_count}</td>
                      <td className={`${styles.mono} ${u.message_count > 0 ? styles.valueInfo : styles.valueMuted} ${styles.textRight}`}>{u.message_count}</td>
                      <td className={`${styles.mono} ${u.credits_spent > 0 ? styles.valueWarning : styles.valueMuted} ${styles.textRight}`}>{u.credits_spent.toLocaleString()}</td>
                      <td className={`${styles.mono} ${u.credits_received > 0 ? styles.valueActive : styles.valueMuted} ${styles.textRight}`}>{u.credits_received.toLocaleString()}</td>
                      <td className={styles.font10}>
                        {u.is_superuser && <span className={styles.flagSuper}>SUPER</span>}
                        {u.unlimited_credits && <span className={styles.flagUnlimited}>UNLIMITED</span>}
                        {!u.is_superuser && !u.unlimited_credits && <span className={styles.muted}>—</span>}
                      </td>
                      <td className={styles.muted}>{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Login Trends */}
        {ua.login_trends.length > 0 && (
          <div className="dashSection">
            <div className="dashSectionHead">
              <h2 className="dashSectionTitle"><TrendingUpIcon /> Login & Registration Trends (30 days)</h2>
            </div>
            <div className="panel">
              <div className={styles.trendChart}>
                {(() => {
                  const dates = [...new Set(ua.login_trends.map(t => t.date))].sort().slice(-14);
                  return dates.map(date => {
                    const logins = ua.login_trends.filter(t => t.date === date && t.event !== 'registration').reduce((s, t) => s + t.count, 0);
                    const regs = ua.login_trends.filter(t => t.date === date && t.event === 'registration').reduce((s, t) => s + t.count, 0);
                    return (
                      <div key={date} className={styles.trendCol}>
                        <div className={styles.trendBars}>
                          {regs > 0 && <div className={styles.trendBarReg} style={{ height: `${Math.max(4, regs * 4)}px` }} title={`${regs} registrations`} />}
                          {logins > 0 && <div className={styles.trendBarLogin} style={{ height: `${Math.max(4, logins * 2)}px` }} title={`${logins} logins`} />}
                        </div>
                        <div className={styles.trendLabel}>{date.slice(5)}</div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className={styles.trendLegend}>
                <span className={styles.valueInfo}>&#9632; Logins</span>
                <span className={styles.valueActive}>&#9632; Registrations</span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderSettings = () => (
    <div className="panelGrid">
      <div className="panel">
        <h3 className={styles.panelTitle}><DollarIcon /> Pricing Settings</h3>
        <div className={styles.stack5}>
          <div className={styles.formGrid}>
            <div className="field">
              <label className="fieldLabel">Credit Rate ($)</label>
              <input type="number" step="0.0001" className="input" value={settings.creditRate} onChange={e => setSettings({ ...settings, creditRate: parseFloat(e.target.value) })} />
            </div>
            <div className="field">
              <label className="fieldLabel">Developer Credits</label>
              <input type="number" className="input" value={settings.developerCredits} onChange={e => setSettings({ ...settings, developerCredits: parseInt(e.target.value) })} />
            </div>
          </div>
          <div className={styles.formGrid}>
            <div className="field">
              <label className="fieldLabel">Plus Credits</label>
              <input type="number" className="input" value={settings.plusCredits} onChange={e => setSettings({ ...settings, plusCredits: parseInt(e.target.value) })} />
            </div>
            <div className="field">
              <label className="fieldLabel">Plus Price ($)</label>
              <input type="number" className="input" value={settings.plusPrice} onChange={e => setSettings({ ...settings, plusPrice: parseInt(e.target.value) })} />
            </div>
          </div>
          <button className={`btn btnPrimary ${styles.selfStart}`} onClick={handleSaveSettings}>Save Pricing</button>
        </div>
      </div>
      <div className="panel">
        <h3 className={styles.panelTitle}><SettingsIcon /> Platform Settings</h3>
        <div className="rowList">
          <div className="row">
            <div><div className="rowLabel">Enable Signups</div><div className="rowDesc">Allow new users to register on the platform.</div></div>
            <label className="toggle">
              <input type="checkbox" checked={settings.signupsEnabled} onChange={e => setSettings({ ...settings, signupsEnabled: e.target.checked })} />
              <span className="toggleSlider" />
            </label>
          </div>
          <div className="row">
            <div><div className="rowLabel">Maintenance Mode</div><div className="rowDesc">Temporarily block access for non-owner users.</div></div>
            <label className="toggle">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
              <span className="toggleSlider" />
            </label>
          </div>
        </div>
        <button className={`btn btnPrimary ${styles.mt4}`} onClick={handleSaveSettings}>Save Settings</button>
      </div>
      <div className="panel">
        <h3 className={styles.panelTitle}><ServerIcon /> System Status (Live)</h3>
        <div className="rowList">
          {realServices?.services?.slice(0, 6).map(svc => (
            <div key={svc.key} className="row">
              <span className={`rowLabel ${styles.dotLabel}`}>
                <span className={styles.dot} style={{ background: svc.status === 'healthy' ? 'var(--color-success)' : svc.status === 'degraded' ? 'var(--color-warning)' : 'var(--color-error)' }} />
                {svc.name}
              </span>
              <span style={{ color: svc.status === 'healthy' ? 'var(--color-success)' : svc.status === 'degraded' ? 'var(--color-warning)' : 'var(--color-error)' }}>{svc.status}</span>
            </div>
          )) || (
            <div className="row"><span className="rowLabel">Loading...</span></div>
          )}
        </div>
      </div>
      <div className="panel">
        <h3 className={styles.panelTitle}><DatabaseIcon /> System Resources (Live)</h3>
        <div className="rowList">
          <div className="row"><span className="rowLabel">CPU</span><span className={styles.rowValue}>{realMetrics?.cpu?.usage_percent?.toFixed(1) || '—'}%</span></div>
          <div className="row"><span className="rowLabel">Memory</span><span className={styles.rowValue}>{realMetrics?.memory?.usage_percent?.toFixed(1) || '—'}%</span></div>
          <div className="row"><span className="rowLabel">Disk</span><span className={styles.rowValue}>{realMetrics?.disk?.usage_percent?.toFixed(1) || '—'}%</span></div>
          <div className="row"><span className="rowLabel">Uptime</span><span className={styles.rowValue}>{realMetrics?.uptime_human || '—'}</span></div>
        </div>
      </div>
    </div>
  );

  const TABS: { id: TabType; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} />, description: 'Platform-wide metrics, revenue, and recent activity at a glance.' },
    { id: 'users', label: 'Users', icon: <UsersLucideIcon size={17} />, description: 'Search, inspect, and manage every account on the platform.' },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign size={17} />, description: 'Revenue, MRR, and paying customer trends.' },
    { id: 'agents', label: 'Internal Agents', icon: <BotLucideIcon size={17} />, description: 'RARA agent types, teams, and autonomous infrastructure.' },
    { id: 'monitoring', label: 'Monitoring', icon: <ActivityLucideIcon size={17} />, description: 'Service health, auth/billing metrics, and alert rules.' },
    { id: 'system', label: 'System Control', icon: <ServerLucideIcon size={17} />, description: 'Live CPU, memory, disk, and database status.' },
    { id: 'settings', label: 'Settings', icon: <SettingsLucideIcon size={17} />, description: 'Pricing, platform toggles, and live system status.' },
    { id: 'state-physics', label: 'State Physics', icon: <Orbit size={17} />, description: 'Real-time 3D visualization of platform state.' },
    { id: 'v8', label: 'V8 Engine', icon: <CpuLucideIcon size={17} />, description: 'ML training, models, and prediction control.' },
    { id: 'usage', label: 'Usage Analytics', icon: <BarChart3 size={17} />, description: 'Messages, credits, and per-user usage breakdowns.' },
    { id: 'chat-skills', label: 'Chat Skills', icon: <Sparkles size={17} />, description: 'Enable or disable AGI Neural Hub skills.' },
    { id: 'control', label: 'Platform Control', icon: <SlidersHorizontal size={17} />, description: 'Daemon status and platform-wide kill switches.' },
  ];

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading owner dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>{error}</p>
        <button className="btn btnSecondary" onClick={() => navigate('/dashboard')}>Return to Login</button>
      </div>
    );
  }

  const activeMeta = TABS.find(t => t.id === activeTab) ?? TABS[0];

  return (
    <div className="dashShell">
      {/* ── Sidebar nav (desktop) ── */}
      <aside className="dashSidebar">
        <div className="dashSidebarHead">
          <div className={styles.brand}>
            <div className={styles.brandIcon}><Crown size={18} /></div>
            <div>
              <p className="dashSidebarTitle">Owner</p>
              <p className="dashSidebarMeta">Platform control center</p>
            </div>
          </div>
        </div>
        <nav className="dashNavGroup">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`dashNavItem ${activeTab === t.id ? 'dashNavItemActive' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="dashNavSpacer" />
        <div className="dashNavFooter">
          <button className="dashNavItem" onClick={() => { window.location.href = '/v8/'; }}>
            <Orbit size={17} />
            <span>V8 HashSphere</span>
          </button>
          <button className="dashNavItem dashNavItemDanger" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Top scroll nav (mobile / tablet) ── */}
      <nav className="dashMobileNav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`dashMobileNavItem ${activeTab === t.id ? 'dashMobileNavItemActive' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
        <button className="dashMobileNavItem" onClick={() => { window.location.href = '/v8/'; }}>
          <Orbit size={16} />
          <span>V8 HashSphere</span>
        </button>
        <button className="dashMobileNavItem" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </nav>

      <main className="dashMain">
        <div className="dashPageHead">
          <div>
            <h1 className="dashTitle">{activeMeta.label}</h1>
            <p className="dashSubtitle">{activeMeta.description}</p>
          </div>
          <div className="dashHeadActions">
            <button className="btn btnSecondary btnSm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw size={14} className={isRefreshing ? styles.spinning : ''} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'revenue' && renderRevenue()}
        {activeTab === 'agents' && renderAgents()}
        {activeTab === 'monitoring' && renderMonitoring()}
        {activeTab === 'system' && renderSystemControl()}
        {activeTab === 'settings' && renderSettings()}
        {activeTab === 'state-physics' && <PlatformStatePhysics />}
        {activeTab === 'v8' && <V8ControlPanel />}
        {activeTab === 'usage' && renderUsageAnalytics()}
        {activeTab === 'chat-skills' && renderChatSkills()}
        {activeTab === 'control' && <DaemonControlPanel />}
      </main>
    </div>
  );
};

export default OwnerDashboard;
