import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import fastapiClient from '../../api/fastapiClient';
import { Button } from '../../components/ui';
import { Card } from '../../components/ui';
import { Text } from '../../components/ui';

// ── Types (matching crypto_service backend) ──
interface Wallet {
  id: string;
  user_id: string;
  token_balance: string;
  pending_balance: string;
  locked_balance: string;
  is_verified: boolean;
  kyc_status: string;
}

interface Balance {
  available: string;
  pending: string;
  locked: string;
  total: string;
}

interface Transaction {
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

interface FundingSource {
  id: string;
  source_type: string;
  card_last_four?: string;
  card_brand?: string;
  crypto_address?: string;
  crypto_chain?: string;
  is_default: boolean;
  is_verified: boolean;
}

interface TokenStats {
  total_supply: string;
  circulating_supply: string;
  locked_supply: string;
  current_price_usd: string;
  market_cap_usd: string;
}

interface WithdrawalRequest {
  id: string;
  amount: string;
  fee: string;
  net_amount: string;
  destination_type: string;
  status: string;
}

// ── Helpers ──
const fmt = (val: string | number) => {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '0.00';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    completed: '#10b981', pending: '#f59e0b', processing: '#3b82f6',
    failed: '#ef4444', cancelled: '#6b7280', approved: '#10b981', rejected: '#ef4444',
  };
  return map[s] || '#6b7280';
};

const txIcon = (type: string) => {
  const map: Record<string, string> = {
    deposit: '⬇️', withdrawal: '⬆️', purchase: '🛒', sale: '💰',
    reward: '🎁', fee: '💸', transfer: '↔️',
  };
  return map[type] || '📋';
};

