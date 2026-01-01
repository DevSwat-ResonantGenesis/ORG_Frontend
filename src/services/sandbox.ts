// ============== SANDBOX SERVICE ==============
// Secure code execution isolation and resource management

// ============== TYPES ==============
export interface SandboxConfig {
  enabled: boolean;
  containerImage: string;
  timeout: number;
  maxMemoryMB: number;
  maxCpuPercent: number;
  networkEnabled: boolean;
  allowedPaths: string[];
  blockedCommands: string[];
  env: Record<string, string>;
}

export interface SandboxSession {
  id: string;
  containerId?: string;
  status: 'creating' | 'ready' | 'running' | 'stopped' | 'error';
  config: SandboxConfig;
  createdAt: number;
  lastActivity: number;
  resourceUsage: ResourceUsage;
}

export interface ResourceUsage {
  memoryMB: number;
  cpuPercent: number;
  networkBytesIn: number;
  networkBytesOut: number;
  diskMB: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error: string | null;
  exitCode: number;
  executionTime: number;
  resourceUsage: ResourceUsage;
  truncated: boolean;
}

export interface SecurityPolicy {
  allowFileSystem: boolean;
  allowNetwork: boolean;
  allowSubprocess: boolean;
  allowEnvAccess: boolean;
  maxExecutionTime: number;
  maxOutputSize: number;
  blockedModules: string[];
  blockedSyscalls: string[];
}

// ============== DEFAULT CONFIGS ==============
const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  enabled: true,
  containerImage: 'resonant-sandbox:latest',
  timeout: 30000,
  maxMemoryMB: 512,
  maxCpuPercent: 50,
  networkEnabled: false,
  allowedPaths: ['/workspace', '/tmp'],
  blockedCommands: ['rm -rf /', 'dd if=/dev/zero', 'fork bomb', ':(){ :|:& };:'],
  env: {
    PYTHONDONTWRITEBYTECODE: '1',
    NODE_ENV: 'sandbox',
  },
};

const SECURITY_POLICIES: Record<string, SecurityPolicy> = {
  strict: {
    allowFileSystem: false,
    allowNetwork: false,
    allowSubprocess: false,
    allowEnvAccess: false,
    maxExecutionTime: 10000,
    maxOutputSize: 10000,
    blockedModules: ['os', 'subprocess', 'socket', 'requests', 'urllib'],
    blockedSyscalls: ['fork', 'exec', 'socket', 'connect'],
  },
  moderate: {
    allowFileSystem: true,
    allowNetwork: false,
    allowSubprocess: false,
    allowEnvAccess: false,
    maxExecutionTime: 30000,
    maxOutputSize: 100000,
    blockedModules: ['subprocess', 'socket'],
    blockedSyscalls: ['socket', 'connect'],
  },
  permissive: {
    allowFileSystem: true,
    allowNetwork: true,
    allowSubprocess: true,
    allowEnvAccess: true,
    maxExecutionTime: 120000,
    maxOutputSize: 1000000,
    blockedModules: [],
    blockedSyscalls: [],
  },
};

// ============== SANDBOX SERVICE ==============
class SandboxService {
  private sessions = new Map<string, SandboxSession>();
  private config: SandboxConfig;
  private securityPolicy: SecurityPolicy;
  private isAvailable = false;

  constructor() {
    this.config = { ...DEFAULT_SANDBOX_CONFIG };
    this.securityPolicy = SECURITY_POLICIES.moderate;
    this.checkAvailability();
  }

  // Check if sandbox is available (Docker running)
  async checkAvailability(): Promise<boolean> {
    try {
      const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
      const response = await fetch(`${ideUrl}/api/sandbox/status`);
      if (response.ok) {
        const data = await response.json();
        this.isAvailable = data.available;
        return this.isAvailable;
      }
    } catch {
      this.isAvailable = false;
    }
    return false;
  }

