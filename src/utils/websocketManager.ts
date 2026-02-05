// ============== WEBSOCKET MANAGER ==============
// Optimized WebSocket connection with auto-reconnect and message queuing

type MessageHandler = (data: unknown) => void;
type ConnectionHandler = () => void;

interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: number;
  id: string;
}

interface PendingMessage {
  message: WebSocketMessage;
  resolve: () => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

class WebSocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private messageQueue: WebSocketMessage[] = [];
  private pendingMessages = new Map<string, PendingMessage>();
  private messageHandlers = new Map<string, Set<MessageHandler>>();
  private onConnectHandlers = new Set<ConnectionHandler>();
  private onDisconnectHandlers = new Set<ConnectionHandler>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout = 30000;
  private isConnecting = false;
  private isManualClose = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection
        const checkConnection = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 100);
        return;
      }

      this.isConnecting = true;
      this.isManualClose = false;

      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.notifyConnect();
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        this.socket.onclose = (event) => {
          this.isConnecting = false;
          this.stopHeartbeat();
          this.notifyDisconnect();

          if (!this.isManualClose && !event.wasClean) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }

    // Reject all pending messages
    for (const pending of this.pendingMessages.values()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    }
    this.pendingMessages.clear();
  }

  send(type: string, payload: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now(),
        id: this.generateId(),
      };

      if (this.socket?.readyState === WebSocket.OPEN) {
        this.sendMessage(message, resolve, reject);
      } else {
        this.messageQueue.push(message);
        // Auto-connect if not connected
        this.connect().then(() => resolve()).catch(reject);
      }
    });
  }

  sendWithResponse<T>(type: string, payload: unknown, timeout = 10000): Promise<T> {
    return new Promise((resolve, reject) => {
      const message: WebSocketMessage = {
        type,
        payload,
        timestamp: Date.now(),
        id: this.generateId(),
      };

      const timeoutId = setTimeout(() => {
        this.pendingMessages.delete(message.id);
        reject(new Error('Request timeout'));
      }, timeout);

      this.pendingMessages.set(message.id, {
        message,
        resolve: () => {}, // Will be replaced when response arrives
        reject,
        timeout: timeoutId,
      });

      // Set up one-time response handler
      const responseHandler = (data: unknown) => {
        const response = data as { requestId?: string; data?: T };
        if (response.requestId === message.id) {
          clearTimeout(timeoutId);
          this.pendingMessages.delete(message.id);
          this.off(`${type}:response`, responseHandler);
          resolve(response.data as T);
        }
      };

      this.on(`${type}:response`, responseHandler);

      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(message));
      } else {
        this.messageQueue.push(message);
        this.connect().catch(reject);
      }
    });
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);

    return () => this.off(type, handler);
  }

  off(type: string, handler: MessageHandler): void {
    this.messageHandlers.get(type)?.delete(handler);
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.onConnectHandlers.add(handler);
    return () => this.onConnectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.onDisconnectHandlers.add(handler);
    return () => this.onDisconnectHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.socket) return 'disconnected';
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  private sendMessage(
    message: WebSocketMessage,
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    try {
      this.socket!.send(JSON.stringify(message));
      resolve();
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Send failed'));
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      const type = data.type || 'message';
      
      // Handle heartbeat response
      if (type === 'pong') {
        return;
      }

      // Notify handlers
      this.messageHandlers.get(type)?.forEach(handler => {
        try {
          handler(data.payload || data);
        } catch (error) {
          console.error('Message handler error:', error);
        }
      });

      // Also notify wildcard handlers
      this.messageHandlers.get('*')?.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Wildcard handler error:', error);
        }
      });
    } catch {
      console.warn('Failed to parse WebSocket message');
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()!;
      this.socket.send(JSON.stringify(message));
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    this.reconnectAttempts++;
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(() => {
        this.scheduleReconnect();
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, this.heartbeatTimeout);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private notifyConnect(): void {
    this.onConnectHandlers.forEach(handler => {
      try { handler(); } catch {}
    });
  }

  private notifyDisconnect(): void {
    this.onDisconnectHandlers.forEach(handler => {
      try { handler(); } catch {}
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON INSTANCES ==============
const wsInstances = new Map<string, WebSocketManager>();

export function getWebSocket(url: string): WebSocketManager {
  if (!wsInstances.has(url)) {
    wsInstances.set(url, new WebSocketManager(url));
  }
  return wsInstances.get(url)!;
}

// ============== DEFAULT CONNECTIONS ==============
const getWsUrl = (path: string) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const wsUrl = apiUrl.replace('http', 'ws');
  return `${wsUrl}${path}`;
};

const getIdeWsUrl = (path: string) => {
  const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
  const wsUrl = ideUrl.replace('http', 'ws');
  return `${wsUrl}${path}`;
};

export const ideWebSocket = getWebSocket(getIdeWsUrl('/ws/ide'));
// Note: chatWebSocket is disabled - use WebSocketClient from websocketClient.ts for resonant-chat
// The /api/chat/ws endpoint doesn't exist, causing 404 errors
// export const chatWebSocket = getWebSocket(getWsUrl('/api/chat/ws'));
export const chatWebSocket = {
  isConnected: false,
  send: (_type: string, _payload: unknown) => Promise.resolve(),
  on: (_type: string, _handler: (payload: unknown) => void) => () => {},
  connect: () => Promise.resolve(),
  disconnect: () => {},
};

// ============== REACT HOOK ==============
import { useState, useEffect, useCallback } from 'react';

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown>(null);
  const ws = getWebSocket(url);

  useEffect(() => {
    const unsubConnect = ws.onConnect(() => setIsConnected(true));
    const unsubDisconnect = ws.onDisconnect(() => setIsConnected(false));
    const unsubMessage = ws.on('*', setLastMessage);

    ws.connect().catch(console.error);

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubMessage();
    };
  }, [url, ws]);

  const send = useCallback((type: string, payload: unknown) => {
    return ws.send(type, payload);
  }, [ws]);

  const sendWithResponse = useCallback(<T,>(type: string, payload: unknown, timeout?: number) => {
    return ws.sendWithResponse<T>(type, payload, timeout);
  }, [ws]);

  return {
    isConnected,
    lastMessage,
    send,
    sendWithResponse,
    disconnect: () => ws.disconnect(),
  };
}

export default WebSocketManager;
