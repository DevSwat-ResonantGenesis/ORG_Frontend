import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as agentEngineApi from '../../../../../api/agentEngine';
import styles from './ChatPanel.module.css';

// ============== CHAT PANEL ==============
// Contract: reads [agent, execution], writes [execution]
// Forbidden: [economy]

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string;
  tokens?: number;
}

interface ChatPanelProps {
  className?: string;
}

const ChatPanelComponent: React.FC<ChatPanelProps> = ({ className }) => {
  const agents = useAgentStore(state => state.agents);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    if (!selectedAgent?.id) {
      setError('Select an agent first');
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const contextMessages = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const session = await agentEngineApi.startSession(
        selectedAgent.id,
        `Respond conversationally to the user's message.\n\nUSER MESSAGE:\n${messageContent}`,
        {
          chat_history: contextMessages,
        },
      );

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const data = await agentEngineApi.getSession(session.id);
          if (data.status === 'completed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            const assistantMessage: Message = {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content: data.final_output || 'Completed.',
              timestamp: new Date(),
              agentId: selectedAgent?.id,
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
          } else if (data.status === 'failed') {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            setError(data.error_message || 'Agent execution failed');
            setIsLoading(false);
          }
        } catch (e) {
          // Ignore polling errors
        }
      }, 1500);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      setIsLoading(false);
    } finally {
      // Polling interval manages loading state
    }
  }, [input, isLoading, selectedAgent, messages]);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setMessages([]);
    setError(null);
  };

  return (
    <div className={`${styles.panel} ${className || ''}`}>
      <div className={styles.panelHeader}>
        <h2><Icons.External /> Agent Chat</h2>
        <div className={styles.agentSelector}>
          <select 
            value={selectedAgentId || ''} 
            onChange={e => setSelectedAgentId(e.target.value)}
          >
            <option value="">Select Agent</option>
            {agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
            {agents.length === 0 && (
              <option value="" disabled>No agents available - create one first</option>
            )}
          </select>
        </div>
        <button className={styles.clearBtn} onClick={clearChat}>
          <Icons.Trash /> Clear
        </button>
      </div>

      <div className={styles.chatContainer}>
        {/* Error Message */}
        {error && (
          <div className={styles.errorBanner}>
            <Icons.XCircle />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.messagesArea}>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <Icons.External />
              <h3>Start a Conversation</h3>
              <p>Select an agent and send a message to begin</p>
              <div className={styles.suggestions}>
                <button onClick={() => setInput('What can you help me with?')}>
                  What can you help me with?
                </button>
                <button onClick={() => setInput('Analyze this data for me')}>
                  Analyze this data for me
                </button>
                <button onClick={() => setInput('Generate a report')}>
                  Generate a report
                </button>
              </div>
            </div>
          )}

          {messages.map(message => (
            <div 
              key={message.id} 
              className={`${styles.message} ${styles[message.role]}`}
            >
              <div className={styles.messageHeader}>
                <span className={styles.messageRole}>
                  {message.role === 'user' ? 'You' : selectedAgent?.name || 'Agent'}
                </span>
                <span className={styles.messageTime}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className={styles.messageContent}>
                {message.content}
              </div>
              {message.tokens && (
                <div className={styles.messageMeta}>
                  <span><Icons.Zap /> {message.tokens} tokens</span>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.messageHeader}>
                <span className={styles.messageRole}>{selectedAgent?.name || 'Agent'}</span>
              </div>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <div className={styles.inputWrapper}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              disabled={isLoading}
            />
            <button 
              className={styles.sendBtn} 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              <Icons.ArrowUp />
            </button>
          </div>
          <div className={styles.inputMeta}>
            <span>{input.length} characters</span>
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChatPanel = memo(ChatPanelComponent);
export default ChatPanel;
