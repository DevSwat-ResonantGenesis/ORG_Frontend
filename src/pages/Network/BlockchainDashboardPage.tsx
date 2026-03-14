import React, { useState, useEffect, useCallback } from 'react';
import {
  Blocks,
  Activity,
  Hash,
  Clock,
  RefreshCw,
  CheckCircle,
  Shield,
  Cpu,
  Database,
  ExternalLink,
  Zap,
  Link2,
} from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { ENV } from '../../config/env';

const API_BASE = ENV.apiUrl;

interface ChainStats {
  chain_id: string;
  latest_block: number;
  latest_block_hash: string;
  total_transactions: number;
  pending_transactions: number;
}

interface BlockData {
  block_number: number;
  block_hash: string;
  previous_block_hash: string | null;
  merkle_root: string;
  transaction_count: number;
  timestamp: string;
  validator: string;
}

const CONTRACT_ADDRESSES = {
  MemoryAnchors: '0xBCbBdeE15bFAb4e318dADec0958681b755A3d85d',
  AgentRegistry: '0xFbDe0CAf20f3ED1daE9930729De1DC868e38D579',
  IdentityRegistry: '0x84198e568D0F7E92769c11E0Cb047857662b3dF5',
};

const BASESCAN_BASE = 'https://sepolia.basescan.org';

