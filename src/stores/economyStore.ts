import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Transaction, Asset, WalletState, TransactionType, TransactionStatus } from '../types';

// ============== ECONOMY DOMAIN STORE ==============

interface EconomyState {
  wallet: WalletState;
  transactions: Transaction[];
  assets: Asset[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setWallet: (wallet: WalletState) => void;
  updateWallet: (updates: Partial<WalletState>) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setAssets: (assets: Asset[]) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  
  // Economic Actions
  debit: (amount: number, description: string, agentId?: string) => void;
  credit: (amount: number, description: string, agentId?: string) => void;
  stake: (amount: number, poolId: string) => void;
  unstake: (amount: number, poolId: string) => void;
  
  // Loading States
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialWallet: WalletState = {
  totalBalance: 0,
  availableBalance: 0,
  stakedBalance: 0,
  pendingBalance: 0,
  dailySpent: 0,
  dailyLimit: 500,
};

const initialState: Pick<EconomyState, 'wallet' | 'transactions' | 'assets' | 'loading' | 'error'> = {
  wallet: initialWallet,
  transactions: [],
  assets: [],
  loading: false,
  error: null,
};

export const useEconomyStore = create<EconomyState>()(
  devtools(
    (set) => ({
        ...initialState,
        
        setWallet: (wallet: WalletState) => set({ wallet }),
        
        updateWallet: (updates: Partial<WalletState>) => set((state) => ({
          wallet: { ...state.wallet, ...updates }
        })),
        
        setTransactions: (transactions: Transaction[]) => set({ transactions }),
        
        addTransaction: (transaction: Transaction) => set((state) => ({
          transactions: [transaction, ...state.transactions]
        })),
        
        setAssets: (assets: Asset[]) => set({ assets }),
        
        updateAsset: (id: string, updates: Partial<Asset>) => set((state) => ({
          assets: state.assets.map((a: Asset) =>
            a.id === id ? { ...a, ...updates } : a
          )
        })),
        
        debit: (amount: number, description: string, agentId?: string) => set((state) => {
          if (state.wallet.availableBalance < amount) {
            return { error: 'Insufficient balance' };
          }
          const transaction: Transaction = {
            id: `tx-${Date.now()}`,
            type: 'spend' as TransactionType,
            amount,
            currency: 'USD',
            description,
            status: 'completed' as TransactionStatus,
            hash: null,
            timestamp: new Date(),
            agentId: agentId || null,
          };
          return {
            wallet: {
              ...state.wallet,
              availableBalance: state.wallet.availableBalance - amount,
              totalBalance: state.wallet.totalBalance - amount,
              dailySpent: state.wallet.dailySpent + amount,
            },
            transactions: [transaction, ...state.transactions],
          };
        }),
        
        credit: (amount: number, description: string, agentId?: string) => set((state) => {
          const transaction: Transaction = {
            id: `tx-${Date.now()}`,
            type: 'receive' as TransactionType,
            amount,
            currency: 'USD',
            description,
            status: 'completed' as TransactionStatus,
            hash: null,
            timestamp: new Date(),
            agentId: agentId || null,
          };
          return {
            wallet: {
              ...state.wallet,
              availableBalance: state.wallet.availableBalance + amount,
              totalBalance: state.wallet.totalBalance + amount,
            },
            transactions: [transaction, ...state.transactions],
          };
        }),
        
        stake: (amount: number, poolId: string) => set((state) => {
          if (state.wallet.availableBalance < amount) {
            return { error: 'Insufficient balance for staking' };
          }
          const transaction: Transaction = {
            id: `tx-${Date.now()}`,
            type: 'stake' as TransactionType,
            amount,
            currency: 'USD',
            description: `Staked to pool ${poolId}`,
            status: 'completed' as TransactionStatus,
            hash: null,
            timestamp: new Date(),
            agentId: null,
          };
          return {
            wallet: {
              ...state.wallet,
              availableBalance: state.wallet.availableBalance - amount,
              stakedBalance: state.wallet.stakedBalance + amount,
            },
            transactions: [transaction, ...state.transactions],
          };
        }),
        
        unstake: (amount: number, poolId: string) => set((state) => {
          if (state.wallet.stakedBalance < amount) {
            return { error: 'Insufficient staked balance' };
          }
          const transaction: Transaction = {
            id: `tx-${Date.now()}`,
            type: 'unstake' as TransactionType,
            amount,
            currency: 'USD',
            description: `Unstaked from pool ${poolId}`,
            status: 'pending' as TransactionStatus,
            hash: null,
            timestamp: new Date(),
            agentId: null,
          };
          return {
            wallet: {
              ...state.wallet,
              stakedBalance: state.wallet.stakedBalance - amount,
              pendingBalance: state.wallet.pendingBalance + amount,
            },
            transactions: [transaction, ...state.transactions],
          };
        }),
        
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),
        reset: () => set(initialState),
      }),
    { name: 'EconomyStore' }
  )
);

// Selectors
export const selectWallet = (state: EconomyState) => state.wallet;
export const selectTransactions = (state: EconomyState) => state.transactions;
export const selectAssets = (state: EconomyState) => state.assets;
export const selectTotalValue = (state: EconomyState) => 
  state.wallet.totalBalance + state.assets.reduce((sum, a) => sum + a.valueUsd, 0);
