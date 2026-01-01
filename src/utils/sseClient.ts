/**
 * Server-Sent Events (SSE) Client
 * 
 * Fallback for clients that don't support WebSocket.
 * Provides the same real-time updates via SSE.
 * 
 * SECURITY: Only receives safe visualization data
 */

import { logger } from './logger';
import { getApiUrl } from './apiUrl';
import type { WebSocketMessage, WebSocketMessageHandler } from './websocketClient';

export class SSEClient {
  private eventSource: EventSource | null = null;
  private chatId: string | null = null;
  private messageHandlers: Set<WebSocketMessageHandler> = new Set();

  constructor(chatId: string | null) {
    this.chatId = chatId;
  }

  /**
   * Connect to SSE endpoint
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.chatId) {
          const error = new Error('Missing chatId for SSE connection');
          logger.warn('SSE connection aborted - no chatId available', { chatId: this.chatId });
          reject(error);
          return;
        }

        const apiUrl = getApiUrl();
        const sseUrl = `${apiUrl}/ws/sse/resonant-chat/${this.chatId}`;
        
        this.eventSource = new EventSource(sseUrl);

        this.eventSource.onopen = () => {
          logger.info('SSE connected', { chatId: this.chatId });
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            logger.error('Failed to parse SSE message', error);
          }
        };

        this.eventSource.onerror = (error) => {
          logger.error('SSE error', error);
          reject(error);
        };
      } catch (error) {
        logger.error('Failed to create SSE connection', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.messageHandlers.clear();
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
        logger.error('Error in SSE message handler', error);
      }
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}
