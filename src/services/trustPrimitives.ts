// ============== TRUST PRIMITIVES SERVICE ==============
// Frontend handlers for proof, verification, rollback, and cost events
// Connects WebSocket events to UI state and executionEffects

import { ideWebSocket } from '../utils/websocketManager';
import { executionEffectsService, DiffDisplay } from './executionEffects';
import { notificationsService } from './notifications';

// ============== TYPES ==============

export interface ExecutionProof {
  id: string;
  taskId: string;
  status: 'success' | 'partial' | 'failed' | 'rolled_back';
  summary: string;
  filesModified: string[];
  costUsd: number;
  durationMs: number;
  rollbackAvailable: boolean;
  rollbackSnapshotId?: string;
  steps: ProofStep[];
  diffs: ProofDiff[];
  verification: VerificationResult[];
}

export interface ProofStep {
  stepId: string;
  stepType: string;
  description: string;
  status: string;
  durationMs: number;
  error?: string;
}

export interface ProofDiff {
  path: string;
  operation: 'create' | 'modify' | 'delete';
  additions: number;
  deletions: number;
}

export interface VerificationResult {
  type: 'typecheck' | 'lint' | 'test' | 'security';
  passed: boolean;
  output: string;
  durationMs: number;
  errors: string[];
  warnings: string[];
}

export interface RollbackResult {
  success: boolean;
  snapshotId: string;
  filesRestored: string[];
  errors: string[];
}

export interface CostUpdate {
  taskId: string;
  totalCostUsd: number;
  llmTokens: number;
}

export interface ExecutionComplete {
  success: boolean;
  taskId: string;
  proofId: string;
  filesModified: string[];
  verificationPassed: boolean;
  rollbackAvailable: boolean;
  rollbackSnapshotId?: string;
  costUsd: number;
  durationMs: number;
  errors: string[];
  summary: string;
}

// Event handlers
type ProofHandler = (proof: Partial<ExecutionProof>) => void;
type VerificationHandler = (result: { allPassed: boolean; results: VerificationResult[]; blockingErrors: string[] }) => void;
type RollbackHandler = (result: RollbackResult) => void;
type CostHandler = (cost: CostUpdate) => void;
type ExecutionCompleteHandler = (result: ExecutionComplete) => void;
type FileVisibilityHandler = (data: { filePath: string; operation: string; action: string }) => void;

// ============== TRUST PRIMITIVES SERVICE ==============

class TrustPrimitivesService {
  private proofHandlers = new Set<ProofHandler>();
  private verificationHandlers = new Set<VerificationHandler>();
  private rollbackHandlers = new Set<RollbackHandler>();
  private costHandlers = new Set<CostHandler>();
  private executionCompleteHandlers = new Set<ExecutionCompleteHandler>();
  private fileVisibilityHandlers = new Set<FileVisibilityHandler>();
  
  private currentProof: ExecutionProof | null = null;
  private proofHistory: ExecutionProof[] = [];
  private isInitialized = false;

  // ============== INITIALIZATION ==============

  initialize(): void {
    if (this.isInitialized) return;
    
    // Subscribe to WebSocket events
    this.setupWebSocketHandlers();
    this.isInitialized = true;
    
    console.log('TrustPrimitivesService initialized');
  }

  private setupWebSocketHandlers(): void {
    // Proof generated
    ideWebSocket.on('proof:generated', (data: unknown) => {
      const proofData = data as Partial<ExecutionProof>;
      this.handleProofGenerated(proofData);
    });

    // Verification complete
    ideWebSocket.on('verification:complete', (data: unknown) => {
      const verificationData = data as { 
        all_passed: boolean; 
        results: VerificationResult[]; 
        blocking_errors: string[];
        total_duration_ms: number;
      };
      this.handleVerificationComplete(verificationData);
    });

    // Rollback executed
    ideWebSocket.on('rollback:executed', (data: unknown) => {
      const rollbackData = data as {
        success: boolean;
        snapshot_id: string;
        files_restored: string[];
        errors: string[];
      };
      this.handleRollbackExecuted(rollbackData);
    });

    // File visibility - auto-open modified files
    ideWebSocket.on('file:visibility', (data: unknown) => {
      const fileData = data as { file_path: string; operation: string; action: string };
      this.handleFileVisibility(fileData);
    });

    // Diff available - show diff to user
    ideWebSocket.on('diff:available', (data: unknown) => {
      const diffData = data as ProofDiff & { has_content: boolean };
      this.handleDiffAvailable(diffData);
    });

    // Cost update
    ideWebSocket.on('cost:update', (data: unknown) => {
      const costData = data as { task_id: string; total_cost_usd: number; llm_tokens: number };
      this.handleCostUpdate(costData);
    });

    // Execution complete - full result summary
    ideWebSocket.on('execution:complete', (data: unknown) => {
      const resultData = data as ExecutionComplete;
      this.handleExecutionComplete(resultData);
    });

    // Task progress
    ideWebSocket.on('task:progress', (data: unknown) => {
      const progressData = data as { step: number; total: number; task: string; task_id: string };
      this.handleTaskProgress(progressData);
    });

    // Task completed
    ideWebSocket.on('task:completed', (data: unknown) => {
      const completedData = data as { 
        plan_id: string; 
        duration_ms: number; 
        proof_id?: string;
        verification_passed?: boolean;
        cost_usd?: number;
      };
      this.handleTaskCompleted(completedData);
    });

    // Task failed
    ideWebSocket.on('task:failed', (data: unknown) => {
      const failedData = data as { error: string; task_id?: string };
      this.handleTaskFailed(failedData);
    });
  }

