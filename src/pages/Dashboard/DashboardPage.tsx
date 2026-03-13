import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { normalizeRole, canAccess, type Role } from '../../utils/permissions';
import { logger } from '../../utils/logger';
import { RoleBasedDashboard } from '../../components/dashboard/RoleBasedDashboard';
import { Button } from '../../components/ui';
import { Card } from '../../components/ui';
import { Text } from '../../components/ui';
import fastapiClient from '../../api/fastapiClient';
import styles from './DashboardPage.module.css';

// ── Types for REAL backend data ──
interface AgentMetrics {
  agents: { total: number; active: number };
  sessions: { total: number; running: number; completed: number; failed: number };
}

interface MarketplaceStats {
  total_listings: number;
  total_downloads: number;
  total_publishers: number;
}

interface MarketplaceListing {
  id: string;
  name: string;
  tagline?: string;
  category?: string;
  price_type: string;
  price_amount: number;
  downloads: number;
  rating_average: number;
  status: string;
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  uptime?: string;
}

interface LearningStats {
  total_outcomes?: number;
  success_rate?: number;
  patterns_extracted?: number;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const session = getSession();
  const normalizedRole = normalizeRole((session.role || 'user') as Role);
  const userRole: Role = normalizedRole || 'user';

  // Real data state
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics | null>(null);
  const [marketplaceStats, setMarketplaceStats] = useState<MarketplaceStats | null>(null);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    const errs: string[] = [];

    // Fetch all data in parallel — each call is independent
    const [metricsRes, mktStatsRes, listingsRes, learningRes] = await Promise.allSettled([
      fastapiClient.get('/agents/metrics').then(r => r.data),
      fastapiClient.get('/marketplace/stats').then(r => r.data),
      fastapiClient.get('/marketplace/listings').then(r => r.data),
      fastapiClient.get('/agents/learning/stats').then(r => r.data),
    ]);

    if (metricsRes.status === 'fulfilled') {
      setAgentMetrics(metricsRes.value);
    } else {
      errs.push('Agent metrics unavailable');
      setAgentMetrics({ agents: { total: 0, active: 0 }, sessions: { total: 0, running: 0, completed: 0, failed: 0 } });
    }

    if (mktStatsRes.status === 'fulfilled') {
      setMarketplaceStats(mktStatsRes.value);
    } else {
      errs.push('Marketplace stats unavailable');
      setMarketplaceStats({ total_listings: 0, total_downloads: 0, total_publishers: 0 });
    }

    if (listingsRes.status === 'fulfilled') {
      setListings(Array.isArray(listingsRes.value) ? listingsRes.value : []);
    } else {
      setListings([]);
    }

    if (learningRes.status === 'fulfilled') {
      setLearningStats(learningRes.value);
    } else {
      setLearningStats(null);
    }

    setErrors(errs);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Role-based dashboard for specific roles
  if (userRole === 'compliance' || userRole === 'ml_engineer' || userRole === 'finance' || userRole === 'platform_dev' || userRole === 'viewer') {
    return <RoleBasedDashboard />;
  }

  const getRoleBadge = (role: Role) => {
    const badges: Record<string, { label: string; color: string }> = {
      org_admin: { label: 'Admin', color: '#3b82f6' },
      admin: { label: 'Admin', color: '#3b82f6' },
      platform_owner: { label: 'Owner', color: '#ef4444' },
      platform_dev: { label: 'Platform Dev', color: '#ef4444' },
      ml_engineer: { label: 'ML Engineer', color: '#8b5cf6' },
      compliance: { label: 'Compliance', color: '#10b981' },
      security: { label: 'Compliance', color: '#10b981' },
      finance: { label: 'Finance', color: '#f59e0b' },
      viewer: { label: 'Viewer', color: '#6b7280' },
      analyst: { label: 'Viewer', color: '#6b7280' },
    };
    return badges[role] || { label: 'User', color: '#6366f1' };
  };

  const roleBadge = getRoleBadge(userRole);
  const m = agentMetrics;
  const mk = marketplaceStats;
  const sessionSuccessRate = m && m.sessions.total > 0
    ? ((m.sessions.completed / m.sessions.total) * 100).toFixed(0)
    : '—';

