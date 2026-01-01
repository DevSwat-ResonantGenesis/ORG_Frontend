// ============== PLANNING ENGINE SERVICE ==============
// Creates multi-step execution plans for complex tasks

import {
  ExecutionPlan,
  ExecutionStep,
  ClassifiedIntent,
  ExecutionContext,
  UserIntent,
  StepAction,
  SuccessCriterion,
  VerificationResult,
  IPlanningEngine,
} from './types';

export class PlanningEngine implements IPlanningEngine {
  private apiEndpoint: string;
  private plans: Map<string, ExecutionPlan> = new Map();

  constructor(apiEndpoint: string = '/api/v1/ai/create-plan') {
    this.apiEndpoint = apiEndpoint;
  }

  async createPlan(intent: ClassifiedIntent, context: ExecutionContext): Promise<ExecutionPlan> {
    // First, try to create plan from templates for common intents
    const templatePlan = this.createFromTemplate(intent, context);
    if (templatePlan) {
      this.plans.set(templatePlan.id, templatePlan);
      return templatePlan;
    }

    // For complex intents, use LLM
    try {
      const llmPlan = await this.createWithLLM(intent, context);
      this.plans.set(llmPlan.id, llmPlan);
      return llmPlan;
    } catch (error) {
      console.error('LLM planning failed, using fallback:', error);
      const fallbackPlan = this.createFallbackPlan(intent, context);
      this.plans.set(fallbackPlan.id, fallbackPlan);
      return fallbackPlan;
    }
  }

  async validatePlan(plan: ExecutionPlan): Promise<VerificationResult> {
    const issues: { severity: 'error' | 'warning' | 'info'; message: string }[] = [];
    const suggestions: { id: string; type: 'optimization'; title: string; description: string; confidence: number }[] = [];

    // Check for empty steps
    if (plan.steps.length === 0) {
      issues.push({ severity: 'error', message: 'Plan has no steps' });
    }

    // Check for circular dependencies
    const hasCycles = this.detectCyclicDependencies(plan.steps);
    if (hasCycles) {
      issues.push({ severity: 'error', message: 'Plan has circular dependencies' });
    }

    // Check for missing dependencies
    for (const step of plan.steps) {
      if (step.dependsOn) {
        for (const depId of step.dependsOn) {
          const depStep = plan.steps.find(s => s.id === depId);
          if (!depStep) {
            issues.push({ 
              severity: 'error', 
              message: `Step ${step.id} depends on non-existent step ${depId}` 
            });
          }
        }
      }
    }

    // Check for verification steps
    const hasVerification = plan.steps.some(s => s.action === 'verify_change');
    if (!hasVerification) {
      suggestions.push({
        id: 'add-verification',
        type: 'optimization',
        title: 'Add Verification Step',
        description: 'Consider adding a verification step to ensure changes work correctly',
        confidence: 0.8,
      });
    }

    // Check for rollback capability
    const hasRollback = plan.steps.some(s => s.rollback !== null);
    if (!hasRollback) {
      issues.push({ 
        severity: 'warning', 
        message: 'Plan has no rollback capability' 
      });
    }

    return {
      success: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      suggestions,
    };
  }

  updatePlan(planId: string, updates: Partial<ExecutionPlan>): void {
    const plan = this.plans.get(planId);
    if (plan) {
      const updatedPlan = { ...plan, ...updates, updatedAt: new Date() };
      this.plans.set(planId, updatedPlan);
    }
  }

  getPlan(planId: string): ExecutionPlan | undefined {
    return this.plans.get(planId);
  }

  // ============== TEMPLATE-BASED PLANNING ==============

