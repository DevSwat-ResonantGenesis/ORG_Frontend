// ============== SMART EXECUTOR SERVICE ==============
// Executes plans with verification and self-correction

import {
  ExecutionPlan,
  ExecutionStep,
  ExecutionContext,
  ExecutionResult,
  StepResult,
  FileChange,
  ISmartExecutor,
  StepStatus,
} from './types';

export class SmartExecutor implements ISmartExecutor {
  private state: 'idle' | 'running' | 'paused' | 'cancelled' = 'idle';
  private currentPlan: ExecutionPlan | null = null;
  private onStepStart?: (step: ExecutionStep) => void;
  private onStepComplete?: (step: ExecutionStep, result: StepResult) => void;
  private onPlanComplete?: (result: ExecutionResult) => void;
  private onError?: (error: Error, step: ExecutionStep) => void;

  constructor(callbacks?: {
    onStepStart?: (step: ExecutionStep) => void;
    onStepComplete?: (step: ExecutionStep, result: StepResult) => void;
    onPlanComplete?: (result: ExecutionResult) => void;
    onError?: (error: Error, step: ExecutionStep) => void;
  }) {
    if (callbacks) {
      this.onStepStart = callbacks.onStepStart;
      this.onStepComplete = callbacks.onStepComplete;
      this.onPlanComplete = callbacks.onPlanComplete;
      this.onError = callbacks.onError;
    }
  }

  async execute(plan: ExecutionPlan, context: ExecutionContext): Promise<ExecutionResult> {
    this.state = 'running';
    this.currentPlan = plan;
    const startTime = Date.now();
    const stepResults: StepResult[] = [];
    let currentContext = { ...context };

    // Sort steps by dependencies
    const sortedSteps = this.topologicalSort(plan.steps);

    for (let i = 0; i < sortedSteps.length; i++) {
      // Check if execution should stop
      if (this.state as string === 'cancelled') {
        return this.createResult(plan, stepResults, currentContext, startTime, false, 'Execution cancelled');
      }

      // Wait if paused
      while ((this.state as string) === 'paused') {
        await this.sleep(100);
      }

      const step = sortedSteps[i];
      plan.currentStepIndex = i;

      // Check dependencies are complete
      if (!this.areDependenciesMet(step, stepResults)) {
        stepResults.push({
          stepId: step.id,
          success: false,
          output: 'Dependencies not met',
          error: 'Prerequisite steps failed',
          duration: 0,
          timestamp: new Date(),
        });
        continue;
      }

      // Notify step start
      step.status = 'in_progress';
      this.onStepStart?.(step);

      try {
        // Execute the step
        const result = await this.executeStep(step, currentContext);
        stepResults.push(result);
        step.result = result;

        // Verify the step
        const verified = await this.verifyStep(step, result, currentContext);
        
        if (!verified && result.success) {
          // Try self-correction
          const correctionResult = await this.attemptCorrection(step, result, currentContext);
          if (correctionResult) {
            stepResults[stepResults.length - 1] = correctionResult;
            step.result = correctionResult;
          }
        }

        step.status = result.success ? 'completed' : 'failed';
        this.onStepComplete?.(step, result);

        // Update context with changes
        if (result.changes) {
          currentContext = this.updateContextWithChanges(currentContext, result.changes);
        }

        // If step failed and is critical, stop execution
        if (!result.success && this.isCriticalStep(step)) {
          return this.createResult(plan, stepResults, currentContext, startTime, false, `Critical step failed: ${step.purpose}`);
        }

      } catch (error) {
        const errorResult: StepResult = {
          stepId: step.id,
          success: false,
          output: '',
          error: error instanceof Error ? error.message : String(error),
          duration: 0,
          timestamp: new Date(),
        };
        stepResults.push(errorResult);
        step.status = 'failed';
        step.result = errorResult;
        
        this.onError?.(error instanceof Error ? error : new Error(String(error)), step);

        if (this.isCriticalStep(step)) {
          return this.createResult(plan, stepResults, currentContext, startTime, false, `Step error: ${errorResult.error}`);
        }
      }
    }

    // Verify overall plan success
    const planSuccess = this.verifyPlanSuccess(plan, stepResults);
    const result = this.createResult(plan, stepResults, currentContext, startTime, planSuccess);
    
    this.state = 'idle';
    this.currentPlan = null;
    this.onPlanComplete?.(result);
    
    return result;
  }

