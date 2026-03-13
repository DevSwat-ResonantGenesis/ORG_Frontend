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

      {/* Platform Overview - Real Live Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        {/* Compliance Score */}
        <div
          onClick={() => navigate('/compliance')}
          style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = complianceColor)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f2937')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Shield size={18} color={complianceColor} />
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Compliance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: complianceColor, fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{p.compliance?.score ?? '—'}</span>
            <span style={{ color: '#6b7280', fontSize: 14 }}>/100</span>
            {p.compliance?.grade && <span style={{ background: `${complianceColor}20`, color: complianceColor, padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600, marginLeft: 4 }}>Grade {p.compliance.grade}</span>}
          </div>
          <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>{p.compliance?.framework || 'SOC2 Framework'}</div>
        </div>

        {/* Active Agents */}
        <div
          onClick={() => navigate('/agents')}
          style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#8b5cf6')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f2937')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Bot size={18} color="#8b5cf6" />
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Agents</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: '#e5e7eb', fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{p.agentMetrics?.active ?? '—'}</span>
            <span style={{ color: '#6b7280', fontSize: 14 }}>/ {p.agentMetrics?.total ?? '—'} total</span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            {p.agentMetrics && <span style={{ color: '#22c55e', fontSize: 11 }}><CheckCircle size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />{p.agentMetrics.completed} completed</span>}
            {p.agentMetrics && p.agentMetrics.running > 0 && <span style={{ color: '#3b82f6', fontSize: 11 }}><Activity size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />{p.agentMetrics.running} running</span>}
          </div>
        </div>

        {/* Memory / Hash Sphere */}
        <div
          onClick={() => navigate('/resonant-memory')}
          style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#ec4899')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1f2937')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Brain size={18} color="#ec4899" />
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Memory</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ color: '#e5e7eb', fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{p.memory ? p.memory.totalMemories.toLocaleString() : '—'}</span>
            <span style={{ color: '#6b7280', fontSize: 14 }}>anchors</span>
          </div>
          <div style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>{p.memory ? `${p.memory.storageMb.toFixed(1)} MB stored` : 'Loading...'}</div>
        </div>

        {/* Workflows */}
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
            <span style={{ color: '#e5e7eb', fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{p.workflows?.count ?? '—'}</span>
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

      {/* Compliance Checks Detail */}
      {p.compliance && p.compliance.checks.length > 0 && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} color={complianceColor} />
              <span style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600 }}>Compliance Controls</span>
            </div>
            <button onClick={() => navigate('/compliance')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>View Details <ArrowRight size={12} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
            {p.compliance.checks.map((check, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b' }}>
                {check.status === 'pass'
                  ? <CheckCircle size={16} color="#22c55e" />
                  : <XCircle size={16} color="#ef4444" />}
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#d1d5db', fontSize: 12, fontWeight: 500 }}>{check.control}</div>
                  <div style={{ color: '#6b7280', fontSize: 11 }}>{check.detail}</div>
                </div>
                <span style={{ color: '#6b7280', fontSize: 10 }}>{check.weight}pt</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Row: Activity Feed + Quick Actions */}
      <div className={styles.bottomRow}>
        <ActivityFeed items={data.recentActivity as any} />
        <QuickActions />
      </div>
    </div>
  );
};

export default NewUserDashboard;