  private createFromTemplate(intent: ClassifiedIntent, context: ExecutionContext): ExecutionPlan | null {
    const planId = `plan-${Date.now()}`;
    const baseplan: Omit<ExecutionPlan, 'steps' | 'successCriteria'> = {
      id: planId,
      intent,
      currentStepIndex: 0,
      estimatedImpact: this.estimateImpact(intent),
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    switch (intent.type) {
      case UserIntent.CREATE_FILE:
        return this.planCreateFile(baseplan, intent, context);
      
      case UserIntent.MODIFY_FILE:
        return this.planModifyFile(baseplan, intent, context);
      
      case UserIntent.FIX_BUG:
        return this.planFixBug(baseplan, intent, context);
      
      case UserIntent.ADD_FEATURE:
        return this.planAddFeature(baseplan, intent, context);
      
      case UserIntent.REFACTOR_CODE:
        return this.planRefactor(baseplan, intent, context);
      
      case UserIntent.EXPLAIN_CODE:
        return this.planExplain(baseplan, intent, context);
      
      case UserIntent.RUN_COMMAND:
        return this.planRunCommand(baseplan, intent, context);
      
      default:
        return null; // Use LLM for complex intents
    }
  }

  private planCreateFile(
    base: Omit<ExecutionPlan, 'steps' | 'successCriteria'>,
    intent: ClassifiedIntent,
    context: ExecutionContext
  ): ExecutionPlan {
    const targetPath = intent.targets[0] || 'new-file.ts';
    
    return {
      ...base,
      steps: [
        {
          id: 'step-1',
          action: 'analyze_code',
          target: context.activeFile?.path || '',
          purpose: 'Understand project structure and patterns',
          verification: 'Project patterns identified',
          rollback: null,
          status: 'pending',
        },
        {
          id: 'step-2',
          action: 'create_file',
          target: targetPath,
          purpose: `Create new file: ${targetPath}`,
          verification: 'File created successfully',
          rollback: `Delete ${targetPath}`,
          status: 'pending',
          dependsOn: ['step-1'],
        },
        {
          id: 'step-3',
          action: 'write_file',
          target: targetPath,
          purpose: 'Write initial file content',
          verification: 'File has correct content',
          rollback: 'Restore original content',
          status: 'pending',
          dependsOn: ['step-2'],
        },
        {
          id: 'step-4',
          action: 'verify_change',
          target: targetPath,
          purpose: 'Verify file was created correctly',
          verification: 'File exists and has valid content',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-3'],
        },
      ],
      successCriteria: [
        { description: 'File created at correct location', met: false },
        { description: 'File follows project patterns', met: false },
        { description: 'No syntax errors', met: false },
      ],
    };
  }

  private planModifyFile(
    base: Omit<ExecutionPlan, 'steps' | 'successCriteria'>,
    intent: ClassifiedIntent,
    context: ExecutionContext
  ): ExecutionPlan {
    const targetPath = intent.targets[0] || context.activeFile?.path || '';
    
    return {
      ...base,
      steps: [
        {
          id: 'step-1',
          action: 'read_file',
          target: targetPath,
          purpose: 'Read current file content',
          verification: 'File content loaded',
          rollback: null,
          status: 'pending',
        },
        {
          id: 'step-2',
          action: 'analyze_code',
          target: targetPath,
          purpose: 'Understand current implementation',
          verification: 'Code structure understood',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-1'],
        },
        {
          id: 'step-3',
          action: 'modify_file',
          target: targetPath,
          purpose: `Apply changes: ${intent.description}`,
          verification: 'Changes applied',
          rollback: 'Restore original content',
          status: 'pending',
          dependsOn: ['step-2'],
        },
        {
          id: 'step-4',
          action: 'verify_change',
          target: targetPath,
          purpose: 'Verify changes are correct',
          verification: 'Changes verified',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-3'],
        },
      ],
      successCriteria: [
        { description: 'Requested changes applied', met: false },
        { description: 'No syntax errors introduced', met: false },
        { description: 'Existing functionality preserved', met: false },
      ],
    };
  }

  private planFixBug(
    base: Omit<ExecutionPlan, 'steps' | 'successCriteria'>,
    intent: ClassifiedIntent,
    context: ExecutionContext
  ): ExecutionPlan {
    const targetPath = intent.targets[0] || context.activeFile?.path || '';
    
    return {
      ...base,
      steps: [
        {
          id: 'step-1',
          action: 'read_file',
          target: targetPath,
          purpose: 'Read the problematic code',
          verification: 'File content loaded',
          rollback: null,
          status: 'pending',
        },
        {
          id: 'step-2',
          action: 'analyze_code',
          target: targetPath,
          purpose: 'Analyze code to understand the bug',
          verification: 'Bug root cause identified',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-1'],
        },
        {
          id: 'step-3',
          action: 'search_code',
          target: '',
          purpose: 'Search for related code that might be affected',
          verification: 'Related code found',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-2'],
        },
        {
          id: 'step-4',
          action: 'modify_file',
          target: targetPath,
          purpose: 'Apply bug fix',
          verification: 'Fix applied',
          rollback: 'Restore original code',
          status: 'pending',
          dependsOn: ['step-3'],
        },
        {
          id: 'step-5',
          action: 'verify_change',
          target: targetPath,
          purpose: 'Verify bug is fixed',
          verification: 'Bug no longer occurs',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-4'],
        },
      ],
      successCriteria: [
        { description: 'Bug root cause identified', met: false },
        { description: 'Fix addresses root cause', met: false },
        { description: 'No new bugs introduced', met: false },
        { description: 'Error no longer occurs', met: false },
      ],
    };
  }

  private planAddFeature(
    base: Omit<ExecutionPlan, 'steps' | 'successCriteria'>,
    intent: ClassifiedIntent,
    context: ExecutionContext
  ): ExecutionPlan {
    const targetPath = intent.targets[0] || context.activeFile?.path || '';
    
    return {
      ...base,
      steps: [
        {
          id: 'step-1',
          action: 'analyze_code',
          target: context.projectStructure.path,
          purpose: 'Understand project architecture',
          verification: 'Architecture understood',
          rollback: null,
          status: 'pending',
        },
        {
          id: 'step-2',
          action: 'read_file',
          target: targetPath,
          purpose: 'Read existing code to integrate with',
          verification: 'Existing code understood',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-1'],
        },
        {
          id: 'step-3',
          action: 'modify_file',
          target: targetPath,
          purpose: `Implement feature: ${intent.description}`,
          verification: 'Feature code added',
          rollback: 'Remove feature code',
          status: 'pending',
          dependsOn: ['step-2'],
        },
        {
          id: 'step-4',
          action: 'search_code',
          target: '',
          purpose: 'Find related files that need updates',
          verification: 'Related files identified',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-3'],
        },
        {
          id: 'step-5',
          action: 'verify_change',
          target: targetPath,
          purpose: 'Verify feature works correctly',
          verification: 'Feature functional',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-4'],
        },
      ],
      successCriteria: [
        { description: 'Feature implemented as requested', met: false },
        { description: 'Feature integrates with existing code', met: false },
        { description: 'No existing functionality broken', met: false },
        { description: 'Code follows project patterns', met: false },
      ],
    };
  }

  private planRefactor(
    base: Omit<ExecutionPlan, 'steps' | 'successCriteria'>,
    intent: ClassifiedIntent,
    context: ExecutionContext
  ): ExecutionPlan {
    const targetPath = intent.targets[0] || context.activeFile?.path || '';
    
    return {
      ...base,
      steps: [
        {
          id: 'step-1',
          action: 'read_file',
          target: targetPath,
          purpose: 'Read code to refactor',
          verification: 'Code loaded',
          rollback: null,
          status: 'pending',
        },
        {
          id: 'step-2',
          action: 'analyze_code',
          target: targetPath,
          purpose: 'Analyze current structure and find improvement opportunities',
          verification: 'Refactoring plan created',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-1'],
        },
        {
          id: 'step-3',
          action: 'search_code',
          target: '',
          purpose: 'Find all references to affected code',
          verification: 'All references found',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-2'],
        },
        {
          id: 'step-4',
          action: 'modify_file',
          target: targetPath,
          purpose: 'Apply refactoring',
          verification: 'Refactoring applied',
          rollback: 'Restore original code',
          status: 'pending',
          dependsOn: ['step-3'],
        },
        {
          id: 'step-5',
          action: 'verify_change',
          target: targetPath,
          purpose: 'Verify functionality preserved',
          verification: 'All tests pass',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-4'],
        },
      ],
      successCriteria: [
        { description: 'Code structure improved', met: false },
        { description: 'All references updated', met: false },
        { description: 'Existing functionality preserved', met: false },
        { description: 'No new bugs introduced', met: false },
      ],
    };
  }

  private planExplain(
    base: Omit<ExecutionPlan, 'steps' | 'successCriteria'>,
    intent: ClassifiedIntent,
    context: ExecutionContext
  ): ExecutionPlan {
    const targetPath = intent.targets[0] || context.activeFile?.path || '';
    
    return {
      ...base,
      steps: [
        {
          id: 'step-1',
          action: 'read_file',
          target: targetPath,
          purpose: 'Read code to explain',
          verification: 'Code loaded',
          rollback: null,
          status: 'pending',
        },
        {
          id: 'step-2',
          action: 'analyze_code',
          target: targetPath,
          purpose: 'Analyze code structure and logic',
          verification: 'Analysis complete',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-1'],
        },
      ],
      successCriteria: [
        { description: 'Explanation provided', met: false },
        { description: 'Explanation is clear and accurate', met: false },
      ],
    };
  }

  private planRunCommand(
    base: Omit<ExecutionPlan, 'steps' | 'successCriteria'>,
    intent: ClassifiedIntent,
    context: ExecutionContext
  ): ExecutionPlan {
    const command = intent.targets[0] || intent.description;
    
    return {
      ...base,
      steps: [
        {
          id: 'step-1',
          action: 'analyze_code',
          target: '',
          purpose: 'Verify command is safe to run',
          verification: 'Command verified safe',
          rollback: null,
          status: 'pending',
        },
        {
          id: 'step-2',
          action: 'ask_user',
          target: command,
          purpose: 'Confirm command execution',
          verification: 'User approved',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-1'],
        },
        {
          id: 'step-3',
          action: 'run_command',
          target: command,
          purpose: `Execute: ${command}`,
          verification: 'Command completed',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-2'],
        },
      ],
      successCriteria: [
        { description: 'Command executed successfully', met: false },
        { description: 'Expected output received', met: false },
      ],
    };
  }

  // ============== LLM-BASED PLANNING ==============

  private async createWithLLM(intent: ClassifiedIntent, context: ExecutionContext): Promise<ExecutionPlan> {
    const prompt = this.buildPlanningPrompt(intent, context);
    
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      },
      body: JSON.stringify({
        intent,
        context: this.serializeContext(context),
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Planning API error: ${response.status}`);
    }

    const result = await response.json();
    return this.parsePlanResult(result, intent);
  }

  private buildPlanningPrompt(intent: ClassifiedIntent, context: ExecutionContext): string {
    return `
Create a detailed execution plan for this task:

Intent: ${intent.type}
Description: ${intent.description}
Targets: ${intent.targets.join(', ') || 'None specified'}
Success Criteria: ${intent.successCriteria.join(', ') || 'Task completed'}

Context:
- Active File: ${context.activeFile?.path || 'None'}
- Project Type: ${context.codebaseAnalysis.techStack.framework}
- Language: ${context.codebaseAnalysis.techStack.language}

Requirements:
1. Break down into atomic, verifiable steps
2. Each step should have a clear purpose and verification
3. Include rollback strategy for risky steps
4. Consider dependencies between steps
5. Add verification steps after changes

Respond in JSON format:
{
  "steps": [
    {
      "id": "step_1",
      "action": "read_file|write_file|create_file|delete_file|modify_file|run_command|search_code|analyze_code|verify_change|ask_user|wait",
      "target": "path or target",
      "purpose": "Why this step",
      "verification": "How to verify success",
      "rollback": "How to undo or null",
      "dependsOn": ["step_ids"] or null
    }
  ],
  "successCriteria": ["criterion 1", "criterion 2"],
  "estimatedImpact": "low|medium|high"
}
`;
  }

  private serializeContext(context: ExecutionContext): Record<string, unknown> {
    return {
      activeFile: context.activeFile ? {
        path: context.activeFile.path,
        language: context.activeFile.language,
        content: context.activeFile.content.slice(0, 3000),
      } : null,
      openFiles: context.openFiles.map(f => f.path),
      techStack: context.codebaseAnalysis.techStack,
      recentChanges: context.recentChanges.slice(0, 5),
    };
  }

  private parsePlanResult(result: any, intent: ClassifiedIntent): ExecutionPlan {
    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    
    return {
      id: `plan-${Date.now()}`,
      intent,
      steps: (parsed.steps || []).map((s: any, i: number) => ({
        id: s.id || `step-${i + 1}`,
        action: this.validateAction(s.action),
        target: s.target || '',
        purpose: s.purpose || '',
        verification: s.verification || '',
        rollback: s.rollback || null,
        status: 'pending' as const,
        dependsOn: s.dependsOn || undefined,
      })),
      currentStepIndex: 0,
      successCriteria: (parsed.successCriteria || intent.successCriteria).map((c: string) => ({
        description: c,
        met: false,
      })),
      estimatedImpact: parsed.estimatedImpact || 'medium',
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private validateAction(action: string): StepAction {
    const validActions: StepAction[] = [
      'read_file', 'write_file', 'create_file', 'delete_file', 'modify_file',
      'run_command', 'search_code', 'analyze_code', 'verify_change', 'ask_user', 'wait'
    ];
    return validActions.includes(action as StepAction) ? action as StepAction : 'analyze_code';
  }

  // ============== FALLBACK PLANNING ==============

  private createFallbackPlan(intent: ClassifiedIntent, context: ExecutionContext): ExecutionPlan {
    return {
      id: `plan-${Date.now()}`,
      intent,
      steps: [
        {
          id: 'step-1',
          action: 'analyze_code',
          target: context.activeFile?.path || '',
          purpose: 'Analyze current state',
          verification: 'Analysis complete',
          rollback: null,
          status: 'pending',
        },
        {
          id: 'step-2',
          action: 'ask_user',
          target: '',
          purpose: 'Request clarification for complex task',
          verification: 'User provided clarification',
          rollback: null,
          status: 'pending',
          dependsOn: ['step-1'],
        },
      ],
      currentStepIndex: 0,
      successCriteria: intent.successCriteria.map(c => ({ description: c, met: false })),
      estimatedImpact: 'medium',
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // ============== UTILITY METHODS ==============

  private estimateImpact(intent: ClassifiedIntent): string {
    const highImpactIntents = [
      UserIntent.DELETE_FILE,
      UserIntent.ARCHITECTURE_CHANGE,
      UserIntent.DEPLOY,
      UserIntent.DEPENDENCY_UPDATE,
    ];
    
    const lowImpactIntents = [
      UserIntent.EXPLAIN_CODE,
      UserIntent.QUESTION,
      UserIntent.DOCUMENTATION,
      UserIntent.REVIEW_CODE,
    ];

    if (highImpactIntents.includes(intent.type)) return 'high';
    if (lowImpactIntents.includes(intent.type)) return 'low';
    return 'medium';
  }

  private detectCyclicDependencies(steps: ExecutionStep[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      visited.add(stepId);
      recursionStack.add(stepId);

      const step = steps.find(s => s.id === stepId);
      if (step?.dependsOn) {
        for (const depId of step.dependsOn) {
          if (!visited.has(depId) && hasCycle(depId)) {
            return true;
          }
          if (recursionStack.has(depId)) {
            return true;
          }
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    for (const step of steps) {
      if (!visited.has(step.id) && hasCycle(step.id)) {
        return true;
      }
    }

    return false;
  }
}

export default PlanningEngine;
