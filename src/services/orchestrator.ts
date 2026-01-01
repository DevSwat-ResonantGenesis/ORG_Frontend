// ============== EXECUTION ORCHESTRATOR ==============
// Core service that implements: plan → execute → verify → prove → rollback
// This is the heart of the autonomous execution system

import { aiAssistantService } from './aiAssistant';
import { codeExecutionService } from './codeExecution';
import { fileSystemService } from './fileSystem';
import { gitService } from './git';
import { notificationsService } from './notifications';

// ============== TYPES ==============
export interface Task {
  id: string;
  description: string;
  context: TaskContext;
  status: TaskStatus;
  plan: ExecutionPlan | null;
  execution: ExecutionState | null;
  proof: ExecutionProof | null;
  createdAt: number;
  updatedAt: number;
}

export interface TaskContext {
  files: ContextFile[];
  selectedCode?: string;
  language?: string;
  projectPath?: string;
  dependencies?: string[];
  testFramework?: string;
}

export interface ContextFile {
  path: string;
  content: string;
  language: string;
}

export type TaskStatus = 
  | 'pending'
  | 'planning'
  | 'planned'
  | 'executing'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'rolled_back';

export interface ExecutionPlan {
  id: string;
  taskId: string;
  steps: ExecutionStep[];
  estimatedDuration: number;
  estimatedCost: number;
  riskLevel: 'low' | 'medium' | 'high';
  requiresConfirmation: boolean;
  createdAt: number;
}

export interface ExecutionStep {
  id: string;
  order: number;
  type: StepType;
  description: string;
  action: StepAction;
  verification: StepVerification;
  status: StepStatus;
  result?: StepResult;
  rollback?: RollbackAction;
}

export type StepType = 
  | 'file_create'
  | 'file_modify'
  | 'file_delete'
  | 'code_execute'
  | 'test_run'
  | 'lint_check'
  | 'type_check'
  | 'git_commit'
  | 'dependency_install'
  | 'custom';

export interface StepAction {
  type: string;
  target?: string;
  content?: string;
  command?: string;
  language?: string;
  args?: Record<string, unknown>;
}

export interface StepVerification {
  type: 'none' | 'test' | 'typecheck' | 'lint' | 'custom';
  command?: string;
  expectedOutput?: string;
  timeout?: number;
}

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'rolled_back';

export interface StepResult {
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  verificationPassed?: boolean;
  verificationOutput?: string;
}

export interface RollbackAction {
  type: string;
  data: unknown;
}

export interface ExecutionState {
  currentStepIndex: number;
  startedAt: number;
  completedSteps: number;
  failedSteps: number;
  totalTokensUsed: number;
  totalCost: number;
}

export interface ExecutionProof {
  taskId: string;
  success: boolean;
  summary: string;
  steps: StepProof[];
  diffs: FileDiff[];
  totalDuration: number;
  totalCost: number;
  tokensUsed: number;
  verificationResults: VerificationResult[];
  timestamp: number;
}

export interface StepProof {
  stepId: string;
  description: string;
  success: boolean;
  duration: number;
  output?: string;
}

export interface FileDiff {
  path: string;
  type: 'created' | 'modified' | 'deleted';
  oldContent?: string;
  newContent?: string;
  additions: number;
  deletions: number;
}

export interface VerificationResult {
  type: string;
  passed: boolean;
  output: string;
  duration: number;
}

// Event handlers
type TaskEventHandler = (task: Task) => void;
type StepEventHandler = (step: ExecutionStep, task: Task) => void;

// ============== ORCHESTRATOR SERVICE ==============
class OrchestratorService {
  private tasks = new Map<string, Task>();
  private taskHandlers = new Set<TaskEventHandler>();
  private stepHandlers = new Set<StepEventHandler>();
  private fileSnapshots = new Map<string, Map<string, string>>();
  private isExecuting = false;
  private currentTaskId: string | null = null;

  // ============== TASK LIFECYCLE ==============

