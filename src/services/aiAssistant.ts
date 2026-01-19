// ============== AI ASSISTANT SERVICE ==============
// Intelligent AI assistant with streaming responses and context awareness

import { chatWebSocket } from '../utils/websocketManager';

// ============== TYPES ==============
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    tokens?: number;
    latency?: number;
    codeBlocks?: CodeBlock[];
  };
}

export interface CodeBlock {
  language: string;
  code: string;
  startLine?: number;
  endLine?: number;
}

export interface ConversationContext {
  conversationId: string;
  messages: Message[];
  systemPrompt?: string;
  codeContext?: {
    file: string;
    language: string;
    selectedCode?: string;
    fullContent?: string;
  };
}

export interface StreamingCallbacks {
  onToken?: (token: string) => void;
  onComplete?: (message: Message) => void;
  onError?: (error: Error) => void;
  onCodeBlock?: (block: CodeBlock) => void;
}

export interface AssistantConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// ============== AI ASSISTANT ==============
class AIAssistantService {
  private conversations = new Map<string, ConversationContext>();
  private activeStreams = new Map<string, AbortController>();
  private defaultConfig: AssistantConfig = {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: `You are an expert AI coding assistant integrated into an IDE. 
You help developers write, debug, refactor, and understand code.
Always provide clear, concise, and actionable responses.
When providing code, use proper syntax highlighting with language tags.
Consider the context of the current file and project when giving suggestions.`,
  };

