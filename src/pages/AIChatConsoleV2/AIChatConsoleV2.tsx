import React, { useState, useRef, useEffect } from 'react';
import styles from './AIChatConsoleV2.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChatConsoleV2: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const queryText = input.trim();
    setInput('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `I understand you're asking about: "${queryText}". This is a modern AI chat interface with a floating input design. The interface features smooth animations, glassmorphism effects, and a clean, minimal aesthetic that's different from traditional chat UIs.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (messages.length === 0) return;
    if (confirm('Clear all messages?')) {
      setMessages([]);
    }
  };

  const quickPrompts = [
    "Explain quantum computing",
    "Write a creative story",
    "Help me solve a problem",
    "What's the weather like?"
  ];

  return (
    <div className={styles.container}>
      {/* Animated Background */}
      <div className={styles.background}>
        <div className={styles.gradientOrb1}></div>
        <div className={styles.gradientOrb2}></div>
        <div className={styles.gradientOrb3}></div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Minimal Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2L6 7L14 12L22 7L14 2Z" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 21L14 26L22 21" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 14L14 19L22 14" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className={styles.title}>AI Chat</h1>
            {messages.length > 0 && (
              <button className={styles.clearBtn} onClick={handleClear} aria-label="Clear chat">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 4.5L13.5 13.5M4.5 13.5L13.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className={styles.messagesArea}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="36" stroke="url(#emptyGradient)" strokeWidth="2" strokeDasharray="8 8" opacity="0.4"/>
                  <path d="M40 24V40L52 52" stroke="url(#emptyGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2 className={styles.emptyTitle}>Start a conversation</h2>
              <p className={styles.emptySubtitle}>Ask anything and get intelligent responses</p>
              <div className={styles.quickPrompts}>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    className={styles.promptChip}
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.messages}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles[message.role]}`}
                >
                  <div className={styles.messageCard}>
                    <div className={styles.messageHeader}>
                      <div className={styles.messageAvatar}>
                        {message.role === 'user' ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="7" r="4" fill="currentColor"/>
                            <path d="M3 18C3 14 6 12 10 12C14 12 17 14 17 18" fill="currentColor"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="3" y="3" width="14" height="14" rx="3" fill="currentColor"/>
                            <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={styles.messageTime}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={styles.messageText}>{message.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.messageCard}>
                    <div className={styles.messageHeader}>
                      <div className={styles.messageAvatar}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <rect x="3" y="3" width="14" height="14" rx="3" fill="currentColor"/>
                          <path d="M7 10L9 12L13 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input Container */}
        <div 
          ref={inputContainerRef}
          className={`${styles.inputContainer} ${isInputFocused ? styles.focused : ''}`}
        >
          <div className={styles.inputWrapper}>
            <div className={styles.inputInner}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Type your message..."
                className={styles.textInput}
                disabled={isLoading}
                rows={1}
              />
              <button
                className={`${styles.sendButton} ${input.trim() ? styles.active : ''}`}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path 
                      d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className={styles.inputHint}>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatConsoleV2;
