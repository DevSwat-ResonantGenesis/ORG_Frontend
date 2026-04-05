import React, { useEffect, useState, useCallback } from 'react';
import Web3WalletConnect from "../../components/wallet/Web3WalletConnect";
import fastapiClient from '../../api/fastapiClient';
import s from './WalletPage.module.css';

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

interface MinerStats {
  trust_score: number;
  rgt_earned: string;
  tasks_completed: number;
  samples_processed: number;
  tier: 'validator_miner' | 'core_miner' | 'miner';
  verification_rate: number;
  status: 'active' | 'idle' | 'suspended';
  current_epoch: number;
  total_miners: number;
  your_rank: number;
}

// ── Helpers ──
const fmt = (val: string | number) => {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '0.00';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const statusColor = (st: string) => {
  const map: Record<string, string> = {
    completed: '#10b981', pending: '#f59e0b', processing: '#3b82f6',
    failed: '#ef4444', cancelled: '#6b7280', approved: '#10b981', rejected: '#ef4444',
  };
  return map[st] || '#6b7280';
};

const txIcon = (type: string) => {
  const map: Record<string, string> = {
    deposit: '⬇️', withdrawal: '⬆️', purchase: '🛒', sale: '💰',
    reward: '🎁', fee: '💸', transfer: '↔️',
  };
  return map[type] || '📋';
};

export default function WalletPage() {
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

  // Web3 wallet connection
  const [web3Address, setWeb3Address] = useState<string | null>(null);
  const [web3Chain, setWeb3Chain] = useState<string | null>(null);
  const [web3Connecting, setWeb3Connecting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Funding source form
  const [showAddFunding, setShowAddFunding] = useState(false);
  const [fundingType, setFundingType] = useState<'crypto_wallet' | 'card'>('crypto_wallet');
  const [fundingAddress, setFundingAddress] = useState('');
  const [fundingChain, setFundingChain] = useState('ethereum');
  const [fundingNickname, setFundingNickname] = useState('');

  // Blockchain identity — fetched from /auth/me
  const [cryptoHash, setCryptoHash] = useState<string>('');
  const [userHash, setUserHash] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);

  // Miner dashboard stats — fetched from /crypto/miner/stats
  const [minerStats, setMinerStats] = useState<MinerStats>({
    trust_score: 0,
    rgt_earned: '0',
    tasks_completed: 0,
    samples_processed: 0,
    tier: 'miner',
    verification_rate: 0,
    status: 'idle',
    current_epoch: 0,
    total_miners: 0,
    your_rank: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, balanceRes, txRes, fundingRes, statsRes, wdRes, minerRes, meRes] = await Promise.allSettled([
        fastapiClient.get('/crypto/wallet'),
        fastapiClient.get('/crypto/wallet/balance'),
        fastapiClient.get('/crypto/transactions', { params: { limit: 50 } }),
        fastapiClient.get('/crypto/funding-sources'),
        fastapiClient.get('/crypto/token/stats'),
        fastapiClient.get('/crypto/withdrawals'),
        fastapiClient.get('/crypto/miner/stats'),
        fastapiClient.get('/auth/me'),
      ]);

      if (walletRes.status === 'fulfilled') {
        setWallet(walletRes.value.data);
        setWalletExists(true);
      } else {
        // Auto-create wallet if it doesn't exist
        try {
          const createRes = await fastapiClient.post('/crypto/wallet');
          setWallet(createRes.data);
          setWalletExists(true);
        } catch (createErr) {
          console.error('Auto-create wallet failed:', createErr);
          setWalletExists(false);
        }
      }

      if (balanceRes.status === 'fulfilled') setBalance(balanceRes.value.data);
      if (txRes.status === 'fulfilled') setTransactions(Array.isArray(txRes.value.data) ? txRes.value.data : []);
      if (fundingRes.status === 'fulfilled') setFundingSources(Array.isArray(fundingRes.value.data) ? fundingRes.value.data : []);
      if (statsRes.status === 'fulfilled') setTokenStats(statsRes.value.data);
      if (wdRes.status === 'fulfilled') setWithdrawals(Array.isArray(wdRes.value.data) ? wdRes.value.data : []);
      if (minerRes.status === 'fulfilled') setMinerStats(minerRes.value.data);
      if (meRes.status === 'fulfilled') {
        setCryptoHash(meRes.value.data.crypto_hash || '');
        setUserHash(meRes.value.data.user_hash || '');
      }
    } catch (e) {
      console.error('Wallet load error:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Detect existing Web3 wallet on mount
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
      const handleAccounts = (accounts: string[]) => setWeb3Address(accounts.length > 0 ? accounts[0] : null);
      const handleChain = (chainId: string) => setWeb3Chain(chainId);
      eth.on('accountsChanged', handleAccounts);
      eth.on('chainChanged', handleChain);
      return () => {
        eth.removeListener('accountsChanged', handleAccounts);
        eth.removeListener('chainChanged', handleChain);
      };
    }
  }, []);

  const getChainName = (chainId: string | null): string => {
    const chains: Record<string, string> = {
      '0x1': 'Ethereum Mainnet', '0x89': 'Polygon', '0xa4b1': 'Arbitrum',
      '0xa': 'Optimism', '0x2105': 'Base', '0x5': 'Goerli', '0xaa36a7': 'Sepolia',
    };
    return chains[chainId || ''] || (chainId ? `Chain ${parseInt(chainId, 16)}` : 'Unknown');
  };

  const connectWeb3 = async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      setActionMsg('No Web3 wallet detected. Install MetaMask or another browser wallet.');
      return;
    }
    setWeb3Connecting(true);
    setActionMsg('');
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWeb3Address(accounts[0]);
        const chainId = await eth.request({ method: 'eth_chainId' });
        setWeb3Chain(chainId);
        // Auto-register as funding source
        try {
          await fastapiClient.post('/crypto/funding-sources', {
            source_type: 'crypto_wallet',
            crypto_address: accounts[0],
            crypto_chain: 'ethereum',
            nickname: 'MetaMask',
          });
        } catch { /* may already exist */ }
        setActionMsg(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        loadData();
      }
    } catch (err: any) {
      setActionMsg(err?.code === 4001 ? 'Connection rejected by user' : (err?.message || 'Failed to connect'));
    } finally {
      setWeb3Connecting(false);
    }
  };

  const disconnectWeb3 = () => {
    setWeb3Address(null);
    setWeb3Chain(null);
    setActionMsg('External wallet disconnected');
  };

  const copyWalletId = () => {
    if (wallet?.id) {
      navigator.clipboard.writeText(wallet.id).then(() => {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      }).catch(() => {});
    }
  };

  const handleAddFunding = async () => {
    if (fundingType === 'crypto_wallet' && !fundingAddress.trim()) {
      setActionMsg('Enter a wallet address');
      return;
    }
    setActionLoading(true);
    try {
      await fastapiClient.post('/crypto/funding-sources', {
        source_type: fundingType,
        crypto_address: fundingType === 'crypto_wallet' ? fundingAddress : undefined,
        crypto_chain: fundingType === 'crypto_wallet' ? fundingChain : undefined,
        nickname: fundingNickname || undefined,
      });
      setActionMsg('Funding source added!');
      setShowAddFunding(false);
      setFundingAddress('');
      setFundingNickname('');
      await loadData();
    } catch (e: any) {
      setActionMsg(e?.response?.data?.detail || 'Failed to add funding source');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFunding = async (id: string) => {
    try {
      await fastapiClient.delete(`/crypto/funding-sources/${id}`);
      setActionMsg('Funding source removed');
      await loadData();
    } catch (e: any) {
      setActionMsg(e?.response?.data?.detail || 'Failed to remove');
    }
  };

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
        to: transferTo,
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
      <div className={s.page}>
        <div className={s.noWallet}>
          <div style={{ fontSize: 56 }}>💰</div>
          <h2>RGT Wallet</h2>
          <p>Create your Resonant Genesis Token wallet to deposit, withdraw, transfer tokens, and participate in the decentralized training economy.</p>
          <Web3WalletConnect onWalletLinked={() => loadData()} compact />
          <button className={`${s.btn} ${s.btnPrimary}`} style={{ padding: '10px 28px', fontSize: 14, marginTop: 12 }}
            onClick={createWallet} disabled={creating}>
            {creating ? 'Creating...' : 'Create Wallet'}
          </button>
          {actionMsg && <p style={{ color: '#f87171', fontSize: 12, marginTop: 10 }}>{actionMsg}</p>}
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return <div className={s.loader}><span className={s.spin}>⏳</span> Loading wallet...</div>;
  }

  // Trust score ring calculations
  const trustCircumference = 2 * Math.PI * 20;
  const trustOffset = trustCircumference * (1 - minerStats.trust_score);
  const trustColor = minerStats.trust_score >= 0.9 ? '#34d399' : minerStats.trust_score >= 0.7 ? '#fbbf24' : '#f87171';
  const tierLabel = minerStats.tier === 'validator_miner' ? 'Validator (F)' : minerStats.tier === 'core_miner' ? 'Core (G)' : 'Standard (H)';
  const tierClass = minerStats.tier === 'validator_miner' ? s.tierF : minerStats.tier === 'core_miner' ? s.tierG : s.tierH;

  return (
    <div className={s.page}>

      {/* ── Header ── */}
      <div className={s.hdr}>
        <div className={s.hdrLeft}>
          <h1>💰 RGT Wallet & Mining</h1>
          <span className={s.badge}>Live</span>
        </div>
        <div className={s.hdrActions}>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setShowDeposit(true)}>⬇ Deposit</button>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={() => setShowWithdraw(true)}>⬆ Withdraw</button>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={() => setShowTransfer(true)}>↔ Transfer</button>
          <button className={s.btnIcon} onClick={loadData}>🔄</button>
        </div>
      </div>

      {/* ── Toast ── */}
      {actionMsg && (
        <div className={`${s.toast} ${actionMsg.includes('fail') || actionMsg.includes('Failed') ? s.toastErr : s.toastOk}`}>
          {actionMsg}
          <button className={s.toastClose} onClick={() => setActionMsg('')}>✕</button>
        </div>
      )}

      {/* ── Balance Strip ── */}
      <div className={s.balStrip}>
        <div className={`${s.balCard} ${s.balCardPrimary}`}>
          <div className={s.balLabel}>Available</div>
          <div className={s.balVal}>{fmt(balance?.available || wallet?.token_balance || '0')}<span className={s.balUnit}>RGT</span></div>
          <div className={s.balSub}>Ready to use</div>
        </div>
        <div className={s.balCard}>
          <div className={s.balLabel}>Pending</div>
          <div className={s.balVal}>{fmt(balance?.pending || wallet?.pending_balance || '0')}<span className={s.balUnit}>RGT</span></div>
          <div className={s.balSub}>Processing</div>
        </div>
        <div className={s.balCard}>
          <div className={s.balLabel}>Locked</div>
          <div className={s.balVal}>{fmt(balance?.locked || wallet?.locked_balance || '0')}<span className={s.balUnit}>RGT</span></div>
          <div className={s.balSub}>In listings</div>
        </div>
        <div className={s.balCard}>
          <div className={s.balLabel}>Total</div>
          <div className={s.balVal}>{fmt(balance?.total || '0')}<span className={s.balUnit}>RGT</span></div>
          <div className={s.balSub}>All combined</div>
        </div>
      </div>

      {/* ── Token Economy Bar ── */}
      {tokenStats && (
        <div className={s.tokenBar}>
          <div className={`${s.tokenChip} ${s.tokenChipAccent}`}>
            <div className={s.tokenChipLabel}>Token Price</div>
            <div className={s.tokenChipVal}>${fmt(tokenStats.current_price_usd)}</div>
          </div>
          <div className={s.tokenChip}>
            <div className={s.tokenChipLabel}>Market Cap</div>
            <div className={s.tokenChipVal}>${fmt(tokenStats.market_cap_usd)}</div>
          </div>
          <div className={s.tokenChip}>
            <div className={s.tokenChipLabel}>Circulating</div>
            <div className={s.tokenChipVal}>{fmt(tokenStats.circulating_supply)}</div>
          </div>
          <div className={s.tokenChip}>
            <div className={s.tokenChipLabel}>Total Supply</div>
            <div className={s.tokenChipVal}>{fmt(tokenStats.total_supply)}</div>
          </div>
        </div>
      )}

      {/* ── External Web3 Wallet (MetaMask / Brave) ── */}
      <div className={s.web3Bar}>
        <div className={s.web3Dot} style={{ background: web3Address ? '#34d399' : '#64748b' }} />
        <div className={s.web3Info}>
          {web3Address ? (
            <>
              <span style={{ color: '#6b7280', fontSize: 10, marginRight: 4 }}>External:</span>
              <span className={s.web3Addr}>{web3Address.slice(0, 6)}...{web3Address.slice(-4)}</span>
              <span className={s.web3Chain}>{getChainName(web3Chain)}</span>
            </>
          ) : (
            'No external Web3 wallet (MetaMask/Brave)'
          )}
        </div>
        {web3Address ? (
          <button className={`${s.btn}`} style={{ fontSize: 10, padding: '4px 10px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)', color: '#f87171' }} onClick={disconnectWeb3}>Disconnect</button>
        ) : (
          <button className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: 10, padding: '4px 10px' }} onClick={connectWeb3} disabled={web3Connecting}>
            {web3Connecting ? '...' : '🦊 Connect'}
          </button>
        )}
      </div>

      {/* ── Wallet ID Bar ── */}
      {wallet && (
        <div className={s.walletIdBar}>
          <span>ID: <span className={s.mono}>{(wallet.id || 'N/A').slice(0, 12)}...</span></span>
          <button className={s.copyBtn} onClick={copyWalletId}>{copiedId ? '✓' : '📋'}</button>
          <span>KYC: <span className={s.kycBadge} style={{
            background: wallet.kyc_status === 'verified' ? 'rgba(52,211,153,.12)' : 'rgba(251,191,36,.12)',
            color: wallet.kyc_status === 'verified' ? '#34d399' : '#fbbf24',
          }}>{wallet.kyc_status}</span></span>
          <span>{wallet.is_verified ? '✅' : '❌'} Verified</span>
        </div>
      )}

      {/* ── Two-Column: Miner Dashboard + Recent Transactions ── */}
      <div className={s.mainGrid}>

        {/* LEFT: Miner Dashboard */}
        <div className={s.panel}>
          <h3 className={s.panelTitle}>⛏️ Miner Dashboard <span className={`${s.tierBadge} ${tierClass}`}>{tierLabel}</span></h3>
          <div className={s.minerGrid}>
            <div className={s.minerStat}>
              <div className={s.minerStatLabel}>RGT Earned</div>
              <div className={s.minerStatVal} style={{ color: '#34d399' }}>{fmt(minerStats.rgt_earned)}</div>
              <div className={s.minerStatSub}>From training</div>
            </div>
            <div className={s.minerStat}>
              <div className={s.minerStatLabel}>Tasks Done</div>
              <div className={s.minerStatVal}>{minerStats.tasks_completed}</div>
              <div className={s.minerStatSub}>Epoch {minerStats.current_epoch}</div>
            </div>
            <div className={s.minerStat}>
              <div className={s.minerStatLabel}>Samples</div>
              <div className={s.minerStatVal}>{minerStats.samples_processed.toLocaleString()}</div>
              <div className={s.minerStatSub}>Processed</div>
            </div>
            <div className={s.minerStat}>
              <div className={s.minerStatLabel}>Verify Rate</div>
              <div className={s.minerStatVal}>{minerStats.verification_rate}%</div>
              <div className={s.minerStatSub}>Pass rate</div>
            </div>

            {/* Trust Score Ring */}
            <div className={s.trustRing}>
              <div className={s.trustCircle}>
                <svg viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke={trustColor} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={trustCircumference} strokeDashoffset={trustOffset}
                    style={{ transition: 'stroke-dashoffset .6s ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
                </svg>
                <div className={s.trustNum}>{minerStats.trust_score.toFixed(2)}</div>
              </div>
              <div className={s.trustInfo}>
                <div className={s.trustTitle}>Trust Score</div>
                <div className={s.trustLabel}>Rank #{minerStats.your_rank} of {minerStats.total_miners} miners · {minerStats.status}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Recent Transactions */}
        <div className={s.panel}>
          <h3 className={s.panelTitle}>⛓️ ResonantGenesis Blockchain Identity</h3>
          {cryptoHash ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: '#8888a0', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Blockchain Hash (SHA-256)</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 8, padding: '10px 14px' }}>
                  <code style={{ fontSize: 12, color: '#a29bfe', wordBreak: 'break-all', flex: 1, fontFamily: 'monospace' }}>0x{cryptoHash}</code>
                  <button onClick={() => { navigator.clipboard.writeText('0x' + cryptoHash); setCopiedHash(true); setTimeout(() => setCopiedHash(false), 2000); }}
                    style={{ background: 'rgba(108,92,231,.15)', border: '1px solid rgba(108,92,231,.3)', borderRadius: 6, padding: '4px 10px', color: '#a29bfe', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap' }}>
                    {copiedHash ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#8888a0', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Hash Sphere Identity</div>
                <code style={{ fontSize: 11, color: '#6b7280', wordBreak: 'break-all', fontFamily: 'monospace' }}>{userHash.slice(0, 16)}...{userHash.slice(-8)}</code>
              </div>
              <div style={{ fontSize: 11, color: '#4ade80', background: 'rgba(74,222,128,.08)', border: '1px solid rgba(74,222,128,.15)', borderRadius: 6, padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content' }}>
                <span>●</span> Anchored on ResonantGenesis Blockchain
              </div>
            </div>
          ) : (
            <div className={s.empty}>Blockchain identity will be generated on your next login.</div>
          )}
        </div>

        <div className={s.panel}>
          <h3 className={s.panelTitle}>📋 Recent Transactions</h3>
          {transactions.length === 0 ? (
            <div className={s.empty}>No transactions yet. Deposit to get started.</div>
          ) : (
            <div className={s.txList}>
              {transactions.slice(0, 8).map(tx => (
                <div key={tx.id} className={s.txRow}>
                  <div className={s.txDot}>{txIcon(tx.tx_type)}</div>
                  <div className={s.txInfo}>
                    <div className={s.txType}>{tx.tx_type.replace(/_/g, ' ')}</div>
                    <div className={s.txMeta}>
                      <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                      {tx.description && <span>{tx.description}</span>}
                      <span className={s.txStatus} style={{ background: `${statusColor(tx.status)}18`, color: statusColor(tx.status) }}>{tx.status}</span>
                    </div>
                  </div>
                  <div className={s.txAmt}>
                    <div className={`${s.txAmtVal} ${tx.tx_type === 'deposit' || tx.tx_type === 'reward' || tx.tx_type === 'sale' ? s.txPlus : s.txMinus}`}>
                      {tx.tx_type === 'deposit' || tx.tx_type === 'reward' || tx.tx_type === 'sale' ? '+' : '-'}{fmt(tx.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Tabs ── */}
      <div className={s.tabs}>
        {(['overview', 'transactions', 'funding', 'withdrawals'] as const).map(tab => (
          <button key={tab} className={`${s.tab} ${activeTab === tab ? s.tabActive : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' ? 'Overview' : tab === 'transactions' ? 'Transactions' : tab === 'funding' ? 'Funding' : 'Withdrawals'}
            {tab === 'transactions' && <span className={s.tabCount}>({transactions.length})</span>}
            {tab === 'funding' && <span className={s.tabCount}>({fundingSources.length})</span>}
            {tab === 'withdrawals' && <span className={s.tabCount}>({withdrawals.length})</span>}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}

      {activeTab === 'overview' && (
        <div className={s.panel}>
          <h3 className={s.panelTitle}>Activity Summary</h3>
          {transactions.length === 0 ? (
            <div className={s.empty}>No activity yet.</div>
          ) : (
            <div className={s.txList}>
              {transactions.slice(0, 10).map(tx => (
                <div key={tx.id} className={s.txRow}>
                  <div className={s.txDot}>{txIcon(tx.tx_type)}</div>
                  <div className={s.txInfo}>
                    <div className={s.txType}>{tx.tx_type.replace(/_/g, ' ')}</div>
                    <div className={s.txMeta}>
                      <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                      {tx.description && <span>{tx.description}</span>}
                    </div>
                  </div>
                  <div className={s.txAmt}>
                    <div className={`${s.txAmtVal} ${tx.tx_type === 'deposit' || tx.tx_type === 'reward' || tx.tx_type === 'sale' ? s.txPlus : s.txMinus}`}>
                      {tx.tx_type === 'deposit' || tx.tx_type === 'reward' || tx.tx_type === 'sale' ? '+' : '-'}{fmt(tx.amount)} {tx.currency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div style={{ overflowX: 'auto' }}>
          {transactions.length === 0 ? (
            <div className={s.empty}>No transactions found.</div>
          ) : (
            <table className={s.detailTable}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Fee</th>
                  <th style={{ textAlign: 'right' }}>Net</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td><span style={{ marginRight: 6 }}>{txIcon(tx.tx_type)}</span>{tx.tx_type.replace(/_/g, ' ')}</td>
                    <td style={{ textAlign: 'right' }} className={s.mono}>{fmt(tx.amount)} {tx.currency}</td>
                    <td style={{ textAlign: 'right' }} className={`${s.mono} ${s.dim}`}>{fmt(tx.fee)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }} className={s.mono}>{fmt(tx.net_amount)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={s.txStatus} style={{ background: `${statusColor(tx.status)}18`, color: statusColor(tx.status) }}>{tx.status}</span>
                    </td>
                    <td className={s.dim}>{new Date(tx.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'funding' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 className={s.panelTitle} style={{ margin: 0 }}>Funding Sources</h3>
            <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => setShowAddFunding(!showAddFunding)}>
              {showAddFunding ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {showAddFunding && (
            <div className={s.panel} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <button className={`${s.btn} ${fundingType === 'crypto_wallet' ? s.btnPrimary : s.btnGhost}`}
                  onClick={() => setFundingType('crypto_wallet')}>🔗 Crypto</button>
                <button className={`${s.btn} ${fundingType === 'card' ? s.btnPrimary : s.btnGhost}`}
                  onClick={() => setFundingType('card')}>💳 Card</button>
              </div>
              {fundingType === 'crypto_wallet' && (
                <>
                  <label className={s.modalLabel}>Blockchain</label>
                  <select className={s.modalSelect} value={fundingChain} onChange={e => setFundingChain(e.target.value)}>
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="optimism">Optimism</option>
                    <option value="base">Base</option>
                    <option value="solana">Solana</option>
                  </select>
                  <label className={s.modalLabel}>Wallet Address</label>
                  <input className={s.modalInput} style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    value={fundingAddress} onChange={e => setFundingAddress(e.target.value)} placeholder="0x..." />
                </>
              )}
              <label className={s.modalLabel}>Nickname</label>
              <input className={s.modalInput} value={fundingNickname} onChange={e => setFundingNickname(e.target.value)} placeholder="e.g. My MetaMask" />
              <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleAddFunding} disabled={actionLoading}>
                {actionLoading ? 'Adding...' : 'Add Source'}
              </button>
            </div>
          )}

          {fundingSources.length === 0 && !showAddFunding ? (
            <div className={s.empty}>No funding sources. Click "+ Add" or connect Web3 above.</div>
          ) : (
            <div>
              {fundingSources.map(src => (
                <div key={src.id} className={s.fundRow}>
                  <div className={s.fundIcon}>{src.source_type === 'card' ? '💳' : '🔗'}</div>
                  <div className={s.fundInfo}>
                    <div className={s.fundName}>{src.source_type.replace(/_/g, ' ')}</div>
                    {src.card_last_four && <div className={s.fundAddr}>•••• {src.card_last_four} ({src.card_brand})</div>}
                    {src.crypto_address && <div className={s.fundAddr}>{src.crypto_address} ({src.crypto_chain})</div>}
                  </div>
                  <div className={s.fundActions}>
                    {src.is_default && <span className={s.fundDefault}>Default</span>}
                    <span style={{ fontSize: 10, color: src.is_verified ? '#34d399' : '#64748b' }}>
                      {src.is_verified ? '✅' : '⏳'}
                    </span>
                    <button className={s.fundRemove} onClick={() => handleRemoveFunding(src.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div>
          {withdrawals.length === 0 ? (
            <div className={s.empty}>No withdrawal requests.</div>
          ) : (
            <div>
              {withdrawals.map(wd => (
                <div key={wd.id} className={s.txRow} style={{ padding: '10px 0' }}>
                  <div className={s.txDot}>⬆️</div>
                  <div className={s.txInfo}>
                    <div className={s.txType}>{fmt(wd.amount)} RGT → {wd.destination_type.replace(/_/g, ' ')}</div>
                    <div className={s.txMeta}>
                      <span>Fee: {fmt(wd.fee)}</span>
                      <span>Net: {fmt(wd.net_amount)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={s.txStatus} style={{ background: `${statusColor(wd.status)}18`, color: statusColor(wd.status) }}>{wd.status}</span>
                    {wd.status === 'pending' && (
                      <button className={`${s.btn}`} style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)', color: '#f87171' }}
                        onClick={() => cancelWithdrawal(wd.id)}>Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DEPOSIT MODAL ── */}
      {showDeposit && (
        <div className={s.overlay} onClick={() => setShowDeposit(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>⬇️ Deposit RGT</h3>
            <label className={s.modalLabel}>Amount (USD)</label>
            <input type="number" min="1" step="0.01" className={s.modalInput}
              value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="10.00" />
            <div className={s.modalActions}>
              <button className={`${s.btn} ${s.btnGhost}`} onClick={() => setShowDeposit(false)}>Cancel</button>
              <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleDeposit} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WITHDRAW MODAL ── */}
      {showWithdraw && (
        <div className={s.overlay} onClick={() => setShowWithdraw(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle}>⬆️ Withdraw RGT</h3>
            <label className={s.modalLabel}>Amount (RGT)</label>
            <input type="number" min="1" step="0.01" className={s.modalInput}
              value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="100.00" />
            <label className={s.modalLabel}>Destination</label>
            <select className={s.modalSelect} value={withdrawDest} onChange={e => setWithdrawDest(e.target.value)}>
              <option value="crypto_wallet">Crypto Wallet</option>
              <option value="bank">Bank Account</option>
            </select>
            {withdrawDest === 'crypto_wallet' && (
              <>
                <label className={s.modalLabel}>Wallet Address</label>
                <input type="text" className={s.modalInput} style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  value={withdrawAddr} onChange={e => setWithdrawAddr(e.target.value)} placeholder="0x..." />
              </>
            )}
            <div className={s.modalActions}>
              <button className={`${s.btn} ${s.btnGhost}`} onClick={() => setShowWithdraw(false)}>Cancel</button>
              <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleWithdraw} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSFER MODAL ── */}
      {showTransfer && (
        <div className={s.overlay} onClick={() => setShowTransfer(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <h3 className={s.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>⛓️</span> Send $RGT
            </h3>
            <label className={s.modalLabel}>RECIPIENT BLOCKCHAIN ADDRESS</label>
            <input type="text" className={s.modalInput} style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
              background: '#0a0f1a', border: '1px solid #2d1b69', color: '#a78bfa',
              letterSpacing: '0.5px',
            }}
              value={transferTo} onChange={e => setTransferTo(e.target.value)}
              placeholder="0x0000000000000000000000000000000000000000000000000000000000000000" />
            <p style={{ color: '#6b7280', fontSize: 10, margin: '4px 0 12px', lineHeight: 1.4 }}>
              Paste the recipient's Blockchain Hash (SHA-256) from their wallet.
              <span style={{ color: '#4b5563' }}> Also accepts email address.</span>
            </p>
            <label className={s.modalLabel}>AMOUNT ($RGT)</label>
            <div style={{ position: 'relative' }}>
              <input type="number" min="0.01" step="0.01" className={s.modalInput} style={{
                paddingRight: 50, fontSize: 18, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
              }}
                value={transferAmount} onChange={e => setTransferAmount(e.target.value)} placeholder="0.00" />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>RGT</span>
            </div>
            <label className={s.modalLabel} style={{ marginTop: 8 }}>MEMO (OPTIONAL)</label>
            <input type="text" className={s.modalInput}
              value={transferDesc} onChange={e => setTransferDesc(e.target.value)} placeholder="What's this for?" />
            {actionMsg && <p style={{ color: actionMsg.includes('complete') ? '#34d399' : '#f87171', fontSize: 11, margin: '8px 0' }}>{actionMsg}</p>}
            <div className={s.modalActions} style={{ marginTop: 12 }}>
              <button className={`${s.btn} ${s.btnGhost}`} onClick={() => setShowTransfer(false)}>Cancel</button>
              <button className={`${s.btn} ${s.btnPrimary}`} style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', padding: '10px 24px',
              }} onClick={handleTransfer} disabled={actionLoading || !transferTo || !transferAmount}>
                {actionLoading ? 'Broadcasting...' : '⛓️ Send on Chain'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
