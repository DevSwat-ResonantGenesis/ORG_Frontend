/**
 * Blockchain Service API - DSID-P, hash lineage, transaction graph, audit chain
 */

import client from './client';

// Types
export interface DSID {
  id: string;
  dsid: string;
  entity_type: string;
  entity_id: string;
  content_hash: string;
  version: number;
  status: 'active' | 'revoked' | 'superseded';
  lineage_depth: number;
  anchored: boolean;
  anchor_tx_hash?: string;
}

export interface HashNode {
  hash: string;
  content_type: string;
  depth: number;
  parent_hash?: string;
}

export interface Block {
  block_number: number;
  block_hash: string;
  previous_block_hash?: string;
  merkle_root: string;
  transaction_count: number;
  timestamp: string;
  anchored: boolean;
}

export interface BlockTransaction {
  tx_hash: string;
  tx_type: string;
  status: 'pending' | 'confirmed' | 'failed';
  block_number?: number;
  from_dsid?: string;
  to_dsid?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relationship: string;
  weight: number;
}

export interface AuditEntry {
  entry_hash: string;
  sequence_number: number;
  event_type: string;
  event_category: string;
  action: string;
  actor_dsid?: string;
  success: boolean;
  timestamp: string;
}

export interface ChainStats {
  chain_id: string;
  latest_block: number;
  latest_block_hash?: string;
  total_transactions: number;
  pending_transactions: number;
}

export interface AuditStats {
  total_entries: number;
  latest_sequence: number;
  success_rate: number;
  by_category: Record<string, number>;
  by_event_type: Record<string, number>;
}

// DSID APIs
export const createDSID = async (data: {
  entity_type: string;
  entity_id: string;
  content: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  parent_dsid?: string;
  public_key?: string;
}): Promise<DSID> => {
  const res = await client.post('/blockchain/dsid', data);
  return res.data;
};

export const getDSID = async (dsidStr: string): Promise<DSID> => {
  const res = await client.get(`/blockchain/dsid/${dsidStr}`);
  return res.data;
};

export const getDSIDLineage = async (dsidStr: string): Promise<DSID[]> => {
  const res = await client.get(`/blockchain/dsid/${dsidStr}/lineage`);
  return res.data;
};

export const verifyDSID = async (
  dsidStr: string,
  content: Record<string, unknown>
): Promise<{ valid: boolean; message: string }> => {
  const res = await client.post(`/blockchain/dsid/${dsidStr}/verify`, content);
  return res.data;
};

export const revokeDSID = async (
  dsidStr: string,
  reason: string
): Promise<{ status: string; dsid: string }> => {
  const res = await client.post(`/blockchain/dsid/${dsidStr}/revoke`, null, {
    params: { reason },
  });
  return res.data;
};

// Hash Lineage APIs
export const getHashLineage = async (hashValue: string): Promise<HashNode[]> => {
  const res = await client.get(`/blockchain/hash/${hashValue}/lineage`);
  return res.data;
};

export const getHashTree = async (
  hashValue: string,
  maxDepth: number = 10
): Promise<Record<string, unknown>> => {
  const res = await client.get(`/blockchain/hash/${hashValue}/tree`, {
    params: { max_depth: maxDepth },
  });
  return res.data;
};

export const computeMerkleRoot = async (hashes: string[]): Promise<{
  merkle_root: string;
  leaf_count: number;
}> => {
  const res = await client.post('/blockchain/merkle/root', hashes);
  return res.data;
};

export const computeMerkleProof = async (
  targetHash: string,
  allHashes: string[]
): Promise<{
  proof: Array<{ hash: string; position: string }>;
  merkle_root: string;
}> => {
  const res = await client.post('/blockchain/merkle/proof', {
    target_hash: targetHash,
    all_hashes: allHashes,
  });
  return res.data;
};

export const verifyMerkleProof = async (
  targetHash: string,
  merkleRoot: string,
  proof: Array<{ hash: string; position: string }>
): Promise<{ valid: boolean }> => {
  const res = await client.post('/blockchain/merkle/verify', {
    target_hash: targetHash,
    merkle_root: merkleRoot,
    proof,
  });
  return res.data;
};

// Block APIs
export const getLatestBlock = async (): Promise<Block> => {
  const res = await client.get('/blockchain/blocks/latest');
  return res.data;
};

export const getBlock = async (blockNumber: number): Promise<Block> => {
  const res = await client.get(`/blockchain/blocks/${blockNumber}`);
  return res.data;
};

export const getBlockTransactions = async (blockNumber: number): Promise<BlockTransaction[]> => {
  const res = await client.get(`/blockchain/blocks/${blockNumber}/transactions`);
  return res.data;
};

export const mineBlock = async (validator?: string): Promise<{
  status: string;
  block_number?: number;
  block_hash?: string;
  transaction_count?: number;
  message?: string;
}> => {
  const res = await client.post('/blockchain/blocks/mine', null, {
    params: validator ? { validator } : {},
  });
  return res.data;
};

export const getChainStats = async (): Promise<ChainStats> => {
  const res = await client.get('/blockchain/chain/stats');
  return res.data;
};

export const verifyChain = async (
  fromBlock: number = 0,
  toBlock?: number
): Promise<{
  valid: boolean;
  blocks_checked: number;
  errors: string[];
}> => {
  const params: Record<string, number> = { from_block: fromBlock };
  if (toBlock !== undefined) params.to_block = toBlock;
  const res = await client.post('/blockchain/chain/verify', null, { params });
  return res.data;
};

