// ============== SERVICES INDEX ==============
// Export all API services

export {
  api,
  ideApi,
  authApi,
  ideService,
  workflowApi,
  mlApi,
  llmApi,
  memoryApi,
  chatApi,
  agentsApi,
  healthApi,
  addRequestInterceptor,
  addResponseInterceptor,
  APIError,
} from './api';

// Re-export utilities
export { apiCache, CACHE_CONFIGS, cachedFetch, prefetchAPI } from '../utils/apiCache';
export { getWebSocket, ideWebSocket, chatWebSocket, useWebSocket } from '../utils/websocketManager';
export {
  requestQueue,
  renderScheduler,
  getMemoryStats,
  prefetchUrl,
  preconnect,
  mark,
  measure,
  initializePerformanceOptimizations,
} from '../utils/performanceOptimizer';

// ============== AUDIT TRAIL TYPES & HOOKS ==============
export type AuditEntryType = 'file_change' | 'code_execution' | 'ai_action' | 'git_operation' | 'task_execution' | 'user_action' | 'system_event';

export interface AuditEntry {
  id: string;
  type: AuditEntryType;
  timestamp: number;
  actor: { type: 'user' | 'ai' | 'system'; name: string };
  action: string;
  target: { path: string; type: string };
  details: { 
    description: string; 
    prompt?: string; 
    response?: string;
    output?: string;
    diff?: { before: string; after: string; additions?: number; deletions?: number };
  };
  result: { success: boolean; duration: number; error?: string };
  metadata: { tokensUsed?: number; cost?: number; model?: string };
}

export interface AuditQuery {
  types?: AuditEntryType[];
  actorTypes?: ('user' | 'ai' | 'system')[];
  targetPath?: string;
  search?: string;
  limit?: number;
}

export interface AuditSummary {
  totalEntries: number;
  totalCost: number;
  totalTokens: number;
  successRate: number;
}

export const useAuditTrail = (_query: AuditQuery) => {
  // Stub implementation - returns empty data
  return { 
    entries: [] as AuditEntry[], 
    summary: { totalEntries: 0, totalCost: 0, totalTokens: 0, successRate: 100 } as AuditSummary 
  };
};

export const useAuditSummary = () => {
  return { totalEntries: 0, totalCost: 0, totalTokens: 0, successRate: 100 } as AuditSummary;
};

// ============== ORCHESTRATOR TYPES & HOOKS ==============
export interface TaskProof {
  hash: string;
  timestamp: number;
  verified: boolean;
  success: boolean;
  summary: string;
  totalDuration: number;
  totalCost: number;
  tokensUsed: number;
  diffs: { path: string; type: string; additions: number; deletions: number }[];
  verificationResults: { check: string; passed: boolean; message?: string }[];
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back' | 'executing';
  progress: number;
  proof?: TaskProof;
  plan?: ExecutionPlan;
}

export interface ExecutionStep {
  id: string;
  type: 'analyze' | 'plan' | 'execute' | 'verify';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  action: { target?: string; type?: string };
  target?: { path: string; type: string };
  verification: { type: string; passed?: boolean; message?: string };
  result?: { duration?: number; error?: string };
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  requiresConfirmation: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  estimatedDuration?: number;
  estimatedCost?: number;
}

export const useOrchestrator = () => {
  return {
    currentTask: null as Task | null,
    isExecuting: false,
    createAndExecute: async (_desc: string, _opts?: any) => null as ExecutionPlan | null,
    executeTask: async (_taskId: string) => {},
    rollbackTask: async (_taskId: string) => {},
  };
};

export const useTaskProgress = (_taskId?: string) => {
  return { 
    progress: 0, 
    status: 'pending' as const,
    task: null as Task | null,
    currentStep: 0
  };
};
