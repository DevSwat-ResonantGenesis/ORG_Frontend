import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Bell, Settings, BarChart3, Zap, CreditCard, History, Key, 
  Rocket, Share2, Gift, LogOut, Copy, Check, ExternalLink, Trash2, Link2
} from 'lucide-react';
import fastapiClient from '../../api/fastapiClient';
import { fetchUsageMetrics, type UsageMetrics } from '../../api/usage';
import { listConversations } from '../../api/rag';
import { getCreditPacks, type CreditPack } from '../../api/billing';
import { logout as apiLogout } from '../../api/auth';
import { Button } from '../../components/ui';
import { ApiKeyManager } from '../../components/features/ApiKeyManager';
import { getSession, clearSession } from '../../utils/auth';
import { logger } from '../../utils/logger';
import styles from './ProfilePage.module.css';

type TabId = 
  | 'profile' 
  | 'notifications' 
  | 'settings' 
  | 'usage' 
  | 'auto-refill' 
  | 'manage-plan' 
  | 'credit-history' 
  | 'api-keys' 
  | 'platform-keys'
  | 'deploys' 
  | 'shares' 
  | 'referrals';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  created_at: string;
}

interface CreditHistoryItem {
  id: string;
  type: 'purchase' | 'refill' | 'award' | 'usage';
  amount: number;
  description: string;
  created_at: string;
}

interface Deploy {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'building' | 'failed';
  created_at: string;
}

interface ConversationShare {
  id: string;
  title: string;
  share_url: string;
  views: number;
  created_at: string;
}

