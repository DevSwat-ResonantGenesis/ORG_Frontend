/**
 * Address Page — Public Etherscan-like view of any address's balance & transactions.
 * Accessible at /network/address/:hash
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Coins,
  Copy,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { ENV } from '../../config/env';

const API_BASE = ENV.apiUrl;

interface AddressData {
  address: string;
  balance: string;
  total_earned: string;
  total_spent: string;
  transaction_count: number;
  transactions: Array<{
    id: string;
    tx_type: string;
    amount: string;
    fee: string;
    net_amount: string;
    currency: string;
    status: string;
    description?: string;
    created_at: string;
    from_address?: string;
    to_address?: string;
  }>;
}

const fmt = (val: string | number) => {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '0.00';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const shortHash = (h: string | null | undefined) => {
  if (!h) return '—';
  if (h === 'NETWORK') return 'NETWORK';
  if (h.length > 16) return `${h.slice(0, 8)}...${h.slice(-6)}`;
  return h;
};

const timeAgo = (ts: string) => {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};

const AddressPage: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [data, setData] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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
  };

  const fetchAddress = useCallback(async () => {
    if (!hash) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/crypto/address/${hash}`);
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        setError(detail.detail || `Address not found (${res.status})`);
        return;
      }
      setData(await res.json());
    } catch (err) {
      setError('Failed to fetch address data');
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => { fetchAddress(); }, [fetchAddress]);

  const copyAddress = () => {
    if (data?.address) {
      navigator.clipboard.writeText(data.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: colors.card,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: 12,
    padding: 20,
  };

  const hashLink = (h: string | null | undefined) => {
    if (!h || h === 'NETWORK') return <span style={{ color: colors.textMuted }}>{h || '—'}</span>;
    return (
      <a
        href={`/network/address/${h}`}
        onClick={(e) => { e.preventDefault(); navigate(`/network/address/${h}`); }}
        style={{ color: colors.accent, textDecoration: 'none', fontFamily: 'monospace', fontSize: 12 }}
      >
        {shortHash(h)}
      </a>
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 80, textAlign: 'center', color: colors.textMuted }}>
        Loading address...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center', maxWidth: 600, margin: '0 auto', color: colors.text }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Address Not Found</h2>
        <p style={{ color: colors.textMuted, margin: '8px 0 20px' }}>{error || 'This address does not exist on the network.'}</p>
        <button
          onClick={() => navigate('/network')}
          style={{
            padding: '10px 24px', borderRadius: 8, background: colors.accent,
            color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer',
          }}
        >
          Back to Explorer
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1280, margin: '0 auto', color: colors.text }}>
      {/* Back link */}
      <button
        onClick={() => navigate('/network')}
        style={{ background: 'none', border: 'none', color: colors.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 20, padding: 0 }}
      >
        <ArrowLeft size={14} /> Back to Explorer
      </button>

      {/* Address Header */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>Address</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <code style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', wordBreak: 'break-all', color: colors.accent }}>
            {data.address}
          </code>
          <button
            onClick={copyAddress}
            style={{ background: 'rgba(1,166,188,0.1)', border: '1px solid rgba(1,166,188,0.2)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: colors.accent, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Balance', value: `${fmt(data.balance)} RGT`, color: colors.green },
          { label: 'Total Earned', value: `${fmt(data.total_earned)} RGT`, color: colors.accent },
          { label: 'Total Spent', value: `${fmt(data.total_spent)} RGT`, color: colors.pink },
          { label: 'Transactions', value: `${data.transaction_count}`, color: colors.orange },
        ].map((item, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Coins size={18} style={{ color: colors.orange }} />
          Transactions ({data.transaction_count})
        </h3>
        {data.transactions.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.cardBorder}` }}>
                  {['Type', 'From', 'To', 'Amount', 'Status', 'Time'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: colors.textMuted, fontSize: 11 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((tx, i) => (
                  <tr key={tx.id || i} style={{ borderBottom: `1px solid ${colors.cardBorder}22` }}>
                    <td style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {tx.tx_type === 'reward' || tx.tx_type === 'deposit' || tx.tx_type === 'sale'
                        ? <ArrowDownLeft size={14} style={{ color: colors.green }} />
                        : <ArrowUpRight size={14} style={{ color: colors.pink }} />}
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{tx.tx_type}</span>
                    </td>
                    <td style={{ padding: '10px' }}>{hashLink(tx.from_address)}</td>
                    <td style={{ padding: '10px' }}>{hashLink(tx.to_address)}</td>
                    <td style={{ padding: '10px', fontWeight: 600, fontFamily: 'monospace' }}>
                      {fmt(tx.amount)} RGT
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                        background: tx.status === 'completed' ? 'rgba(113,194,62,0.15)' : 'rgba(250,165,37,0.15)',
                        color: tx.status === 'completed' ? colors.green : colors.orange,
                      }}>{tx.status}</span>
                    </td>
                    <td style={{ padding: '10px', color: colors.textMuted, whiteSpace: 'nowrap' }}>
                      <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {tx.created_at ? timeAgo(tx.created_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ color: colors.textMuted, fontSize: 13, padding: 24, textAlign: 'center' }}>
            No transactions for this address
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressPage;
