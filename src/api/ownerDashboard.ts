/**
 * Owner Dashboard API Client
 * Connects to REAL backend endpoints - NO fake data, NO localStorage
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getOwnerToken = (): string => {
  return localStorage.getItem('owner_token') || '';
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getOwnerToken()}`,
});

// ============== PLATFORM STATS ==============

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  mrr: number;
  creditsConsumed: number;
  apiCalls: number;
  activeAgents: number;
  totalAgents: number;
  lastUpdated?: string;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const res = await fetch(`${API_BASE}/owner/dashboard/stats`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch stats: ${res.statusText}`);
  return res.json();
}

export async function updatePlatformStats(stats: PlatformStats): Promise<void> {
  const res = await fetch(`${API_BASE}/owner/dashboard/stats`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(stats),
  });
  if (!res.ok) throw new Error(`Failed to update stats: ${res.statusText}`);
}

// ============== USERS ==============

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  plan: string;
  status: string;
  credits: number;
  createdAt: string;
  lastLogin: string;
}

export async function getUsers(): Promise<{ users: UserInfo[] }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/users`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch users: ${res.statusText}`);
  return res.json();
}

export async function updateUserPlan(userId: string, plan: string): Promise<void> {
  const res = await fetch(`${API_BASE}/owner/dashboard/users/${userId}/update-plan?plan=${plan}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to update user plan: ${res.statusText}`);
}

export async function addUserCredits(userId: string, credits: number): Promise<void> {
  const res = await fetch(`${API_BASE}/owner/dashboard/users/${userId}/add-credits?credits=${credits}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to add credits: ${res.statusText}`);
}

// ============== AUTONOMOUS AGENTS ==============

export interface AutonomousAgent {
  id: string;
  name: string;
  type: string;
  status: string;
  tasksCompleted: number;
  tasksQueued: number;
  lastAction: string;
  cpuUsage: number;
  memoryUsage: number;
  codebaseAccess: boolean;
  autoActivateOnDeploy: boolean;
}

export async function getAutonomousAgents(): Promise<{ agents: AutonomousAgent[] }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/agents`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch agents: ${res.statusText}`);
  return res.json();
}

export async function createAutonomousAgent(agent: Partial<AutonomousAgent>): Promise<AutonomousAgent> {
  const res = await fetch(`${API_BASE}/owner/dashboard/agents`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(agent),
  });
  if (!res.ok) throw new Error(`Failed to create agent: ${res.statusText}`);
  const data = await res.json();
  return data.agent;
}

export async function toggleAutonomousAgent(agentId: string): Promise<{ new_status: string }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/agents/${agentId}/toggle`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to toggle agent: ${res.statusText}`);
  return res.json();
}

export async function deleteAutonomousAgent(agentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/owner/dashboard/agents/${agentId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete agent: ${res.statusText}`);
}

// ============== BLOCKCHAIN NODES ==============

export interface BlockchainNode {
  id: string;
  network: string;
  status: string;
  blockHeight: number;
  lastAnchor: string;
  anchorsToday: number;
  gasBalance: string;
}

export async function getBlockchainNodes(): Promise<{ nodes: BlockchainNode[] }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/blockchain/nodes`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch nodes: ${res.statusText}`);
  return res.json();
}

export async function addBlockchainNode(node: Partial<BlockchainNode>): Promise<BlockchainNode> {
  const res = await fetch(`${API_BASE}/owner/dashboard/blockchain/nodes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(node),
  });
  if (!res.ok) throw new Error(`Failed to add node: ${res.statusText}`);
  const data = await res.json();
  return data.node;
}

export async function deleteBlockchainNode(nodeId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/owner/dashboard/blockchain/nodes/${nodeId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete node: ${res.statusText}`);
}

// ============== MEMORY UNIVERSES ==============

export interface MemoryUniverse {
  id: string;
  name: string;
  nodeCount: number;
  edgeCount: number;
  totalMemories: number;
  lastSync: string;
  status: string;
}

export async function getMemoryUniverses(): Promise<{ universes: MemoryUniverse[] }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/memory/universes`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch universes: ${res.statusText}`);
  return res.json();
}

export async function createMemoryUniverse(universe: Partial<MemoryUniverse>): Promise<MemoryUniverse> {
  const res = await fetch(`${API_BASE}/owner/dashboard/memory/universes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(universe),
  });
  if (!res.ok) throw new Error(`Failed to create universe: ${res.statusText}`);
  const data = await res.json();
  return data.universe;
}

export async function deleteMemoryUniverse(universeId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/owner/dashboard/memory/universes/${universeId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete universe: ${res.statusText}`);
}

// ============== SERVICE HEALTH ==============

export interface ServiceHealth {
  name: string;
  status: string;
  latency: number;
  lastCheck: string;
}

export async function getServicesHealth(): Promise<{ services: ServiceHealth[] }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/services/health`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch health: ${res.statusText}`);
  return res.json();
}

// ============== SETTINGS ==============

export interface PlatformSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxRequestsPerDay: number;
  burstLimit: number;
  smtpHost: string;
  smtpPort: number;
  fromEmail: string;
  adminEmail: string;
  welcomeEmails: boolean;
  securityAlerts: boolean;
  systemAlerts: boolean;
  marketingEmails: boolean;
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const res = await fetch(`${API_BASE}/owner/dashboard/settings`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch settings: ${res.statusText}`);
  return res.json();
}

export async function savePlatformSettings(settings: PlatformSettings): Promise<void> {
  const res = await fetch(`${API_BASE}/owner/dashboard/settings`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(`Failed to save settings: ${res.statusText}`);
}

// ============== CONTROL PLANE ==============

export interface ControlPlaneConfig {
  globalRateLimit: number;
  maxConcurrentRequests: number;
  cacheTTL: number;
  logLevel: string;
  debugMode: boolean;
  featureFlags: Record<string, boolean>;
}

export async function getControlPlane(): Promise<ControlPlaneConfig> {
  const res = await fetch(`${API_BASE}/owner/dashboard/control-plane`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch control plane: ${res.statusText}`);
  return res.json();
}

export async function saveControlPlane(config: ControlPlaneConfig): Promise<void> {
  const res = await fetch(`${API_BASE}/owner/dashboard/control-plane`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(`Failed to save control plane: ${res.statusText}`);
}

export async function toggleFeatureFlag(flagName: string, enabled: boolean): Promise<void> {
  const res = await fetch(`${API_BASE}/owner/dashboard/control-plane/feature-flag/${flagName}?enabled=${enabled}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to toggle feature flag: ${res.statusText}`);
}

// ============== RARA ==============

export interface RARAStatus {
  state: string;
  active_mutation: string | null;
  last_snapshot: string;
  agents_registered: number;
  mutations_today: number;
  rollbacks_today: number;
  invariant_violations: number;
  uptime_seconds: number;
  kill_switch_active?: boolean;
}

export async function getRARAStatus(): Promise<RARAStatus> {
  const res = await fetch(`${API_BASE}/owner/dashboard/rara/status`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch RARA status: ${res.statusText}`);
  return res.json();
}

export async function toggleRARAKillSwitch(activate: boolean): Promise<{ kill_switch_active: boolean }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/rara/kill-switch?activate=${activate}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to toggle kill switch: ${res.statusText}`);
  return res.json();
}

export async function getRARAAgents(): Promise<{ agents: any[] }> {
  const res = await fetch(`${API_BASE}/owner/dashboard/rara/agents`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch RARA agents: ${res.statusText}`);
  return res.json();
}

// ============== OVERVIEW ==============

export interface OverviewData {
  stats: PlatformStats;
  activeAgents: number;
  totalAgents: number;
  memoryUniverses: number;
  blockchainNodes: number;
  lastUpdated: string;
}

export async function getOverview(): Promise<OverviewData> {
  const res = await fetch(`${API_BASE}/owner/dashboard/overview`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch overview: ${res.statusText}`);
  return res.json();
}