const ProfilePage = () => {
  const session = getSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const isTabId = (value: string): value is TabId => {
    return [
      'profile',
      'notifications',
      'settings',
      'usage',
      'auto-refill',
      'manage-plan',
      'credit-history',
      'api-keys',
      'platform-keys',
      'deploys',
      'shares',
      'referrals',
    ].includes(value as TabId);
  };

  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam && isTabId(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  const [loading, setLoading] = useState(true);
  
  // User data
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(session.email || '');
  const [planName, setPlanName] = useState('Developer');
  
  // Usage metrics
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  
  // Settings
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [telemetryDisabled, setTelemetryDisabled] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Credit history
  const [creditHistory, setCreditHistory] = useState<CreditHistoryItem[]>([]);
  
  // Auto refill
  const [autoRefillEnabled, setAutoRefillEnabled] = useState(false);
  
  // Deploys
  const [deploys, setDeploys] = useState<Deploy[]>([]);
  
  // Shares
  const [shares, setShares] = useState<ConversationShare[]>([]);
  
  // Referral
  const [referralCode, setReferralCode] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);
  
  // Activity data (for heatmap)
  const [activityData, setActivityData] = useState<{date: string; count: number}[]>([]);
  const [totalLinesWritten, setTotalLinesWritten] = useState(0);
  const [totalConversations, setTotalConversations] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(0);
  const [daysWithContributions, setDaysWithContributions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [recordStreak, setRecordStreak] = useState(0);
  
  // Payment methods
  interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
    is_default: boolean;
  }
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Credit packs (from backend/Stripe)
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  
  // Messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load user data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load user info
        const userRes = await fastapiClient.get('/auth/me');
        if (userRes.data) {
          setUserId(userRes.data.id);
          setFullName(userRes.data.full_name || '');
          setEmail(userRes.data.email || session.email || '');
        }
        
        // Load usage metrics
        const metrics = await fetchUsageMetrics();
        setUsageMetrics(metrics);
        setPlanName(metrics.billing?.planName || 'Developer');
        
        // Load activity stats
        try {
          const activityRes = await fastapiClient.get('/usage/activity');
          if (activityRes.data) {
            setActivityData(activityRes.data.heatmap || []);
            setTotalLinesWritten(activityRes.data.total_lines || 0);
            setTotalMessages(activityRes.data.total_messages || 0);
            setTotalCreditsUsed(activityRes.data.total_credits_used || 0);
            setDaysWithContributions(activityRes.data.days_with_contributions || 0);
            setStreak(activityRes.data.streak || 0);
            setRecordStreak(activityRes.data.record_streak || 0);
          }
        } catch {
          // Activity endpoint may not exist
        }
        
        // Load real conversation count from RAG API
        try {
          const conversations = await listConversations();
          setTotalConversations(conversations.length);
        } catch {
          // Fallback to 0 if API fails
          setTotalConversations(0);
        }
        
        // Load referral code
        try {
          const refRes = await fastapiClient.get('/referrals/code');
          setReferralCode(refRes.data?.code || '');
        } catch {
          setReferralCode(`REF-${userId?.slice(0, 8) || 'USER'}`);
        }
        
        // Load payment methods
        try {
          const pmRes = await fastapiClient.get('/billing/payment-methods');
          setPaymentMethods(pmRes.data?.methods || []);
        } catch {
          // No payment methods
        }
        
        // Load credit packs from backend (Stripe prices) - MANDATORY
        try {
          const packs = await getCreditPacks();
          setCreditPacks(packs);
        } catch (err: any) {
          logger.error('Failed to load credit packs from backend', err);
          setError(err?.message || 'Failed to load credit packs. Backend endpoint required.');
        }
        
      } catch (err) {
        logger.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [session.email]);

  // Load tab-specific data
  useEffect(() => {
    const loadTabData = async () => {
      if (activeTab === 'notifications') {
        try {
          const res = await fastapiClient.get('/notifications');
          setNotifications(res.data?.notifications || []);
        } catch {
          setNotifications([]);
        }
      } else if (activeTab === 'credit-history') {
        try {
          const res = await fastapiClient.get('/billing/credits/history');
          setCreditHistory(res.data?.history || []);
        } catch {
          setCreditHistory([]);
        }
      } else if (activeTab === 'deploys') {
        try {
          const res = await fastapiClient.get('/deploys');
          setDeploys(res.data?.deploys || []);
        } catch {
          setDeploys([]);
        }
      } else if (activeTab === 'shares') {
        try {
          const res = await fastapiClient.get('/conversations/shares');
          setShares(res.data?.shares || []);
        } catch {
          setShares([]);
        }
      }
    };
    
    loadTabData();
  }, [activeTab]);

  const handleSaveName = async () => {
    setError('');
    setMessage('');
    setSavingSettings(true);
    try {
      await fastapiClient.put(`/users/${userId}`, { full_name: fullName });
      setMessage('Name saved successfully');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      clearSession();
      window.location.href = '/login';
    }
  };

  const handleCopyReferral = () => {
    const link = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handlePurchaseCredits = async (packId: string) => {
    try {
      const response = await fastapiClient.post('/billing/checkout/credits', {
        pack_id: packId,
        success_url: `${window.location.origin}/profile?success=credits`,
        cancel_url: `${window.location.origin}/profile`,
      });
      if (response.data?.checkout_url || response.data?.url) {
        window.location.href = response.data.checkout_url || response.data.url;
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to initiate purchase');
    }
  };

  const handleUpdatePayment = async () => {
    try {
      const response = await fastapiClient.post('/billing/payment-methods/setup', {
        success_url: `${window.location.origin}/profile?tab=manage-plan&success=payment`,
        cancel_url: `${window.location.origin}/profile?tab=manage-plan`,
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update payment');
    }
  };

  const handleCancelPlan = async () => {
    if (!confirm('Are you sure you want to cancel your plan? You will still have access until the end of your billing period.')) {
      return;
    }
    try {
      await fastapiClient.post('/billing/subscription/cancel');
      setMessage('Plan cancelled. You will have access until the end of your billing period.');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to cancel plan');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      await fastapiClient.delete('/users/me');
      clearSession();
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete account');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Generate heatmap for the year
  const generateHeatmap = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Mon', 'Wed', 'Fri'];
    
    return (
      <div className={styles.heatmapContainer}>
        <div className={styles.heatmapDays}>
          {days.map(day => <div key={day} className={styles.heatmapDayLabel}>{day}</div>)}
        </div>
        <div className={styles.heatmapGrid}>
          <div className={styles.heatmapMonths}>
            {months.map(month => <div key={month} className={styles.heatmapMonthLabel}>{month}</div>)}
          </div>
          <div className={styles.heatmapCells}>
            {Array.from({ length: 52 * 3 }).map((_, i) => {
              const activity = activityData[i];
              const level = activity ? Math.min(Math.floor(activity.count / 10), 4) : 0;
              return (
                <div 
                  key={i} 
                  className={`${styles.heatmapCell} ${styles[`level${level}`]}`}
                  title={activity ? `${activity.count} contributions on ${activity.date}` : 'No contributions'}
                />
              );
            })}
          </div>
        </div>
        <div className={styles.heatmapLegend}>
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} className={`${styles.heatmapCell} ${styles[`level${level}`]}`} />
          ))}
          <span>More</span>
        </div>
      </div>
    );
  };

  const sidebarItems = [
    { section: 'ACCOUNT', items: [
      { id: 'profile' as TabId, label: 'Profile', icon: User },
      { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
      { id: 'settings' as TabId, label: 'Settings', icon: Settings },
    ]},
    { section: 'SUBSCRIPTION', items: [
      { id: 'usage' as TabId, label: 'Usage', icon: BarChart3 },
      { id: 'auto-refill' as TabId, label: 'Automatic Credit Refills', icon: Zap },
      { id: 'manage-plan' as TabId, label: 'Manage Plan', icon: CreditCard },
      { id: 'credit-history' as TabId, label: 'Credit History', icon: History },
      { id: 'api-keys' as TabId, label: 'Model Provider API Keys', icon: Key },
      { id: 'platform-keys' as TabId, label: 'Platform API Keys', icon: Key },
    ]},
    { section: 'FEATURES', items: [
      { id: 'deploys' as TabId, label: 'Deploys', icon: Rocket },
      { id: 'shares' as TabId, label: 'Conversation Shares', icon: Share2 },
      { id: 'referrals' as TabId, label: 'Referrals', icon: Gift },
    ]},
  ];

  if (loading) {
    return (
      <div className={styles.profilePage}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.sidebar}>
        {sidebarItems.map(section => (
          <div key={section.section} className={styles.sidebarSection}>
            <div className={styles.sidebarSectionTitle}>{section.section}</div>
            {section.items.map(item => (
              <button
                key={item.id}
                className={`${styles.sidebarItem} ${activeTab === item.id ? styles.active : ''}`}
                onClick={() => item.id === 'api-keys' ? navigate('/connect-profiles') : setActiveTab(item.id)}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
        
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarSectionTitle}>INTEGRATIONS</div>
          <button className={styles.sidebarItem} onClick={() => navigate('/connect-profiles')}>
            <img
              src={document.documentElement.getAttribute('data-theme') === 'light' ? '/images/connect-icons/Integration black icon.png' : '/images/connect-icons/integration white icon.png'}
              alt="Integrations"
              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
            />
            <span>Integrations</span>
          </button>
        </div>
        <div className={styles.sidebarSection}>
          <button className={`${styles.sidebarItem} ${styles.logout}`} onClick={handleLogout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {message && <div className={styles.successMessage}>{message}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className={styles.tabContent}>
            {/* User Header */}
            <div className={styles.userHeader}>
              <div className={styles.avatar}>
                {getInitials(fullName || email)}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {fullName || 'User'}
                  <span className={styles.planBadge}>{planName}</span>
                </div>
                <div className={styles.userEmail}>{email}</div>
              </div>
              <div className={styles.streakInfo}>
                {streak} day streak <span className={styles.streakRecord}>(record {recordStreak})</span>
              </div>
            </div>

            {/* Account Activity */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Account Activity</h2>
                <span className={styles.updateNote}>Analytics update every three hours</span>
              </div>
              
              <div className={styles.activityCard}>
                <div className={styles.activityTitle}>
                  {(usageMetrics?.tokens?.used || 0).toLocaleString()} tokens processed by ResonantGenesis
                </div>
                <div className={styles.activitySubtitle}>
                  {daysWithContributions} days with contributions in the last year
                </div>
                {generateHeatmap()}
              </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Memory anchors created</div>
                <div className={styles.statValue}>{usageMetrics?.memory?.anchorsUsed || 0}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total AI conversations</div>
                <div className={styles.statValue}>{usageMetrics?.conversations?.count || totalConversations}</div>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={styles.statHeaderRow}>
                    <span>Total tokens processed</span>
                    <div className={styles.tabToggle}>
                      <button className={styles.tabActive}>RESONANT</button>
                      <button>AGENTS</button>
                    </div>
                  </div>
                </div>
                <div className={styles.statValueLarge}>{(usageMetrics?.tokens?.used || 0).toLocaleString()}</div>
                <div className={styles.miniChart}>
                  {/* Placeholder for chart */}
                  <div className={styles.chartLine} />
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total messages sent</div>
                <div className={styles.statValue}>{totalMessages}</div>
                <div className={styles.miniBarChart}>
                  <div className={styles.bar} style={{ height: '100%' }} />
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Total credits used</div>
                <div className={styles.statValue}>{totalCreditsUsed}</div>
                <div className={styles.miniChart}>
                  <div className={styles.chartLine} />
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCardSmall}>
                <div className={styles.statLabel}>AI model usage</div>
                <div className={styles.modelUsage}>
                  <span>{String(usageMetrics?.providers?.used?.[0] || 'OpenAI GPT-4')}</span>
                  <div className={styles.usageBar}>
                    <div className={styles.usageFill} style={{ width: '100%' }} />
                  </div>
                  <span>100%</span>
                </div>
              </div>
              <div className={styles.statCardSmall}>
                <div className={styles.statLabel}>Active agents</div>
                <div className={styles.statValueMedium}>{usageMetrics?.agents?.active || 0}</div>
              </div>
              <div className={styles.statCardSmall}>
                <div className={styles.statLabel}>Teams created</div>
                <div className={styles.statValueMedium}>{usageMetrics?.teams?.created || 0}</div>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCardSmall}>
                <div className={styles.statLabel}>Memory storage (MB)</div>
                <div className={styles.statValueMedium}>{usageMetrics?.memory?.storageUsedMB || 0}</div>
              </div>
              <div className={styles.statCardSmall}>
                <div className={styles.statLabel}>RAG documents</div>
                <div className={styles.statValueMedium}>{usageMetrics?.ragDocuments?.used || 0}</div>
              </div>
              <div className={styles.statCardSmall}>
                <div className={styles.statLabel}>Compute hours</div>
                <div className={styles.statValueMedium}>{usageMetrics?.computeHours?.used || 0}</div>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCardSmall}>
                <div className={styles.statLabel}>Credit balance</div>
                <div className={styles.statValueMedium}>{usageMetrics?.credits?.balance || 0}</div>
              </div>
              <div className={styles.statCardSmall}>
                <div className={styles.statLabel}>API calls today</div>
                <div className={styles.statValueMedium}>{usageMetrics?.tokens?.used || 0}</div>
              </div>
              <div className={styles.statCardSmall}>
                <div className={styles.statLabel}>Active users</div>
                <div className={styles.statValueMedium}>{usageMetrics?.users?.active || 1}</div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Notifications</h1>
            <p className={styles.pageDesc}>Your current alerts, important updates, and account notifications.</p>
            
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={48} className={styles.emptyIcon} />
                <p>You currently have no notifications.</p>
              </div>
            ) : (
              <div className={styles.notificationList}>
                {notifications.map(notif => (
                  <div key={notif.id} className={`${styles.notificationItem} ${styles[notif.type]}`}>
                    <div className={styles.notificationTitle}>{notif.title}</div>
                    <div className={styles.notificationMessage}>{notif.message}</div>
                    <div className={styles.notificationDate}>{formatDate(notif.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Settings</h1>
            
            <div className={styles.settingsSection}>
              <h3>Profile information</h3>
              <div className={styles.settingsCard}>
                <div className={styles.avatarSmall}>
                  {getInitials(fullName || email)}
                </div>
                <div className={styles.settingsField}>
                  <label>Name</label>
                  <div className={styles.inputRow}>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className={styles.input}
                    />
                    <Button onClick={handleSaveName} disabled={savingSettings} size="sm">
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.settingsSection}>
              <h3>Notifications</h3>
              <div className={styles.settingsCard}>
                <div className={styles.settingRow}>
                  <div>
                    <div className={styles.settingLabel}>Newsletter</div>
                    <div className={styles.settingDesc}>Receive our newsletter with product updates and coding tips.</div>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox" 
                      checked={newsletterEnabled}
                      onChange={(e) => setNewsletterEnabled(e.target.checked)}
                    />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.settingsSection}>
              <h3>Privacy</h3>
              <div className={styles.settingsCard}>
                <div className={styles.settingRow}>
                  <div>
                    <div className={styles.settingLabel}>Disable Telemetry</div>
                    <div className={styles.settingDesc}>Opt out of non-essential data collection that helps us improve the product.</div>
                  </div>
                  <label className={styles.toggle}>
                    <input 
                      type="checkbox" 
                      checked={telemetryDisabled}
                      onChange={(e) => setTelemetryDisabled(e.target.checked)}
                    />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.settingsSection}>
              <h3>Delete account</h3>
              <div className={styles.settingsCard}>
                <p className={styles.dangerText}>Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="danger" onClick={handleDeleteAccount}>
                  <Trash2 size={16} />
                  Delete account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* USAGE TAB */}
        {activeTab === 'usage' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Usage</h1>
            
            <div className={styles.usageCard}>
              <h2>ResonantGenesis Usage Summary</h2>
              {usageMetrics?.billing?.currentPeriodEnd && (
                <p className={styles.usageInfo}>
                  Next plan refresh is in <strong>{Math.max(0, Math.ceil((new Date(usageMetrics.billing.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days</strong> on {new Date(usageMetrics.billing.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
                </p>
              )}
              {usageMetrics?.billing?.nextBillingDate && (
                <p className={styles.usageInfo}>
                  Next billing cycle is in <strong>{Math.max(0, Math.ceil((new Date(usageMetrics.billing.nextBillingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days</strong> on {new Date(usageMetrics.billing.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
                </p>
              )}

              <div className={styles.creditSection}>
                <h3>Credit Balance</h3>
                <div className={styles.creditBar}>
                  <div className={styles.creditProgress} style={{ width: `${Math.min(((usageMetrics?.credits?.used || 0) / (usageMetrics?.credits?.limit || 1)) * 100, 100)}%` }} />
                </div>
                <div className={styles.creditStats}>
                  <span>{usageMetrics?.credits?.used || 0} / {usageMetrics?.credits?.limit || 0} credits used</span>
                  <span>{usageMetrics?.credits?.balance || 0} available</span>
                </div>
              </div>

              <Button variant="primary" onClick={() => setActiveTab('manage-plan')}>
                Purchase credits
              </Button>

              <div className={styles.referralCta}>
                <Gift size={16} />
                <span>Refer a friend to get 250 free add-on prompt credits</span>
                <ExternalLink size={14} />
              </div>
            </div>
          </div>
        )}

        {/* AUTO REFILL TAB */}
        {activeTab === 'auto-refill' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Auto Refill Management</h1>
            
            <div className={styles.settingsCard}>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Auto refill credits</div>
                  <div className={styles.settingDesc}>
                    Auto refill automatically adds credits when your balance is below 15 prompt credits and 15 add-on credits.
                  </div>
                </div>
                <label className={styles.toggle}>
                  <input 
                    type="checkbox" 
                    checked={autoRefillEnabled}
                    onChange={(e) => setAutoRefillEnabled(e.target.checked)}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* MANAGE PLAN TAB */}
        {activeTab === 'manage-plan' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Plan Management</h1>
            
            <div className={styles.planCard}>
              <h3>Manage your plan</h3>
              <p>Your account is currently on a <strong>{planName}</strong> plan that costs $15/month.</p>
              <div className={styles.planActions}>
                <Button variant="secondary" onClick={() => navigate('/pricing')}>Switch Plan</Button>
              </div>
            </div>

            <div className={styles.planCard}>
              <h3>Cancel your plan</h3>
              <p>If you choose to cancel your plan, you'll still have access until the end of your billing period.</p>
              <Button variant="danger" onClick={handleCancelPlan}>Cancel plan</Button>
            </div>

            <div className={styles.planCard}>
              <h3>Billing</h3>
              <p>Your monthly subscription renews on Jan 26, 2026. We'll notify you when your next subscription renews.</p>
            </div>

            <div className={styles.planCard}>
              <h3>Payment details</h3>
              <p>Update the payment method and billing address.</p>
              {paymentMethods.length > 0 && (
                <div className={styles.paymentMethodList}>
                  {paymentMethods.map(pm => (
                    <div key={pm.id} className={styles.paymentMethod}>
                      <span className={styles.cardBrand}>{pm.brand}</span>
                      <span>•••• {pm.last4}</span>
                      <span>Expires {pm.exp_month}/{pm.exp_year}</span>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="secondary" onClick={handleUpdatePayment}>Update payment</Button>
            </div>

            <div className={styles.planCard}>
              <h3>Invoices</h3>
              <p>View all past invoices.</p>
              <Button variant="secondary">View Invoices</Button>
            </div>

            {/* Credit Packs */}
            <div className={styles.planCard}>
              <h3>Purchase Credit Packs</h3>
              <div className={styles.creditPacks}>
                {creditPacks.map(pack => (
                  <div key={pack.id} className={`${styles.packCard} ${pack.popular ? styles.popular : ''}`}>
                    {pack.popular && <div className={styles.popularBadge}>Popular</div>}
                    <div className={styles.packName}>{pack.name}</div>
                    <div className={styles.packTokens}>{(pack.tokens || 0).toLocaleString()} credits</div>
                    <div className={styles.packPrice}>${pack.price}</div>
                    {pack.perK && (
                      <div className={styles.packPerK}>${pack.perK}/1K</div>
                    )}
                    <Button 
                      variant={pack.popular ? 'primary' : 'secondary'} 
                      size="sm"
                      onClick={() => handlePurchaseCredits(pack.id)}
                    >
                      Buy
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CREDIT HISTORY TAB */}
        {activeTab === 'credit-history' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Credit History</h1>
            <p className={styles.pageDesc}>Your history of add-on credit purchases, auto refills, and awards.</p>
            
            <div className={styles.referralCta}>
              <Gift size={16} />
              <span>Refer a friend to earn credit awards.</span>
            </div>

            {creditHistory.length === 0 ? (
              <div className={styles.emptyState}>
                <History size={48} className={styles.emptyIcon} />
                <p>No credit history yet.</p>
              </div>
            ) : (
              <div className={styles.historyList}>
                {creditHistory.map(item => (
                  <div key={item.id} className={styles.historyItem}>
                    <div className={styles.historyType}>{item.type}</div>
                    <div className={styles.historyDesc}>{item.description}</div>
                    <div className={styles.historyAmount}>
                      {item.amount > 0 ? '+' : ''}{item.amount} credits
                    </div>
                    <div className={styles.historyDate}>{formatDate(item.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API KEYS TAB */}
        {activeTab === 'api-keys' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Model Provider API Keys</h1>
            <p className={styles.pageDesc}>Manage your API keys for third-party model providers.</p>
            
            <div className={styles.apiKeysCard}>
              <ApiKeyManager showTitle={false} />
            </div>
          </div>
        )}

        {/* PLATFORM API KEYS TAB */}
        {activeTab === 'platform-keys' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Platform API Keys</h1>
            <p className={styles.pageDesc}>Manage your ResonantGenesis platform API keys for programmatic access.</p>
            
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Your API Keys</h2>
                <Button 
                  onClick={() => navigate('/api-keys')}
                  className={styles.manageButton}
                >
                  <Key size={16} />
                  Manage API Keys
                </Button>
              </div>
              <p className={styles.sectionDesc}>
                Platform API keys allow you to access ResonantGenesis APIs programmatically. 
                Use them to integrate with your applications, automate workflows, or build custom integrations.
              </p>
              <div className={styles.apiKeyActions}>
                <Button onClick={() => navigate('/api-keys')}>
                  View & Create API Keys
                </Button>
                <Button variant="secondary" onClick={() => navigate('/pricing')}>
                  Browse API Marketplace
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* DEPLOYS TAB */}
        {activeTab === 'deploys' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>
              App Deploys
              <span className={styles.betaBadge}>BETA</span>
            </h1>
            <a href="#" className={styles.docsLink}>View Docs</a>
            
            {deploys.length === 0 ? (
              <div className={styles.emptyState}>
                <Rocket size={48} className={styles.emptyIcon} />
                <p>You have no existing deployed apps</p>
                <p className={styles.emptySubtext}>Learn about how to deploy your first app</p>
              </div>
            ) : (
              <div className={styles.deployList}>
                {deploys.map(deploy => (
                  <div key={deploy.id} className={styles.deployItem}>
                    <div className={styles.deployName}>{deploy.name}</div>
                    <div className={styles.deployUrl}>{deploy.url}</div>
                    <div className={`${styles.deployStatus} ${styles[deploy.status]}`}>{deploy.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SHARES TAB */}
        {activeTab === 'shares' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>
              Conversation Shares
              <span className={styles.betaBadge}>BETA</span>
            </h1>
            
            {shares.length === 0 ? (
              <div className={styles.emptyState}>
                <Share2 size={48} className={styles.emptyIcon} />
                <p>No shared conversations yet.</p>
              </div>
            ) : (
              <div className={styles.shareList}>
                {shares.map(share => (
                  <div key={share.id} className={styles.shareItem}>
                    <div className={styles.shareTitle}>{share.title}</div>
                    <div className={styles.shareUrl}>{share.share_url}</div>
                    <div className={styles.shareViews}>{share.views} views</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REFERRALS TAB */}
        {activeTab === 'referrals' && (
          <div className={styles.tabContent}>
            <h1 className={styles.pageTitle}>Referral Program</h1>
            <p className={styles.pageDesc}>
              Invite friends to ResonantGenesis and get 250 bonus credits when they subscribe to Pro.
            </p>
            
            <div className={styles.referralCard}>
              <h3>Referral link</h3>
              <div className={styles.referralLinkBox}>
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/signup?ref=${referralCode}`}
                  className={styles.referralInput}
                />
                <Button onClick={handleCopyReferral}>
                  {copiedReferral ? <Check size={16} /> : <Copy size={16} />}
                  {copiedReferral ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className={styles.termsLink}>Terms of service</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