  // Create a new sandbox session
  async createSession(config?: Partial<SandboxConfig>): Promise<SandboxSession> {
    const sessionConfig = { ...this.config, ...config };
    const sessionId = this.generateId();

    const session: SandboxSession = {
      id: sessionId,
      status: 'creating',
      config: sessionConfig,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      resourceUsage: {
        memoryMB: 0,
        cpuPercent: 0,
        networkBytesIn: 0,
        networkBytesOut: 0,
        diskMB: 0,
      },
    };

    this.sessions.set(sessionId, session);

    if (this.isAvailable) {
      try {
        const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
        const response = await fetch(`${ideUrl}/api/sandbox/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            image: sessionConfig.containerImage,
            memoryLimit: `${sessionConfig.maxMemoryMB}m`,
            cpuLimit: sessionConfig.maxCpuPercent / 100,
            networkEnabled: sessionConfig.networkEnabled,
            env: sessionConfig.env,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          session.containerId = data.containerId;
          session.status = 'ready';
        } else {
          session.status = 'error';
        }
      } catch (error) {
        session.status = 'error';
        console.error('Failed to create sandbox container:', error);
      }
    } else {
      // Sandbox not available, mark as ready for fallback execution
      session.status = 'ready';
    }

    return session;
  }

  // Execute code in sandbox
  async execute(
    sessionId: string,
    code: string,
    language: string,
    options?: { stdin?: string; args?: string[] }
  ): Promise<ExecutionResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Validate code against security policy
    const securityCheck = this.validateCode(code, language);
    if (!securityCheck.safe) {
      return {
        success: false,
        output: '',
        error: `Security violation: ${securityCheck.reason}`,
        exitCode: 1,
        executionTime: 0,
        resourceUsage: session.resourceUsage,
        truncated: false,
      };
    }

    session.status = 'running';
    session.lastActivity = Date.now();
    const startTime = Date.now();

    try {
      if (this.isAvailable && session.containerId) {
        // Execute in container
        const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
        const response = await fetch(`${ideUrl}/api/sandbox/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            containerId: session.containerId,
            code,
            language,
            timeout: session.config.timeout,
            stdin: options?.stdin,
            args: options?.args,
          }),
        });

        const result = await response.json();
        session.status = 'ready';
        session.resourceUsage = result.resourceUsage || session.resourceUsage;

