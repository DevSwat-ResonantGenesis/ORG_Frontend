/**
 * DSID-P Autonomous Executor
 * 
 * Full autonomous agent capabilities:
 * - Tool execution
 * - Auto-debugging
 * - Error recovery
 * - Self-repair
 * - Retry with backoff
 */

// ============== TYPES ==============

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
  execute: (params: Record<string, unknown>) => Promise<ToolResult>;
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  default?: unknown;
}

export interface ToolResult {
  success: boolean;
  output: unknown;
  error?: string;
  logs?: string[];
  duration_ms: number;
}

export interface ExecutionStep {
  id: string;
  tool: string;
  params: Record<string, unknown>;
  result?: ToolResult;
  status: 'pending' | 'running' | 'success' | 'failed' | 'retrying';
  retries: number;
  startTime?: number;
  endTime?: number;
}

export interface ExecutionPlan {
  id: string;
  goal: string;
  steps: ExecutionStep[];
  status: 'planning' | 'executing' | 'debugging' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
}

export interface DebugContext {
  error: string;
  step: ExecutionStep;
  previousSteps: ExecutionStep[];
  availableTools: string[];
}

export interface AutonomousConfig {
  maxRetries: number;
  retryBackoffMs: number;
  maxExecutionTimeMs: number;
  enableAutoDebug: boolean;
  enableSelfRepair: boolean;
  onStepStart?: (step: ExecutionStep) => void;
  onStepComplete?: (step: ExecutionStep) => void;
  onError?: (error: string, step: ExecutionStep) => void;
  onDebug?: (context: DebugContext) => void;
  logger?: Logger;
}

export interface Logger {
  debug: (msg: string, data?: unknown) => void;
  info: (msg: string, data?: unknown) => void;
  warn: (msg: string, data?: unknown) => void;
  error: (msg: string, data?: unknown) => void;
}

// ============== DEFAULT CONFIG ==============

const DEFAULT_CONFIG: AutonomousConfig = {
  maxRetries: 3,
  retryBackoffMs: 1000,
  maxExecutionTimeMs: 300000, // 5 minutes
  enableAutoDebug: true,
  enableSelfRepair: true,
  logger: {
    debug: console.log,
    info: console.log,
    warn: console.warn,
    error: console.error,
  },
};

// ============== BUILT-IN TOOLS ==============

