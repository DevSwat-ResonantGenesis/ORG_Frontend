/**
 * ADVANCED BLOCKCHAIN API
 * =======================
 * 
 * Frontend API client for advanced blockchain features:
 * - Smart Contracts
 * - Zero-Knowledge Proofs
 * - Sharding
 * - Cross-Chain Bridge
 */

import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

// ============== SMART CONTRACTS ==============

export interface SmartContract {
  id: string;
  name: string;
  code: string;
  owner: string;
  state: Record<string, any>;
  gas_used: number;
  deployed_at: string;
}

export interface ContractCallResult {
  success: boolean;
  result: any;
  gas_used: number;
  events: ContractEvent[];
  error?: string;
}

export interface ContractEvent {
  name: string;
  args: Record<string, any>;
  timestamp: string;
}

export interface DeployContractRequest {
  name: string;
  code: string;
  owner: string;
  initial_state?: Record<string, any>;
}

export interface CallContractRequest {
  method: string;
  args: Record<string, any>;
  caller: string;
  gas_limit?: number;
}

/**
 * Deploy a new smart contract.
 */
export const deployContract = async (
  request: DeployContractRequest
): Promise<SmartContract> => {
  try {
    const response = await fastapiClient.post('/advanced/contracts/deploy', request);
    logger.info('Contract deployed', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to deploy contract', error);
    throw error;
  }
};

/**
 * Call a smart contract method.
 */
export const callContract = async (
  contractId: string,
  request: CallContractRequest
): Promise<ContractCallResult> => {
  try {
    const response = await fastapiClient.post(`/advanced/contracts/${contractId}/call`, request);
    return response.data;
  } catch (error) {
    logger.error('Contract call failed', error);
    throw error;
  }
};

/**
 * Get contract details.
 */
export const getContract = async (contractId: string): Promise<SmartContract> => {
  const response = await fastapiClient.get(`/advanced/contracts/${contractId}`);
  return response.data;
};

/**
 * Get smart contracts statistics.
 */
export const getContractStats = async (): Promise<{
  total_contracts: number;
  total_calls: number;
  total_gas_used: number;
}> => {
  const response = await fastapiClient.get('/advanced/contracts/stats');
  return response.data;
};

// ============== ZERO-KNOWLEDGE PROOFS ==============

export interface Commitment {
  commitment: string;
  blinding_factor: string;
}

export interface ZKProof {
  proof_type: string;
  proof_data: Record<string, any>;
  verified: boolean;
}

export interface PrivateTransaction {
  id: string;
  commitment: string;
  nullifier: string;
  proof: ZKProof;
  status: string;
  created_at: string;
}

/**
 * Create a Pedersen commitment.
 */
export const createCommitment = async (
  value: number
): Promise<Commitment> => {
  const response = await fastapiClient.post('/advanced/zk/commitment', { value });
  return response.data;
};

/**
 * Generate a knowledge proof (Schnorr protocol).
 */
export const proveKnowledge = async (
  secret: string,
  commitment: string
): Promise<ZKProof> => {
  const response = await fastapiClient.post('/advanced/zk/prove/knowledge', {
    secret,
    commitment
  });
  return response.data;
};

/**
 * Generate a range proof.
 */
export const proveRange = async (
  value: number,
  minValue: number,
  maxValue: number
): Promise<ZKProof> => {
  const response = await fastapiClient.post('/advanced/zk/prove/range', {
    value,
    min_value: minValue,
    max_value: maxValue
  });
  return response.data;
};

/**
 * Create a private transaction.
 */
export const createPrivateTransaction = async (
  sender: string,
  recipient: string,
  amount: number
): Promise<PrivateTransaction> => {
  try {
    const response = await fastapiClient.post('/advanced/zk/private-transaction', {
      sender,
      recipient,
      amount
    });
    logger.info('Private transaction created', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to create private transaction', error);
    throw error;
  }
};

/**
 * Verify a private transaction.
 */
export const verifyPrivateTransaction = async (
  transactionId: string
): Promise<{ verified: boolean; reason?: string }> => {
  const response = await fastapiClient.post(`/advanced/zk/verify-transaction/${transactionId}`);
  return response.data;
};

// ============== SHARDING ==============

export interface Shard {
  id: string;
  address_range_start: string;
  address_range_end: string;
  block_count: number;
  transaction_count: number;
  validators: string[];
}

export interface ShardTransaction {
  id: string;
  from_address: string;
  to_address: string;
  amount: number;
  shard_id: string;
  cross_shard: boolean;
  status: string;
}

/**
 * Submit a transaction to a shard.
 */
export const submitShardTransaction = async (
  fromAddress: string,
  toAddress: string,
  amount: number,
  data?: Record<string, any>
): Promise<ShardTransaction> => {
  try {
    const response = await fastapiClient.post('/advanced/shards/transaction', {
      from_address: fromAddress,
      to_address: toAddress,
      amount,
      data
    });
    return response.data;
  } catch (error) {
    logger.error('Shard transaction failed', error);
    throw error;
  }
};

/**
 * Get shard details.
 */
export const getShard = async (shardId: string): Promise<Shard> => {
  const response = await fastapiClient.get(`/advanced/shards/${shardId}`);
  return response.data;
};

/**
 * Add a new shard (admin only).
 */
export const addShard = async (
  shardId: string,
  rangeStart: string,
  rangeEnd: string
): Promise<Shard> => {
  const response = await fastapiClient.post('/advanced/shards/add', {
    shard_id: shardId,
    range_start: rangeStart,
    range_end: rangeEnd
  });
  return response.data;
};

/**
 * Rebalance shards (admin only).
 */
export const rebalanceShards = async (): Promise<{
  rebalanced: boolean;
  shards_affected: number;
}> => {
  const response = await fastapiClient.post('/advanced/shards/rebalance');
  return response.data;
};

// ============== CROSS-CHAIN BRIDGE ==============

export interface BridgeTransaction {
  id: string;
  source_chain: string;
  target_chain: string;
  asset: string;
  amount: number;
  sender: string;
  recipient: string;
  status: string;
  created_at: string;
}

export interface AtomicSwap {
  id: string;
  initiator: string;
  participant: string;
  initiator_asset: string;
  participant_asset: string;
  initiator_amount: number;
  participant_amount: number;
  hashlock: string;
  timelock: string;
  status: string;
}

export interface CrossChainMessage {
  id: string;
  source_chain: string;
  target_chain: string;
  payload: Record<string, any>;
  status: string;
}

/**
 * Initiate a cross-chain bridge transfer.
 */
export const initiateBridgeTransfer = async (
  sourceChain: string,
  targetChain: string,
  asset: string,
  amount: number,
  sender: string,
  recipient: string
): Promise<BridgeTransaction> => {
  try {
    const response = await fastapiClient.post('/advanced/bridge/initiate', {
      source_chain: sourceChain,
      target_chain: targetChain,
      asset,
      amount,
      sender,
      recipient
    });
    logger.info('Bridge transfer initiated', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to initiate bridge transfer', error);
    throw error;
  }
};

/**
 * Lock assets on source chain.
 */
export const lockBridgeAssets = async (
  transactionId: string,
  proof: string
): Promise<{ locked: boolean; lock_tx: string }> => {
  const response = await fastapiClient.post(`/advanced/bridge/${transactionId}/lock`, { proof });
  return response.data;
};

/**
 * Relay proof to target chain.
 */
export const relayBridgeProof = async (
  transactionId: string,
  lockProof: string
): Promise<{ relayed: boolean; relay_tx: string }> => {
  const response = await fastapiClient.post(`/advanced/bridge/${transactionId}/relay`, {
    lock_proof: lockProof
  });
  return response.data;
};

/**
 * Mint assets on target chain.
 */
export const mintBridgeAssets = async (
  transactionId: string,
  relayProof: string
): Promise<{ minted: boolean; mint_tx: string }> => {
  const response = await fastapiClient.post(`/advanced/bridge/${transactionId}/mint`, {
    relay_proof: relayProof
  });
  return response.data;
};

/**
 * Initiate an atomic swap.
 */
export const initiateAtomicSwap = async (
  participant: string,
  initiatorAsset: string,
  participantAsset: string,
  initiatorAmount: number,
  participantAmount: number,
  timelockHours: number = 24
): Promise<AtomicSwap> => {
  try {
    const response = await fastapiClient.post('/advanced/bridge/swap', {
      participant,
      initiator_asset: initiatorAsset,
      participant_asset: participantAsset,
      initiator_amount: initiatorAmount,
      participant_amount: participantAmount,
      timelock_hours: timelockHours
    });
    logger.info('Atomic swap initiated', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to initiate atomic swap', error);
    throw error;
  }
};

/**
 * Send a cross-chain message.
 */
export const sendCrossChainMessage = async (
  sourceChain: string,
  targetChain: string,
  payload: Record<string, any>
): Promise<CrossChainMessage> => {
  const response = await fastapiClient.post('/advanced/bridge/message', {
    source_chain: sourceChain,
    target_chain: targetChain,
    payload
  });
  return response.data;
};

// ============== STATUS ==============

/**
 * Get advanced blockchain features status.
 */
export const getAdvancedStatus = async (): Promise<{
  smart_contracts: { enabled: boolean; total: number };
  zero_knowledge: { enabled: boolean; transactions: number };
  sharding: { enabled: boolean; shards: number };
  cross_chain: { enabled: boolean; bridges: number };
}> => {
  const response = await fastapiClient.get('/advanced/status');
  return response.data;
};

export default {
  // Smart Contracts
  deployContract,
  callContract,
  getContract,
  getContractStats,
  // Zero-Knowledge
  createCommitment,
  proveKnowledge,
  proveRange,
  createPrivateTransaction,
  verifyPrivateTransaction,
  // Sharding
  submitShardTransaction,
  getShard,
  addShard,
  rebalanceShards,
  // Cross-Chain
  initiateBridgeTransfer,
  lockBridgeAssets,
  relayBridgeProof,
  mintBridgeAssets,
  initiateAtomicSwap,
  sendCrossChainMessage,
  // Status
  getAdvancedStatus,
};