export default function WalletPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletExists, setWalletExists] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'funding' | 'withdrawals'>('overview');

  // Deposit/Withdraw modals
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDest, setWithdrawDest] = useState('crypto_wallet');
  const [withdrawAddr, setWithdrawAddr] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, balanceRes, txRes, fundingRes, statsRes, wdRes] = await Promise.allSettled([
        fastapiClient.get('/crypto/wallet'),
        fastapiClient.get('/crypto/wallet/balance'),
        fastapiClient.get('/crypto/transactions', { params: { limit: 50 } }),
        fastapiClient.get('/crypto/funding-sources'),
        fastapiClient.get('/crypto/token/stats'),
        fastapiClient.get('/crypto/withdrawals'),
      ]);

      if (walletRes.status === 'fulfilled') {
        setWallet(walletRes.value.data);
        setWalletExists(true);
      } else {
        setWalletExists(false);
      }

      if (balanceRes.status === 'fulfilled') setBalance(balanceRes.value.data);
      if (txRes.status === 'fulfilled') setTransactions(Array.isArray(txRes.value.data) ? txRes.value.data : []);
      if (fundingRes.status === 'fulfilled') setFundingSources(Array.isArray(fundingRes.value.data) ? fundingRes.value.data : []);
      if (statsRes.status === 'fulfilled') setTokenStats(statsRes.value.data);
      if (wdRes.status === 'fulfilled') setWithdrawals(Array.isArray(wdRes.value.data) ? wdRes.value.data : []);
    } catch (e) {
      console.error('Wallet load error:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const createWallet = async () => {
    setCreating(true);
    try {
      const res = await fastapiClient.post('/crypto/wallet');
      setWallet(res.data);
      setWalletExists(true);
      await loadData();
    } catch (e: any) {
      console.error('Create wallet error:', e);
      setActionMsg(e?.response?.data?.detail || 'Failed to create wallet');
    }
    setCreating(false);
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      const res = await fastapiClient.post('/crypto/deposit', { amount_usd: parseFloat(depositAmount) });
      setActionMsg(`Deposit initiated: ${res.data.tokens_to_receive} RGT tokens. Status: ${res.data.status}`);
      setShowDeposit(false);
      setDepositAmount('');
      await loadData();
    } catch (e: any) {
      setActionMsg(e?.response?.data?.detail || 'Deposit failed');
    }
    setActionLoading(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      const res = await fastapiClient.post('/crypto/withdraw', {
        amount: parseFloat(withdrawAmount),
        destination_type: withdrawDest,
        destination_address: withdrawAddr || undefined,
      });
      setActionMsg(`Withdrawal request created: ${res.data.net_amount} RGT (fee: ${res.data.fee}). Status: ${res.data.status}`);
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawAddr('');
      await loadData();
    } catch (e: any) {
      setActionMsg(e?.response?.data?.detail || 'Withdrawal failed');
    }
    setActionLoading(false);
  };

  const handleTransfer = async () => {
    if (!transferTo || !transferAmount || parseFloat(transferAmount) <= 0) return;
    setActionLoading(true);
    setActionMsg('');
    try {
      const res = await fastapiClient.post('/crypto/transfer', {
        to_user_id: transferTo,
        amount: parseFloat(transferAmount),
        description: transferDesc || undefined,
      });
      setActionMsg(`Transfer complete: ${res.data.amount} RGT sent. TX: ${res.data.transaction_id}`);
      setShowTransfer(false);
      setTransferTo('');
      setTransferAmount('');
      setTransferDesc('');
      await loadData();
    } catch (e: any) {
      setActionMsg(e?.response?.data?.detail || 'Transfer failed');
    }
    setActionLoading(false);
  };

  const cancelWithdrawal = async (id: string) => {
    try {
      await fastapiClient.post(`/crypto/withdrawals/${id}/cancel`);
      await loadData();
    } catch (e: any) {
      setActionMsg(e?.response?.data?.detail || 'Cancel failed');
    }
  };

  // ── No Wallet State ──
  if (!loading && !walletExists) {
    return (
      <div className="page-container" style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>💰</div>
        <Text variant="h1" color="primary" style={{ marginBottom: 8 }}>RGT Wallet</Text>
        <Text variant="body" color="secondary" style={{ marginBottom: 24 }}>
          Create your Resonant Genesis Token wallet to deposit, withdraw, transfer tokens,
          and participate in the agent marketplace economy.
        </Text>
        <Button variant="primary" size="lg" onClick={createWallet} disabled={creating}>
          {creating ? 'Creating...' : 'Create Wallet'}
        </Button>
        {actionMsg && (
          <Text variant="body-sm" color="error" style={{ marginTop: 12 }}>{actionMsg}</Text>
        )}
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
        <Text variant="body" color="secondary">Loading wallet...</Text>
      </div>
    );
  }

  const tabStyle = (tab: string) => ({
    padding: '8px 16px',
    background: activeTab === tab ? 'var(--color-bg-secondary)' : 'transparent',
    border: activeTab === tab ? '1px solid var(--color-border)' : '1px solid transparent',
    borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
    borderRadius: '8px 8px 0 0',
    color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    cursor: 'pointer' as const,
    fontSize: 13,
    fontWeight: activeTab === tab ? 600 : 400,
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Text variant="h1" color="primary" style={{ margin: 0 }}>💰 RGT Wallet</Text>
          <Text variant="body-sm" color="secondary">
            Manage your Resonant Genesis Tokens — deposit, withdraw, transfer, and track all transactions.
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary" size="md" onClick={() => setShowDeposit(true)}>⬇️ Deposit</Button>
          <Button variant="secondary" size="md" onClick={() => setShowWithdraw(true)}>⬆️ Withdraw</Button>
          <Button variant="secondary" size="md" onClick={() => setShowTransfer(true)}>↔️ Transfer</Button>
          <Button variant="secondary" size="sm" onClick={loadData}>🔄</Button>
        </div>
      </div>

      {/* Action Message */}
      {actionMsg && (
        <div style={{
          padding: '8px 16px', marginBottom: 16, borderRadius: 8,
          background: actionMsg.includes('fail') || actionMsg.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          border: `1px solid ${actionMsg.includes('fail') || actionMsg.includes('Failed') ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
        }}>
          <Text variant="body-sm" color="primary">{actionMsg}</Text>
          <button onClick={() => setActionMsg('')} style={{ float: 'right', background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Balance Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <Card variant="elevated" padding="md">
          <Text variant="body-sm" color="secondary">Available Balance</Text>
          <Text variant="h2" color="accent" style={{ fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
            {fmt(balance?.available || wallet?.token_balance || '0')} <span style={{ fontSize: 14, opacity: 0.7 }}>RGT</span>
          </Text>
          <Text variant="caption" color="muted">Ready to use</Text>
        </Card>
        <Card variant="elevated" padding="md">
          <Text variant="body-sm" color="secondary">Pending</Text>
          <Text variant="h2" color="primary" style={{ fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
            {fmt(balance?.pending || wallet?.pending_balance || '0')} <span style={{ fontSize: 14, opacity: 0.7 }}>RGT</span>
          </Text>
          <Text variant="caption" color="muted">Processing deposits/withdrawals</Text>
        </Card>
        <Card variant="elevated" padding="md">
          <Text variant="body-sm" color="secondary">Locked</Text>
          <Text variant="h2" color="primary" style={{ fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
            {fmt(balance?.locked || wallet?.locked_balance || '0')} <span style={{ fontSize: 14, opacity: 0.7 }}>RGT</span>
          </Text>
          <Text variant="caption" color="muted">In active marketplace listings</Text>
        </Card>
        <Card variant="elevated" padding="md">
          <Text variant="body-sm" color="secondary">Total</Text>
          <Text variant="h2" color="primary" style={{ fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
            {fmt(balance?.total || '0')} <span style={{ fontSize: 14, opacity: 0.7 }}>RGT</span>
          </Text>
          <Text variant="caption" color="muted">All balances combined</Text>
        </Card>
      </div>

      {/* Token Stats */}
      {tokenStats && (
        <Card variant="elevated" padding="md" style={{ marginBottom: 'var(--space-4)' }}>
          <Text variant="h4" color="primary" style={{ marginBottom: 8 }}>RGT Token Economy</Text>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div>
              <Text variant="caption" color="secondary">Token Price</Text>
              <Text variant="body" color="accent" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${fmt(tokenStats.current_price_usd)}</Text>
            </div>
            <div>
              <Text variant="caption" color="secondary">Market Cap</Text>
              <Text variant="body" color="primary" style={{ fontFamily: 'var(--font-mono)' }}>${fmt(tokenStats.market_cap_usd)}</Text>
            </div>
            <div>
              <Text variant="caption" color="secondary">Circulating</Text>
              <Text variant="body" color="primary" style={{ fontFamily: 'var(--font-mono)' }}>{fmt(tokenStats.circulating_supply)}</Text>
            </div>
            <div>
              <Text variant="caption" color="secondary">Total Supply</Text>
              <Text variant="body" color="primary" style={{ fontFamily: 'var(--font-mono)' }}>{fmt(tokenStats.total_supply)}</Text>
            </div>
          </div>
        </Card>
      )}

      {/* Wallet Info */}
      {wallet && (
        <Card variant="default" padding="sm" style={{ marginBottom: 'var(--space-4)', opacity: 0.8 }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Text variant="caption" color="muted">Wallet ID: <span style={{ fontFamily: 'var(--font-mono)' }}>{wallet.id}</span></Text>
            <Text variant="caption" color="muted">KYC: <span style={{
              padding: '2px 6px', borderRadius: 4, fontSize: 11,
              background: wallet.kyc_status === 'verified' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
              color: wallet.kyc_status === 'verified' ? '#10b981' : '#f59e0b',
            }}>{wallet.kyc_status}</span></Text>
            <Text variant="caption" color="muted">Verified: {wallet.is_verified ? '✅' : '❌'}</Text>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 0, borderBottom: '1px solid var(--color-border)' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button style={tabStyle('transactions')} onClick={() => setActiveTab('transactions')}>Transactions ({transactions.length})</button>
        <button style={tabStyle('funding')} onClick={() => setActiveTab('funding')}>Funding Sources ({fundingSources.length})</button>
        <button style={tabStyle('withdrawals')} onClick={() => setActiveTab('withdrawals')}>Withdrawals ({withdrawals.length})</button>
      </div>

      {/* Tab Content */}
      <div style={{ padding: 'var(--space-4) 0' }}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <Text variant="h3" color="primary" style={{ marginBottom: 12 }}>Recent Transactions</Text>
            {transactions.length === 0 ? (
              <Card variant="default" padding="md" style={{ textAlign: 'center' }}>
                <Text variant="body" color="secondary">No transactions yet. Make a deposit to get started.</Text>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {transactions.slice(0, 10).map(tx => (
                  <Card key={tx.id} variant="elevated" padding="sm">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{txIcon(tx.tx_type)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text variant="body-sm" color="primary" style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                            {tx.tx_type.replace(/_/g, ' ')}
                          </Text>
                          <Text variant="body" color={tx.tx_type === 'deposit' || tx.tx_type === 'reward' ? 'accent' : 'primary'}
                            style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {tx.tx_type === 'deposit' || tx.tx_type === 'reward' || tx.tx_type === 'sale' ? '+' : '-'}{fmt(tx.amount)} {tx.currency}
                          </Text>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                          {tx.description && <Text variant="caption" color="muted">{tx.description}</Text>}
                          <Text variant="caption" color="muted">{new Date(tx.created_at).toLocaleDateString()}</Text>
                          <span style={{
                            padding: '1px 6px', borderRadius: 4, fontSize: 10,
                            background: `${statusColor(tx.status)}20`, color: statusColor(tx.status),
                          }}>{tx.status}</span>
                          {tx.fee !== '0' && tx.fee !== '0.00' && (
                            <Text variant="caption" color="muted">Fee: {fmt(tx.fee)}</Text>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div>
            <Text variant="h3" color="primary" style={{ marginBottom: 12 }}>All Transactions</Text>
            {transactions.length === 0 ? (
              <Card variant="default" padding="md" style={{ textAlign: 'center' }}>
                <Text variant="body" color="secondary">No transactions found.</Text>
              </Card>
            ) : (
              <Card variant="elevated" padding="none">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-secondary)' }}>Type</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: 'var(--color-text-secondary)' }}>Amount</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: 'var(--color-text-secondary)' }}>Fee</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: 'var(--color-text-secondary)' }}>Net</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 12, color: 'var(--color-text-secondary)' }}>Status</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: 'var(--color-text-secondary)' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ marginRight: 6 }}>{txIcon(tx.tx_type)}</span>
                            <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{tx.tx_type.replace(/_/g, ' ')}</span>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                            {fmt(tx.amount)} {tx.currency}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, opacity: 0.6 }}>
                            {fmt(tx.fee)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>
                            {fmt(tx.net_amount)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 4, fontSize: 11,
                              background: `${statusColor(tx.status)}20`, color: statusColor(tx.status),
                            }}>{tx.status}</span>
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            {new Date(tx.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* FUNDING SOURCES TAB */}
        {activeTab === 'funding' && (
          <div>
            <Text variant="h3" color="primary" style={{ marginBottom: 12 }}>Funding Sources</Text>
            {fundingSources.length === 0 ? (
              <Card variant="default" padding="md" style={{ textAlign: 'center' }}>
                <Text variant="body" color="secondary">No funding sources added yet.</Text>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {fundingSources.map(src => (
                  <Card key={src.id} variant="elevated" padding="md">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text variant="body" color="primary" style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {src.source_type === 'card' ? '💳' : '🔗'} {src.source_type.replace(/_/g, ' ')}
                      </Text>
                      {src.is_default && (
                        <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 10, background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>Default</span>
                      )}
                    </div>
                    {src.card_last_four && (
                      <Text variant="body-sm" color="secondary">•••• {src.card_last_four} ({src.card_brand})</Text>
                    )}
                    {src.crypto_address && (
                      <Text variant="caption" color="secondary" style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                        {src.crypto_address} ({src.crypto_chain})
                      </Text>
                    )}
                    <div style={{ marginTop: 6 }}>
                      <Text variant="caption" color={src.is_verified ? 'accent' : 'muted'}>
                        {src.is_verified ? '✅ Verified' : '⏳ Unverified'}
                      </Text>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* WITHDRAWALS TAB */}
        {activeTab === 'withdrawals' && (
          <div>
            <Text variant="h3" color="primary" style={{ marginBottom: 12 }}>Withdrawal Requests</Text>
            {withdrawals.length === 0 ? (
              <Card variant="default" padding="md" style={{ textAlign: 'center' }}>
                <Text variant="body" color="secondary">No withdrawal requests.</Text>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {withdrawals.map(wd => (
                  <Card key={wd.id} variant="elevated" padding="sm">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <Text variant="body" color="primary" style={{ fontWeight: 600 }}>
                          {fmt(wd.amount)} RGT → {wd.destination_type.replace(/_/g, ' ')}
                        </Text>
                        <Text variant="caption" color="muted">Fee: {fmt(wd.fee)} | Net: {fmt(wd.net_amount)}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4, fontSize: 11,
                          background: `${statusColor(wd.status)}20`, color: statusColor(wd.status),
                        }}>{wd.status}</span>
                        {wd.status === 'pending' && (
                          <button onClick={() => cancelWithdrawal(wd.id)} style={{
                            padding: '4px 8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 4, color: '#ef4444', fontSize: 11, cursor: 'pointer',
                          }}>Cancel</button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DEPOSIT MODAL ── */}
      {showDeposit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowDeposit(false)}>
          <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, width: 400, maxWidth: '90vw' }}
            onClick={e => e.stopPropagation()}>
            <Text variant="h3" color="primary" style={{ marginBottom: 16 }}>⬇️ Deposit RGT</Text>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>Amount (USD)</label>
            <input type="number" min="1" step="0.01" value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
              placeholder="10.00" style={{
                width: '100%', padding: '10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 16, marginBottom: 16, boxSizing: 'border-box',
              }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="md" onClick={() => setShowDeposit(false)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleDeposit} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Deposit'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── WITHDRAW MODAL ── */}
      {showWithdraw && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowWithdraw(false)}>
          <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, width: 400, maxWidth: '90vw' }}
            onClick={e => e.stopPropagation()}>
            <Text variant="h3" color="primary" style={{ marginBottom: 16 }}>⬆️ Withdraw RGT</Text>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>Amount (RGT)</label>
            <input type="number" min="1" step="0.01" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="100.00" style={{
                width: '100%', padding: '10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 16, marginBottom: 12, boxSizing: 'border-box',
              }} />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>Destination</label>
            <select value={withdrawDest} onChange={e => setWithdrawDest(e.target.value)} style={{
              width: '100%', padding: '10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
              borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 14, marginBottom: 12, boxSizing: 'border-box',
            }}>
              <option value="crypto_wallet">Crypto Wallet</option>
              <option value="bank">Bank Account</option>
            </select>
            {withdrawDest === 'crypto_wallet' && (
              <>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>Wallet Address</label>
                <input type="text" value={withdrawAddr} onChange={e => setWithdrawAddr(e.target.value)}
                  placeholder="0x..." style={{
                    width: '100%', padding: '10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                    borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 14, marginBottom: 16, fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
                  }} />
              </>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="md" onClick={() => setShowWithdraw(false)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleWithdraw} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Withdraw'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSFER MODAL ── */}
      {showTransfer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowTransfer(false)}>
          <div style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, width: 400, maxWidth: '90vw' }}
            onClick={e => e.stopPropagation()}>
            <Text variant="h3" color="primary" style={{ marginBottom: 16 }}>↔️ Transfer RGT</Text>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>Recipient User ID</label>
            <input type="text" value={transferTo} onChange={e => setTransferTo(e.target.value)}
              placeholder="user-uuid..." style={{
                width: '100%', padding: '10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 14, marginBottom: 12, fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
              }} />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>Amount (RGT)</label>
            <input type="number" min="1" step="0.01" value={transferAmount} onChange={e => setTransferAmount(e.target.value)}
              placeholder="50.00" style={{
                width: '100%', padding: '10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 16, marginBottom: 12, boxSizing: 'border-box',
              }} />
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>Description (optional)</label>
            <input type="text" value={transferDesc} onChange={e => setTransferDesc(e.target.value)}
              placeholder="Payment for..." style={{
                width: '100%', padding: '10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                borderRadius: 6, color: 'var(--color-text-primary)', fontSize: 14, marginBottom: 16, boxSizing: 'border-box',
              }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="md" onClick={() => setShowTransfer(false)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleTransfer} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Data Source Footer */}
      <Card variant="default" padding="sm" style={{ marginTop: 'var(--space-4)', opacity: 0.6 }}>
        <Text variant="caption" color="muted" style={{ textAlign: 'center', display: 'block' }}>
          All data from live crypto_service endpoints: /api/v1/crypto/wallet, /balance, /transactions, /funding-sources, /token/stats, /withdrawals
        </Text>
      </Card>
    </div>
  );
}
