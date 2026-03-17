/**
 * IDE LOC Dashboard — shows user's personal Resonant AI coding statistics.
 * Lines written, edited, deleted, languages breakdown, daily chart.
 */

import React, { useEffect, useState } from 'react';
import { getMyLocStats, getLiveLocStats, type UserLocStats, type LiveLocStats } from '../../api/ideLoc';

const IDELocDashboard: React.FC = () => {
  const [stats, setStats] = useState<UserLocStats | null>(null);
  const [live, setLive] = useState<LiveLocStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadLive, 10000); // refresh live counter every 10s
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const [s, l] = await Promise.all([getMyLocStats(), getLiveLocStats()]);
      setStats(s);
      setLive(l);
    } catch (e: any) {
      setError(e?.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }

  async function loadLive() {
    try {
      const l = await getLiveLocStats();
      setLive(l);
    } catch { /* silent */ }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading Resonant AI statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  const totalLines = (stats?.total_lines_written || 0) + (stats?.total_lines_edited || 0);
  const languages = Object.entries(stats?.languages || {}).sort((a, b) => (b[1] as number) - (a[1] as number)) as [string, number][];
  const dailyStats = (stats?.daily_stats || []).slice(0, 14).reverse();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        <span style={styles.icon}>⚡</span> Resonant AI — Code Statistics
      </h1>
      <p style={styles.subtitle}>Lines of code written by your AI assistant</p>

      {/* Live counter */}
      {live && (
        <div style={styles.liveBar}>
          <div style={styles.liveItem}>
            <span style={styles.livePulse}>●</span>
            <strong>{live.total_lines_all_time.toLocaleString()}</strong> total LOC platform-wide
          </div>
          <div style={styles.liveItem}>
            <strong>{live.lines_today.toLocaleString()}</strong> lines today
          </div>
          <div style={styles.liveItem}>
            <strong>{live.active_users_today}</strong> active users today
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={styles.grid}>
        <KPICard label="Lines Written" value={stats?.total_lines_written || 0} color="#10B981" />
        <KPICard label="Lines Edited" value={stats?.total_lines_edited || 0} color="#3B82F6" />
        <KPICard label="Net Lines" value={stats?.total_net_lines || 0} color="#8B5CF6" />
        <KPICard label="Total LOC" value={totalLines} color="#F59E0B" />
        <KPICard label="Files Created" value={stats?.total_files_created || 0} color="#EC4899" />
        <KPICard label="Files Modified" value={stats?.total_files_modified || 0} color="#06B6D4" />
        <KPICard label="Tool Calls" value={stats?.total_tool_calls || 0} color="#F97316" />
        <KPICard label="Sessions" value={stats?.sessions || 0} color="#64748B" />
      </div>

      {/* Daily Chart (simple bar chart) */}
      {dailyStats.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Daily Activity (Last 14 Days)</h2>
          <div style={styles.chartContainer}>
            {dailyStats.map((d, i) => {
              const maxVal = Math.max(...dailyStats.map(x => x.lines_written + x.lines_edited), 1);
              const height = Math.max(((d.lines_written + d.lines_edited) / maxVal) * 120, 2);
              return (
                <div key={i} style={styles.barCol}>
                  <div style={styles.barValue}>{d.lines_written + d.lines_edited}</div>
                  <div style={{ ...styles.bar, height, background: `linear-gradient(180deg, #10B981, #3B82F6)` }} />
                  <div style={styles.barLabel}>{d.date.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Languages</h2>
          <div style={styles.langGrid}>
            {languages.map(([lang, count]) => {
              const maxLang = (languages[0]?.[1] as number) || 1;
              const pct = (count / maxLang) * 100;
              return (
                <div key={lang} style={styles.langRow}>
                  <div style={styles.langName}>{lang}</div>
                  <div style={styles.langBarOuter}>
                    <div style={{ ...styles.langBarInner, width: `${pct}%` }} />
                  </div>
                  <div style={styles.langCount}>{count.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {stats?.last_active && (
        <p style={styles.footer}>
          Last active: {new Date(stats.last_active).toLocaleString()}
        </p>
      )}
    </div>
  );
};

const KPICard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{ ...styles.card, borderTop: `3px solid ${color}` }}>
    <div style={{ ...styles.cardValue, color }}>{value.toLocaleString()}</div>
    <div style={styles.cardLabel}>{label}</div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  title: { fontSize: 28, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px 0' },
  icon: { marginRight: 8 },
  subtitle: { fontSize: 14, color: '#94A3B8', margin: '0 0 24px 0' },
  loading: { color: '#94A3B8', textAlign: 'center', padding: 60 },
  error: { color: '#EF4444', textAlign: 'center', padding: 60 },

  liveBar: { display: 'flex', gap: 24, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '12px 20px', marginBottom: 24, fontSize: 14, color: '#D1D5DB', flexWrap: 'wrap' as const },
  liveItem: { display: 'flex', alignItems: 'center', gap: 6 },
  livePulse: { color: '#10B981', fontSize: 10, animation: 'pulse 2s infinite' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 32 },
  card: { background: '#1E293B', borderRadius: 8, padding: '16px 14px', textAlign: 'center' as const },
  cardValue: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  cardLabel: { fontSize: 12, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 16 },

  chartContainer: { display: 'flex', alignItems: 'flex-end', gap: 8, padding: '12px 0', minHeight: 160 },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4 },
  bar: { width: '100%', maxWidth: 40, borderRadius: '4px 4px 0 0', transition: 'height 0.3s' },
  barValue: { fontSize: 10, color: '#94A3B8' },
  barLabel: { fontSize: 10, color: '#64748B' },

  langGrid: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  langRow: { display: 'flex', alignItems: 'center', gap: 12 },
  langName: { width: 100, fontSize: 13, color: '#E2E8F0', fontWeight: 500 },
  langBarOuter: { flex: 1, height: 8, background: '#1E293B', borderRadius: 4, overflow: 'hidden' as const },
  langBarInner: { height: '100%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', borderRadius: 4, transition: 'width 0.3s' },
  langCount: { width: 60, textAlign: 'right' as const, fontSize: 13, color: '#94A3B8' },

  footer: { fontSize: 12, color: '#64748B', marginTop: 24, textAlign: 'center' as const },
};

export default IDELocDashboard;
