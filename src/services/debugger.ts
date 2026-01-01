// ============== DEBUGGER SERVICE ==============
// Debug session management with breakpoints, stepping, and variable inspection

import { getWebSocket } from '../utils/websocketManager';

// ============== TYPES ==============
export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  column?: number;
  condition?: string;
  hitCount?: number;
  logMessage?: string;
  enabled: boolean;
}

export interface StackFrame {
  id: number;
  name: string;
  file: string;
  line: number;
  column: number;
  source?: string;
  scopes: Scope[];
}

export interface Scope {
  name: string;
  type: 'local' | 'global' | 'closure' | 'block';
  variables: Variable[];
}

export interface Variable {
  name: string;
  value: string;
  type: string;
  variablesReference: number;
  children?: Variable[];
  evaluateName?: string;
}

export interface DebugSession {
  id: string;
  name: string;
  type: 'python' | 'node' | 'chrome' | 'lldb';
  status: 'starting' | 'running' | 'paused' | 'stopped';
  file?: string;
  pausedAt?: { file: string; line: number };
}

export interface WatchExpression {
  id: string;
  expression: string;
  value?: string;
  type?: string;
  error?: string;
}

export interface DebugConfig {
  type: 'python' | 'node' | 'chrome' | 'lldb';
  name: string;
  request: 'launch' | 'attach';
  program?: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  port?: number;
  stopOnEntry?: boolean;
}

type DebugEventHandler = (event: DebugEvent) => void;

export interface DebugEvent {
  type: 'stopped' | 'continued' | 'exited' | 'output' | 'breakpoint' | 'exception';
  sessionId: string;
  data?: unknown;
}

// ============== DEBUGGER SERVICE ==============
class DebuggerService {
  private ws = getWebSocket('ws://localhost:8080/ws/debug');
  private sessions = new Map<string, DebugSession>();
  private breakpoints = new Map<string, Breakpoint[]>();
  private watchExpressions: WatchExpression[] = [];
  private eventHandlers = new Set<DebugEventHandler>();
  private currentSession: string | null = null;

  constructor() {
    this.setupHandlers();
  }

  // Start debug session
  async startSession(config: DebugConfig): Promise<DebugSession> {
    const sessionId = this.generateId();
    const session: DebugSession = {
      id: sessionId,
      name: config.name,
      type: config.type,
      status: 'starting',
      file: config.program,
    };

    this.sessions.set(sessionId, session);
    this.currentSession = sessionId;

    await this.ws.connect();

    try {
      await this.ws.send('debug:launch', { sessionId, config });
      session.status = 'running';
      return session;
    } catch (error) {
      session.status = 'stopped';
      throw error;
    }
  }

  // Stop debug session
  async stopSession(sessionId?: string): Promise<void> {
    const id = sessionId || this.currentSession;
    if (!id) return;

    await this.ws.send('debug:stop', { sessionId: id });
    this.sessions.delete(id);
    
    if (this.currentSession === id) {
      this.currentSession = null;
    }
  }

  // Pause execution
  async pause(sessionId?: string): Promise<void> {
    const id = sessionId || this.currentSession;
    if (!id) return;

    await this.ws.send('debug:pause', { sessionId: id });
  }

  // Continue execution
  async continue(sessionId?: string): Promise<void> {
    const id = sessionId || this.currentSession;
    if (!id) return;

    await this.ws.send('debug:continue', { sessionId: id });
    const session = this.sessions.get(id);
    if (session) {
      session.status = 'running';
      session.pausedAt = undefined;
    }
  }

  // Step over
  async stepOver(sessionId?: string): Promise<void> {
    const id = sessionId || this.currentSession;
    if (!id) return;

    await this.ws.send('debug:stepOver', { sessionId: id });
  }

  // Step into
  async stepInto(sessionId?: string): Promise<void> {
    const id = sessionId || this.currentSession;
    if (!id) return;

    await this.ws.send('debug:stepInto', { sessionId: id });
  }

  // Step out
  async stepOut(sessionId?: string): Promise<void> {
    const id = sessionId || this.currentSession;
    if (!id) return;

    await this.ws.send('debug:stepOut', { sessionId: id });
  }

  // Restart session
  async restart(sessionId?: string): Promise<void> {
    const id = sessionId || this.currentSession;
    if (!id) return;

    await this.ws.send('debug:restart', { sessionId: id });
  }

