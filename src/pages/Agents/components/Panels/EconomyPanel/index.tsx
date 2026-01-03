import React, { memo, useState, useCallback, useEffect } from 'react';
import { useEconomyStore, useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import { getChainStats, getLatestBlock } from '../../../../../api/blockchain';
import { fetchBillingOverview } from '../../../../../api/billing';
import styles from './EconomyPanel.module.css';

// ============== ECONOMY PANEL ==============
// Contract: reads [economy, agent], writes [economy]
// Forbidden: [workflow]

type ViewMode = 'wallet' | 'portfolio' | 'staking' | 'history' | 'analytics';

interface EconomyPanelProps {
  className?: string;
}

interface NetworkConfig {
  networkName: string;
  chainId: string;
  rpcUrl: string;
  currentBlock: number;
  tps: number;
  totalTransactions: number;
}

const EconomyPanelComponent: React.FC<EconomyPanelProps> = ({ className }) => {
  const wallet = useEconomyStore(state => state.wallet);
  const transactions = useEconomyStore(state => state.transactions);
  const assets = useEconomyStore(state => state.assets);
  const { credit } = useEconomyStore();
  const agents = useAgentStore(state => state.agents);
  
  const [activeView, setActiveView] = useState<ViewMode>('wallet');
  const [isLoading, setIsLoading] = useState(true);
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>({
    networkName: 'Resonant Network',
    chainId: '---',
    rpcUrl: 'https://rpc.resonant.network',
    currentBlock: 0,
    tps: 0,
    totalTransactions: 0,
  });
  const [billingData, setBillingData] = useState<any>(null);

  // Fetch real data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch blockchain stats
        const [chainStats, latestBlock, billing] = await Promise.allSettled([
          getChainStats(),
          getLatestBlock(),
          fetchBillingOverview(),
        ]);

        if (chainStats.status === 'fulfilled') {
          setNetworkConfig(prev => ({
            ...prev,
            chainId: chainStats.value.chain_id || 'resonant-1',
            currentBlock: chainStats.value.latest_block || 0,
            totalTransactions: chainStats.value.total_transactions || 0,
            tps: Math.round((chainStats.value.total_transactions || 0) / 86400), // Avg TPS
          }));
        }

        if (latestBlock.status === 'fulfilled') {
          setNetworkConfig(prev => ({
            ...prev,
            currentBlock: latestBlock.value.block_number || prev.currentBlock,
          }));
        }

        if (billing.status === 'fulfilled') {
          setBillingData(billing.value);
        }
      } catch (err) {
        console.error('Failed to fetch economy data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalBalance = billingData?.usage?.credits_balance || wallet.totalBalance || agents.reduce((sum, a) => sum + a.walletBalance, 0);
  const todaySpent = billingData?.usage?.daily_spent || wallet.dailySpent || agents.reduce((sum, a) => sum + a.costToday, 0);
  const portfolioValue = assets.reduce((sum, a) => sum + a.valueUsd, 0);

  const handleFundWallet = useCallback(() => {
    const amount = prompt('Enter amount to fund:');
    if (!amount) return;
    credit(parseFloat(amount), 'Wallet Funded');
  }, [credit]);

  // Wallet addresses from billing data
  const walletAddresses = billingData?.wallets || [];
  const hasWallets = walletAddresses.length > 0;

  // Staking pools from billing data
  const stakingPools = billingData?.staking_pools || [];
  const hasStakingPools = stakingPools.length > 0;

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.Economy /> Wallet & Economy</h2>
        <div className={styles.viewTabs}>
          {(['wallet', 'portfolio', 'staking', 'history', 'analytics'] as ViewMode[]).map(view => (
            <button
              key={view}
              className={`${styles.viewTab} ${activeView === view ? styles.active : ''}`}
              onClick={() => setActiveView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.panelContent}>
        {/* Stats Bar */}
        <div className={styles.statsBar}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Balance</span>
            <span className={styles.statValue}>${totalBalance.toFixed(2)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Today Spent</span>
            <span className={styles.statValue}>${todaySpent.toFixed(2)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Daily Limit</span>
            <span className={styles.statValue}>${wallet.dailyLimit || 500}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Portfolio</span>
            <span className={styles.statValue}>${portfolioValue.toFixed(2)}</span>
          </div>
        </div>

        {/* Wallet View */}
        {activeView === 'wallet' && (
          <>
            {/* Resonant Network Section */}
            <div className={styles.networkSection}>
              <h3><Icons.Blockchain /> {networkConfig.networkName} {isLoading && '(loading...)'}</h3>
              <div className={styles.networkGrid}>
                <div className={styles.networkItem}>
                  <label>Chain ID</label>
                  <span>{networkConfig.chainId}</span>
                </div>
                <div className={styles.networkItem}>
                  <label>RPC URL</label>
                  <code>{networkConfig.rpcUrl}</code>
                </div>
                <div className={styles.networkItem}>
                  <label>Current Block</label>
                  <span>{networkConfig.currentBlock.toLocaleString()}</span>
                </div>
                <div className={styles.networkItem}>
                  <label>TPS</label>
                  <span>{networkConfig.tps.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Multi-chain Wallets */}
            <div className={styles.walletsSection}>
              <h3><Icons.Wallet /> Connected Wallets</h3>
              <div className={styles.walletsList}>
                {hasWallets ? walletAddresses.map((w: any, i: number) => (
                  <div key={i} className={`${styles.walletItem} ${w.chain === 'Resonant Network' ? styles.primary : ''}`}>
                    <span className={styles.walletChain}>{w.chain}</span>
                    <code className={styles.walletAddress}>{w.address}</code>
                    <span className={styles.walletBalance}>{w.balance.toFixed(2)} {w.symbol}</span>
                    <button 
                      className={styles.copyBtn}
                      onClick={() => navigator.clipboard.writeText(w.address)}
                    >
                      <Icons.Copy />
                    </button>
                  </div>
                )) : (
                  <div className={styles.emptyState}>
                    No wallets connected. Connect a wallet to manage your funds.
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.walletActions}>
              <button className={styles.primaryBtn} onClick={handleFundWallet}>
                <Icons.Plus /> Fund Wallet
              </button>
              <button className={styles.secondaryBtn}>
                <Icons.ArrowUp /> Send
              </button>
              <button className={styles.secondaryBtn}>
                <Icons.ArrowDown /> Receive
              </button>
            </div>

            {/* Recent Transactions */}
            <div className={styles.transactionsSection}>
              <h3>Recent Transactions</h3>
              <div className={styles.transactionsList}>
                {transactions.length > 0 ? transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className={styles.transaction}>
                    <span className={`${styles.txType} ${tx.type === 'receive' ? styles.receive : ''}`}>
                      {tx.type.toUpperCase()}
                    </span>
                    <span className={styles.txDesc}>{tx.description}</span>
                    <span className={`${styles.txAmount} ${tx.type === 'receive' ? styles.positive : ''}`}>
                      {tx.type === 'receive' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                )) : (
                  <div className={styles.emptyState}>No transactions yet</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Portfolio View */}
        {activeView === 'portfolio' && (
          <div className={styles.portfolioSection}>
            <h3>Asset Portfolio</h3>
            <div className={styles.assetsList}>
              {assets.length > 0 ? assets.map(asset => (
                <div key={asset.id} className={styles.assetItem}>
                  <div className={styles.assetInfo}>
                    <span className={styles.assetName}>{asset.name}</span>
                    <span className={styles.assetSymbol}>{asset.symbol}</span>
                  </div>
                  <div className={styles.assetBalance}>
                    <span>{asset.balance.toLocaleString()}</span>
                    <span className={styles.assetValue}>${asset.valueUsd.toFixed(2)}</span>
                  </div>
                  <span className={`${styles.assetChange} ${asset.change24h >= 0 ? styles.positive : styles.negative}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(1)}%
                  </span>
                </div>
              )) : (
                <div className={styles.emptyState}>No assets in portfolio</div>
              )}
            </div>
          </div>
        )}

        {/* Staking View */}
        {activeView === 'staking' && (
          <div className={styles.stakingSection}>
            <h3>Staking Pools</h3>
            <div className={styles.poolsList}>
              {hasStakingPools ? stakingPools.map((pool: any) => (
                <div key={pool.id} className={styles.poolItem}>
                  <div className={styles.poolHeader}>
                    <span className={styles.poolName}>{pool.name}</span>
                    <span className={styles.poolApy}>{pool.apy}% APY</span>
                  </div>
                  <div className={styles.poolStats}>
                    <div>
                      <label>Total Staked</label>
                      <span>${pool.totalStaked.toLocaleString()}</span>
                    </div>
                    <div>
                      <label>Your Stake</label>
                      <span>${pool.yourStake.toLocaleString()}</span>
                    </div>
                    <div>
                      <label>Rewards</label>
                      <span className={styles.rewards}>${pool.rewards.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className={styles.poolActions}>
                    <button className={styles.stakeBtn}>Stake</button>
                    {pool.yourStake > 0 && (
                      <>
                        <button className={styles.unstakeBtn}>Unstake</button>
                        <button className={styles.claimBtn}>Claim</button>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className={styles.emptyState}>
                  No staking pools available. Staking will be available when the Resonant Network launches.
                </div>
              )}
            </div>
          </div>
        )}

        {/* History View */}
        {activeView === 'history' && (
          <div className={styles.historySection}>
            <h3>Transaction History</h3>
            <div className={styles.transactionsList}>
              {transactions.map(tx => (
                <div key={tx.id} className={styles.transaction}>
                  <span className={`${styles.txType} ${tx.type === 'receive' ? styles.receive : ''}`}>
                    {tx.type.toUpperCase()}
                  </span>
                  <span className={styles.txDesc}>{tx.description}</span>
                  <span className={`${styles.txAmount} ${tx.type === 'receive' ? styles.positive : ''}`}>
                    {tx.type === 'receive' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className={styles.emptyState}>No transaction history</div>
              )}
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className={styles.analyticsSection}>
            <h3>Spending Analytics</h3>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <h4>Daily Spending</h4>
                <div className={styles.chartMessage}>
                  <p>Connect to billing service to view spending analytics</p>
                </div>
              </div>
              <div className={styles.analyticsCard}>
                <h4>Cost by Agent</h4>
                <div className={styles.agentCosts}>
                  {agents.slice(0, 5).map(agent => (
                    <div key={agent.id} className={styles.agentCostRow}>
                      <span>{agent.name}</span>
                      <span>${agent.costToday.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const EconomyPanel = memo(EconomyPanelComponent);
export default EconomyPanel;