  // Create or get conversation
  getConversation(conversationId: string): ConversationContext {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, {
        conversationId,
        messages: [],
      });
    }
    return this.conversations.get(conversationId)!;
  }

  // Set code context for conversation
  setCodeContext(
    conversationId: string,
    file: string,
    language: string,
    selectedCode?: string,
    fullContent?: string
  ): void {
    const conv = this.getConversation(conversationId);
    conv.codeContext = { file, language, selectedCode, fullContent };
  }

  // Send message with streaming response
  async sendMessage(
    conversationId: string,
    content: string,
    callbacks: StreamingCallbacks,
    config?: AssistantConfig
  ): Promise<Message> {
    const conv = this.getConversation(conversationId);
    const mergedConfig = { ...this.defaultConfig, ...config };

    // Add user message
    const userMessage: Message = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    conv.messages.push(userMessage);

    // Prepare context
    const systemPrompt = this.buildSystemPrompt(conv, mergedConfig.systemPrompt);
    const messages = this.prepareMessages(conv.messages, systemPrompt);

    // Create abort controller
    const controller = new AbortController();
    const streamId = this.generateId();
    this.activeStreams.set(streamId, controller);

    try {
      const response = await this.streamChat(messages, mergedConfig, callbacks, controller.signal);
      
      // Add assistant message
      const assistantMessage: Message = {
        id: this.generateId(),
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        metadata: {
          model: mergedConfig.model,
          tokens: response.tokens,
          latency: response.latency,
          codeBlocks: this.extractCodeBlocks(response.content),
        },
      };
      conv.messages.push(assistantMessage);
      callbacks.onComplete?.(assistantMessage);

      return assistantMessage;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        callbacks.onError?.(error);
      }
      throw error;
    } finally {
      this.activeStreams.delete(streamId);
    }
  }

  // Quick actions
  async explainCode(code: string, language: string, callbacks: StreamingCallbacks): Promise<Message> {
    const conversationId = `explain-${Date.now()}`;
    this.setCodeContext(conversationId, 'selection', language, code);
    return this.sendMessage(
      conversationId,
      `Explain this ${language} code in detail:\n\`\`\`${language}\n${code}\n\`\`\``,
      callbacks
    );
  }

  async refactorCode(code: string, language: string, instruction: string, callbacks: StreamingCallbacks): Promise<Message> {
    const conversationId = `refactor-${Date.now()}`;
    this.setCodeContext(conversationId, 'selection', language, code);
    return this.sendMessage(
      conversationId,
      `Refactor this ${language} code. ${instruction}\n\`\`\`${language}\n${code}\n\`\`\``,
      callbacks
    );
  }

  async generateTests(code: string, language: string, framework: string, callbacks: StreamingCallbacks): Promise<Message> {
    const conversationId = `tests-${Date.now()}`;
    this.setCodeContext(conversationId, 'selection', language, code);
    return this.sendMessage(
      conversationId,
      `Generate comprehensive ${framework} tests for this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``,
      callbacks
    );
  }

  async fixBug(code: string, language: string, error: string, callbacks: StreamingCallbacks): Promise<Message> {
    const conversationId = `fix-${Date.now()}`;
    this.setCodeContext(conversationId, 'selection', language, code);
    return this.sendMessage(
      conversationId,
      `Fix this bug in the ${language} code.\n\nError: ${error}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``,
      callbacks
    );
  }

  async optimizeCode(code: string, language: string, callbacks: StreamingCallbacks): Promise<Message> {
    const conversationId = `optimize-${Date.now()}`;
    this.setCodeContext(conversationId, 'selection', language, code);
    return this.sendMessage(
      conversationId,
      `Optimize this ${language} code for better performance:\n\`\`\`${language}\n${code}\n\`\`\``,
      callbacks
    );
  }

  async documentCode(code: string, language: string, callbacks: StreamingCallbacks): Promise<Message> {
    const conversationId = `document-${Date.now()}`;
    this.setCodeContext(conversationId, 'selection', language, code);
    return this.sendMessage(
      conversationId,
      `Add comprehensive documentation and comments to this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``,
      callbacks
    );
  }

  // Cancel active stream
  cancelStream(streamId: string): void {
    const controller = this.activeStreams.get(streamId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(streamId);
    }
  }

  // Cancel all streams
  cancelAllStreams(): void {
    for (const controller of this.activeStreams.values()) {
      controller.abort();
    }
    this.activeStreams.clear();
  }

  // Clear conversation
  clearConversation(conversationId: string): void {
    this.conversations.delete(conversationId);
  }

  // Get conversation history
  getHistory(conversationId: string): Message[] {
    return this.getConversation(conversationId).messages;
  }

  private async streamChat(
    messages: Array<{ role: string; content: string }>,
    config: AssistantConfig,
    callbacks: StreamingCallbacks,
    signal: AbortSignal
  ): Promise<{ content: string; tokens: number; latency: number }> {
    const startTime = Date.now();
    let fullContent = '';
    let tokens = 0;

    // Try WebSocket streaming first
    if (chatWebSocket.isConnected) {
      return this.streamViaWebSocket(messages, config, callbacks, signal);
    }

    // Fallback to SSE/fetch streaming
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/llm/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content || '';
          if (token) {
            fullContent += token;
            tokens++;
            callbacks.onToken?.(token);

            // Check for code blocks
            const blocks = this.extractCodeBlocks(fullContent);
            if (blocks.length > 0) {
              callbacks.onCodeBlock?.(blocks[blocks.length - 1]);
            }
          }
        } catch {
          // Skip malformed chunks
        }
      }
    }

    return {
      content: fullContent,
      tokens,
      latency: Date.now() - startTime,
    };
  }

  private async streamViaWebSocket(
    messages: Array<{ role: string; content: string }>,
    config: AssistantConfig,
    callbacks: StreamingCallbacks,
    signal: AbortSignal
  ): Promise<{ content: string; tokens: number; latency: number }> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let fullContent = '';
      let tokens = 0;
      const requestId = this.generateId();

      const handleAbort = () => {
        chatWebSocket.send('chat:cancel', { requestId });
        reject(new DOMException('Aborted', 'AbortError'));
      };

      signal.addEventListener('abort', handleAbort);

      const unsubToken = chatWebSocket.on(`chat:${requestId}:token`, (data) => {
        const token = (data as { token: string }).token;
        fullContent += token;
        tokens++;
        callbacks.onToken?.(token);
      });

      const unsubComplete = chatWebSocket.on(`chat:${requestId}:complete`, () => {
        cleanup();
        resolve({ content: fullContent, tokens, latency: Date.now() - startTime });
      });

      const unsubError = chatWebSocket.on(`chat:${requestId}:error`, (data) => {
        cleanup();
        reject(new Error((data as { message: string }).message));
      });

      const cleanup = () => {
        signal.removeEventListener('abort', handleAbort);
        unsubToken();
        unsubComplete();
        unsubError();
      };

      chatWebSocket.send('chat:stream', {
        requestId,
        messages,
        ...config,
      }).catch(error => {
        cleanup();
        reject(error);
      });
    });
  }

  private buildSystemPrompt(conv: ConversationContext, basePrompt?: string): string {
    let prompt = basePrompt || this.defaultConfig.systemPrompt || '';

    if (conv.codeContext) {
      const { file, language, selectedCode } = conv.codeContext;
      prompt += `\n\nCurrent context:
- File: ${file}
- Language: ${language}`;

      if (selectedCode) {
        prompt += `\n- Selected code:\n\`\`\`${language}\n${selectedCode}\n\`\`\``;
      }
    }

    return prompt;
  }

  private prepareMessages(
    messages: Message[],
    systemPrompt: string
  ): Array<{ role: string; content: string }> {
    const prepared: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (last 20 messages)
    const recentMessages = messages.slice(-20);
    for (const msg of recentMessages) {
      prepared.push({ role: msg.role, content: msg.content });
    }

    return prepared;
  }

  private extractCodeBlocks(content: string): CodeBlock[] {
    const blocks: CodeBlock[] = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim(),
      });
    }

    return blocks;
  }

  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============== SINGLETON ==============