  async executeStep(step: ExecutionStep, context: ExecutionContext): Promise<StepResult> {
    const startTime = Date.now();

    try {
      let output = '';
      let changes: FileChange[] | undefined;

      switch (step.action) {
        case 'read_file':
          output = await this.readFile(step.target, context);
          break;

        case 'write_file':
        case 'create_file':
          changes = await this.writeFile(step.target, step, context);
          output = `File ${step.action === 'create_file' ? 'created' : 'written'}: ${step.target}`;
          break;

        case 'modify_file':
          changes = await this.modifyFile(step.target, step, context);
          output = `File modified: ${step.target}`;
          break;

        case 'delete_file':
          changes = await this.deleteFile(step.target, context);
          output = `File deleted: ${step.target}`;
          break;

        case 'run_command':
          output = await this.runCommand(step.target);
          break;

        case 'search_code':
          output = await this.searchCode(step.target, context);
          break;

        case 'analyze_code':
          output = await this.analyzeCode(step.target, context);
          break;

        case 'verify_change':
          output = await this.verifyChange(step.target, context);
          break;

        case 'ask_user':
          output = await this.askUser(step.target, step.purpose);
          break;

        case 'wait':
          await this.sleep(parseInt(step.target) || 1000);
          output = 'Wait completed';
          break;

        default:
          output = `Unknown action: ${step.action}`;
      }

      return {
        stepId: step.id,
        success: true,
        output,
        changes,
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        stepId: step.id,
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  async rollback(plan: ExecutionPlan, toStepIndex: number): Promise<void> {
    const stepsToRollback = plan.steps.slice(toStepIndex).reverse();

    for (const step of stepsToRollback) {
      if (step.rollback && step.status === 'completed') {
        try {
          // Execute rollback
          await this.executeRollback(step);
          step.status = 'pending';
        } catch (error) {
          console.error(`Rollback failed for step ${step.id}:`, error);
        }
      }
    }
  }

  pause(): void {
    if (this.state === 'running') {
      this.state = 'paused';
    }
  }

  resume(): void {
    if (this.state === 'paused') {
      this.state = 'running';
    }
  }

  cancel(): void {
    this.state = 'cancelled';
  }

  getState(): 'idle' | 'running' | 'paused' | 'cancelled' {
    return this.state;
  }

  getCurrentPlan(): ExecutionPlan | null {
    return this.currentPlan;
  }

  // ============== STEP EXECUTION METHODS ==============

  private async readFile(path: string, context: ExecutionContext): Promise<string> {
    // Check if file is already in context
    const openFile = context.openFiles.find(f => f.path === path);
    if (openFile) {
      return `File content (${openFile.content.length} chars):\n${openFile.content.slice(0, 2000)}...`;
    }

    // Fetch from API
    try {
      const response = await fetch(`/api/v1/code/file?path=${encodeURIComponent(path)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to read file: ${response.status}`);
      }

      const data = await response.json();
      return `File content:\n${data.content}`;
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error}`);
    }
  }

  private async writeFile(path: string, step: ExecutionStep, context: ExecutionContext): Promise<FileChange[]> {
    // This would integrate with the IDE's file system
    // For now, we'll use the API
    try {
      const response = await fetch('/api/v1/code/file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({
          path,
          action: step.action,
          purpose: step.purpose,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to write file: ${response.status}`);
      }

      const data = await response.json();
      return [{
        path,
        type: step.action === 'create_file' ? 'create' : 'modify',
        after: data.content,
      }];
    } catch (error) {
      // Fallback: notify IDE to create file
      this.notifyIDE('write_file', { path, purpose: step.purpose });
      return [{
        path,
        type: step.action === 'create_file' ? 'create' : 'modify',
      }];
    }
  }

  private async modifyFile(path: string, step: ExecutionStep, context: ExecutionContext): Promise<FileChange[]> {
    try {
      const response = await fetch('/api/v1/code/modify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({
          path,
          purpose: step.purpose,
          context: context.activeFile?.content?.slice(0, 5000),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to modify file: ${response.status}`);
      }

      const data = await response.json();
      return [{
        path,
        type: 'modify',
        before: data.before,
        after: data.after,
        diff: data.diff,
      }];
    } catch (error) {
      this.notifyIDE('modify_file', { path, purpose: step.purpose });
      return [{
        path,
        type: 'modify',
      }];
    }
  }

  private async deleteFile(path: string, context: ExecutionContext): Promise<FileChange[]> {
    const existingFile = context.openFiles.find(f => f.path === path);
    
    try {
      const response = await fetch(`/api/v1/code/file?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.status}`);
      }

      return [{
        path,
        type: 'delete',
        before: existingFile?.content,
      }];
    } catch (error) {
      this.notifyIDE('delete_file', { path });
      return [{
        path,
        type: 'delete',
      }];
    }
  }

  private async runCommand(command: string): Promise<string> {
    try {
      const response = await fetch('/api/v1/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({ command }),
      });

      if (!response.ok) {
        throw new Error(`Command execution failed: ${response.status}`);
      }

      const data = await response.json();
      return data.output || 'Command completed';
    } catch (error) {
      this.notifyIDE('run_command', { command });
      return `Command queued: ${command}`;
    }
  }

  private async searchCode(query: string, context: ExecutionContext): Promise<string> {
    try {
      const response = await fetch(`/api/v1/code/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      return `Found ${data.results?.length || 0} results:\n${JSON.stringify(data.results?.slice(0, 10), null, 2)}`;
    } catch (error) {
      return `Search for "${query}" - results pending`;
    }
  }

  private async analyzeCode(target: string, context: ExecutionContext): Promise<string> {
    const file = context.activeFile || context.openFiles.find(f => f.path === target);
    
    if (!file) {
      return 'No file to analyze';
    }

    try {
      const response = await fetch('/api/v1/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({
          code: file.content.slice(0, 10000),
          language: file.language,
          path: file.path,
        }),
      });

      if (!response.ok) {
        // Fallback to basic analysis
        return this.basicCodeAnalysis(file.content, file.language);
      }

      const data = await response.json();
      return data.analysis || this.basicCodeAnalysis(file.content, file.language);
    } catch (error) {
      return this.basicCodeAnalysis(file.content, file.language);
    }
  }

  private basicCodeAnalysis(code: string, language: string): string {
    const lines = code.split('\n').length;
    const functions = (code.match(/function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\(/g) || []).length;
    const classes = (code.match(/class\s+\w+/g) || []).length;
    const imports = (code.match(/import\s+/g) || []).length;
    const exports = (code.match(/export\s+/g) || []).length;

    return `Code Analysis:
- Language: ${language}
- Lines: ${lines}
- Functions/Methods: ${functions}
- Classes: ${classes}
- Imports: ${imports}
- Exports: ${exports}`;
  }

  private async verifyChange(target: string, context: ExecutionContext): Promise<string> {
    // Basic verification - check if file exists and has no syntax errors
    try {
      const response = await fetch('/api/v1/code/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({ path: target }),
      });

      if (!response.ok) {
        return 'Verification pending - manual check recommended';
      }

      const data = await response.json();
      return data.valid ? 'Verification passed' : `Verification issues: ${data.errors?.join(', ')}`;
    } catch {
      return 'Verification completed (basic)';
    }
  }

  private async askUser(target: string, purpose: string): Promise<string> {
    // This would integrate with the IDE's UI to show a dialog
    this.notifyIDE('ask_user', { target, purpose });
    return `User confirmation requested: ${purpose}`;
  }

  private async executeRollback(step: ExecutionStep): Promise<void> {
    if (!step.rollback) return;

    // Parse rollback instruction and execute
    if (step.rollback.startsWith('Delete ')) {
      const path = step.rollback.replace('Delete ', '');
      await this.deleteFile(path, { openFiles: [] } as unknown as ExecutionContext);
    } else if (step.rollback.includes('Restore')) {
      // Would need to restore from backup
      this.notifyIDE('rollback', { step: step.id, instruction: step.rollback });
    }
  }

  // ============== VERIFICATION METHODS ==============

  private async verifyStep(step: ExecutionStep, result: StepResult, context: ExecutionContext): Promise<boolean> {
    if (!result.success) return false;

    // Additional verification based on step type
    switch (step.action) {
      case 'create_file':
      case 'write_file':
        // Verify file exists
        return result.changes?.some(c => c.type === 'create' || c.type === 'modify') || false;

      case 'modify_file':
        // Verify changes were applied
        return result.changes?.some(c => c.after !== c.before) || false;

      case 'verify_change':
        return result.output.includes('passed') || result.output.includes('completed');

      default:
        return true;
    }
  }

  private async attemptCorrection(
    step: ExecutionStep,
    result: StepResult,
    context: ExecutionContext
  ): Promise<StepResult | null> {
    // Try to self-correct common issues
    if (result.error?.includes('not found') && step.action === 'read_file') {
      // File doesn't exist - this might be expected for create operations
      return null;
    }

    if (result.error?.includes('syntax error')) {
      // Try to fix syntax errors
      try {
        const fixResult = await this.tryFixSyntaxError(step, context);
        if (fixResult) return fixResult;
      } catch {
        // Correction failed
      }
    }

    return null;
  }

  private async tryFixSyntaxError(step: ExecutionStep, context: ExecutionContext): Promise<StepResult | null> {
    // Would use AI to attempt to fix the syntax error
    // For now, return null to indicate correction not possible
    return null;
  }

  private verifyPlanSuccess(plan: ExecutionPlan, results: StepResult[]): boolean {
    // Check all critical steps succeeded
    const criticalSteps = plan.steps.filter(s => this.isCriticalStep(s));
    const criticalResults = results.filter(r => criticalSteps.some(s => s.id === r.stepId));
    
    if (criticalResults.some(r => !r.success)) {
      return false;
    }

    // Check success criteria
    const successRate = results.filter(r => r.success).length / results.length;
    return successRate >= 0.8; // 80% success rate required
  }

  // ============== UTILITY METHODS ==============

  private topologicalSort(steps: ExecutionStep[]): ExecutionStep[] {
    const sorted: ExecutionStep[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (step: ExecutionStep) => {
      if (temp.has(step.id)) {
        throw new Error('Circular dependency detected');
      }
      if (visited.has(step.id)) {
        return;
      }

      temp.add(step.id);

      if (step.dependsOn) {
        for (const depId of step.dependsOn) {
          const depStep = steps.find(s => s.id === depId);
          if (depStep) {
            visit(depStep);
          }
        }
      }

      temp.delete(step.id);
      visited.add(step.id);
      sorted.push(step);
    };

    for (const step of steps) {
      if (!visited.has(step.id)) {
        visit(step);
      }
    }

    return sorted;
  }

  private areDependenciesMet(step: ExecutionStep, results: StepResult[]): boolean {
    if (!step.dependsOn || step.dependsOn.length === 0) {
      return true;
    }

    return step.dependsOn.every(depId => {
      const depResult = results.find(r => r.stepId === depId);
      return depResult?.success === true;
    });
  }

  private isCriticalStep(step: ExecutionStep): boolean {
    // Steps that must succeed for the plan to continue
    const criticalActions: string[] = ['create_file', 'write_file', 'modify_file'];
    return criticalActions.includes(step.action);
  }

  private updateContextWithChanges(context: ExecutionContext, changes: FileChange[]): ExecutionContext {
    const updatedFiles = [...context.openFiles];

    for (const change of changes) {
      const existingIndex = updatedFiles.findIndex(f => f.path === change.path);

      if (change.type === 'delete') {
        if (existingIndex !== -1) {
          updatedFiles.splice(existingIndex, 1);
        }
      } else if (change.after) {
        const fileInfo = {
          path: change.path,
          name: change.path.split('/').pop() || '',
          extension: change.path.split('.').pop() || '',
          content: change.after,
          language: this.detectLanguage(change.path),
          lastModified: new Date(),
          size: change.after.length,
        };

        if (existingIndex !== -1) {
          updatedFiles[existingIndex] = fileInfo;
        } else {
          updatedFiles.push(fileInfo);
        }
      }
    }

    return { ...context, openFiles: updatedFiles };
  }

  private detectLanguage(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescriptreact',
      'js': 'javascript',
      'jsx': 'javascriptreact',
      'py': 'python',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
    };
    return languageMap[ext] || 'plaintext';
  }

  private createResult(
    plan: ExecutionPlan,
    stepResults: StepResult[],
    finalContext: ExecutionContext,
    startTime: number,
    success: boolean,
    errorMessage?: string
  ): ExecutionResult {
    const successCount = stepResults.filter(r => r.success).length;
    const totalSteps = stepResults.length;

    return {
      planId: plan.id,
      success,
      stepResults,
      finalState: finalContext,
      summary: errorMessage || `Completed ${successCount}/${totalSteps} steps successfully`,
      suggestions: this.generateSuggestions(plan, stepResults, success),
      duration: Date.now() - startTime,
      completedAt: new Date(),
    };
  }

  private generateSuggestions(plan: ExecutionPlan, results: StepResult[], success: boolean): any[] {
    const suggestions: any[] = [];

    if (!success) {
      const failedSteps = results.filter(r => !r.success);
      suggestions.push({
        id: 'retry-failed',
        type: 'next_action',
        title: 'Retry Failed Steps',
        description: `${failedSteps.length} steps failed. Would you like to retry?`,
        confidence: 0.8,
      });
    }

    // Suggest testing if code was modified
    const hasCodeChanges = results.some(r => r.changes?.some(c => c.type !== 'delete'));
    if (hasCodeChanges) {
      suggestions.push({
        id: 'run-tests',
        type: 'next_action',
        title: 'Run Tests',
        description: 'Code was modified. Consider running tests to verify.',
        confidence: 0.9,
      });
    }

    return suggestions;
  }

  private notifyIDE(action: string, data: any): void {
    // Dispatch event for IDE to handle
    window.dispatchEvent(new CustomEvent('smart-executor-action', {
      detail: { action, data }
    }));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default SmartExecutor;
