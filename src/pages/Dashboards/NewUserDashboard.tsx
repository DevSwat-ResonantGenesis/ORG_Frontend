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

      {/* User Overview - Per-User Metrics */}
      <div className={styles.overviewGrid}>
        {/* My Agents */}
        <div className={styles.overviewCard} onClick={() => navigate('/agents')}>
          <div className={styles.overviewCardHeader}>
            <Bot size={18} color="#8b5cf6" />
            <span className={styles.overviewCardLabel}>My Agents</span>
          </div>
          <div className={styles.overviewCardValue}>
            <span className={styles.overviewNumber}>{data.activity.agents ?? 0}</span>
            <span className={styles.overviewUnit}>created</span>
          </div>
        </div>

        {/* My Memory */}
        <div className={styles.overviewCard} onClick={() => navigate('/resonant-memory')}>
          <div className={styles.overviewCardHeader}>
            <Brain size={18} color="#ec4899" />
            <span className={styles.overviewCardLabel}>My Memory</span>
          </div>
          <div className={styles.overviewCardValue}>
            <span className={styles.overviewNumber}>{data.activity.memories ?? 0}</span>
            <span className={styles.overviewUnit}>anchors</span>
          </div>
        </div>

        {/* My Sessions */}
        <div className={styles.overviewCard} onClick={() => navigate('/agents')}>
          <div className={styles.overviewCardHeader}>
            <Activity size={18} color="#6366f1" />
            <span className={styles.overviewCardLabel}>Sessions</span>
          </div>
          <div className={styles.overviewCardValue}>
            <span className={styles.overviewNumber}>{data.activity.sessions ?? 0}</span>
            <span className={styles.overviewUnit}>total</span>
          </div>
        </div>

        {/* My Workflows */}
        <div className={styles.overviewCard} onClick={() => navigate('/network/workflows')}>
          <div className={styles.overviewCardHeader}>
            <GitBranch size={18} color="#6366f1" />
            <span className={styles.overviewCardLabel}>Workflows</span>
          </div>
          <div className={styles.overviewCardValue}>
            <span className={styles.overviewNumber}>{p.workflows?.count ?? 0}</span>
            <span className={styles.overviewUnit}>saved</span>
          </div>
        </div>

        {/* Marketplace */}
        <div className={styles.overviewCard} onClick={() => navigate('/marketplace')}>
          <div className={styles.overviewCardHeader}>
            <Store size={18} color="#f59e0b" />
            <span className={styles.overviewCardLabel}>Marketplace</span>
          </div>
          <div className={styles.overviewCardValue}>
            <span className={styles.overviewNumber}>{p.marketplace?.totalListings ?? '—'}</span>
            <span className={styles.overviewUnit}>listings</span>
          </div>
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
      <div className={styles.codeStatsCard}>
        <div className={styles.codeStatsHeader}>
          <div className={styles.codeStatsTitle}>
            <Zap size={16} color="#10b981" />
            <span>Resonant AI — Code Written</span>
          </div>
          {liveLoc && (
            <span className={styles.codeStatsLive}>
              <span className={styles.liveDot} />
              {liveLoc.total_lines_all_time.toLocaleString()} LOC platform-wide
            </span>
          )}
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
              ].map((item) => (
                <div key={item.label} className={styles.codeStatItem}>
                  <div className={styles.codeStatValue} style={{ color: item.color }}>{item.value.toLocaleString()}</div>
                  <div className={styles.codeStatLabel}>{item.label}</div>
                </div>
              ))}
            </div>
            {locStats.languages && Object.keys(locStats.languages).length > 0 && (
              <div className={styles.langTags}>
                {Object.entries(locStats.languages).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 6).map(([lang, count]) => (
                  <span key={lang} className={styles.langTag}>
                    {lang}: {(count as number).toLocaleString()}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.codeStatsEmpty}>
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
