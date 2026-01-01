/**
 * DSID-P Real-time Communication
 * 
 * WebSocket-based real-time updates for:
 * - Progress streaming
 * - Agent state changes
 * - Live logs
 * - Task notifications
 * - Collaboration messages
 */

// ============== TYPES ==============

export interface RealtimeConfig {
  url: string;
  reconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onReconnect?: (attempt: number) => void;
}

export type MessageType = 
  | 'progress'
  | 'agent_state'
  | 'log'
  | 'task'
  | 'notification'
  | 'collaboration'
  | 'screenshot'
  | 'metrics'
  | 'error'
  | 'heartbeat';

export interface RealtimeMessage<T = unknown> {
  id: string;
  type: MessageType;
  timestamp: number;
  payload: T;
  source?: string;
}

export interface ProgressPayload {
  projectId: string;
  phase: string;
  progress: number;
  currentTask: string;
  tasksCompleted: number;
  tasksTotal: number;
  estimatedTimeRemaining: number;
}

export interface AgentStatePayload {
  agentId: string;
  role: string;
  status: 'idle' | 'thinking' | 'executing' | 'waiting' | 'error';
  currentTask?: string;
  lastAction?: string;
}

export interface LogPayload {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source: string;
  data?: unknown;
}

export interface TaskPayload {
  taskId: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  agentId?: string;
  result?: unknown;
  error?: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action?: { label: string; url?: string };
}

export interface ScreenshotPayload {
  path: string;
  url: string;
  analysis?: {
    designScore: number;
    accessibilityScore: number;
    issues: string[];
  };
}

export interface MetricsPayload {
  cacheHitRate: number;
  parallelSpeedup: number;
  tokensUsed: number;
  tasksCompleted: number;
  avgLatencyMs: number;
}

export type MessageHandler<T = unknown> = (message: RealtimeMessage<T>) => void;

// ============== WEBSOCKET CLIENT ==============

export class RealtimeClient {
  private config: RealtimeConfig;
  private ws: WebSocket | null = null;
  private handlers: Map<MessageType, Set<MessageHandler>> = new Map();
  private globalHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private messageQueue: RealtimeMessage[] = [];

  constructor(config: Partial<RealtimeConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:8081/ws',
      reconnect: config.reconnect ?? true,
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      onConnect: config.onConnect,
      onDisconnect: config.onDisconnect,
      onError: config.onError,
      onReconnect: config.onReconnect,
    };
  }

  // ============== CONNECTION ==============

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.config.onConnect?.();
          resolve();
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.stopHeartbeat();
          this.config.onDisconnect?.();
          
          if (this.config.reconnect) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (event) => {
          const error = new Error('WebSocket error');
          this.config.onError?.(error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as RealtimeMessage;
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.config.reconnect = false;
    this.stopHeartbeat();
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.config.onReconnect?.(this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Reconnect failed, will try again
      });
    }, this.config.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1));
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ============== HEARTBEAT ==============

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({
        id: `hb-${Date.now()}`,
        type: 'heartbeat',
        timestamp: Date.now(),
        payload: { ping: true },
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ============== MESSAGING ==============

  send<T>(message: RealtimeMessage<T>): void {
    if (this.isConnected && this.ws) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connected
      this.messageQueue.push(message as RealtimeMessage);
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private handleMessage(message: RealtimeMessage): void {
    // Call type-specific handlers
    const typeHandlers = this.handlers.get(message.type);
    if (typeHandlers) {
      typeHandlers.forEach(handler => handler(message));
    }

    // Call global handlers
    this.globalHandlers.forEach(handler => handler(message));
  }

  // ============== SUBSCRIPTIONS ==============

  on<T = unknown>(type: MessageType, handler: MessageHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as MessageHandler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(type)?.delete(handler as MessageHandler);
    };
  }

  onAll(handler: MessageHandler): () => void {
    this.globalHandlers.add(handler);
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  off(type: MessageType, handler?: MessageHandler): void {
    if (handler) {
      this.handlers.get(type)?.delete(handler);
    } else {
      this.handlers.delete(type);
    }
  }

  offAll(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
  }

  // ============== CONVENIENCE METHODS ==============

  onProgress(handler: MessageHandler<ProgressPayload>): () => void {
    return this.on('progress', handler);
  }

  onAgentState(handler: MessageHandler<AgentStatePayload>): () => void {
    return this.on('agent_state', handler);
  }

  onLog(handler: MessageHandler<LogPayload>): () => void {
    return this.on('log', handler);
  }

  onTask(handler: MessageHandler<TaskPayload>): () => void {
    return this.on('task', handler);
  }

  onNotification(handler: MessageHandler<NotificationPayload>): () => void {
    return this.on('notification', handler);
  }

  onScreenshot(handler: MessageHandler<ScreenshotPayload>): () => void {
    return this.on('screenshot', handler);
  }

  onMetrics(handler: MessageHandler<MetricsPayload>): () => void {
    return this.on('metrics', handler);
  }

  onError(handler: MessageHandler<{ message: string; stack?: string }>): () => void {
    return this.on('error', handler);
  }

  // ============== SEND HELPERS ==============

  sendProgress(payload: ProgressPayload): void {
    this.send({
      id: `progress-${Date.now()}`,
      type: 'progress',
      timestamp: Date.now(),
      payload,
    });
  }

  sendAgentState(payload: AgentStatePayload): void {
    this.send({
      id: `agent-${Date.now()}`,
      type: 'agent_state',
      timestamp: Date.now(),
      payload,
    });
  }

  sendLog(level: LogPayload['level'], message: string, source: string, data?: unknown): void {
    this.send({
      id: `log-${Date.now()}`,
      type: 'log',
      timestamp: Date.now(),
      payload: { level, message, source, data },
    });
  }

  sendTask(payload: TaskPayload): void {
    this.send({
      id: `task-${Date.now()}`,
      type: 'task',
      timestamp: Date.now(),
      payload,
    });
  }

  sendNotification(payload: NotificationPayload): void {
    this.send({
      id: `notif-${Date.now()}`,
      type: 'notification',
      timestamp: Date.now(),
      payload,
    });
  }

  sendScreenshot(payload: ScreenshotPayload): void {
    this.send({
      id: `screenshot-${Date.now()}`,
      type: 'screenshot',
      timestamp: Date.now(),
      payload,
    });
  }

  sendMetrics(payload: MetricsPayload): void {
    this.send({
      id: `metrics-${Date.now()}`,
      type: 'metrics',
      timestamp: Date.now(),
      payload,
    });
  }

  // ============== STATUS ==============

  getStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    queuedMessages: number;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
    };
  }
}