  // ============== EVENT HANDLERS ==============

  private handleProofGenerated(data: Partial<ExecutionProof>): void {
    const proof: Partial<ExecutionProof> = {
      id: data.id,
      taskId: data.taskId,
      status: data.status,
      summary: data.summary,
      filesModified: data.filesModified || [],
      costUsd: data.costUsd || 0,
      durationMs: data.durationMs || 0,
      rollbackAvailable: data.rollbackAvailable || false,
    };

    this.currentProof = proof as ExecutionProof;
    this.proofHistory.push(this.currentProof);

    // Notify handlers
    this.proofHandlers.forEach(h => h(proof));

    // Show notification
    const statusIcon = proof.status === 'success' ? '✓' : proof.status === 'failed' ? '✗' : '⚠';
    notificationsService.info(`${statusIcon} Proof Generated: ${proof.id}`, {
      message: proof.summary || '',
      duration: 5000,
      actions: [
        { label: 'View Proof', action: () => this.showProofDetails(proof.id!) },
        ...(proof.rollbackAvailable ? [{ label: 'Rollback', action: () => this.requestRollback() }] : []),
      ],
    });
  }

  private handleVerificationComplete(data: { 
    all_passed: boolean; 
    results: VerificationResult[]; 
    blocking_errors: string[];
    total_duration_ms: number;
  }): void {
    const result = {
      allPassed: data.all_passed,
      results: data.results,
      blockingErrors: data.blocking_errors || [],
    };

    // Notify handlers
    this.verificationHandlers.forEach(h => h(result));

    // Show notification
    if (result.allPassed) {
      notificationsService.success('✓ Verification Passed', {
        message: `All checks passed in ${data.total_duration_ms}ms`,
        duration: 3000,
      });
    } else {
      notificationsService.error('✗ Verification Failed', {
        message: result.blockingErrors.join('\n') || 'One or more checks failed',
        persistent: true,
        actions: [
          { label: 'View Details', action: () => this.showVerificationDetails(result) },
        ],
      });
    }
  }

  private handleRollbackExecuted(data: {
    success: boolean;
    snapshot_id: string;
    files_restored: string[];
    errors: string[];
  }): void {
    const result: RollbackResult = {
      success: data.success,
      snapshotId: data.snapshot_id,
      filesRestored: data.files_restored,
      errors: data.errors,
    };

    // Notify handlers
    this.rollbackHandlers.forEach(h => h(result));

    // Show notification and refresh UI
    if (result.success) {
      notificationsService.warning('↩ Rollback Complete', {
        message: `${result.filesRestored.length} file(s) restored`,
        duration: 5000,
        actions: [
          { label: 'View Files', action: () => this.openFiles(result.filesRestored) },
        ],
      });

      // Refresh UI to show reverted files
      executionEffectsService.refreshUI();
      
      // Open restored files
      result.filesRestored.forEach(path => {
        executionEffectsService.openFile(path);
      });
    } else {
      notificationsService.error('Rollback Failed', {
        message: result.errors.join('\n'),
        persistent: true,
      });
    }
  }

  private handleFileVisibility(data: { file_path: string; operation: string; action: string }): void {
    // Convert snake_case to camelCase
    const normalizedData = {
      filePath: data.file_path,
      operation: data.operation,
      action: data.action,
    };

    // Notify handlers
    this.fileVisibilityHandlers.forEach(h => h(normalizedData));

    // Auto-open the file
    if (data.action === 'open') {
      executionEffectsService.openFile(data.file_path);
    }
  }

