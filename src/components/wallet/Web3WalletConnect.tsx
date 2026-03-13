/**
 * Web3 Wallet Connection Component
 * Connects MetaMask/injected wallets to the platform.
 * Links external wallet address to the user's internal RGT wallet.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatEther, formatUnits } from 'ethers';
import fastapiClient from '../../api/fastapiClient';

// Supported chains
const CHAINS: Record<number, { name: string; symbol: string; explorer: string; rpc?: string }> = {
  1: { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io' },
  137: { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com' },
  8453: { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org' },
  42161: { name: 'Arbitrum', symbol: 'ETH', explorer: 'https://arbiscan.io' },
  10: { name: 'Optimism', symbol: 'ETH', explorer: 'https://optimistic.etherscan.io' },
  11155111: { name: 'Sepolia', symbol: 'SepoliaETH', explorer: 'https://sepolia.etherscan.io' },
};

interface Web3State {
  connected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  ensName: string | null;
}

interface Props {
  onWalletLinked?: (address: string, chainId: number) => void;
  compact?: boolean;
}

const S = {
  container: {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  } as React.CSSProperties,
  title: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as React.CSSProperties,
  badge: (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    background: `${color}20`,
    color,
    border: `1px solid ${color}40`,
  } as React.CSSProperties),
  connectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  } as React.CSSProperties,
  disconnectBtn: {
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid #374151',
    borderRadius: 6,
    color: '#9ca3af',
    fontSize: 12,
    cursor: 'pointer',
  } as React.CSSProperties,
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    marginBottom: 16,
  } as React.CSSProperties,
  infoCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 8,
    padding: '12px 16px',
  } as React.CSSProperties,
  label: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: 4,
  } as React.CSSProperties,
  value: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'monospace',
    wordBreak: 'break-all' as const,
  } as React.CSSProperties,
  linkBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  } as React.CSSProperties,
  networkSelect: {
    padding: '6px 10px',
    background: '#0f172a',
    border: '1px solid #374151',
    borderRadius: 6,
    color: '#e5e7eb',
    fontSize: 12,
    cursor: 'pointer',
  } as React.CSSProperties,
  alert: (type: 'success' | 'error' | 'info') => ({
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 12,
    background: type === 'success' ? '#052e16' : type === 'error' ? '#450a0a' : '#0c1a3d',
    color: type === 'success' ? '#86efac' : type === 'error' ? '#fca5a5' : '#93c5fd',
    border: `1px solid ${type === 'success' ? '#16a34a40' : type === 'error' ? '#dc262640' : '#3b82f640'}`,
  } as React.CSSProperties),
  noWallet: {
    textAlign: 'center' as const,
    padding: '24px 16px',
  } as React.CSSProperties,
};

export default function Web3WalletConnect({ onWalletLinked, compact }: Props) {
  const [state, setState] = useState<Web3State>({
    connected: false,
    address: null,
    chainId: null,
    balance: null,
    ensName: null,
  });
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [hasProvider, setHasProvider] = useState(false);

  // Check for injected provider
  useEffect(() => {
    const w = window as any;
    setHasProvider(!!w.ethereum);

    if (w.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setState({ connected: false, address: null, chainId: null, balance: null, ensName: null });
          setLinked(false);
        } else {
          setState(prev => ({ ...prev, address: accounts[0] }));
          refreshBalance(accounts[0]);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const chainId = parseInt(chainIdHex, 16);
        setState(prev => ({ ...prev, chainId }));
        if (state.address) refreshBalance(state.address);
      };

      w.ethereum.on('accountsChanged', handleAccountsChanged);
      w.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      w.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet(true);
        }
      }).catch(() => {});

      return () => {
        w.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        w.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const refreshBalance = useCallback(async (address: string) => {
    try {
      const w = window as any;
      if (!w.ethereum) return;
      const provider = new BrowserProvider(w.ethereum);
      const bal = await provider.getBalance(address);
      setState(prev => ({ ...prev, balance: formatEther(bal) }));
    } catch {}
  }, []);

  const connectWallet = useCallback(async (silent = false) => {
    const w = window as any;
    if (!w.ethereum) {
      if (!silent) setMessage({ type: 'error', text: 'No wallet detected. Install MetaMask or another Web3 wallet.' });
      return;
    }

    try {
      setMessage(null);
      const provider = new BrowserProvider(w.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length === 0) return;

      const address = accounts[0];
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const bal = await provider.getBalance(address);

      // Try ENS reverse lookup (only on mainnet)
      let ensName: string | null = null;
      if (chainId === 1) {
        try {
          ensName = await provider.lookupAddress(address);
        } catch {}
      }

      setState({
        connected: true,
        address,
        chainId,
        balance: formatEther(bal),
        ensName,
      });

      if (!silent) setMessage({ type: 'success', text: 'Wallet connected successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      if (!silent) {
        const msg = err?.code === 4001 ? 'Connection rejected by user' : (err?.message || 'Failed to connect wallet');
        setMessage({ type: 'error', text: msg });
      }
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setState({ connected: false, address: null, chainId: null, balance: null, ensName: null });
    setLinked(false);
    setMessage(null);
  }, []);

  const switchNetwork = useCallback(async (targetChainId: number) => {
    const w = window as any;
    if (!w.ethereum) return;

    try {
      await w.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + targetChainId.toString(16) }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        setMessage({ type: 'info', text: 'Network not found in wallet. Please add it manually.' });
      } else {
        setMessage({ type: 'error', text: err?.message || 'Failed to switch network' });
      }
    }
  }, []);

  const linkWalletToAccount = useCallback(async () => {
    if (!state.address || !state.chainId) return;

    setLinking(true);
    setMessage(null);

    try {
      // Sign a message to prove ownership
      const w = window as any;
      const provider = new BrowserProvider(w.ethereum);
      const signer = await provider.getSigner();
      const timestamp = Date.now();
      const messageToSign = `Link wallet ${state.address} to ResonantGenesis account. Timestamp: ${timestamp}`;
      const signature = await signer.signMessage(messageToSign);

      // Send to backend to link wallet
      await fastapiClient.post('/crypto/funding-sources', {
        source_type: 'crypto_wallet',
        crypto_address: state.address,
        crypto_chain: CHAINS[state.chainId]?.name.toLowerCase() || 'ethereum',
        nickname: `${CHAINS[state.chainId]?.name || 'Unknown'} Wallet`,
        signature,
        message: messageToSign,
        timestamp,
      });

      setLinked(true);
      setMessage({ type: 'success', text: 'Wallet linked to your account! You can now use it for deposits and withdrawals.' });
      onWalletLinked?.(state.address, state.chainId);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to link wallet';
      setMessage({ type: 'error', text: detail });
    } finally {
      setLinking(false);
    }
  }, [state.address, state.chainId, onWalletLinked]);

  const chain = state.chainId ? CHAINS[state.chainId] : null;
  const shortAddr = state.address
    ? `${state.address.slice(0, 6)}...${state.address.slice(-4)}`
    : '';

  // Compact mode: just show connect button or connected status
  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {state.connected ? (
          <>
            <span style={S.badge('#22c55e')}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              {shortAddr}
            </span>
            {chain && <span style={{ color: '#6b7280', fontSize: 11 }}>{chain.name}</span>}
          </>
        ) : (
          <button onClick={() => connectWallet()} style={{ ...S.connectBtn, padding: '6px 14px', fontSize: 12 }}>
            Connect Wallet
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title as any}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M22 10H2" />
            <path d="M6 2v4" />
            <path d="M18 2v4" />
            <circle cx="18" cy="16" r="2" />
          </svg>
          Web3 Wallet
          {state.connected && (
            <span style={S.badge('#22c55e')}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
              Connected
            </span>
          )}
          {linked && (
            <span style={S.badge('#6366f1')}>Linked</span>
          )}
        </div>

        {state.connected && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={state.chainId || ''}
              onChange={e => switchNetwork(Number(e.target.value))}
              style={S.networkSelect}
            >
              {Object.entries(CHAINS).map(([id, c]) => (
                <option key={id} value={id}>{c.name}</option>
              ))}
            </select>
            <button onClick={disconnectWallet} style={S.disconnectBtn}>Disconnect</button>
          </div>
        )}
      </div>

      {message && <div style={S.alert(message.type)}>{message.text}</div>}

      {!hasProvider && (
        <div style={S.noWallet}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}>
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M22 10H2" />
            <circle cx="18" cy="16" r="2" />
          </svg>
          <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 12 }}>No Web3 wallet detected</p>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...S.connectBtn, textDecoration: 'none', display: 'inline-flex' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
            Install MetaMask
          </a>
          <p style={{ color: '#6b7280', fontSize: 11, marginTop: 8 }}>Or use any EVM-compatible wallet browser extension</p>
        </div>
      )}

      {hasProvider && !state.connected && (
        <div style={S.noWallet}>
          <button onClick={() => connectWallet()} style={S.connectBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="14" rx="2" />
              <path d="M22 10H2" />
              <circle cx="18" cy="16" r="2" />
            </svg>
            Connect MetaMask
          </button>
          <p style={{ color: '#6b7280', fontSize: 11, marginTop: 8 }}>Connect your wallet to deposit, withdraw, and manage crypto assets</p>
        </div>
      )}

      {state.connected && state.address && (
        <>
          <div style={S.infoGrid}>
            <div style={S.infoCard}>
              <div style={S.label}>Address</div>
              <div style={S.value}>
                {state.ensName ? (
                  <div>
                    <div style={{ color: '#a78bfa', fontSize: 13, marginBottom: 2 }}>{state.ensName}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{shortAddr}</div>
                  </div>
                ) : shortAddr}
              </div>
              {chain && (
                <a
                  href={`${chain.explorer}/address/${state.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#6366f1', fontSize: 11, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}
                >
                  View on {chain.name}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
              )}
            </div>
            <div style={S.infoCard}>
              <div style={S.label}>Balance</div>
              <div style={S.value}>
                {state.balance ? `${parseFloat(state.balance).toFixed(4)} ${chain?.symbol || 'ETH'}` : '...'}
              </div>
            </div>
            <div style={S.infoCard}>
              <div style={S.label}>Network</div>
              <div style={{ ...S.value, fontFamily: 'inherit' }}>
                {chain ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                    {chain.name}
                  </span>
                ) : (
                  <span style={{ color: '#f59e0b' }}>Unknown (Chain ID: {state.chainId})</span>
                )}
              </div>
            </div>
          </div>

          {!linked && (
            <button
              onClick={linkWalletToAccount}
              disabled={linking}
              style={{ ...S.linkBtn, opacity: linking ? 0.6 : 1 }}
            >
              {linking ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing &amp; Linking...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  Link Wallet to Account
                </>
              )}
            </button>
          )}

          {linked && (
            <div style={S.alert('success')}>
              <strong>Wallet linked!</strong> This address is now associated with your ResonantGenesis account. You can use it for deposits and withdrawals.
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
