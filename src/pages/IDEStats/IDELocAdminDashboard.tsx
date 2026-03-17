/**
 * IDE LOC Admin Dashboard — shows total + per-user Resonant AI coding statistics.
 * For platform owner/admin to see how much code the AI is writing across all users.
 */

import React, { useEffect, useState } from 'react';
import { getAdminLocStats, getLiveLocStats, type AdminLocStats, type LiveLocStats } from '../../api/ideLoc';

const IDELocAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminLocStats | null>(null);
  const [live, setLive] = useState<LiveLocStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadLive, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    try {
      setLoading(true);
      const [s, l] = await Promise.all([getAdminLocStats(), getLiveLocStats()]);
      setStats(s);
      setLive(l);
    } catch (e: any) {
      setError(e?.message || 'Failed to load admin stats');
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
    return <div style={styles.container}><div style={styles.loading}>Loading admin statistics...</div></div>;
  }
  if (error) {
    return <div style={styles.container}><div style={styles.error}>{error}</div></div>;
  }

  const totalLOC = (stats?.total_lines_written || 0) + (stats?.total_lines_edited || 0);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        <span style={styles.icon}>📊</span> Resonant AI — Admin LOC Dashboard
      </h1>
      <p style={styles.subtitle}>Platform-wide lines of code written by Resonant AI across all users</p>

      {/* Live counter */}
      {live && (
        <div style={styles.liveBar}>
          <div style={styles.liveItem}>
            <span style={styles.livePulse}>●</span>
            <strong>{live.total_lines_all_time.toLocaleString()}</strong> total LOC all-time
          </div>
          <div style={styles.liveItem}>
            <strong>{live.lines_today.toLocaleString()}</strong> lines today
          </div>
          <div style={styles.liveItem}>
            <strong>{live.active_users_today}</strong> active today
          </div>
          <div style={styles.liveItem}>
            <strong>{live.total_users}</strong> total users
          </div>
        </div>
      )}

      {/* Platform KPI Cards */}
      <div style={styles.grid}>
        <KPICard label="Total Lines Written" value={stats?.total_lines_written || 0} color="#10B981" />
        <KPICard label="Total Lines Edited" value={stats?.total_lines_edited || 0} color="#3B82F6" />
        <KPICard label="Total Net Lines" value={stats?.total_net_lines || 0} color="#8B5CF6" />
        <KPICard label="Combined LOC" value={totalLOC} color="#F59E0B" />
        <KPICard label="Total Tool Calls" value={stats?.total_tool_calls || 0} color="#F97316" />
        <KPICard label="Total Users" value={stats?.total_users || 0} color="#EC4899" />
      </div>

      {/* Per-User Table */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Per-User Statistics</h2>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.thNum}>Written</th>
                <th style={styles.thNum}>Edited</th>
                <th style={styles.thNum}>Net</th>
                <th style={styles.thNum}>Files Created</th>
                <th style={styles.thNum}>Files Modified</th>
                <th style={styles.thNum}>Tool Calls</th>
                <th style={styles.thNum}>Sessions</th>
                <th style={styles.th}>Languages</th>
                <th style={styles.th}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.users || []).map((user, i) => {
                const topLangs = Object.entries(user.languages || {})
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .slice(0, 3)
                  .map(([lang]) => lang)
                  .join(', ');
                return (
                  <tr key={user.user_id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <strong>{user.user_email || user.user_id}</strong>
                      </div>
                    </td>
                    <td style={styles.tdNum}>{user.total_lines_written.toLocaleString()}</td>
                    <td style={styles.tdNum}>{user.total_lines_edited.toLocaleString()}</td>
                    <td style={styles.tdNum}>{user.total_net_lines.toLocaleString()}</td>
                    <td style={styles.tdNum}>{user.total_files_created.toLocaleString()}</td>
                    <td style={styles.tdNum}>{user.total_files_modified.toLocaleString()}</td>
                    <td style={styles.tdNum}>{user.total_tool_calls.toLocaleString()}</td>
                    <td style={styles.tdNum}>{user.sessions}</td>
                    <td style={styles.td}><span style={styles.langTag}>{topLangs || '—'}</span></td>
                    <td style={styles.td}>{user.last_active ? new Date(user.last_active).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
              {(stats?.users || []).length === 0 && (
                <tr><td colSpan={10} style={styles.emptyRow}>No users have used Resonant AI yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  title: { fontSize: 28, fontWeight: 700, color: '#F8FAFC', margin: '0 0 4px 0' },
  icon: { marginRight: 8 },
  subtitle: { fontSize: 14, color: '#94A3B8', margin: '0 0 24px 0' },
  loading: { color: '#94A3B8', textAlign: 'center', padding: 60 },
  error: { color: '#EF4444', textAlign: 'center', padding: 60 },

  liveBar: { display: 'flex', gap: 24, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '12px 20px', marginBottom: 24, fontSize: 14, color: '#D1D5DB', flexWrap: 'wrap' as const },
  liveItem: { display: 'flex', alignItems: 'center', gap: 6 },
  livePulse: { color: '#10B981', fontSize: 10 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 },
  card: { background: '#1E293B', borderRadius: 8, padding: '16px 14px', textAlign: 'center' as const },
  cardValue: { fontSize: 24, fontWeight: 700, marginBottom: 4 },
  cardLabel: { fontSize: 12, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: '#E2E8F0', marginBottom: 16 },

  tableWrapper: { overflowX: 'auto' as const, borderRadius: 8, border: '1px solid #334155' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 },
  th: { textAlign: 'left' as const, padding: '10px 12px', background: '#1E293B', color: '#94A3B8', fontWeight: 600, borderBottom: '1px solid #334155', whiteSpace: 'nowrap' as const },
  thNum: { textAlign: 'right' as const, padding: '10px 12px', background: '#1E293B', color: '#94A3B8', fontWeight: 600, borderBottom: '1px solid #334155', whiteSpace: 'nowrap' as const },
  td: { padding: '10px 12px', color: '#E2E8F0', borderBottom: '1px solid #1E293B' },
  tdNum: { padding: '10px 12px', color: '#E2E8F0', borderBottom: '1px solid #1E293B', textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums' },
  trEven: { background: '#0F172A' },
  trOdd: { background: '#1E293B20' },
  userCell: { display: 'flex', flexDirection: 'column' as const },
  langTag: { fontSize: 11, color: '#94A3B8' },
  emptyRow: { padding: 32, textAlign: 'center' as const, color: '#64748B' },
};

export default IDELocAdminDashboard;
