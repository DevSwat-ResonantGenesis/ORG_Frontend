/**
 * DevSwat Node API Client
 * Connects frontend to the decentralized node network.
 * Supports node discovery, agent publishing, cross-node execution.
 */

import { ENV } from '../config/env';

export const NODE_API_BASE = ENV.nodeApiUrl;

// ============== TYPES ==============

export interface NodeStatus {
  running: boolean;
  mode: string;
  identity: string | null;
  chain_connected: boolean;
  runtime_active: boolean;
  indexer_synced: boolean;
  peer_count?: number;
  block_height?: number;
}

export interface NetworkNode {
  node_id: string;
  dsid: string;
  address: string;
  port: number;
  status: 'online' | 'offline' | 'syncing';
  trust_score: number;
  capabilities: string[];
  last_seen: string;
  region?: string;
}

export interface Agent {
  manifest_hash: string;
  name: string;
  version: string;
  description: string;
  category: string;
  trust_tier: number;
  status: string;
  owner_dsid: string;
  execution_count: number;
  price_per_execution?: number;
  rental_available?: boolean;
}

export interface PublishAgentRequest {
  name: string;
  description: string;
  category: string;
  manifest: Record<string, unknown>;
  price_per_execution?: number;
  allow_rental?: boolean;
  rental_price_per_day?: number;
  trust_requirements?: number;
}

export interface PublishResponse {
  success: boolean;
  manifest_hash: string;
  tx_hash: string;
  published_at: string;
}

export interface ExecuteRequest {
  manifest_hash: string;
  input_data: Record<string, unknown>;
  user_dsid: string;
  trust_tier: number;
  session_id?: string;
  preferred_node?: string;
}

export interface ExecuteResponse {
  success: boolean;
  output: unknown;
  execution_hash: string;
  tokens_used: number;
  duration_ms: number;
  governance_decision: string;
  executed_on_node?: string;
  error?: string;
}

export interface NetworkStats {
  total_nodes: number;
  active_nodes: number;
  total_agents: number;
  total_executions: number;
  network_tps: number;
  avg_latency_ms: number;
}

// ============== NODE STATUS ==============

export async function getNodeStatus(): Promise<NodeStatus> {
  const response = await fetch(`${NODE_API_BASE}/status`);
  if (!response.ok) throw new Error('Failed to get node status');
  return response.json();
}

export async function getHealth(): Promise<{ status: string }> {
  const response = await fetch(`${NODE_API_BASE}/health`);
  if (!response.ok) throw new Error('Node health check failed');
  return response.json();
}

// ============== NODE DISCOVERY ==============

export async function discoverNodes(params?: {
  region?: string;
  min_trust_score?: number;
  capabilities?: string[];
  limit?: number;
}): Promise<{ nodes: NetworkNode[]; count: number }> {
  const searchParams = new URLSearchParams();
  if (params?.region) searchParams.set('region', params.region);
  if (params?.min_trust_score) searchParams.set('min_trust_score', params.min_trust_score.toString());
  if (params?.capabilities) searchParams.set('capabilities', params.capabilities.join(','));
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  
  const url = `${NODE_API_BASE}/network/nodes${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to discover nodes');
  return response.json();
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const response = await fetch(`${NODE_API_BASE}/network/stats`);
  if (!response.ok) throw new Error('Failed to get network stats');
  return response.json();
}

export async function pingNode(nodeId: string): Promise<{ latency_ms: number; status: string }> {
  const response = await fetch(`${NODE_API_BASE}/network/ping/${nodeId}`);
  if (!response.ok) throw new Error('Failed to ping node');
  return response.json();
}

// ============== AGENT SEARCH ==============

export async function searchAgents(params?: {
  category?: string;
  owner?: string;
  min_trust_tier?: number;
  max_price?: number;
  rental_only?: boolean;
  limit?: number;
}): Promise<{ agents: Agent[]; count: number }> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.owner) searchParams.set('owner', params.owner);
  if (params?.min_trust_tier) searchParams.set('min_trust_tier', params.min_trust_tier.toString());
  if (params?.max_price) searchParams.set('max_price', params.max_price.toString());
  if (params?.rental_only) searchParams.set('rental_only', 'true');
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  
  const url = `${NODE_API_BASE}/agents${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to search agents');
  return response.json();
}

export async function getAgent(manifestHash: string): Promise<Agent | null> {
  const response = await fetch(`${NODE_API_BASE}/agents/${manifestHash}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to get agent');
  }
  return response.json();
}

// ============== AGENT PUBLISHING ==============

export async function publishAgent(request: PublishAgentRequest): Promise<PublishResponse> {
  const response = await fetch(`${NODE_API_BASE}/agents/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to publish agent');
  return response.json();
}

export async function unpublishAgent(manifestHash: string): Promise<{ success: boolean }> {
  const response = await fetch(`${NODE_API_BASE}/agents/${manifestHash}/unpublish`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to unpublish agent');
  return response.json();
}

export async function updateAgentListing(manifestHash: string, updates: {
  price_per_execution?: number;
  allow_rental?: boolean;
  rental_price_per_day?: number;
  status?: 'active' | 'paused';
}): Promise<{ success: boolean }> {
  const response = await fetch(`${NODE_API_BASE}/agents/${manifestHash}/listing`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update agent listing');
  return response.json();
}

// ============== AGENT EXECUTION ==============

export async function executeAgent(request: ExecuteRequest): Promise<ExecuteResponse> {
  const response = await fetch(`${NODE_API_BASE}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Agent execution failed');
  return response.json();
}

export async function getExecutionStatus(executionHash: string): Promise<{
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: unknown;
  error?: string;
}> {
  const response = await fetch(`${NODE_API_BASE}/executions/${executionHash}`);
  if (!response.ok) throw new Error('Failed to get execution status');
  return response.json();
}

export async function cancelExecution(executionHash: string): Promise<{ success: boolean }> {
  const response = await fetch(`${NODE_API_BASE}/executions/${executionHash}/cancel`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to cancel execution');
  return response.json();
}

// ============== CROSS-NODE EXECUTION ==============

export async function executeOnNode(nodeId: string, request: ExecuteRequest): Promise<ExecuteResponse> {
  const response = await fetch(`${NODE_API_BASE}/network/nodes/${nodeId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Cross-node execution failed');
  return response.json();
}

export async function findBestNode(manifestHash: string): Promise<{
  node_id: string;
  estimated_latency_ms: number;
  estimated_cost: number;
}> {
  const response = await fetch(`${NODE_API_BASE}/network/best-node/${manifestHash}`);
  if (!response.ok) throw new Error('Failed to find best node');
  return response.json();
}

// ============== REACT HOOK ==============

export function useNodeApi() {
  return {
    getStatus: getNodeStatus,
    getHealth,
    discoverNodes,
    getNetworkStats,
    pingNode,
    searchAgents,
    getAgent,
    publishAgent,
    unpublishAgent,
    updateAgentListing,
    executeAgent,
    getExecutionStatus,
    cancelExecution,
    executeOnNode,
    findBestNode,
  };
}

// ============== DEFAULT EXPORT ==============

export default {
  getNodeStatus,
  getHealth,
  discoverNodes,
  getNetworkStats,
  pingNode,
  searchAgents,
  getAgent,
  publishAgent,
  unpublishAgent,
  updateAgentListing,
  executeAgent,
  getExecutionStatus,
  cancelExecution,
  executeOnNode,
  findBestNode,
};
