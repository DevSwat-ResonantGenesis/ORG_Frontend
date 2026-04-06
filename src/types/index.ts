/**
 * Centralized type definitions
 * Import types from API modules when available, otherwise define here
 */

import type { Policy } from '../api/policies';
// import type { Thresholds } from '../api/settings'; // Commented - module not found
import type { User } from '../api/users';

// Billing Types
export interface BillingOverview {
  plan: string;
  month_spend?: number;
  next_invoice_date?: string;
  usage?: UsageBreakdownData;
  overview?: BillingOverviewData;
  payment_methods?: PaymentMethod[];
  invoices?: Invoice[];
}

export interface UsageBreakdownData {
  predictions?: number;
  predictions_cost?: number;
  compliance?: number;
  compliance_cost?: number;
  policy_triggers?: number;
  policy_cost?: number;
  audit_gb?: number;
  audit_cost?: number;
}

export interface BillingOverviewData {
  plan?: string;
  month_spend?: number;
  next_invoice_date?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  exp?: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  date?: string;
  due_date?: string;
  pdf_url?: string;
  invoice_url?: string;
  period_end?: string;
  amount_due_cents?: number;
}

// Organization Types
export interface OrgDetails {
  id: string;
  name: string;
  users?: User[];
  api_keys?: APIKey[];
  usage?: OrgUsageData;
}

export interface OrgUsageData {
  predictions?: number;
  compliance?: number;
  policy_triggers?: number;
}

// Settings Types
export interface APIKey {
  id: string;
  name: string;
  key?: string; // Only present when creating
  key_id?: string;
  api_key_id?: string;
  key_name?: string;
  token?: string;
  api_key?: string;
  key_value?: string;
  created_at?: string;
  created?: string;
  created_at_iso?: string;
  last_used?: string;
}

export interface ModelVersion {
  id: string;
  name: string;
  version?: string;
  updated_at?: string;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: unknown;
}

export interface LineSeriesData {
  name: string;
  data: Array<{ date: string; value: number }>;
}

export interface BarSeriesData {
  anchor: string;
  count: number;
}

// Evidence Graph Types
export interface GraphNode {
  id: string;
  label?: string;
  type?: string;
  description?: string;
  data?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: Record<string, unknown>;
}

export interface EvidenceGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// System Types
export interface SystemHealth {
  api_status: 'healthy' | 'unhealthy' | 'unknown';
  ml_worker_status: 'healthy' | 'unhealthy' | 'unknown';
  database_status: 'healthy' | 'unhealthy' | 'unknown';
}

export interface SystemMetrics {
  total_organizations: number;
  total_users: number;
  total_predictions: number;
  predictions_24h?: number;
  api_latency_ms?: number;
}

// Re-export API types for convenience
export type { Policy, User };

// Define Thresholds locally since module not found
export interface Thresholds {
  validity: number;
  entropy: number;
  anchor_prob: number;
  anchorProb?: number;
}

// ============== AGENTOS STATE DOMAIN TYPES ==============

// Session Domain
export interface SessionState {
  userId: string | null;
  roles: string[];
  permissions: Permission[];
  sessionExpiry: Date | null;
  activeOrganization: string | null;
  authStatus: 'authenticated' | 'unauthenticated' | 'loading';
}

export type Permission = 
  | 'agents:read' | 'agents:write' | 'agents:delete' | 'agents:execute'
  | 'workflows:read' | 'workflows:write' | 'workflows:execute' | 'workflows:delete'
  | 'executions:read' | 'executions:write' | 'executions:cancel'
  | 'economy:read' | 'economy:transfer' | 'economy:admin'
  | 'settings:read' | 'settings:write'
  | 'audit:read' | 'audit:export'
  | 'users:read' | 'users:write' | 'users:delete'
  | 'admin:*';

// Agent Domain
export type AgentType = string;
export type AgentStatus = 'idle' | 'active' | 'paused' | 'failed' | 'terminated' | 'archived';
export type AgentMode = 'governed' | 'unbounded';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AgentSource = 'cloud' | 'openclaw';
export type OpenClawConnectionStatus = 'online' | 'offline' | 'registered' | 'degraded';