        return {
          success: result.success,
          output: this.truncateOutput(result.output),
          error: result.error,
          exitCode: result.exitCode,
          executionTime: Date.now() - startTime,
          resourceUsage: session.resourceUsage,
          truncated: result.output.length > this.securityPolicy.maxOutputSize,
        };
      } else {
        // Fallback: execute without container (less secure)
        const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
        const response = await fetch(`${ideUrl}/api/code/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            language,
            timeout: Math.min(session.config.timeout, this.securityPolicy.maxExecutionTime),
          }),
        });

        const result = await response.json();
        session.status = 'ready';

        return {
          success: result.success,
          output: this.truncateOutput(result.output || ''),
          error: result.error,
          exitCode: result.exit_code || (result.success ? 0 : 1),
          executionTime: result.execution_time * 1000 || Date.now() - startTime,
          resourceUsage: session.resourceUsage,
          truncated: (result.output || '').length > this.securityPolicy.maxOutputSize,
        };
      }
    } catch (error) {
      session.status = 'error';
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Execution failed',
        exitCode: 1,
        executionTime: Date.now() - startTime,
        resourceUsage: session.resourceUsage,
        truncated: false,
      };
    }
  }

  // Destroy sandbox session
  async destroySession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (this.isAvailable && session.containerId) {
      try {
        const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
        await fetch(`${ideUrl}/api/sandbox/destroy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ containerId: session.containerId }),
        });
      } catch (error) {
        console.error('Failed to destroy container:', error);
      }
    }

    session.status = 'stopped';
    this.sessions.delete(sessionId);
  }

  // Get session info
  getSession(sessionId: string): SandboxSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Get all active sessions
  getActiveSessions(): SandboxSession[] {
    return Array.from(this.sessions.values()).filter(s => 
      s.status === 'ready' || s.status === 'running'
    );
  }

  // Set security policy
  setSecurityPolicy(policy: 'strict' | 'moderate' | 'permissive' | SecurityPolicy): void {
    if (typeof policy === 'string') {
      this.securityPolicy = SECURITY_POLICIES[policy];
    } else {
      this.securityPolicy = policy;
    }
  }

  // Get current security policy
  getSecurityPolicy(): SecurityPolicy {
    return { ...this.securityPolicy };
  }

  // Validate code against security policy
  validateCode(code: string, language: string): { safe: boolean; reason?: string } {
    const codeLower = code.toLowerCase();

    // Check for blocked commands
    for (const blocked of this.config.blockedCommands) {
      if (codeLower.includes(blocked.toLowerCase())) {
        return { safe: false, reason: `Blocked command pattern detected: ${blocked}` };
      }
    }

    // Check for blocked modules (language-specific)
    if (language === 'python') {
      for (const module of this.securityPolicy.blockedModules) {
        const importPatterns = [
          `import ${module}`,
          `from ${module}`,
          `__import__('${module}')`,
          `__import__("${module}")`,
        ];
        for (const pattern of importPatterns) {
          if (codeLower.includes(pattern.toLowerCase())) {
            return { safe: false, reason: `Blocked module: ${module}` };
          }
        }
      }

      // Check for dangerous Python constructs
      const dangerousPatterns = [
        'eval(', 'exec(', 'compile(',
        '__builtins__', '__import__',
        'open(', 'file(',
      ];

      if (!this.securityPolicy.allowFileSystem) {
        for (const pattern of dangerousPatterns) {
          if (codeLower.includes(pattern.toLowerCase())) {
            return { safe: false, reason: `Potentially dangerous pattern: ${pattern}` };
          }
        }
      }
    }

    if (language === 'javascript' || language === 'typescript') {
      // Check for dangerous JS constructs
      if (!this.securityPolicy.allowSubprocess) {
        const dangerousPatterns = [
          'child_process', 'spawn(', 'exec(',
          'require("fs")', "require('fs')",
          'process.env',
        ];
        for (const pattern of dangerousPatterns) {
          if (code.includes(pattern)) {
            return { safe: false, reason: `Potentially dangerous pattern: ${pattern}` };
          }
        }
      }
    }

    if (language === 'bash' || language === 'shell') {
      // Check for dangerous shell patterns
      const dangerousPatterns = [
        'rm -rf', 'mkfs', 'dd if=',
        '> /dev/', 'chmod 777',
        'curl | bash', 'wget | bash',
      ];
      for (const pattern of dangerousPatterns) {
        if (codeLower.includes(pattern.toLowerCase())) {
          return { safe: false, reason: `Dangerous shell pattern: ${pattern}` };
        }
      }
    }

    return { safe: true };
  }

  // Check if sandbox is available
  isEnabled(): boolean {
    return this.isAvailable;
  }

  // Get resource limits
  getResourceLimits(): { memoryMB: number; cpuPercent: number; timeout: number } {
    return {
      memoryMB: this.config.maxMemoryMB,
      cpuPercent: this.config.maxCpuPercent,
      timeout: this.config.timeout,
    };
  }

  private truncateOutput(output: string): string {
    if (output.length > this.securityPolicy.maxOutputSize) {
      return output.slice(0, this.securityPolicy.maxOutputSize) + '\n... (output truncated)';
    }
    return output;
  }

  private generateId(): string {
    return `sandbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON ==============
export const sandboxService = new SandboxService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useSandbox() {
  const [session, setSession] = useState<SandboxSession | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    sandboxService.checkAvailability().then(setIsAvailable);
  }, []);

  const createSession = useCallback(async (config?: Partial<SandboxConfig>) => {
    const newSession = await sandboxService.createSession(config);
    setSession(newSession);
    return newSession;
  }, []);

  const execute = useCallback(async (
    code: string,
    language: string,
    options?: { stdin?: string; args?: string[] }
  ) => {
    if (!session) {
      const newSession = await sandboxService.createSession();
      setSession(newSession);
    }

    setIsExecuting(true);
    try {
      const result = await sandboxService.execute(
        session?.id || '',
        code,
        language,
        options
      );
      return result;
    } finally {
      setIsExecuting(false);
    }
  }, [session]);

  const destroy = useCallback(async () => {
    if (session) {
      await sandboxService.destroySession(session.id);
      setSession(null);
    }
  }, [session]);

  return {
    session,
    isAvailable,
    isExecuting,
    createSession,
    execute,
    destroy,
    validateCode: sandboxService.validateCode.bind(sandboxService),
  };
}

export default sandboxService;