  private handleDiffAvailable(data: ProofDiff & { has_content: boolean }): void {
    // Emit event for diff viewer components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resonant:diffAvailable', { 
        detail: {
          path: data.path,
          operation: data.operation,
          additions: data.additions,
          deletions: data.deletions,
        }
      }));
    }

    // Show brief notification
    const changeText = `+${data.additions}/-${data.deletions}`;
    notificationsService.info(`📄 ${data.path}`, {
      message: `${data.operation}: ${changeText}`,
      duration: 3000,
      actions: [
        { label: 'View Diff', action: () => this.showFileDiff(data.path) },
      ],
    });
  }

  private handleCostUpdate(data: { task_id: string; total_cost_usd: number; llm_tokens: number }): void {
    const cost: CostUpdate = {
      taskId: data.task_id,
      totalCostUsd: data.total_cost_usd,
      llmTokens: data.llm_tokens,
    };

    // Notify handlers
    this.costHandlers.forEach(h => h(cost));

    // Emit event for cost display components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resonant:costUpdate', { detail: cost }));
    }
  }

  private handleExecutionComplete(data: ExecutionComplete): void {
    // Notify handlers
    this.executionCompleteHandlers.forEach(h => h(data));

    // Ensure visibility of modified files
    if (data.filesModified.length > 0) {
      executionEffectsService.ensureVisibility(data.filesModified);
    }

    // Show comprehensive notification
    const statusIcon = data.success ? '✓' : '✗';
    const costText = data.costUsd > 0 ? ` • $${data.costUsd.toFixed(4)}` : '';
    const durationText = data.durationMs > 0 ? ` • ${(data.durationMs / 1000).toFixed(1)}s` : '';

    if (data.success) {
      notificationsService.success(`${statusIcon} Execution Complete`, {
        message: `${data.summary}${costText}${durationText}`,
        duration: 5000,
        actions: [
          { label: 'View Proof', action: () => this.showProofDetails(data.proofId) },
          ...(data.filesModified.length > 0 ? [{ label: 'View Changes', action: () => this.showAllDiffs(data.filesModified) }] : []),
          ...(data.rollbackAvailable ? [{ label: 'Rollback', action: () => this.executeRollback(data.rollbackSnapshotId!) }] : []),
        ],
      });
    } else {
      notificationsService.error(`${statusIcon} Execution Failed`, {
        message: data.errors.join('\n') || 'Unknown error',
        persistent: true,
        actions: [
          { label: 'View Details', action: () => this.showProofDetails(data.proofId) },
          ...(data.rollbackAvailable ? [{ label: 'Rollback', action: () => this.executeRollback(data.rollbackSnapshotId!) }] : []),
        ],
      });
    }
  }

  private handleTaskProgress(data: { step: number; total: number; task: string; task_id: string }): void {
    // Emit progress event for progress bar components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resonant:taskProgress', { detail: data }));
    }
  }

  private handleTaskCompleted(data: { 
    plan_id: string; 
    duration_ms: number; 
    proof_id?: string;
    verification_passed?: boolean;
    cost_usd?: number;
  }): void {
    // Emit completion event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resonant:taskCompleted', { detail: data }));
    }
  }

  private handleTaskFailed(data: { error: string; task_id?: string }): void {
    notificationsService.error('Task Failed', {
      message: data.error,
      persistent: true,
    });
  }

  // ============== API METHODS ==============

  async requestRollback(): Promise<void> {
    if (!this.currentProof?.rollbackSnapshotId) {
      notificationsService.warning('No rollback available');
      return;
    }

    await this.executeRollback(this.currentProof.rollbackSnapshotId);
  }

  async executeRollback(snapshotId: string): Promise<RollbackResult> {
    try {
      const response = await fetch(`/api/trust/rollback/execute/${snapshotId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Rollback failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      notificationsService.error('Rollback Failed', { message: errorMsg });
      throw error;
    }
  }

  async getProof(proofId: string): Promise<ExecutionProof | null> {
    try {
      const response = await fetch(`/api/trust/proofs/${proofId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }

  async getRecentProofs(limit = 10): Promise<ExecutionProof[]> {
    try {
      const response = await fetch(`/api/trust/proofs?limit=${limit}`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.proofs || [];
    } catch {
      return [];
    }
  }

  async verifyProof(proofId: string): Promise<{ valid: boolean; tampered: boolean }> {
    try {
      const response = await fetch('/api/trust/proofs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof_id: proofId }),
      });
      return await response.json();
    } catch {
      return { valid: false, tampered: true };
    }
  }

  async getCostStats(): Promise<{ totalCostUsd: number; totalTasks: number }> {
    try {
      const response = await fetch('/api/trust/cost/stats');
      if (!response.ok) return { totalCostUsd: 0, totalTasks: 0 };
      const data = await response.json();
      return {
        totalCostUsd: data.total_cost_usd || 0,
        totalTasks: data.total_tasks_tracked || 0,
      };
    } catch {
      return { totalCostUsd: 0, totalTasks: 0 };
    }
  }

  // ============== UI ACTIONS ==============

  private showProofDetails(proofId: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resonant:showProof', { detail: { proofId } }));
    }
  }

  private showVerificationDetails(result: { allPassed: boolean; results: VerificationResult[]; blockingErrors: string[] }): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resonant:showVerification', { detail: result }));
    }
  }

  private showFileDiff(path: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('resonant:showFileDiff', { detail: { path } }));
    }
  }

  private showAllDiffs(paths: string[]): void {
    paths.forEach(path => this.showFileDiff(path));
  }

  private openFiles(paths: string[]): void {
    paths.forEach(path => executionEffectsService.openFile(path));
  }

  // ============== SUBSCRIPTIONS ==============

  onProofGenerated(handler: ProofHandler): () => void {
    this.proofHandlers.add(handler);
    return () => this.proofHandlers.delete(handler);
  }

  onVerificationComplete(handler: VerificationHandler): () => void {
    this.verificationHandlers.add(handler);
    return () => this.verificationHandlers.delete(handler);
  }

  onRollbackExecuted(handler: RollbackHandler): () => void {
    this.rollbackHandlers.add(handler);
    return () => this.rollbackHandlers.delete(handler);
  }

  onCostUpdate(handler: CostHandler): () => void {
    this.costHandlers.add(handler);
    return () => this.costHandlers.delete(handler);
  }

  onExecutionComplete(handler: ExecutionCompleteHandler): () => void {
    this.executionCompleteHandlers.add(handler);
    return () => this.executionCompleteHandlers.delete(handler);
  }

  onFileVisibility(handler: FileVisibilityHandler): () => void {
    this.fileVisibilityHandlers.add(handler);
    return () => this.fileVisibilityHandlers.delete(handler);
  }

  // ============== GETTERS ==============

  getCurrentProof(): ExecutionProof | null {
    return this.currentProof;
  }

  getProofHistory(): ExecutionProof[] {
    return [...this.proofHistory];
  }
}