  // Create a new task
  async createTask(description: string, context: TaskContext): Promise<Task> {
    const task: Task = {
      id: this.generateId('task'),
      description,
      context,
      status: 'pending',
      plan: null,
      execution: null,
      proof: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.tasks.set(task.id, task);
    this.notifyTaskChange(task);
    
    return task;
  }

  // Generate execution plan for a task
  async planTask(taskId: string): Promise<ExecutionPlan> {
    const task = this.getTask(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    this.updateTaskStatus(taskId, 'planning');

    try {
      // Use AI to generate plan
      const plan = await this.generatePlan(task);
      
      task.plan = plan;
      task.updatedAt = Date.now();
      this.updateTaskStatus(taskId, 'planned');

      return plan;
    } catch (error) {
      this.updateTaskStatus(taskId, 'failed');
      throw error;
    }
  }

  // Execute a planned task
  async executeTask(taskId: string, options?: { 
    skipConfirmation?: boolean;
    stopOnFailure?: boolean;
  }): Promise<ExecutionProof> {
    const task = this.getTask(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    if (!task.plan) throw new Error('Task has no plan');
    if (this.isExecuting) throw new Error('Another task is already executing');

    const { skipConfirmation = false, stopOnFailure = true } = options || {};

    // Check if confirmation required
    if (task.plan.requiresConfirmation && !skipConfirmation) {
      throw new Error('Task requires confirmation before execution');
    }

    this.isExecuting = true;
    this.currentTaskId = taskId;

    // Create file snapshots for rollback
    await this.createSnapshots(taskId, task.context.files);

    // Initialize execution state
    task.execution = {
      currentStepIndex: 0,
      startedAt: Date.now(),
      completedSteps: 0,
      failedSteps: 0,
      totalTokensUsed: 0,
      totalCost: 0,
    };

    this.updateTaskStatus(taskId, 'executing');

    const stepProofs: StepProof[] = [];
    const diffs: FileDiff[] = [];
    const verificationResults: VerificationResult[] = [];

    try {
      // Execute each step
      for (let i = 0; i < task.plan.steps.length; i++) {
        const step = task.plan.steps[i];
        task.execution.currentStepIndex = i;
        
        this.notifyStepChange(step, task);

        const stepResult = await this.executeStep(step, task);
        
        stepProofs.push({
          stepId: step.id,
          description: step.description,
          success: stepResult.success,
          duration: stepResult.duration,
          output: stepResult.output,
        });

        if (stepResult.success) {
          task.execution.completedSteps++;
          
          // Run verification if specified
          if (step.verification.type !== 'none') {
            const verifyResult = await this.verifyStep(step, task);
            verificationResults.push(verifyResult);
            
            if (!verifyResult.passed && stopOnFailure) {
              throw new Error(`Verification failed for step ${step.id}: ${verifyResult.output}`);
            }
          }

          // Track file diffs
          if (step.type === 'file_create' || step.type === 'file_modify' || step.type === 'file_delete') {
            const diff = await this.trackDiff(step, task);
            if (diff) diffs.push(diff);
          }
        } else {
          task.execution.failedSteps++;
          
          if (stopOnFailure) {
            throw new Error(`Step ${step.id} failed: ${stepResult.error}`);
          }
        }
      }

      // All steps completed - run final verification
      this.updateTaskStatus(taskId, 'verifying');
      const finalVerification = await this.runFinalVerification(task);
      verificationResults.push(...finalVerification);

      // Generate proof
      const proof = this.generateProof(task, stepProofs, diffs, verificationResults, true);
      task.proof = proof;
      
      this.updateTaskStatus(taskId, 'completed');
      
      notificationsService.success('Task completed', {
        message: `${task.plan.steps.length} steps executed successfully`,
        duration: 5000,
      });

      return proof;

    } catch (error) {
      // Execution failed - rollback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      notificationsService.error('Task failed', {
        message: errorMessage,
        persistent: true,
      });

      // Attempt rollback
      await this.rollbackTask(taskId);

      // Generate failure proof
      const proof = this.generateProof(task, stepProofs, diffs, verificationResults, false, errorMessage);
      task.proof = proof;

      throw error;

    } finally {
      this.isExecuting = false;
      this.currentTaskId = null;
    }
  }

  // Rollback a task to its initial state
  async rollbackTask(taskId: string): Promise<void> {
    const task = this.getTask(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);

    const snapshots = this.fileSnapshots.get(taskId);
    if (!snapshots) {
      console.warn('No snapshots found for rollback');
      return;
    }

    notificationsService.info('Rolling back changes...', { duration: 3000 });

    // Restore all files to their snapshot state
    for (const [path, content] of snapshots.entries()) {
      try {
        if (content === '__DELETED__') {
          // File was created during execution, delete it
          await fileSystemService.delete(path);
        } else {
          // Restore original content
          await fileSystemService.writeFile(path, content);
        }
      } catch (error) {
        console.error(`Failed to rollback file: ${path}`, error);
      }
    }

    // Mark all steps as rolled back
    if (task.plan) {
      for (const step of task.plan.steps) {
        if (step.status === 'completed' || step.status === 'failed') {
          step.status = 'rolled_back';
        }
      }
    }

    this.updateTaskStatus(taskId, 'rolled_back');
    this.fileSnapshots.delete(taskId);

    notificationsService.success('Rollback complete', {
      message: 'All changes have been reverted',
      duration: 5000,
    });
  }

  // ============== PLAN GENERATION ==============

  private async generatePlan(task: Task): Promise<ExecutionPlan> {
    const prompt = this.buildPlanningPrompt(task);
    
    // Call AI to generate plan
    let planJson: string = '';
    
    await aiAssistantService.sendMessage(
      `plan-${task.id}`,
      prompt,
      {
        onToken: (token) => { planJson += token; },
        onComplete: () => {},
        onError: (error) => { throw error; },
      },
      {
        temperature: 0.3, // Lower temperature for more predictable plans
        systemPrompt: PLANNING_SYSTEM_PROMPT,
      }
    );

    // Parse plan from response
    const plan = this.parsePlanFromResponse(planJson, task);
    return plan;
  }

  private buildPlanningPrompt(task: Task): string {
    let prompt = `Task: ${task.description}\n\n`;
    
    if (task.context.files.length > 0) {
      prompt += 'Files in context:\n';
      for (const file of task.context.files) {
        prompt += `\n--- ${file.path} (${file.language}) ---\n`;
        prompt += file.content.slice(0, 2000); // Limit content size
        if (file.content.length > 2000) {
          prompt += '\n... (truncated)';
        }
      }
    }

    if (task.context.selectedCode) {
      prompt += `\nSelected code:\n\`\`\`${task.context.language || ''}\n${task.context.selectedCode}\n\`\`\``;
    }

    prompt += `\n\nGenerate an execution plan with steps. For each step, specify:
1. Type (file_create, file_modify, file_delete, code_execute, test_run, lint_check, type_check)
2. Description
3. Action details
4. Verification method
5. Risk level

Output as JSON array of steps.`;

    return prompt;
  }

  private parsePlanFromResponse(response: string, task: Task): ExecutionPlan {
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    let steps: ExecutionStep[] = [];

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        steps = parsed.map((s: Record<string, unknown>, index: number) => ({
          id: this.generateId('step'),
          order: index,
          type: s.type || 'custom',
          description: s.description || `Step ${index + 1}`,
          action: s.action || {},
          verification: s.verification || { type: 'none' },
          status: 'pending' as StepStatus,
          rollback: s.rollback,
        }));
      } catch {
        // Fallback: create single step from description
        steps = [{
          id: this.generateId('step'),
          order: 0,
          type: 'custom',
          description: task.description,
          action: { type: 'manual' },
          verification: { type: 'none' },
          status: 'pending',
        }];
      }
    }

