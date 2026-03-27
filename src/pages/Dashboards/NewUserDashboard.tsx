/**
 * New User Dashboard - Modern Design
 * Features: Credit widget, usage breakdown, trends, activity feed
 * Connected to real backend endpoints
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Shield, Bot, Brain, Store, GitBranch, Activity, CheckCircle, XCircle, Zap, ArrowRight } from 'lucide-react';
import { isAuthenticated } from '../../utils/auth-cookies';
import { fetchDashboardData, type DashboardData } from '../../api/dashboard';
import { getMyLocStats, getLiveLocStats, type UserLocStats, type LiveLocStats } from '../../api/ideLoc';
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
import { TrialBanner } from '../../components/features/TrialBanner/TrialBanner';
import styles from './NewUserDashboard.module.css';

const NewUserDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [locStats, setLocStats] = useState<UserLocStats | null>(null);
  const [liveLoc, setLiveLoc] = useState<LiveLocStats | null>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const [dashboardData, locData, liveData] = await Promise.all([
        fetchDashboardData(),
        getMyLocStats().catch(() => null),
        getLiveLocStats().catch(() => null),
      ]);
      setData(dashboardData);
      if (locData) setLocStats(locData);
      if (liveData) setLiveLoc(liveData);
    } catch (err) {
      logger.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [navigate, loadDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

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
  const complianceColor = (p.compliance?.score ?? 0) >= 80 ? '#22c55e' : (p.compliance?.score ?? 0) >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className={styles.dashboard}>
      {/* 1-Week Unlimited Trial Banner */}
      <TrialBanner onUpgrade={handleUpgrade} />

      {/* Alerts */}
      {data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0 && (
        <AlertBanner 
          alerts={data.alerts.map(a => ({
            ...a,
            action: a.type === 'error' ? { label: 'Buy Credits', onClick: handleUpgrade } : undefined
          }))} 
        />
      )}

      {/* User Overview - Per-User Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        {/* My Agents */}
        <div
          onClick={() => navigate('/agents')}
          style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#8b5cf6')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f2937')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Bot size={18} color="#8b5cf6" />
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>My Agents</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: '#e5e7eb', fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{data.activity.agents ?? 0}</span>
            <span style={{ color: '#6b7280', fontSize: 14 }}>created</span>
          </div>
        </div>

        {/* My Memory */}
        <div
          onClick={() => navigate('/resonant-memory')}
          style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#ec4899')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f2937')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Brain size={18} color="#ec4899" />
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>My Memory</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: '#e5e7eb', fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{data.activity.memories ?? 0}</span>
            <span style={{ color: '#6b7280', fontSize: 14 }}>anchors</span>
          </div>
        </div>

        {/* My Sessions */}
        <div
          onClick={() => navigate('/agents')}
          style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f2937')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Activity size={18} color="#6366f1" />
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sessions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: '#e5e7eb', fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{data.activity.sessions ?? 0}</span>
            <span style={{ color: '#6b7280', fontSize: 14 }}>total</span>
          </div>
        </div>

        {/* My Workflows */}
        <div
          onClick={() => navigate('/network/workflows')}
          style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f2937')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <GitBranch size={18} color="#6366f1" />
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Workflows</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: '#e5e7eb', fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{p.workflows?.count ?? 0}</span>
            <span style={{ color: '#6b7280', fontSize: 14 }}>saved</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={10} /> Visual Builder available
          </div>
        </div>

        {/* Marketplace */}
        <div
          onClick={() => navigate('/marketplace')}
          style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#f59e0b')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f2937')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Store size={18} color="#f59e0b" />
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Marketplace</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: '#e5e7eb', fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{p.marketplace?.totalListings ?? '—'}</span>
            <span style={{ color: '#6b7280', fontSize: 14 }}>listings</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>{p.marketplace ? `${p.marketplace.totalDownloads} downloads` : 'Loading...'}</div>
        </div>
      </div>

      {/* Top Row: Credit Widget + Usage Breakdown */}
      <div className={styles.topRow}>
        <CreditWidget
          balance={data.credits.balance}
          limit={data.credits.limit}
          usedThisMonth={data.credits.usedThisMonth}
          daysRemaining={data.credits.daysRemaining}
          burnRate={data.credits.burnRate}
          tier={data.tier}
          unlimited={data.credits.unlimited}
          onUpgrade={handleUpgrade}
        />
        <UsageBreakdownChart
          data={data.usageBreakdown}
          totalCredits={data.credits.usedThisMonth}
        />
      </div>

      {/* Usage Trends */}
      <UsageTrendChart data={data.usageTrend} height={180} />

      {/* Activity Grid */}
      <ActivityGrid
        metrics={[
          { label: 'Messages Sent', value: data.activity.messages, icon: 'messages' },
          { label: 'Active Agents', value: data.activity.agents, limit: data.activity.agentsLimit, icon: 'agents' },
          { label: 'Memories Stored', value: data.activity.memories, icon: 'memories' },
          { label: 'Agent Sessions', value: data.activity.sessions, icon: 'sessions' },
        ]}
      />

      {/* Resonant AI — Code Stats (LOC Tracking) */}
      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#10b981" />
            <span style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600 }}>Resonant AI — Code Written</span>
          </div>
          {liveLoc && (
            <span style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              {liveLoc.total_lines_all_time.toLocaleString()} LOC platform-wide
            </span>
          )}
        </div>
        {locStats && (locStats.total_lines_written > 0 || locStats.total_lines_edited > 0) ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Lines Written', value: locStats.total_lines_written, color: '#10b981' },
                { label: 'Lines Edited', value: locStats.total_lines_edited, color: '#3b82f6' },
                { label: 'Net Lines', value: locStats.total_net_lines, color: '#8b5cf6' },
                { label: 'Files Created', value: locStats.total_files_created, color: '#ec4899' },
                { label: 'Files Modified', value: locStats.total_files_modified, color: '#06b6d4' },
                { label: 'Tool Calls', value: locStats.total_tool_calls, color: '#f59e0b' },
              ].map((item) => (
                <div key={item.label} style={{ background: '#0f172a', borderRadius: 8, padding: '10px 12px', textAlign: 'center', border: '1px solid #1e293b' }}>
                  <div style={{ color: item.color, fontSize: 20, fontWeight: 700, fontFamily: 'monospace' }}>{item.value.toLocaleString()}</div>
                  <div style={{ color: '#6b7280', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{item.label}</div>
                </div>
              ))}
            </div>
            {locStats.languages && Object.keys(locStats.languages).length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(locStats.languages).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 6).map(([lang, count]) => (
                  <span key={lang} style={{ background: '#1e293b', color: '#94a3b8', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>
                    {lang}: {(count as number).toLocaleString()}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
            No AI-written code yet. Start using Resonant IDE to see your stats here.
          </div>
        )}
      </div>

      {/* Platform Compliance removed — it shows system-wide data, not per-user */}

      {/* Bottom Row: Activity Feed + Quick Actions */}
      <div className={styles.bottomRow}>
        <ActivityFeed items={data.recentActivity as any} />
        <QuickActions />
      </div>
    </div>
  );
};

export default NewUserDashboard;