  // Add breakpoint
  addBreakpoint(file: string, line: number, options?: Partial<Breakpoint>): Breakpoint {
    const breakpoint: Breakpoint = {
      id: this.generateId(),
      file,
      line,
      enabled: true,
      ...options,
    };

    if (!this.breakpoints.has(file)) {
      this.breakpoints.set(file, []);
    }
    this.breakpoints.get(file)!.push(breakpoint);

    // Sync with debug server
    if (this.currentSession) {
      this.ws.send('debug:setBreakpoint', { 
        sessionId: this.currentSession, 
        breakpoint 
      }).catch(console.error);
    }

    return breakpoint;
  }

  // Remove breakpoint
  removeBreakpoint(id: string): void {
    for (const [file, bps] of this.breakpoints) {
      const index = bps.findIndex(bp => bp.id === id);
      if (index !== -1) {
        const bp = bps[index];
        bps.splice(index, 1);

        if (this.currentSession) {
          this.ws.send('debug:removeBreakpoint', { 
            sessionId: this.currentSession, 
            breakpointId: id 
          }).catch(console.error);
        }
        break;
      }
    }
  }

  // Toggle breakpoint
  toggleBreakpoint(file: string, line: number): Breakpoint | null {
    const fileBps = this.breakpoints.get(file) || [];
    const existing = fileBps.find(bp => bp.line === line);

    if (existing) {
      this.removeBreakpoint(existing.id);
      return null;
    } else {
      return this.addBreakpoint(file, line);
    }
  }

  // Enable/disable breakpoint
  setBreakpointEnabled(id: string, enabled: boolean): void {
    for (const bps of this.breakpoints.values()) {
      const bp = bps.find(b => b.id === id);
      if (bp) {
        bp.enabled = enabled;
        if (this.currentSession) {
          this.ws.send('debug:updateBreakpoint', { 
            sessionId: this.currentSession, 
            breakpoint: bp 
          }).catch(console.error);
        }
        break;
      }
    }
  }

  // Get breakpoints for file
  getBreakpoints(file?: string): Breakpoint[] {
    if (file) {
      return this.breakpoints.get(file) || [];
    }
    return Array.from(this.breakpoints.values()).flat();
  }

  // Clear all breakpoints
  clearAllBreakpoints(): void {
    this.breakpoints.clear();
    if (this.currentSession) {
      this.ws.send('debug:clearBreakpoints', { 
        sessionId: this.currentSession 
      }).catch(console.error);
    }
  }

  // Get stack trace
  async getStackTrace(sessionId?: string): Promise<StackFrame[]> {
    const id = sessionId || this.currentSession;
    if (!id) return [];

    try {
      const response = await this.ws.sendWithResponse<{ frames: StackFrame[] }>(
        'debug:stackTrace',
        { sessionId: id }
      );
      return response.frames;
    } catch {
      return [];
    }
  }

  // Get variables for scope
  async getVariables(scopeId: number, sessionId?: string): Promise<Variable[]> {
    const id = sessionId || this.currentSession;
    if (!id) return [];

    try {
      const response = await this.ws.sendWithResponse<{ variables: Variable[] }>(
        'debug:variables',
        { sessionId: id, scopeId }
      );
      return response.variables;
    } catch {
      return [];
    }
  }

  // Evaluate expression
  async evaluate(expression: string, frameId?: number, sessionId?: string): Promise<Variable> {
    const id = sessionId || this.currentSession;
    if (!id) throw new Error('No active session');

    const response = await this.ws.sendWithResponse<Variable>(
      'debug:evaluate',
      { sessionId: id, expression, frameId }
    );
    return response;
  }

  // Add watch expression
  addWatch(expression: string): WatchExpression {
    const watch: WatchExpression = {
      id: this.generateId(),
      expression,
    };
    this.watchExpressions.push(watch);
    this.refreshWatch(watch.id);
    return watch;
  }

  // Remove watch expression
  removeWatch(id: string): void {
    const index = this.watchExpressions.findIndex(w => w.id === id);
    if (index !== -1) {
      this.watchExpressions.splice(index, 1);
    }
  }

  // Refresh watch expression
  async refreshWatch(id: string): Promise<void> {
    const watch = this.watchExpressions.find(w => w.id === id);
    if (!watch || !this.currentSession) return;

    try {
      const result = await this.evaluate(watch.expression);
      watch.value = result.value;
      watch.type = result.type;
      watch.error = undefined;
    } catch (error) {
      watch.error = error instanceof Error ? error.message : 'Evaluation failed';
    }
  }

  // Refresh all watches
  async refreshAllWatches(): Promise<void> {
    await Promise.all(this.watchExpressions.map(w => this.refreshWatch(w.id)));
  }

  // Get watch expressions
  getWatches(): WatchExpression[] {
    return [...this.watchExpressions];
  }

  // Get current session
  getCurrentSession(): DebugSession | null {
    return this.currentSession ? this.sessions.get(this.currentSession) || null : null;
  }

