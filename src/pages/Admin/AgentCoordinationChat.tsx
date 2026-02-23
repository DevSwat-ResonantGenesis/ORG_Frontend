import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import styles from './AgentCoordinationChat.module.css';

interface Message {
  timestamp: string;
  agent: string;
  content: string;
}

export default function AgentCoordinationChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/v1/admin/agent-chat/messages', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/agent-chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        setInput('');
        await fetchMessages();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Agent Coordination Chat</h1>
        <button onClick={fetchMessages} className={styles.refreshBtn}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <div key={idx} className={styles.message}>
            <div className={styles.messageHeader}>
              <span className={styles.agent}>{msg.agent}</span>
              <span className={styles.timestamp}>{msg.timestamp}</span>
            </div>
            <div className={styles.messageContent}>{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Send message to all agents..."
          className={styles.input}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className={styles.sendBtn}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
