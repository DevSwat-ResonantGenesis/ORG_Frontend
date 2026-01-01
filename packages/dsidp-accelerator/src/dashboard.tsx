/**
 * DSID-P Dashboard UI
 * 
 * Visual control panel for monitoring and managing:
 * - Build progress and status
 * - Cost tracking and analytics
 * - Feature flags management
 * - Plugin administration
 * - Performance metrics
 * - Security scan results
 */

import React, { useState, useEffect, useCallback } from 'react';

// ============== TYPES ==============

export interface DashboardConfig {
  refreshInterval: number;
  theme: 'light' | 'dark' | 'system';
  showCosts: boolean;
  showSecurity: boolean;
  showPerformance: boolean;
}

export interface DashboardState {
  activeTab: TabId;
  isLoading: boolean;
  error: string | null;
  data: DashboardData;
}

export type TabId = 'overview' | 'builds' | 'costs' | 'flags' | 'plugins' | 'security' | 'performance';

export interface DashboardData {
  stats: SystemStats;
  builds: BuildInfo[];
  costs: CostSummary;
  flags: FlagSummary[];
  plugins: PluginSummary[];
  security: SecuritySummary;
  performance: PerformanceSummary;
}

export interface SystemStats {
  totalBuilds: number;
  successRate: number;
  avgBuildTime: number;
  totalCost: number;
  activePlugins: number;
  securityScore: number;
}

export interface BuildInfo {
  id: string;
  name: string;
  status: 'pending' | 'building' | 'success' | 'failed';
  progress: number;
  startedAt: number;
  completedAt?: number;
  duration?: number;
  error?: string;
}

export interface CostSummary {
  today: number;
  week: number;
  month: number;
  budget: number;
  percentUsed: number;
  trend: 'up' | 'down' | 'stable';
  byProvider: Record<string, number>;
}

export interface FlagSummary {
  key: string;
  name: string;
  enabled: boolean;
  rollout: number;
}

export interface PluginSummary {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'disabled' | 'error';
}

export interface SecuritySummary {
  score: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  lastScan: number;
}

export interface PerformanceSummary {
  lighthouse: number;
  lcp: number;
  fid: number;
  cls: number;
  bundleSize: number;
}

// ============== STYLES ==============

const styles = {
  dashboard: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: 'var(--bg-primary, #f5f5f5)',
    minHeight: '100vh',
    color: 'var(--text-primary, #1a1a1a)',
  },
  header: {
    backgroundColor: 'var(--bg-secondary, #ffffff)',
    borderBottom: '1px solid var(--border, #e0e0e0)',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    padding: '0 24px',
    backgroundColor: 'var(--bg-secondary, #ffffff)',
    borderBottom: '1px solid var(--border, #e0e0e0)',
  },
  tab: {
    padding: '12px 16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-secondary, #666)',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: 'var(--primary, #0066cc)',
    borderBottomColor: 'var(--primary, #0066cc)',
    fontWeight: 500,
  },
  content: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'var(--bg-secondary, #ffffff)',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '14px',
    color: 'var(--text-secondary, #666)',
    marginBottom: '8px',
    fontWeight: 500,
  },
  cardValue: {
    fontSize: '32px',
    fontWeight: 600,
    color: 'var(--text-primary, #1a1a1a)',
  },
  cardSubtext: {
    fontSize: '12px',
    color: 'var(--text-tertiary, #999)',
    marginTop: '4px',
  },
  progressBar: {
    height: '8px',
    backgroundColor: 'var(--bg-tertiary, #e0e0e0)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 500,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px',
    borderBottom: '1px solid var(--border, #e0e0e0)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary, #666)',
    textTransform: 'uppercase' as const,
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid var(--border, #e0e0e0)',
    fontSize: '14px',
  },
  button: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  buttonPrimary: {
    backgroundColor: 'var(--primary, #0066cc)',
    color: '#ffffff',
  },
  buttonSecondary: {
    backgroundColor: 'var(--bg-tertiary, #e0e0e0)',
    color: 'var(--text-primary, #1a1a1a)',
  },
  switch: {
    position: 'relative' as const,
    width: '44px',
    height: '24px',
    backgroundColor: 'var(--bg-tertiary, #e0e0e0)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  switchActive: {
    backgroundColor: 'var(--primary, #0066cc)',
  },
  switchKnob: {
    position: 'absolute' as const,
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    transition: 'transform 0.2s',
  },
  switchKnobActive: {
    transform: 'translateX(20px)',
  },
};

// ============== COMPONENTS ==============

export const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}> = ({ title, value, subtext, trend, color }) => {
  const trendColors = { up: '#22c55e', down: '#ef4444', stable: '#666' };
  const trendIcons = { up: '↑', down: '↓', stable: '→' };

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={{ ...styles.cardValue, color: color || 'inherit' }}>{value}</div>
      {(subtext || trend) && (
        <div style={styles.cardSubtext}>
          {trend && (
            <span style={{ color: trendColors[trend], marginRight: '4px' }}>
              {trendIcons[trend]}
            </span>
          )}
          {subtext}
        </div>
      )}
    </div>
  );
};

