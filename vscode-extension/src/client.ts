/**
 * Resonant Genesis API Client
 * Bridges VS Code extension to the orchestrator backend
 */

export interface TaskContext {
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  selectedCode?: string;
  language?: string;
}

export interface Task {
  id: string;
  description: string;
  status: string;
  plan?: ExecutionPlan;
  proof?: ExecutionProof;
}

export interface ExecutionPlan {
  id: string;
  steps: ExecutionStep[];
  estimatedDuration: number;
  estimatedCost: number;
  riskLevel: 'low' | 'medium' | 'high';
  requiresConfirmation: boolean;
}

export interface ExecutionStep {
  id: string;
  order: number;
  type: string;
  description: string;
  action: {
    type: string;
    target?: string;
    content?: string;
  };
  verification: {
    type: string;
  };
  result?: {
    success: boolean;
    output?: string;
    error?: string;
    duration: number;
  };
}

export interface ExecutionProof {
  taskId: string;
  success: boolean;
  summary: string;
  steps: Array<{
    stepId: string;
    description: string;
    success: boolean;
    duration: number;
  }>;
  diffs: Array<{
    path: string;
    type: string;
    oldContent?: string;
    newContent?: string;
    additions: number;
    deletions: number;
  }>;
  totalDuration: number;
  totalCost: number;
  tokensUsed: number;
  verificationResults: Array<{
    type: string;
    passed: boolean;
    output: string;
  }>;
}

export interface VerificationResult {
  type: string;
  passed: boolean;
  output: string;
  errors: Array<{
    file: string;
    line: number;
    message: string;
  }>;
}

export interface CodeAnalysis {
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    line: number;
    column: number;
    rule?: string;
  }>;
  metrics: {
    lines: number;
    complexity: number;
    maintainability: number;
  };
  suggestions: string[];
}

export interface ExecuteOptions {
  onStepStart?: (step: ExecutionStep) => void;
  onStepComplete?: (step: ExecutionStep) => void;
  onProgress?: (progress: number) => void;
}

export class ResonantClient {
  private baseUrl: string;
  private tasks: Map<string, Task> = new Map();
  private lastTaskId: string | null = null;
  private lastProof: ExecutionProof | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ============== HEALTH ==============

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // ============== TASKS ==============

  async createTask(description: string, context: TaskContext): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/api/orchestrator/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, context }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.status}`);
    }

    const task = await response.json();
    this.tasks.set(task.id, task);
    this.lastTaskId = task.id;
    return task;
  }

  async planTask(taskId: string): Promise<ExecutionPlan> {
    const response = await fetch(`${this.baseUrl}/api/orchestrator/tasks/${taskId}/plan`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to plan task: ${response.status}`);
    }

    const plan = await response.json();
    const task = this.tasks.get(taskId);
    if (task) {
      task.plan = plan;
    }
    return plan;
  }

  async executeTask(taskId: string, options?: ExecuteOptions): Promise<ExecutionProof> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    // Start execution
    const response = await fetch(`${this.baseUrl}/api/orchestrator/tasks/${taskId}/execute`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to execute task: ${response.status}`);
    }

    // Poll for status updates
    let completed = false;
    let proof: ExecutionProof | null = null;

    while (!completed) {
      await this.sleep(500);

      const statusResponse = await fetch(`${this.baseUrl}/api/orchestrator/tasks/${taskId}`);
      const status = await statusResponse.json();

      task.status = status.status;

      // Notify step progress
      if (status.execution && options?.onProgress) {
        const progress = (status.execution.completedSteps / (task.plan?.steps.length || 1)) * 100;
        options.onProgress(progress);
      }

      // Check current step
      if (status.plan?.steps) {
        const currentStep = status.plan.steps.find((s: ExecutionStep) => s.result?.success === undefined);
        const completedStep = status.plan.steps.filter((s: ExecutionStep) => s.result !== undefined).pop();

        if (currentStep && options?.onStepStart) {
          options.onStepStart(currentStep);
        }

        if (completedStep && options?.onStepComplete) {
          options.onStepComplete(completedStep);
        }
      }

      // Check completion
      if (status.status === 'completed' || status.status === 'failed' || status.status === 'rolled_back') {
        completed = true;
        proof = status.proof;
      }
    }

    if (!proof) {
      throw new Error('No proof generated');
    }

    task.proof = proof;
    this.lastProof = proof;
    return proof;
  }

  async rollbackTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/orchestrator/tasks/${taskId}/rollback`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to rollback task: ${response.status}`);
    }

    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'rolled_back';
    }
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getLastTask(): Task | null {
    if (!this.lastTaskId) return null;
    return this.tasks.get(this.lastTaskId) || null;
  }

  getLastProof(): ExecutionProof | null {
    return this.lastProof;
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  // ============== VERIFICATION ==============

  async verify(type: 'typecheck' | 'lint' | 'test' | 'all'): Promise<VerificationResult> {
    const response = await fetch(`${this.baseUrl}/api/verification/${type}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.status}`);
    }

    return response.json();
  }

  // ============== ANALYSIS ==============

  async analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
    const response = await fetch(`${this.baseUrl}/api/code/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`);
    }

    return response.json();
  }

  // ============== AUDIT TRAIL ==============

  async getAuditTrail(options?: {
    limit?: number;
    types?: string[];
  }): Promise<Array<{
    id: string;
    type: string;
    action: string;
    timestamp: number;
    actor: { type: string; name: string };
    details: { description: string };
    result: { success: boolean };
  }>> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.types) params.set('types', options.types.join(','));

    const response = await fetch(`${this.baseUrl}/api/audit?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get audit trail: ${response.status}`);
    }

    return response.json();
  }

  // ============== UTILITIES ==============

  disconnect(): void {
    this.tasks.clear();
    this.lastTaskId = null;
    this.lastProof = null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ResonantClient;