// ============== SERVER (for Node.js) ==============

export class RealtimeServer {
  private clients: Set<any> = new Set();
  private wss: any = null;

  constructor(private port: number = 8082) {}

  async start(): Promise<void> {
    try {
      const { WebSocketServer } = await import('ws');
      
      this.wss = new WebSocketServer({ port: this.port });

      this.wss.on('connection', (ws: any) => {
        this.clients.add(ws);
        console.log(`[RealtimeServer] Client connected. Total: ${this.clients.size}`);

        ws.on('message', (data: Buffer) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(ws, message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        });

        ws.on('close', () => {
          this.clients.delete(ws);
          console.log(`[RealtimeServer] Client disconnected. Total: ${this.clients.size}`);
        });

        ws.on('error', (error: Error) => {
          console.error('[RealtimeServer] Client error:', error);
        });
      });

      console.log(`[RealtimeServer] Started on port ${this.port}`);
    } catch (error) {
      console.error('[RealtimeServer] Failed to start:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    this.clients.clear();
  }

  private handleMessage(sender: any, message: RealtimeMessage): void {
    // Handle heartbeat
    if (message.type === 'heartbeat') {
      sender.send(JSON.stringify({
        id: `hb-response-${Date.now()}`,
        type: 'heartbeat',
        timestamp: Date.now(),
        payload: { pong: true },
      }));
      return;
    }

    // Broadcast to all other clients
    this.broadcast(message, sender);
  }

  broadcast(message: RealtimeMessage, exclude?: any): void {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client !== exclude && client.readyState === 1) {
        client.send(data);
      }
    });
  }

  sendTo(clientId: string, message: RealtimeMessage): void {
    // Would need client ID tracking for targeted messages
    this.broadcast(message);
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

// ============== EVENT EMITTER ==============

export class RealtimeEventEmitter {
  private client: RealtimeClient;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(client: RealtimeClient) {
    this.client = client;
    
    // Forward all messages to event system
    this.client.onAll((message) => {
      this.emit(message.type, message.payload);
      this.emit('*', message);
    });
  }

  on(event: string, listener: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    
    return () => this.off(event, listener);
  }

  off(event: string, listener: Function): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: string, data: unknown): void {
    this.listeners.get(event)?.forEach(listener => listener(data));
  }

  once(event: string, listener: Function): () => void {
    const wrapper = (data: unknown) => {
      this.off(event, wrapper);
      listener(data);
    };
    return this.on(event, wrapper);
  }
}

// ============== FACTORY ==============

export function createRealtimeClient(config?: Partial<RealtimeConfig>): RealtimeClient {
  return new RealtimeClient(config);
}

export function createRealtimeServer(port?: number): RealtimeServer {
  return new RealtimeServer(port);
}

// ============== DEFAULT INSTANCE ==============

let defaultClient: RealtimeClient | null = null;

export function getRealtimeClient(config?: Partial<RealtimeConfig>): RealtimeClient {
  if (!defaultClient) {
    defaultClient = createRealtimeClient(config);
  }
  return defaultClient;
}