const BlockchainDashboardPage: React.FC = () => {
  const isLight = useThemeStore((s) => s.theme === 'light');
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [latestBlock, setLatestBlock] = useState<BlockData | null>(null);
  const [health, setHealth] = useState<{ status: string; miner: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [recentBlocks, setRecentBlocks] = useState<BlockData[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, blockRes, healthRes] = await Promise.allSettled([
        fetch(`${API_BASE}/blockchain/chain/stats`).then((r) => r.json()),
        fetch(`${API_BASE}/blockchain/blocks/latest`).then((r) => r.json()),
        fetch(`${API_BASE}/blockchain/health`).then((r) => r.json()),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (blockRes.status === 'fulfilled') setLatestBlock(blockRes.value);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);

      if (statsRes.status === 'fulfilled' && statsRes.value.latest_block > 0) {
        const blockNum = statsRes.value.latest_block;
        const blockPromises = [];
        for (let i = blockNum; i >= Math.max(0, blockNum - 9); i--) {
          blockPromises.push(
            fetch(`${API_BASE}/blockchain/blocks/${i}`)
              .then((r) => (r.ok ? r.json() : null))
              .catch(() => null)
          );
        }
        const blocks = (await Promise.all(blockPromises)).filter(Boolean);
        setRecentBlocks(blocks);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to fetch blockchain data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const bg = isLight ? '#ffffff' : '#0a0a0f';
  const cardBg = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)';
  const border = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  const textPrimary = isLight ? '#1D1D1F' : '#ffffff';
  const textSecondary = isLight ? '#6b7280' : '#888';
  const accent = '#8b5cf6';
  const green = '#22c55e';
  const blue = '#3b82f6';
  const orange = '#f59e0b';

  const truncHash = (h: string | null) => (h ? h.slice(0, 10) + '...' + h.slice(-8) : '\u2014');
  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  return (
    <div
      style={{
        height: '100%',
        maxHeight: 'calc(100vh - 56px)',
        background: isLight ? bg : 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
        color: textPrimary,
        padding: '1rem 1.5rem',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Blocks size={22} color={accent} />
            Blockchain Explorer
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
            Internal chain + Base Sepolia external anchoring
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: textSecondary, cursor: 'pointer' }}>
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refresh (10s)
          </label>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            style={{
              background: accent,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.4rem 0.8rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Chain Status', value: health?.status === 'ok' ? 'Online' : 'Offline', icon: <Activity size={16} />, color: health?.status === 'ok' ? green : '#ef4444' },
          { label: 'Miner', value: health?.miner === 'active' ? 'Active' : 'Stopped', icon: <Cpu size={16} />, color: health?.miner === 'active' ? green : orange },
          { label: 'Latest Block', value: stats ? `#${stats.latest_block}` : '\u2014', icon: <Blocks size={16} />, color: accent },
          { label: 'Total Transactions', value: stats?.total_transactions?.toLocaleString() ?? '\u2014', icon: <Hash size={16} />, color: blue },
          { label: 'Pending TXs', value: stats?.pending_transactions?.toLocaleString() ?? '\u2014', icon: <Clock size={16} />, color: orange },
          { label: 'Chain ID', value: stats?.chain_id ?? '\u2014', icon: <Link2 size={16} />, color: textSecondary },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: '8px',
              padding: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <span style={{ color: item.color }}>{item.icon}</span>
              <span style={{ fontSize: '0.65rem', color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Latest Block Detail */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '8px', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Blocks size={16} color={accent} />
            Latest Block
          </h3>
          {latestBlock ? (
            <div style={{ fontSize: '0.75rem' }}>
              {[
                { label: 'Block #', value: String(latestBlock.block_number) },
                { label: 'Hash', value: truncHash(latestBlock.block_hash) },
                { label: 'Prev Hash', value: truncHash(latestBlock.previous_block_hash) },
                { label: 'Merkle Root', value: truncHash(latestBlock.merkle_root) },
                { label: 'Transactions', value: String(latestBlock.transaction_count) },
                { label: 'Validator', value: latestBlock.validator || '\u2014' },
                { label: 'Timestamp', value: formatTime(latestBlock.timestamp) },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: `1px solid ${border}` }}>
                  <span style={{ color: textSecondary }}>{row.label}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{row.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: textSecondary, fontSize: '0.75rem' }}>No blocks mined yet</p>
          )}
        </div>

        {/* External Chain (Base Sepolia) */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '8px', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={16} color={blue} />
            Base Sepolia Contracts
          </h3>
          <div style={{ fontSize: '0.75rem' }}>
            {Object.entries(CONTRACT_ADDRESSES).map(([name, addr]) => (
              <div key={name} style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.2rem', color: accent }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <code style={{ fontSize: '0.65rem', color: textSecondary, fontFamily: 'monospace' }}>
                    {addr.slice(0, 10)}...{addr.slice(-8)}
                  </code>
                  <a
                    href={`${BASESCAN_BASE}/address/${addr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: blue, display: 'flex', alignItems: 'center' }}
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(34,197,94,0.1)', borderRadius: '6px', fontSize: '0.7rem', color: green, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle size={12} />
              All contracts deployed and verified
            </div>
          </div>
        </div>
      </div>

      {/* Recent Blocks */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Database size={16} color={accent} />
          Recent Blocks
        </h3>
        {recentBlocks.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.7rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${border}` }}>
                  {['Block', 'Hash', 'Merkle Root', 'TXs', 'Validator', 'Time'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.5rem', color: textSecondary, fontWeight: 600, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.5px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBlocks.map((b) => (
                  <tr key={b.block_number} style={{ borderBottom: `1px solid ${border}` }}>
                    <td style={{ padding: '0.4rem 0.5rem', fontWeight: 700, color: accent }}>#{b.block_number}</td>
                    <td style={{ padding: '0.4rem 0.5rem', fontFamily: 'monospace', fontSize: '0.65rem' }}>{truncHash(b.block_hash)}</td>
                    <td style={{ padding: '0.4rem 0.5rem', fontFamily: 'monospace', fontSize: '0.65rem' }}>{truncHash(b.merkle_root)}</td>
                    <td style={{ padding: '0.4rem 0.5rem' }}>
                      <span style={{ background: 'rgba(139,92,246,0.15)', color: accent, padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                        {b.transaction_count}
                      </span>
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', fontSize: '0.65rem', color: textSecondary }}>{b.validator || '\u2014'}</td>
                    <td style={{ padding: '0.4rem 0.5rem', fontSize: '0.65rem', color: textSecondary }}>{formatTime(b.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: textSecondary, fontSize: '0.75rem', textAlign: 'center', padding: '1rem' }}>No blocks mined yet. The miner runs every 10 seconds when transactions are pending.</p>
        )}
      </div>

      {/* Architecture Info */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: '8px', padding: '1rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={16} color={orange} />
          Architecture
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.7rem' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(139,92,246,0.05)', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div style={{ fontWeight: 700, color: accent, marginBottom: '0.3rem' }}>Internal Chain</div>
            <div style={{ color: textSecondary, lineHeight: 1.4 }}>
              DSID identity system, Merkle tree blocks, background miner (10s interval), PostgreSQL storage
            </div>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.05)', borderRadius: '6px', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontWeight: 700, color: blue, marginBottom: '0.3rem' }}>External Anchoring</div>
            <div style={{ color: textSecondary, lineHeight: 1.4 }}>
              Merkle roots anchored to Base Sepolia via MemoryAnchors contract. Verifiable on Basescan.
            </div>
          </div>
          <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.05)', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div style={{ fontWeight: 700, color: orange, marginBottom: '0.3rem' }}>Data Flow</div>
            <div style={{ color: textSecondary, lineHeight: 1.4 }}>
              Memories &rarr; Hash Sphere &rarr; Blockchain TX &rarr; Block &rarr; Merkle Root &rarr; Base Sepolia Anchor
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '0.75rem 0', fontSize: '0.65rem', color: textSecondary }}>
        Last refreshed: {lastRefresh.toLocaleTimeString()} &middot; Chain: {stats?.chain_id ?? 'connecting...'}
      </div>
    </div>
  );
};

export default BlockchainDashboardPage;
