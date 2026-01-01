// ============== IDE SERVICE API ==============
// Comprehensive IDE service connecting to backend endpoints

import client from './client';

// ============== TYPES ==============

export interface ExecuteTaskRequest {
  task: string;
  context?: {
    files?: { path: string; content: string }[];
    activeFile?: string;
    projectId?: string;
  };
  options?: {
    autonomous?: boolean;
    maxSteps?: number;
    timeout?: number;
  };
}

export interface ExecuteTaskResponse {
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  steps?: ExecutionStep[];
}

export interface ExecutionStep {
  id: string;
  action: string;
  target?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

export interface PlanRequest {
  task: string;
  context?: any;
}

export interface PlanResponse {
  planId: string;
  steps: PlanStep[];
  estimatedTime?: number;
}

export interface PlanStep {
  id: string;
  description: string;
  action: string;
  dependencies?: string[];
}

export interface CodeCompleteRequest {
  code: string;
  language: string;
  cursorPosition: { line: number; column: number };
  context?: string;
}

export interface CodeCompleteResponse {
  suggestions: CodeSuggestion[];
}

export interface CodeSuggestion {
  text: string;
  displayText: string;
  type: 'function' | 'variable' | 'class' | 'keyword' | 'snippet';
  documentation?: string;
}

export interface CodeGenerateRequest {
  prompt: string;
  language: string;
  context?: string;
  maxTokens?: number;
}

export interface CodeGenerateResponse {
  code: string;
  explanation?: string;
}

export interface CodeRefactorRequest {
  code: string;
  language: string;
  refactorType: 'extract_function' | 'rename' | 'inline' | 'simplify' | 'optimize';
  options?: Record<string, any>;
}

export interface CodeRefactorResponse {
  refactoredCode: string;
  changes: CodeChange[];
}

export interface CodeChange {
  type: 'insert' | 'delete' | 'replace';
  start: { line: number; column: number };
  end: { line: number; column: number };
  newText?: string;
}

export interface TerminalExecuteRequest {
  command: string;
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

export interface TerminalExecuteResponse {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

export interface DebugSession {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'stopped';
  file?: string;
  line?: number;
}

export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  condition?: string;
  enabled: boolean;
}

// ============== IDE CORE API ==============

export const ideApi = {
  // Execute a task
  async executeTask(request: ExecuteTaskRequest): Promise<ExecuteTaskResponse> {
    const response = await client.post('/ide/execute', request);
    return response.data;
  },

  // Generate execution plan
  async generatePlan(request: PlanRequest): Promise<PlanResponse> {
    const response = await client.post('/ide/plan', request);
    return response.data;
  },

  // Start autonomous execution
  async startAutonomous(request: ExecuteTaskRequest): Promise<ExecuteTaskResponse> {
    const response = await client.post('/ide/autonomous', {
      ...request,
      options: { ...request.options, autonomous: true },
    });
    return response.data;
  },

  // Get task status
  async getTaskStatus(taskId: string): Promise<ExecuteTaskResponse> {
    const response = await client.get(`/ide/status/${taskId}`);
    return response.data;
  },

  // Cancel task
  async cancelTask(taskId: string): Promise<void> {
    await client.post(`/ide/cancel/${taskId}`);
  },
};

// ============== CODE API ==============

export const codeApi = {
  // Code completion
  async complete(request: CodeCompleteRequest): Promise<CodeCompleteResponse> {
    const response = await client.post('/code/complete', request);
    return response.data;
  },

  // Generate code
  async generate(request: CodeGenerateRequest): Promise<CodeGenerateResponse> {
    const response = await client.post('/code/generate', request);
    return response.data;
  },

  // Refactor code
  async refactor(request: CodeRefactorRequest): Promise<CodeRefactorResponse> {
    const response = await client.post('/code/refactor', request);
    return response.data;
  },

  // Execute code
  async execute(code: string, language: string): Promise<{ output: string; error?: string }> {
    const response = await client.post('/code/execute', { code, language });
    return response.data;
  },

  // Search codebase
  async search(query: string, options?: { path?: string; fileTypes?: string[] }): Promise<{
    results: { file: string; line: number; content: string; score: number }[];
  }> {
    const response = await client.post('/code/search', { query, ...options });
    return response.data;
  },

  // Index files
  async indexFiles(files: { path: string; content: string }[]): Promise<{ indexed: number }> {
    const response = await client.post('/code/index', { files });
    return response.data;
  },

  // Parse file
  async parseFile(path: string, content: string): Promise<{
    ast: any;
    symbols: { name: string; type: string; line: number }[];
  }> {
    const response = await client.get('/code/parse', { params: { path, content } });
    return response.data;
  },

  // Get definition
  async getDefinition(file: string, line: number, column: number): Promise<{
    file: string;
    line: number;
    column: number;
  } | null> {
    const response = await client.get('/code/definition', { params: { file, line, column } });
    return response.data;
  },

  // Get hover info
  async getHoverInfo(file: string, line: number, column: number): Promise<{
    content: string;
    documentation?: string;
  } | null> {
    const response = await client.get('/code/hover', { params: { file, line, column } });
    return response.data;
  },
};

// ============== TERMINAL API ==============

export const terminalApi = {
  // Execute command
  async execute(request: TerminalExecuteRequest): Promise<TerminalExecuteResponse> {
    const response = await client.post('/terminal/execute', request);
    return response.data;
  },

  // Create terminal session
  async createSession(cwd?: string): Promise<{ sessionId: string }> {
    const response = await client.post('/terminal/session/create', { cwd });
    return response.data;
  },

  // List sessions
  async listSessions(): Promise<{ sessions: { id: string; cwd: string; active: boolean }[] }> {
    const response = await client.get('/terminal/sessions');
    return response.data;
  },

  // Close session
  async closeSession(sessionId: string): Promise<void> {
    await client.delete(`/terminal/session/${sessionId}`);
  },
};

// ============== DEBUGGER API ==============

export const debuggerApi = {
  // Start debug session
  async start(file: string, args?: string[]): Promise<DebugSession> {
    const response = await client.post('/debug/start', { file, args });
    return response.data;
  },

  // Stop debug session
  async stop(sessionId: string): Promise<void> {
    await client.post(`/debug/stop/${sessionId}`);
  },

  // Pause execution
  async pause(sessionId: string): Promise<void> {
    await client.post(`/debug/${sessionId}/pause`);
  },

  // Continue execution
  async continue(sessionId: string): Promise<void> {
    await client.post(`/debug/${sessionId}/continue`);
  },

  // Step over
  async stepOver(sessionId: string): Promise<void> {
    await client.post(`/debug/${sessionId}/step-over`);
  },

  // Step into
  async stepInto(sessionId: string): Promise<void> {
    await client.post(`/debug/${sessionId}/step-into`);
  },

  // Step out
  async stepOut(sessionId: string): Promise<void> {
    await client.post(`/debug/${sessionId}/step-out`);
  },

  // Add breakpoint
  async addBreakpoint(sessionId: string, breakpoint: Omit<Breakpoint, 'id'>): Promise<Breakpoint> {
    const response = await client.post(`/debug/${sessionId}/breakpoint`, breakpoint);
    return response.data;
  },

  // Remove breakpoint
  async removeBreakpoint(sessionId: string, breakpointId: string): Promise<void> {
    await client.delete(`/debug/${sessionId}/breakpoint/${breakpointId}`);
  },

  // Get variables
  async getVariables(sessionId: string, scope?: string): Promise<{
    variables: { name: string; value: any; type: string }[];
  }> {
    const response = await client.get(`/debug/${sessionId}/variables`, { params: { scope } });
    return response.data;
  },

  // Get call stack
  async getCallStack(sessionId: string): Promise<{
    frames: { id: string; name: string; file: string; line: number }[];
  }> {
    const response = await client.get(`/debug/${sessionId}/callstack`);
    return response.data;
  },

  // Evaluate expression
  async evaluate(sessionId: string, expression: string): Promise<{ result: any; error?: string }> {
    const response = await client.post(`/debug/${sessionId}/evaluate`, { expression });
    return response.data;
  },

  // List debug sessions
  async listSessions(): Promise<{ sessions: DebugSession[] }> {
    const response = await client.get('/debug/sessions');
    return response.data;
  },
};

// ============== GIT API ==============

export const gitApi = {
  // Get status
  async getStatus(path?: string): Promise<{
    branch: string;
    ahead: number;
    behind: number;
    staged: string[];
    modified: string[];
    untracked: string[];
  }> {
    const response = await client.get('/git/status', { params: { path } });
    return response.data;
  },

  // Stage files
  async stage(files: string[]): Promise<void> {
    await client.post('/git/stage', { files });
  },

  // Unstage files
  async unstage(files: string[]): Promise<void> {
    await client.post('/git/unstage', { files });
  },

  // Commit
  async commit(message: string): Promise<{ commitHash: string }> {
    const response = await client.post('/git/commit', { message });
    return response.data;
  },

  // Push
  async push(remote?: string, branch?: string): Promise<void> {
    await client.post('/git/push', { remote, branch });
  },

  // Pull
  async pull(remote?: string, branch?: string): Promise<{ updated: boolean; conflicts?: string[] }> {
    const response = await client.post('/git/pull', { remote, branch });
    return response.data;
  },

  // Get diff
  async getDiff(file?: string): Promise<{ diff: string }> {
    const response = await client.get('/git/diff', { params: { file } });
    return response.data;
  },

  // Get log
  async getLog(limit?: number): Promise<{
    commits: { hash: string; message: string; author: string; date: string }[];
  }> {
    const response = await client.get('/git/log', { params: { limit } });
    return response.data;
  },

  // Get branches
  async getBranches(): Promise<{ current: string; branches: string[] }> {
    const response = await client.get('/git/branches');
    return response.data;
  },

  // Checkout branch
  async checkout(branch: string, create?: boolean): Promise<void> {
    await client.post('/git/checkout', { branch, create });
  },
};

// ============== EXPORT ALL ==============

export default {
  ide: ideApi,
  code: codeApi,
  terminal: terminalApi,
  debugger: debuggerApi,
  git: gitApi,
};