  return (
    <div className="page-container">
      {/* HEADER */}
      <div className={`${styles.pageHeader} ${styles.fadeIn}`} style={{ marginBottom: 'var(--space-6)' }}>
        <div className={styles.pageHeaderContent}>
          <div className={styles.pageHeaderTitleRow} style={{ marginBottom: 'var(--space-2)' }}>
            <Text variant="h1" color="primary" style={{ margin: 0 }}>Dashboard</Text>
            <span style={{
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-12)',
              fontWeight: 'var(--font-weight-semibold)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: roleBadge.color,
              color: '#ffffff',
              whiteSpace: 'nowrap'
            }}>
              {roleBadge.label}
            </span>
          </div>
          <Text variant="body" color="secondary" className={styles.pageSubtitleDesktop}>
            Live platform metrics from all services. Data refreshes every 30 seconds.
          </Text>
        </div>
        <div className={`${styles.pageHeaderActions} ${styles.pageHeaderActionsDesktop}`} style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="md" onClick={() => navigate('/agents')}>
            Agents
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/chat')}>
            Resonant Chat
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/marketplace')}>
            Marketplace
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/code-visualizer')}>
            Code Visualizer
          </Button>
          <Button variant="secondary" size="md" onClick={() => navigate('/help')}>
            Help Center
          </Button>
        </div>
      </div>