// ============== SINGLETON ==============
export const trustPrimitivesService = new TrustPrimitivesService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useTrustPrimitives() {
  const [currentProof, setCurrentProof] = useState<ExecutionProof | null>(null);
  const [lastVerification, setLastVerification] = useState<{ allPassed: boolean; results: VerificationResult[] } | null>(null);
  const [lastRollback, setLastRollback] = useState<RollbackResult | null>(null);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    // Initialize service
    trustPrimitivesService.initialize();

    // Subscribe to events
    const unsubProof = trustPrimitivesService.onProofGenerated((proof) => {
      setCurrentProof(proof as ExecutionProof);
    });

    const unsubVerification = trustPrimitivesService.onVerificationComplete((result) => {
      setLastVerification(result);
    });

    const unsubRollback = trustPrimitivesService.onRollbackExecuted((result) => {
      setLastRollback(result);
    });

    const unsubCost = trustPrimitivesService.onCostUpdate((cost) => {
      setTotalCost(prev => prev + cost.totalCostUsd);
    });

    return () => {
      unsubProof();
      unsubVerification();
      unsubRollback();
      unsubCost();
    };
  }, []);

  const requestRollback = useCallback(() => {
    return trustPrimitivesService.requestRollback();
  }, []);

  const verifyProof = useCallback((proofId: string) => {
    return trustPrimitivesService.verifyProof(proofId);
  }, []);

  return {
    currentProof,
    lastVerification,
    lastRollback,
    totalCost,
    requestRollback,
    verifyProof,
    getRecentProofs: () => trustPrimitivesService.getRecentProofs(),
    getCostStats: () => trustPrimitivesService.getCostStats(),
  };
}

export default trustPrimitivesService;