export interface OpenClawConfig {
  endpoint_url?: string;
  hardware?: {
    cpu?: string;
    gpu?: string;
    ram?: string;
    os?: string;
  };
  memory_mode?: 'cloud' | 'local' | 'hybrid';
  local_memory_endpoint?: string;
  custom_skills?: Array<{ name: string; description?: string }>;
  enable_rara?: boolean;
  enable_dsid?: boolean;
  connection_status?: OpenClawConnectionStatus;
  last_heartbeat?: string;
  models_available?: string[];
  registered_at?: string;
}

export interface Agent {
  id: string;
  hash: string;
  dsid?: string;
  persisted?: boolean;
  name: string;
  description?: string;
  type: AgentType;
  status: AgentStatus;
  mode: AgentMode;
  version: string;
  capabilities: string[];
  walletBalance: number;
  riskLevel: RiskLevel;
  utilityScore: number;
  executions: number;
  costToday: number;
  pendingApprovals: number;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  config: AgentConfig;
  provider?: string;
  model?: string;
  tools?: string[];
  // OpenClaw federation
  agent_source?: AgentSource;
  openclaw_config?: OpenClawConfig;
}

export interface AgentConfig {
  provider: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: AgentTool[];
  memoryConfig: MemoryConfig;
  autonomyConfig: AutonomyConfig;
  governanceConfig?: GovernanceConfig;
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  parameters?: Record<string, unknown>;
}

export interface MemoryConfig {
  shortTermLimit: number;
  longTermEnabled: boolean;
  vectorStoreEnabled: boolean;
  contextWindow: number;
}

export interface AutonomyConfig {
  canSpawnSubAgents: boolean;
  canModifySelf: boolean;
  canAccessNetwork: boolean;
  canExecuteCode: boolean;
  maxConcurrentTasks: number;
}

export interface GovernanceConfig {
  requireApproval: boolean;
  maxSpendPerAction: number;
  maxDailySpend: number;
  allowedDomains: string[];
  blockedActions: string[];
}

// Execution Domain
export type ExecutionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'initializing' | 'waiting_approval';

export interface Execution {
  id: string;
  agentId: string;
  workflowId: string | null;
  status: ExecutionStatus;
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  completedAt: Date | null;
  error: string | null;
  metrics: ExecutionMetrics;
  trace: ExecutionTrace[];
}

export interface ExecutionMetrics {
  tokensUsed: number;
  costUsd: number;
  durationMs: number;
  toolCalls: number;
  successRate: number;
}

export interface ExecutionTrace {
  stepId: string;
  timestamp: Date;
  action: string;
  input: unknown;
  output: unknown;
  durationMs: number;
  tokensUsed: number;
  status: 'success' | 'failed' | 'skipped';
}

// Workflow Domain
export type WorkflowStatus = 'draft' | 'validated' | 'published' | 'deprecated' | 'archived';

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  status: WorkflowStatus;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'agent' | 'condition' | 'loop' | 'parallel' | 'human' | 'api';
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue: unknown;
  required: boolean;
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'schedule' | 'webhook' | 'event';
  config: Record<string, unknown>;
  enabled: boolean;
}

// Network Domain
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

export interface NetworkConnection {
  id: string;
  name: string;
  type: 'websocket' | 'http' | 'grpc' | 'blockchain';
  endpoint: string;
  status: ConnectionStatus;
  latencyMs: number;
  lastPing: Date;
}

export interface ProtocolConfig {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  lastTriggered: Date | null;
}

// Economy Domain
export type TransactionType = 'spend' | 'receive' | 'escrow' | 'stake' | 'unstake' | 'swap';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface WalletState {
  totalBalance: number;
  availableBalance: number;
  stakedBalance: number;
  pendingBalance: number;
  dailySpent: number;
  dailyLimit: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  hash: string | null;
  timestamp: Date;
  agentId: string | null;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  valueUsd: number;
  change24h: number;
  type: 'token' | 'nft' | 'stake';
}

// UI Domain (View State Only)
export type SidebarSection = 
  | 'agents' | 'sessions' | 'factory' | 'capabilities' | 'utility' | 'goals' 
  | 'execution' | 'memory' | 'economy' | 'negotiation' | 'governance' 
  | 'audit' | 'debug' | 'workflow' | 'chat' | 'monitor' | 'external' | 'settings';

export interface UIState {
  activeSection: SidebarSection;
  selectedAgentId: string | null;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  theme: 'dark' | 'light';
  filters: Record<string, unknown>;
  sortOrder: Record<string, 'asc' | 'desc'>;
}

