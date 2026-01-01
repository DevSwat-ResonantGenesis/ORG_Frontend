/**
 * Crypto Service API - Wallet, tokenization, receipts, funding, withdrawals
 */

import client from './client';

// Types
export interface Wallet {
  id: string;
  user_id: string;
  token_balance: string;
  pending_balance: string;
  locked_balance: string;
  is_verified: boolean;
  kyc_status: 'none' | 'pending' | 'verified' | 'rejected';
}

export interface Balance {
  available: string;
  pending: string;
  locked: string;
  total: string;
}

export interface Transaction {
  id: string;
  tx_type: 'deposit' | 'withdrawal' | 'purchase' | 'sale' | 'reward' | 'fee' | 'transfer';
  amount: string;
  fee: string;
  net_amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  created_at: string;
}

export interface DepositIntent {
  intent_id: string;
  amount_usd: string;
  tokens_to_receive: string;
  client_secret?: string;
  status: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: string;
  fee: string;
  net_amount: string;
  destination_type: 'bank' | 'crypto_wallet';
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
}

export interface FundingSource {
  id: string;
  source_type: 'card' | 'bank' | 'crypto_wallet';
  card_last_four?: string;
  card_brand?: string;
  crypto_address?: string;
  crypto_chain?: string;
  is_default: boolean;
  is_verified: boolean;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  receipt_type: string;
  amount: string;
  currency: string;
  content_hash: string;
  blockchain_anchored: boolean;
  anchor_tx_hash?: string;
  issued_at: string;
}

export interface TokenStats {
  total_supply: string;
  circulating_supply: string;
  locked_supply: string;
  current_price_usd: string;
  market_cap_usd: string;
}

// Wallet APIs
export const createWallet = async (): Promise<Wallet> => {
  const res = await client.post('/crypto/wallet');
  return res.data;
};

export const getWallet = async (): Promise<Wallet> => {
  const res = await client.get('/crypto/wallet');
  return res.data;
};

export const getBalance = async (): Promise<Balance> => {
  const res = await client.get('/crypto/wallet/balance');
  return res.data;
};

// Deposit APIs
export const createDeposit = async (amountUsd: number): Promise<DepositIntent> => {
  const res = await client.post('/crypto/deposit', { amount_usd: amountUsd });
  return res.data;
};

// Withdrawal APIs
export const requestWithdrawal = async (data: {
  amount: number;
  destination_type: 'bank' | 'crypto_wallet';
  destination_id?: string;
  destination_address?: string;
}): Promise<WithdrawalRequest> => {
  const res = await client.post('/crypto/withdraw', data);
  return res.data;
};

export const listWithdrawals = async (status?: string): Promise<WithdrawalRequest[]> => {
  const params = status ? { status_filter: status } : {};
  const res = await client.get('/crypto/withdrawals', { params });
  return res.data;
};

export const cancelWithdrawal = async (withdrawalId: string): Promise<void> => {
  await client.post(`/crypto/withdrawals/${withdrawalId}/cancel`);
};

// Transaction APIs
export const listTransactions = async (
  txType?: string,
  limit: number = 50,
  offset: number = 0
): Promise<Transaction[]> => {
  const params: Record<string, unknown> = { limit, offset };
  if (txType) params.tx_type = txType;
  const res = await client.get('/crypto/transactions', { params });
  return res.data;
};

export const getTransaction = async (txId: string): Promise<Transaction> => {
  const res = await client.get(`/crypto/transactions/${txId}`);
  return res.data;
};

// Transfer APIs
export const transferTokens = async (
  toUserId: string,
  amount: number,
  description?: string
): Promise<{ status: string; transaction_id: string; amount: string }> => {
  const res = await client.post('/crypto/transfer', {
    to_user_id: toUserId,
    amount,
    description,
  });
  return res.data;
};

// Funding Source APIs
export const addFundingSource = async (data: {
  source_type: 'card' | 'crypto_wallet';
  stripe_payment_method_id?: string;
  crypto_address?: string;
  crypto_chain?: string;
  nickname?: string;
}): Promise<FundingSource> => {
  const res = await client.post('/crypto/funding-sources', data);
  return res.data;
};

export const listFundingSources = async (): Promise<FundingSource[]> => {
  const res = await client.get('/crypto/funding-sources');
  return res.data;
};

export const removeFundingSource = async (sourceId: string): Promise<void> => {
  await client.delete(`/crypto/funding-sources/${sourceId}`);
};

// Receipt APIs
export const getReceipt = async (receiptId: string): Promise<Receipt> => {
  const res = await client.get(`/crypto/receipts/${receiptId}`);
  return res.data;
};

export const getReceiptByTransaction = async (txId: string): Promise<Receipt> => {
  const res = await client.get(`/crypto/receipts/transaction/${txId}`);
  return res.data;
};

// Token Stats APIs
export const getTokenStats = async (): Promise<TokenStats> => {
  const res = await client.get('/crypto/token/stats');
  return res.data;
};

export const getTokenPrice = async (): Promise<{ token: string; price_usd: string }> => {
  const res = await client.get('/crypto/token/price');
  return res.data;
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const res = await client.get('/crypto/health');
  return res.data;
};

export default {
  createWallet,
  getWallet,
  getBalance,
  createDeposit,
  requestWithdrawal,
  listWithdrawals,
  cancelWithdrawal,
  listTransactions,
  getTransaction,
  transferTokens,
  addFundingSource,
  listFundingSources,
  removeFundingSource,
  getReceipt,
  getReceiptByTransaction,
  getTokenStats,
  getTokenPrice,
  healthCheck,
};