      {/* LOADING INDICATOR */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-4)', opacity: 0.6 }}>
          <Text variant="body-sm" color="secondary">Loading live data...</Text>
        </div>
      )}

      {/* ERROR BANNER */}
      {errors.length > 0 && (
        <div style={{
          padding: 'var(--space-2) var(--space-3)',
          marginBottom: 'var(--space-4)',
          background: 'var(--color-bg-warning, rgba(245,158,11,0.1))',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 'var(--radius-md)',
        }}>
          <Text variant="caption" color="muted">
            Some data sources unavailable: {errors.join(', ')}
          </Text>
        </div>
      )}

      {/* ── PLATFORM KPIs — ALL FROM LIVE ENDPOINTS ── */}
      <section className={`page-section ${styles.fadeIn}`} style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>Platform Overview</Text>
          <Text variant="body-sm" color="secondary">
            Real-time metrics from agent_engine_service and marketplace_service.
          </Text>
        </div>
        <div className={styles.kpiGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>

          {/* Total Agents — from /agents/metrics */}
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Total Agents</Text>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>
              {m?.agents.total ?? '—'}
            </Text>
            <Text variant="caption" color="accent" style={{ marginBottom: 'var(--space-1)' }}>
              {m?.agents.active ?? 0} active
            </Text>
            <Text variant="caption" color="muted">From /agents/metrics</Text>
          </Card>

          {/* Total Sessions — from /agents/metrics */}
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Agent Sessions</Text>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>
              {m?.sessions.total ?? '—'}
            </Text>
            <Text variant="caption" color="accent" style={{ marginBottom: 'var(--space-1)' }}>
              {m?.sessions.running ?? 0} running now
            </Text>
            <Text variant="caption" color="muted">From /agents/metrics</Text>
          </Card>

          {/* Session Success Rate — computed from /agents/metrics */}
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Success Rate</Text>
            <Text variant="h2" color={Number(sessionSuccessRate) >= 50 ? 'accent' : 'error'} style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>
              {sessionSuccessRate}%
            </Text>
            <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
              {m?.sessions.completed ?? 0} completed / {m?.sessions.failed ?? 0} failed
            </Text>
            <Text variant="caption" color="muted">Computed from sessions</Text>
          </Card>

          {/* Running Sessions — from /agents/metrics */}
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Running Now</Text>
            <Text variant="h2" color={m && m.sessions.running > 0 ? 'accent' : 'primary'} style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>
              {m?.sessions.running ?? '—'}
            </Text>
            <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
              Active agent sessions
            </Text>
            <Text variant="caption" color="muted">Live from /agents/metrics</Text>
          </Card>

          {/* Marketplace Listings — from /marketplace/stats */}
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Marketplace</Text>
            <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>
              {mk?.total_listings ?? '—'}
            </Text>
            <Text variant="caption" color="muted" style={{ marginBottom: 'var(--space-1)' }}>
              {mk?.total_downloads ?? 0} downloads
            </Text>
            <Text variant="caption" color="muted">From /marketplace/stats</Text>
          </Card>

          {/* Failed Sessions — from /agents/metrics */}
          <Card variant="elevated" padding="md">
            <Text variant="body-sm" color="secondary" style={{ marginBottom: 'var(--space-1)' }}>Failed Sessions</Text>
            <Text variant="h2" color={m && m.sessions.failed > 0 ? 'error' : 'primary'} style={{ marginBottom: 'var(--space-1)', fontFamily: 'var(--font-mono)' }}>
              {m?.sessions.failed ?? '—'}
            </Text>
            <Text variant="caption" color={m && m.sessions.failed > 0 ? 'error' : 'muted'} style={{ marginBottom: 'var(--space-1)' }}>
              {m && m.sessions.failed > 0 ? 'Needs attention' : 'All clear'}
            </Text>
            <Text variant="caption" color="muted">From /agents/metrics</Text>
          </Card>

        </div>
      </section>

      {/* ── QUICK ACTIONS ── */}
      <section className={`page-section ${styles.fadeIn} ${styles.delay1}`} style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>Quick Actions</Text>
          <Text variant="body-sm" color="secondary">Jump to key platform features.</Text>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
          <Card variant="elevated" padding="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/agents')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 24 }}>🤖</span>
              <Text variant="h4" color="primary">Agent Studio</Text>
            </div>
            <Text variant="body-sm" color="secondary">Create, configure, and run autonomous agents. {m?.agents.total ?? 0} agents available.</Text>
          </Card>
          <Card variant="elevated" padding="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/chat')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 24 }}>💬</span>
              <Text variant="h4" color="primary">Resonant Chat</Text>
            </div>
            <Text variant="body-sm" color="secondary">AI chat with skills: Code Visualizer, Agents OS, Memory, Web Search.</Text>
          </Card>
          <Card variant="elevated" padding="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/code-visualizer')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 24 }}>🔍</span>
              <Text variant="h4" color="primary">Code Visualizer</Text>
            </div>
            <Text variant="body-sm" color="secondary">Scan GitHub repos for dependency graphs, governance analysis, and security findings.</Text>
          </Card>
          <Card variant="elevated" padding="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/resonant-memory')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 24 }}>🧠</span>
              <Text variant="h4" color="primary">Hash Sphere Memory</Text>
            </div>
            <Text variant="body-sm" color="secondary">Semantic memory system. Create anchors, search knowledge, ingest documents.</Text>
          </Card>
          <Card variant="elevated" padding="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/network/workflows/visual')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 24 }}>⚡</span>
              <Text variant="h4" color="primary">Workflow Builder</Text>
            </div>
            <Text variant="body-sm" color="secondary">Visual drag-and-drop workflow designer with React Flow canvas.</Text>
          </Card>
          <Card variant="elevated" padding="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/marketplace')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 24 }}>🏪</span>
              <Text variant="h4" color="primary">Marketplace</Text>
            </div>
            <Text variant="body-sm" color="secondary">Browse and install agents, plugins, and workflows. {mk?.total_listings ?? 0} listings.</Text>
          </Card>
          <Card variant="elevated" padding="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/connect-profiles')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 24 }}>🔗</span>
              <Text variant="h4" color="primary">Connect Profiles</Text>
            </div>
            <Text variant="body-sm" color="secondary">Add API keys, connect GitHub, Discord, Slack, and 20+ integrations.</Text>
          </Card>
          <Card variant="elevated" padding="md" style={{ cursor: 'pointer' }} onClick={() => navigate('/community')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 24 }}>🐰</span>
              <Text variant="h4" color="primary">Rabbit Community</Text>
            </div>
            <Text variant="body-sm" color="secondary">Community posts, discussions, and knowledge sharing.</Text>
          </Card>
        </div>
      </section>

      {/* ── MARKETPLACE LISTINGS — LIVE DATA ── */}
      {listings.length > 0 && (
        <section className={`page-section ${styles.fadeIn} ${styles.delay1}`} style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>Marketplace Listings</Text>
            <Text variant="body-sm" color="secondary">Published agents and plugins from /marketplace/listings.</Text>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
            {listings.slice(0, 6).map((item) => (
              <Card key={item.id} variant="elevated" padding="md" style={{ cursor: 'pointer' }} onClick={() => navigate(`/marketplace/${item.id}`)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <Text variant="h4" color="primary">{item.name}</Text>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-11)',
                    background: item.price_type === 'free' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                    color: item.price_type === 'free' ? '#10b981' : '#6366f1',
                  }}>
                    {item.price_type === 'free' ? 'Free' : `$${item.price_amount}`}
                  </span>
                </div>
                {item.tagline && <Text variant="body-sm" color="secondary">{item.tagline}</Text>}
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                  <Text variant="caption" color="muted">{item.category || 'Uncategorized'}</Text>
                  <Text variant="caption" color="muted">{item.downloads} downloads</Text>
                </div>
              </Card>
            ))}
          </div>
          {listings.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
              <Button variant="secondary" size="sm" onClick={() => navigate('/marketplace')}>
                View all {listings.length} listings
              </Button>
            </div>
          )}
        </section>
      )}

      {/* ── LEARNING STATS — LIVE DATA (if available) ── */}
      {learningStats && (
        <section className={`page-section ${styles.fadeIn} ${styles.delay2}`} style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>Agent Learning</Text>
            <Text variant="body-sm" color="secondary">Self-improvement metrics from /agents/learning/stats.</Text>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {learningStats.total_outcomes != null && (
              <Card variant="elevated" padding="md">
                <Text variant="body-sm" color="secondary">Total Outcomes</Text>
                <Text variant="h2" color="primary" style={{ fontFamily: 'var(--font-mono)' }}>{learningStats.total_outcomes}</Text>
              </Card>
            )}
            {learningStats.success_rate != null && (
              <Card variant="elevated" padding="md">
                <Text variant="body-sm" color="secondary">Learning Success Rate</Text>
                <Text variant="h2" color="accent" style={{ fontFamily: 'var(--font-mono)' }}>{(learningStats.success_rate * 100).toFixed(0)}%</Text>
              </Card>
            )}
            {learningStats.patterns_extracted != null && (
              <Card variant="elevated" padding="md">
                <Text variant="body-sm" color="secondary">Patterns Extracted</Text>
                <Text variant="h2" color="primary" style={{ fontFamily: 'var(--font-mono)' }}>{learningStats.patterns_extracted}</Text>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* ── SESSION BREAKDOWN — LIVE DATA ── */}
      {m && m.sessions.total > 0 && (
        <section className={`page-section ${styles.fadeIn} ${styles.delay2}`} style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-1)' }}>Session Status Breakdown</Text>
            <Text variant="body-sm" color="secondary">Agent session distribution from /agents/metrics.</Text>
          </div>
          <Card variant="elevated" padding="md">
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              {[
                { label: 'Running', count: m.sessions.running, color: '#f59e0b' },
                { label: 'Completed', count: m.sessions.completed, color: '#10b981' },
                { label: 'Failed', count: m.sessions.failed, color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%', background: item.color,
                  }} />
                  <Text variant="body-sm" color="primary">{item.label}</Text>
                  <Text variant="h4" color="primary" style={{ fontFamily: 'var(--font-mono)' }}>{item.count}</Text>
                  {m.sessions.total > 0 && (
                    <Text variant="caption" color="muted">
                      ({((item.count / m.sessions.total) * 100).toFixed(0)}%)
                    </Text>
                  )}
                  {/* Visual bar */}
                  <div style={{
                    width: Math.max(20, (item.count / Math.max(m.sessions.total, 1)) * 200),
                    height: 6,
                    borderRadius: 3,
                    background: item.color,
                    opacity: 0.7,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* ── DATA SOURCE FOOTER ── */}
      <section className={`page-section ${styles.fadeIn} ${styles.delay2}`} style={{ marginBottom: 'var(--space-6)' }}>
        <Card variant="default" padding="md" style={{ opacity: 0.7 }}>
          <Text variant="caption" color="muted" style={{ textAlign: 'center', display: 'block' }}>
            All data on this dashboard comes from live backend endpoints.
            Agent data: /api/v1/agents/metrics | Marketplace: /api/v1/marketplace/stats | Learning: /api/v1/agents/learning/stats
            <br />Auto-refreshes every 30 seconds.
          </Text>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
