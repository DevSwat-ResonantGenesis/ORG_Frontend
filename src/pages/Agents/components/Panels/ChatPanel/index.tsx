import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { useAgentStore } from '../../../../../stores';
import { Icons } from '../../shared/Icons';
import * as chatApi from '../../../../../api/chat';
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
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<chatApi.Chat[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Fetch chat list on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Load chat history when chat is selected
  useEffect(() => {
    if (currentChatId) {
      loadChatHistory(currentChatId);
    }
  }, [currentChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const chatList = await chatApi.listChats(50);
      setChats(chatList);
    } catch (err: any) {
      console.error('Failed to fetch chats:', err);
    }
  };

  const loadChatHistory = async (chatId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const history = await chatApi.getChatHistory(chatId);
      const formattedMessages: Message[] = history.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        agentId: selectedAgent?.id,
        tokens: undefined,
      }));
      setMessages(formattedMessages);
    } catch (err: any) {
      console.error('Failed to load chat history:', err);
      setError(err.message || 'Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await chatApi.createChat({
        title: 'New Chat',
        agent_hash: selectedAgent?.id,
      });
      setCurrentChatId(response.chatId);
      setMessages([]);
      await fetchChats();
    } catch (err: any) {
      console.error('Failed to create chat:', err);
      setError(err.message || 'Failed to create chat');
    }
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

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
      // Create chat if none exists
      let chatId = currentChatId;
      if (!chatId) {
        const newChat = await chatApi.createChat({
          title: messageContent.substring(0, 50),
          agent_hash: selectedAgent?.id,
        });
        chatId = newChat.chatId;
        setCurrentChatId(chatId);
        await fetchChats();
      }

      // Send message to backend
      const response = await chatApi.sendMessage({
        message: messageContent,
        chat_id: chatId,
        agent_hash: selectedAgent?.id,
      });

      // Add assistant response to messages
      const assistantMessage: Message = {
        id: response.message.id,
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date(response.message.timestamp),
        agentId: selectedAgent?.id,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, selectedAgent, currentChatId, fetchChats]);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentChatId(null);
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
