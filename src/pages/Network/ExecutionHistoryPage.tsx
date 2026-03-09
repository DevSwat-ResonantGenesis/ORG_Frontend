import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Zap,
  Hash,
  User,
  Calendar,
  Timer,
  Activity,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { isAuthenticated } from '../../utils/auth-cookies';
import { useThemeStore } from '@/store/themeStore';

interface ExecutionRecord {
  id: string;
  manifest_hash: string;
  agent_name: string;
  user_dsid: string;
  success: boolean;
  duration_ms: number;
  timestamp: string;
  input_preview: string;
  output_preview: string;
  governance_decision: string;
  type: 'agent' | 'workflow';
  workflow_id?: string;
}

const getStyles = (isLight: boolean): Record<string, React.CSSProperties> => ({
  container: {
    height: '100%',
    maxHeight: 'calc(100vh - 56px)',
    background: isLight ? '#ffffff' : 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    color: isLight ? '#1D1D1F' : '#fff',
    padding: '0.5rem 1rem',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  header: {
    marginBottom: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  subtitle: {
    color: isLight ? '#6b7280' : '#666',
    fontSize: '0.7rem',
  },
  statsGrid: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  statCard: {
    background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
    border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statLabel: {
    fontSize: '0.65rem',
    color: isLight ? '#6b7280' : '#666',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  statValue: {
    fontSize: '1rem',
    fontWeight: '600',
  },
  statChange: {
    display: 'none',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  filterBar: {
    display: 'flex',
    gap: '0.25rem',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
    border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    color: isLight ? '#4b5563' : '#888',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
  filterButtonActive: {
    background: 'rgba(99,102,241,0.15)',
    borderColor: 'rgba(99,102,241,0.2)',
    color: '#6366f1',
  },
  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
    border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    color: isLight ? '#4b5563' : '#888',
    fontSize: '0.7rem',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '0.4rem 0.5rem',
    borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
    color: isLight ? '#6b7280' : '#666',
    fontSize: '0.65rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  td: {
    padding: '0.5rem',
    borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
    fontSize: '0.75rem',
    color: isLight ? '#374151' : '#ccc',
  },
  row: {
    transition: 'background 0.2s',
    cursor: 'pointer',
    background: isLight ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.02)',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
    padding: '0.15rem 0.35rem',
    borderRadius: '3px',
    fontSize: '0.65rem',
    fontWeight: '500',
  },
  successBadge: {
    background: 'rgba(16,185,129,0.2)',
    color: '#10b981',
  },
  errorBadge: {
    background: 'rgba(239,68,68,0.2)',
    color: '#ef4444',
  },
  hashCell: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: isLight ? '#6b7280' : '#888',
  },
  expandedRow: {
    background: 'rgba(99,102,241,0.05)',
    borderLeft: '3px solid #6366f1',
  },
  expandedContent: {
    padding: '1rem',
    background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.2)',
  },
  codeBlock: {
    background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.3)',
    padding: '0.75rem',
    borderRadius: '6px',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#10b981',
    maxHeight: '150px',
    overflow: 'auto',
    marginTop: '0.5rem',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '2rem 1rem',
    color: isLight ? '#6b7280' : '#666',
    fontSize: '0.8rem',
  },
  chart: {
    background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
    border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '0.5rem 1rem',
    marginBottom: '0.5rem',
  },
  chartTitle: {
    fontSize: '0.7rem',
    fontWeight: '500',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: isLight ? '#6b7280' : '#888',
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '3px',
    height: '50px',
  },
  chartBar: {
    flex: 1,
    background: '#6366f1',
    borderRadius: '2px 2px 0 0',
    minHeight: '6px',
  },
  chartLabels: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  chartLabel: {
    flex: 1,
    textAlign: 'center' as const,
    fontSize: '0.65rem',
    color: isLight ? '#6b7280' : '#666',
  },
});

import { ENV } from '../../config/env';

// API base URL for node service
const NODE_API_BASE = ENV.nodeApiUrl;

// Fetch real execution history from backend
async function fetchExecutionHistory(): Promise<{ executions: ExecutionRecord[]; stats: any }> {
  try {
    const response = await fetch(`${NODE_API_BASE}/executions/history?limit=50`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    
    // Map backend data to frontend format
    const executions: ExecutionRecord[] = (data.executions || []).map((e: any) => ({
      id: e.id,
      manifest_hash: e.manifest_hash,
      agent_name: e.agent_name,
      user_dsid: e.user_dsid,
      success: e.success,
      duration_ms: e.duration_ms,
      timestamp: e.timestamp,
      input_preview: e.input_preview || '{}',
      output_preview: e.output_preview || '{}',
      governance_decision: e.governance_decision,
      type: e.type || 'agent',
      workflow_id: e.workflow_id,
    }));
    
    return { executions, stats: data.stats || {} };
  } catch (error) {
    console.error('Failed to fetch execution history:', error);
    return { executions: [], stats: {} };
  }
}

export default function ExecutionHistoryPage() {
  const navigate = useNavigate();
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'agent' | 'workflow'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const styles = getStyles(isLight);

  // Redirect to signup if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const { executions: history } = await fetchExecutionHistory();
      setExecutions(history);
    } catch (error) {
      console.error('Failed to load history:', error);
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredExecutions = executions.filter(e => {
    if (filter === 'success' && !e.success) return false;
    if (filter === 'failed' && e.success) return false;
    if (typeFilter === 'agent' && e.type !== 'agent') return false;
    if (typeFilter === 'workflow' && e.type !== 'workflow') return false;
    return true;
  });

  const stats = {
    total: executions.length,
    successful: executions.filter(e => e.success).length,
    failed: executions.filter(e => !e.success).length,
    avgDuration: Math.round(executions.reduce((a, e) => a + e.duration_ms, 0) / (executions.length || 1)),
  };

  const successRate = stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 0;

  // Generate chart data (last 12 hours)
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const hourAgo = new Date(Date.now() - (11 - i) * 60 * 60 * 1000);
    const hourEnd = new Date(Date.now() - (10 - i) * 60 * 60 * 1000);
    const count = executions.filter(e => {
      const t = new Date(e.timestamp);
      return t >= hourAgo && t < hourEnd;
    }).length;
    return { hour: hourAgo.getHours(), count };
  });
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div style={styles.container}>
      {/* Compact Header with Stats */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="#6366f1" />
          <span style={styles.title}>Executions</span>
          <span style={styles.subtitle}>• {stats.total} total</span>
        </div>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <CheckCircle size={12} color="#10b981" />
            <span style={{ ...styles.statValue, color: '#10b981', fontSize: '0.85rem' }}>{successRate}%</span>
          </div>
          <div style={styles.statCard}>
            <XCircle size={12} color="#ef4444" />
            <span style={{ ...styles.statValue, color: '#ef4444', fontSize: '0.85rem' }}>{stats.failed}</span>
          </div>
          <div style={styles.statCard}>
            <Timer size={12} color="#888" />
            <span style={{ ...styles.statValue, color: '#888', fontSize: '0.85rem' }}>{stats.avgDuration}ms</span>
          </div>
        </div>
      </div>

      {/* Mini Activity Chart */}
      <div style={styles.chart}>
        <div style={styles.chartBars}>
          {chartData.map((d, i) => (
            <div
              key={i}
              style={{
                ...styles.chartBar,
                height: `${(d.count / maxCount) * 100}%`,
                opacity: d.count > 0 ? 1 : 0.2,
              }}
              title={`${d.hour}:00 - ${d.count} exec`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.filterBar}>
          <button
            style={{
              ...styles.filterButton,
              ...(filter === 'all' ? styles.filterButtonActive : {}),
            }}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            style={{
              ...styles.filterButton,
              ...(filter === 'success' ? styles.filterButtonActive : {}),
            }}
            onClick={() => setFilter('success')}
          >
            <CheckCircle size={14} />
            Success
          </button>
          <button
            style={{
              ...styles.filterButton,
              ...(filter === 'failed' ? styles.filterButtonActive : {}),
            }}
            onClick={() => setFilter('failed')}
          >
            <XCircle size={14} />
            Failed
          </button>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
          <button
            style={{
              ...styles.filterButton,
              ...(typeFilter === 'agent' ? styles.filterButtonActive : {}),
            }}
            onClick={() => setTypeFilter(typeFilter === 'agent' ? 'all' : 'agent')}
          >
            <Zap size={14} />
            Agents
          </button>
          <button
            style={{
              ...styles.filterButton,
              ...(typeFilter === 'workflow' ? styles.filterButtonActive : {}),
            }}
            onClick={() => setTypeFilter(typeFilter === 'workflow' ? 'all' : 'workflow')}
          >
            <TrendingUp size={14} />
            Workflows
          </button>
        </div>
        <button style={styles.refreshButton} onClick={loadHistory}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={styles.emptyState}>Loading execution history...</div>
      ) : filteredExecutions.length === 0 ? (
        <div style={styles.emptyState}>No executions found</div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Agent / Workflow</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {filteredExecutions.map((exec) => (
              <React.Fragment key={exec.id}>
                <tr
                  style={{
                    ...styles.row,
                    ...(expandedId === exec.id ? styles.expandedRow : {}),
                  }}
                  onClick={() => setExpandedId(expandedId === exec.id ? null : exec.id)}
                >
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(exec.success ? styles.successBadge : styles.errorBadge),
                      }}
                    >
                      {exec.success ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {exec.success ? 'Success' : 'Failed'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {exec.type === 'workflow' ? (
                        <TrendingUp size={14} color="#8b5cf6" />
                      ) : (
                        <Zap size={14} color="#6366f1" />
                      )}
                      <div>
                        <div style={{ fontWeight: '500' }}>{exec.agent_name}</div>
                        <div style={styles.hashCell}>
                          {exec.manifest_hash.slice(0, 16)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: exec.duration_ms > 200 ? '#fbbf24' : '#10b981' }}>
                      {exec.duration_ms}ms
                    </span>
                  </td>
                  <td style={{ ...styles.td, ...styles.hashCell }}>
                    {exec.user_dsid.slice(0, 20)}...
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '0.8rem' }}>
                      {new Date(exec.timestamp).toLocaleTimeString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>
                      {new Date(exec.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {expandedId === exec.id ? (
                      <ChevronDown size={16} color="#888" />
                    ) : (
                      <ChevronRight size={16} color="#888" />
                    )}
                  </td>
                </tr>
                {expandedId === exec.id && (
                  <tr>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <div style={styles.expandedContent}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
                              Input
                            </div>
                            <pre style={styles.codeBlock}>{exec.input_preview}</pre>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
                              Output
                            </div>
                            <pre style={styles.codeBlock}>{exec.output_preview}</pre>
                          </div>
                        </div>
                        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#888' }}>
                          <strong>Governance:</strong> {exec.governance_decision} |{' '}
                          <strong>Execution ID:</strong> {exec.id}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
