// ============== CODE EXECUTION SERVICE ==============
// Advanced code execution with streaming, sandboxing, and multi-language support

import { ideWebSocket } from '../utils/websocketManager';

// ============== TYPES ==============
export interface ExecutionRequest {
  code: string;
  language: string;
  timeout?: number;
  stdin?: string;
  env?: Record<string, string>;
  args?: string[];
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string | null;
  exitCode: number;
  executionTime: number;
  memoryUsed?: number;
}

export interface StreamingExecutionCallbacks {
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
  onComplete?: (result: ExecutionResult) => void;
  onError?: (error: Error) => void;
}

type ExecutionStatus = 'idle' | 'running' | 'completed' | 'error' | 'timeout';

// ============== LANGUAGE CONFIGS ==============
export const SUPPORTED_LANGUAGES = {
  python: { name: 'Python', extension: '.py', runtime: 'python3' },
  javascript: { name: 'JavaScript', extension: '.js', runtime: 'node' },
  typescript: { name: 'TypeScript', extension: '.ts', runtime: 'ts-node' },
  bash: { name: 'Bash', extension: '.sh', runtime: 'bash' },
  ruby: { name: 'Ruby', extension: '.rb', runtime: 'ruby' },
  go: { name: 'Go', extension: '.go', runtime: 'go run' },
  rust: { name: 'Rust', extension: '.rs', runtime: 'rustc' },
  java: { name: 'Java', extension: '.java', runtime: 'java' },
  cpp: { name: 'C++', extension: '.cpp', runtime: 'g++' },
  c: { name: 'C', extension: '.c', runtime: 'gcc' },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// ============== EXECUTION MANAGER ==============
class CodeExecutionService {
  private activeExecutions = new Map<string, AbortController>();
  private executionHistory: Array<{ id: string; request: ExecutionRequest; result: ExecutionResult; timestamp: number }> = [];
  private maxHistorySize = 100;

  // Execute code via REST API
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const { code, language, timeout = 30000, stdin, env, args } = request;
    const executionId = this.generateId();
    const controller = new AbortController();
    
    this.activeExecutions.set(executionId, controller);

    try {
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';

      const response = await fetch(`${ideUrl}/api/code/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, stdin, env, args }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Execution failed: ${response.status}`);
      }

      const data = await response.json();
      const result: ExecutionResult = {
        success: data.success,
        output: data.output || '',
        error: data.error,
        exitCode: data.exit_code ?? (data.success ? 0 : 1),
        executionTime: data.execution_time || 0,
        memoryUsed: data.memory_used,
      };

      this.addToHistory(executionId, request, result);
      return result;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          output: '',
          error: 'Execution timed out',
          exitCode: 124,
          executionTime: timeout / 1000,
        };
      }
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  // Execute with streaming output via WebSocket
  async executeStreaming(
    request: ExecutionRequest,
    callbacks: StreamingExecutionCallbacks
  ): Promise<string> {
    const executionId = this.generateId();
    const { onStdout, onStderr, onComplete, onError } = callbacks;

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';
      const startTime = Date.now();

      // Set up message handlers
      const unsubStdout = ideWebSocket.on(`execution:${executionId}:stdout`, (data) => {
        const text = (data as { text: string }).text;
        output += text;
        onStdout?.(text);
      });

      const unsubStderr = ideWebSocket.on(`execution:${executionId}:stderr`, (data) => {
        const text = (data as { text: string }).text;
        errorOutput += text;
        onStderr?.(text);
      });

      const unsubComplete = ideWebSocket.on(`execution:${executionId}:complete`, (data) => {
        cleanup();
        const resultData = data as { exitCode: number; memoryUsed?: number };
        const result: ExecutionResult = {
          success: resultData.exitCode === 0,
          output,
          error: errorOutput || null,
          exitCode: resultData.exitCode,
          executionTime: (Date.now() - startTime) / 1000,
          memoryUsed: resultData.memoryUsed,
        };
        this.addToHistory(executionId, request, result);
        onComplete?.(result);
        resolve(executionId);
      });

      const unsubError = ideWebSocket.on(`execution:${executionId}:error`, (data) => {
        cleanup();
        const error = new Error((data as { message: string }).message);
        onError?.(error);
        reject(error);
      });

      const cleanup = () => {
        unsubStdout();
        unsubStderr();
        unsubComplete();
        unsubError();
      };

      // Send execution request
      ideWebSocket.send('execution:start', {
        executionId,
        ...request,
      }).catch(error => {
        cleanup();
        onError?.(error);
        reject(error);
      });
    });
  }

  // Cancel running execution
  cancel(executionId: string): boolean {
    const controller = this.activeExecutions.get(executionId);
    if (controller) {
      controller.abort();
      this.activeExecutions.delete(executionId);
      return true;
    }
    return false;
  }

  // Cancel all running executions
  cancelAll(): void {
    for (const [id, controller] of this.activeExecutions) {
      controller.abort();
      this.activeExecutions.delete(id);
    }
  }

  // Get execution history
  getHistory(): typeof this.executionHistory {
    return [...this.executionHistory];
  }

  // Clear history
  clearHistory(): void {
    this.executionHistory = [];
  }

  // Get active execution count
  get activeCount(): number {
    return this.activeExecutions.size;
  }

  private addToHistory(id: string, request: ExecutionRequest, result: ExecutionResult): void {
    this.executionHistory.unshift({ id, request, result, timestamp: Date.now() });
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.pop();
    }
  }

  private generateId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON ==============
