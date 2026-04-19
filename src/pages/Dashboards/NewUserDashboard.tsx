/**
 * Unified User Dashboard
 * Consolidates: dashboard metrics + profile + settings + billing + API keys + integrations
 */
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  RefreshCw, Bot, Brain, Store, GitBranch, Activity, Zap,
  User, Bell, Settings, BarChart3, CreditCard, History, Key,
  Rocket, Share2, Gift, LogOut, Copy, Check, ExternalLink, Trash2, Link2, ArrowRight
} from 'lucide-react';
import { isAuthenticated } from '../../utils/auth-cookies';
import { fetchDashboardData, type DashboardData } from '../../api/dashboard';
import fastapiClient from '../../api/fastapiClient';
import { fetchUsageMetrics, type UsageMetrics } from '../../api/usage';
import { listConversations } from '../../api/rag';
import { getCreditPacks, type CreditPack } from '../../api/billing';
import { logout as apiLogout } from '../../api/auth';
import { getSession, clearSession } from '../../utils/auth';
import { ApiKeyManager } from '../../components/features/ApiKeyManager';
type UserLocStats = null;
type LiveLocStats = null;
import { logger } from '../../utils/logger';
import { Button } from '../../components/ui';
import {
  CreditWidget,
  UsageBreakdownChart,
  UsageTrendChart,
  AlertBanner,
  ActivityGrid,
  ActivityFeed,
  QuickActions,
} from '../../components/dashboard';
// TrialBanner removed — no trial system
const ConnectProfilesPage = lazy(() => import('../ConnectProfiles/ConnectProfilesPage'));
import styles from './NewUserDashboard.module.css';

type DashTab = 'overview' | 'profile' | 'settings' | 'billing' | 'api-keys' | 'integrations';

const NewUserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();

  // Dashboard tab
  const [activeTab, setActiveTab] = useState<DashTab>('overview');

  // Dashboard data
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [locStats, setLocStats] = useState<UserLocStats | null>(null);
  const [liveLoc, setLiveLoc] = useState<LiveLocStats | null>(null);

  // Profile data
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(session.email || '');
  const [planName, setPlanName] = useState('Free');
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [telemetryDisabled, setTelemetryDisabled] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [autoRefillEnabled, setAutoRefillEnabled] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [totalConversations, setTotalConversations] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalCreditsUsed, setTotalCreditsUsed] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Parse tab from URL query
  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam && ['overview', 'profile', 'settings', 'billing', 'api-keys', 'integrations'].includes(tabParam)) {
      setActiveTab(tabParam as DashTab);
    }
  }, [location.search]);

  const loadDashboardData = useCallback(async () => {
    try {
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
    } catch (err) {
      logger.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load profile + dashboard data
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadDashboardData();

    // Load profile data
    (async () => {
      try {
        const userRes = await fastapiClient.get('/auth/me');
        if (userRes.data) {
          setUserId(userRes.data.id);
          setFullName(userRes.data.full_name || '');
          setEmail(userRes.data.email || session.email || '');
        }
        const metrics = await fetchUsageMetrics();
        setUsageMetrics(metrics);
        try {
          const subRes = await fastapiClient.get('/billing/subscription');
          const plan = subRes.data?.plan?.toLowerCase();
          if (plan === 'unlimited' || subRes.data?.unlimited_credits) setPlanName('Unlimited');
          else if (plan === 'enterprise') setPlanName('Enterprise');
          else if (plan === 'plus' || plan === 'professional') setPlanName('Plus');
          else if (plan === 'developer') setPlanName('Developer');
          else setPlanName('Free');
        } catch { setPlanName(metrics.billing?.planName || 'Free'); }
        try {
          const dashRes = await fastapiClient.get('/billing/dashboard/me');
          if (dashRes.data) {
            setTotalMessages(dashRes.data.messages || 0);
            setTotalCreditsUsed(dashRes.data.credits?.lifetime_used || dashRes.data.usage_this_period || 0);
          }
        } catch {
          setTotalMessages(metrics.conversations?.count || 0);
          setTotalCreditsUsed(metrics.credits?.used || 0);
        }
        try { const convos = await listConversations(); setTotalConversations(convos.length); } catch { setTotalConversations(0); }
        try { const refRes = await fastapiClient.get('/referrals/code'); setReferralCode(refRes.data?.code || ''); } catch { setReferralCode('REF-USER'); }
        try { const pmRes = await fastapiClient.get('/billing/payment-methods'); setPaymentMethods(pmRes.data?.methods || []); } catch {}
        try { const packs = await getCreditPacks(); setCreditPacks(packs); } catch (err: any) { logger.error('Failed to load credit packs', err); }
      } catch (err) { logger.error('Failed to load profile data', err); }
    })();
  }, [navigate, loadDashboardData]);

  // Load tab-specific data
  useEffect(() => {
    if (activeTab === 'billing') {
      fastapiClient.get('/billing/credits/history').then(r => setCreditHistory(r.data?.history || [])).catch(() => setCreditHistory([]));
      fastapiClient.get('/notifications').then(r => setNotifications(r.data?.notifications || [])).catch(() => setNotifications([]));
    }
  }, [activeTab]);

  const handleRefresh = () => { setRefreshing(true); loadDashboardData(); };
  const handleUpgrade = () => navigate('/pricing');
  const [subscribeLoading, setSubscribeLoading] = useState<string | null>(null);
  const handleSubscribe = async (plan: string) => {
    setSubscribeLoading(plan);
    try {
      // Refresh auth token first
      await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' }).catch(() => {});
      const response = await fetch('/api/billing/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          plan_id: plan,
          billing_cycle: 'monthly',
          success_url: `${window.location.origin}/dashboard?success=true&plan=${plan}`,
          cancel_url: `${window.location.origin}/dashboard?canceled=true`,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url || data.url) {
          window.location.href = data.checkout_url || data.url;
        } else {
          setError('Checkout session created but no redirect URL received.');
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || 'Checkout failed. Please try again.');
      }
    } catch (err: any) {
      setError('Checkout failed. Please try again.');
    } finally {
      setSubscribeLoading(null);
    }
  };
  const handleSaveName = async () => {
    setError(''); setMessage(''); setSavingSettings(true);
    try { await fastapiClient.put(`/users/${userId}`, { full_name: fullName }); setMessage('Name saved'); } catch (err: any) { setError(err?.response?.data?.detail || 'Failed to save'); } finally { setSavingSettings(false); }
  };
  const handleLogout = async () => { try { await apiLogout(); } catch {} finally { clearSession(); window.location.href = '/login'; } };
  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${referralCode}`);
    setCopiedReferral(true); setTimeout(() => setCopiedReferral(false), 2000);
  };
  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoResult(null);
    try {
      const response = await fastapiClient.post('/billing/promo/redeem', { code: promoCode.trim() });
      setPromoResult({ type: 'success', message: `${response.data.credits_granted.toLocaleString()} credits added! New balance: ${response.data.new_balance.toLocaleString()}` });
      setPromoCode('');
      loadDashboardData();
    } catch (err: any) {
      setPromoResult({ type: 'error', message: err?.response?.data?.detail || 'Invalid promo code' });
    } finally {
      setPromoLoading(false);
    }
  };
  const handlePurchaseCredits = async (packId: string) => {
    try {
      const response = await fastapiClient.post('/billing/checkout/credits', { pack_id: packId, success_url: `${window.location.origin}/dashboard?tab=billing&success=credits`, cancel_url: `${window.location.origin}/dashboard?tab=billing` });
      if (response.data?.checkout_url || response.data?.url) window.location.href = response.data.checkout_url || response.data.url;
    } catch (err: any) { setError(err?.response?.data?.detail || 'Failed to initiate purchase'); }
  };
  const handleUpdatePayment = async () => {
    try {
      const response = await fastapiClient.post('/billing/payment-methods/setup', { success_url: `${window.location.origin}/dashboard?tab=billing&success=payment`, cancel_url: `${window.location.origin}/dashboard?tab=billing` });
      if (response.data?.url) window.location.href = response.data.url;
    } catch (err: any) { setError(err?.response?.data?.detail || 'Failed to update payment'); }
  };
  const handleCancelPlan = async () => {
    if (!confirm('Are you sure you want to cancel your plan?')) return;
    try { await fastapiClient.post('/billing/subscription/cancel'); setMessage('Plan cancelled.'); } catch (err: any) { setError(err?.response?.data?.detail || 'Failed to cancel plan'); }
  };
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try { await fastapiClient.delete('/users/me'); clearSession(); navigate('/'); } catch (err: any) { setError(err?.response?.data?.detail || 'Failed to delete account'); }
  };
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorState}>
          <p>Failed to load dashboard</p>
          <Button onClick={handleRefresh}>Retry</Button>
        </div>
      </div>
    );
  }

  const p = data.platform;

  const TABS: { id: DashTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={15} /> },
    { id: 'billing', label: 'Billing & Credits', icon: <CreditCard size={15} /> },
    { id: 'api-keys', label: 'API Keys', icon: <Key size={15} /> },
    { id: 'integrations', label: 'Integrations', icon: <Link2 size={15} /> },
  ];

  return (
    <div className={styles.dashboard}>
      {/* ── Dashboard Tabs ── */}
      <div className={styles.dashTabs}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.dashTab} ${activeTab === t.id ? styles.dashTabActive : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
        <div className={styles.dashTabSpacer} />
        <button className={styles.dashTabLogout} onClick={handleLogout}>
          <LogOut size={15} />
          <span>Log out</span>
        </button>
      </div>

      {message && <div className={styles.successMsg}>{message}</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {/* ══════════════ OVERVIEW TAB ══════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* Subscribe banner for free users */}
          {data.tier?.toLowerCase() === 'free' && (
            <div className={styles.subscribeBanner}>
              <div className={styles.subscribeBannerBg} />
              <div className={styles.subscribeBannerContent}>
                <Zap size={18} className={styles.subscribeBannerIcon} />
                <span className={styles.subscribeBannerText}>Please subscribe to unlock all features</span>
                <button className={styles.subscribeBannerBtn} onClick={() => handleSubscribe('developer')}>
                  {subscribeLoading === 'developer' ? 'Redirecting…' : 'Subscribe Now'}
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
          {/* Regular alerts for paid users */}
          {data.tier?.toLowerCase() !== 'free' && data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0 && (
            <AlertBanner alerts={data.alerts.map(a => ({ ...a, action: a.type === 'error' ? { label: 'Buy Credits', onClick: handleUpgrade } : undefined }))} />
          )}

          <div className={styles.overviewGrid}>
            <div className={styles.overviewCard} onClick={() => navigate('/agents')}>
              <div className={styles.overviewCardHeader}><Bot size={18} color="#8b5cf6" /><span className={styles.overviewCardLabel}>My Agents</span></div>
              <div className={styles.overviewCardValue}><span className={styles.overviewNumber}>{data.activity.agents ?? 0}</span><span className={styles.overviewUnit}>created</span></div>
            </div>
            <div className={styles.overviewCard} onClick={() => navigate('/resonant-memory')}>
              <div className={styles.overviewCardHeader}><Brain size={18} color="#ec4899" /><span className={styles.overviewCardLabel}>My Memory</span></div>
              <div className={styles.overviewCardValue}><span className={styles.overviewNumber}>{data.activity.memories ?? 0}</span><span className={styles.overviewUnit}>anchors</span></div>
            </div>
            <div className={styles.overviewCard} onClick={() => navigate('/agents')}>
              <div className={styles.overviewCardHeader}><Activity size={18} color="#6366f1" /><span className={styles.overviewCardLabel}>Sessions</span></div>
              <div className={styles.overviewCardValue}><span className={styles.overviewNumber}>{data.activity.sessions ?? 0}</span><span className={styles.overviewUnit}>total</span></div>
            </div>
            <div className={styles.overviewCard} onClick={() => navigate('/network/workflows')}>
              <div className={styles.overviewCardHeader}><GitBranch size={18} color="#6366f1" /><span className={styles.overviewCardLabel}>Workflows</span></div>
              <div className={styles.overviewCardValue}><span className={styles.overviewNumber}>{p.workflows?.count ?? 0}</span><span className={styles.overviewUnit}>saved</span></div>
            </div>
            <div className={styles.overviewCard} onClick={() => navigate('/marketplace')}>
              <div className={styles.overviewCardHeader}><Store size={18} color="#f59e0b" /><span className={styles.overviewCardLabel}>Marketplace</span></div>
              <div className={styles.overviewCardValue}><span className={styles.overviewNumber}>{p.marketplace?.totalListings ?? '—'}</span><span className={styles.overviewUnit}>listings</span></div>
            </div>
          </div>

          <div className={styles.topRow}>
            <CreditWidget balance={data.credits.balance} limit={data.credits.limit} usedThisMonth={data.credits.usedThisMonth} daysRemaining={data.credits.daysRemaining} burnRate={data.credits.burnRate} tier={data.tier} unlimited={data.credits.unlimited} onUpgrade={handleUpgrade} onSubscribe={handleSubscribe} subscribeLoading={subscribeLoading} />
            <UsageBreakdownChart data={data.usageBreakdown} totalCredits={data.credits.usedThisMonth} />
          </div>

          <UsageTrendChart data={data.usageTrend} height={180} />

          <ActivityGrid metrics={[
            { label: 'Messages Sent', value: data.activity.messages, icon: 'messages' },
            { label: 'Active Agents', value: data.activity.agents, limit: data.activity.agentsLimit, icon: 'agents' },
            { label: 'Memories Stored', value: data.activity.memories, icon: 'memories' },
            { label: 'Agent Sessions', value: data.activity.sessions, icon: 'sessions' },
          ]} />

          <div className={styles.codeStatsCard}>
            <div className={styles.codeStatsHeader}>
              <div className={styles.codeStatsTitle}><Zap size={16} color="#10b981" /><span>Resonant AI — Code Written</span></div>
              {liveLoc && <span className={styles.codeStatsLive}><span className={styles.liveDot} />{liveLoc.total_lines_all_time.toLocaleString()} LOC platform-wide</span>}
            </div>
            {locStats && (locStats.total_lines_written > 0 || locStats.total_lines_edited > 0) ? (
              <>
                <div className={styles.codeStatsGrid}>
                  {[
                    { label: 'Lines Written', value: locStats.total_lines_written, color: '#10b981' },
                    { label: 'Lines Edited', value: locStats.total_lines_edited, color: '#3b82f6' },
                    { label: 'Net Lines', value: locStats.total_net_lines, color: '#8b5cf6' },
                    { label: 'Files Created', value: locStats.total_files_created, color: '#ec4899' },
                    { label: 'Files Modified', value: locStats.total_files_modified, color: '#06b6d4' },
                    { label: 'Tool Calls', value: locStats.total_tool_calls, color: '#f59e0b' },
                  ].map(item => (
                    <div key={item.label} className={styles.codeStatItem}>
                      <div className={styles.codeStatValue} style={{ color: item.color }}>{item.value.toLocaleString()}</div>
                      <div className={styles.codeStatLabel}>{item.label}</div>
                    </div>
                  ))}
                </div>
                {locStats.languages && Object.keys(locStats.languages).length > 0 && (
                  <div className={styles.langTags}>
                    {Object.entries(locStats.languages).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 6).map(([lang, count]) => (
                      <span key={lang} className={styles.langTag}>{lang}: {(count as number).toLocaleString()}</span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.codeStatsEmpty}>No AI-written code yet. Start using Resonant IDE to see your stats here.</div>
            )}
          </div>

          <div className={styles.bottomRow}>
            <ActivityFeed items={data.recentActivity as any} />
            <QuickActions />
          </div>
        </>
      )}

      {/* ══════════════ PROFILE TAB ══════════════ */}
      {activeTab === 'profile' && (
        <div className={styles.profileSection}>
          <div className={styles.sectionCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatar}>{getInitials(fullName || email)}</div>
              <div>
                <div className={styles.profileName}>{fullName || 'User'} <span className={styles.planBadge}>{planName}</span></div>
                <div className={styles.profileEmail}>{email}</div>
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Usage Summary</h3>
            <div className={styles.statsRow}>
              <div className={styles.statBox}><div className={styles.statNum}>{usageMetrics?.tokens?.used?.toLocaleString() || 0}</div><div className={styles.statLbl}>Tokens Used</div></div>
              <div className={styles.statBox}><div className={styles.statNum}>{totalMessages}</div><div className={styles.statLbl}>Messages</div></div>
              <div className={styles.statBox}><div className={styles.statNum}>{totalConversations}</div><div className={styles.statLbl}>Conversations</div></div>
              <div className={styles.statBox}><div className={styles.statNum}>{totalCreditsUsed}</div><div className={styles.statLbl}>Credits Used</div></div>
              <div className={styles.statBox}><div className={styles.statNum}>{usageMetrics?.agents?.active || 0}</div><div className={styles.statLbl}>Active Agents</div></div>
              <div className={styles.statBox}><div className={styles.statNum}>{usageMetrics?.memory?.anchorsUsed || 0}</div><div className={styles.statLbl}>Memory Anchors</div></div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Referral Program</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 12px' }}>Invite friends — get 250 bonus credits when they subscribe.</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="text" readOnly value={`${window.location.origin}/signup?ref=${referralCode}`} style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 13 }} />
              <Button size="sm" onClick={handleCopyReferral}>{copiedReferral ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ SETTINGS TAB ══════════════ */}
      {activeTab === 'settings' && (
        <div className={styles.profileSection}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Profile Information</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div className={styles.avatarSm}>{getInitials(fullName || email)}</div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4, display: 'block' }}>Name</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', fontSize: 14 }} />
                  <Button size="sm" onClick={handleSaveName} disabled={savingSettings}>Save</Button>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Email: {email}</div>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Notifications</h3>
            <div className={styles.settingRow}>
              <div><div className={styles.settingLabel}>Newsletter</div><div className={styles.settingDesc}>Receive product updates and coding tips.</div></div>
              <label className={styles.toggle}><input type="checkbox" checked={newsletterEnabled} onChange={e => setNewsletterEnabled(e.target.checked)} /><span className={styles.toggleSlider} /></label>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Privacy</h3>
            <div className={styles.settingRow}>
              <div><div className={styles.settingLabel}>Disable Telemetry</div><div className={styles.settingDesc}>Opt out of non-essential data collection.</div></div>
              <label className={styles.toggle}><input type="checkbox" checked={telemetryDisabled} onChange={e => setTelemetryDisabled(e.target.checked)} /><span className={styles.toggleSlider} /></label>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle} style={{ color: '#ef4444' }}>Danger Zone</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 12px' }}>Once you delete your account, there is no going back.</p>
            <Button variant="danger" onClick={handleDeleteAccount}><Trash2 size={16} /> Delete account</Button>
          </div>
        </div>
      )}

      {/* ══════════════ BILLING TAB ══════════════ */}
      {activeTab === 'billing' && (
        <div className={styles.profileSection}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Credit Balance</h3>
            <div className={styles.creditBar}><div className={styles.creditFill} style={{ width: `${Math.min(((usageMetrics?.credits?.used || 0) / (usageMetrics?.credits?.limit || 1)) * 100, 100)}%` }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 8 }}>
              <span>{usageMetrics?.credits?.used || 0} / {usageMetrics?.credits?.limit || 0} credits used</span>
              <span>{usageMetrics?.credits?.balance || 0} available</span>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Manage Plan</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 12px' }}>Current plan: <strong style={{ color: 'var(--color-text-primary)' }}>{planName}</strong></p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button size="sm" onClick={() => navigate('/pricing')}>Switch Plan</Button>
              <Button size="sm" variant="secondary" onClick={handleUpdatePayment}>Update Payment</Button>
              <Button size="sm" variant="danger" onClick={handleCancelPlan}>Cancel Plan</Button>
            </div>
            {paymentMethods.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {paymentMethods.map(pm => (
                  <div key={pm.id} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--color-text-secondary)', padding: '6px 0' }}>
                    <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{pm.brand}</span>
                    <span>•••• {pm.last4}</span>
                    <span>Exp {pm.exp_month}/{pm.exp_year}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Auto Refill</h3>
            <div className={styles.settingRow}>
              <div><div className={styles.settingLabel}>Auto refill credits</div><div className={styles.settingDesc}>Automatically adds credits when your balance is low.</div></div>
              <label className={styles.toggle}><input type="checkbox" checked={autoRefillEnabled} onChange={e => setAutoRefillEnabled(e.target.checked)} /><span className={styles.toggleSlider} /></label>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}><Gift size={16} style={{ color: '#FFD800' }} /> Redeem Promo Code</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 12px' }}>Have a promo code? Enter it below to receive bonus credits — works on any plan.</p>
            <div className={styles.promoRow}>
              <input
                type="text"
                className={styles.promoInput}
                placeholder="Enter promo code"
                value={promoCode}
                onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
                onKeyDown={e => e.key === 'Enter' && handleRedeemPromo()}
                disabled={promoLoading}
              />
              <button className={styles.promoBtn} onClick={handleRedeemPromo} disabled={promoLoading || !promoCode.trim()}>
                {promoLoading ? 'Redeeming…' : 'Redeem'}
              </button>
            </div>
            {promoResult && (
              <div className={`${styles.promoMsg} ${promoResult.type === 'success' ? styles.promoSuccess : styles.promoError}`}>
                {promoResult.message}
              </div>
            )}
          </div>

          {creditPacks.length > 0 && (
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>Purchase Credit Packs</h3>
              <div className={styles.packGrid}>
                {creditPacks.map(pack => (
                  <div key={pack.id} className={`${styles.packCard} ${pack.popular ? styles.packPopular : ''}`}>
                    {pack.popular && <div className={styles.packBadge}>Popular</div>}
                    <div className={styles.packName}>{pack.name}</div>
                    <div className={styles.packTokens}>{(pack.tokens || 0).toLocaleString()} credits</div>
                    <div className={styles.packPrice}>${pack.price}</div>
                    <Button size="sm" variant={pack.popular ? 'primary' : 'secondary'} onClick={() => handlePurchaseCredits(pack.id)}>Buy</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {creditHistory.length > 0 && (
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>Credit History</h3>
              {creditHistory.slice(0, 10).map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{item.description}</span>
                  <span style={{ color: item.amount > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{item.amount > 0 ? '+' : ''}{item.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ API KEYS TAB ══════════════ */}
      {activeTab === 'api-keys' && (
        <div className={styles.profileSection}>
          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Model Provider API Keys</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 16px' }}>Manage your API keys for third-party model providers (BYOK).</p>
            <ApiKeyManager showTitle={false} />
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Platform API Keys</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13, margin: '0 0 12px' }}>Access DevSwat APIs programmatically for custom integrations.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" onClick={() => navigate('/connect-profiles')}><Key size={14} /> View & Create API Keys</Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ INTEGRATIONS TAB ══════════════ */}
      {activeTab === 'integrations' && (
        <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading integrations...</div>}>
          <ConnectProfilesPage />
        </Suspense>
      )}
    </div>
  );
};

export default NewUserDashboard;