  // Get all sessions
  getSessions(): DebugSession[] {
    return Array.from(this.sessions.values());
  }

  // Subscribe to events
  onEvent(handler: DebugEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  private setupHandlers(): void {
    // Stopped event (hit breakpoint, step complete, etc.)
    this.ws.on('debug:stopped', (data) => {
      const { sessionId, reason, file, line } = data as { 
        sessionId: string; 
        reason: string; 
        file: string; 
        line: number;
      };
      
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'paused';
        session.pausedAt = { file, line };
      }

      this.emitEvent({ type: 'stopped', sessionId, data: { reason, file, line } });
      this.refreshAllWatches();
    });

    // Continued event
    this.ws.on('debug:continued', (data) => {
      const { sessionId } = data as { sessionId: string };
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'running';
        session.pausedAt = undefined;
      }

      this.emitEvent({ type: 'continued', sessionId });
    });

    // Exited event
    this.ws.on('debug:exited', (data) => {
      const { sessionId, exitCode } = data as { sessionId: string; exitCode: number };
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'stopped';
      }

      this.emitEvent({ type: 'exited', sessionId, data: { exitCode } });
    });

    // Output event
    this.ws.on('debug:output', (data) => {
      const { sessionId, category, output } = data as { 
        sessionId: string; 
        category: string; 
        output: string;
      };

      this.emitEvent({ type: 'output', sessionId, data: { category, output } });
    });

    // Exception event
    this.ws.on('debug:exception', (data) => {
      const { sessionId, exception } = data as { sessionId: string; exception: unknown };
      
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'paused';
      }

      this.emitEvent({ type: 'exception', sessionId, data: { exception } });
    });
  }

  private emitEvent(event: DebugEvent): void {
    this.eventHandlers.forEach(handler => handler(event));
  }

  private generateId(): string {
    return `dbg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON ==============
export const debuggerService = new DebuggerService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useDebugger() {
  const [session, setSession] = useState<DebugSession | null>(null);
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [watches, setWatches] = useState<WatchExpression[]>([]);

  useEffect(() => {
    const unsubscribe = debuggerService.onEvent(async (event) => {
      setSession(debuggerService.getCurrentSession());
      
      if (event.type === 'stopped') {
        const frames = await debuggerService.getStackTrace();
        setStackFrames(frames);
      } else if (event.type === 'continued' || event.type === 'exited') {
        setStackFrames([]);
      }

      setWatches(debuggerService.getWatches());
    });

    return unsubscribe;
  }, []);

  const start = useCallback(async (config: DebugConfig) => {
    const newSession = await debuggerService.startSession(config);
    setSession(newSession);
    return newSession;
  }, []);

  const stop = useCallback(async () => {
    await debuggerService.stopSession();
    setSession(null);
    setStackFrames([]);
  }, []);

  return {
    session,
    stackFrames,
    watches,
    start,
    stop,
    pause: debuggerService.pause.bind(debuggerService),
    continue: debuggerService.continue.bind(debuggerService),
    stepOver: debuggerService.stepOver.bind(debuggerService),
    stepInto: debuggerService.stepInto.bind(debuggerService),
    stepOut: debuggerService.stepOut.bind(debuggerService),
    restart: debuggerService.restart.bind(debuggerService),
    evaluate: debuggerService.evaluate.bind(debuggerService),
    addWatch: (expr: string) => {
      debuggerService.addWatch(expr);
      setWatches(debuggerService.getWatches());
    },
    removeWatch: (id: string) => {
      debuggerService.removeWatch(id);
      setWatches(debuggerService.getWatches());
    },
  };
}

export function useBreakpoints(file?: string) {
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);

  useEffect(() => {
    setBreakpoints(debuggerService.getBreakpoints(file));
  }, [file]);

  const toggle = useCallback((line: number) => {
    if (!file) return;
    debuggerService.toggleBreakpoint(file, line);
    setBreakpoints(debuggerService.getBreakpoints(file));
  }, [file]);

  const add = useCallback((line: number, options?: Partial<Breakpoint>) => {
    if (!file) return;
    debuggerService.addBreakpoint(file, line, options);
    setBreakpoints(debuggerService.getBreakpoints(file));
  }, [file]);

  const remove = useCallback((id: string) => {
    debuggerService.removeBreakpoint(id);
    setBreakpoints(debuggerService.getBreakpoints(file));
  }, [file]);

  const setEnabled = useCallback((id: string, enabled: boolean) => {
    debuggerService.setBreakpointEnabled(id, enabled);
    setBreakpoints(debuggerService.getBreakpoints(file));
  }, [file]);

  return { breakpoints, toggle, add, remove, setEnabled };
}

export default debuggerService;
