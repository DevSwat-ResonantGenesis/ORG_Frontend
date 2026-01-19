// ============== TERMINAL SERVICE ==============
// Terminal management with PTY support and multiple sessions

import { getWebSocket } from '../utils/websocketManager';

// ============== TYPES ==============
export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  shell: string;
  cols: number;
  rows: number;
  pid?: number;
  status: 'starting' | 'running' | 'stopped' | 'error';
  createdAt: number;
}

export interface TerminalOutput {
  sessionId: string;
  data: string;
  timestamp: number;
}

export interface TerminalConfig {
  shell?: string;
  cwd?: string;
  env?: Record<string, string>;
  cols?: number;
  rows?: number;
  name?: string;
}

type OutputHandler = (output: TerminalOutput) => void;
type StatusHandler = (session: TerminalSession) => void;

// ============== TERMINAL SERVICE ==============
class TerminalService {
  private ws = getWebSocket(`${import.meta.env.VITE_WS_URL}/ws/terminal`);
  private sessions = new Map<string, TerminalSession>();
  private outputHandlers = new Map<string, Set<OutputHandler>>();
  private statusHandlers = new Set<StatusHandler>();
  private outputBuffers = new Map<string, string[]>();
  private maxBufferSize = 10000;

  constructor() {
    this.setupHandlers();
  }

  // Create new terminal session
  async createSession(config: TerminalConfig = {}): Promise<TerminalSession> {
    const {
      shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/zsh',
      cwd = process.cwd(),
      env = {},
      cols = 80,
      rows = 24,
      name,
    } = config;

    const sessionId = this.generateId();
    const session: TerminalSession = {
      id: sessionId,
      name: name || `Terminal ${this.sessions.size + 1}`,
      cwd,
      shell,
      cols,
      rows,
      status: 'starting',
      createdAt: Date.now(),
    };

    this.sessions.set(sessionId, session);
    this.outputBuffers.set(sessionId, []);

    await this.ws.connect();

    try {
      await this.ws.send('terminal:create', {
        sessionId,
        shell,
        cwd,
        env,
        cols,
        rows,
      });

      session.status = 'running';
      this.notifyStatusChange(session);
      return session;
    } catch (error) {
      session.status = 'error';
      this.notifyStatusChange(session);
      throw error;
    }
  }

  // Send input to terminal
  write(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'running') return;