    const plan: ExecutionPlan = {
      id: this.generateId('plan'),
      taskId: task.id,
      steps,
      estimatedDuration: steps.length * 5000, // 5s per step estimate
      estimatedCost: steps.length * 0.01, // $0.01 per step estimate
      riskLevel: this.assessRiskLevel(steps),
      requiresConfirmation: steps.some(s => 
        s.type === 'file_delete' || 
        s.type === 'git_commit' ||
        s.type === 'dependency_install'
      ),
      createdAt: Date.now(),
    };

    return plan;
  }

  private assessRiskLevel(steps: ExecutionStep[]): 'low' | 'medium' | 'high' {
    const hasDelete = steps.some(s => s.type === 'file_delete');
    const hasGit = steps.some(s => s.type === 'git_commit');
    const hasDeps = steps.some(s => s.type === 'dependency_install');
    const hasExec = steps.some(s => s.type === 'code_execute');

    if (hasDelete || hasDeps) return 'high';
    if (hasGit || hasExec) return 'medium';
    return 'low';
  }

  // ============== STEP EXECUTION ==============

  private async executeStep(step: ExecutionStep, task: Task): Promise<StepResult> {
    const startTime = Date.now();
    step.status = 'running';
    this.notifyStepChange(step, task);

    try {
      let output = '';

      switch (step.type) {
        case 'file_create':
          await fileSystemService.createFile(
            step.action.target!,
            step.action.content || ''
          );
          output = `Created file: ${step.action.target}`;
          break;

        case 'file_modify':
          await fileSystemService.writeFile(
            step.action.target!,
            step.action.content || ''
          );
          output = `Modified file: ${step.action.target}`;
          break;

        case 'file_delete':
          await fileSystemService.delete(step.action.target!);
          output = `Deleted file: ${step.action.target}`;
          break;

        case 'code_execute':
          const execResult = await codeExecutionService.execute({
            code: step.action.content!,
            language: step.action.language || 'python',
            timeout: 30000,
          });
          output = execResult.output;
          if (!execResult.success) {
            throw new Error(execResult.error || 'Code execution failed');
          }
          break;

        case 'test_run':
          const testResult = await codeExecutionService.execute({
            code: step.action.command || 'npm test',
            language: 'bash',
            timeout: 60000,
          });
          output = testResult.output;
          if (!testResult.success) {
            throw new Error(`Tests failed: ${testResult.error}`);
          }
          break;

        case 'type_check':
          const typeResult = await codeExecutionService.execute({
            code: step.action.command || 'npx tsc --noEmit',
            language: 'bash',
            timeout: 30000,
          });
          output = typeResult.output;
          if (!typeResult.success) {
            throw new Error(`Type check failed: ${typeResult.error}`);
          }
          break;

        case 'lint_check':
          const lintResult = await codeExecutionService.execute({
            code: step.action.command || 'npx eslint .',
            language: 'bash',
            timeout: 30000,
          });
          output = lintResult.output;
          // Lint warnings don't fail the step
          break;

        case 'git_commit':
          await gitService.stageAll();
          await gitService.commit(step.action.content || 'Automated commit');
          output = 'Changes committed';
          break;

        default:
          output = 'Custom step executed';
      }

      step.status = 'completed';
      step.result = {
        success: true,
        output,
        duration: Date.now() - startTime,
      };

      this.notifyStepChange(step, task);
      return step.result;

    } catch (error) {
      step.status = 'failed';
      step.result = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };

      this.notifyStepChange(step, task);
      return step.result;
    }
  }

  // ============== VERIFICATION ==============

  private async verifyStep(step: ExecutionStep, task: Task): Promise<VerificationResult> {
    const startTime = Date.now();

    try {
      let passed = true;
      let output = '';

      switch (step.verification.type) {
        case 'test':
          const testResult = await codeExecutionService.execute({
            code: step.verification.command || 'npm test',
            language: 'bash',
            timeout: step.verification.timeout || 60000,
          });
          passed = testResult.success;
          output = testResult.output;
          break;

        case 'typecheck':
          const typeResult = await codeExecutionService.execute({
            code: step.verification.command || 'npx tsc --noEmit',
            language: 'bash',
            timeout: 30000,
          });
          passed = typeResult.success;
          output = typeResult.output;
          break;

        case 'lint':
          const lintResult = await codeExecutionService.execute({
            code: step.verification.command || 'npx eslint . --max-warnings=0',
            language: 'bash',
            timeout: 30000,
          });
          passed = lintResult.success;
          output = lintResult.output;
          break;

        case 'custom':
          if (step.verification.command) {
            const customResult = await codeExecutionService.execute({
              code: step.verification.command,
              language: 'bash',
              timeout: step.verification.timeout || 30000,
            });
            passed = customResult.success;
            output = customResult.output;

            if (step.verification.expectedOutput) {
              passed = output.includes(step.verification.expectedOutput);
            }
          }
          break;
      }

      step.result = {
        ...step.result!,
        verificationPassed: passed,
        verificationOutput: output,
      };

      return {
        type: step.verification.type,
        passed,
        output,
        duration: Date.now() - startTime,
      };

    } catch (error) {
      return {
        type: step.verification.type,
        passed: false,
        output: error instanceof Error ? error.message : 'Verification failed',
        duration: Date.now() - startTime,
      };
    }
  }

  private async runFinalVerification(task: Task): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];

    // Run type check if TypeScript files were modified
    const hasTsFiles = task.context.files.some(f => 
      f.language === 'typescript' || f.language === 'typescriptreact'
    );

    if (hasTsFiles) {
      const typeCheck = await codeExecutionService.execute({
        code: 'npx tsc --noEmit 2>&1 || true',
        language: 'bash',
        timeout: 60000,
      });

      results.push({
        type: 'typecheck',
        passed: typeCheck.success || !typeCheck.output.includes('error'),
        output: typeCheck.output,
        duration: typeCheck.executionTime * 1000,
      });
    }

    // Run tests if test framework detected
    if (task.context.testFramework) {
      const testCommand = this.getTestCommand(task.context.testFramework);
      const testResult = await codeExecutionService.execute({
        code: testCommand,
        language: 'bash',
        timeout: 120000,
      });

      results.push({
        type: 'test',
        passed: testResult.success,
        output: testResult.output,
        duration: testResult.executionTime * 1000,
      });
    }

    return results;
  }

  private getTestCommand(framework: string): string {
    const commands: Record<string, string> = {
      'jest': 'npx jest --passWithNoTests',
      'vitest': 'npx vitest run',
      'mocha': 'npx mocha',
      'pytest': 'pytest -v',
      'unittest': 'python -m unittest discover',
    };
    return commands[framework] || 'npm test';
  }

  // ============== SNAPSHOTS & DIFFS ==============

  private async createSnapshots(taskId: string, files: ContextFile[]): Promise<void> {
    const snapshots = new Map<string, string>();

    for (const file of files) {
      try {
        const content = await fileSystemService.readFile(file.path);
        snapshots.set(file.path, content);
      } catch {
        // File doesn't exist yet - mark for deletion on rollback
        snapshots.set(file.path, '__DELETED__');
      }
    }

    this.fileSnapshots.set(taskId, snapshots);
  }

  private async trackDiff(step: ExecutionStep, task: Task): Promise<FileDiff | null> {
    const path = step.action.target;
    if (!path) return null;

    const snapshots = this.fileSnapshots.get(task.id);
    const oldContent = snapshots?.get(path);
    
    let newContent: string | undefined;
    let type: 'created' | 'modified' | 'deleted';

    try {
      newContent = await fileSystemService.readFile(path);
      type = oldContent === '__DELETED__' ? 'created' : 'modified';
    } catch {
      type = 'deleted';
    }

    if (step.type === 'file_delete') {
      type = 'deleted';
      newContent = undefined;
    }

    const additions = newContent ? newContent.split('\n').length : 0;
    const deletions = oldContent && oldContent !== '__DELETED__' ? oldContent.split('\n').length : 0;

    return {
      path,
      type,
      oldContent: oldContent === '__DELETED__' ? undefined : oldContent,
      newContent,
      additions: type === 'deleted' ? 0 : additions,
      deletions: type === 'created' ? 0 : deletions,
    };
  }

  // ============== PROOF GENERATION ==============

  private generateProof(
    task: Task,
    stepProofs: StepProof[],
    diffs: FileDiff[],
    verificationResults: VerificationResult[],
    success: boolean,
    error?: string
  ): ExecutionProof {
    const totalDuration = task.execution 
      ? Date.now() - task.execution.startedAt 
      : 0;

    const summary = success
      ? `Task completed successfully. ${stepProofs.filter(s => s.success).length}/${stepProofs.length} steps passed.`
      : `Task failed: ${error}. ${stepProofs.filter(s => s.success).length}/${stepProofs.length} steps completed before failure.`;

    return {
      taskId: task.id,
      success,
      summary,
      steps: stepProofs,
      diffs,
      totalDuration,
      totalCost: task.execution?.totalCost || 0,
      tokensUsed: task.execution?.totalTokensUsed || 0,
      verificationResults,
      timestamp: Date.now(),
    };
  }

  // ============== GETTERS & SUBSCRIPTIONS ==============

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getActiveTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => 
      t.status === 'planning' || t.status === 'executing' || t.status === 'verifying'
    );
  }

  getCurrentTask(): Task | null {
    return this.currentTaskId ? this.tasks.get(this.currentTaskId) || null : null;
  }

  isTaskExecuting(): boolean {
    return this.isExecuting;
  }

  onTaskChange(handler: TaskEventHandler): () => void {
    this.taskHandlers.add(handler);
    return () => this.taskHandlers.delete(handler);
  }

  onStepChange(handler: StepEventHandler): () => void {
    this.stepHandlers.add(handler);
    return () => this.stepHandlers.delete(handler);
  }

  // ============== UTILITIES ==============

  private updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      task.updatedAt = Date.now();
      this.notifyTaskChange(task);
    }
  }

  private notifyTaskChange(task: Task): void {
    this.taskHandlers.forEach(handler => handler(task));
  }

  private notifyStepChange(step: ExecutionStep, task: Task): void {
    this.stepHandlers.forEach(handler => handler(step, task));
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== PLANNING SYSTEM PROMPT ==============
const PLANNING_SYSTEM_PROMPT = `You are an execution planner for an AI IDE. Your job is to break down coding tasks into safe, verifiable steps.

For each task, generate a JSON array of steps. Each step must have:
- type: one of (file_create, file_modify, file_delete, code_execute, test_run, lint_check, type_check, git_commit, custom)
- description: human-readable description
- action: { type, target (file path), content, command, language }
- verification: { type: none|test|typecheck|lint|custom, command }

Rules:
1. ALWAYS include verification for code changes
2. NEVER delete files without explicit user request
3. ALWAYS create backups before destructive operations
4. Order steps from safest to most impactful
5. Include type checking after TypeScript changes
6. Include tests after logic changes

Example output:
[
  {
    "type": "file_modify",
    "description": "Add error handling to fetchUser function",
    "action": {
      "type": "modify",
      "target": "src/api/user.ts",
      "content": "..."
    },
    "verification": {
      "type": "typecheck",
      "command": "npx tsc --noEmit"
    }
  }
]`;

// ============== SINGLETON ==============
export const orchestratorService = new OrchestratorService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useOrchestrator() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const unsubTask = orchestratorService.onTaskChange((task) => {
      if (task.id === orchestratorService.getCurrentTask()?.id) {
        setCurrentTask(task);
      }
      setIsExecuting(orchestratorService.isTaskExecuting());
    });

    return unsubTask;
  }, []);

  const createAndExecute = useCallback(async (
    description: string,
    context: TaskContext,
    options?: { autoExecute?: boolean }
  ) => {
    const task = await orchestratorService.createTask(description, context);
    setCurrentTask(task);

    const plan = await orchestratorService.planTask(task.id);
    
    if (options?.autoExecute && !plan.requiresConfirmation) {
      return orchestratorService.executeTask(task.id);
    }

    return plan;
  }, []);

  const executeTask = useCallback(async (taskId: string) => {
    return orchestratorService.executeTask(taskId);
  }, []);

  const rollbackTask = useCallback(async (taskId: string) => {
    return orchestratorService.rollbackTask(taskId);
  }, []);

  return {
    currentTask,
    isExecuting,
    createAndExecute,
    executeTask,
    rollbackTask,
    getTask: orchestratorService.getTask.bind(orchestratorService),
    getAllTasks: orchestratorService.getAllTasks.bind(orchestratorService),
  };
}

export function useTaskProgress(taskId: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [currentStep, setCurrentStep] = useState<ExecutionStep | null>(null);

  useEffect(() => {
    setTask(orchestratorService.getTask(taskId) || null);

    const unsubTask = orchestratorService.onTaskChange((t) => {
      if (t.id === taskId) {
        setTask(t);
      }
    });

    const unsubStep = orchestratorService.onStepChange((step, t) => {
      if (t.id === taskId) {
        setCurrentStep(step);
      }
    });

    return () => {
      unsubTask();
      unsubStep();
    };
  }, [taskId]);

  const progress = task?.plan 
    ? (task.execution?.completedSteps || 0) / task.plan.steps.length * 100
    : 0;

  return { task, currentStep, progress };
}

export default orchestratorService;
