/**
 * WebSocket Client for Real-Time Updates
 * 
 * Provides real-time communication for:
 * - Streaming AI responses
 * - Live memory updates
 * - Real-time cluster formation
 * - Evidence graph updates
 * 
 * SECURITY: Only receives safe visualization data (no sensitive weights or vectors)
 */

import { logger } from './logger';
import { getApiUrl } from './apiUrl';

export type WebSocketMessageType = 
  | 'connected'
  | 'disconnected'
  | 'response_chunk'
  | 'message_update'
  | 'memory_update'
  | 'cluster_update'
  | 'evidence_graph_update'
  | 'error'
  | 'pong'
  | 'heartbeat';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  chat_id?: string;
  message_id?: string;
  message?: any;
  memory?: any;
  cluster?: any;
  chunk?: string;
  done?: boolean;
  error?: string;
}

export type WebSocketMessageHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private chatId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private messageHandlers: Set<WebSocketMessageHandler> = new Set();
  private pingInterval: number | null = null;

  constructor(chatId: string | null) {
    this.chatId = chatId;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.chatId) {
          const error = new Error('Missing chatId for WebSocket connection');
          logger.warn('WebSocket connection aborted - no chatId available', { chatId: this.chatId });
          reject(error);
          return;
        }

        const apiUrl = getApiUrl();
        // Convert HTTP/HTTPS to WS/WSS
        let wsUrl: string;
        if (apiUrl.startsWith('https://')) {
          wsUrl = apiUrl.replace('https://', 'wss://');
        } else if (apiUrl.startsWith('http://')) {
          wsUrl = apiUrl.replace('http://', 'ws://');
        } else if (apiUrl.startsWith('/api')) {
          // Production: use wss:// for HTTPS sites, ws:// for HTTP
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          wsUrl = `${protocol}//${window.location.host}${apiUrl}/ws/resonant-chat/${this.chatId}`;
        } else {
          // Fallback
          wsUrl = `ws://${apiUrl}/ws/resonant-chat/${this.chatId}`;
        }
        
        if (!wsUrl.includes('/ws/resonant-chat/')) {
          wsUrl = `${wsUrl}/ws/resonant-chat/${this.chatId}`;
        }
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          logger.info('WebSocket connected', { chatId: this.chatId });
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            logger.error('Failed to parse WebSocket message', error);
          }
        };

        this.ws.onerror = (error) => {
          logger.error('WebSocket error', error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          logger.info('WebSocket closed', { code: event.code, reason: event.reason });
          this.stopPingInterval();
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
              logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
              this.connect().catch((err) => {
                logger.error('Reconnection failed', err);
              });
            }, this.reconnectDelay);
            // Exponential backoff
            this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
          }
        };
      } catch (error) {
        logger.error('Failed to create WebSocket connection', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.messageHandlers.clear();
  }

  /**
   * Send a message to the server
   */
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      logger.warn('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Subscribe to a specific message
   */
  subscribe(messageId: string): void {
    this.send({
      type: 'subscribe',
      message_id: messageId,
    });
  }

  /**
   * Add a message handler
   */
  onMessage(handler: WebSocketMessageHandler): () => void {
    this.messageHandlers.add(handler);
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    // Notify all handlers
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        logger.error('Error in WebSocket message handler', error);
      }
    });
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.pingInterval = window.setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