// Transaction APIs
export const createTransaction = async (data: {
  tx_type: string;
  payload: Record<string, unknown>;
  from_dsid?: string;
  to_dsid?: string;
  signature?: string;
}): Promise<BlockTransaction> => {
  const res = await client.post('/blockchain/transactions', data);
  return res.data;
};

export const getTransaction = async (txHash: string): Promise<BlockTransaction> => {
  const res = await client.get(`/blockchain/transactions/${txHash}`);
  return res.data;
};

export const getTransactionsByDSID = async (
  dsid: string,
  limit: number = 50
): Promise<BlockTransaction[]> => {
  const res = await client.get(`/blockchain/transactions/dsid/${dsid}`, {
    params: { limit },
  });
  return res.data;
};

// Transaction Graph APIs
export const addGraphEdge = async (data: {
  from_tx_hash: string;
  to_tx_hash: string;
  relationship: string;
  weight?: number;
  metadata?: Record<string, unknown>;
}): Promise<{ id: string; status: string }> => {
  const res = await client.post('/blockchain/graph/edge', data);
  return res.data;
};

export const getConnectedTransactions = async (
  txHash: string,
  direction: 'in' | 'out' | 'both' = 'both',
  relationship?: string
): Promise<GraphEdge[]> => {
  const params: Record<string, string> = { direction };
  if (relationship) params.relationship = relationship;
  const res = await client.get(`/blockchain/graph/${txHash}/connected`, { params });
  return res.data;
};

export const findTransactionPath = async (
  fromTx: string,
  toTx: string,
  maxDepth: number = 10
): Promise<{ path: string[]; length: number }> => {
  const res = await client.get('/blockchain/graph/path', {
    params: { from_tx: fromTx, to_tx: toTx, max_depth: maxDepth },
  });
  return res.data;
};

export const getGraphStats = async (): Promise<{
  total_edges: number;
  relationships: Record<string, number>;
}> => {
  const res = await client.get('/blockchain/graph/stats');
  return res.data;
};

// Audit Chain APIs
export const createAuditEntry = async (data: {
  event_type: string;
  event_category: string;
  action: string;
  actor_dsid?: string;
  target_type?: string;
  target_id?: string;
  description?: string;
  changes?: Record<string, unknown>;
  success?: boolean;
  compliance_tags?: string[];
}): Promise<AuditEntry> => {
  const res = await client.post('/blockchain/audit', data);
  return res.data;
};

export const getAuditEntry = async (entryHash: string): Promise<AuditEntry> => {
  const res = await client.get(`/blockchain/audit/${entryHash}`);
  return res.data;
};

export const getAuditByActor = async (
  actorDsid: string,
  limit: number = 100
): Promise<AuditEntry[]> => {
  const res = await client.get(`/blockchain/audit/actor/${actorDsid}`, {
    params: { limit },
  });
  return res.data;
};

export const getAuditByCategory = async (
  category: string,
  limit: number = 100
): Promise<AuditEntry[]> => {
  const res = await client.get(`/blockchain/audit/category/${category}`, {
    params: { limit },
  });
  return res.data;
};

export const verifyAuditChain = async (
  fromSequence: number = 0,
  toSequence?: number
): Promise<{
  valid: boolean;
  entries_checked: number;
  errors: string[];
}> => {
  const params: Record<string, number> = { from_sequence: fromSequence };
  if (toSequence !== undefined) params.to_sequence = toSequence;
  const res = await client.post('/blockchain/audit/verify', null, { params });
  return res.data;
};

export const getAuditStats = async (): Promise<AuditStats> => {
  const res = await client.get('/blockchain/audit/stats');
  return res.data;
};

export const exportAuditLog = async (
  fromSequence: number,
  toSequence: number
): Promise<AuditEntry[]> => {
  const res = await client.get('/blockchain/audit/export', {
    params: { from_sequence: fromSequence, to_sequence: toSequence },
  });
  return res.data;
};

// Compliance APIs
export const getGDPRReport = async (userDsid: string): Promise<Record<string, unknown>> => {
  const res = await client.get(`/blockchain/compliance/gdpr/${userDsid}`);
  return res.data;
};

export const getSOC2Report = async (
  fromDate: string,
  toDate: string
): Promise<Record<string, unknown>> => {
  const res = await client.get('/blockchain/compliance/soc2', {
    params: { from_date: fromDate, to_date: toDate },
  });
  return res.data;
};

// Health check
export const healthCheck = async (): Promise<{ status: string }> => {
  const res = await client.get('/blockchain/health');
  return res.data;
};

export default {
  createDSID,
  getDSID,
  getDSIDLineage,
  verifyDSID,
  revokeDSID,
  getHashLineage,
  getHashTree,
  computeMerkleRoot,
  computeMerkleProof,
  verifyMerkleProof,
  getLatestBlock,
  getBlock,
  getBlockTransactions,
  mineBlock,
  getChainStats,
  verifyChain,
  createTransaction,
  getTransaction,
  getTransactionsByDSID,
  addGraphEdge,
  getConnectedTransactions,
  findTransactionPath,
  getGraphStats,
  createAuditEntry,
  getAuditEntry,
  getAuditByActor,
  getAuditByCategory,
  verifyAuditChain,
  getAuditStats,
  exportAuditLog,
  getGDPRReport,
  getSOC2Report,
  healthCheck,
};
