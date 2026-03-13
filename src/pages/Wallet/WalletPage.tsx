/**
 * Crypto Wallet Page - Full Production
 * Features: Balance overview, deposit/withdraw, transactions, funding sources, token stats
 * Connected to real crypto_service backend endpoints
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getWallet,
  getBalance,
  createWallet,
  listTransactions,
  listFundingSources,
  getTokenStats,
  createDeposit,
  requestWithdrawal,
  addFundingSource,
  removeFundingSource,
  cancelWithdrawal,
  listWithdrawals,
  type Wallet,
  type Balance,
  type Transaction,
  type FundingSource,
  type TokenStats,
  type WithdrawalRequest,
} from '../../api/crypto';
import styles from './WalletPage.module.css';

type TabType = 'overview' | 'transactions' | 'deposit' | 'withdraw' | 'funding' | 'token';

// Icons as inline SVGs
const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
  </svg>
);
const ArrowUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>
);
const ArrowDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
  </svg>
);
const CreditCardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinner}>
    <circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0110 10" strokeLinecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
    </path>
  </svg>
);

const formatAmount = (amount: string | number, decimals = 2) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const statusColor = (status: string): string => {
  switch (status) {
    case 'completed': return '#10b981';
    case 'pending': case 'processing': return '#f59e0b';
    case 'failed': case 'rejected': case 'cancelled': return '#ef4444';
    default: return '#6b7280';
  }
};

const txTypeIcon = (type: string) => {
  switch (type) {
    case 'deposit': return <ArrowDownIcon />;
    case 'withdrawal': return <ArrowUpIcon />;
    case 'purchase': return <CreditCardIcon />;
    case 'reward': return <TrendingUpIcon />;
    default: return <WalletIcon />;
  }
};

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fundingSources, setFundingSources] = useState<FundingSource[]>([]);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

  // Web3 wallet connection state
  const [web3Address, setWeb3Address] = useState<string | null>(null);
  const [web3Chain, setWeb3Chain] = useState<string | null>(null);
  const [web3Connecting, setWeb3Connecting] = useState(false);

  // Form state
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDest, setWithdrawDest] = useState<'bank' | 'crypto_wallet'>('bank');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [fundingType, setFundingType] = useState<'card' | 'crypto_wallet'>('crypto_wallet');
  const [fundingAddress, setFundingAddress] = useState('');
  const [fundingChain, setFundingChain] = useState('ethereum');
  const [fundingNickname, setFundingNickname] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [txFilter, setTxFilter] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletData, balanceData, txData, sourcesData, statsData, withdrawData] = await Promise.allSettled([
        getWallet(),
        getBalance(),
        listTransactions(undefined, 50, 0),
        listFundingSources(),
        getTokenStats(),
        listWithdrawals(),
      ]);

      if (walletData.status === 'fulfilled') setWallet(walletData.value);
      if (balanceData.status === 'fulfilled') setBalance(balanceData.value);
      if (txData.status === 'fulfilled') setTransactions(txData.value || []);
      if (sourcesData.status === 'fulfilled') setFundingSources(sourcesData.value || []);
      if (statsData.status === 'fulfilled') setTokenStats(statsData.value);
      if (withdrawData.status === 'fulfilled') setWithdrawals(withdrawData.value || []);

      // If no wallet, try to create one
      if (walletData.status === 'rejected') {
        try {
          const newWallet = await createWallet();
          setWallet(newWallet);
        } catch {
          // Wallet creation may fail if not authenticated
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Detect existing Web3 wallet connection on mount
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (eth) {
      eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setWeb3Address(accounts[0]);
          eth.request({ method: 'eth_chainId' }).then((chainId: string) => {
            setWeb3Chain(chainId);
          }).catch(() => {});
        }
      }).catch(() => {});
      // Listen for account/chain changes
      const handleAccountsChanged = (accounts: string[]) => {
        setWeb3Address(accounts.length > 0 ? accounts[0] : null);
      };
      const handleChainChanged = (chainId: string) => {
        setWeb3Chain(chainId);
      };
      eth.on('accountsChanged', handleAccountsChanged);
      eth.on('chainChanged', handleChainChanged);
      return () => {
        eth.removeListener('accountsChanged', handleAccountsChanged);
        eth.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWeb3Wallet = async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      setActionMessage({ type: 'error', text: 'No Web3 wallet detected. Install MetaMask or another browser wallet.' });
      return;
    }
    setWeb3Connecting(true);
    setActionMessage(null);
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWeb3Address(accounts[0]);
        const chainId = await eth.request({ method: 'eth_chainId' });
        setWeb3Chain(chainId);
        // Auto-add as funding source
        try {
          await addFundingSource({
            source_type: 'crypto_wallet',
            crypto_address: accounts[0],
            crypto_chain: 'ethereum',
            nickname: 'MetaMask',
          });
        } catch { /* may already exist */ }
        setActionMessage({ type: 'success', text: `Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` });
        loadData();
      }
    } catch (err: any) {
      if (err?.code === 4001) {
        setActionMessage({ type: 'error', text: 'Connection rejected by user' });
      } else {
        setActionMessage({ type: 'error', text: err?.message || 'Failed to connect wallet' });
      }
    } finally {
      setWeb3Connecting(false);
    }
  };

  const disconnectWeb3 = () => {
    setWeb3Address(null);
    setWeb3Chain(null);
    setActionMessage({ type: 'success', text: 'External wallet disconnected' });
  };

  const getChainName = (chainId: string | null): string => {
    switch (chainId) {
      case '0x1': return 'Ethereum Mainnet';
      case '0x89': return 'Polygon';
      case '0xa4b1': return 'Arbitrum';
      case '0xa': return 'Optimism';
      case '0x2105': return 'Base';
      case '0x5': return 'Goerli Testnet';
      case '0xaa36a7': return 'Sepolia Testnet';
      default: return chainId ? `Chain ${parseInt(chainId, 16)}` : 'Unknown';
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setActionMessage({ type: 'error', text: 'Enter a valid amount' });
      return;
    }
    setActionLoading(true);
    setActionMessage(null);
    try {
      const intent = await createDeposit(amount);
      setActionMessage({ type: 'success', text: `Deposit initiated! ${intent.tokens_to_receive} RGT tokens will be credited. ID: ${intent.intent_id}` });
      setDepositAmount('');
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Deposit failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setActionMessage({ type: 'error', text: 'Enter a valid withdrawal amount' });
      return;
    }
    setActionLoading(true);
    setActionMessage(null);
    try {
      const req = await requestWithdrawal({
        amount,
        destination_type: withdrawDest,
        destination_address: withdrawDest === 'crypto_wallet' ? withdrawAddress : undefined,
      });
      setActionMessage({ type: 'success', text: `Withdrawal requested! Net: ${req.net_amount} RGT (fee: ${req.fee}). Status: ${req.status}` });
      setWithdrawAmount('');
      setWithdrawAddress('');
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Withdrawal failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFunding = async () => {
    if (fundingType === 'crypto_wallet' && !fundingAddress.trim()) {
      setActionMessage({ type: 'error', text: 'Enter a wallet address' });
      return;
    }
    setActionLoading(true);
    setActionMessage(null);
    try {
      await addFundingSource({
        source_type: fundingType,
        crypto_address: fundingType === 'crypto_wallet' ? fundingAddress : undefined,
        crypto_chain: fundingType === 'crypto_wallet' ? fundingChain : undefined,
        nickname: fundingNickname || undefined,
      });
      setActionMessage({ type: 'success', text: 'Funding source added!' });
      setFundingAddress('');
      setFundingNickname('');
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Failed to add funding source' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFunding = async (id: string) => {
    setActionLoading(true);
    try {
      await removeFundingSource(id);
      setActionMessage({ type: 'success', text: 'Funding source removed' });
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Failed to remove' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelWithdrawal = async (id: string) => {
    setActionLoading(true);
    try {
      await cancelWithdrawal(id);
      setActionMessage({ type: 'success', text: 'Withdrawal cancelled' });
      loadData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Failed to cancel' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTx = txFilter === 'all' ? transactions : transactions.filter(tx => tx.tx_type === txFilter);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>
          <SpinnerIcon />
          <p>Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <WalletIcon />
          <h1>Crypto Wallet</h1>
          <span className={styles.tokenBadge}>RGT Token</span>
        </div>
        <button className={styles.refreshBtn} onClick={loadData} title="Refresh">
          <RefreshIcon /> Refresh
        </button>
      </header>

      {/* Action Messages */}
      {actionMessage && (
        <div className={`${styles.actionMessage} ${styles[actionMessage.type]}`}>
          {actionMessage.type === 'error' ? <AlertIcon /> : <CheckIcon />}
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)}><XIcon /></button>
        </div>
      )}

      {error && (
        <div className={`${styles.actionMessage} ${styles.error}`}>
          <AlertIcon />
          <span>{error}</span>
          <button onClick={loadData}>Retry</button>
        </div>
      )}

      {/* Web3 Wallet Connection Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderRadius: 12,
        marginBottom: 16,
        background: web3Address ? 'rgba(16, 185, 129, 0.08)' : 'rgba(99, 102, 241, 0.06)',
        border: `1px solid ${web3Address ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: web3Address ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: web3Address ? '#10b981' : '#818cf8',
          }}>
            <WalletIcon />
          </div>
          {web3Address ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>
                {web3Address.slice(0, 6)}...{web3Address.slice(-4)}
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>
                {getChainName(web3Chain)} &middot; Connected
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary, #e2e8f0)' }}>External Wallet</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Connect MetaMask or Web3 wallet</div>
            </div>
          )}
        </div>
        {web3Address ? (
          <button
            onClick={disconnectWeb3}
            style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 12,
              fontWeight: 500, cursor: 'pointer',
            }}
          >Disconnect</button>
        ) : (
          <button
            onClick={connectWeb3Wallet}
            disabled={web3Connecting}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white',
              fontSize: 13, fontWeight: 600, cursor: web3Connecting ? 'not-allowed' : 'pointer',
              opacity: web3Connecting ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {web3Connecting ? <><SpinnerIcon /> Connecting...</> : 'Connect Wallet'}
          </button>
        )}
      </div>

      {/* Balance Cards */}
      <div className={styles.balanceGrid}>
        <div className={`${styles.balanceCard} ${styles.primary}`}>
          <div className={styles.balanceLabel}>Available Balance</div>
          <div className={styles.balanceAmount}>{formatAmount(balance?.available || '0')} <span className={styles.currency}>RGT</span></div>
          {tokenStats && (
            <div className={styles.balanceUsd}>
              ≈ ${formatAmount(parseFloat(balance?.available || '0') * parseFloat(tokenStats.current_price_usd))}
            </div>
          )}
        </div>
        <div className={styles.balanceCard}>
          <div className={styles.balanceLabel}>Pending</div>
          <div className={styles.balanceAmount}>{formatAmount(balance?.pending || '0')} <span className={styles.currency}>RGT</span></div>
        </div>
        <div className={styles.balanceCard}>
          <div className={styles.balanceLabel}>Locked</div>
          <div className={styles.balanceAmount}>{formatAmount(balance?.locked || '0')} <span className={styles.currency}>RGT</span></div>
        </div>
        <div className={styles.balanceCard}>
          <div className={styles.balanceLabel}>Total</div>
          <div className={styles.balanceAmount}>{formatAmount(balance?.total || '0')} <span className={styles.currency}>RGT</span></div>
          {wallet && (
            <div className={styles.walletStatus}>
              {wallet.is_verified ? <><CheckIcon /> Verified</> : <><ClockIcon /> {wallet.kyc_status}</>}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <nav className={styles.tabs}>
        {([
          { key: 'overview', label: 'Overview' },
          { key: 'transactions', label: 'Transactions' },
          { key: 'deposit', label: 'Deposit' },
          { key: 'withdraw', label: 'Withdraw' },
          { key: 'funding', label: 'Funding Sources' },
          { key: 'token', label: 'Token Info' },
        ] as { key: TabType; label: string }[]).map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => { setActiveTab(tab.key); setActionMessage(null); }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className={styles.content}>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>
            {/* Quick Actions */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Quick Actions</h3>
              <div className={styles.quickActions}>
                <button className={styles.actionBtn} onClick={() => setActiveTab('deposit')}>
                  <ArrowDownIcon /> Deposit
                </button>
                <button className={`${styles.actionBtn} ${styles.actionBtnSecondary}`} onClick={() => setActiveTab('withdraw')}>
                  <ArrowUpIcon /> Withdraw
                </button>
                <button className={`${styles.actionBtn} ${styles.actionBtnOutline}`} onClick={() => setActiveTab('funding')}>
                  <CreditCardIcon /> Manage Sources
                </button>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Recent Transactions</h3>
                <button className={styles.linkBtn} onClick={() => setActiveTab('transactions')}>View All</button>
              </div>
              {transactions.length === 0 ? (
                <div className={styles.emptyState}>
                  <ClockIcon />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className={styles.txList}>
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className={styles.txRow}>
                      <div className={styles.txIcon} style={{ color: statusColor(tx.status) }}>
                        {txTypeIcon(tx.tx_type)}
                      </div>
                      <div className={styles.txInfo}>
                        <div className={styles.txType}>{tx.tx_type}</div>
                        <div className={styles.txDate}>{formatDate(tx.created_at)}</div>
                      </div>
                      <div className={styles.txAmountCol}>
                        <div className={`${styles.txAmount} ${tx.tx_type === 'deposit' || tx.tx_type === 'reward' ? styles.txPositive : styles.txNegative}`}>
                          {tx.tx_type === 'deposit' || tx.tx_type === 'reward' ? '+' : '-'}{formatAmount(tx.amount)}
                        </div>
                        <div className={styles.txStatus} style={{ color: statusColor(tx.status) }}>{tx.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Withdrawals */}
            {withdrawals.filter(w => w.status === 'pending' || w.status === 'processing').length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Pending Withdrawals</h3>
                <div className={styles.txList}>
                  {withdrawals.filter(w => w.status === 'pending' || w.status === 'processing').map(w => (
                    <div key={w.id} className={styles.txRow}>
                      <div className={styles.txIcon} style={{ color: '#f59e0b' }}><ArrowUpIcon /></div>
                      <div className={styles.txInfo}>
                        <div className={styles.txType}>Withdrawal to {w.destination_type}</div>
                        <div className={styles.txDate}>Net: {formatAmount(w.net_amount)} RGT (fee: {formatAmount(w.fee)})</div>
                      </div>
                      <div className={styles.txAmountCol}>
                        <div className={styles.txAmount}>{formatAmount(w.amount)} RGT</div>
                        {w.status === 'pending' && (
                          <button className={styles.cancelBtn} onClick={() => handleCancelWithdrawal(w.id)}>Cancel</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Token Price */}
            {tokenStats && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>RGT Token</h3>
                <div className={styles.tokenPrice}>
                  <span className={styles.tokenPriceValue}>${tokenStats.current_price_usd}</span>
                  <span className={styles.tokenPriceLabel}>per RGT</span>
                </div>
                <div className={styles.tokenMeta}>
                  <span>Market Cap: ${formatAmount(tokenStats.market_cap_usd, 0)}</span>
                  <span>Supply: {formatAmount(tokenStats.circulating_supply, 0)} / {formatAmount(tokenStats.total_supply, 0)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Transaction History</h3>
              <div className={styles.txFilters}>
                {['all', 'deposit', 'withdrawal', 'purchase', 'sale', 'reward', 'transfer'].map(f => (
                  <button
                    key={f}
                    className={`${styles.filterChip} ${txFilter === f ? styles.filterChipActive : ''}`}
                    onClick={() => setTxFilter(f)}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {filteredTx.length === 0 ? (
              <div className={styles.emptyState}>
                <ClockIcon />
                <p>No {txFilter === 'all' ? '' : txFilter + ' '}transactions found</p>
              </div>
            ) : (
              <div className={styles.txList}>
                {filteredTx.map(tx => (
                  <div key={tx.id} className={styles.txRow}>
                    <div className={styles.txIcon} style={{ color: statusColor(tx.status) }}>
                      {txTypeIcon(tx.tx_type)}
                    </div>
                    <div className={styles.txInfo}>
                      <div className={styles.txType}>
                        {tx.tx_type.charAt(0).toUpperCase() + tx.tx_type.slice(1)}
                        {tx.description && <span className={styles.txDesc}> — {tx.description}</span>}
                      </div>
                      <div className={styles.txDate}>{formatDate(tx.created_at)}</div>
                    </div>
                    <div className={styles.txAmountCol}>
                      <div className={`${styles.txAmount} ${tx.tx_type === 'deposit' || tx.tx_type === 'reward' || tx.tx_type === 'sale' ? styles.txPositive : styles.txNegative}`}>
                        {tx.tx_type === 'deposit' || tx.tx_type === 'reward' || tx.tx_type === 'sale' ? '+' : '-'}{formatAmount(tx.net_amount || tx.amount)} {tx.currency || 'RGT'}
                      </div>
                      <div className={styles.txStatus} style={{ color: statusColor(tx.status) }}>{tx.status}</div>
                      {parseFloat(tx.fee) > 0 && (
                        <div className={styles.txFee}>Fee: {formatAmount(tx.fee)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEPOSIT TAB */}
        {activeTab === 'deposit' && (
          <div className={styles.formCard}>
            <h3 className={styles.cardTitle}>Deposit Funds</h3>
            <p className={styles.formDesc}>Add funds to your RGT wallet. Tokens will be credited at the current exchange rate.</p>
            
            {tokenStats && (
              <div className={styles.rateInfo}>
                Current rate: <strong>1 RGT = ${tokenStats.current_price_usd} USD</strong>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Amount (USD)</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputPrefix}>$</span>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
              </div>
              {depositAmount && tokenStats && (
                <div className={styles.formHint}>
                  You will receive ≈ {formatAmount(parseFloat(depositAmount) / parseFloat(tokenStats.current_price_usd))} RGT
                </div>
              )}
            </div>

            <div className={styles.presetAmounts}>
              {[10, 25, 50, 100, 250].map(amount => (
                <button
                  key={amount}
                  className={styles.presetBtn}
                  onClick={() => setDepositAmount(String(amount))}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <button className={styles.primaryBtn} onClick={handleDeposit} disabled={actionLoading || !depositAmount}>
              {actionLoading ? <><SpinnerIcon /> Processing...</> : <><ArrowDownIcon /> Deposit</>}
            </button>
          </div>
        )}

        {/* WITHDRAW TAB */}
        {activeTab === 'withdraw' && (
          <div className={styles.formCard}>
            <h3 className={styles.cardTitle}>Withdraw Funds</h3>
            <p className={styles.formDesc}>Withdraw RGT tokens to your bank account or external crypto wallet.</p>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Amount (RGT)</label>
              <div className={styles.inputGroup}>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  min="1"
                  step="0.01"
                />
                <span className={styles.inputSuffix}>RGT</span>
              </div>
              <div className={styles.formHint}>Available: {formatAmount(balance?.available || '0')} RGT</div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Destination</label>
              <div className={styles.radioGroup}>
                <label className={`${styles.radioLabel} ${withdrawDest === 'bank' ? styles.radioActive : ''}`}>
                  <input type="radio" value="bank" checked={withdrawDest === 'bank'} onChange={() => setWithdrawDest('bank')} />
                  Bank Account
                </label>
                <label className={`${styles.radioLabel} ${withdrawDest === 'crypto_wallet' ? styles.radioActive : ''}`}>
                  <input type="radio" value="crypto_wallet" checked={withdrawDest === 'crypto_wallet'} onChange={() => setWithdrawDest('crypto_wallet')} />
                  Crypto Wallet
                </label>
              </div>
            </div>

            {withdrawDest === 'crypto_wallet' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Wallet Address</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="0x..."
                  value={withdrawAddress}
                  onChange={e => setWithdrawAddress(e.target.value)}
                />
              </div>
            )}

            <button className={styles.primaryBtn} onClick={handleWithdraw} disabled={actionLoading || !withdrawAmount}>
              {actionLoading ? <><SpinnerIcon /> Processing...</> : <><ArrowUpIcon /> Withdraw</>}
            </button>
          </div>
        )}

        {/* FUNDING SOURCES TAB */}
        {activeTab === 'funding' && (
          <div>
            {/* Existing Sources */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Your Funding Sources</h3>
              {fundingSources.length === 0 ? (
                <div className={styles.emptyState}>
                  <CreditCardIcon />
                  <p>No funding sources added</p>
                </div>
              ) : (
                <div className={styles.sourcesList}>
                  {fundingSources.map(src => (
                    <div key={src.id} className={styles.sourceRow}>
                      <div className={styles.sourceIcon}>
                        {src.source_type === 'card' ? <CreditCardIcon /> : <WalletIcon />}
                      </div>
                      <div className={styles.sourceInfo}>
                        <div className={styles.sourceName}>
                          {src.source_type === 'card'
                            ? `${src.card_brand || 'Card'} ****${src.card_last_four || '????'}`
                            : `${src.crypto_chain || 'Crypto'}: ${src.crypto_address?.slice(0, 8)}...${src.crypto_address?.slice(-6)}`
                          }
                          {src.is_default && <span className={styles.defaultBadge}>Default</span>}
                        </div>
                        <div className={styles.sourceStatus}>
                          {src.is_verified ? <><CheckIcon /> Verified</> : <><ClockIcon /> Pending verification</>}
                        </div>
                      </div>
                      <button className={styles.removeBtn} onClick={() => handleRemoveFunding(src.id)} title="Remove">
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Source */}
            <div className={`${styles.formCard} ${styles.mt16}`}>
              <h3 className={styles.cardTitle}>Add Funding Source</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type</label>
                <div className={styles.radioGroup}>
                  <label className={`${styles.radioLabel} ${fundingType === 'crypto_wallet' ? styles.radioActive : ''}`}>
                    <input type="radio" value="crypto_wallet" checked={fundingType === 'crypto_wallet'} onChange={() => setFundingType('crypto_wallet')} />
                    Crypto Wallet
                  </label>
                  <label className={`${styles.radioLabel} ${fundingType === 'card' ? styles.radioActive : ''}`}>
                    <input type="radio" value="card" checked={fundingType === 'card'} onChange={() => setFundingType('card')} />
                    Card (via Stripe)
                  </label>
                </div>
              </div>

              {fundingType === 'crypto_wallet' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Blockchain</label>
                    <select className={styles.formSelect} value={fundingChain} onChange={e => setFundingChain(e.target.value)}>
                      <option value="ethereum">Ethereum</option>
                      <option value="polygon">Polygon</option>
                      <option value="arbitrum">Arbitrum</option>
                      <option value="optimism">Optimism</option>
                      <option value="base">Base</option>
                      <option value="solana">Solana</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Wallet Address</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="0x... or wallet address"
                      value={fundingAddress}
                      onChange={e => setFundingAddress(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nickname (optional)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g. My MetaMask"
                  value={fundingNickname}
                  onChange={e => setFundingNickname(e.target.value)}
                />
              </div>

              <button className={styles.primaryBtn} onClick={handleAddFunding} disabled={actionLoading}>
                {actionLoading ? <><SpinnerIcon /> Adding...</> : 'Add Source'}
              </button>
            </div>
          </div>
        )}

        {/* TOKEN INFO TAB */}
        {activeTab === 'token' && tokenStats && (
          <div className={styles.tokenGrid}>
            <div className={`${styles.card} ${styles.tokenPriceCard}`}>
              <div className={styles.tokenPriceBig}>${tokenStats.current_price_usd}</div>
              <div className={styles.tokenPriceLabelBig}>RGT Token Price (USD)</div>
            </div>
            <div className={styles.card}>
              <h4 className={styles.statLabel}>Total Supply</h4>
              <div className={styles.statValue}>{formatAmount(tokenStats.total_supply, 0)} RGT</div>
            </div>
            <div className={styles.card}>
              <h4 className={styles.statLabel}>Circulating Supply</h4>
              <div className={styles.statValue}>{formatAmount(tokenStats.circulating_supply, 0)} RGT</div>
            </div>
            <div className={styles.card}>
              <h4 className={styles.statLabel}>Locked Supply</h4>
              <div className={styles.statValue}>{formatAmount(tokenStats.locked_supply, 0)} RGT</div>
            </div>
            <div className={styles.card}>
              <h4 className={styles.statLabel}>Market Cap</h4>
              <div className={styles.statValue}>${formatAmount(tokenStats.market_cap_usd, 0)}</div>
            </div>
            <div className={styles.card}>
              <h4 className={styles.statLabel}>Your Holdings</h4>
              <div className={styles.statValue}>{formatAmount(balance?.total || '0')} RGT</div>
              <div className={styles.statSub}>≈ ${formatAmount(parseFloat(balance?.total || '0') * parseFloat(tokenStats.current_price_usd))}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
