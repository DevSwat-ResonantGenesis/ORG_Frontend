/**
 * New User Dashboard - Modern Design
 * Features: Credit widget, usage breakdown, trends, activity feed
 * Connected to real backend endpoints
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
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

  return (
    <div className={styles.dashboard}>
      {/* Alerts */}
      {data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0 && (
        <AlertBanner 
          alerts={data.alerts.map(a => ({
            ...a,
            action: a.type === 'error' ? { label: 'Buy Credits', onClick: handleUpgrade } : undefined
          }))} 
        />
      )}

      {/* Top Row: Credit Widget + Usage Breakdown */}
      <div className={styles.topRow}>
        <CreditWidget
          balance={data.credits.balance}
          limit={data.credits.limit}
          usedThisMonth={data.credits.usedThisMonth}
          daysRemaining={data.credits.daysRemaining}
          burnRate={data.credits.burnRate}
          tier={data.tier}
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
          { label: 'AI Agents', value: data.activity.agents, limit: data.activity.agentsLimit, icon: 'agents' },
          { label: 'Memories', value: data.activity.memories, icon: 'memories' },
          { label: 'Total Sessions', value: data.activity.sessions, icon: 'sessions' },
        ]}
      />

      {/* Bottom Row: Activity Feed + Quick Actions */}
      <div className={styles.bottomRow}>
        <ActivityFeed items={data.recentActivity as any} />
        <QuickActions />
      </div>
    </div>
  );
};

export default NewUserDashboard;
