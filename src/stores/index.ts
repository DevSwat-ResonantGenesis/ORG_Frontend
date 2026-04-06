// ============== AGENTOS STATE STORES ==============
// Centralized exports for all domain stores

// Agent Domain
export { useAgentStore, selectAgents, selectSelectedAgent, selectActiveAgents, selectAgentById } from './agentStore';

// UI Domain
export { useUIStore, selectActiveSection, selectTheme, selectSidebarCollapsed } from './uiStore';

// Execution Domain
export { useExecutionStore, selectExecutions, selectActiveExecution, selectRunningExecutions, selectExecutionsByAgent } from './executionStore';

// Economy Domain — economyStore removed (service killed)

// Workflow Domain
export { useWorkflowStore, selectWorkflows, selectSelectedWorkflow, selectPublishedWorkflows } from './workflowStore';

// Network Domain
export { useNetworkStore, selectConnections, selectActiveConnections, selectProtocols, selectWebhooks } from './networkStore';

// Session Domain
export { useSessionStore, selectUserId, selectIsAuthenticated, selectRoles, selectPermissions, selectActiveOrganization } from './sessionStore';

// Re-export types for convenience
export type { Agent, AgentConfig, AgentType, AgentStatus, AgentMode } from '../types';
export type { Execution, ExecutionStatus, ExecutionMetrics, ExecutionTrace } from '../types';
export type { Transaction, Asset, WalletState } from '../types';
export type { Workflow, WorkflowNode, WorkflowEdge, WorkflowStatus } from '../types';
export type { NetworkConnection, ProtocolConfig, WebhookConfig } from '../types';
export type { SessionState, Permission } from '../types';
export type { SidebarSection, UIState } from '../types';
