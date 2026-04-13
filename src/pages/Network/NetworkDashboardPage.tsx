/**
 * Network Dashboard — Live monitoring of mining, token transactions,
 * blockchain activity, and model training.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  Coins,
  Users,
  Blocks,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  Database,
  BarChart3,
} from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { ENV } from '../../config/env';
import { isAuthenticated } from '@/utils/auth-cookies';

const API_BASE = ENV.apiUrl;

// ─── Types ───
interface BlockchainData {
  status: {
    chain_height?: number;
    node_count?: number;
    consensus?: string;
  };
  latest_block: {
    block_number?: number;
    block_hash?: string;
    timestamp?: number;
    tx_count?: number;
  };
  integrity: {
    valid?: boolean;
    blocks_checked?: number;
  };
}

interface LighthouseData {
  peers: Array<{
    peer_id: string;
    peer_type: string;
    address: string;
    status?: string;
  }>;
  peer_count: number;
  stats: Record<string, unknown>;
}

interface DashboardPayload {
  blockchain: BlockchainData;
  lighthouse: LighthouseData;
}

interface TokenTransaction {
  id: string;
  tx_type: string;
  amount: string;
  fee: string;
  net_amount: string;
  currency: string;
  status: string;
  description?: string;
  created_at: string;
}

interface PublicTokenStats {
  total_supply: string;
  circulating_supply: string;
  locked_supply: string;
  current_price_usd: string;
  market_cap_usd: string;
}

interface RecentBlock {
  block_number?: number;
  block_hash?: string;
  timestamp?: number;
  tx_count?: number;
}

// ─── Helpers ───
const fmt = (n: number | undefined) => {
  if (n === undefined || n === null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

const timeAgo = (ts: string) => {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};

const txIcon = (type: string) => {
  if (type === 'reward' || type === 'deposit' || type === 'sale')
    return <ArrowDownLeft size={14} style={{ color: '#71C23E' }} />;
  return <ArrowUpRight size={14} style={{ color: '#FA547C' }} />;
};

const statusBadge = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    completed: { bg: 'rgba(113,194,62,0.15)', color: '#71C23E' },
    pending: { bg: 'rgba(250,165,37,0.15)', color: '#FAA525' },
    processing: { bg: 'rgba(1,166,188,0.15)', color: '#01A6BC' },
    failed: { bg: 'rgba(250,84,124,0.15)', color: '#FA547C' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '2px 8px',
      borderRadius: 6, background: s.bg, color: s.color,
    }}>
      {status}
    </span>
  );
};

// ─── Component ───
const NetworkDashboardPage: React.FC = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState<DashboardPayload | null>(null);
  const [tokenStats, setTokenStats] = useState<PublicTokenStats | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<RecentBlock[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      // Public endpoints — no auth required
      const fetches: Promise<any>[] = [
        fetch(`${API_BASE}/mining/dashboard/data`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/crypto/token/stats`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/mining/dashboard/blocks?limit=5`).then(r => r.ok ? r.json() : null),
      ];
      // If logged in, also fetch user's transactions
      if (isAuthenticated()) {
        fetches.push(
          fetch(`${API_BASE}/crypto/transactions?limit=20`, { credentials: 'include' }).then(r => r.ok ? r.json() : [])
        );
      }
      const results = await Promise.allSettled(fetches);
      if (results[0].status === 'fulfilled' && results[0].value) setDashData(results[0].value);
      if (results[1].status === 'fulfilled' && results[1].value) setTokenStats(results[1].value);
      if (results[2].status === 'fulfilled' && results[2].value) setRecentBlocks(results[2].value?.blocks || []);
      if (results.length > 3 && results[3].status === 'fulfilled') {
        const txData = results[3].value;
        setTransactions(Array.isArray(txData) ? txData : []);
      }
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Network dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchAll, 8000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchAll]);

  // ─── Styles ───
  const colors = {
    bg: isDark ? '#121214' : '#f8f9fa',
    card: isDark ? '#1a1a1e' : '#ffffff',
    cardBorder: isDark ? '#2a2a2e' : '#e5e7eb',
    text: isDark ? '#ffffff' : '#111827',
    textMuted: isDark ? '#a0a0a8' : '#6b7280',
    accent: '#01A6BC',
    pink: '#FA547C',
    green: '#71C23E',
    orange: '#FAA525',
    yellow: '#FFD800',
  };

  const cardStyle: React.CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: 12,
    padding: 20,
  };

  const blockchain = dashData?.blockchain;
  const lighthouse = dashData?.lighthouse;

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1280, margin: '0 auto', color: colors.text }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={28} style={{ color: colors.accent }} />
            RGT Network Explorer
          </h1>
          <p style={{ color: colors.textMuted, fontSize: 14, margin: '4px 0 0' }}>
            Blockchain, token economy &amp; network activity
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastUpdate && (
            <span style={{ fontSize: 12, color: colors.textMuted }}>
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              background: autoRefresh ? 'rgba(1,166,188,0.15)' : 'transparent',
              border: `1px solid ${autoRefresh ? colors.accent : colors.cardBorder}`,
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              color: autoRefresh ? colors.accent : colors.textMuted,
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {autoRefresh ? <Wifi size={14} /> : <WifiOff size={14} />}
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={fetchAll}
            style={{
              background: 'transparent', border: `1px solid ${colors.cardBorder}`,
              borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
              color: colors.textMuted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: colors.textMuted }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px', display: 'block' }} />
          Loading network data...
        </div>
      ) : (
        <>
          {/* ─── Top Stats (public only) ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { icon: <Blocks size={20} />, label: 'Chain Height', value: fmt(blockchain?.status?.chain_height), color: colors.pink },
              { icon: <Database size={20} />, label: 'Network Peers', value: fmt(lighthouse?.peer_count), color: colors.accent },
              { icon: <Users size={20} />, label: 'Active Nodes', value: fmt(blockchain?.status?.node_count), color: colors.green },
            ].map((stat, i) => (
              <div key={i} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${stat.color}18`, color: stat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Blockchain Integrity ─── */}
          {blockchain?.integrity && (
            <div style={{
              ...cardStyle, marginBottom: 24,
              background: blockchain.integrity.valid ? (isDark ? 'rgba(113,194,62,0.06)' : 'rgba(113,194,62,0.08)') : (isDark ? 'rgba(250,84,124,0.06)' : 'rgba(250,84,124,0.08)'),
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {blockchain.integrity.valid
                ? <CheckCircle size={18} style={{ color: colors.green }} />
                : <XCircle size={18} style={{ color: colors.pink }} />}
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Chain integrity: {blockchain.integrity.valid ? 'Valid' : 'Invalid'}
                {blockchain.integrity.blocks_checked ? ` (${blockchain.integrity.blocks_checked} blocks verified)` : ''}
              </span>
            </div>
          )}

          {/* ─── Peers + Latest Block ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Network Peers */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} style={{ color: colors.accent }} />
                Network Peers ({lighthouse?.peer_count || 0})
              </h3>
              {lighthouse?.peers && lighthouse.peers.length > 0 ? (
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {lighthouse.peers.slice(0, 10).map((peer, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 10px', borderRadius: 6,
                      background: i % 2 === 0 ? (isDark ? '#222226' : '#f9fafb') : 'transparent',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{peer.peer_id.slice(0, 20)}</div>
                        <div style={{ fontSize: 11, color: colors.textMuted }}>{peer.peer_type} — {peer.address}</div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                        background: 'rgba(113,194,62,0.15)', color: colors.green,
                      }}>
                        {peer.status || 'active'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: colors.textMuted, fontSize: 13, padding: 16, textAlign: 'center' }}>
                  No peers discovered yet
                </div>
              )}
            </div>

            {/* Latest Block + Recent Blocks */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Blocks size={18} style={{ color: colors.pink }} />
                Latest Block
              </h3>
              {blockchain?.latest_block?.block_number ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Block #', value: `${blockchain.latest_block.block_number}` },
                    { label: 'Transactions', value: fmt(blockchain.latest_block.tx_count) },
                    { label: 'Hash', value: blockchain.latest_block.block_hash?.slice(0, 16) + '...' || '—' },
                    { label: 'Timestamp', value: blockchain.latest_block.timestamp ? new Date(blockchain.latest_block.timestamp * 1000).toLocaleTimeString() : '—' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: isDark ? '#222226' : '#f3f4f6' }}>
                      <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'monospace' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: colors.textMuted, fontSize: 13, padding: 16, textAlign: 'center' }}>
                  No blocks available
                </div>
              )}
              {/* Recent Blocks List */}
              {recentBlocks.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 8 }}>Recent Blocks</div>
                  {recentBlocks.map((blk, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 10px', borderRadius: 6, fontSize: 12,
                      background: i % 2 === 0 ? (isDark ? '#222226' : '#f9fafb') : 'transparent',
                    }}>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{blk.block_number}</span>
                      <span style={{ color: colors.textMuted }}>{blk.tx_count || 0} txs</span>
                      <span style={{ color: colors.textMuted, fontFamily: 'monospace', fontSize: 11 }}>
                        {blk.block_hash?.slice(0, 12)}...
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Token Economy (Public) ─── */}
          {tokenStats && (
            <div style={{ ...cardStyle, marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={18} style={{ color: colors.yellow }} />
                RGT Token Economy
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                {[
                  { label: 'Token Price', value: `$${parseFloat(tokenStats.current_price_usd || '0').toFixed(4)}`, color: colors.green },
                  { label: 'Market Cap', value: `$${fmt(parseFloat(tokenStats.market_cap_usd || '0'))}`, color: colors.accent },
                  { label: 'Circulating Supply', value: fmt(parseFloat(tokenStats.circulating_supply || '0')), color: colors.orange },
                  { label: 'Total Supply', value: fmt(parseFloat(tokenStats.total_supply || '0')), color: colors.yellow },
                  { label: 'Locked Supply', value: fmt(parseFloat(tokenStats.locked_supply || '0')), color: colors.pink },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 8, background: isDark ? '#222226' : '#f3f4f6' }}>
                    <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Your Transactions (logged-in) or Login CTA (guest) ─── */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Coins size={18} style={{ color: colors.yellow }} />
              {isAuthenticated() ? 'Your Recent Transactions' : 'Token Transactions'}
            </h3>
            {!isAuthenticated() ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <p style={{ color: colors.textMuted, fontSize: 14, margin: '0 0 16px' }}>
                  Sign in to view your personal mining rewards, token transactions, and wallet activity.
                </p>
                <a href="/login" style={{
                  display: 'inline-block', padding: '10px 28px', borderRadius: 8,
                  background: colors.accent, color: '#fff', fontWeight: 600, fontSize: 14,
                  textDecoration: 'none',
                }}>Sign In</a>
                <span style={{ margin: '0 12px', color: colors.textMuted }}>or</span>
                <a href="/wallet" style={{
                  display: 'inline-block', padding: '10px 28px', borderRadius: 8,
                  border: `1px solid ${colors.cardBorder}`, color: colors.text, fontWeight: 600, fontSize: 14,
                  textDecoration: 'none',
                }}>Open Wallet</a>
              </div>
            ) : transactions.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.cardBorder}` }}>
                      {['Type', 'Amount', 'Fee', 'Status', 'Description', 'Time'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: colors.textMuted, fontSize: 11 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, i) => (
                      <tr key={tx.id || i} style={{ borderBottom: `1px solid ${colors.cardBorder}22` }}>
                        <td style={{ padding: '10px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {txIcon(tx.tx_type)}
                          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{tx.tx_type}</span>
                        </td>
                        <td style={{ padding: '10px 10px', fontWeight: 600, fontFamily: 'monospace' }}>
                          {parseFloat(tx.amount || '0').toFixed(2)} RGT
                        </td>
                        <td style={{ padding: '10px 10px', color: colors.textMuted, fontFamily: 'monospace' }}>
                          {parseFloat(tx.fee || '0').toFixed(4)}
                        </td>
                        <td style={{ padding: '10px 10px' }}>{statusBadge(tx.status)}</td>
                        <td style={{ padding: '10px 10px', color: colors.textMuted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tx.description || '—'}
                        </td>
                        <td style={{ padding: '10px 10px', color: colors.textMuted, whiteSpace: 'nowrap' }}>
                          <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                          {tx.created_at ? timeAgo(tx.created_at) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <a href="/wallet" style={{ color: colors.accent, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                    View full wallet &rarr;
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ color: colors.textMuted, fontSize: 13, padding: 24, textAlign: 'center' }}>
                No recent transactions — <a href="/wallet" style={{ color: colors.accent, textDecoration: 'none' }}>open wallet</a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NetworkDashboardPage;