export const ProgressCard: React.FC<{
  title: string;
  value: number;
  max: number;
  label?: string;
  color?: string;
}> = ({ title, value, max, label, color = '#0066cc' }) => {
  const percent = Math.min((value / max) * 100, 100);

  return (
    <div style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div style={styles.cardValue}>{value.toLocaleString()}</div>
      {label && <div style={styles.cardSubtext}>{label}</div>}
      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
}> = ({ children, variant }) => {
  const colors = {
    success: { bg: '#dcfce7', color: '#166534' },
    warning: { bg: '#fef3c7', color: '#92400e' },
    error: { bg: '#fee2e2', color: '#991b1b' },
    info: { bg: '#dbeafe', color: '#1e40af' },
    default: { bg: '#f3f4f6', color: '#374151' },
  };

  return (
    <span
      style={{
        ...styles.badge,
        backgroundColor: colors[variant].bg,
        color: colors[variant].color,
      }}
    >
      {children}
    </span>
  );
};

export const Toggle: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ enabled, onChange }) => {
  return (
    <div
      style={{
        ...styles.switch,
        ...(enabled ? styles.switchActive : {}),
      }}
      onClick={() => onChange(!enabled)}
    >
      <div
        style={{
          ...styles.switchKnob,
          ...(enabled ? styles.switchKnobActive : {}),
        }}
      />
    </div>
  );
};

// ============== TAB CONTENT COMPONENTS ==============