    this.ws.send('terminal:input', { sessionId, data }).catch(console.error);
  }

  // Send special key
  sendKey(sessionId: string, key: string): void {
    const keyMap: Record<string, string> = {
      'enter': '\r',
      'tab': '\t',
      'backspace': '\x7f',
      'escape': '\x1b',
      'up': '\x1b[A',
      'down': '\x1b[B',
      'right': '\x1b[C',
      'left': '\x1b[D',
      'home': '\x1b[H',
      'end': '\x1b[F',
      'pageup': '\x1b[5~',
      'pagedown': '\x1b[6~',
      'delete': '\x1b[3~',
      'ctrl+c': '\x03',
      'ctrl+d': '\x04',
      'ctrl+z': '\x1a',
      'ctrl+l': '\x0c',
    };

    const sequence = keyMap[key.toLowerCase()];
    if (sequence) {
      this.write(sessionId, sequence);
    }
  }

  // Resize terminal
  resize(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.cols = cols;
    session.rows = rows;

    this.ws.send('terminal:resize', { sessionId, cols, rows }).catch(console.error);
  }

  // Close terminal session
  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    try {
      await this.ws.send('terminal:close', { sessionId });
    } finally {
      session.status = 'stopped';
      this.notifyStatusChange(session);
      this.sessions.delete(sessionId);
      this.outputBuffers.delete(sessionId);
      this.outputHandlers.delete(sessionId);
    }
  }

  // Close all sessions
  async closeAll(): Promise<void> {
    const sessionIds = Array.from(this.sessions.keys());
    await Promise.all(sessionIds.map(id => this.closeSession(id)));
  }

  // Get session
  getSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Get all sessions
  getSessions(): TerminalSession[] {
    return Array.from(this.sessions.values());
  }

  // Get output buffer
  getOutput(sessionId: string): string[] {
    return this.outputBuffers.get(sessionId) || [];
  }

  // Clear output buffer
  clearOutput(sessionId: string): void {
    this.outputBuffers.set(sessionId, []);
  }

  // Subscribe to output
  onOutput(sessionId: string, handler: OutputHandler): () => void {
    if (!this.outputHandlers.has(sessionId)) {
      this.outputHandlers.set(sessionId, new Set());
    }
    this.outputHandlers.get(sessionId)!.add(handler);
    return () => this.outputHandlers.get(sessionId)?.delete(handler);
  }

  // Subscribe to status changes
  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  // Run command in new terminal
  async runCommand(command: string, config?: TerminalConfig): Promise<{ sessionId: string; output: string }> {
    const session = await this.createSession(config);
    
    return new Promise((resolve, reject) => {
      let output = '';
      const timeout = setTimeout(() => {
        this.closeSession(session.id);
        reject(new Error('Command timeout'));
      }, 60000);

      const unsubscribe = this.onOutput(session.id, (data) => {
        output += data.data;
      });

      // Wait for shell to be ready
      setTimeout(() => {
        this.write(session.id, command + '\r');
        
        // Wait for command to complete
        setTimeout(() => {
          clearTimeout(timeout);
          unsubscribe();
          resolve({ sessionId: session.id, output });
        }, 2000);
      }, 500);
    });
  }

  // Execute command and return output (non-interactive)
  async exec(command: string, cwd?: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    try {
      const response = await fetch('http://localhost:8080/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, cwd }),
      });

      if (!response.ok) throw new Error('Command execution failed');
      return response.json();
    } catch (error) {
      throw error;
    }
  }

  private setupHandlers(): void {
    // Terminal output
    this.ws.on('terminal:output', (data) => {
      const { sessionId, data: output } = data as { sessionId: string; data: string };
      
      const buffer = this.outputBuffers.get(sessionId);
      if (buffer) {
        buffer.push(output);
        if (buffer.length > this.maxBufferSize) {
          buffer.shift();
        }
      }

      const outputData: TerminalOutput = {
        sessionId,
        data: output,
        timestamp: Date.now(),
      };

      this.outputHandlers.get(sessionId)?.forEach(handler => handler(outputData));
    });

    // Terminal closed
    this.ws.on('terminal:closed', (data) => {
      const { sessionId, exitCode } = data as { sessionId: string; exitCode: number };
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'stopped';
        this.notifyStatusChange(session);
      }
    });

    // Terminal error
    this.ws.on('terminal:error', (data) => {
      const { sessionId, error } = data as { sessionId: string; error: string };
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'error';
        this.notifyStatusChange(session);
      }
      console.error(`Terminal ${sessionId} error:`, error);
    });
  }

  private notifyStatusChange(session: TerminalSession): void {
    this.statusHandlers.forEach(handler => handler(session));
  }

  private generateId(): string {
    return `term-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON ==============
export const terminalService = new TerminalService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback, useRef } from 'react';

export function useTerminal(sessionId?: string) {
  const [session, setSession] = useState<TerminalSession | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const sessionIdRef = useRef(sessionId);

  useEffect(() => {
    if (!sessionIdRef.current) return;

    const existingSession = terminalService.getSession(sessionIdRef.current);
    if (existingSession) {
      setSession(existingSession);
      setOutput(terminalService.getOutput(sessionIdRef.current));
      setIsConnected(true);
    }

    const unsubOutput = terminalService.onOutput(sessionIdRef.current, (data) => {
      setOutput(prev => [...prev, data.data]);
    });

    const unsubStatus = terminalService.onStatusChange((updatedSession) => {
      if (updatedSession.id === sessionIdRef.current) {
        setSession(updatedSession);
        setIsConnected(updatedSession.status === 'running');
      }
    });

    return () => {
      unsubOutput();
      unsubStatus();
    };
  }, []);

  const createSession = useCallback(async (config?: TerminalConfig) => {
    const newSession = await terminalService.createSession(config);
    sessionIdRef.current = newSession.id;
    setSession(newSession);
    setIsConnected(true);
    return newSession;
  }, []);

  const write = useCallback((data: string) => {
    if (sessionIdRef.current) {
      terminalService.write(sessionIdRef.current, data);
    }
  }, []);

  const sendKey = useCallback((key: string) => {
    if (sessionIdRef.current) {
      terminalService.sendKey(sessionIdRef.current, key);
    }
  }, []);

  const resize = useCallback((cols: number, rows: number) => {
    if (sessionIdRef.current) {
      terminalService.resize(sessionIdRef.current, cols, rows);
    }
  }, []);

  const close = useCallback(async () => {
    if (sessionIdRef.current) {
      await terminalService.closeSession(sessionIdRef.current);
      setSession(null);
      setIsConnected(false);
    }
  }, []);

  const clear = useCallback(() => {
    if (sessionIdRef.current) {
      terminalService.clearOutput(sessionIdRef.current);
      setOutput([]);
    }
  }, []);

  return {
    session,
    output,
    isConnected,
    createSession,
    write,
    sendKey,
    resize,
    close,
    clear,
  };
}

export function useTerminalSessions() {
  const [sessions, setSessions] = useState<TerminalSession[]>([]);

  useEffect(() => {
    setSessions(terminalService.getSessions());

    const unsubscribe = terminalService.onStatusChange(() => {
      setSessions(terminalService.getSessions());
    });

    return unsubscribe;
  }, []);

  return {
    sessions,
    createSession: terminalService.createSession.bind(terminalService),
    closeSession: terminalService.closeSession.bind(terminalService),
    closeAll: terminalService.closeAll.bind(terminalService),
  };
}

export default terminalService;