export const aiAssistantService = new AIAssistantService();

// ============== REACT HOOKS ==============
import { useState, useCallback, useRef } from 'react';

export function useAIAssistant(conversationId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const convIdRef = useRef(conversationId || `conv-${Date.now()}`);

  const sendMessage = useCallback(async (content: string) => {
    setIsStreaming(true);
    setStreamingContent('');
    setError(null);

    try {
      const message = await aiAssistantService.sendMessage(
        convIdRef.current,
        content,
        {
          onToken: (token) => {
            setStreamingContent(prev => prev + token);
          },
          onComplete: (msg) => {
            setMessages(prev => [...prev, msg]);
            setStreamingContent('');
          },
          onError: setError,
        }
      );

      // Add user message
      setMessages(prev => [
        ...prev.filter(m => m.role !== 'user' || m.content !== content),
        { id: `user-${Date.now()}`, role: 'user', content, timestamp: Date.now() },
        message,
      ]);

      return message;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      throw err;
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    aiAssistantService.clearConversation(convIdRef.current);
    setMessages([]);
    setStreamingContent('');
    setError(null);
  }, []);

  return {
    messages,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    clearChat,
    setCodeContext: (file: string, language: string, selectedCode?: string) => {
      aiAssistantService.setCodeContext(convIdRef.current, file, language, selectedCode);
    },
  };
}

export function useCodeActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');

  const executeAction = useCallback(async (
    action: 'explain' | 'refactor' | 'tests' | 'fix' | 'optimize' | 'document',
    code: string,
    language: string,
    extra?: string
  ) => {
    setIsProcessing(true);
    setResult('');

    const callbacks: StreamingCallbacks = {
      onToken: (token) => setResult(prev => prev + token),
      onError: (err) => setResult(`Error: ${err.message}`),
    };

    try {
      switch (action) {
        case 'explain':
          await aiAssistantService.explainCode(code, language, callbacks);
          break;
        case 'refactor':
          await aiAssistantService.refactorCode(code, language, extra || '', callbacks);
          break;
        case 'tests':
          await aiAssistantService.generateTests(code, language, extra || 'jest', callbacks);
          break;
        case 'fix':
          await aiAssistantService.fixBug(code, language, extra || '', callbacks);
          break;
        case 'optimize':
          await aiAssistantService.optimizeCode(code, language, callbacks);
          break;
        case 'document':
          await aiAssistantService.documentCode(code, language, callbacks);
          break;
      }
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { isProcessing, result, executeAction };
}

export default aiAssistantService;