const OverviewTab: React.FC<{ data: DashboardData }> = ({ data }) => {
  return (
    <div>
      <div style={styles.grid}>
        <StatCard
          title="Total Builds"
          value={data.stats.totalBuilds}
          subtext={`${data.stats.successRate}% success rate`}
          trend="up"
        />
        <StatCard
          title="Avg Build Time"
          value={`${data.stats.avgBuildTime}s`}
          subtext="Last 7 days"
          trend="down"
        />
        <ProgressCard
          title="Monthly Cost"
          value={data.costs.month}
          max={data.costs.budget}
          label={`$${data.costs.budget} budget`}
          color={data.costs.percentUsed > 80 ? '#ef4444' : '#0066cc'}
        />
        <StatCard
          title="Security Score"
          value={`${data.stats.securityScore}/100`}
          color={data.stats.securityScore >= 80 ? '#22c55e' : '#ef4444'}
        />
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Recent Builds</h3>
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Started</th>
            </tr>
          </thead>
          <tbody>
            {data.builds.slice(0, 5).map((build) => (
              <tr key={build.id}>
                <td style={styles.td}>{build.name}</td>
                <td style={styles.td}>
                  <Badge
                    variant={
                      build.status === 'success'
                        ? 'success'
                        : build.status === 'failed'
                        ? 'error'
                        : build.status === 'building'
                        ? 'info'
                        : 'default'
                    }
                  >
                    {build.status}
                  </Badge>
                </td>
                <td style={styles.td}>{build.duration ? `${build.duration}s` : '-'}</td>
                <td style={styles.td}>{new Date(build.startedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CostsTab: React.FC<{ data: DashboardData }> = ({ data }) => {
  return (
    <div>
      <div style={styles.grid}>
        <StatCard
          title="Today"
          value={`$${data.costs.today.toFixed(2)}`}
          trend={data.costs.trend}
        />
        <StatCard
          title="This Week"
          value={`$${data.costs.week.toFixed(2)}`}
        />
        <StatCard
          title="This Month"
          value={`$${data.costs.month.toFixed(2)}`}
        />
        <ProgressCard
          title="Budget Used"
          value={Math.round(data.costs.percentUsed)}
          max={100}
          label={`${data.costs.percentUsed.toFixed(1)}%`}
          color={data.costs.percentUsed > 80 ? '#ef4444' : '#0066cc'}
        />
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Cost by Provider</h3>
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Provider</th>
              <th style={styles.th}>Cost</th>
              <th style={styles.th}>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.costs.byProvider).map(([provider, cost]) => (
              <tr key={provider}>
                <td style={styles.td}>{provider}</td>
                <td style={styles.td}>${cost.toFixed(2)}</td>
                <td style={styles.td}>
                  {((cost / data.costs.month) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FlagsTab: React.FC<{
  data: DashboardData;
  onToggle: (key: string, enabled: boolean) => void;
}> = ({ data, onToggle }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Feature Flags</h3>
        <button style={{ ...styles.button, ...styles.buttonPrimary }}>
          + New Flag
        </button>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Flag</th>
              <th style={styles.th}>Key</th>
              <th style={styles.th}>Rollout</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.flags.map((flag) => (
              <tr key={flag.key}>
                <td style={styles.td}>{flag.name}</td>
                <td style={styles.td}>
                  <code style={{ fontSize: '12px', color: '#666' }}>{flag.key}</code>
                </td>
                <td style={styles.td}>{flag.rollout}%</td>
                <td style={styles.td}>
                  <Toggle
                    enabled={flag.enabled}
                    onChange={(enabled) => onToggle(flag.key, enabled)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PluginsTab: React.FC<{ data: DashboardData }> = ({ data }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Installed Plugins</h3>
        <button style={{ ...styles.button, ...styles.buttonPrimary }}>
          Browse Plugins
        </button>
      </div>

      <div style={styles.grid}>
        {data.plugins.map((plugin) => (
          <div key={plugin.id} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{plugin.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>v{plugin.version}</div>
              </div>
              <Badge
                variant={
                  plugin.status === 'active'
                    ? 'success'
                    : plugin.status === 'error'
                    ? 'error'
                    : 'default'
                }
              >
                {plugin.status}
              </Badge>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <button style={{ ...styles.button, ...styles.buttonSecondary, flex: 1 }}>
                Configure
              </button>
              <button style={{ ...styles.button, ...styles.buttonSecondary }}>
                ⋮
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SecurityTab: React.FC<{ data: DashboardData }> = ({ data }) => {
  const { security } = data;

  return (
    <div>
      <div style={styles.grid}>
        <StatCard
          title="Security Score"
          value={`${security.score}/100`}
          color={security.score >= 80 ? '#22c55e' : security.score >= 60 ? '#f59e0b' : '#ef4444'}
        />
        <StatCard
          title="Critical Issues"
          value={security.critical}
          color={security.critical > 0 ? '#ef4444' : '#22c55e'}
        />
        <StatCard
          title="High Issues"
          value={security.high}
          color={security.high > 0 ? '#f59e0b' : '#22c55e'}
        />
        <StatCard
          title="Last Scan"
          value={new Date(security.lastScan).toLocaleDateString()}
        />
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Issues Summary</h3>
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Severity</th>
              <th style={styles.th}>Count</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}><Badge variant="error">Critical</Badge></td>
              <td style={styles.td}>{security.critical}</td>
              <td style={styles.td}>{security.critical === 0 ? '✓' : 'Action needed'}</td>
            </tr>
            <tr>
              <td style={styles.td}><Badge variant="warning">High</Badge></td>
              <td style={styles.td}>{security.high}</td>
              <td style={styles.td}>{security.high === 0 ? '✓' : 'Review recommended'}</td>
            </tr>
            <tr>
              <td style={styles.td}><Badge variant="info">Medium</Badge></td>
              <td style={styles.td}>{security.medium}</td>
              <td style={styles.td}>-</td>
            </tr>
            <tr>
              <td style={styles.td}><Badge variant="default">Low</Badge></td>
              <td style={styles.td}>{security.low}</td>
              <td style={styles.td}>-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px' }}>
        <button style={{ ...styles.button, ...styles.buttonPrimary }}>
          Run Security Scan
        </button>
      </div>
    </div>
  );
};

const PerformanceTab: React.FC<{ data: DashboardData }> = ({ data }) => {
  const { performance } = data;

  return (
    <div>
      <div style={styles.grid}>
        <StatCard
          title="Lighthouse Score"
          value={performance.lighthouse}
          color={performance.lighthouse >= 90 ? '#22c55e' : performance.lighthouse >= 50 ? '#f59e0b' : '#ef4444'}
        />
        <StatCard
          title="LCP"
          value={`${performance.lcp}ms`}
          subtext="Largest Contentful Paint"
          color={performance.lcp <= 2500 ? '#22c55e' : '#ef4444'}
        />
        <StatCard
          title="FID"
          value={`${performance.fid}ms`}
          subtext="First Input Delay"
          color={performance.fid <= 100 ? '#22c55e' : '#ef4444'}
        />
        <StatCard
          title="CLS"
          value={performance.cls.toFixed(3)}
          subtext="Cumulative Layout Shift"
          color={performance.cls <= 0.1 ? '#22c55e' : '#ef4444'}
        />
      </div>

      <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Bundle Analysis</h3>
      <div style={styles.card}>
        <StatCard
          title="Bundle Size"
          value={`${(performance.bundleSize / 1024).toFixed(1)} KB`}
          subtext="gzipped"
        />
      </div>

      <div style={{ marginTop: '16px' }}>
        <button style={{ ...styles.button, ...styles.buttonPrimary }}>
          Run Performance Audit
        </button>
      </div>
    </div>
  );
};

// ============== MAIN DASHBOARD ==============

export const Dashboard: React.FC<{
  config?: Partial<DashboardConfig>;
  onDataFetch?: () => Promise<DashboardData>;
}> = ({ config, onDataFetch }) => {
  const [state, setState] = useState<DashboardState>({
    activeTab: 'overview',
    isLoading: true,
    error: null,
    data: getDefaultData(),
  });

  const fetchData = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const data = onDataFetch ? await onDataFetch() : getDefaultData();
      setState((s) => ({ ...s, data, isLoading: false }));
    } catch (error) {
      setState((s) => ({ ...s, error: String(error), isLoading: false }));
    }
  }, [onDataFetch]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, config?.refreshInterval || 30000);
    return () => clearInterval(interval);
  }, [fetchData, config?.refreshInterval]);

  const handleFlagToggle = (key: string, enabled: boolean) => {
    setState((s) => ({
      ...s,
      data: {
        ...s.data,
        flags: s.data.flags.map((f) => (f.key === key ? { ...f, enabled } : f)),
      },
    }));
  };

  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'builds', label: 'Builds' },
    { id: 'costs', label: 'Costs' },
    { id: 'flags', label: 'Feature Flags' },
    { id: 'plugins', label: 'Plugins' },
    { id: 'security', label: 'Security' },
    { id: 'performance', label: 'Performance' },
  ];

  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'overview':
        return <OverviewTab data={state.data} />;
      case 'costs':
        return <CostsTab data={state.data} />;
      case 'flags':
        return <FlagsTab data={state.data} onToggle={handleFlagToggle} />;
      case 'plugins':
        return <PluginsTab data={state.data} />;
      case 'security':
        return <SecurityTab data={state.data} />;
      case 'performance':
        return <PerformanceTab data={state.data} />;
      default:
        return <OverviewTab data={state.data} />;
    }
  };

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          <span>⚡</span>
          DSID-P Dashboard
        </h1>
        <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={fetchData}>
          ↻ Refresh
        </button>
      </header>

      <nav style={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(state.activeTab === tab.id ? styles.tabActive : {}),
            }}
            onClick={() => setState((s) => ({ ...s, activeTab: tab.id }))}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main style={styles.content}>
        {state.isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : state.error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            Error: {state.error}
          </div>
        ) : (
          renderTabContent()
        )}
      </main>
    </div>
  );
};

// ============== DEFAULT DATA ==============

function getDefaultData(): DashboardData {
  return {
    stats: {
      totalBuilds: 142,
      successRate: 94,
      avgBuildTime: 45,
      totalCost: 127.5,
      activePlugins: 5,
      securityScore: 87,
    },
    builds: [
      { id: '1', name: 'my-app', status: 'success', progress: 100, startedAt: Date.now() - 3600000, completedAt: Date.now() - 3500000, duration: 42 },
      { id: '2', name: 'api-service', status: 'building', progress: 65, startedAt: Date.now() - 120000 },
      { id: '3', name: 'dashboard', status: 'pending', progress: 0, startedAt: Date.now() },
      { id: '4', name: 'mobile-app', status: 'failed', progress: 100, startedAt: Date.now() - 7200000, completedAt: Date.now() - 7000000, duration: 120, error: 'Build timeout' },
      { id: '5', name: 'landing-page', status: 'success', progress: 100, startedAt: Date.now() - 86400000, completedAt: Date.now() - 86300000, duration: 28 },
    ],
    costs: {
      today: 4.25,
      week: 28.75,
      month: 127.5,
      budget: 200,
      percentUsed: 63.75,
      trend: 'stable',
      byProvider: {
        OpenAI: 85.5,
        Anthropic: 32.0,
        'Local (Ollama)': 0,
        Vercel: 10.0,
      },
    },
    flags: [
      { key: 'new_editor', name: 'New Code Editor', enabled: true, rollout: 100 },
      { key: 'ai_review', name: 'AI Code Review', enabled: true, rollout: 50 },
      { key: 'voice_commands', name: 'Voice Commands', enabled: false, rollout: 0 },
      { key: 'dark_mode_v2', name: 'Dark Mode v2', enabled: true, rollout: 25 },
    ],
    plugins: [
      { id: 'prettier', name: 'Prettier', version: '3.0.0', status: 'active' },
      { id: 'eslint', name: 'ESLint', version: '8.50.0', status: 'active' },
      { id: 'tailwind', name: 'TailwindCSS', version: '3.3.0', status: 'active' },
      { id: 'storybook', name: 'Storybook', version: '7.4.0', status: 'disabled' },
    ],
    security: {
      score: 87,
      critical: 0,
      high: 2,
      medium: 5,
      low: 12,
      lastScan: Date.now() - 3600000,
    },
    performance: {
      lighthouse: 92,
      lcp: 1850,
      fid: 45,
      cls: 0.05,
      bundleSize: 245000,
    },
  };
}

// ============== EXPORTS ==============

export default Dashboard;