export const codeExecutionService = new CodeExecutionService();

// ============== REACT HOOK ==============
import { useState, useCallback, useRef } from 'react';

interface UseCodeExecutionOptions {
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
  streaming?: boolean;
}

interface UseCodeExecutionReturn {
  execute: (code: string, language: string) => Promise<ExecutionResult>;
  cancel: () => void;
  output: string;
  error: string | null;
  status: ExecutionStatus;
  executionTime: number;
  isRunning: boolean;
  clear: () => void;
}

export function useCodeExecution(options: UseCodeExecutionOptions = {}): UseCodeExecutionReturn {
  const { onStdout, onStderr, streaming = false } = options;
  
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [executionTime, setExecutionTime] = useState(0);
  const executionIdRef = useRef<string | null>(null);

  const execute = useCallback(async (code: string, language: string): Promise<ExecutionResult> => {
    setStatus('running');
    setOutput('');
    setError(null);
    setExecutionTime(0);

    const request: ExecutionRequest = { code, language };

    try {
      if (streaming) {
        let fullOutput = '';
        let fullError = '';

        await codeExecutionService.executeStreaming(request, {
          onStdout: (data) => {
            fullOutput += data;
            setOutput(fullOutput);
            onStdout?.(data);
          },
          onStderr: (data) => {
            fullError += data;
            setError(fullError);
            onStderr?.(data);
          },
          onComplete: (result) => {
            setStatus(result.success ? 'completed' : 'error');
            setExecutionTime(result.executionTime);
          },
          onError: (err) => {
            setStatus('error');
            setError(err.message);
          },
        });

        return {
          success: !fullError,
          output: fullOutput,
          error: fullError || null,
          exitCode: fullError ? 1 : 0,
          executionTime: 0,
        };
      } else {
        const result = await codeExecutionService.execute(request);
        setOutput(result.output);
        setError(result.error);
        setStatus(result.success ? 'completed' : 'error');
        setExecutionTime(result.executionTime);
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Execution failed';
      setStatus('error');
      setError(errorMessage);
      return {
        success: false,
        output: '',
        error: errorMessage,
        exitCode: 1,
        executionTime: 0,
      };
    }
  }, [streaming, onStdout, onStderr]);

  const cancel = useCallback(() => {
    if (executionIdRef.current) {
      codeExecutionService.cancel(executionIdRef.current);
      setStatus('idle');
    }
  }, []);

  const clear = useCallback(() => {
    setOutput('');
    setError(null);
    setStatus('idle');
    setExecutionTime(0);
  }, []);

  return {
    execute,
    cancel,
    output,
    error,
    status,
    executionTime,
    isRunning: status === 'running',
    clear,
  };
}

// ============== CODE FORMATTER ==============
export async function formatCode(code: string, language: string, style?: string): Promise<string> {
  const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
  const response = await fetch(`${ideUrl}/api/code/format`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, style }),
  });

  if (!response.ok) {
    throw new Error('Format failed');
  }

  const data = await response.json();
  return data.formatted || code;
}

// ============== CODE ANALYZER ==============
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
    functions: number;
    complexity: number;
    maintainability: number;
  };
  suggestions: string[];
}

export async function analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
  const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
  const response = await fetch(`${ideUrl}/api/code/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  return response.json();
}

export default codeExecutionService;