export const builtInTools: Tool[] = [
  {
    name: 'read_file',
    description: 'Read contents of a file',
    parameters: {
      path: { type: 'string', description: 'File path to read', required: true },
      encoding: { type: 'string', description: 'File encoding', default: 'utf-8' },
    },
    execute: async (params) => {
      const start = Date.now();
      try {
        // This would be implemented by the host IDE
        return {
          success: true,
          output: `[File content placeholder for ${params.path}]`,
          duration_ms: Date.now() - start,
        };
      } catch (error) {
        return {
          success: false,
          output: null,
          error: error instanceof Error ? error.message : String(error),
          duration_ms: Date.now() - start,
        };
      }
    },
  },
  {
    name: 'write_file',
    description: 'Write contents to a file',
    parameters: {
      path: { type: 'string', description: 'File path to write', required: true },
      content: { type: 'string', description: 'Content to write', required: true },
    },
    execute: async (params) => {
      const start = Date.now();
      try {
        return {
          success: true,
          output: { written: true, path: params.path },
          duration_ms: Date.now() - start,
        };
      } catch (error) {
        return {
          success: false,
          output: null,
          error: error instanceof Error ? error.message : String(error),
          duration_ms: Date.now() - start,
        };
      }
    },
  },
  {
    name: 'run_command',
    description: 'Execute a terminal command',
    parameters: {
      command: { type: 'string', description: 'Command to run', required: true },
      cwd: { type: 'string', description: 'Working directory' },
      timeout: { type: 'number', description: 'Timeout in ms', default: 30000 },
    },
    execute: async (params) => {
      const start = Date.now();
      try {
        return {
          success: true,
          output: { exitCode: 0, stdout: '', stderr: '' },
          duration_ms: Date.now() - start,
        };
      } catch (error) {
        return {
          success: false,
          output: null,
          error: error instanceof Error ? error.message : String(error),
          duration_ms: Date.now() - start,
        };
      }
    },
  },
  {
    name: 'search_code',
    description: 'Search for code patterns',
    parameters: {
      query: { type: 'string', description: 'Search pattern (regex)', required: true },
      path: { type: 'string', description: 'Search path', default: '.' },
      maxResults: { type: 'number', description: 'Max results', default: 50 },
    },
    execute: async (params) => {
      const start = Date.now();
      try {
        return {
          success: true,
          output: [],
          duration_ms: Date.now() - start,
        };
      } catch (error) {
        return {
          success: false,
          output: null,
          error: error instanceof Error ? error.message : String(error),
          duration_ms: Date.now() - start,
        };
      }
    },
  },
  {
    name: 'debug_error',
    description: 'Analyze and debug an error',
    parameters: {
      error: { type: 'string', description: 'Error message', required: true },
      context: { type: 'object', description: 'Error context' },
      stackTrace: { type: 'string', description: 'Stack trace' },
    },
    execute: async (params) => {
      const start = Date.now();
      try {
        // Auto-debug logic
        const suggestions = analyzeError(params.error as string, params.context);
        return {
          success: true,
          output: suggestions,
          duration_ms: Date.now() - start,
        };
      } catch (error) {
        return {
          success: false,
          output: null,
          error: error instanceof Error ? error.message : String(error),
          duration_ms: Date.now() - start,
        };
      }
    },
  },
];

// ============== ERROR ANALYZER ==============

function analyzeError(error: string, context?: unknown): {
  cause: string;
  suggestions: string[];
  autoFix?: { tool: string; params: Record<string, unknown> };
} {
  const lowerError = error.toLowerCase();

  // File not found
  if (lowerError.includes('enoent') || lowerError.includes('not found')) {
    return {
      cause: 'File or directory not found',
      suggestions: [
        'Check if the path exists',
        'Verify spelling of filename',
        'Create the file if needed',
      ],
      autoFix: {
        tool: 'run_command',
        params: { command: 'ls -la' },
      },
    };
  }

  // Permission denied
  if (lowerError.includes('permission') || lowerError.includes('eacces')) {
    return {
      cause: 'Permission denied',
      suggestions: [
        'Check file permissions',
        'Run with elevated privileges if needed',
        'Verify ownership',
      ],
    };
  }

  // Syntax error
  if (lowerError.includes('syntax') || lowerError.includes('unexpected token')) {
    return {
      cause: 'Syntax error in code',
      suggestions: [
        'Check for missing brackets or semicolons',
        'Verify proper closing of strings',
        'Look for typos in keywords',
      ],
      autoFix: {
        tool: 'search_code',
        params: { query: 'syntax|error', path: '.' },
      },
    };
  }

  // Type error
  if (lowerError.includes('type') && lowerError.includes('error')) {
    return {
      cause: 'Type mismatch',
      suggestions: [
        'Check variable types',
        'Verify function parameters',
        'Add type annotations',
      ],
    };
  }

  // Module not found
  if (lowerError.includes('module') && lowerError.includes('not found')) {
    return {
      cause: 'Missing dependency',
      suggestions: [
        'Run npm install',
        'Check package.json',
        'Verify import path',
      ],
      autoFix: {
        tool: 'run_command',
        params: { command: 'npm install' },
      },
    };
  }

  // Network error
  if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('econnrefused')) {
    return {
      cause: 'Network connection issue',
      suggestions: [
        'Check if service is running',
        'Verify URL and port',
        'Check network connectivity',
      ],
    };
  }

  // Default
  return {
    cause: 'Unknown error',
    suggestions: [
      'Review the error message',
      'Check logs for more context',
      'Search for similar issues online',
    ],
  };
}

// ============== AUTONOMOUS EXECUTOR ==============

export class AutonomousExecutor {
  private tools: Map<string, Tool> = new Map();
  private config: AutonomousConfig;
  private currentPlan: ExecutionPlan | null = null;
  private isRunning: boolean = false;

  constructor(config: Partial<AutonomousConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Register built-in tools
    builtInTools.forEach(tool => this.registerTool(tool));
  }

  // ============== TOOL MANAGEMENT ==============

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
    this.config.logger?.info(`[DSIDP] Registered tool: ${tool.name}`);
  }

  unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  listTools(): string[] {
    return Array.from(this.tools.keys());
  }

  // ============== EXECUTION ==============

  async executeStep(step: ExecutionStep): Promise<ToolResult> {
    const tool = this.tools.get(step.tool);
    
    if (!tool) {
      return {
        success: false,
        output: null,
        error: `Tool not found: ${step.tool}`,
        duration_ms: 0,
      };
    }

    step.status = 'running';
    step.startTime = Date.now();
    this.config.onStepStart?.(step);

    try {
      const result = await tool.execute(step.params);
      
      step.result = result;
      step.status = result.success ? 'success' : 'failed';
      step.endTime = Date.now();
      
      this.config.onStepComplete?.(step);
      
      return result;
    } catch (error) {
      const result: ToolResult = {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : String(error),
        duration_ms: Date.now() - step.startTime,
      };
      
      step.result = result;
      step.status = 'failed';
      step.endTime = Date.now();
      
      this.config.onError?.(result.error!, step);
      
      return result;
    }
  }

  async executeWithRetry(step: ExecutionStep): Promise<ToolResult> {
    let lastResult: ToolResult | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      if (attempt > 0) {
        step.status = 'retrying';
        step.retries = attempt;
        
        // Exponential backoff
        const delay = this.config.retryBackoffMs * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        
        this.config.logger?.info(`[DSIDP] Retry ${attempt}/${this.config.maxRetries} for ${step.tool}`);
      }

      lastResult = await this.executeStep(step);

      if (lastResult.success) {
        return lastResult;
      }

      // Auto-debug if enabled
      if (this.config.enableAutoDebug && lastResult.error) {
        const debugResult = await this.autoDebug(lastResult.error, step);
        
        if (debugResult.autoFix && this.config.enableSelfRepair) {
          this.config.logger?.info(`[DSIDP] Attempting auto-fix: ${debugResult.autoFix.tool}`);
          
          // Execute the auto-fix
          const fixStep: ExecutionStep = {
            id: `${step.id}-fix-${attempt}`,
            tool: debugResult.autoFix.tool,
            params: debugResult.autoFix.params,
            status: 'pending',
            retries: 0,
          };
          
          await this.executeStep(fixStep);
        }
      }
    }

    return lastResult!;
  }

  // ============== PLAN EXECUTION ==============

  async executePlan(plan: ExecutionPlan): Promise<ExecutionPlan> {
    this.currentPlan = plan;
    this.isRunning = true;
    plan.status = 'executing';

    const startTime = Date.now();

    try {
      for (const step of plan.steps) {
        // Check timeout
        if (Date.now() - startTime > this.config.maxExecutionTimeMs) {
          throw new Error('Execution timeout exceeded');
        }

        // Check if stopped
        if (!this.isRunning) {
          plan.status = 'failed';
          return plan;
        }

        const result = await this.executeWithRetry(step);

        if (!result.success) {
          plan.status = 'debugging';
          
          // Try to recover
          if (this.config.enableSelfRepair) {
            const recovered = await this.attemptRecovery(step, plan);
            if (!recovered) {
              plan.status = 'failed';
              return plan;
            }
          } else {
            plan.status = 'failed';
            return plan;
          }
        }
      }

      plan.status = 'completed';
      plan.completedAt = Date.now();
      
    } catch (error) {
      plan.status = 'failed';
      this.config.logger?.error(`[DSIDP] Plan failed: ${error}`);
    } finally {
      this.isRunning = false;
      this.currentPlan = null;
    }

    return plan;
  }

  // ============== AUTO-DEBUG ==============

  async autoDebug(error: string, step: ExecutionStep): Promise<{
    cause: string;
    suggestions: string[];
    autoFix?: { tool: string; params: Record<string, unknown> };
  }> {
    const context: DebugContext = {
      error,
      step,
      previousSteps: this.currentPlan?.steps.filter(s => s.endTime && s.endTime < (step.startTime || 0)) || [],
      availableTools: this.listTools(),
    };

    this.config.onDebug?.(context);

    // Analyze the error
    const analysis = analyzeError(error, context);
    
    this.config.logger?.info(`[DSIDP] Debug analysis:`, analysis);

    return analysis;
  }

  // ============== SELF-REPAIR ==============

  async attemptRecovery(failedStep: ExecutionStep, plan: ExecutionPlan): Promise<boolean> {
    this.config.logger?.info(`[DSIDP] Attempting recovery for step: ${failedStep.id}`);

    // Strategy 1: Check if it's a transient error
    if (failedStep.result?.error?.includes('timeout') || 
        failedStep.result?.error?.includes('ECONNRESET')) {
      // Just retry with longer timeout
      failedStep.params = { ...failedStep.params, timeout: 60000 };
      const result = await this.executeWithRetry(failedStep);
      return result.success;
    }

    // Strategy 2: Check dependencies
    if (failedStep.result?.error?.includes('not found')) {
      // Try to create/install missing dependency
      const installStep: ExecutionStep = {
        id: `${failedStep.id}-recovery-install`,
        tool: 'run_command',
        params: { command: 'npm install' },
        status: 'pending',
        retries: 0,
      };
      
      const installResult = await this.executeStep(installStep);
      if (installResult.success) {
        // Retry original step
        const result = await this.executeWithRetry(failedStep);
        return result.success;
      }
    }

    // Strategy 3: Skip and continue (if step is optional)
    if (failedStep.params.optional) {
      this.config.logger?.warn(`[DSIDP] Skipping optional step: ${failedStep.id}`);
      return true;
    }

    return false;
  }

  // ============== CONTROL ==============

  stop(): void {
    this.isRunning = false;
    this.config.logger?.info('[DSIDP] Execution stopped');
  }

  isExecuting(): boolean {
    return this.isRunning;
  }

  getCurrentPlan(): ExecutionPlan | null {
    return this.currentPlan;
  }

  // ============== UTILITIES ==============

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============== QUICK EXECUTE ==============

  async execute(toolName: string, params: Record<string, unknown>): Promise<ToolResult> {
    const step: ExecutionStep = {
      id: `quick-${Date.now()}`,
      tool: toolName,
      params,
      status: 'pending',
      retries: 0,
    };

    return this.executeWithRetry(step);
  }

  async executeSequence(steps: { tool: string; params: Record<string, unknown> }[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const { tool, params } of steps) {
      const result = await this.execute(tool, params);
      results.push(result);

      if (!result.success) {
        break; // Stop on first failure
      }
    }

    return results;
  }
}

// ============== FACTORY ==============

export function createAutonomousExecutor(config?: Partial<AutonomousConfig>): AutonomousExecutor {
  return new AutonomousExecutor(config);
}

// ============== DEFAULT INSTANCE ==============

let defaultExecutor: AutonomousExecutor | null = null;

export function getAutonomousExecutor(config?: Partial<AutonomousConfig>): AutonomousExecutor {
  if (!defaultExecutor) {
    defaultExecutor = createAutonomousExecutor(config);
  }
  return defaultExecutor;
}
